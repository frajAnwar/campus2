"use client";

import { CommentItem } from "@/components/forum/CommentItem";

interface CommentThreadProps {
  comments: {
    id: string;
    body: string;
    isAccepted: boolean;
    createdAt: Date | string;
    author: {
      id: string;
      name: string;
      image?: string | null;
      rank: string;
    };
    _count: { votes: number };
    userVote?: 1 | -1 | null;
    replies?: any[];
  }[];
  postId: string;
  postAuthorId: string;
  userId?: string;
  userRole?: string;
}

function buildTree(flat: CommentThreadProps["comments"]): CommentThreadProps["comments"] {
  const map = new Map<string, CommentThreadProps["comments"][number]>();
  const roots: CommentThreadProps["comments"] = [];

  flat.forEach((c) => map.set(c.id, { ...c, replies: [] }));

  flat.forEach((c) => {
    const node = map.get(c.id)!;
    const parentId = (c as any).parentCommentId;
    if (parentId && map.has(parentId)) {
      map.get(parentId)!.replies!.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

export function CommentThread({
  comments,
  postId,
  postAuthorId,
  userId,
  userRole,
}: CommentThreadProps) {
  const tree = buildTree(comments);

  const isOP = (authorId: string) => authorId === postAuthorId;
  const canAccept =
    userId === postAuthorId ||
    ["EDUCATOR", "TEACHING_ASSISTANT"].includes(userRole ?? "");

  if (tree.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        No comments yet. Be the first to respond!
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {tree.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          postId={postId}
          depth={0}
          isOP={isOP}
          canAccept={canAccept}
        />
      ))}
    </div>
  );
}
