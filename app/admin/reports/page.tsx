import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/shared/Avatar";
import { timeAgo } from "@/lib/utils";
import {
  Flag,
  CheckCircle2,
  XCircle,
  Eye,
  AlertTriangle,
  MessageSquare,
  User,
} from "lucide-react";
import Link from "next/link";

type SearchParams = Promise<{ status?: string }>;

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await auth();
  if (!session?.user) return null;

  const params = await searchParams;
  const status = params.status || "PENDING";

  const reports = await prisma.report.findMany({
    where: status ? { status: status as any } : {},
    include: {
      reporter: {
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
        },
      },
      reported: {
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
        },
      },
      post: {
        select: { id: true, title: true },
      },
      comment: {
        select: { id: true, body: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const statusCounts = await Promise.all([
    prisma.report.count({ where: { status: "PENDING" } }),
    prisma.report.count({ where: { status: "REVIEWING" } }),
    prisma.report.count({ where: { status: "ESCALATED" } }),
    prisma.report.count({ where: { status: "RESOLVED_REMOVED" } }),
    prisma.report.count({ where: { status: "RESOLVED_DISMISSED" } }),
  ]);

  const statuses = [
    { key: "PENDING", label: "Pending", count: statusCounts[0] },
    { key: "REVIEWING", label: "Reviewing", count: statusCounts[1] },
    { key: "ESCALATED", label: "Escalated", count: statusCounts[2] },
    { key: "RESOLVED_REMOVED", label: "Removed", count: statusCounts[3] },
    {
      key: "RESOLVED_DISMISSED",
      label: "Dismissed",
      count: statusCounts[4],
    },
  ];

  const statusColors: Record<string, string> = {
    PENDING: "bg-amber-500/20 text-amber-500",
    REVIEWING: "bg-blue-500/20 text-blue-500",
    ESCALATED: "bg-red-500/20 text-red-500",
    RESOLVED_REMOVED: "bg-green-500/20 text-green-500",
    RESOLVED_DISMISSED: "bg-zinc-500/20 text-zinc-500",
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold">Reports Queue</h1>

      <div className="flex flex-wrap gap-2">
        {statuses.map((s) => (
          <a
            key={s.key}
            href={`/admin/reports?status=${s.key}`}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium ${
              status === s.key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {s.label}
            <span
              className={`rounded-full px-1.5 text-xs ${
                status === s.key
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-muted-foreground/20 text-muted-foreground"
              }`}
            >
              {s.count}
            </span>
          </a>
        ))}
      </div>

      {reports.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Flag className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No reports found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <Card key={report.id}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge
                        className={`text-xs ${statusColors[report.status] || ""}`}
                      >
                        {report.status.replace(/_/g, " ")}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {report.category.replace(/_/g, " ")}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1.5">
                        <span className="text-muted-foreground">
                          Reporter:
                        </span>
                        <Avatar
                          src={report.reporter.image}
                          name={report.reporter.name}
                          size="sm"
                        />
                        <Link
                          href={`/profile/${report.reporter.username}`}
                          className="font-medium hover:underline"
                        >
                          {report.reporter.name}
                        </Link>
                      </div>
                      {report.reported && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-muted-foreground">
                            Reported:
                          </span>
                          <Avatar
                            src={report.reported.image}
                            name={report.reported.name}
                            size="sm"
                          />
                          <Link
                            href={`/profile/${report.reported.username}`}
                            className="font-medium hover:underline"
                          >
                            {report.reported.name}
                          </Link>
                        </div>
                      )}
                    </div>

                    {report.post && (
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MessageSquare className="h-3.5 w-3.5" />
                        Post:{" "}
                        <Link
                          href={`/forum/${report.post.id}`}
                          className="font-medium hover:underline text-foreground"
                        >
                          {report.post.title}
                        </Link>
                      </div>
                    )}

                    {report.note && (
                      <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                        {report.note}
                      </p>
                    )}

                    <p className="text-xs text-muted-foreground">
                      {timeAgo(report.createdAt)}
                    </p>
                  </div>

                  {report.status === "PENDING" && (
                    <div className="flex gap-1 ml-4">
                      <form
                        action={`/api/admin/reports/${report.id}/resolve`}
                        method="POST"
                      >
                        <input
                          type="hidden"
                          name="action"
                          value="remove"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          type="submit"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </form>
                      <form
                        action={`/api/admin/reports/${report.id}/resolve`}
                        method="POST"
                      >
                        <input
                          type="hidden"
                          name="action"
                          value="dismiss"
                        />
                        <Button variant="outline" size="sm" type="submit">
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Dismiss
                        </Button>
                      </form>
                    </div>
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
