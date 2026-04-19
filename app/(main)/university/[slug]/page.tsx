import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/shared/Avatar";
import { MapPin, Globe, Users, BookOpen, ExternalLink, Trophy } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Params = Promise<{ slug: string }>;

export default async function UniversityPage({
  params,
}: {
  params: Params;
}) {
  const session = await auth();
  if (!session?.user) return null;

  const { slug } = await params;

  const university = await prisma.university.findUnique({
    where: { slug },
    include: {
      _count: {
        select: { users: true, classes: true, clubs: true },
      },
    },
  });

  if (!university) notFound();

  const [topUsers, recentClasses, clubs] = await Promise.all([
    prisma.user.findMany({
      where: { universityId: university.id },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        xp: true,
        rank: true,
      },
      orderBy: { xp: "desc" },
      take: 5,
    }),
    prisma.class.findMany({
      where: { universityId: university.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.club.findMany({
      where: { universityId: university.id, isActive: true },
      include: { _count: { select: { members: true } } },
      take: 6,
    }),
  ]);

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20 animate-in fade-in duration-700">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-white dark:bg-slate-900 border border-border/40 shadow-sm">
        <div 
          className="h-64 w-full bg-gradient-to-br from-primary/20 via-primary/10 to-transparent relative"
          style={university.banner ? { backgroundImage: `url(${university.banner})`, backgroundSize: 'cover' } : {}}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white dark:to-slate-900 opacity-60" />
        </div>

        <div className="px-8 md:px-12 pb-12 -mt-16 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
              <div className="relative">
                {university.logo ? (
                  <img
                    src={university.logo}
                    alt={university.name}
                    className="h-32 w-32 rounded-[2rem] object-cover ring-8 ring-white dark:ring-slate-900 shadow-xl"
                  />
                ) : (
                  <div className="flex h-32 w-32 items-center justify-center rounded-[2rem] bg-primary text-white text-5xl font-black ring-8 ring-white dark:ring-slate-900 shadow-xl">
                    {university.name.charAt(0)}
                  </div>
                )}
              </div>

              <div className="text-center md:text-left space-y-2">
                <h1 className="text-4xl font-display font-bold tracking-tight">{university.name}</h1>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground font-medium">
                  {university.country && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-primary" />
                      {university.city && `${university.city}, `}{university.country}
                    </span>
                  )}
                  {university.website && (
                    <a href={university.website} target="_blank" className="flex items-center gap-1.5 hover:text-primary transition-colors">
                      <Globe className="h-4 w-4 text-primary" />
                      Official Website
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Link href={`/search?universityId=${university.id}`}>
                <Button className="rounded-xl font-bold h-11 px-8 shadow-lg shadow-primary/20">
                  Search Hub
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Students", value: university._count.users, icon: Users, color: "text-blue-500" },
          { label: "Active Classes", value: university._count.classes, icon: BookOpen, color: "text-emerald-500" },
          { label: "Clubs", value: university._count.clubs, icon: Trophy, color: "text-amber-500" },
          { label: "Verfied Member", value: "Verified", icon: ExternalLink, color: "text-primary" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-slate-900/50 backdrop-blur-sm border border-border/40 rounded-[2rem] p-6 flex flex-col items-center gap-1 shadow-sm group hover:ring-2 hover:ring-primary/20 transition-all">
            <stat.icon className={cn("h-5 w-5 mb-2 opacity-50", stat.color)} />
            <span className="text-2xl font-black tracking-tight">{stat.value.toLocaleString()}</span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {recentClasses.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between px-4">
                <h2 className="text-2xl font-display font-bold tracking-tight flex items-center gap-3">
                   <div className="h-8 w-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                      <BookOpen className="h-4 w-4" />
                   </div>
                   Active Classes
                </h2>
                <Link href="/classes" className="text-xs font-bold text-primary hover:underline">View All</Link>
              </div>
              <div className="grid gap-4">
                {recentClasses.map((cls) => (
                  <Link key={cls.id} href={`/classes/${cls.id}`}>
                    <Card className="p-6 hover:shadow-lg transition-all rounded-[2rem] border-border/40 group relative overflow-hidden">
                      <div className="absolute right-0 top-0 h-full w-1 bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h4 className="font-bold text-lg group-hover:text-emerald-600 transition-colors">{cls.name}</h4>
                          <p className="text-xs text-muted-foreground">{cls.term || "Current Semester"}</p>
                        </div>
                        <Badge variant="secondary" className="rounded-lg font-bold text-[10px] py-1">
                          {cls.subjectTag || "Academic"}
                        </Badge>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {clubs.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between px-4">
                <h2 className="text-2xl font-display font-bold tracking-tight flex items-center gap-3">
                   <div className="h-8 w-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                      <Users className="h-4 w-4" />
                   </div>
                   Student Organizations
                </h2>
                <Link href="/clubs" className="text-xs font-bold text-primary hover:underline">Explore More</Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {clubs.map((club) => (
                  <Link key={club.id} href={`/clubs/${club.id}`}>
                    <Card className="p-5 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all rounded-[2rem] border-border/40 group">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary font-bold text-xl">
                          {club.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm truncate group-hover:text-primary transition-colors">{club.name}</h4>
                          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{club._count.members} Members</p>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-8">
          <Card className="border-none bg-card/50 backdrop-blur-sm shadow-sm ring-1 ring-border/50 overflow-hidden rounded-[2.5rem]">
            <CardHeader className="p-8 pb-0">
              <CardTitle className="text-xl font-display font-bold flex items-center gap-3">
                 <div className="h-8 w-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                    <Trophy className="h-4 w-4" />
                 </div>
                 Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {topUsers.map((user, i) => (
                  <Link 
                    key={user.id} 
                    href={`/profile/${user.username}`}
                    className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-all group"
                  >
                    <div className={cn(
                      "h-8 w-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0",
                      i === 0 ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20" : 
                      i === 1 ? "bg-slate-300 text-slate-700" :
                      i === 2 ? "bg-orange-400 text-white" : "text-muted-foreground"
                    )}>
                      {i + 1}
                    </div>
                    <Avatar src={user.image} name={user.name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold group-hover:text-primary transition-colors truncate">{user.name}</p>
                      <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">{user.xp.toLocaleString()} XP</p>
                    </div>
                  </Link>
                ))}
              </div>
              <Button variant="ghost" className="w-full mt-4 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 rounded-xl">
                View Full Rankings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
