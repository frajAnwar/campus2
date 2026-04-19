"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { Visibility } from "@prisma/client";

const updateProfileSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  bio: z.string().max(500).optional(),
  tagline: z.string().max(100).optional(),
  image: z.string().optional(),
  banner: z.string().optional(),
  githubUsername: z.string().optional(),
  linkedinUrl: z.string().optional(),
  websiteUrl: z.string().optional(),
  twitterUrl: z.string().optional(),
  accentColor: z.string().optional(),
  isOpenToCollab: z.boolean().optional(),
  openToCollabNote: z.string().max(200).optional(),
  fieldOfStudy: z.string().optional(),
  academicYear: z.number().int().optional(),
  graduationYear: z.number().int().optional(),
  currentRole: z.string().optional(),
  currentCompany: z.string().optional(),
});

const updateSettingsSchema = z.object({
  theme: z.enum(["dark", "light", "system"]).optional(),
  language: z.string().optional(),
  safeMode: z.boolean().optional(),
  profileVisibility: z.nativeEnum(Visibility).optional(),
  allowDMs: z.enum(["EVERYONE", "FOLLOWERS", "NONE"]).optional(),
  showOnlineStatus: z.boolean().optional(),
  indexedBySearch: z.boolean().optional(),
});

export async function updateProfile(input: z.infer<typeof updateProfileSchema>) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const parsed = updateProfileSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.message };

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: parsed.data,
    select: {
      id: true,
      name: true,
      username: true,
      image: true,
      bio: true,
      tagline: true,
    },
  });

  revalidatePath(`/profile/${user.username}`);
  return { success: true, data: user };
}

export async function updateSettings(input: z.infer<typeof updateSettingsSchema>) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const parsed = updateSettingsSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.message };

  await prisma.user.update({
    where: { id: session.user.id },
    data: parsed.data,
  });

  revalidatePath("/settings");
  return { success: true };
}

export async function deleteAccount() {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  await prisma.user.delete({ where: { id: session.user.id } });
  revalidatePath("/");
  return { success: true };
}

export async function getUserActivity(userId: string) {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const [posts, comments, submissions] = await Promise.all([
    prisma.post.findMany({
      where: { authorId: userId, createdAt: { gte: oneYearAgo } },
      select: { createdAt: true },
    }),
    prisma.comment.findMany({
      where: { authorId: userId, createdAt: { gte: oneYearAgo } },
      select: { createdAt: true },
    }),
    prisma.submission.findMany({
      where: { studentId: userId, submittedAt: { gte: oneYearAgo } },
      select: { submittedAt: true },
    }),
  ]);

  const activityMap: Record<string, number> = {};

  const processDates = (items: any[], dateField: string) => {
    items.forEach((item) => {
      const date = new Date(item[dateField]).toISOString().split("T")[0];
      activityMap[date] = (activityMap[date] || 0) + 1;
    });
  };

  processDates(posts, "createdAt");
  processDates(comments, "createdAt");
  processDates(submissions, "submittedAt");

  const results = Object.entries(activityMap).map(([date, count]) => ({
    date,
    count,
  }));

  return { success: true, data: results };
}

export async function getOnlineUsers() {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  const users = await prisma.user.findMany({
    where: { lastActiveDate: { gte: fiveMinutesAgo } },
    select: { id: true, name: true, username: true, image: true },
    take: 10,
    orderBy: { lastActiveDate: "desc" },
  });
  return { success: true, data: users };
}
