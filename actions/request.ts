"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { RequestType, RequestStatus } from "@prisma/client";

export async function createRoleRequest(requestedRole: string, reason: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  try {
    const existing = await prisma.request.findFirst({
      where: {
        userId: session.user.id,
        type: RequestType.ROLE_CHANGE,
        status: RequestStatus.PENDING,
      },
    });

    if (existing) {
      return { success: false, error: "You already have a pending request." };
    }

    await prisma.request.create({
      data: {
        userId: session.user.id,
        type: RequestType.ROLE_CHANGE,
        data: { requestedRole, reason },
      },
    });

    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to create request." };
  }
}

export async function createClubRequest(clubName: string, description: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  try {
    await prisma.request.create({
      data: {
        userId: session.user.id,
        type: RequestType.CLUB_CREATION,
        data: { clubName, description },
      },
    });

    revalidatePath("/clubs");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to create request." };
  }
}

export async function getPendingRequests() {
  const session = await auth();
  if (session?.user?.role !== "PLATFORM_ADMIN") {
    return { success: false, error: "Not authorized" };
  }

  const requests = await prisma.request.findMany({
    where: { status: RequestStatus.PENDING },
    include: { user: { select: { name: true, email: true, username: true } } },
    orderBy: { createdAt: "desc" },
  });

  return { success: true, data: requests };
}

export async function handleRequest(requestId: string, status: RequestStatus, adminNote?: string) {
  const session = await auth();
  if (session?.user?.role !== "PLATFORM_ADMIN") {
    return { success: false, error: "Not authorized" };
  }

  try {
    const request = await prisma.request.findUnique({
      where: { id: requestId },
      include: { user: true },
    });

    if (!request) return { success: false, error: "Request not found" };

    await prisma.$transaction(async (tx) => {
      await tx.request.update({
        where: { id: requestId },
        data: { status, adminNote, updatedAt: new Date() },
      });

      if (status === RequestStatus.APPROVED && request.type === RequestType.ROLE_CHANGE) {
        const data = request.data as any;
        if (data?.requestedRole) {
          await tx.user.update({
            where: { id: request.userId },
            data: { role: data.requestedRole },
          });
        }
      }
      
      // Handle Club Creation approval logic if needed, 
      // or just mark as approved and let admin create it.
    });

    revalidatePath("/admin/requests");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update request." };
  }
}
