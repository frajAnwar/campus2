"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { awardXP } from "@/lib/xp";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { EventType } from "@prisma/client";

const eventSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(5000).optional(),
  type: z.nativeEnum(EventType).default("SOCIAL"),
  date: z.string(),
  endDate: z.string().optional(),
  location: z.string().optional(),
  onlineUrl: z.string().optional(),
  capacity: z.number().int().positive().optional(),
  formFields: z.any().optional(),
});

export async function createEvent(clubId: string, input: z.infer<typeof eventSchema>) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const parsed = eventSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.message };

  const club = await prisma.club.findUnique({ where: { id: clubId } });
  if (!club) return { success: false, error: "Club not found" };

  const membership = await prisma.clubMember.findUnique({
    where: { clubId_userId: { clubId, userId: session.user.id } },
  });

  const canCreate =
    club.managerId === session.user.id ||
    membership?.role === "MANAGER" ||
    membership?.role === "OFFICER";

  if (!canCreate) return { success: false, error: "Not authorized to create events" };

  const event = await prisma.event.create({
    data: {
      clubId,
      title: parsed.data.title,
      description: parsed.data.description,
      type: parsed.data.type,
      date: new Date(parsed.data.date),
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : undefined,
      location: parsed.data.location,
      onlineUrl: parsed.data.onlineUrl,
      capacity: parsed.data.capacity,
      formFields: parsed.data.formFields,
    },
  });

  await awardXP(session.user.id, "EVENT_HOSTED");

  const members = await prisma.clubMember.findMany({
    where: { clubId },
    select: { userId: true },
  });

  await prisma.notification.createMany({
    data: members.map((m) => ({
      userId: m.userId,
      type: "CLUB_EVENT",
      title: "New Club Event",
      body: `${club.name} has a new event: ${parsed.data.title}`,
      url: `/clubs/${clubId}/events/${event.id}`,
    })),
  });

  revalidatePath(`/clubs/${clubId}/events`);
  return { success: true, data: event };
}

export async function registerForEvent(eventId: string, formData?: Record<string, unknown>) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { registrations: true },
  });
  if (!event) return { success: false, error: "Event not found" };

  if (event.capacity && event.registrations.length >= event.capacity) {
    return { success: false, error: "Event is full" };
  }

  const existing = await prisma.eventRegistration.findUnique({
    where: { eventId_userId: { eventId, userId: session.user.id } },
  });
  if (existing) return { success: false, error: "Already registered" };

  const registration = await prisma.eventRegistration.create({
    data: {
      eventId,
      userId: session.user.id,
      formData: (formData as any) || undefined,
    },
  });

  revalidatePath(`/clubs/${event.clubId}/events/${eventId}`);
  return { success: true, data: registration };
}

export async function checkInToEvent(eventId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const registration = await prisma.eventRegistration.findUnique({
    where: { eventId_userId: { eventId, userId: session.user.id } },
  });
  if (!registration) return { success: false, error: "Not registered for this event" };
  if (registration.checkedInAt) return { success: false, error: "Already checked in" };

  await prisma.eventRegistration.update({
    where: { id: registration.id },
    data: { checkedInAt: new Date() },
  });

  await awardXP(session.user.id, "EVENT_ATTENDED");
  revalidatePath(`/events/${eventId}`);
  return { success: true };
}

export async function rateEvent(
  eventId: string,
  rating: number,
  options?: { enjoyed?: string; improved?: string; wouldReturn?: boolean }
) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  if (rating < 1 || rating > 5) return { success: false, error: "Rating must be between 1 and 5" };

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) return { success: false, error: "Event not found" };

  const existing = await prisma.eventRating.findUnique({
    where: { eventId_userId: { eventId, userId: session.user.id } },
  });
  if (existing) return { success: false, error: "Already rated this event" };

  const eventRating = await prisma.eventRating.create({
    data: {
      eventId,
      userId: session.user.id,
      rating,
      enjoyed: options?.enjoyed,
      improved: options?.improved,
      wouldReturn: options?.wouldReturn ?? true,
    },
  });

  const avgRating = await prisma.eventRating.aggregate({
    where: { eventId },
    _avg: { rating: true },
  });

  await prisma.event.update({
    where: { id: eventId },
    data: { avgRating: avgRating._avg.rating },
  });

  revalidatePath(`/clubs/${event.clubId}/events/${eventId}`);
  return { success: true, data: eventRating };
}
