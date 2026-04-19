import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await prisma.announcement.updateMany({
    where: {
      expiresAt: { lte: new Date() },
      publishedAt: { not: null },
    },
    data: { isPinned: false },
  });

  return Response.json({ expired: result.count });
}
