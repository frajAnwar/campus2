import { Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StreakBadgeProps {
  streak: number;
  className?: string;
}

export function StreakBadge({ streak, className }: StreakBadgeProps) {
  if (streak <= 0) return null;

  const intensity =
    streak >= 100
      ? "bg-red-500/20 text-red-500"
      : streak >= 30
        ? "bg-orange-500/20 text-orange-500"
        : streak >= 7
          ? "bg-amber-500/20 text-amber-500"
          : "bg-zinc-500/20 text-zinc-500";

  return (
    <Badge variant="secondary" className={cn("gap-1 text-xs font-medium", intensity, className)}>
      <Flame className={cn("h-3 w-3", streak >= 7 && "animate-pulse")} />
      {streak} day{streak !== 1 ? "s" : ""}
    </Badge>
  );
}
