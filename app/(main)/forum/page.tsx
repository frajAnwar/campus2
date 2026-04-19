import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { getPosts } from "@/actions/post";
import { ForumFeed } from "./ForumFeed";
import { Plus, TrendingUp, Hash, Award } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ForumPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user) return null;

  const params = await searchParams;
  const tab = (params.tab as string) || "hot";
  const visibility = (params.visibility as string) || "ALL";
  const type = (params.type as string) || "ALL";
  const search = (params.search as string) || "";
  const tags = params.tags
    ? Array.isArray(params.tags)
      ? params.tags
      : [params.tags]
    : [];

  const result = await getPosts({
    tab,
    visibility,
    type,
    tags,
    search,
    limit: 20,
  });

  const posts = result.success ? (result as any).data.items : [];

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 animate-in fade-in duration-500">
      {/* Forum Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="space-y-1">
          <h1 className="text-4xl font-display font-bold tracking-tight">Community Forum</h1>
          <p className="text-muted-foreground max-w-lg">
            Connect with students, share notes, ask questions, and collaborate on projects across your university.
          </p>
        </div>
        <Link href="/forum/new">
          <Button className="rounded-xl px-6 h-12 gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all font-bold">
            <Plus className="h-5 w-5" />
            Create New Post
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Feed Area */}
        <div className="lg:col-span-3 space-y-6">
          <Suspense fallback={<div className="h-96 w-full animate-pulse bg-muted rounded-3xl" />}>
            <ForumFeed
              initialPosts={posts}
              initialTab={tab}
              initialVisibility={visibility}
              initialType={type}
              initialTags={tags}
              initialSearch={search}
            />
          </Suspense>
        </div>

        {/* Sidebar Area */}
        <div className="space-y-6 hidden lg:block">
          {/* Trending Topics */}
          <Card className="border-none bg-card/50 backdrop-blur-sm shadow-sm ring-1 ring-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Trending Topics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: "exams2024", count: 128 },
                { name: "react_tips", count: 85 },
                { name: "campus_events", count: 64 },
                { name: "career_fair", count: 42 },
                { name: "internships", count: 39 },
              ].map((topic) => (
                <Link 
                  key={topic.name} 
                  href={`/forum?tags=${topic.name}`}
                  className="flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Hash className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-sm font-medium group-hover:text-primary transition-colors">{topic.name}</span>
                  </div>
                  <Badge variant="secondary" className="text-[10px] py-0 px-2 h-5 bg-muted/50 font-bold border-none">
                    {topic.count}
                  </Badge>
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* Top Contributors */}
          <Card className="border-none bg-card/50 backdrop-blur-sm shadow-sm ring-1 ring-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Award className="h-4 w-4 text-amber-500" />
                Top Contributors
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: "Alex Chen", rank: "LEGEND", xp: "62k" },
                { name: "Sarah Miller", rank: "PIONEER", xp: "28k" },
                { name: "Mike Johnson", rank: "MENTOR", xp: "14k" },
              ].map((user) => (
                <div key={user.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                      {user.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold">{user.name}</span>
                      <span className="text-[10px] text-muted-foreground">{user.rank}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[9px] font-bold px-1.5 py-0 border-primary/20 text-primary">
                    {user.xp} XP
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Guidelines */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent border border-primary/10">
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-primary mb-2">Community Rules</h4>
            <ul className="space-y-2">
              {[
                "Be respectful to others",
                "Share verified resources only",
                "Keep discussions academic",
                "No spam or self-promotion",
              ].map((rule) => (
                <li key={rule} className="flex items-start gap-2 text-[11px] text-muted-foreground leading-tight">
                  <div className="size-1 rounded-full bg-primary/40 mt-1 shrink-0" />
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
