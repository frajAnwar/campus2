import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

  // Trending is based on recent activity (e.g., most commented/voted in last 7 days)
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);

  const [trendingPosts, activeClubs, upcomingEvents] = await Promise.all([
    prisma.post.findMany({
      where: {
        visibility: "PUBLIC",
        createdAt: { gte: lastWeek },
      },
      include: { 
        author: { select: { name: true, username: true, image: true } },
        _count: { select: { comments: true, votes: true } }
      },
      orderBy: [
        { votes: { _count: "desc" } },
        { comments: { _count: "desc" } }
      ],
      take: 4,
    }),
    prisma.club.findMany({
      where: { isActive: true },
      include: { _count: { select: { members: true } } },
      orderBy: { members: { _count: "desc" } },
      take: 4,
    }),
    prisma.event.findMany({
      where: { date: { gte: new Date() } },
      include: { club: { select: { name: true } } },
      orderBy: { date: "asc" },
      take: 3,
    }),
  ]);

  return NextResponse.json({ trendingPosts, activeClubs, upcomingEvents });
}
