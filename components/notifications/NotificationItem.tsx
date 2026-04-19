import { cn, timeAgo } from "@/lib/utils";
import {
  MessageSquare,
  Star,
  UserPlus,
  Trophy,
  Bell,
  CheckCircle2,
  AtSign,
  ThumbsUp,
} from "lucide-react";
import type { Rank } from "@prisma/client";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  NEW_COMMENT: MessageSquare,
  NEW_REPLY: MessageSquare,
  NEW_FOLLOWER: UserPlus,
  POST_STARRED: Star,
  RANK_UP: Trophy,
  MENTION: AtSign,
  VOTE_RECEIVED: ThumbsUp,
  ANSWER_ACCEPTED: CheckCircle2,
  SYSTEM: Bell,
};

const ICON_STYLES: Record<string, string> = {
  NEW_COMMENT: "bg-blue-500/15 text-blue-500",
  NEW_REPLY: "bg-blue-500/15 text-blue-500",
  NEW_FOLLOWER: "bg-green-500/15 text-green-500",
  POST_STARRED: "bg-amber-500/15 text-amber-500",
  RANK_UP: "bg-purple-500/15 text-purple-500",
  MENTION: "bg-sky-500/15 text-sky-500",
  VOTE_RECEIVED: "bg-orange-500/15 text-orange-500",
  ANSWER_ACCEPTED: "bg-emerald-500/15 text-emerald-500",
  SYSTEM: "bg-zinc-500/15 text-zinc-500",
};

interface NotificationItemProps {
  notification: {
    id: string;
    type: string;
    title: string;
    body: string;
    read: boolean;
    createdAt: Date | string;
    url?: string | null;
  };
  onRead?: (id: string) => void;
}

export function NotificationItem({ notification, onRead }: NotificationItemProps) {
  const Icon = ICON_MAP[notification.type] ?? Bell;
  const iconStyle = ICON_STYLES[notification.type] ?? ICON_STYLES.SYSTEM;

  const content = (
    <div
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg transition-colors hover:bg-muted/50",
        !notification.read && "bg-primary/5"
      )}
      onClick={() => !notification.read && onRead?.(notification.id)}
    >
      <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", iconStyle)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0 space-y-0.5">
        <div className="flex items-start justify-between gap-2">
          <p className={cn("text-sm", !notification.read && "font-semibold")}>{notification.title}</p>
          {!notification.read && (
            <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
          )}
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">{notification.body}</p>
        <p className="text-[10px] text-muted-foreground">{timeAgo(notification.createdAt)}</p>
      </div>
    </div>
  );

  if (notification.url) {
    return (
      <a href={notification.url} className="block">
        {content}
      </a>
    );
  }

  return content;
}
