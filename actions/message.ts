"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const createConversationSchema = z.object({
  participantIds: z.array(z.string()).min(1).max(50),
  isGroup: z.boolean().default(false),
  name: z.string().optional(),
});

const sendMessageSchema = z.object({
  conversationId: z.string(),
  body: z.string().min(1).max(5000),
  fileUrl: z.string().optional(),
});

export async function createConversation(input: z.infer<typeof createConversationSchema>) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const parsed = createConversationSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.message };

  if (parsed.data.isGroup && !parsed.data.name) {
    return { success: false, error: "Group conversations need a name" };
  }

  const allParticipantIds = [...new Set([...parsed.data.participantIds, session.user.id])];

  const conversation = await prisma.conversation.create({
    data: {
      isGroup: parsed.data.isGroup,
      name: parsed.data.name,
      members: {
        create: allParticipantIds.map((userId) => ({ userId })),
      },
    },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, name: true, username: true, image: true },
          },
        },
      },
    },
  });

  return { success: true, data: conversation };
}

export async function sendMessage(input: z.infer<typeof sendMessageSchema>) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const parsed = sendMessageSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.message };

  const membership = await prisma.conversationMember.findUnique({
    where: {
      conversationId_userId: {
        conversationId: parsed.data.conversationId,
        userId: session.user.id,
      },
    },
  });
  if (!membership) return { success: false, error: "Not a member of this conversation" };

  const message = await prisma.directMessage.create({
    data: {
      conversationId: parsed.data.conversationId,
      senderId: session.user.id,
      body: parsed.data.body,
      fileUrl: parsed.data.fileUrl,
    },
    include: {
      sender: {
        select: { id: true, name: true, username: true, image: true },
      },
    },
  });

  return { success: true, data: message };
}

export async function getConversations(options?: { cursor?: string; limit?: number }) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const { cursor, limit = 20 } = options ?? {};

  const memberships = await prisma.conversationMember.findMany({
    where: { userId: session.user.id },
    select: { conversationId: true },
  });
  const conversationIds = memberships.map((m) => m.conversationId);

  const conversations = await prisma.conversation.findMany({
    where: { id: { in: conversationIds } },
    take: limit + 1,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, name: true, username: true, image: true },
          },
        },
      },
      messages: {
        orderBy: { sentAt: "desc" },
        take: 1,
        include: {
          sender: {
            select: { id: true, name: true, username: true },
          },
        },
      },
    },
  });

  let nextCursor: string | undefined;
  if (conversations.length > limit) {
    const nextItem = conversations.pop();
    nextCursor = nextItem!.id;
  }

  return { success: true, data: { items: conversations, nextCursor, hasMore: !!nextCursor } };
}

export async function getConversationMessages(
  conversationId: string,
  options?: { cursor?: string; limit?: number }
) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const membership = await prisma.conversationMember.findUnique({
    where: {
      conversationId_userId: { conversationId, userId: session.user.id },
    },
  });
  if (!membership) return { success: false, error: "Not a member of this conversation" };

  const { cursor, limit = 50 } = options ?? {};

  const messages = await prisma.directMessage.findMany({
    where: { conversationId },
    take: limit + 1,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: { sentAt: "desc" },
    include: {
      sender: {
        select: { id: true, name: true, username: true, image: true },
      },
    },
  });

  let nextCursor: string | undefined;
  if (messages.length > limit) {
    const nextItem = messages.pop();
    nextCursor = nextItem!.id;
  }

  await prisma.conversationMember.update({
    where: {
      conversationId_userId: { conversationId, userId: session.user.id },
    },
    data: { lastReadAt: new Date() },
  });

  return { success: true, data: { items: messages.reverse(), nextCursor, hasMore: !!nextCursor } };
}

export async function getOrCreateDirectConversation(otherUserId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };
  if (session.user.id === otherUserId) return { success: false, error: "Cannot message yourself" };

  // Find existing 1-on-1 conversation
  const existing = await prisma.conversation.findFirst({
    where: {
      isGroup: false,
      AND: [
        { members: { some: { userId: session.user.id } } },
        { members: { some: { userId: otherUserId } } },
      ],
    },
    select: { id: true },
  });

  if (existing) {
    return { success: true, data: existing };
  }

  // Create new direct conversation
  const conversation = await prisma.conversation.create({
    data: {
      isGroup: false,
      members: {
        create: [
          { userId: session.user.id },
          { userId: otherUserId },
        ],
      },
    },
  });

  revalidatePath("/messages");
  return { success: true, data: conversation };
}
