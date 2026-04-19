"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { awardXP } from "@/lib/xp";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { ClubCategory } from "@prisma/client";

const clubSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().max(2000).optional(),
  category: z.nativeEnum(ClubCategory).default("OTHER"),
  socialLinks: z.any().optional(),
  universityId: z.string().optional(),
});

const updateClubSchema = clubSchema.partial();

export async function createClub(input: z.infer<typeof clubSchema>) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const parsed = clubSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.message };

  await prisma.request.create({
    data: {
      userId: session.user.id,
      type: "CLUB_CREATION",
      data: parsed.data as any,
    },
  });

  revalidatePath("/clubs");
  return { success: true, message: "Club creation request submitted for review" };
}

export async function updateClub(clubId: string, input: z.infer<typeof updateClubSchema>) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const parsed = updateClubSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.message };

  const club = await prisma.club.findUnique({ where: { id: clubId } });
  if (!club) return { success: false, error: "Club not found" };

  const membership = await prisma.clubMember.findUnique({
    where: { clubId_userId: { clubId, userId: session.user.id } },
  });

  const isManager =
    club.managerId === session.user.id ||
    membership?.role === "MANAGER" ||
    membership?.role === "OFFICER";

  if (!isManager) return { success: false, error: "Not authorized" };

  const updated = await prisma.club.update({
    where: { id: clubId },
    data: parsed.data,
  });

  revalidatePath(`/clubs/${clubId}`);
  return { success: true, data: updated };
}

export async function joinClub(clubId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const club = await prisma.club.findUnique({ where: { id: clubId } });
  if (!club) return { success: false, error: "Club not found" };
  if (!club.isActive) return { success: false, error: "Club is not active" };

  await prisma.clubMember.upsert({
    where: { clubId_userId: { clubId, userId: session.user.id } },
    create: { clubId, userId: session.user.id, role: "FOLLOWER" },
    update: {},
  });

  await awardXP(session.user.id, "CLUB_JOINED");
  revalidatePath(`/clubs/${clubId}`);
  return { success: true };
}

export async function leaveClub(clubId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const club = await prisma.club.findUnique({ where: { id: clubId } });
  if (!club) return { success: false, error: "Club not found" };

  if (club.managerId === session.user.id) {
    return { success: false, error: "Manager cannot leave. Transfer ownership first." };
  }

  await prisma.clubMember.deleteMany({
    where: { clubId, userId: session.user.id },
  });

  revalidatePath(`/clubs/${clubId}`);
  return { success: true };
}

export async function updateMemberRole(clubId: string, userId: string, role: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const club = await prisma.club.findUnique({ where: { id: clubId } });
  if (!club) return { success: false, error: "Club not found" };

  if (club.managerId !== session.user.id) {
    return { success: false, error: "Only the club manager can update roles" };
  }

  if (userId === session.user.id) {
    return { success: false, error: "Cannot change your own role" };
  }

  await prisma.clubMember.update({
    where: { clubId_userId: { clubId, userId } },
    data: { role },
  });

  revalidatePath(`/clubs/${clubId}`);
  return { success: true };
}
