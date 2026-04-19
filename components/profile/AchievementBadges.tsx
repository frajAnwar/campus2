import { cn } from "@/lib/utils";
import {
  Trophy,
  Star,
  Flame,
  MessageSquare,
  ThumbsUp,
  BookOpen,
  Code,
  Users,
  Award,
  Zap,
  Target,
  Crown,
} from "lucide-react";

const ACHIEVEMENT_CONFIG: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; label: string }> = {
  FIRST_POST: { icon: MessageSquare, color: "bg-blue-500/15 text-blue-500", label: "First Post" },
  FIRST_COMMENT: { icon: MessageSquare, color: "bg-green-500/15 text-green-500", label: "First Comment" },
  TEN_POSTS: { icon: BookOpen, color: "bg-purple-500/15 text-purple-500", label: "10 Posts" },
  FIFTY_POSTS: { icon: BookOpen, color: "bg-violet-500/15 text-violet-500", label: "50 Posts" },
  ACCEPTED_ANSWER: { icon: ThumbsUp, color: "bg-emerald-500/15 text-emerald-500", label: "Accepted Answer" },
  FIVE_ACCEPTED: { icon: Award, color: "bg-amber-500/15 text-amber-500", label: "5 Accepted" },
  EARLY_BIRD: { icon: Zap, color: "bg-orange-500/15 text-orange-500", label: "Early Bird" },
  STREAK_7: { icon: Flame, color: "bg-red-500/15 text-red-500", label: "7-Day Streak" },
  STREAK_30: { icon: Flame, color: "bg-red-500/15 text-red-500", label: "30-Day Streak" },
  STREAK_100: { icon: Flame, color: "bg-red-500/15 text-red-500", label: "100-Day Streak" },
  HELPER: { icon: Users, color: "bg-teal-500/15 text-teal-500", label: "Helper" },
  CONTRIBUTOR: { icon: Code, color: "bg-cyan-500/15 text-cyan-500", label: "Contributor" },
  STAR_COLLECTOR: { icon: Star, color: "bg-yellow-500/15 text-yellow-500", label: "Star Collector" },
  CHAMPION: { icon: Trophy, color: "bg-amber-500/15 text-amber-500", label: "Champion" },
  TOP_10: { icon: Target, color: "bg-indigo-500/15 text-indigo-500", label: "Top 10" },
  LEGEND: { icon: Crown, color: "bg-red-500/15 text-red-500", label: "Legend" },
};

interface Achievement {
  key: string;
  earnedAt?: Date | string | null;
}

interface AchievementBadgesProps {
  achievements: Achievement[];
  className?: string;
}

export function AchievementBadges({ achievements, className }: AchievementBadgesProps) {
  if (achievements.length === 0) return null;

  return (
    <div className={cn("grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3", className)}>
      {achievements.map((ach) => {
        const config = ACHIEVEMENT_CONFIG[ach.key];
        if (!config) return null;
        const Icon = config.icon;
        const earned = !!ach.earnedAt;

        return (
          <div
            key={ach.key}
            className={cn(
              "flex flex-col items-center gap-1.5 rounded-lg border p-3 text-center transition-colors",
              earned ? "bg-card" : "opacity-40 grayscale"
            )}
            title={config.label}
          >
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-full", config.color)}>
              <Icon className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-medium leading-tight">{config.label}</span>
          </div>
        );
      })}
    </div>
  );
}
