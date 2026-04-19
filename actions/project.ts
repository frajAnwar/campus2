"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { awardXP } from "@/lib/xp";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { Visibility, ProjectStatus } from "@prisma/client";

const projectSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(5000),
  githubRepo: z.string().optional(),
  demoUrl: z.string().optional(),
  techTags: z.array(z.string()).max(10),
  visibility: z.nativeEnum(Visibility).default("PUBLIC"),
  status: z.nativeEnum(ProjectStatus).default("IN_PROGRESS"),
});

const updateProjectSchema = projectSchema.partial();

export async function createProject(input: z.infer<typeof projectSchema>) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const parsed = projectSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.message };

  const project = await prisma.project.create({
    data: {
      ...parsed.data,
      ownerId: session.user.id,
    },
  });

  await awardXP(session.user.id, "PROJECT_PUBLISHED");
  revalidatePath("/projects");
  return { success: true, data: project };
}

export async function updateProject(projectId: string, input: z.infer<typeof updateProjectSchema>) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const parsed = updateProjectSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.message };

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return { success: false, error: "Project not found" };

  if (project.ownerId !== session.user.id) {
    return { success: false, error: "Not authorized" };
  }

  const updated = await prisma.project.update({
    where: { id: projectId },
    data: parsed.data,
  });

  revalidatePath(`/projects/${projectId}`);
  return { success: true, data: updated };
}

export async function deleteProject(projectId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return { success: false, error: "Project not found" };

  const canDelete =
    project.ownerId === session.user.id ||
    ["PLATFORM_ADMIN", "UNIVERSITY_ADMIN"].includes(session.user.role ?? "");

  if (!canDelete) return { success: false, error: "Not authorized" };

  await prisma.project.delete({ where: { id: projectId } });
  revalidatePath("/projects");
  return { success: true };
}

export async function starProject(projectId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return { success: false, error: "Project not found" };

  const existing = await prisma.projectStar.findUnique({
    where: { projectId_userId: { projectId, userId: session.user.id } },
  });
  if (existing) return { success: false, error: "Already starred" };

  await prisma.projectStar.create({
    data: { projectId, userId: session.user.id },
  });

  await awardXP(project.ownerId, "PROJECT_STARRED");
  revalidatePath(`/projects/${projectId}`);
  return { success: true };
}

export async function unstarProject(projectId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  await prisma.projectStar.deleteMany({
    where: { projectId, userId: session.user.id },
  });

  revalidatePath(`/projects/${projectId}`);
  return { success: true };
}

export async function getUserProjects(userId?: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const targetUserId = userId ?? session.user.id;

  const projects = await prisma.project.findMany({
    where: {
      ownerId: targetUserId,
      ...(targetUserId !== session.user.id ? { visibility: "PUBLIC" } : {}),
    },
    include: {
      owner: {
        select: { id: true, name: true, username: true, image: true, rank: true },
      },
      _count: { select: { stars: true, comments: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return { success: true, data: projects };
}

export async function getPublicProjects(options?: { cursor?: string; limit?: number; search?: string }) {
  const { cursor, limit = 20, search } = options ?? {};

  const where: any = { visibility: "PUBLIC" };
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const projects = await prisma.project.findMany({
    where,
    take: limit + 1,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      owner: {
        select: { id: true, name: true, username: true, image: true, rank: true },
      },
      _count: { select: { stars: true, comments: true } },
    },
  });

  let nextCursor: string | undefined;
  if (projects.length > limit) {
    const nextItem = projects.pop();
    nextCursor = nextItem!.id;
  }

  return { success: true, data: { items: projects, nextCursor, hasMore: !!nextCursor } };
}

export async function reviewProject(projectId: string, rating: number, content?: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return { success: false, error: "Project not found" };
  if (project.ownerId === session.user.id)
    return { success: false, error: "You cannot review your own project" };

  await prisma.projectReview.upsert({
    where: { projectId_reviewerId: { projectId, reviewerId: session.user.id } },
    update: { rating, content },
    create: { projectId, reviewerId: session.user.id, rating, content },
  });

  // Recalculate average rating
  const reviews = await prisma.projectReview.findMany({
    where: { projectId },
    select: { rating: true },
  });

  const avgRating = reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length;

  await prisma.project.update({
    where: { id: projectId },
    data: { avgRating },
  });

  await awardXP(session.user.id, "PROJECT_REVIEWED");
  
  await prisma.notification.create({
    data: {
      userId: project.ownerId,
      type: "SYSTEM",
      title: "New Project Review",
      body: `${session.user.name} reviewed your project "${project.title}"`,
      url: `/projects/${projectId}`,
    },
  });

  revalidatePath(`/projects/${projectId}`);
  return { success: true };
}
