"use client";

import Link from "next/link";
import { Avatar } from "@/components/shared/Avatar";
import { cn, timeAgo, truncate } from "@/lib/utils";

interface Conversation {
  id: string;
  name?: string | null;
  isGroup: boolean;
  members: {
    user: {
      id: string;
      name: string;
      image?: string | null;
    };
  }[];
  messages: {
    body: string;
    sentAt: Date | string;
    sender: {
      id: string;
      name: string;
    };
  }[];
}

interface ConversationListProps {
  conversations: Conversation[];
  activeId?: string;
  className?: string;
}

export function ConversationList({ conversations, activeId, className }: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className={cn("p-4 text-center text-sm text-muted-foreground", className)}>
        No conversations yet
      </div>
    );
  }

  return (
    <div className={cn("space-y-0.5", className)}>
      {conversations.map((conv) => {
        const otherMember = conv.members.find(
          (m) => m.user.id !== ("" )
        )?.user ?? conv.members[0]?.user;
        const lastMessage = conv.messages[0];
        const displayName = conv.isGroup ? conv.name : otherMember?.name;
        const displayImage = conv.isGroup ? null : otherMember?.image;

        return (
          <Link
            key={conv.id}
            href={`/messages/${conv.id}`}
            className={cn(
              "flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50",
              activeId === conv.id && "bg-muted"
            )}
          >
            <Avatar src={displayImage} name={displayName ?? "Chat"} size="md" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{displayName}</p>
              {lastMessage && (
                <p className="text-xs text-muted-foreground truncate">
                  {truncate(lastMessage.body, 40)}
                </p>
              )}
            </div>
            {lastMessage && (
              <span className="text-[10px] text-muted-foreground shrink-0">
                {timeAgo(lastMessage.sentAt)}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
