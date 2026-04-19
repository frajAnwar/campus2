import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/shared/Avatar";
import { timeAgo, truncate } from "@/lib/utils";
import {
  Trophy,
  Users,
  Clock,
  Calendar,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

type Params = Promise<{ competitionId: string }>;

export default async function CompetitionDetailPage({
  params,
}: {
  params: Params;
}) {
  const session = await auth();
  if (!session?.user) return null;

  const { competitionId } = await params;

  const competition = await prisma.competition.findUnique({
    where: { id: competitionId },
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
      registrations: {
        where: { userId: session.user.id },
        select: { id: true },
      },
      submissions: {
        where: { userId: session.user.id },
        select: { id: true },
      },
      rubric: true,
    },
  });

  if (!competition) notFound();

  const isRegistered = competition.registrations.length > 0;
  const hasSubmitted = competition.submissions.length > 0;
  const isOpen =
    competition.status === "REGISTRATION_OPEN" ||
    competition.status === "ACTIVE";

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">
            {competition.title}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline">
              {competition.type.replace(/_/g, " ")}
            </Badge>
            <Badge
              variant={
                competition.status === "REGISTRATION_OPEN"
                  ? "default"
                  : "secondary"
              }
            >
              {competition.status.replace(/_/g, " ")}
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          {competition._count.registrations} registered
        </span>
        <span className="flex items-center gap-1">
          <Trophy className="h-4 w-4" />
          {competition._count.submissions} submissions
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          Organized by{" "}
          <Link
            href={`/profile/${competition.organizer.username}`}
            className="text-foreground font-medium hover:underline"
          >
            {competition.organizer.name}
          </Link>
        </span>
        {competition.university && (
          <Link
            href={`/university/${competition.university.slug}`}
            className="hover:underline"
          >
            {competition.university.name}
          </Link>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap">{competition.description}</p>
        </CardContent>
      </Card>

      {competition.rules && (
        <Card>
          <CardHeader>
            <CardTitle>Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm">{competition.rules}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {competition.prizeDescription && (
          <Card>
            <CardContent className="pt-4">
              <Trophy className="h-4 w-4 text-muted-foreground mb-1" />
              <p className="text-sm font-medium">{competition.prizeDescription}</p>
              <p className="text-xs text-muted-foreground">Prize</p>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardContent className="pt-4">
            <Users className="h-4 w-4 text-muted-foreground mb-1" />
            <p className="text-sm font-medium">
              Max {competition.maxTeamSize} {competition.maxTeamSize === 1 ? "person" : "people"}
            </p>
            <p className="text-xs text-muted-foreground">Team Size</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <CheckCircle2 className="h-4 w-4 text-muted-foreground mb-1" />
            <p className="text-sm font-medium">
              {competition.judgingType.replace(/_/g, " ")}
            </p>
            <p className="text-xs text-muted-foreground">Judging</p>
          </CardContent>
        </Card>
        {competition.submissionsClosesAt && (
          <Card>
            <CardContent className="pt-4">
              <Clock className="h-4 w-4 text-muted-foreground mb-1" />
              <p className="text-sm font-medium">
                {new Date(competition.submissionsClosesAt).toLocaleDateString()}
              </p>
              <p className="text-xs text-muted-foreground">Deadline</p>
            </CardContent>
          </Card>
        )}
      </div>

      {competition.rubric.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Scoring Rubric</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {competition.rubric.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                >
                  <span className="text-sm">{r.criterionName}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      Max: {r.maxScore}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Weight: {r.weight}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-4">
          {hasSubmitted ? (
            <div className="text-center space-y-2">
              <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto" />
              <p className="font-medium">You have submitted your entry</p>
            </div>
          ) : isRegistered ? (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                You&apos;re registered! Submit your entry before the deadline.
              </p>
              <Link href={`/competitions/${competitionId}/submit`}>
                <Button>Submit Entry</Button>
              </Link>
            </div>
          ) : isOpen ? (
            <form
              action={`/api/competitions/${competitionId}/register`}
              method="POST"
              className="flex items-center justify-between"
            >
              <p className="text-sm text-muted-foreground">
                Register to participate in this competition.
              </p>
              <Button type="submit">Register</Button>
            </form>
          ) : (
            <p className="text-center text-sm text-muted-foreground">
              This competition is not accepting registrations.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
