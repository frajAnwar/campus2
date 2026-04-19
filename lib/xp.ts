import { prisma } from "./prisma";
import { Rank } from "@prisma/client";

export const XP_VALUES = {
  POST_CREATED: 5,
  COMMENT_CREATED: 2,
  VOTE_RECEIVED_POST: 3,
  VOTE_RECEIVED_COMMENT: 1,
  ANSWER_ACCEPTED: 15,
  ASSIGNMENT_SUBMITTED_EARLY: 15,
  ASSIGNMENT_SUBMITTED_ON_TIME: 10,
  CLASS_COMPLETED: 50,
  PROJECT_PUBLISHED: 20,
  PROJECT_STARRED: 5,
  CLUB_JOINED: 5,
  EVENT_ATTENDED: 10,
  EVENT_HOSTED: 25,
  REFERRAL: 10,
  STREAK_7_DAYS: 20,
  STREAK_30_DAYS: 100,
  STREAK_100_DAYS: 500,
  FIRST_POST_OF_WEEK: 5,
  DAILY_LOGIN: 1,
  COMPETITION_1ST: 200,
  COMPETITION_2ND: 100,
  COMPETITION_3RD: 50,
  COMPETITION_PARTICIPATION: 20,
  PROJECT_REVIEWED: 10,
  STUDY_SESSION_COMPLETED: 15,
} as const;

export const RANK_THRESHOLDS: Record<Rank, number> = {
  LURKER: 0,
  FRESHMAN: 100,
  SCHOLAR: 500,
  CONTRIBUTOR: 1500,
  COLLABORATOR: 4000,
  MENTOR: 10000,
  PIONEER: 25000,
  LEGEND: 60000,
};

export function calculateRank(xp: number): Rank {
  const ranks = Object.entries(RANK_THRESHOLDS).reverse() as [Rank, number][];
  for (const [rank, threshold] of ranks) {
    if (xp >= threshold) return rank;
  }
  return "LURKER";
}

export async function awardXP(
  userId: string,
  action: keyof typeof XP_VALUES,
  metadata?: Record<string, unknown>
): Promise<{ newXp: number; newRank: Rank; rankedUp: boolean }> {
  const amount = XP_VALUES[action];

  const user = await prisma.user.update({
    where: { id: userId },
    data: { xp: { increment: amount } },
    select: { xp: true, rank: true },
  });

  const newRank = calculateRank(user.xp);
  const rankedUp = newRank !== user.rank;

  if (rankedUp) {
    await prisma.user.update({
      where: { id: userId },
      data: { rank: newRank },
    });
    await prisma.notification.create({
      data: {
        userId,
        type: "RANK_UP",
        title: "You ranked up!",
        body: `You are now a ${newRank}!`,
      },
    });
  }

  await prisma.activityLog.create({
    data: { userId, action, metadata: metadata as import("@prisma/client").Prisma.InputJsonValue, xpAwarded: amount },
  });

  return { newXp: user.xp, newRank, rankedUp };
}

export async function updateStreak(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      currentStreak: true,
      longestStreak: true,
      lastActiveDate: true,
    },
  });
  if (!user) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastActive = user.lastActiveDate
    ? new Date(user.lastActiveDate)
    : null;

  if (lastActive) {
    lastActive.setHours(0, 0, 0, 0);
    const diffDays = Math.floor(
      (today.getTime() - lastActive.getTime()) / 86400000
    );
    if (diffDays === 0) return;
    if (diffDays === 1) {
      const newStreak = user.currentStreak + 1;
      await prisma.user.update({
        where: { id: userId },
        data: {
          currentStreak: newStreak,
          longestStreak: Math.max(newStreak, user.longestStreak),
          lastActiveDate: today,
        },
      });
      if ([7, 30, 100].includes(newStreak)) {
        const key = `STREAK_${newStreak}_DAYS` as keyof typeof XP_VALUES;
        await awardXP(userId, key);
      }
    } else {
      await prisma.user.update({
        where: { id: userId },
        data: { currentStreak: 1, lastActiveDate: today },
      });
    }
  } else {
    await prisma.user.update({
      where: { id: userId },
      data: { currentStreak: 1, lastActiveDate: today },
    });
  }
}
