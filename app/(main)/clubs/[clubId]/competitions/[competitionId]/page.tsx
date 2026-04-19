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
  Calendar,
  Users,
  Clock,
  Calendar as CalendarIcon,
  Award,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

type Params = Promise<{ clubId: string; competitionId: string }>;

export default async function ClubCompetitionDetailPage({ params }: { params: Params }) {
  const session = await auth();
  if (!session?.user) return null;

  const { clubId, competitionId } = await params;

  const competition = await prisma.competition.findUnique({
    where: { id: competitionId, clubId },
    include: {
      organizer: {
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
        },
      },
      club: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      _count: { select: { registrations: true, submissions: true } },
      registrations: {
        where: { userId: session.user.id },
        take: 1,
      },
    },
  });

  if (!competition) notFound();

  const isRegistered = competition.registrations.length > 0;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Link href={`/clubs/${clubId}/competitions`} className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" />
          Back to competitions
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">{competition.title}</h1>
            <div className="flex items-center gap-3 mt-2">
              <Badge variant="outline">{competition.type.replace(/_/g, " ")}</Badge>
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
          
          {competition.status === "REGISTRATION_OPEN" && (
            <Button disabled={isRegistered}>
              {isRegistered ? "Already Registered" : "Register Now"}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{competition.description}</p>
              
              {competition.rules && (
                <>
                  <h3 className="font-semibold mt-6 mb-2">Rules</h3>
                  <p className="whitespace-pre-wrap text-sm text-muted-foreground">{competition.rules}</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Registration opens: {competition.registrationOpensAt 
                  ? new Date(competition.registrationOpensAt).toLocaleDateString() 
                  : "Not specified"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Submissions close: {competition.submissionsClosesAt 
                  ? new Date(competition.submissionsClosesAt).toLocaleDateString() 
                  : "Not specified"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{competition._count.registrations} participants</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>Max team size: {competition.maxTeamSize}</span>
              </div>
              {competition.prizeDescription && (
                <div className="flex items-center gap-2 text-sm">
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                  <span>Prize: {competition.prizeDescription}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Organizer</CardTitle>
            </CardHeader>
            <CardContent>
              <Link href={`/profile/${competition.organizer.username}`} className="flex items-center gap-3">
                <Avatar 
                  src={competition.organizer.image} 
                  name={competition.organizer.name} 
                  size="md" 
                />
                <div>
                  <p className="font-medium">{competition.organizer.name}</p>
                  <p className="text-sm text-muted-foreground">@{competition.organizer.username}</p>
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
