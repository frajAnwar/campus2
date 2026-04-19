import { Rank } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const RANK_COLORS: Record<Rank, string> = {
  LURKER: "bg-zinc-500/20 text-zinc-400",
  FRESHMAN: "bg-green-500/20 text-green-400",
  SCHOLAR: "bg-blue-500/20 text-blue-400",
  CONTRIBUTOR: "bg-violet-500/20 text-violet-400",
  COLLABORATOR: "bg-purple-500/20 text-purple-400",
  MENTOR: "bg-amber-500/20 text-amber-400",
  PIONEER: "bg-orange-500/20 text-orange-400",
  LEGEND: "bg-red-500/20 text-red-400",
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
  rank: Rank;
  className?: string;
}

export function RankBadge({ rank, className }: Props) {
  return (
    <Badge
      variant="secondary"
      className={cn(RANK_COLORS[rank], "text-xs font-medium", className)}
    >
      {RANK_LABELS[rank]}
    </Badge>
  );
}
