import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TagBadgeProps {
  tag: string;
  href?: string;
  className?: string;
}

const TAG_COLORS = [
  "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  "bg-green-500/15 text-green-600 dark:text-green-400",
  "bg-purple-500/15 text-purple-600 dark:text-purple-400",
  "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  "bg-pink-500/15 text-pink-600 dark:text-pink-400",
  "bg-teal-500/15 text-teal-600 dark:text-teal-400",
  "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400",
  "bg-orange-500/15 text-orange-600 dark:text-orange-400",
];

function getTagColor(tag: string): string {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length];
}

export function TagBadge({ tag, href, className }: TagBadgeProps) {
  const color = getTagColor(tag);

  const badge = (
    <Badge
      variant="secondary"
      className={cn("text-[10px] px-1.5 py-0", color, className)}
    >
      {tag}
    </Badge>
  );

  if (href) {
    return (
      <Link href={href} className="hover:opacity-80 transition-opacity">
        {badge}
      </Link>
    );
  }

  return badge;
}
