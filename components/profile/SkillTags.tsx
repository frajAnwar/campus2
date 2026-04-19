import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SkillTagsProps {
  skills: string[];
  className?: string;
}

export function SkillTags({ skills, className }: SkillTagsProps) {
  if (skills.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {skills.map((skill) => (
        <Badge key={skill} variant="secondary" className="text-xs">
          {skill}
        </Badge>
      ))}
    </div>
  );
}
