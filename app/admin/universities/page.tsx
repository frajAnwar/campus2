import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Building2,
  Plus,
  MapPin,
  Users,
  Globe,
  Search,
} from "lucide-react";
import Link from "next/link";

type SearchParams = Promise<{ search?: string }>;

export default async function AdminUniversitiesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await auth();
  if (!session?.user) return null;

  const params = await searchParams;
  const search = params.search || "";

  const universities = await prisma.university.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            {
              domain: { contains: search, mode: "insensitive" as const },
            },
          ],
        }
      : {},
    include: {
      _count: { select: { users: true, classes: true, clubs: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">Universities</h1>
        <Button>
          <Plus className="h-4 w-4 mr-1" />
          Add University
        </Button>
      </div>

      <form className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="search"
            placeholder="Search universities..."
            defaultValue={search}
            className="pl-9"
          />
        </div>
      </form>

      {universities.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No universities found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {universities.map((uni) => (
            <Card key={uni.id}>
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-center gap-3">
                  {uni.logo ? (
                    <img
                      src={uni.logo}
                      alt={uni.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted font-bold">
                      {uni.name.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium truncate">{uni.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {uni.domain && (
                        <span className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {uni.domain}
                        </span>
                      )}
                    </div>
                  </div>
                  <Badge variant={uni.isActive ? "default" : "secondary"}>
                    {uni.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-sm font-bold">{uni._count.users}</p>
                    <p className="text-xs text-muted-foreground">Users</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold">{uni._count.classes}</p>
                    <p className="text-xs text-muted-foreground">Classes</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold">{uni._count.clubs}</p>
                    <p className="text-xs text-muted-foreground">Clubs</p>
                  </div>
                </div>
                {uni.country && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {uni.city && `${uni.city}, `}{uni.country}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
