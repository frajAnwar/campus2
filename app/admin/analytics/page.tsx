import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  MessageSquare,
  BookOpen,
  TrendingUp,
  Calendar,
  BarChart3,
  Activity,
} from "lucide-react";
import { adminGetAnalytics } from "@/actions/admin";
import Link from "next/link";

export default async function AdminAnalyticsPage({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
  const params = await searchParams;
  const period = params.period || "30d";

  const result = await adminGetAnalytics();
  if (!result || !result.success || !result.data) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-display font-bold">Analytics</h1>
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Error loading analytics data.</p>
        </div>
      </div>
    );
  }

  const { totals, recentSignups, usersByRole, postsByType } = result.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">Analytics</h1>
        <div className="flex gap-2">
          {["7d", "30d", "90d"].map((p) => (
            <Link
              key={p}
              href={`/admin/analytics?period=${p}`}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                period === p
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <Users className="h-4 w-4 text-muted-foreground mb-1" />
            <p className="text-2xl font-bold">{totals.users.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <MessageSquare className="h-4 w-4 text-muted-foreground mb-1" />
            <p className="text-2xl font-bold">{totals.posts.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total Posts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <Activity className="h-4 w-4 text-muted-foreground mb-1" />
            <p className="text-2xl font-bold">
              {totals.comments.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">Total Comments</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <BookOpen className="h-4 w-4 text-muted-foreground mb-1" />
            <p className="text-2xl font-bold">{totals.projects}</p>
            <p className="text-xs text-muted-foreground">Projects Uploaded</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Signups
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentSignups.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No recent signups.
              </p>
            ) : (
              <div className="space-y-4">
                {recentSignups.map((user) => (
                  <div key={user.id} className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">@{user.username}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">{user.role}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Platform Composition
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold mb-3 text-muted-foreground">Users by Role</h3>
                <div className="flex flex-wrap gap-2">
                  {usersByRole.map(({ role, count }) => (
                    <Badge key={role} variant="outline" className="text-sm gap-1">
                      {role}
                      <span className="text-muted-foreground">({count})</span>
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold mb-3 text-muted-foreground">Posts by Type</h3>
                <div className="flex flex-wrap gap-2">
                  {postsByType.map(({ type, count }) => (
                    <Badge key={type} variant="outline" className="text-sm gap-1 bg-primary/5">
                      {type}
                      <span className="text-muted-foreground">({count})</span>
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="pt-4 border-t border-border/30">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Pending Reports</span>
                  <Badge variant={totals.pendingReports > 0 ? "destructive" : "secondary"}>
                    {totals.pendingReports}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
