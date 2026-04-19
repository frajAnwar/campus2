import { prisma } from "@/lib/prisma";
import { sendWeeklyDigest } from "@/lib/resend";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const oneWeekAgo = new Date(Date.now() - 7 * 86400000);

  const users = await prisma.user.findMany({
    where: { email: { not: undefined } },
    select: {
      id: true,
      name: true,
      email: true,
      xp: true,
      rank: true,
      universityId: true,
      currentStreak: true,
    },
    take: 1000,
  });

  const topPost = await prisma.post.findFirst({
    where: { visibility: "PUBLIC", createdAt: { gte: oneWeekAgo } },
    orderBy: { votes: { _count: "desc" } },
    select: { id: true, title: true },
  });

  await Promise.all(
    users.map((user) =>
      sendWeeklyDigest({
        to: user.email!,
        name: user.name,
        xp: user.xp,
        rank: user.rank,
        streak: user.currentStreak,
        topPostTitle: topPost?.title,
        topPostId: topPost?.id,
      }).catch(console.error)
    )
  );

  return Response.json({ sent: users.length });
}
