import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TechTagProps {
  tech: string;
  className?: string;
}

const TECH_COLORS: Record<string, string> = {
  react: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400",
  nextjs: "bg-zinc-800/50 text-zinc-300 dark:text-zinc-300",
  typescript: "bg-blue-600/15 text-blue-600 dark:text-blue-400",
  javascript: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400",
  python: "bg-green-500/15 text-green-600 dark:text-green-400",
  node: "bg-green-600/15 text-green-700 dark:text-green-400",
  tailwindcss: "bg-teal-500/15 text-teal-600 dark:text-teal-400",
  postgresql: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400",
  mongodb: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  prisma: "bg-slate-500/15 text-slate-600 dark:text-slate-400",
  docker: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
  rust: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
  go: "bg-cyan-600/15 text-cyan-700 dark:text-cyan-400",
  java: "bg-red-500/15 text-red-600 dark:text-red-400",
  csharp: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  flutter: "bg-blue-400/15 text-blue-500 dark:text-blue-400",
  vue: "bg-emerald-400/15 text-emerald-500 dark:text-emerald-400",
  angular: "bg-red-400/15 text-red-500 dark:text-red-400",
};

const DEFAULT_COLOR = "bg-purple-500/15 text-purple-600 dark:text-purple-400";

export function TechTag({ tech, className }: TechTagProps) {
  const key = tech.toLowerCase().replace(/[^a-z0-9]/g, "");
  const color = TECH_COLORS[key] ?? DEFAULT_COLOR;

  return (
    <Badge
      variant="secondary"
      className={cn("text-[10px] px-1.5 py-0", color, className)}
    >
      {tech}
    </Badge>
  );
}
