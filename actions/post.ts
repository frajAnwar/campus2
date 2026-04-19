"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { awardXP } from "@/lib/xp";
import { updateStreak } from "@/lib/xp";
import { createNotification, createNotificationForMany } from "@/lib/push";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const createPostSchema = z.object({
  type: z.enum(["QUESTION", "DISCUSSION", "SHOWCASE", "NOTE_SHARE", "POLL"]),
  title: z.string().min(5).max(200),
  body: z.string().min(10).max(10000),
  visibility: z.enum(["PUBLIC", "UNIVERSITY", "CLASS", "FOLLOWERS"]),
  tags: z.array(z.string()).max(5),
  classId: z.string().optional(),
  contentWarning: z.string().optional(),
  poll: z
    .object({
      question: z.string().min(3),
      options: z.array(z.string().min(1)).min(2).max(6),
      isAnonymous: z.boolean(),
      isMultipleChoice: z.boolean(),
      endsAt: z.string().optional(),
    })
    .optional(),
});

export async function createPost(input: z.infer<typeof createPostSchema>) {
  const session = await auth();
  if (!session?.user?.id)
    return { success: false, error: "Not authenticated" };

  const parsed = createPostSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.message };

  const { poll, ...postData } = parsed.data;

  if (postData.visibility === "CLASS" && !postData.classId) {
    return {
      success: false,
      error: "Class ID required for class-scoped posts",
    };
  }

  if (postData.classId) {
    const member = await prisma.classMember.findUnique({
      where: {
        classId_userId: {
          classId: postData.classId,
          userId: session.user.id,
        },
      },
    });
    const classData = await prisma.class.findUnique({
      where: { id: postData.classId },
      select: { educatorId: true },
    });
    const isEducator = classData?.educatorId === session.user.id;
    if (!member && !isEducator)
      return { success: false, error: "Not a member of this class" };
  }

  const post = await prisma.post.create({
    data: {
      ...postData,
      authorId: session.user.id,
      universityId: session.user.universityId ?? undefined,
      poll: poll
        ? {
            create: {
              question: poll.question,
              isAnonymous: poll.isAnonymous,
              isMultipleChoice: poll.isMultipleChoice,
              endsAt: poll.endsAt ? new Date(poll.endsAt) : undefined,
              options: {
                create: poll.options.map((text, i) => ({
                  optionText: text,
                  displayOrder: i,
                })),
              },
            },
          }
        : undefined,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
          rank: true,
        },
      },
    },
  });

  await awardXP(session.user.id, "POST_CREATED");
  await updateStreak(session.user.id);
  revalidatePath("/forum");
  return { success: true, data: post };
}

export async function deletePost(postId: string) {
  const session = await auth();
  if (!session?.user?.id)
    return { success: false, error: "Not authenticated" };

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) return { success: false, error: "Post not found" };

  const canDelete =
    post.authorId === session.user.id ||
    ["MODERATOR", "PLATFORM_ADMIN", "UNIVERSITY_ADMIN"].includes(
      session.user.role ?? ""
    );

  if (!canDelete) return { success: false, error: "Not authorized" };

  await prisma.post.delete({ where: { id: postId } });
  revalidatePath("/forum");
  return { success: true };
}

export async function voteOnPost(postId: string, value: 1 | -1) {
  const session = await auth();
  if (!session?.user?.id)
    return { success: false, error: "Not authenticated" };

  const existing = await prisma.vote.findUnique({
    where: { userId_postId: { userId: session.user.id, postId } },
  });

  let totalResult;
  
  if (existing) {
    if (existing.value === value) {
      await prisma.vote.delete({ where: { id: existing.id } });
    } else {
      await prisma.vote.update({ where: { id: existing.id }, data: { value } });
    }
    
    totalResult = await prisma.vote.aggregate({
      where: { postId },
      _sum: { value: true },
    });
  } else {
    const [, aggregate] = await Promise.all([
      prisma.vote.create({
        data: { userId: session.user.id, postId, value },
      }),
      prisma.vote.aggregate({
        where: { postId },
        _sum: { value: true },
      })
    ]);
    
    totalResult = aggregate;
    
    if (value === 1) {
      const post = await prisma.post.findUnique({ where: { id: postId } });
      if (post) {
        await awardXP(post.authorId, "VOTE_RECEIVED_POST");
      }
    }
  }

  const total = totalResult?._sum?.value ?? 0;

  revalidatePath(`/forum/${postId}`);
  return { success: true, data: { total } };
}

export async function acceptAnswer(commentId: string) {
  const session = await auth();
  if (!session?.user?.id)
    return { success: false, error: "Not authenticated" };

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: { post: true },
  });
  if (!comment) return { success: false, error: "Comment not found" };

  const isOP = comment.post.authorId === session.user.id;
  const isEducator = ["EDUCATOR", "TEACHING_ASSISTANT"].includes(
    session.user.role ?? ""
  );
  if (!isOP && !isEducator)
    return { success: false, error: "Not authorized" };

  await prisma.$transaction([
    prisma.comment.updateMany({
      where: { postId: comment.postId },
      data: { isAccepted: false },
    }),
    prisma.comment.update({
      where: { id: commentId },
      data: { isAccepted: true },
    })
  ]);

  await awardXP(comment.authorId, "ANSWER_ACCEPTED");

  await createNotification(
    comment.authorId,
    "ANSWER_ACCEPTED",
    "Your answer was accepted!",
    "Your answer was marked as the best answer.",
    `/forum/${comment.postId}`
  );

  revalidatePath(`/forum/${comment.postId}`);
  return { success: true };
}

export async function getPosts(options: {
  tab?: string;
  visibility?: string;
  type?: string;
  tags?: string[];
  search?: string;
  cursor?: string;
  limit?: number;
}) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const { tab, visibility, type, tags, search, cursor, limit = 20 } = options;

  const where: any = {};

  if (visibility && visibility !== "ALL") {
    where.visibility = visibility;
  } else {
    // Exclude CLASS posts from main forum feed
    where.visibility = {
      in: ["PUBLIC", "UNIVERSITY", "FOLLOWERS"]
    };
  }

  if (type && type !== "ALL") {
    where.type = type;
  }

  if (tags && tags.length > 0) {
    where.tags = { hasSome: tags };
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { body: { contains: search, mode: "insensitive" } },
    ];
  }

  if (tab === "unanswered") {
    where.comments = { none: { isAccepted: true } };
    where.type = "QUESTION";
  }

  const orderBy: any =
    tab === "new"
      ? { createdAt: "desc" }
      : tab === "top"
        ? { votes: { _count: "desc" } }
        : { createdAt: "desc" };

  const posts = await prisma.post.findMany({
    where,
    orderBy,
    take: limit + 1,
    cursor: cursor ? { id: cursor } : undefined,
    include: {
      author: {
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
          rank: true,
          role: true,
        },
      },
      _count: { select: { comments: true, votes: true } },
    },
  });

  let nextCursor: string | undefined;
  if (posts.length > limit) {
    const nextItem = posts.pop();
    nextCursor = nextItem!.id;
  }

  return { success: true, data: { items: posts, nextCursor, hasMore: !!nextCursor } };
}

export async function votePoll(pollId: string, optionId: string) {
  const session = await auth();
  if (!session?.user?.id)
    return { success: false, error: "Not authenticated" };

  const poll = await prisma.poll.findUnique({
    where: { id: pollId },
    include: { options: true },
  });

  if (!poll) return { success: false, error: "Poll not found" };
  if (poll.endsAt && poll.endsAt < new Date()) {
    return { success: false, error: "Poll has ended" };
  }

  const existingVote = await prisma.pollVote.findFirst({
    where: { pollId, userId: session.user.id },
  });

  try {
    if (existingVote) {
      if (existingVote.optionId === optionId) {
        // Remove vote if clicking same option
        await prisma.pollVote.delete({ where: { id: existingVote.id } });
      } else {
        // Update vote
        await prisma.pollVote.update({
          where: { id: existingVote.id },
          data: { optionId },
        });
      }
    } else {
      // Create new vote
      await prisma.pollVote.create({
        data: { pollId, optionId, userId: session.user.id },
      });
      await awardXP(session.user.id, "VOTE_RECEIVED_POST"); // Reuse XP for participation
    }

    if (poll.postId) revalidatePath(`/forum/${poll.postId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to cast vote" };
  }
}
