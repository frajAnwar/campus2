"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, CalendarDays, LogIn } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, truncate } from "@/lib/utils";
import { toast } from "sonner";

const CATEGORY_STYLES: Record<string, string> = {
  TECH: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  ARTS: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
  SPORTS: "bg-green-500/15 text-green-600 dark:text-green-400",
  SCIENCE: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  CULTURE: "bg-pink-500/15 text-pink-600 dark:text-pink-400",
  BUSINESS: "bg-teal-500/15 text-teal-600 dark:text-teal-400",
  OTHER: "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400",
};

interface ClubCardProps {
  club: {
    id: string;
    name: string;
    logoUrl?: string | null;
    category: string;
    description: string;
    _count: { members: number; events: number };
    isMember?: boolean;
  };
  onJoin?: (clubId: string) => Promise<{ success: boolean; error?: string }>;
}

export function ClubCard({ club, onJoin }: ClubCardProps) {
  const [joining, setJoining] = useState(false);
  const [isMember, setIsMember] = useState(club.isMember ?? false);

  const handleJoin = async () => {
    if (!onJoin) return;
    setJoining(true);
    const result = await onJoin(club.id);
    setJoining(false);
    if (result.success) {
      setIsMember(true);
    } else {
      toast.error(result.error);
    }
  };

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          {club.logoUrl ? (
            <img src={club.logoUrl} alt={club.name} className="h-12 w-12 rounded-lg object-cover shrink-0" />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-lg font-bold shrink-0">
              {club.name.charAt(0)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <Link href={`/clubs/${club.id}`} className="group">
              <h3 className="text-sm font-semibold group-hover:text-primary transition-colors">
                {club.name}
              </h3>
            </Link>
            <Badge
              variant="secondary"
              className={cn("text-[10px] px-1.5 py-0 mt-1", CATEGORY_STYLES[club.category] ?? CATEGORY_STYLES.OTHER)}
            >
              {club.category}
            </Badge>
          </div>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          {truncate(club.description, 120)}
        </p>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {club._count.members} members
          </span>
          <span className="flex items-center gap-1">
            <CalendarDays className="h-3 w-3" />
            {club._count.events} events
          </span>
        </div>
      </CardContent>
      <CardFooter>
        {isMember ? (
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link href={`/clubs/${club.id}`}>View Club</Link>
          </Button>
        ) : (
          <Button size="sm" className="w-full gap-1.5" onClick={handleJoin} disabled={joining}>
            <LogIn className="h-3.5 w-3.5" />
            {joining ? "Joining..." : "Join Club"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
