import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/shared/Avatar";
import { timeAgo, truncate } from "@/lib/utils";
import {
  Trophy,
  Calendar,
  Users,
  Clock,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { canSeeNav } from "@/lib/navigation";

type Params = Promise<{ clubId: string }>;
type SearchParams = Promise<{ status?: string; type?: string }>;

export default async function ClubCompetitionsPage({ 
  params, 
  searchParams 
}: { 
  params: Params; 
  searchParams: SearchParams;
}) {
  const session = await auth();
  if (!session?.user) return null;

  const { clubId } = await params;
  const sp = await searchParams;
  const status = sp.status || "";
  const type = sp.type || "";

  const club = await prisma.club.findUnique({
    where: { id: clubId },
    include: {
      members: {
        where: { userId: session.user.id },
        select: { role: true },
      },
    },
  });

  if (!club) notFound();

  const isMember = club.members.length > 0;
  const isManager = club.members.some(m => m.role === "MANAGER" || m.role === "OFFICER");

  const where = {
    clubId,
    ...(status ? { status: status as any } : {}),
    ...(type ? { type: type as any } : {}),
  };

  const competitions = await prisma.competition.findMany({
    where,
    include: {
      organizer: {
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
        },
      },
      _count: { select: { registrations: true, submissions: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 24,
  });

  const statusOptions = [
    "DRAFT",
    "REGISTRATION_OPEN",
    "ACTIVE",
    "JUDGING",
    "RESULTS_PUBLISHED",
    "ARCHIVED",
  ];
  const typeOptions = [
    "CODING",
    "DESIGN",
    "IDEA_PITCH",
    "ESSAY",
    "HACKATHON",
    "GAMING",
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href={`/clubs/${clubId}`} className="text-sm text-muted-foreground hover:text-primary mb-2 inline-block">
            ← Back to {club.name}
          </Link>
          <h1 className="text-2xl font-display font-bold">Club Competitions</h1>
        </div>
        {isManager && (
          <Link
            href={`/clubs/${clubId}/competitions/new`}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Competition
          </Link>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          <Link href={`/clubs/${clubId}/competitions`}>
            <Badge variant={!status ? "default" : "secondary"} className="cursor-pointer">
              All Statuses
            </Badge>
          </Link>
          {statusOptions.map((s) => (
            <Link key={s} href={`/clubs/${clubId}/competitions?status=${s}${type ? `&type=${type}` : ""}`}>
              <Badge
                variant={status === s ? "default" : "secondary"}
                className="cursor-pointer"
              >
                {s.replace(/_/g, " ")}
              </Badge>
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/clubs/${clubId}/competitions${status ? `?status=${status}` : ""}`}>
            <Badge variant={!type ? "default" : "secondary"} className="cursor-pointer">
              All Types
            </Badge>
          </Link>
          {typeOptions.map((t) => (
            <Link key={t} href={`/clubs/${clubId}/competitions?${status ? `status=${status}&` : ""}type=${t}`}>
              <Badge
                variant={type === t ? "default" : "secondary"}
                className="cursor-pointer"
              >
                {t.replace(/_/g, " ")}
              </Badge>
            </Link>
          ))}
        </div>
      </div>

      {competitions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Trophy className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No competitions found for this club.</p>
            {isManager && (
              <p className="text-sm text-muted-foreground mt-2">
                Create your first club competition to engage members!
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {competitions.map((comp) => (
            <Link key={comp.id} href={`/clubs/${clubId}/competitions/${comp.id}`}>
              <Card className="hover:bg-accent/50 transition-colors h-full">
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="font-medium">{comp.title}</h3>
                    <Badge variant="outline" className="text-xs ml-2 shrink-0">
                      {comp.type.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {truncate(comp.description, 120)}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <Badge
                      variant={
                        comp.status === "REGISTRATION_OPEN"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {comp.status.replace(/_/g, " ")}
                    </Badge>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {comp._count.registrations}
                    </span>
                    {comp.prizeDescription && (
                      <span className="flex items-center gap-1">
                        <Trophy className="h-3.5 w-3.5" />
                        {comp.prizeDescription}
                      </span>
                    )}
                  </div>
                  {comp.submissionsClosesAt && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      Deadline:{" "}
                      {new Date(comp.submissionsClosesAt).toLocaleDateString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
