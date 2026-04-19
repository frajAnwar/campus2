import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { timeAgo } from "@/lib/utils";
import {
  FolderOpen,
  FileText,
  Link as LinkIcon,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

export default async function ResourcesPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const { classId } = await params;
  const session = await auth();
  if (!session?.user) return null;

  const classData = await prisma.class.findUnique({
    where: { id: classId },
    select: { id: true, name: true },
  });
  if (!classData) notFound();

  const resources = await prisma.resource.findMany({
    where: { classId },
    orderBy: [{ week: "asc" }, { createdAt: "desc" }],
  });

  const groupedByWeek = resources.reduce<Record<string, typeof resources>>(
    (acc, r) => {
      const key = r.week ? `Week ${r.week}` : "General";
      if (!acc[key]) acc[key] = [];
      acc[key].push(r);
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link href={`/classes/${classId}`} className="hover:underline">
            {classData.name}
          </Link>
        </div>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <FolderOpen className="h-6 w-6" />
          Resources
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {resources.length} resource{resources.length !== 1 ? "s" : ""}
        </p>
      </div>

      {resources.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No resources yet</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Resources will appear here when added by the educator
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByWeek).map(([week, items]) => (
            <div key={week}>
              <h2 className="text-lg font-semibold mb-3">{week}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {items.map((r) => (
                  <Card key={r.id} className="hover:shadow-sm transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {r.type === "LINK" ? (
                            <LinkIcon className="h-5 w-5 text-blue-500" />
                          ) : (
                            <FileText className="h-5 w-5 text-orange-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{r.title}</p>
                          {r.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {r.description}
                            </p>
                          )}
                          {r.topic && (
                            <Badge variant="outline" className="mt-2 text-xs">
                              {r.topic}
                            </Badge>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            {(r.url || r.fileUrl) && (
                              <a
                                href={r.url || r.fileUrl!}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline flex items-center gap-1"
                              >
                                <ExternalLink className="h-3 w-3" />
                                Open
                              </a>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {timeAgo(r.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
