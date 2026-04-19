import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/shared/Avatar";
import { timeAgo } from "@/lib/utils";
import { MessageCircle } from "lucide-react";
import Link from "next/link";

export default async function MessagesPage() {
  const session = await auth();
  if (!session?.user) return null;

  const conversations = await prisma.conversation.findMany({
    where: {
      members: { some: { userId: session.user.id } },
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
            },
          },
        },
      },
      messages: {
        orderBy: { sentAt: "desc" },
        take: 1,
        select: {
          body: true,
          sentAt: true,
          senderId: true,
        },
      },
    },
    orderBy: { messages: { _count: "desc" } },
    take: 30,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold">Messages</h1>

      {conversations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No conversations yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-1">
          {conversations.map((conv) => {
            const otherMember = conv.members.find(
              (m) => m.userId !== session.user.id
            );
            const displayName = conv.isGroup
              ? conv.name || "Group Chat"
              : otherMember?.user.name || "Unknown";
            const displayImage = conv.isGroup
              ? null
              : otherMember?.user.image;

            return (
              <Link
                key={conv.id}
                href={`/messages/${conv.id}`}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
              >
                <Avatar
                  src={displayImage}
                  name={displayName}
                  size="lg"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{displayName}</p>
                  {conv.messages[0] && (
                    <p className="text-xs text-muted-foreground truncate">
                      {conv.messages[0].body}
                    </p>
                  )}
                </div>
                {conv.messages[0] && (
                  <span className="text-xs text-muted-foreground shrink-0">
                    {timeAgo(conv.messages[0].sentAt)}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
