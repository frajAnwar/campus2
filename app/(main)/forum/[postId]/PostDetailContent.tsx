"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Eye,
  MessageSquare,
  Pin,
  Lock,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/shared/Avatar";
import { RankBadge } from "@/components/gamification/RankBadge";
import { VoteButtons } from "@/components/forum/VoteButtons";
import { CommentThread } from "@/components/forum/CommentThread";
import { cn, timeAgo } from "@/lib/utils";
import { createComment } from "@/actions/comment";
import { summarizeThread } from "@/actions/ai";
import { toast } from "sonner";
import type { PostType, Visibility } from "@prisma/client";
import { AIChatPanel } from "@/components/shared/AIChatPanel";

const TYPE_STYLES: Record<PostType, string> = {
  QUESTION: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  DISCUSSION: "bg-green-500/15 text-green-600 dark:text-green-400",
  SHOWCASE: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
  NOTE_SHARE: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  POLL: "bg-pink-500/15 text-pink-600 dark:text-pink-400",
};

interface PostDetailContentProps {
  post: {
    id: string;
    type: PostType;
    title: string;
    body: string;
    visibility: Visibility;
    tags: string[];
    viewCount: number;
    isPinned: boolean;
    isLocked: boolean;
    contentWarning: string | null;
    createdAt: string;
    aiSummary: any;
    author: {
      id: string;
      name: string;
      username?: string;
      image?: string | null;
      rank: string;
      role: string;
    };
    voteScore: number;
    userVote: 1 | -1 | null;
    poll?: any;
    classId?: string | null;
  };
  comments: {
    id: string;
    body: string;
    isAccepted: boolean;
    createdAt: string;
    parentCommentId: string | null;
    author: {
      id: string;
      name: string;
      image?: string | null;
      rank: string;
    };
    _count: { votes: number };
    voteScore: number;
    userVote: 1 | -1 | null;
  }[];
  userId: string;
  userRole?: string;
}

export function PostDetailContent({
  post,
  comments,
  userId,
  userRole,
}: PostDetailContentProps) {
  const [commentBody, setCommentBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [aiSummary, setAiSummary] = useState<any>(post.aiSummary);
  const [summarizing, setSummarizing] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  const handleSubmitComment = async () => {
    if (!commentBody.trim()) return;
    setSubmitting(true);
    const result = await createComment(post.id, commentBody);
    setSubmitting(false);
    if (result.success) {
      setCommentBody("");
      toast.success("Comment posted");
    } else {
      toast.error(result.error);
    }
  };

  const handleSummarize = async () => {
    setSummarizing(true);
    const result = await summarizeThread(post.id);
    if (result.success) {
      setAiSummary(result.data);
    } else {
      toast.error(result.error);
    }
    setSummarizing(false);
  };

  const showAISummary = comments.length >= 5;

  const backHref = post.classId ? `/classes/${post.classId}?tab=feed` : "/forum";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={backHref}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-lg font-bold truncate">{post.title}</h1>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setAiOpen(true)}
          className="gap-2"
        >
          <Sparkles className="h-4 w-4" />
          AI Assistant
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="hidden sm:block pt-2">
          <VoteButtons
            itemId={post.id}
            score={post.voteScore}
            userVote={post.userVote}
            type="post"
            size="md"
          />
        </div>

        <div className="flex-1 min-w-0 space-y-4">
          <Card>
            <CardContent className="space-y-4 p-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="secondary"
                  className={cn("text-xs", TYPE_STYLES[post.type])}
                >
                  {post.type.replace("_", " ")}
                </Badge>
                {post.isPinned && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    <Pin className="h-3 w-3" />
                    Pinned
                  </Badge>
                )}
                {post.isLocked && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    <Lock className="h-3 w-3" />
                    Locked
                  </Badge>
                )}
                {post.visibility !== "PUBLIC" && (
                  <Badge variant="outline" className="text-xs">
                    {post.visibility}
                  </Badge>
                )}
              </div>

              <h2 className="text-xl font-bold leading-tight">{post.title}</h2>

              {post.contentWarning && (
                <div className="rounded-md bg-amber-500/10 border border-amber-500/20 px-3 py-2 text-sm text-amber-600 dark:text-amber-400">
                  CW: {post.contentWarning}
                </div>
              )}

              <div
                className="prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: post.body }}
              />

              {post.poll && (
                <Card size="sm">
                  <CardContent className="space-y-2">
                    <p className="font-medium text-sm">{post.poll.question}</p>
                    {post.poll.options?.map((option: any) => {
                      const totalVotes = post.poll._count?.votes || 1;
                      const optionVotes = option._count?.votes || 0;
                      const pct = Math.round((optionVotes / totalVotes) * 100);
                      return (
                        <div key={option.id} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{option.optionText}</span>
                            <span className="text-muted-foreground">
                              {optionVotes} ({pct}%)
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              )}

              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-2">
                  <Avatar
                    src={post.author.image}
                    name={post.author.name}
                    size="md"
                  />
                  <div>
                    <p className="text-sm font-medium">{post.author.name}</p>
                    <RankBadge rank={post.author.rank as any} className="text-[10px]" />
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {post.viewCount}
                  </span>
                  <span>{timeAgo(post.createdAt)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {showAISummary && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  AI Summary
                </CardTitle>
                {!aiSummary && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSummarize}
                    disabled={summarizing}
                    className="gap-1 text-xs"
                  >
                    {summarizing ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Sparkles className="h-3 w-3" />
                    )}
                    Generate
                  </Button>
                )}
              </CardHeader>
              {aiSummary && (
                <CardContent className="text-sm space-y-2">
                  {aiSummary.topic && (
                    <p>
                      <strong>Topic:</strong> {aiSummary.topic}
                    </p>
                  )}
                  {aiSummary.key_points?.length > 0 && (
                    <ul className="list-disc pl-4 space-y-0.5">
                      {aiSummary.key_points.map((point: string, i: number) => (
                        <li key={i}>{point}</li>
                      ))}
                    </ul>
                  )}
                  {aiSummary.best_answer && (
                    <p>
                      <strong>Best answer:</strong> {aiSummary.best_answer}
                    </p>
                  )}
                </CardContent>
              )}
            </Card>
          )}

          <div className="space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              {comments.length} Comment{comments.length !== 1 ? "s" : ""}
            </h3>

            {!post.isLocked && (
              <div className="flex gap-3">
                <div className="pt-1">
                  <Avatar
                    src={undefined}
                    name="You"
                    size="sm"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <textarea
                    value={commentBody}
                    onChange={(e) => setCommentBody(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring min-h-[80px]"
                  />
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      onClick={handleSubmitComment}
                      disabled={submitting || !commentBody.trim()}
                    >
                      {submitting ? "Posting..." : "Comment"}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <CommentThread
              comments={comments}
              postId={post.id}
              postAuthorId={post.author.id}
              userId={userId}
              userRole={userRole}
            />
          </div>
        </div>
      </div>
      <AIChatPanel
        type="THREAD"
        targetId={post.id}
        isOpen={aiOpen}
        onClose={() => setAiOpen(false)}
      />
    </div>
  );
}
