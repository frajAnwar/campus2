"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getNotifications(options?: { cursor?: string; limit?: number; unreadOnly?: boolean }) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const { cursor, limit = 20, unreadOnly } = options ?? {};

  const where: any = { userId: session.user.id };
  if (unreadOnly) where.readAt = null;

  const notifications = await prisma.notification.findMany({
    where,
    take: limit + 1,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: { createdAt: "desc" },
  });

  let nextCursor: string | undefined;
  if (notifications.length > limit) {
    const nextItem = notifications.pop();
    nextCursor = nextItem!.id;
  }

  const unreadCount = await prisma.notification.count({
    where: { userId: session.user.id, readAt: null },
  });

  return {
    success: true,
    data: { items: notifications, nextCursor, hasMore: !!nextCursor, unreadCount },
  };
}

export async function markAsRead(notificationId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });
  if (!notification) return { success: false, error: "Notification not found" };
  if (notification.userId !== session.user.id) return { success: false, error: "Not authorized" };

  await prisma.notification.update({
    where: { id: notificationId },
    data: { readAt: new Date() },
  });

  revalidatePath("/notifications");
  return { success: true };
}

export async function markAllAsRead() {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  await prisma.notification.updateMany({
    where: { userId: session.user.id, readAt: null },
    data: { readAt: new Date() },
  });

  revalidatePath("/notifications");
  return { success: true };
}

export async function deleteNotification(notificationId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });
  if (!notification) return { success: false, error: "Notification not found" };
  if (notification.userId !== session.user.id) return { success: false, error: "Not authorized" };

  await prisma.notification.delete({ where: { id: notificationId } });
  revalidatePath("/notifications");
  return { success: true };
}
