import Link from "next/link";
import { Star, Eye } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/shared/Avatar";
import { TechTag } from "@/components/projects/TechTag";
import { cn, truncate } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400",
  PUBLISHED: "bg-green-500/15 text-green-600 dark:text-green-400",
  ARCHIVED: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
};

interface ProjectCardProps {
  project: {
    id: string;
    title: string;
    description: string;
    imageUrl?: string | null;
    techTags: string[];
    status: string;
    viewCount: number;
    owner: {
      name: string;
      image?: string | null;
    };
    _count: { stars: number };
    isStarred?: boolean;
  };
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      {project.imageUrl && (
        <img src={project.imageUrl} alt={project.title} className="w-full h-40 object-cover" />
      )}
      {!project.imageUrl && project.techTags.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-1.5 h-40 bg-muted/50 px-4">
          {project.techTags.slice(0, 6).map((tag) => (
            <TechTag key={tag} tech={tag} />
          ))}
        </div>
      )}
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/projects/${project.id}`} className="group">
            <h3 className="text-sm font-semibold group-hover:text-primary transition-colors">
              {project.title}
            </h3>
          </Link>
          <Badge
            variant="secondary"
            className={cn("text-[10px] px-1.5 py-0 shrink-0", STATUS_STYLES[project.status] ?? "")}
          >
            {project.status}
          </Badge>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          {truncate(project.description, 150)}
        </p>

        {project.techTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {project.techTags.slice(0, 4).map((tag) => (
              <TechTag key={tag} tech={tag} />
            ))}
            {project.techTags.length > 4 && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                +{project.techTags.length - 4}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar src={project.owner.image} name={project.owner.name} size="sm" />
          <span className="text-xs font-medium">{project.owner.name}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Star className={cn("h-3 w-3", project.isStarred && "text-amber-500 fill-amber-500")} />
            {project._count.stars}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {project.viewCount}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}
