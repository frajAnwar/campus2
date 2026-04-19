"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { getUserActivity } from "@/actions/user";
import { cn } from "@/lib/utils";

export function ContributionHeatmap({ userId }: { userId: string }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const result = await getUserActivity(userId);
      if (result.success) setData(result.data);
      setLoading(false);
    };
    fetch();
  }, [userId]);

  if (loading) return (
    <div className="h-48 w-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-[2rem]" />
  );

  // Simple heatmap logic for last 20 weeks
  const today = new Date();
  const weeks = 24;
  const daysInWeek = 7;
  const totalDays = weeks * daysInWeek;
  
  const dates = Array.from({ length: totalDays }).map((_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - (totalDays - 1 - i));
    return d.toISOString().split('T')[0];
  });

  const getColor = (count: number) => {
    if (count === 0) return "bg-slate-100 dark:bg-slate-800";
    if (count < 2) return "bg-primary/20";
    if (count < 4) return "bg-primary/40";
    if (count < 6) return "bg-primary/60";
    return "bg-primary";
  };

  return (
    <Card className="border-none shadow-sm ring-1 ring-border/50 overflow-hidden rounded-[2rem]">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          Learning Contributions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-1 mt-2">
          {dates.map((date) => {
            const count = data.find(d => d.date === date)?.count || 0;
            return (
              <div 
                key={date}
                title={`${date}: ${count} activities`}
                className={cn(
                  "size-3 rounded-sm transition-all hover:scale-125",
                  getColor(count)
                )}
              />
            );
          })}
        </div>
        <div className="flex items-center justify-between mt-6">
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Last 6 Months</p>
          <div className="flex items-center gap-1.5">
             <span className="text-[10px] text-muted-foreground">Less</span>
             <div className="size-2 rounded-sm bg-slate-100 dark:bg-slate-800" />
             <div className="size-2 rounded-sm bg-primary/20" />
             <div className="size-2 rounded-sm bg-primary/60" />
             <div className="size-2 rounded-sm bg-primary" />
             <span className="text-[10px] text-muted-foreground">More</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
