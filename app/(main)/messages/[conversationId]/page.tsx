import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/shared/Avatar";
import { timeAgo } from "@/lib/utils";
import { ArrowLeft, Send } from "lucide-react";
import Link from "next/link";

type Params = Promise<{ conversationId: string }>;

export default async function ConversationPage({
  params,
}: {
  params: Params;
}) {
  const session = await auth();
  if (!session?.user) return null;

  const { conversationId } = await params;

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
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
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: { sentAt: "asc" },
        take: 50,
      },
    },
  });

  if (!conversation) notFound();

  const isMember = conversation.members.some(
    (m) => m.userId === session.user.id
  );
  if (!isMember) notFound();

  const otherMember = conversation.members.find(
    (m) => m.userId !== session.user.id
  );
  const displayName = conversation.isGroup
    ? conversation.name || "Group Chat"
    : otherMember?.user.name || "Unknown";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/messages">
          <ArrowLeft className="h-5 w-5 text-muted-foreground hover:text-foreground" />
        </Link>
        <Avatar
          src={conversation.isGroup ? null : otherMember?.user.image}
          name={displayName}
          size="md"
        />
        <div>
          <h1 className="text-lg font-display font-bold">{displayName}</h1>
          {conversation.isGroup && (
            <p className="text-xs text-muted-foreground">
              {conversation.members.length} members
            </p>
          )}
        </div>
      </div>

      <Card className="flex flex-col">
        <CardContent className="flex-1 max-h-[60vh] overflow-y-auto space-y-3 pt-4">
          {conversation.messages.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No messages yet. Start the conversation!
            </p>
          ) : (
            conversation.messages.map((msg) => {
              const isOwn = msg.senderId === session.user.id;
              return (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${isOwn ? "flex-row-reverse" : ""}`}
                >
                  {!isOwn && (
                    <Avatar
                      src={msg.sender.image}
                      name={msg.sender.name}
                      size="sm"
                    />
                  )}
                  <div
                    className={`max-w-[70%] rounded-lg px-3 py-2 text-sm ${
                      isOwn
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p>{msg.body}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isOwn
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground"
                      }`}
                    >
                      {timeAgo(msg.sentAt)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <form
        action={`/api/messages/${conversationId}`}
        method="POST"
        className="flex gap-2"
      >
        <input
          name="body"
          placeholder="Type a message..."
          className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          required
        />
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
