import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PostDetailContent } from "./PostDetailContent";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ postId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { postId } = await params;
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { title: true },
  });
  if (!post) return { title: "Post not found" };
  return { title: post.title };
}

export default async function PostDetailPage({ params }: Props) {
  const session = await auth();
  if (!session?.user) return null;

  const { postId } = await params;

  const post = await prisma.post.findUnique({
    where: { id: postId },
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
      comments: {
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
          _count: { select: { votes: true } },
          votes: {
            where: { userId: session.user.id },
            select: { value: true },
          },
        },
        orderBy: [{ isAccepted: "desc" }, { createdAt: "asc" }],
      },
      votes: {
        select: { value: true },
      },
      poll: {
        include: {
          options: {
            include: {
              _count: { select: { votes: true } },
            },
            orderBy: { displayOrder: "asc" },
          },
          _count: { select: { votes: true } },
        },
      },
    },
  });

  if (!post) notFound();

  const voteScore = post.votes.reduce((sum, v) => sum + v.value, 0);
  const userVote = post.votes.find((v) => true)?.value as 1 | -1 | null;

  const commentsWithUserVote = post.comments.map((c) => ({
    ...c,
    voteScore: c._count.votes,
    userVote: c.votes[0]?.value as 1 | -1 | null,
    parentCommentId: c.parentCommentId,
  }));

  const serializedPost = {
    id: post.id,
    type: post.type,
    title: post.title,
    body: post.body,
    visibility: post.visibility,
    tags: post.tags,
    viewCount: post.viewCount,
    isPinned: post.isPinned,
    isLocked: post.isLocked,
    contentWarning: post.contentWarning,
    createdAt: post.createdAt.toISOString(),
    aiSummary: post.aiSummary,
    author: post.author,
    voteScore,
    userVote,
    poll: post.poll,
    classId: post.classId,
  };

  const serializedComments = commentsWithUserVote.map((c) => ({
    id: c.id,
    body: c.body,
    isAccepted: c.isAccepted,
    createdAt: c.createdAt.toISOString(),
    parentCommentId: c.parentCommentId,
    author: c.author,
    _count: c._count,
    voteScore: c.voteScore,
    userVote: c.userVote,
  }));

  return (
    <PostDetailContent
      post={serializedPost}
      comments={serializedComments}
      userId={session.user.id}
      userRole={session.user.role}
    />
  );
}
