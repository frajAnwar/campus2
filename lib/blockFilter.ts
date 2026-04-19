import { prisma } from "./prisma";

export async function getBlockedUserIds(userId: string): Promise<string[]> {
  const [blocked, blockedBy] = await Promise.all([
    prisma.userBlock.findMany({
      where: { blockerId: userId },
      select: { blockedId: true },
    }),
    prisma.userBlock.findMany({
      where: { blockedId: userId },
      select: { blockerId: true },
    }),
  ]);
  return [
    ...blocked.map((b) => b.blockedId),
    ...blockedBy.map((b) => b.blockerId),
  ];
}

export async function excludeBlockedFilter(
  userId: string,
  authorField = "authorId"
) {
  const blockedIds = await getBlockedUserIds(userId);
  if (blockedIds.length === 0) return {};
  return { [authorField]: { notIn: blockedIds } };
}
