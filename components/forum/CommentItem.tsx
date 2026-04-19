"use client";

import { useState } from "react";
import { Reply, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/shared/Avatar";
import { RankBadge } from "@/components/gamification/RankBadge";
import { VoteButtons } from "@/components/forum/VoteButtons";
import { timeAgo, cn } from "@/lib/utils";
import { createComment, voteOnComment } from "@/actions/comment";
import { acceptAnswer } from "@/actions/post";
import { toast } from "sonner";

interface CommentItemProps {
  comment: {
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
    replies?: CommentItemProps["comment"][];
  };
  postId: string;
  depth?: number;
  isOP?: (authorId: string) => boolean;
  canAccept?: boolean;
  onReply?: () => void;
}

export function CommentItem({
  comment,
  postId,
  depth = 0,
  isOP,
  canAccept,
  onReply,
}: CommentItemProps) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyBody, setReplyBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleReply = async () => {
    if (!replyBody.trim()) return;
    setSubmitting(true);
    const result = await createComment(postId, replyBody, comment.id);
    setSubmitting(false);
    if (result.success) {
      setReplyBody("");
      setShowReplyInput(false);
      toast.success("Reply posted");
    } else {
      toast.error(result.error);
    }
  };

  const handleAccept = async () => {
    const result = await acceptAnswer(comment.id);
    if (result.success) {
      toast.success("Answer accepted");
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className={cn("flex gap-3", depth > 0 && "ml-8 border-l pl-4")}>
      <div className="flex flex-col items-center pt-1">
        <Avatar src={comment.author.image} name={comment.author.name} size="sm" />
      </div>

      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium">{comment.author.name}</span>
          <RankBadge rank={comment.author.rank as any} className="text-[10px]" />
          {isOP?.(comment.author.id) && (
            <span className="text-[10px] px-1.5 py-0 rounded-full bg-primary/10 text-primary font-medium">
              OP
            </span>
          )}
          <span className="text-xs text-muted-foreground">
            {timeAgo(comment.createdAt)}
          </span>
          {comment.isAccepted && (
            <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Accepted
            </span>
          )}
        </div>

        <div
          className="text-sm prose dark:prose-invert prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: comment.body }}
        />

        <div className="flex items-center gap-2">
          <VoteButtons
            itemId={comment.id}
            score={comment._count.votes}
            userVote={comment.userVote}
            type="comment"
            size="sm"
          />

          {depth < 2 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs gap-1"
              onClick={() => setShowReplyInput(!showReplyInput)}
            >
              <Reply className="h-3 w-3" />
              Reply
            </Button>
          )}

          {canAccept && !comment.isAccepted && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs gap-1 text-emerald-600 hover:text-emerald-700"
              onClick={handleAccept}
            >
              <CheckCircle2 className="h-3 w-3" />
              Accept
            </Button>
          )}
        </div>

        {showReplyInput && (
          <div className="flex gap-2 pt-2">
            <textarea
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              placeholder="Write a reply..."
              className="flex-1 rounded-md border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              rows={2}
            />
            <div className="flex flex-col gap-1">
              <Button size="sm" onClick={handleReply} disabled={submitting || !replyBody.trim()}>
                {submitting ? "..." : "Reply"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowReplyInput(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {comment.replies && comment.replies.length > 0 && (
          <div className="space-y-4 mt-3">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                postId={postId}
                depth={depth + 1}
                isOP={isOP}
                canAccept={canAccept}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
