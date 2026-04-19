import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/shared/Avatar";
import { Input } from "@/components/ui/input";
import { Users, Search } from "lucide-react";
import Link from "next/link";
import { ClubRequestDialog } from "@/components/clubs/ClubRequestDialog";

type SearchParams = Promise<{ search?: string; category?: string }>;

export default async function ClubsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await auth();
  if (!session?.user) return null;

  const isAdmin = session.user.role === "PLATFORM_ADMIN" || session.user.role === "UNIVERSITY_ADMIN";

  const params = await searchParams;
  const search = params.search || "";
  const category = params.category || "";

  const where = {
    isActive: true,
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            {
              description: { contains: search, mode: "insensitive" as const },
            },
          ],
        }
      : {}),
    ...(category ? { category: category as any } : {}),
  };

  const clubs = await prisma.club.findMany({
    where,
    include: {
      _count: { select: { members: true, events: true } },
      members: {
        where: { userId: session.user.id },
        select: { role: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 24,
  });

  const categories = await prisma.club.findMany({
    where: { isActive: true },
    select: { category: true },
    distinct: ["category"],
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight">Clubs & Communities</h1>
          <p className="text-muted-foreground text-sm mt-1">Discover and join student-led organizations.</p>
        </div>
        
        {isAdmin ? (
          <Link
            href="/clubs/new"
            className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all"
          >
            Create Club
          </Link>
        ) : (
          <ClubRequestDialog />
        )}
      </div>

      <form className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="search"
            placeholder="Search clubs..."
            defaultValue={search}
            className="pl-9 rounded-xl"
          />
        </div>
      </form>

      <div className="flex flex-wrap gap-2">
        <Link href="/clubs">
          <Badge variant={!category ? "default" : "secondary"} className="cursor-pointer rounded-lg px-4 py-1">
            All
          </Badge>
        </Link>
        {categories.map((c) => (
          <Link key={c.category} href={`/clubs?category=${c.category}`}>
            <Badge
              variant={category === c.category ? "default" : "secondary"}
              className="cursor-pointer rounded-lg px-4 py-1"
            >
              {c.category}
            </Badge>
          </Link>
        ))}
      </div>

      {clubs.length === 0 ? (
        <Card className="rounded-[2rem] border-none ring-1 ring-border/40 bg-card/50">
          <CardContent className="py-20 text-center">
            <p className="text-muted-foreground font-medium italic">No clubs found. Be the first to start one!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clubs.map((club) => (
            <Link key={club.id} href={`/clubs/${club.id}`} className="group">
              <Card className="hover:ring-primary/40 ring-1 ring-border/40 border-none bg-white dark:bg-slate-900 transition-all h-full rounded-[2rem] shadow-sm group-hover:shadow-md">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center gap-4">
                    {club.logo ? (
                      <img
                        src={club.logo}
                        alt={club.name}
                        className="h-12 w-12 rounded-2xl object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary font-bold">
                        {club.name.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold truncate group-hover:text-primary transition-colors">{club.name}</h3>
                      <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-wider px-2 py-0">
                        {club.category}
                      </Badge>
                    </div>
                  </div>
                  {club.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {club.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t border-border/40">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <Users className="h-3.5 w-3.5" />
                      {club._count.members}
                    </span>
                    {club.members.length > 0 && (
                      <Badge variant="outline" className="text-[10px] font-bold uppercase">
                        {club.members[0].role}
                      </Badge>
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
