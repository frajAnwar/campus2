import { WelcomeBanner } from "./WelcomeBanner";
import { XPBar } from "@/components/gamification/XPBar";
import { RankBadge } from "@/components/gamification/RankBadge";
import { DashboardDeadlines } from "./DashboardDeadlines";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/shared/Avatar";
import { Badge } from "@/components/ui/badge";
import { Flame, MessageSquare, Trophy, GraduationCap, Users, Sparkles } from "lucide-react";
import Link from "next/link";
import { timeAgo, cn } from "@/lib/utils";

interface StudentDashboardProps {
  user: any;
  data: any;
}

export function StudentDashboard({ user, data }: StudentDashboardProps) {
  const { upcomingAssignments, recentPosts, recommendations } = data;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <WelcomeBanner userName={user.name?.split(" ")[0] || "Student"} />

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
// ... (streak and rank)
        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <RankBadge rank={user.rank} />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Your Rank</span>
              <span className="text-sm font-bold mt-1">{user.rank}</span>
            </div>
          </div>
          <div className="flex-1 max-w-[180px] ml-4">
            <XPBar xp={user.xp} rank={user.rank} />
          </div>
        </div>

        {user.currentStreak > 0 && (
          <div className="bg-orange-500/5 border border-orange-500/10 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
            <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <Flame className="h-6 w-6 text-orange-500 fill-orange-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-orange-600/60 uppercase tracking-widest leading-none">Learning Streak</span>
              <span className="text-sm font-bold text-orange-700 mt-1">{user.currentStreak} Days Active</span>
            </div>
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none bg-card/50 backdrop-blur-sm shadow-sm ring-1 ring-border/50 overflow-hidden rounded-[2rem]">
            <CardHeader className="flex flex-row items-center justify-between pb-4 px-8 pt-8">
              <CardTitle className="text-lg font-display font-semibold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Recommended for You
              </CardTitle>
              <Link href="/forum" className="text-xs font-bold text-primary hover:underline">
                Explore Forum
              </Link>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="divide-y divide-border/30">
                {(recommendations?.length > 0 ? recommendations : recentPosts).map((post: any) => (
                  <Link
                    key={post.id}
                    href={`/forum/${post.id}`}
                    className="group flex items-center gap-4 py-4 hover:bg-accent/30 px-4 -mx-2 rounded-2xl transition-all"
                  >
                    <Avatar src={post.author.image} name={post.author.name} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold group-hover:text-primary transition-colors truncate">
                          {post.title}
                        </h4>
                        {recommendations?.some((r: any) => r.id === post.id) && (
                          <Badge className="bg-primary/10 text-primary border-none text-[8px] h-4 px-1 font-black uppercase tracking-tighter">Interest Match</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {post.author.name} &bull; {timeAgo(post.createdAt)}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-bold py-0 h-6">
                      {post.type}
                    </Badge>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <DashboardDeadlines assignments={upcomingAssignments} />
          
          <Card className="border-none bg-card/50 backdrop-blur-sm shadow-sm ring-1 ring-border/50 overflow-hidden rounded-[2rem]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Communities for You
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.recommendedClubs?.map((club: any) => (
                <Link key={club.id} href={`/clubs/${club.id}`} className="group block">
                  <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-primary/5 transition-all border border-transparent hover:border-primary/10">
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate group-hover:text-primary transition-colors">{club.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{club._count.members} Members &bull; {club.category}</p>
                    </div>
                    <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest px-2 py-0 h-5">Join</Badge>
                  </div>
                </Link>
              ))}
              {(!data.recommendedClubs || data.recommendedClubs.length === 0) && (
                <p className="text-[10px] text-center text-muted-foreground py-4 italic">No recommendations available</p>
              )}
              <Link href="/clubs" className="block text-center text-[10px] font-black uppercase tracking-widest text-primary hover:underline mt-2">
                Browse All Clubs
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
