import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users } from "lucide-react";
import Link from "next/link";
import { timeAgo } from "@/lib/utils";

export default async function EducatorAssignmentsPage() {
  const session = await auth();
  if (!session?.user) return null;

  const assignments = await prisma.assignment.findMany({
    where: { class: { educatorId: session.user.id } },
    include: {
      class: { select: { name: true } },
      _count: { select: { submissions: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  const pendingGrading = await prisma.submission.count({
    where: { 
      assignment: { class: { educatorId: session.user.id } },
      status: "SUBMITTED"
    }
  });

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Assignments</h1>
          <p className="text-muted-foreground mt-1">Manage assignments across all your classes</p>
        </div>
        <div className="flex items-center gap-4">
          <Card className="border-none shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <Clock className="h-5 w-5 text-amber-500" />
              <div>
                <p className="text-sm text-muted-foreground">Pending Grading</p>
                <p className="text-xl font-bold">{pendingGrading}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="space-y-4">
        {assignments.length === 0 ? (
          <Card className="border-dashed border-2 border-border/50 bg-transparent">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Calendar className="h-16 w-16 text-muted-foreground/40 mb-4" />
              <h3 className="text-xl font-semibold">No assignments yet</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-sm text-center">
                Create assignments for your classes to start tracking student work
              </p>
            </CardContent>
          </Card>
        ) : (
          assignments.map((assignment) => (
            <Card key={assignment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{assignment.title}</h3>
                    <p className="text-sm text-muted-foreground">{assignment.class.name}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {assignment._count.submissions} submissions
                      </span>
                      <span>
                        Due: {assignment.dueDate ? timeAgo(assignment.dueDate) : "No deadline"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge>{assignment.status}</Badge>
                  <Link href={`/educator/classes/${assignment.classId}/assignments/${assignment.id}`}>
                    <Button variant="secondary" size="sm">Manage</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
