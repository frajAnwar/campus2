import { Globe, School, GraduationCap, Users, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Visibility } from "@prisma/client";

const VISIBILITY_CONFIG: Record<Visibility, { label: string; icon: React.ComponentType<{ className?: string }>; style: string }> = {
  PUBLIC: { label: "Public", icon: Globe, style: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  UNIVERSITY: { label: "University", icon: School, style: "bg-sky-500/10 text-sky-600 dark:text-sky-400" },
  CLASS: { label: "Class", icon: GraduationCap, style: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" },
  FOLLOWERS: { label: "Followers", icon: Users, style: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
  PRIVATE: { label: "Private", icon: Lock, style: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400" },
};

interface VisibilityBadgeProps {
  visibility: Visibility;
  className?: string;
}

export function VisibilityBadge({ visibility, className }: VisibilityBadgeProps) {
  const config = VISIBILITY_CONFIG[visibility];
  const Icon = config.icon;

  return (
    <Badge variant="secondary" className={cn("text-[10px] px-1.5 py-0 gap-1", config.style, className)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}
