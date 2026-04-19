import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/shared/Avatar";
import { timeAgo, truncate } from "@/lib/utils";
import { MessageSquare, ArrowBigUp, Tag } from "lucide-react";
import Link from "next/link";

export default async function FeedPage() {
  const session = await auth();
  if (!session?.user) return null;

  const userId = session.user.id;

  const following = await prisma.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  });
  const followingIds = following.map((f) => f.followingId);

  const memberClasses = await prisma.classMember.findMany({
    where: { userId },
    select: { classId: true },
  });
  const classIds = memberClasses.map((m) => m.classId);

  const memberClubs = await prisma.clubMember.findMany({
    where: { userId },
    select: { clubId: true },
  });
  const clubIds = memberClubs.map((m) => m.clubId);

  const posts = await prisma.post.findMany({
    where: {
      OR: [
        { authorId: { in: followingIds } },
        { classId: { in: classIds } },
        { tags: { hasSome: [] } },
      ],
      visibility: { in: ["PUBLIC", "UNIVERSITY"] },
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
          rank: true,
        },
      },
      _count: { select: { comments: true, votes: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  const tags = await prisma.post.findMany({
    where: {
      OR: [
        { authorId: { in: followingIds } },
        { classId: { in: classIds } },
      ],
    },
    select: { tags: true },
    take: 100,
  });
  const allTags = [...new Set(tags.flatMap((t) => t.tags))].slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">Activity Feed</h1>
      </div>

      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {allTags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              <Tag className="h-3 w-3" />
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {posts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Your feed is empty. Follow users, join classes, or follow clubs to see activity here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <Link key={post.id} href={`/forum/${post.id}`}>
              <Card className="hover:bg-accent/50 transition-colors">
                <CardContent className="flex items-start gap-3 pt-4">
                  <Avatar
                    src={post.author.image}
                    name={post.author.name}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {post.author.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {timeAgo(post.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm font-medium mt-0.5">
                      {truncate(post.title, 100)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {truncate(post.body, 150)}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <ArrowBigUp className="h-3.5 w-3.5" />
                        {post._count.votes}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MessageSquare className="h-3.5 w-3.5" />
                        {post._count.comments}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {post.type}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
