"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { callAI } from "@/lib/anthropic";
import { Prisma } from "@prisma/client";

export async function summarizeThread(postId: string) {
  const session = await auth();
  if (!session?.user?.id)
    return { success: false, error: "Not authenticated" };

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      comments: {
        include: { author: { select: { name: true } } },
        orderBy: { createdAt: "asc" },
        take: 50,
      },
    },
  });
  if (!post) return { success: false, error: "Post not found" };
  if (post.comments.length < 3)
    return {
      success: false,
      error: "Not enough comments to summarize",
    };

  if (post.aiSummary) return { success: true, data: post.aiSummary as any };

  const commentsText = post.comments
    .map((c) => `${c.author.name}: ${c.body}`)
    .join("\n");

  const result = await callAI(
    session.user.id,
    "THREAD_SUMMARY",
    `Thread title: "${post.title}"\nOriginal post: "${post.body}"\nComments:\n${commentsText}\n\nSummarize this thread. Return JSON: { topic: string, key_points: string[], best_answer: string|null, unresolved: string|null }`
  );

  if (!result.ok) return { success: false, error: result.error || "AI failed" };

  await prisma.post.update({
    where: { id: postId },
    data: { aiSummary: result.data as Prisma.InputJsonValue, aiSummaryAt: new Date() },
  });

  return { success: true, data: result.data };
}

export async function explainAssignment(assignmentId: string) {
  const session = await auth();
  if (!session?.user?.id)
    return { success: false, error: "Not authenticated" };

  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: { class: true },
  });
  if (!assignment)
    return { success: false, error: "Assignment not found" };

  const result = await callAI(
    session.user.id,
    "ASSIGNMENT_EXPLAIN",
    `Assignment title: "${assignment.title}"\nDescription: "${assignment.description}"\nDue: ${assignment.dueDate}\nRubric: ${JSON.stringify(assignment.rubric)}\n\nExplain this assignment clearly. Return JSON: { what_to_do: string, requirements: string[], suggested_approach: string[], common_mistakes: string[] }`
  );

  return result;
}

export async function generateReadme(projectId: string) {
  const session = await auth();
  if (!session?.user?.id)
    return { success: false, error: "Not authenticated" };

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });
  if (!project) return { success: false, error: "Project not found" };
  if (project.ownerId !== session.user.id)
    return { success: false, error: "Not your project" };

  const result = await callAI(
    session.user.id,
    "README_GEN",
    `Project: ${project.title}\nDescription: ${project.description}\nTech: ${project.techTags.join(", ")}\nDemo: ${project.demoUrl || "N/A"}\n\nGenerate a GitHub README.md. Return JSON: { readme: string } where readme is the full markdown content.`,
    "You generate professional GitHub README files. Return only JSON with a readme field containing the raw markdown."
  );

  return result;
}

export async function findSimilarPosts(title: string) {
  const session = await auth();
  if (!session?.user?.id)
    return { success: false, error: "Not authenticated" };

  const posts = await prisma.post.findMany({
    where: {
      OR: [
        {
          title: {
            contains: title.split(" ").slice(0, 3).join(" "),
            mode: "insensitive",
          },
        },
      ],
      visibility: "PUBLIC",
    },
    select: {
      id: true,
      title: true,
      _count: { select: { comments: true } },
    },
    take: 5,
    orderBy: { createdAt: "desc" },
  });

  return { success: true, data: posts };
}

export async function summarizeResource(resourceId: string) {
  const session = await auth();
  if (!session?.user?.id)
    return { success: false, error: "Not authenticated" };

  const resource = await prisma.resource.findUnique({
    where: { id: resourceId },
  });
  if (!resource) return { success: false, error: "Resource not found" };

  const result = await callAI(
    session.user.id,
    "RESOURCE_SUMMARY",
    `Resource Title: "${resource.title}"\nDescription: "${resource.description || "N/A"}"\nType: ${resource.type}\n\nSummarize this educational resource. Focus on key learning objectives and main topics. Return JSON: { summary: string, highlights: string[] }`
  );

  return result;
}

export async function gradeSubmission(submissionId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: {
      assignment: true,
      student: { select: { name: true } },
    },
  });

  if (!submission) return { success: false, error: "Submission not found" };

  // Check if user is the educator for this class
  const classData = await prisma.class.findUnique({
    where: { id: submission.assignment.classId },
  });

  if (classData?.educatorId !== session.user.id && !["PLATFORM_ADMIN", "UNIVERSITY_ADMIN"].includes(session.user.role ?? "")) {
    return { success: false, error: "Not authorized" };
  }

  const result = await callAI(
    session.user.id,
    "GRADING_ASSISTANT",
    `Assignment: "${submission.assignment.title}"
    Rubric: ${JSON.stringify(submission.assignment.rubric)}
    Max Points: ${submission.assignment.maxPoints}
    
    Student Submission:
    "${submission.content || "No text content"}"
    Github: ${submission.githubUrl || "N/A"}
    
    Grade this submission based on the rubric. Provide a suggested score and helpful feedback.
    Return JSON: { suggested_grade: number, feedback: string, strengths: string[], weaknesses: string[] }`
  );

  return result;
}
