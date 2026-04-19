import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/shared/Avatar";
import { Button } from "@/components/ui/button";
import { handleRequest } from "@/actions/request";
import { RequestStatus } from "@prisma/client";
import { CheckCircle, XCircle, Clock, Shield } from "lucide-react";

export default async function AdminRequestsPage() {
  const session = await auth();
  if (session?.user?.role !== "PLATFORM_ADMIN" && session?.user?.role !== "UNIVERSITY_ADMIN") {
    redirect("/dashboard");
  }

  const requests = await prisma.request.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          image: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">System Requests</h1>
          <p className="text-muted-foreground text-sm">Review and manage role changes and club creation requests.</p>
        </div>
      </div>

      <div className="grid gap-4">
        {requests.length === 0 ? (
          <Card className="rounded-[2rem] border-dashed border-2 border-border/50 bg-transparent p-20 text-center">
            <p className="text-muted-foreground font-medium italic">No requests found in the system.</p>
          </Card>
        ) : (
          requests.map((request) => (
            <Card key={request.id} className="rounded-[2rem] border-none ring-1 ring-border/40 overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <Avatar src={request.user.image} name={request.user.name} size="lg" className="rounded-2xl" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg">{request.user.name}</h3>
                        <Badge variant="outline" className="text-[10px] font-bold uppercase">{request.type}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">@{request.user.username} &bull; {request.user.email}</p>
                      
                      <div className="mt-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-border/40">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Request Data</p>
                        <pre className="text-xs font-mono whitespace-pre-wrap">
                          {JSON.stringify(request.data, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {request.status === "PENDING" ? (
                        <>
                          <form action={async () => {
                            "use server";
                            await handleRequest(request.id, RequestStatus.REJECTED);
                          }}>
                            <Button variant="outline" size="sm" className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700">
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </form>
                          <form action={async () => {
                            "use server";
                            await handleRequest(request.id, RequestStatus.APPROVED);
                          }}>
                            <Button size="sm" className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20">
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                          </form>
                        </>
                      ) : (
                        <Badge variant={request.status === "APPROVED" ? "default" : "destructive"} className="px-4 py-1 rounded-lg">
                          {request.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
