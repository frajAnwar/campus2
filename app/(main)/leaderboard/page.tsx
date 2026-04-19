import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/shared/Avatar";
import { RankBadge } from "@/components/gamification/RankBadge";
import { Flame, Trophy, Medal } from "lucide-react";
import Link from "next/link";

type SearchParams = Promise<{
  tab?: string;
  tag?: string;
  page?: string;
}>;

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await auth();
  if (!session?.user) return null;

  const params = await searchParams;
  const tab = params.tab || "global";
  const tag = params.tag || "";
  const page = parseInt(params.page || "1");
  const pageSize = 25;

  const where =
    tab === "university" && session.user.universityId
      ? { universityId: session.user.universityId }
      : tag
        ? { skills: { some: { skill: tag } } }
        : {};

  let dateFilter = {};
  if (tab === "weekly") {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    dateFilter = {
      activityLogs: {
        some: { createdAt: { gte: weekAgo } },
      },
    };
  }

  const users = await prisma.user.findMany({
    where: { ...where, ...dateFilter },
    select: {
      id: true,
      name: true,
      username: true,
      image: true,
      xp: true,
      rank: true,
      currentStreak: true,
      longestStreak: true,
      university: {
        select: { name: true },
      },
    },
    orderBy: { xp: "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  const totalUsers = await prisma.user.count({ where });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">Leaderboard</h1>
        <Trophy className="h-6 w-6 text-amber-500" />
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { key: "global", label: "Global" },
          { key: "university", label: "University" },
          { key: "weekly", label: "Weekly" },
          { key: "tag", label: "By Tag" },
        ].map((t) => (
          <Link
            key={t.key}
            href={`/leaderboard?tab=${t.key}`}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              tab === t.key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {tab === "tag" && (
        <div className="flex gap-2">
          <input
            name="tag"
            placeholder="Filter by skill tag..."
            defaultValue={tag}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            formAction=""
          />
        </div>
      )}

      <Card>
        <CardContent className="pt-4">
          {users.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No users found.
            </p>
          ) : (
            <div className="space-y-1">
              {users.map((user, i) => {
                const rank = (page - 1) * pageSize + i + 1;
                return (
                  <Link
                    key={user.id}
                    href={`/profile/${user.username}`}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="w-8 text-center font-bold text-lg">
                      {rank <= 3 ? (
                        <Medal
                          className={`h-5 w-5 mx-auto ${
                            rank === 1
                              ? "text-amber-500"
                              : rank === 2
                                ? "text-gray-400"
                                : "text-amber-700"
                          }`}
                        />
                      ) : (
                        <span className="text-muted-foreground">{rank}</span>
                      )}
                    </div>
                    <Avatar src={user.image} name={user.name} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{user.name}</p>
                      <div className="flex items-center gap-2">
                        <RankBadge rank={user.rank} />
                        {user.university && (
                          <span className="text-xs text-muted-foreground">
                            {user.university.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">
                        {user.xp.toLocaleString()} XP
                      </p>
                      {user.currentStreak > 0 && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground justify-end">
                          <Flame className="h-3 w-3 text-orange-500" />
                          {user.currentStreak}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {totalUsers > pageSize && (
        <div className="flex justify-center gap-2">
          {page > 1 && (
            <Link
              href={`/leaderboard?tab=${tab}${tag ? `&tag=${tag}` : ""}&page=${page - 1}`}
            >
              <Badge variant="secondary" className="cursor-pointer">
                Previous
              </Badge>
            </Link>
          )}
          <span className="text-sm text-muted-foreground">
            Page {page} of {Math.ceil(totalUsers / pageSize)}
          </span>
          {page * pageSize < totalUsers && (
            <Link
              href={`/leaderboard?tab=${tab}${tag ? `&tag=${tag}` : ""}&page=${page + 1}`}
            >
              <Badge variant="secondary" className="cursor-pointer">
                Next
              </Badge>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
