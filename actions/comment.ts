"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { awardXP } from "@/lib/xp";
import { createNotification } from "@/lib/push";
import { revalidatePath } from "next/cache";

export async function createComment(
  postId: string,
  body: string,
  parentCommentId?: string
) {
  const session = await auth();
  if (!session?.user?.id)
    return { success: false, error: "Unauthorized" };

  if (body.trim().length < 2)
    return { success: false, error: "Comment too short" };

  const comment = await prisma.comment.create({
    data: {
      postId,
      authorId: session.user.id,
      body,
      parentCommentId,
    },
  });

  await awardXP(session.user.id, "COMMENT_CREATED");

  const post = await prisma.post.findUnique({ where: { id: postId } });
  
  if (parentCommentId) {
    const parentComment = await prisma.comment.findUnique({ where: { id: parentCommentId } });
    if (parentComment && parentComment.authorId !== session.user.id) {
      await createNotification(
        parentComment.authorId,
        "FORUM_REPLY",
        "New Reply to Comment",
        `${session.user.name} replied to your comment`,
        `/forum/${postId}#${comment.id}`
      );
    }
  }

  if (post && post.authorId !== session.user.id && (!parentCommentId || post.authorId !== (await prisma.comment.findUnique({ where: { id: parentCommentId } }))?.authorId)) {
    await createNotification(
      post.authorId,
      "FORUM_REPLY",
      "New Reply",
      `${session.user.name} replied to your post`,
      `/forum/${postId}`
    );
  }

  revalidatePath(`/forum/${postId}`);
  return { success: true, data: comment };
}

export async function voteOnComment(
  commentId: string,
  value: 1 | -1
) {
  const session = await auth();
  if (!session?.user?.id)
    return { success: false, error: "Not authenticated" };

  const existing = await prisma.vote.findUnique({
    where: { userId_commentId: { userId: session.user.id, commentId } },
  });

  if (existing) {
    if (existing.value === value) {
      await prisma.vote.delete({ where: { id: existing.id } });
    } else {
      await prisma.vote.update({
        where: { id: existing.id },
        data: { value },
      });
    }
  } else {
    await prisma.vote.create({
      data: { userId: session.user.id, commentId, value },
    });
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });
    if (comment && value === 1) {
      await awardXP(comment.authorId, "VOTE_RECEIVED_COMMENT");
    }
  }

  return { success: true };
}

