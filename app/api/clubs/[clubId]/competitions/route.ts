import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createCompetition } from "@/actions/competition";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ clubId: string }> }
) {
  const { clubId } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Verify user is club manager/officer
  const membership = await prisma.clubMember.findUnique({
    where: {
      clubId_userId: {
        clubId: clubId,
        userId: session.user.id,
      },
    },
    select: { role: true },
  });

  if (!membership || !["MANAGER", "OFFICER"].includes(membership.role)) {
    return NextResponse.json(
      { error: "Not authorized to create club competitions" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const result = await createCompetition({
    ...body,
    clubId: clubId,
  });

  if (result.success) {
    return NextResponse.json(result.data);
  } else {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
}
