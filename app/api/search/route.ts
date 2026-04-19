import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");

  if (!q || q.length < 2) {
    return NextResponse.json({ users: [], classes: [], posts: [], clubs: [], projects: [] });
  }

  const [users, classes, posts, clubs, projects] = await Promise.all([
    prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { username: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, name: true, username: true, image: true },
      take: 6,
    }),
    prisma.class.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { subjectTag: { contains: q, mode: "insensitive" } },
        ],
      },
      include: { university: { select: { name: true } } },
      take: 4,
    }),
    prisma.post.findMany({
      where: {
        visibility: "PUBLIC",
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { body: { contains: q, mode: "insensitive" } },
        ],
      },
      include: { 
        author: { select: { name: true } },
        _count: { select: { comments: true } }
      },
      take: 5,
    }),
    prisma.club.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { category: { equals: q as any } },
        ],
      },
      take: 4,
    }),
    prisma.project.findMany({
      where: {
        visibility: "PUBLIC",
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { techTags: { hasSome: [q] } },
        ],
      },
      take: 4,
    }),
  ]);

  return NextResponse.json({ users, classes, posts, clubs, projects });
}
