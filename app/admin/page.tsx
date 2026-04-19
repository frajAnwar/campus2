import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  Building2,
  Flag,
  FileText,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user) return null;

  const [
    totalUsers,
    totalUniversities,
    totalPosts,
    pendingReports,
    totalClubs,
    newUsersToday,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.university.count(),
    prisma.post.count(),
    prisma.report.count({ where: { status: "PENDING" } }),
    prisma.club.count(),
    prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
  ]);

  const recentReports = await prisma.report.findMany({
    where: { status: "PENDING" },
    include: {
      reporter: {
        select: { name: true, username: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold">Admin Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-4">
            <Users className="h-4 w-4 text-muted-foreground mb-1" />
            <p className="text-2xl font-bold">{totalUsers}</p>
            <p className="text-xs text-muted-foreground">Total Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <Building2 className="h-4 w-4 text-muted-foreground mb-1" />
            <p className="text-2xl font-bold">{totalUniversities}</p>
            <p className="text-xs text-muted-foreground">Universities</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <FileText className="h-4 w-4 text-muted-foreground mb-1" />
            <p className="text-2xl font-bold">{totalPosts}</p>
            <p className="text-xs text-muted-foreground">Posts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <Flag className="h-4 w-4 text-destructive mb-1" />
            <p className="text-2xl font-bold">{pendingReports}</p>
            <p className="text-xs text-muted-foreground">Pending Reports</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <Building2 className="h-4 w-4 text-muted-foreground mb-1" />
            <p className="text-2xl font-bold">{totalClubs}</p>
            <p className="text-xs text-muted-foreground">Clubs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <TrendingUp className="h-4 w-4 text-green-500 mb-1" />
            <p className="text-2xl font-bold">{newUsersToday}</p>
            <p className="text-xs text-muted-foreground">New Today</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                Recent Reports
              </h2>
              <Link
                href="/admin/reports"
                className="text-sm text-primary hover:underline"
              >
                View all
              </Link>
            </div>
            {recentReports.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No pending reports
              </p>
            ) : (
              <div className="space-y-2">
                {recentReports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {report.category.replace(/_/g, " ")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        by {report.reporter.name}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {report.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-medium">Quick Links</h2>
            </div>
            <div className="space-y-2">
              <Link
                href="/admin/users"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
              >
                <Users className="h-5 w-5" />
                <div>
                  <p className="text-sm font-medium">Manage Users</p>
                  <p className="text-xs text-muted-foreground">
                    View and manage user accounts
                  </p>
                </div>
              </Link>
              <Link
                href="/admin/universities"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
              >
                <Building2 className="h-5 w-5" />
                <div>
                  <p className="text-sm font-medium">Manage Universities</p>
                  <p className="text-xs text-muted-foreground">
                    Add and configure universities
                  </p>
                </div>
              </Link>
              <Link
                href="/admin/analytics"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
              >
                <TrendingUp className="h-5 w-5" />
                <div>
                  <p className="text-sm font-medium">View Analytics</p>
                  <p className="text-xs text-muted-foreground">
                    Platform usage statistics
                  </p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
