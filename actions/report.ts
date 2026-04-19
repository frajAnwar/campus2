"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const reportSchema = z.object({
  category: z.enum([
    "HARASSMENT",
    "INAPPROPRIATE",
    "PLAGIARISM",
    "SPAM",
    "MISINFORMATION",
    "OTHER",
  ]),
  note: z.string().max(500).optional(),
  postId: z.string().optional(),
  commentId: z.string().optional(),
  reportedId: z.string().optional(),
});

export async function submitReport(
  input: z.infer<typeof reportSchema>
) {
  const session = await auth();
  if (!session?.user?.id)
    return { success: false, error: "Not authenticated" };

  const parsed = reportSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.message };

  const report = await prisma.report.create({
    data: { reporterId: session.user.id, ...parsed.data },
  });

  const reportCount = await prisma.report.count({
    where: {
      OR: [
        { postId: parsed.data.postId },
        { commentId: parsed.data.commentId },
      ],
      status: "PENDING",
    },
  });

  if (reportCount >= 5 && parsed.data.postId) {
    await prisma.post.update({
      where: { id: parsed.data.postId },
      data: { isLocked: true },
    });
  }

  return { success: true, data: report };
}

export async function blockUser(targetUserId: string) {
  const session = await auth();
  if (!session?.user?.id)
    return { success: false, error: "Not authenticated" };
  if (targetUserId === session.user.id)
    return { success: false, error: "Cannot block yourself" };

  await prisma.userBlock.upsert({
    where: {
      blockerId_blockedId: {
        blockerId: session.user.id,
        blockedId: targetUserId,
      },
    },
    create: {
      blockerId: session.user.id,
      blockedId: targetUserId,
    },
    update: {},
  });

  return { success: true };
}

export async function unblockUser(targetUserId: string) {
  const session = await auth();
  if (!session?.user?.id)
    return { success: false, error: "Not authenticated" };

  await prisma.userBlock.deleteMany({
    where: { blockerId: session.user.id, blockedId: targetUserId },
  });

  return { success: true };
}

export async function muteUser(targetUserId: string) {
  const session = await auth();
  if (!session?.user?.id)
    return { success: false, error: "Not authenticated" };

  await prisma.userMute.upsert({
    where: {
      muterId_mutedId: {
        muterId: session.user.id,
        mutedId: targetUserId,
      },
    },
    create: {
      muterId: session.user.id,
      mutedId: targetUserId,
    },
    update: {},
  });

  return { success: true };
}

export async function resolveReport(
  reportId: string,
  action: "RESOLVED_REMOVED" | "RESOLVED_DISMISSED" | "ESCALATED"
) {
  const session = await auth();
  if (
    ![
      "MODERATOR",
      "UNIVERSITY_ADMIN",
      "PLATFORM_ADMIN",
    ].includes(session?.user?.role ?? "")
  ) {
    return { success: false, error: "Not authorized" };
  }

  const report = await prisma.report.update({
    where: { id: reportId },
    data: {
      status: action,
      resolvedById: session!.user!.id,
      resolvedAt: new Date(),
    },
    include: { post: true, comment: true },
  });

  if (action === "RESOLVED_REMOVED") {
    if (report.postId)
      await prisma.post.delete({ where: { id: report.postId } });
    if (report.commentId)
      await prisma.comment.delete({ where: { id: report.commentId } });
    if (report.reportedId) {
      const strikes = await prisma.strike.count({
        where: { userId: report.reportedId },
      });
      await prisma.strike.create({
        data: {
          userId: report.reportedId,
          issuedById: session!.user!.id,
          reason: report.category,
          expiresAt:
            strikes < 2
              ? new Date(Date.now() + 7 * 86400000)
              : undefined,
        },
      });
    }
  }

  return { success: true };
}
