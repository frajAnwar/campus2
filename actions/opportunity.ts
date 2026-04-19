"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { OpportunityType } from "@prisma/client";

const opportunitySchema = z.object({
  type: z.nativeEnum(OpportunityType),
  title: z.string().min(3).max(200),
  description: z.string().min(10),
  field: z.string().optional(),
  deadline: z.string().optional(),
  universityId: z.string().optional(),
  isRemote: z.boolean().default(false),
  isPaid: z.boolean().default(false),
  applyUrl: z.string().optional(),
  expiresAt: z.string().optional(),
});

export async function createOpportunity(input: z.infer<typeof opportunitySchema>) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  if (
    !["EDUCATOR", "UNIVERSITY_ADMIN", "PLATFORM_ADMIN", "CLUB_MANAGER"].includes(
      session.user.role ?? ""
    )
  ) {
    return { success: false, error: "Not authorized to post opportunities" };
  }

  const parsed = opportunitySchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.message };

  const opportunity = await prisma.opportunity.create({
    data: {
      ...parsed.data,
      authorId: session.user.id,
      deadline: parsed.data.deadline ? new Date(parsed.data.deadline) : undefined,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : undefined,
    },
  });

  revalidatePath("/opportunities");
  return { success: true, data: opportunity };
}

export async function getOpportunities(options?: {
  type?: string;
  universityId?: string;
  cursor?: string;
  limit?: number;
}) {
  const { type, universityId, cursor, limit = 20 } = options ?? {};

  const where: any = {};
  if (type) where.type = type;
  if (universityId) where.universityId = universityId;

  const opportunities = await prisma.opportunity.findMany({
    where,
    take: limit + 1,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      author: {
        select: { id: true, name: true, username: true, image: true },
      },
    },
  });

  let nextCursor: string | undefined;
  if (opportunities.length > limit) {
    const nextItem = opportunities.pop();
    nextCursor = nextItem!.id;
  }

  return { success: true, data: { items: opportunities, nextCursor, hasMore: !!nextCursor } };
}

export async function deleteOpportunity(opportunityId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const opportunity = await prisma.opportunity.findUnique({
    where: { id: opportunityId },
  });
  if (!opportunity) return { success: false, error: "Opportunity not found" };

  const canDelete =
    opportunity.authorId === session.user.id ||
    ["PLATFORM_ADMIN", "UNIVERSITY_ADMIN"].includes(session.user.role ?? "");

  if (!canDelete) return { success: false, error: "Not authorized" };

  await prisma.opportunity.delete({ where: { id: opportunityId } });
  revalidatePath("/opportunities");
  return { success: true };
}
