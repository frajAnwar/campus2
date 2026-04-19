"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { awardXP } from "@/lib/xp";
import { createNotification, createNotificationForMany } from "@/lib/push";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const submitSchema = z.object({
  assignmentId: z.string(),
  content: z.string().optional(),
  githubUrl: z.string().url().optional(),
  fileUrl: z.string().optional(),
});

const createAssignmentSchema = z.object({
  classId: z.string(),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  dueDate: z.string().optional(),
  maxPoints: z.number().default(100),
  allowLate: z.boolean().default(true),
  allowResubmit: z.boolean().default(false),
  submissionType: z.string().default("TEXT"),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("PUBLISHED"),
});

export async function createAssignment(input: z.infer<typeof createAssignmentSchema>) {
  const session = await auth();
  if (!session?.user?.id)
    return { success: false, error: "Not authenticated" };

  const parsed = createAssignmentSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.message };

  const classData = await prisma.class.findUnique({
    where: { id: parsed.data.classId },
  });
  if (!classData) return { success: false, error: "Class not found" };
  if (classData.educatorId !== session.user.id)
    return { success: false, error: "Only the class educator can create assignments" };

  const assignment = await prisma.assignment.create({
    data: {
      classId: parsed.data.classId,
      title: parsed.data.title,
      description: parsed.data.description,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      maxPoints: parsed.data.maxPoints,
      allowLate: parsed.data.allowLate,
      allowResubmit: parsed.data.allowResubmit,
      submissionType: parsed.data.submissionType,
      status: parsed.data.status,
    },
  });

  if (parsed.data.status === "PUBLISHED") {
    const members = await prisma.classMember.findMany({
      where: { classId: parsed.data.classId },
      select: { userId: true },
    });

    await createNotificationForMany(
      members.map((m) => m.userId),
      "NEW_ASSIGNMENT",
      "New Assignment",
      `"${parsed.data.title}" has been posted in ${classData.name}`,
      `/classes/${parsed.data.classId}/assignments/${assignment.id}`
    );
  }

  revalidatePath(`/classes/${parsed.data.classId}`);
  revalidatePath(`/educator/classes/${parsed.data.classId}`);
  revalidatePath("/educator/assignments");
  return { success: true, data: assignment };
}

export async function updateAssignment(
  assignmentId: string,
  input: {
    title?: string;
    description?: string;
    dueDate?: string;
    maxPoints?: number;
    allowLate?: boolean;
    allowResubmit?: boolean;
    submissionType?: string;
    status?: "DRAFT" | "PUBLISHED" | "CLOSED";
  }
) {
  const session = await auth();
  if (!session?.user?.id)
    return { success: false, error: "Not authenticated" };

  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: { class: true },
  });
  if (!assignment) return { success: false, error: "Assignment not found" };
  if (assignment.class.educatorId !== session.user.id)
    return { success: false, error: "Not authorized" };

  const updated = await prisma.assignment.update({
    where: { id: assignmentId },
    data: {
      ...input,
      dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
    },
  });

  revalidatePath(`/classes/${assignment.classId}`);
  revalidatePath(`/educator/classes/${assignment.classId}`);
  return { success: true, data: updated };
}

export async function deleteAssignment(assignmentId: string) {
  const session = await auth();
  if (!session?.user?.id)
    return { success: false, error: "Not authenticated" };

  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: { class: true },
  });
  if (!assignment) return { success: false, error: "Assignment not found" };
  if (assignment.class.educatorId !== session.user.id)
    return { success: false, error: "Not authorized" };

  await prisma.assignment.delete({ where: { id: assignmentId } });

  revalidatePath(`/classes/${assignment.classId}`);
  revalidatePath(`/educator/classes/${assignment.classId}`);
  revalidatePath("/educator/assignments");
  return { success: true };
}

export async function submitAssignment(
  input: z.infer<typeof submitSchema>
) {
  const session = await auth();
  if (!session?.user?.id)
    return { success: false, error: "Not authenticated" };

  const parsed = submitSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.message };

  const { assignmentId, ...rest } = parsed.data;

  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: { class: true },
  });
  if (!assignment)
    return { success: false, error: "Assignment not found" };
  if (assignment.status !== "PUBLISHED")
    return { success: false, error: "Assignment is not open" };

  const isMember = await prisma.classMember.findUnique({
    where: {
      classId_userId: {
        classId: assignment.classId,
        userId: session.user.id,
      },
    },
  });
  if (!isMember)
    return { success: false, error: "Not enrolled in this class" };

  const now = new Date();
  const isLate = assignment.dueDate ? now > assignment.dueDate : false;
  if (isLate && !assignment.allowLate) {
    return {
      success: false,
      error: "Late submissions are not allowed for this assignment",
    };
  }

  const existing = await prisma.submission.findUnique({
    where: {
      assignmentId_studentId: {
        assignmentId,
        studentId: session.user.id,
      },
    },
  });
  if (existing && !assignment.allowResubmit) {
    return {
      success: false,
      error: "Resubmission is not allowed for this assignment",
    };
  }

  const status = isLate ? "LATE" : "SUBMITTED";

  const submission = await prisma.submission.upsert({
    where: {
      assignmentId_studentId: {
        assignmentId,
        studentId: session.user.id,
      },
    },
    create: {
      assignmentId,
      studentId: session.user.id,
      status,
      ...rest,
    },
    update: { status, ...rest, submittedAt: now },
  });

  const xpAction =
    isLate
      ? null
      : assignment.dueDate &&
          now <
            new Date(assignment.dueDate.getTime() - 86400000)
        ? "ASSIGNMENT_SUBMITTED_EARLY"
        : "ASSIGNMENT_SUBMITTED_ON_TIME";

  if (xpAction) await awardXP(session.user.id, xpAction);

  await createNotification(
    assignment.class.educatorId,
    "NEW_ASSIGNMENT",
    "New Submission",
    `A student submitted "${assignment.title}"`,
    `/educator/classes/${assignment.classId}/assignments/${assignmentId}`
  );

  revalidatePath(
    `/classes/${assignment.classId}/assignments/${assignmentId}`
  );
  return { success: true, data: submission };
}

export async function gradeSubmission(
  submissionId: string,
  grade: number,
  feedback: string
) {
  const session = await auth();
  if (!session?.user?.id)
    return { success: false, error: "Not authenticated" };

  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: { assignment: { include: { class: true } } },
  });
  if (!submission)
    return { success: false, error: "Submission not found" };

  if (
    submission.assignment.class.educatorId !== session.user.id
  ) {
    return {
      success: false,
      error: "Not the educator of this class",
    };
  }

  if (grade < 0 || grade > submission.assignment.maxPoints) {
    return {
      success: false,
      error: `Grade must be between 0 and ${submission.assignment.maxPoints}`,
    };
  }

  const updated = await prisma.submission.update({
    where: { id: submissionId },
    data: { grade, feedback, status: "GRADED", gradedAt: new Date() },
  });

  await createNotification(
    submission.studentId,
    "ASSIGNMENT_GRADED",
    "Assignment Graded",
    `Your submission for "${submission.assignment.title}" received ${grade}/${submission.assignment.maxPoints}`,
    `/classes/${submission.assignment.classId}/assignments/${submission.assignmentId}`
  );

  revalidatePath(
    `/classes/${submission.assignment.classId}/assignments/${submission.assignmentId}`
  );
  return { success: true, data: updated };
}
