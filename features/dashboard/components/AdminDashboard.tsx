import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, UserCheck, AlertTriangle, CheckCircle, XCircle, ArrowRight, Users } from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/shared/Avatar";

interface AdminDashboardProps {
  user: any;
  data: any;
}

export function AdminDashboard({ user, data }: AdminDashboardProps) {
  const { pendingRequests = [], activeReports = 0, totalUsers = 0 } = data;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-950 p-10 text-white shadow-2xl">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-red-500/10 blur-[80px]" />
        <div className="relative z-10 space-y-4">
          <Badge className="bg-red-500/20 text-red-400 border-none px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
            Platform Governance
          </Badge>
          <h1 className="text-3xl md:text-5xl font-display font-bold tracking-tight">
            Security Overview
          </h1>
          <p className="text-slate-400 text-sm max-w-md leading-relaxed">
            Monitor platform health, manage user requests, and ensure community standards are maintained.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border/40 p-5 rounded-[2rem] flex flex-col items-center gap-2 text-center">
          <UserCheck className="h-5 w-5 text-blue-500" />
          <span className="text-2xl font-bold">{pendingRequests.length}</span>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Pending Requests</span>
        </div>
        <div className="bg-card border border-border/40 p-5 rounded-[2rem] flex flex-col items-center gap-2 text-center">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          <span className="text-2xl font-bold">{activeReports}</span>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active Reports</span>
        </div>
        <div className="bg-card border border-border/40 p-5 rounded-[2rem] flex flex-col items-center gap-2 text-center">
          <Shield className="h-5 w-5 text-emerald-500" />
          <span className="text-2xl font-bold">99.9%</span>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Uptime</span>
        </div>
        <div className="bg-card border border-border/40 p-5 rounded-[2rem] flex flex-col items-center gap-2 text-center">
          <Users className="h-5 w-5 text-purple-500" />
          <span className="text-2xl font-bold">{totalUsers}</span>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Users</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-display font-bold">Pending Approval Requests</h3>
            <Link href="/admin/requests" className="text-xs font-bold text-primary hover:underline">View All</Link>
          </div>
          
          <div className="space-y-3">
            {pendingRequests.length === 0 ? (
              <Card className="rounded-[2rem] border-dashed border-2 border-border/50 bg-transparent p-12 text-center">
                <p className="text-muted-foreground text-sm font-medium italic">No pending requests at this time.</p>
              </Card>
            ) : (
              pendingRequests.slice(0, 5).map((req: any) => (
                <div key={req.id} className="bg-white dark:bg-slate-900 border border-border/40 p-5 rounded-2xl flex items-center justify-between group hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <Avatar src={req.user.image} name={req.user.name} size="md" />
                    <div>
                      <p className="text-sm font-bold">{req.user.name}</p>
                      <p className="text-xs text-muted-foreground">Request: <span className="font-semibold text-primary">{req.type}</span></p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all">
                      <CheckCircle className="h-4 w-4" />
                    </button>
                    <button className="p-2 rounded-xl bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white transition-all">
                      <XCircle className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-display font-bold px-2">Quick Access</h3>
          <div className="grid gap-3">
            {[
              { label: "User Management", href: "/admin/users", icon: Users },
              { label: "Content Moderation", href: "/admin/moderation", icon: Shield },
              { label: "System Logs", href: "/admin/logs", icon: ArrowRight },
            ].map((link) => (
              <Link key={link.label} href={link.href}>
                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl flex items-center justify-between group hover:bg-primary hover:text-white transition-all">
                  <span className="text-sm font-bold">{link.label}</span>
                  <link.icon className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
