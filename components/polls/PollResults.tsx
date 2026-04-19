import { cn } from "@/lib/utils";

interface PollOption {
  id: string;
  text: string;
  _count?: { votes: number };
}

interface PollResultsProps {
  options: PollOption[];
  totalVotes: number;
  className?: string;
}

export function PollResults({ options, totalVotes, className }: PollResultsProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {options.map((option) => {
        const votes = option._count?.votes ?? 0;
        const pct = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;

        return (
          <div key={option.id} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span>{option.text}</span>
              <span className="text-xs text-muted-foreground tabular-nums">{pct}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
