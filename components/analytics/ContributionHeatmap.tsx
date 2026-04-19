"use client";

import { useMemo } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ContributionDay {
  date: string;
  count: number;
}

interface ContributionHeatmapProps {
  data: ContributionDay[];
  className?: string;
}

const LEVELS = [
  "bg-muted",
  "bg-green-500/30 dark:bg-green-500/30",
  "bg-green-500/50 dark:bg-green-500/50",
  "bg-green-500/70 dark:bg-green-500/70",
  "bg-green-500 dark:bg-green-500",
];

function getLevel(count: number): number {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 8) return 3;
  return 4;
}

export function ContributionHeatmap({ data, className }: ContributionHeatmapProps) {
  const weeks = useMemo(() => {
    const dayMap = new Map(data.map((d) => [d.date, d.count]));
    const now = new Date();
    const weeks: { date: string; count: number }[][] = [];
    let currentWeek: { date: string; count: number }[] = [];

    for (let i = 364; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      currentWeek.push({ date: key, count: dayMap.get(key) ?? 0 });
      if (d.getDay() === 6 || i === 0) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    return weeks;
  }, [data]);

  return (
    <TooltipProvider>
      <div className={cn("space-y-2", className)}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Contributions</span>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            Less
            {LEVELS.map((level, i) => (
              <div key={i} className={cn("h-2.5 w-2.5 rounded-sm", level)} />
            ))}
            More
          </div>
        </div>
        <div className="flex gap-[3px] overflow-x-auto pb-1">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((day) => (
                <Tooltip key={day.date}>
                  <TooltipTrigger asChild>
                    <div
                      className={cn("h-2.5 w-2.5 rounded-sm transition-colors", LEVELS[getLevel(day.count)])}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    {day.count} contribution{day.count !== 1 ? "s" : ""} on {day.date}
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}
