"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageSquare, Eye, Bookmark, MoreHorizontal, Flag, Share2, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Avatar } from "@/components/shared/Avatar";
import { RankBadge } from "@/components/gamification/RankBadge";
import { VoteButtons } from "@/components/forum/VoteButtons";
import { ReportModal } from "@/components/shared/ReportModal";
import { cn, timeAgo, truncate } from "@/lib/utils";
import type { PostType, Visibility } from "@prisma/client";

const TYPE_STYLES: Record<PostType, { label: string; class: string; icon?: any }> = {
  QUESTION: { label: "Question", class: "bg-blue-500/10 text-blue-600 border-blue-500/20", icon: Sparkles },
  DISCUSSION: { label: "Discussion", class: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  SHOWCASE: { label: "Showcase", class: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  NOTE_SHARE: { label: "Notes", class: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  POLL: { label: "Poll", class: "bg-pink-500/10 text-pink-600 border-pink-500/20" },
};

const VISIBILITY_LABELS: Record<Visibility, string> = {
  PUBLIC: "Public",
  UNIVERSITY: "University Only",
  CLASS: "Class Only",
  FOLLOWERS: "Followers",
  PRIVATE: "Private",
};

interface PostCardProps {
  post: any; // Using any for flexibility in this refactor
}

export function PostCard({ post }: PostCardProps) {
  const [reportOpen, setReportOpen] = useState(false);

  const stripHtml = (html: string) =>
    html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();

  const typeInfo = TYPE_STYLES[post.type as PostType];

  return (
    <>
      <Card className="group border-none bg-card/50 backdrop-blur-sm shadow-sm ring-1 ring-border/50 hover:ring-primary/30 transition-all duration-300">
        <CardContent className="flex gap-4 p-5">
          {/* Vote Sidebar */}
          <div className="hidden sm:block">
            <VoteButtons
              itemId={post.id}
              score={post._count?.votes || 0}
              userVote={post.userVote}
              type="post"
              size="md"
            />
          </div>

          <div className="flex-1 min-w-0 space-y-3">
            {/* Header: Meta Info */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 overflow-hidden">
                <Avatar src={post.author.image} name={post.author.name} size="xs" />
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span className="font-bold text-foreground/80 hover:text-primary transition-colors cursor-pointer">
                    {post.author.name}
                  </span>
                  <RankBadge rank={post.author.rank as any} className="scale-75 origin-left" />
                  <span className="text-muted-foreground/50">&bull;</span>
                  <span className="text-muted-foreground">{timeAgo(post.createdAt)}</span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Badge variant="outline" className={cn("text-[9px] font-bold uppercase tracking-wider py-0 px-2 h-5", typeInfo.class)}>
                  {typeInfo.label}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-accent transition-colors">
                      <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                   <DropdownMenuContent align="end" className="w-40">
                     <DropdownMenuGroup>
                       <DropdownMenuItem className="gap-2">
                         <Bookmark className="h-3.5 w-3.5" /> Bookmark
                       </DropdownMenuItem>
                       <DropdownMenuItem className="gap-2">
                         <Share2 className="h-3.5 w-3.5" /> Share
                       </DropdownMenuItem>
                     </DropdownMenuGroup>
                     <DropdownMenuSeparator />
                     <DropdownMenuGroup>
                       <DropdownMenuItem onClick={() => setReportOpen(true)} className="gap-2 text-destructive focus:text-destructive">
                         <Flag className="h-3.5 w-3.5" /> Report
                       </DropdownMenuItem>
                     </DropdownMenuGroup>
                   </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Content: Title & Body */}
            <div className="space-y-1.5">
              <Link href={`/forum/${post.id}`} className="block">
                <h3 className="text-base font-bold leading-tight group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
              </Link>
              <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed font-normal">
                {truncate(stripHtml(post.body), 200)}
              </p>
            </div>

            {/* Tags */}
            {post.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {post.tags.slice(0, 3).map((tag: string) => (
                  <Badge key={tag} variant="secondary" className="text-[10px] font-medium bg-muted/50 hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer px-2 py-0 border-none">
                    #{tag}
                  </Badge>
                ))}
                {post.tags.length > 3 && (
                  <span className="text-[10px] text-muted-foreground font-medium pl-1">
                    +{post.tags.length - 3} more
                  </span>
                )}
              </div>
            )}

            {/* Footer: Stats & Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-border/30">
              <div className="flex items-center gap-4">
                <Link href={`/forum/${post.id}#comments`} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
                  <div className="p-1.5 rounded-lg bg-accent/50 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <MessageSquare className="h-3.5 w-3.5" />
                  </div>
                  <span className="font-semibold">{post._count?.comments || 0}</span>
                  <span className="hidden sm:inline">comments</span>
                </Link>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="p-1.5 rounded-lg bg-accent/50">
                    <Eye className="h-3.5 w-3.5" />
                  </div>
                  <span className="font-semibold">{post.viewCount || 0}</span>
                  <span className="hidden sm:inline">views</span>
                </div>
              </div>

              {post.visibility !== "PUBLIC" && (
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-tighter">
                  <span className="size-1.5 rounded-full bg-primary/40 animate-pulse" />
                  {VISIBILITY_LABELS[post.visibility as Visibility]}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        postId={post.id}
        reportedId={post.author.id}
      />
    </>
  );
}
