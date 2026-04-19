import { RANK_THRESHOLDS } from "@/lib/xp";
import { Rank } from "@prisma/client";
import { cn } from "@/lib/utils";

const RANK_COLORS_GRADIENT: Record<Rank, string> = {
  LURKER: "from-zinc-400 to-zinc-500",
  FRESHMAN: "from-emerald-400 to-emerald-600",
  SCHOLAR: "from-blue-400 to-blue-600",
  CONTRIBUTOR: "from-indigo-400 to-indigo-600",
  COLLABORATOR: "from-purple-500 to-purple-700",
  MENTOR: "from-amber-400 to-amber-600",
  PIONEER: "from-orange-400 to-orange-600",
  LEGEND: "from-red-500 to-rose-600",
};

const RANK_LABELS: Record<Rank, string> = {
  LURKER: "Lurker",
  FRESHMAN: "Freshman",
  SCHOLAR: "Scholar",
  CONTRIBUTOR: "Contributor",
  COLLABORATOR: "Collaborator",
  MENTOR: "Mentor",
  PIONEER: "Pioneer",
  LEGEND: "Legend",
};

interface Props {
  xp: number;
  rank: Rank;
  showLabel?: boolean;
}

export function XPBar({ xp, rank, showLabel = true }: Props) {
  const ranks = Object.keys(RANK_THRESHOLDS) as Rank[];
  const currentIndex = ranks.indexOf(rank);
  const nextRank = ranks[currentIndex + 1] as Rank | undefined;

  const currentMin = RANK_THRESHOLDS[rank];
  const nextMin = nextRank ? RANK_THRESHOLDS[nextRank] : currentMin;
  const progress = nextRank
    ? Math.min(100, ((xp - currentMin) / (nextMin - currentMin)) * 100)
    : 100;

  return (
    <div className="space-y-2.5">
      {showLabel && (
        <div className="flex justify-between items-end">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 leading-none mb-1">Level Progress</span>
            <span className="text-sm font-bold tracking-tight">{RANK_LABELS[rank]}</span>
          </div>
          <div className="text-right">
            <span className="text-sm font-black tabular-nums">{xp.toLocaleString()}</span>
            <span className="text-[10px] font-bold text-muted-foreground/60 uppercase ml-1">XP</span>
          </div>
        </div>
      )}
      <div className="relative h-2.5 bg-slate-100 dark:bg-slate-800/50 rounded-full overflow-hidden shadow-inner ring-1 ring-border/5">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-1000 bg-gradient-to-r relative shadow-[0_0_10px_-2px] shadow-primary/20",
            RANK_COLORS_GRADIENT[rank]
          )}
          style={{ width: `${progress}%` }}
        >
          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.2)_50%,transparent_100%)] animate-[shimmer_2s_infinite] -translate-x-full" />
        </div>
      </div>
      {showLabel && nextRank && (
        <div className="flex items-center justify-between">
           <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-tight">
             {(RANK_THRESHOLDS[nextRank] - xp).toLocaleString()} XP to go
           </p>
           <p className="text-[10px] font-black text-primary uppercase tracking-tighter">
             Next: {RANK_LABELS[nextRank]}
           </p>
        </div>
      )}
    </div>
  );
}
