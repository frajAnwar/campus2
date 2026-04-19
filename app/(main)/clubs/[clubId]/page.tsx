import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/shared/Avatar";
import { RankBadge } from "@/components/gamification/RankBadge";
import { timeAgo, truncate } from "@/lib/utils";
import {
  Users,
  Calendar,
  MapPin,
  ExternalLink,
  Globe,
  Clock,
  Trophy,
} from "lucide-react";
import Link from "next/link";

type Params = Promise<{ clubId: string }>;
type SearchParams = Promise<{ tab?: string }>;

export default async function ClubDetailPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const session = await auth();
  if (!session?.user) return null;

  const { clubId } = await params;
  const sp = await searchParams;
  const tab = sp.tab || "about";

  const club = await prisma.club.findUnique({
    where: { id: clubId },
    include: {
      manager: {
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
          rank: true,
        },
      },
      _count: { select: { members: true, events: true } },
      members: {
        where: { userId: session.user.id },
        select: { role: true },
      },
    },
  });

  const competitionCount = await prisma.competition.count({
    where: { clubId }
  });

  if (!club) notFound();

  const isMember = club.members.length > 0;
  const memberRole = club.members[0]?.role;
  const isManager =
    club.managerId === session.user.id || memberRole === "OFFICER";

  const events =
    tab === "events"
      ? await prisma.event.findMany({
          where: { clubId },
          orderBy: { date: "asc" },
          take: 10,
        })
      : [];

  const competitions =
    tab === "competitions"
      ? await prisma.competition.findMany({
          where: { clubId },
          orderBy: { createdAt: "desc" },
          take: 10,
        })
      : [];

  const members =
    tab === "members"
      ? await prisma.clubMember.findMany({
          where: { clubId },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
                rank: true,
              },
            },
          },
          take: 30,
        })
      : [];

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        {club.logo ? (
          <img
            src={club.logo}
            alt={club.name}
            className="h-16 w-16 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-xl font-bold">
            {club.name.charAt(0)}
          </div>
        )}
        <div className="flex-1">
          <h1 className="text-2xl font-display font-bold">{club.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline">{club.category}</Badge>
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              {club._count.members} members
            </span>
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {club._count.events} events
            </span>
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Trophy className="h-4 w-4" />
              {competitionCount} competitions
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
            <span>Managed by</span>
            <Link
              href={`/profile/${club.manager.username}`}
              className="font-medium text-foreground hover:underline"
            >
              {club.manager.name}
            </Link>
          </div>
        </div>
        <div className="flex gap-2">
          {isManager && (
            <Link href={`/clubs/${club.id}/manage`}>
              <Button variant="outline" size="sm">
                Manage
              </Button>
            </Link>
          )}
          {!isMember && (
            <form action={`/api/clubs/${club.id}/join`} method="POST">
              <Button type="submit" size="sm">
                Join Club
              </Button>
            </form>
          )}
          {isMember && (
            <Badge variant="secondary">{memberRole}</Badge>
          )}
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {["about", "events", "competitions", "members"].map((t) => (
          <Link
            key={t}
            href={`/clubs/${clubId}?tab=${t}`}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              tab === t
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </Link>
        ))}
      </div>

      {tab === "about" && (
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            {club.description ? (
              <p className="whitespace-pre-wrap">{club.description}</p>
            ) : (
              <p className="text-muted-foreground">No description provided.</p>
            )}
          </CardContent>
        </Card>
      )}

      {tab === "events" && (
        <div className="space-y-3">
          {isManager && (
            <div className="flex justify-end">
              <Link href={`/clubs/${clubId}/events/new`}>
                <Button size="sm">Create Event</Button>
              </Link>
            </div>
          )}
          {events.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No events yet.</p>
                {isManager && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Create your first club event to engage members!
                  </p>
                )}
              </CardContent>
            </Card>
          ) : (
            events.map((event) => (
              <Link key={event.id} href={`/clubs/${clubId}/events/${event.id}`}>
                <Card className="hover:bg-accent/50 transition-colors">
                  <CardContent className="flex items-center gap-4 pt-4">
                    <div className="text-center min-w-[48px]">
                      <div className="text-lg font-bold">
                        {event.date.getDate()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {event.date.toLocaleString("default", { month: "short" })}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium">{event.title}</h3>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
                        <Badge variant="outline">{event.type}</Badge>
                        {event.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {event.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      )}

      {tab === "competitions" && (
        <div className="space-y-3">
          {isManager && (
            <div className="flex justify-end">
              <Link href={`/clubs/${clubId}/competitions/new`}>
                <Button size="sm">Create Competition</Button>
              </Link>
            </div>
          )}
          {competitions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Trophy className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No competitions yet.</p>
                {isManager && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Create your first club competition to engage members!
                  </p>
                )}
              </CardContent>
            </Card>
          ) : (
            competitions.map((comp) => (
              <Link key={comp.id} href={`/clubs/${clubId}/competitions/${comp.id}`}>
                <Card className="hover:bg-accent/50 transition-colors">
                  <CardContent className="flex items-center gap-4 pt-4">
                    <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Trophy className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium">{comp.title}</h3>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
                        <Badge variant="outline">{comp.type}</Badge>
                        <Badge
                          variant={
                            comp.status === "REGISTRATION_OPEN"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {comp.status.replace(/_/g, " ")}
                        </Badge>
                        {comp.submissionsClosesAt && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Deadline: {new Date(comp.submissionsClosesAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      )}

      {tab === "members" && (
        <Card>
          <CardHeader>
            <CardTitle>Members ({club._count.members})</CardTitle>
          </CardHeader>
          <CardContent>
            {members.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No members yet.
              </p>
            ) : (
              <div className="space-y-3">
                {members.map((m) => (
                  <Link
                    key={m.userId}
                    href={`/profile/${m.user.username}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors"
                  >
                    <Avatar
                      src={m.user.image}
                      name={m.user.name}
                      size="md"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{m.user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        @{m.user.username}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {m.role}
                    </Badge>
                    <RankBadge rank={m.user.rank} />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
