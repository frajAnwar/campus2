import Link from "next/link";
import { Calendar, Users, Trophy } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  UPCOMING: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  REGISTRATION_OPEN: "bg-green-500/15 text-green-600 dark:text-green-400",
  IN_PROGRESS: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  COMPLETED: "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400",
  CANCELLED: "bg-red-500/15 text-red-600 dark:text-red-400",
};

const TYPE_STYLES: Record<string, string> = {
  HACKATHON: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  CODING_CHALLENGE: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400",
  DATA_SCIENCE: "bg-teal-500/15 text-teal-600 dark:text-teal-400",
  AI_ML: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
  CYBERSECURITY: "bg-red-500/15 text-red-600 dark:text-red-400",
  DESIGN: "bg-pink-500/15 text-pink-600 dark:text-pink-400",
  OTHER: "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400",
};

interface CompetitionCardProps {
  competition: {
    id: string;
    title: string;
    type: string;
    status: string;
    startDate: Date | string;
    endDate: Date | string;
    teamSize: number;
    isRegistered?: boolean;
  };
}

export function CompetitionCard({ competition }: CompetitionCardProps) {
  const isRegistrationOpen = competition.status === "REGISTRATION_OPEN";

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500 shrink-0" />
            <Link href={`/competitions/${competition.id}`} className="group">
              <h3 className="text-sm font-semibold group-hover:text-primary transition-colors">
                {competition.title}
              </h3>
            </Link>
          </div>
          <Badge
            variant="secondary"
            className={cn("text-[10px] px-1.5 py-0 shrink-0", STATUS_STYLES[competition.status] ?? "")}
          >
            {competition.status.replace(/_/g, " ")}
          </Badge>
        </div>

        <Badge
          variant="outline"
          className={cn("text-[10px] px-1.5 py-0", TYPE_STYLES[competition.type] ?? TYPE_STYLES.OTHER)}
        >
          {competition.type.replace(/_/g, " ")}
        </Badge>

        <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3 w-3" />
            {new Date(competition.startDate).toLocaleDateString()} - {new Date(competition.endDate).toLocaleDateString()}
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="h-3 w-3" />
            {competition.teamSize === 1 ? "Individual" : `Teams of up to ${competition.teamSize}`}
          </span>
        </div>
      </CardContent>
      <CardFooter>
        {competition.isRegistered ? (
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link href={`/competitions/${competition.id}`}>View Details</Link>
          </Button>
        ) : isRegistrationOpen ? (
          <Button asChild size="sm" className="w-full">
            <Link href={`/competitions/${competition.id}`}>Register</Link>
          </Button>
        ) : (
          <Button asChild variant="outline" size="sm" className="w-full" disabled>
            <span>Closed</span>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
