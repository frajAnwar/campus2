"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { awardXP } from "@/lib/xp";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { CompetitionType, CompetitionStatus, JudgingType } from "@prisma/client";

const competitionSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10),
  rules: z.string().optional(),
  type: z.nativeEnum(CompetitionType),
  universityId: z.string().optional(),
  bannerUrl: z.string().optional(),
  prizeDescription: z.string().optional(),
  maxTeamSize: z.number().int().min(1).default(1),
  judgingType: z.nativeEnum(JudgingType).default("MANUAL"),
  registrationOpensAt: z.string().optional(),
  submissionsOpensAt: z.string().optional(),
  submissionsClosesAt: z.string().optional(),
});

export async function createCompetition(input: z.infer<typeof competitionSchema>) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  if (
    !["EDUCATOR", "UNIVERSITY_ADMIN", "PLATFORM_ADMIN", "CLUB_MANAGER"].includes(
      session.user.role ?? ""
    )
  ) {
    return { success: false, error: "Not authorized to create competitions" };
  }

  const parsed = competitionSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.message };

  const competition = await prisma.competition.create({
    data: {
      ...parsed.data,
      organizerId: session.user.id,
      organizerType: session.user.role ?? "STUDENT",
      registrationOpensAt: parsed.data.registrationOpensAt
        ? new Date(parsed.data.registrationOpensAt)
        : undefined,
      submissionsOpensAt: parsed.data.submissionsOpensAt
        ? new Date(parsed.data.submissionsOpensAt)
        : undefined,
      submissionsClosesAt: parsed.data.submissionsClosesAt
        ? new Date(parsed.data.submissionsClosesAt)
        : undefined,
    },
  });

  revalidatePath("/competitions");
  return { success: true, data: competition };
}

export async function registerForCompetition(competitionId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const competition = await prisma.competition.findUnique({
    where: { id: competitionId },
  });
  if (!competition) return { success: false, error: "Competition not found" };

  if (competition.status !== "REGISTRATION_OPEN") {
    return { success: false, error: "Registration is not open" };
  }

  if (
    competition.registrationOpensAt &&
    new Date() < competition.registrationOpensAt
  ) {
    return { success: false, error: "Registration has not opened yet" };
  }

  const existing = await prisma.competitionRegistration.findUnique({
    where: { competitionId_userId: { competitionId, userId: session.user.id } },
  });
  if (existing) return { success: false, error: "Already registered" };

  const registration = await prisma.competitionRegistration.create({
    data: { competitionId, userId: session.user.id },
  });

  revalidatePath(`/competitions/${competitionId}`);
  return { success: true, data: registration };
}

const submissionSchema = z.object({
  content: z.any(),
  githubUrl: z.string().optional(),
  demoUrl: z.string().optional(),
  teamId: z.string().optional(),
});

export async function submitToCompetition(competitionId: string, input: z.infer<typeof submissionSchema>) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const parsed = submissionSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.message };

  const competition = await prisma.competition.findUnique({
    where: { id: competitionId },
  });
  if (!competition) return { success: false, error: "Competition not found" };

  if (competition.status !== "ACTIVE") {
    return { success: false, error: "Competition is not accepting submissions" };
  }

  if (
    competition.submissionsOpensAt &&
    new Date() < competition.submissionsOpensAt
  ) {
    return { success: false, error: "Submissions have not opened yet" };
  }

  if (
    competition.submissionsClosesAt &&
    new Date() > competition.submissionsClosesAt
  ) {
    return { success: false, error: "Submissions are closed" };
  }

  const registration = await prisma.competitionRegistration.findUnique({
    where: { competitionId_userId: { competitionId, userId: session.user.id } },
  });
  if (!registration) return { success: false, error: "Not registered for this competition" };

  const existingSubmission = await prisma.competitionSubmission.findFirst({
    where: {
      competitionId,
      OR: [{ userId: session.user.id }, { teamId: parsed.data.teamId }],
    },
  });
  if (existingSubmission) return { success: false, error: "Already submitted" };

  const submission = await prisma.competitionSubmission.create({
    data: {
      competitionId,
      userId: parsed.data.teamId ? null : session.user.id,
      teamId: parsed.data.teamId,
      content: parsed.data.content,
      githubUrl: parsed.data.githubUrl,
      demoUrl: parsed.data.demoUrl,
    },
  });

  await awardXP(session.user.id, "COMPETITION_PARTICIPATION");
  revalidatePath(`/competitions/${competitionId}`);
  return { success: true, data: submission };
}

export async function scoreSubmission(
  submissionId: string,
  criterionId: string,
  score: number,
  notes?: string
) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  if (!["EDUCATOR", "UNIVERSITY_ADMIN", "PLATFORM_ADMIN"].includes(session.user.role ?? "")) {
    return { success: false, error: "Only judges can score submissions" };
  }

  const submission = await prisma.competitionSubmission.findUnique({
    where: { id: submissionId },
    include: { competition: true },
  });
  if (!submission) return { success: false, error: "Submission not found" };

  const criterion = await prisma.competitionRubric.findUnique({
    where: { id: criterionId },
  });
  if (!criterion) return { success: false, error: "Criterion not found" };

  if (score < 0 || score > criterion.maxScore) {
    return { success: false, error: `Score must be between 0 and ${criterion.maxScore}` };
  }

  const judgeScore = await prisma.competitionJudgeScore.upsert({
    where: {
      submissionId_judgeId_criterionId: {
        submissionId,
        judgeId: session.user.id,
        criterionId,
      },
    },
    create: {
      submissionId,
      judgeId: session.user.id,
      criterionId,
      score,
      notes,
    },
    update: { score, notes },
  });

  const allScores = await prisma.competitionJudgeScore.findMany({
    where: { submissionId },
    include: { criterion: true },
  });

  let weightedSum = 0;
  let weightTotal = 0;
  for (const s of allScores) {
    weightedSum += s.score * s.criterion.weight;
    weightTotal += s.criterion.weight;
  }
  const finalScore = weightTotal > 0 ? weightedSum / weightTotal : 0;

  await prisma.competitionSubmission.update({
    where: { id: submissionId },
    data: { finalScore },
  });

  revalidatePath(`/competitions/${submission.competitionId}`);
  return { success: true, data: judgeScore };
}

export async function voteOnSubmission(submissionId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const submission = await prisma.competitionSubmission.findUnique({
    where: { id: submissionId },
    include: { competition: true },
  });
  if (!submission) return { success: false, error: "Submission not found" };

  if (submission.competition.judgingType !== "COMMUNITY_VOTE") {
    return { success: false, error: "This competition does not allow community voting" };
  }

  const existing = await prisma.competitionVote.findUnique({
    where: { submissionId_voterId: { submissionId, voterId: session.user.id } },
  });
  if (existing) return { success: false, error: "Already voted" };

  await prisma.competitionVote.create({
    data: { submissionId, voterId: session.user.id },
  });

  revalidatePath(`/competitions/${submission.competitionId}`);
  return { success: true };
}
