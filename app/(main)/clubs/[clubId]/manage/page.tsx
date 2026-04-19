import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/shared/Avatar";
import { RankBadge } from "@/components/gamification/RankBadge";
import { timeAgo } from "@/lib/utils";
import {
  Users,
  Calendar,
  Settings,
  Shield,
  Trash2,
  UserPlus,
} from "lucide-react";
import Link from "next/link";

type Params = Promise<{ clubId: string }>;

export default async function ClubManagePage({
  params,
}: {
  params: Params;
}) {
  const session = await auth();
  if (!session?.user) return redirect("/login");

  const { clubId } = await params;

  const club = await prisma.club.findUnique({
    where: { id: clubId },
    include: {
      manager: {
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
        },
      },
      members: {
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
        orderBy: { joinedAt: "desc" },
      },
      events: {
        orderBy: { date: "desc" },
        take: 5,
        include: {
          _count: { select: { registrations: true } },
        },
      },
      _count: { select: { members: true, events: true } },
    },
  });

  if (!club) notFound();

  const isManager =
    club.managerId === session.user.id ||
    club.members.find(
      (m) => m.userId === session.user.id && m.role === "OFFICER"
    );

  if (!isManager) {
    redirect(`/clubs/${clubId}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">
            Manage: {club.name}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Club management dashboard
          </p>
        </div>
        <Link href={`/clubs/${clubId}`}>
          <Button variant="outline" size="sm">
            View Club
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">
                {club._count.members}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Members</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">
                {club._count.events}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Events</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold capitalize">
                {club.category}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Category</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Members</CardTitle>
          <span className="text-sm text-muted-foreground">
            {club._count.members} total
          </span>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {club.members.map((m) => (
              <div
                key={m.userId}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors"
              >
                <Avatar src={m.user.image} name={m.user.name} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{m.user.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Joined {timeAgo(m.joinedAt)}
                  </p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {m.role}
                </Badge>
                <RankBadge rank={m.user.rank} />
                {m.userId !== club.managerId && (
                  <form
                    action={`/api/clubs/${clubId}/members/${m.userId}/role`}
                    method="PATCH"
                  >
                    <Button variant="ghost" size="sm" type="submit">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </form>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Events</CardTitle>
          <Link href={`/clubs/${clubId}/events/new`}>
            <Button size="sm">
              <Calendar className="h-4 w-4 mr-1" />
              New Event
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {club.events.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No events yet.
            </p>
          ) : (
            <div className="space-y-2">
              {club.events.map((event) => (
                <Link
                  key={event.id}
                  href={`/clubs/${clubId}/events/${event.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {event.date.toLocaleDateString()} &middot;{" "}
                      {event._count.registrations} registered
                    </p>
                  </div>
                  <Badge variant="outline">{event.status}</Badge>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
