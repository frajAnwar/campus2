"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function followUser(targetUserId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  if (targetUserId === session.user.id) return { success: false, error: "Cannot follow yourself" };

  const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!targetUser) return { success: false, error: "User not found" };

  await prisma.follow.upsert({
    where: {
      followerId_followingId: {
        followerId: session.user.id,
        followingId: targetUserId,
      },
    },
    create: {
      followerId: session.user.id,
      followingId: targetUserId,
    },
    update: {},
  });

  await prisma.notification.create({
    data: {
      userId: targetUserId,
      type: "NEW_FOLLOWER",
      title: "New Follower",
      body: `${session.user.name} started following you`,
      url: `/profile/${session.user.username}`,
    },
  });

  revalidatePath(`/profile/${targetUser.username}`);
  return { success: true };
}

export async function unfollowUser(targetUserId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  await prisma.follow.deleteMany({
    where: {
      followerId: session.user.id,
      followingId: targetUserId,
    },
  });

  const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (targetUser) revalidatePath(`/profile/${targetUser.username}`);
  return { success: true };
}

export async function getFollowers(
  userId: string,
  options?: { cursor?: string; limit?: number }
) {
  const { cursor, limit = 20 } = options ?? {};

  const follows = await prisma.follow.findMany({
    where: { followingId: userId },
    take: limit + 1,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      follower: {
        select: { id: true, name: true, username: true, image: true, rank: true, role: true },
      },
    },
  });

  let nextCursor: string | undefined;
  if (follows.length > limit) {
    const nextItem = follows.pop();
    nextCursor = nextItem!.id;
  }

  return {
    success: true,
    data: {
      items: follows.map((f) => f.follower),
      nextCursor,
      hasMore: !!nextCursor,
    },
  };
}

export async function getFollowing(
  userId: string,
  options?: { cursor?: string; limit?: number }
) {
  const { cursor, limit = 20 } = options ?? {};

  const follows = await prisma.follow.findMany({
    where: { followerId: userId },
    take: limit + 1,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      following: {
        select: { id: true, name: true, username: true, image: true, rank: true, role: true },
      },
    },
  });

  let nextCursor: string | undefined;
  if (follows.length > limit) {
    const nextItem = follows.pop();
    nextCursor = nextItem!.id;
  }

  return {
    success: true,
    data: {
      items: follows.map((f) => f.following),
      nextCursor,
      hasMore: !!nextCursor,
    },
  };
}
