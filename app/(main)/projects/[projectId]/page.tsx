import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/shared/Avatar";
import { timeAgo, truncate, cn } from "@/lib/utils";
import { Star, GitBranch, ExternalLink, Eye, MessageSquare, Award, Globe } from "lucide-react";
import { GithubIcon } from "@/components/shared/Icons";
import Link from "next/link";
import { ProjectReviewForm } from "@/components/projects/ProjectReviewForm";
import { ProjectReviewsList } from "@/components/projects/ProjectReviewsList";

type Params = Promise<{ projectId: string }>;

export default async function ProjectDetailPage({
  params,
}: {
  params: Params;
}) {
  const session = await auth();
  if (!session?.user) return null;

  const { projectId } = await params;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      owner: {
        select: { id: true, name: true, username: true, image: true, rank: true },
      },
      collaborators: {
        include: {
          user: { select: { id: true, name: true, username: true, image: true } },
        },
      },
      _count: { select: { stars: true, comments: true, reviews: true } },
      stars: {
        where: { userId: session.user.id },
        select: { userId: true },
      },
      reviews: {
        include: {
          reviewer: { select: { id: true, name: true, username: true, image: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      comments: {
        include: {
          author: { select: { id: true, name: true, username: true, image: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!project) notFound();

  const isOwner = project.ownerId === session.user.id;
  const isStarred = project.stars.length > 0;

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 animate-in fade-in duration-700">
      {/* Premium Header */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge className="bg-primary/10 text-primary border-none text-[10px] font-black uppercase tracking-widest px-3">
                {project.status.replace("_", " ")}
              </Badge>
              {project.avgRating && (
                <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-600 px-3 py-1 rounded-full border border-amber-500/10">
                   <Star className="h-3 w-3 fill-amber-500" />
                   <span className="text-[10px] font-black uppercase tracking-widest">{project.avgRating.toFixed(1)} Rating</span>
                </div>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight">{project.title}</h1>
            <div className="flex items-center gap-3">
              <Link href={`/profile/${project.owner.username}`}>
                <Avatar src={project.owner.image} name={project.owner.name} size="md" />
              </Link>
              <div>
                <Link href={`/profile/${project.owner.username}`} className="text-sm font-bold hover:text-primary transition-colors">
                  {project.owner.name}
                </Link>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Project Lead &bull; {timeAgo(project.createdAt)}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isOwner && (
              <Link href={`/projects/${project.id}/edit`}>
                <Button variant="outline" className="rounded-xl font-bold h-11 px-6">Edit Project</Button>
              </Link>
            )}
            <Button className={cn(
              "rounded-xl font-bold h-11 px-6 shadow-lg transition-all",
              isStarred ? "bg-amber-500 hover:bg-amber-600 shadow-amber-500/20" : "bg-primary shadow-primary/20"
            )}>
              <Star className={cn("h-4 w-4 mr-2", isStarred && "fill-white")} />
              {isStarred ? "Starred" : "Star Project"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Stars", value: project._count.stars, icon: Star, color: "text-amber-500" },
            { label: "Views", value: project.viewCount, icon: Eye, color: "text-blue-500" },
            { label: "Reviews", value: project._count.reviews, icon: Award, color: "text-purple-500" },
            { label: "Comments", value: project._count.comments, icon: MessageSquare, color: "text-emerald-500" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white dark:bg-slate-900/50 backdrop-blur-sm border border-border/40 rounded-2xl p-4 flex flex-col items-center gap-1 shadow-sm">
              <stat.icon className={cn("h-4 w-4 mb-1 opacity-50", stat.color)} />
              <span className="text-xl font-black tracking-tight">{stat.value}</span>
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-10">
          {/* Main Description */}
          <Card className="border-none shadow-sm ring-1 ring-border/50 overflow-hidden rounded-[2.5rem]">
            <CardContent className="p-8 md:p-12">
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                  {project.description}
                </p>
              </div>

              {project.imageUrls.length > 0 && (
                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {project.imageUrls.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt={`Screenshot ${i + 1}`}
                      className="rounded-3xl border border-border/40 object-cover aspect-video shadow-sm hover:scale-[1.02] transition-transform duration-500"
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Peer Review Section */}
          <div className="space-y-6">
             <div className="flex items-center justify-between px-4">
                <h2 className="text-2xl font-display font-bold tracking-tight flex items-center gap-3">
                   <Award className="h-6 w-6 text-primary" />
                   Peer Reviews
                </h2>
             </div>
             {!isOwner && <ProjectReviewForm projectId={project.id} />}
             <ProjectReviewsList reviews={project.reviews} />
          </div>
        </div>

        <div className="space-y-8">
          {/* Links Card */}
          <Card className="border-none shadow-sm ring-1 ring-border/50 overflow-hidden rounded-[2.5rem] bg-primary/5">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-lg font-bold">Project Access</CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-3">
              {project.githubRepo && (
                <a href={project.githubRepo} target="_blank" className="block">
                  <Button className="w-full justify-start rounded-xl h-12 bg-slate-900 hover:bg-black text-white gap-3">
                    <GithubIcon className="h-5 w-5" />
                    Source Code
                  </Button>
                </a>
              )}
              {project.demoUrl && (
                <a href={project.demoUrl} target="_blank" className="block">
                  <Button className="w-full justify-start rounded-xl h-12 bg-white dark:bg-slate-800 text-foreground border border-border/50 hover:bg-slate-50 gap-3">
                    <Globe className="h-5 w-5 text-primary" />
                    Live Preview
                  </Button>
                </a>
              )}
            </CardContent>
          </Card>

          {/* Tech Stack */}
          {project.techTags.length > 0 && (
            <Card className="border-none shadow-sm ring-1 ring-border/50 overflow-hidden rounded-[2.5rem]">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-lg font-bold">Tech Stack</CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-0 flex flex-wrap gap-2">
                {project.techTags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="bg-slate-100 dark:bg-slate-800 border-none rounded-lg font-bold text-xs py-1.5 px-3">
                    {tag}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Collaborators */}
          {project.collaborators.length > 0 && (
            <Card className="border-none shadow-sm ring-1 ring-border/50 overflow-hidden rounded-[2.5rem]">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-lg font-bold">Building Team</CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-4">
                {project.collaborators.map((c) => (
                  <Link key={c.userId} href={`/profile/${c.user.username}`} className="flex items-center gap-3 group">
                    <Avatar src={c.user.image} name={c.user.name} size="sm" />
                    <span className="text-sm font-bold group-hover:text-primary transition-colors">{c.user.name}</span>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
