import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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
  Flame,
} from "lucide-react";
import Link from "next/link";

type SearchParams = Promise<{ status?: string; type?: string }>;

export default async function CompetitionsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await auth();
  if (!session?.user) return null;

  const params = await searchParams;
  const status = params.status || "";
  const type = params.type || "";

  const where = {
    ...(status ? { status: status as any } : {}),
    ...(type ? { type: type as any } : {}),
  };

  const competitions = await prisma.competition.findMany({
    where: {
      ...where,
      clubId: null, // Only show global competitions (not club-exclusive)
    },
    include: {
      organizer: {
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
        },
      },
      university: {
        select: { name: true, slug: true },
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
        <h1 className="text-2xl font-display font-bold">Competitions</h1>
      </div>

      <Card>
        <CardContent className="py-12 text-center">
          <Trophy className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Competitions are now club-based</h3>
          <p className="text-muted-foreground mb-4">
            All competitions are now managed within clubs. Visit any club page to view and participate in club competitions.
          </p>
          <Link href="/clubs">
            <Button>
              Browse Clubs
            </Button>
          </Link>
        </CardContent>
      </Card>

        <div className="flex flex-wrap gap-2">
          <Link href="/competitions">
            <Badge variant={!status ? "default" : "secondary"} className="cursor-pointer">
              All Statuses
            </Badge>
          </Link>
          {statusOptions.map((s) => (
            <Link key={s} href={`/competitions?status=${s}${type ? `&type=${type}` : ""}`}>
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
          <Link href={`/competitions${status ? `?status=${status}` : ""}`}>
            <Badge variant={!type ? "default" : "secondary"} className="cursor-pointer">
              All Types
            </Badge>
          </Link>
           {typeOptions.map((t) => (
             <Link key={t} href={`/competitions?${status ? `status=${status}&` : ""}type=${t}`}>
               <Badge
                 variant={type === t ? "default" : "secondary"}
                 className="cursor-pointer"
               >
                 {t.replace(/_/g, " ")}
               </Badge>
             </Link>
           ))}
         </div>

      {competitions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No competitions found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {competitions.map((comp) => (
            <Link key={comp.id} href={`/competitions/${comp.id}`}>
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
