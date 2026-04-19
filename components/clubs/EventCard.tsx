import Link from "next/link";
import { Calendar, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, timeAgo } from "@/lib/utils";

const TYPE_STYLES: Record<string, string> = {
  WORKSHOP: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  SEMINAR: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
  SOCIAL: "bg-green-500/15 text-green-600 dark:text-green-400",
  MEETING: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  COMPETITION: "bg-red-500/15 text-red-600 dark:text-red-400",
  OTHER: "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400",
};

interface EventCardProps {
  event: {
    id: string;
    title: string;
    type: string;
    startDate: Date | string;
    location?: string | null;
    registrationOpen?: boolean;
    clubId: string;
  };
}

export function EventCard({ event }: EventCardProps) {
  const date = new Date(event.startDate);
  const isPast = date < new Date();

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center rounded-lg bg-muted px-3 py-2 shrink-0">
            <span className="text-[10px] uppercase font-medium text-muted-foreground">
              {date.toLocaleDateString("en-US", { month: "short" })}
            </span>
            <span className="text-lg font-bold leading-none">{date.getDate()}</span>
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <Link href={`/clubs/${event.clubId}/events/${event.id}`} className="group">
              <h3 className="text-sm font-semibold group-hover:text-primary transition-colors">
                {event.title}
              </h3>
            </Link>
            <Badge
              variant="secondary"
              className={cn("text-[10px] px-1.5 py-0", TYPE_STYLES[event.type] ?? TYPE_STYLES.OTHER)}
            >
              {event.type}
            </Badge>
          </div>
        </div>

        {event.location && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {event.location}
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
          </div>
          {event.registrationOpen && !isPast ? (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              Open
            </Badge>
          ) : isPast ? (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-zinc-500/15 text-zinc-600 dark:text-zinc-400">
              Past
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-red-500/15 text-red-600 dark:text-red-400">
              Closed
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
