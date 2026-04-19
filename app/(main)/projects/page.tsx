import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/shared/Avatar";
import { truncate } from "@/lib/utils";
import { Star, GitBranch, ExternalLink } from "lucide-react";
import Link from "next/link";

type SearchParams = Promise<{ tab?: string; tech?: string; sort?: string }>;

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await auth();
  if (!session?.user) return null;

  const params = await searchParams;
  const tab = params.tab || "explore";
  const tech = params.tech;
  const sort = params.sort || "recent";
  const userId = session.user.id;

  const where =
    tab === "my"
      ? {
          OR: [
            { ownerId: userId },
            { collaborators: { some: { userId } } },
          ],
        }
      : tab === "starred"
        ? { stars: { some: { userId } } }
        : { visibility: "PUBLIC" };

  const techFilter = tech ? { techTags: { has: tech } } : {};

  const orderBy =
    sort === "stars"
      ? ({ stars: { _count: "desc" } } as const)
      : sort === "views"
        ? ({ viewCount: "desc" } as const)
        : ({ createdAt: "desc" } as const);

  const projects = await prisma.project.findMany({
    where: { ...where, ...techFilter } as any,
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
          rank: true,
        },
      },
      _count: { select: { stars: true, comments: true } },
      stars: { where: { userId }, select: { userId: true } },
    },
    orderBy,
    take: 24,
  });

  const allTechs = await prisma.project.findMany({
    where: { visibility: "PUBLIC" },
    select: { techTags: true },
    take: 200,
  });
  const techOptions = [...new Set(allTechs.flatMap((p) => p.techTags))].slice(
    0,
    20
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">Projects</h1>
        <Link
          href="/projects/new"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          New Project
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {["explore", "my", "starred"].map((t) => (
          <Link
            key={t}
            href={`/projects?tab=${t}${tech ? `&tech=${tech}` : ""}${sort ? `&sort=${sort}` : ""}`}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              tab === t
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "explore" ? "Explore" : t === "my" ? "My Projects" : "Starred"}
          </Link>
        ))}
      </div>

      {techOptions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {techOptions.map((t) => (
            <Link
              key={t}
              href={`/projects?tab=${tab}&tech=${tech === t ? "" : t}&sort=${sort}`}
            >
              <Badge
                variant={tech === t ? "default" : "secondary"}
                className="cursor-pointer"
              >
                {t}
              </Badge>
            </Link>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        {["recent", "stars", "views"].map((s) => (
          <Link
            key={s}
            href={`/projects?tab=${tab}${tech ? `&tech=${tech}` : ""}&sort=${s}`}
            className={`text-xs px-2 py-1 rounded ${
              sort === s
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </Link>
        ))}
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No projects found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="hover:bg-accent/50 transition-colors h-full">
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium truncate">{project.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        by {(project as any).author?.name || "Student"}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs ml-2 shrink-0">
                      {project.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {truncate(project.description, 120)}
                  </p>
                  {project.techTags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {project.techTags.slice(0, 4).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5" />
                      {(project as any)._count?.stars ?? 0}
                    </span>
                    {project.githubRepo && (
                      <span className="flex items-center gap-1">
                        <GitBranch className="h-3.5 w-3.5" />
                        Repo
                      </span>
                    )}
                    {project.demoUrl && (
                      <span className="flex items-center gap-1">
                        <ExternalLink className="h-3.5 w-3.5" />
                        Demo
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
