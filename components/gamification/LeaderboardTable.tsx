"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/shared/Avatar";
import { RankBadge } from "@/components/gamification/RankBadge";
import { cn } from "@/lib/utils";
import type { Rank } from "@prisma/client";

interface LeaderboardEntry {
  id: string;
  name: string;
  username?: string;
  image?: string | null;
  rank: Rank;
  xp: number;
  university?: string;
  currentStreak: number;
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

const MEDALS = ["🥇", "🥈", "🥉"];

export function LeaderboardTable({ entries, page = 1, totalPages = 1, onPageChange }: LeaderboardTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Leaderboard</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground w-16">Rank</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">User</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Rank</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">XP</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground hidden md:table-cell">University</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Streak</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, i) => {
                const rank = (page - 1) * 20 + i + 1;
                return (
                  <tr key={entry.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-2.5">
                      <span className={cn("text-sm", rank <= 3 ? "text-lg" : "text-muted-foreground")}>
                        {rank <= 3 ? MEDALS[rank - 1] : rank}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <Avatar src={entry.image} name={entry.name} size="sm" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{entry.name}</p>
                          {entry.username && (
                            <p className="text-xs text-muted-foreground truncate">@{entry.username}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <RankBadge rank={entry.rank} className="text-[10px]" />
                    </td>
                    <td className="px-4 py-2.5 text-right font-medium tabular-nums">
                      {entry.xp.toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground hidden md:table-cell">
                      {entry.university}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <span className={cn("text-xs font-medium", entry.currentStreak > 0 && "text-orange-500")}>
                        {entry.currentStreak > 0 && "🔥 "}{entry.currentStreak}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <span className="text-xs text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon-xs"
                disabled={page <= 1}
                onClick={() => onPageChange?.(page - 1)}
              >
                <ChevronLeft className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="icon-xs"
                disabled={page >= totalPages}
                onClick={() => onPageChange?.(page + 1)}
              >
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
