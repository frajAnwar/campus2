import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/shared/Avatar";
import { RankBadge } from "@/components/gamification/RankBadge";
import { XPBar } from "@/components/gamification/XPBar";
import { Button } from "@/components/ui/button";
import { timeAgo, truncate, cn } from "@/lib/utils";
import {
  MapPin,
  Link as LinkIcon,
  Code,
  Briefcase,
  MessageCircle,
  BookOpen,
  Trophy,
  Users,
  Star,
  Flame,
  Award,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";

type Params = Promise<{ username: string }>;

import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ContributionHeatmap } from "@/components/profile/ContributionHeatmap";

export default async function ProfilePage({ params }: { params: Params }) {
  const session = await auth();
  if (!session?.user) return null;

  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      university: { select: { name: true, slug: true } },
      skills: { select: { skill: true } },
      achievements: { orderBy: { earnedAt: "desc" }, take: 10 },
      _count: {
        select: {
          posts: true,
          followersRel: true,
          followingRel: true,
          projects: true,
          clubMemberships: true,
        },
      },
    },
  });

  if (!user) notFound();

  const [recentProjects, recentPosts, clubs] = await Promise.all([
    prisma.project.findMany({
      where: { ownerId: user.id, visibility: "PUBLIC" },
      include: { _count: { select: { stars: true } } },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.post.findMany({
      where: { authorId: user.id, visibility: "PUBLIC" },
      include: {
        _count: { select: { comments: true, votes: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.clubMember.findMany({
      where: { userId: user.id },
      include: {
        club: {
          select: {
            id: true,
            name: true,
            logo: true,
            category: true,
          },
        },
      },
      take: 10,
    }),
  ]);

  const isOwn = session.user.id === user.id;

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-12 animate-in fade-in duration-500">
      <ProfileHeader user={user} isOwn={isOwn} />

      {/* Simplified Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "XP Points", value: user.xp.toLocaleString(), icon: Trophy, color: "text-amber-500" },
          { label: "Followers", value: user._count.followersRel, icon: Users, color: "text-blue-500" },
          { label: "Projects", value: user._count.projects, icon: Code, color: "text-purple-500" },
          { label: "Posts", value: user._count.posts, icon: MessageSquare, color: "text-emerald-500" },
        ].map((stat) => (
          <div key={stat.label} className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-[1.5rem] p-5 flex flex-col items-center gap-1 shadow-sm">
            <stat.icon className={cn("h-4 w-4 mb-1 opacity-50", stat.color)} />
            <span className="text-xl font-bold tracking-tight">{stat.value}</span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</span>
          </div>
        ))}
      </div>

      <ContributionHeatmap userId={user.id} />
      <XPBar xp={user.xp} rank={user.rank} />

      {user.skills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {user.skills.map((s) => (
                <Badge key={s.skill} variant="secondary">
                  {s.skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {recentProjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {recentProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                >
                  <p className="text-sm font-medium">{project.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {truncate(project.description, 80)}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      {project._count.stars}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {user.achievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {user.achievements.map((a) => (
                <Badge key={a.id} variant="secondary" className="gap-1">
                  <Trophy className="h-3 w-3" />
                  {a.label}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {recentPosts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Recent Posts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/forum/${post.id}`}
                  className="block p-2 rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <p className="text-sm font-medium">{post.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {post._count.comments} comments &middot; {timeAgo(post.createdAt)}
                  </p>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {clubs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Clubs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {clubs.map((c) => (
                <Link key={c.club.id} href={`/clubs/${c.club.id}`}>
                  <Badge variant="outline" className="cursor-pointer">
                    {c.club.name}
                  </Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
