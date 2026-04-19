import webpush from "web-push";
import { prisma } from "./prisma";

let vapidInitialized = false;

function initVapid() {
  if (vapidInitialized) return;
  
  if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY && process.env.VAPID_SUBJECT) {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT,
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
    vapidInitialized = true;
  }
}

interface NotificationPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
  type?: string;
}

export async function sendPushToUser(
  userId: string,
  payload: NotificationPayload
) {
  try {
    initVapid();
    
    if (!vapidInitialized) {
      // VAPID not configured, skip push notifications
      return;
    }
    
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId },
    });

    if (subscriptions.length === 0) {
      return;
    }

    const results = await Promise.allSettled(
      subscriptions.map((sub) =>
        webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          JSON.stringify({
            ...payload,
            icon: payload.icon || "/icons/icon-192.png",
          })
        )
      )
    );

    const failed = results
      .map((r, i) => ({ r, sub: subscriptions[i] }))
      .filter(({ r }) => r.status === "rejected");

    if (failed.length > 0) {
      await prisma.pushSubscription.deleteMany({
        where: { id: { in: failed.map(({ sub }) => sub.id) } },
      });
    }
  } catch {}
}

export async function createNotification(
  userId: string,
  type: string,
  title: string,
  body: string,
  url?: string,
  data?: Record<string, any>
) {
  const notification = await prisma.notification.create({
    data: {
      userId,
      type: type as any,
      title,
      body,
      url,
      data: data ?? undefined,
    },
  });

  sendPushToUser(userId, { title, body, url, type }).catch(() => {});

  return notification;
}

export async function createNotificationForMany(
  userIds: string[],
  type: string,
  title: string,
  body: string,
  url?: string,
  data?: Record<string, any>
) {
  if (userIds.length === 0) return [];

  const notifications = await prisma.notification.createMany({
    data: userIds.map((userId) => ({
      userId,
      type: type as any,
      title,
      body,
      url,
      data: data ?? undefined,
    })),
  });

  for (const userId of userIds) {
    sendPushToUser(userId, { title, body, url, type }).catch(() => {});
  }

  return notifications;
}
