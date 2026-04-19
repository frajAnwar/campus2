import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { truncate, timeAgo } from "@/lib/utils";
import {
  Briefcase,
  Clock,
  DollarSign,
  Globe,
  MapPin,
} from "lucide-react";
import Link from "next/link";

type SearchParams = Promise<{ type?: string; search?: string }>;

export default async function OpportunitiesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await auth();
  if (!session?.user) return null;

  const params = await searchParams;
  const type = params.type || "";
  const search = params.search || "";

  const where = {
    ...(type ? { type: type as any } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" as const } },
            {
              description: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {}),
    OR: [
      { expiresAt: null },
      { expiresAt: { gte: new Date() } },
    ],
  };

  const opportunities = await prisma.opportunity.findMany({
    where,
    include: {
      author: {
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
        },
      },
      university: {
        select: { name: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 24,
  });

  const typeOptions = [
    "INTERNSHIP",
    "PART_TIME",
    "FREELANCE",
    "OPEN_SOURCE",
    "HACKATHON_TEAM",
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold">Opportunities</h1>

      <div className="flex flex-wrap gap-2">
        <Link href="/opportunities">
          <Badge variant={!type ? "default" : "secondary"} className="cursor-pointer">
            All
          </Badge>
        </Link>
        {typeOptions.map((t) => (
          <Link key={t} href={`/opportunities?type=${t}`}>
            <Badge
              variant={type === t ? "default" : "secondary"}
              className="cursor-pointer"
            >
              {t.replace(/_/g, " ")}
            </Badge>
          </Link>
        ))}
      </div>

      {opportunities.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No opportunities found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {opportunities.map((opp) => (
            <Card key={opp.id} className="hover:bg-accent/50 transition-colors">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium">{opp.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">
                        {opp.type.replace(/_/g, " ")}
                      </Badge>
                      {opp.field && (
                        <Badge variant="secondary">{opp.field}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {truncate(opp.description, 200)}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-muted-foreground">
                      <span>Posted {timeAgo(opp.createdAt)}</span>
                      {opp.deadline && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          Deadline:{" "}
                          {new Date(opp.deadline).toLocaleDateString()}
                        </span>
                      )}
                      {opp.isPaid && (
                        <span className="flex items-center gap-1 text-green-500">
                          <DollarSign className="h-3.5 w-3.5" />
                          Paid
                        </span>
                      )}
                      {opp.isRemote && (
                        <span className="flex items-center gap-1">
                          <Globe className="h-3.5 w-3.5" />
                          Remote
                        </span>
                      )}
                      {opp.university && (
                        <span>{opp.university.name}</span>
                      )}
                    </div>
                  </div>
                  {opp.applyUrl && (
                    <a
                      href={opp.applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-4 shrink-0"
                    >
                      <Badge className="cursor-pointer">Apply</Badge>
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
