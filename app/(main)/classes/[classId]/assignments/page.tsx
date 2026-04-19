import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { timeAgo } from "@/lib/utils";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Plus,
} from "lucide-react";
import Link from "next/link";

export default async function AssignmentsPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const { classId } = await params;
  const session = await auth();
  if (!session?.user) return null;

  const classData = await prisma.class.findUnique({
    where: { id: classId },
    select: { id: true, name: true, educatorId: true },
  });
  if (!classData) notFound();

  const isEducator = classData.educatorId === session.user.id;

  const assignments = await prisma.assignment.findMany({
    where: { classId },
    include: {
      submissions: isEducator
        ? { select: { id: true, studentId: true, status: true } }
        : {
            where: { studentId: session.user.id },
            select: { id: true, status: true, grade: true },
          },
      _count: { select: { submissions: true } },
    },
    orderBy: { dueDate: "asc" },
  });

  const memberCount = await prisma.classMember.count({
    where: { classId },
  });

  if (isEducator) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold">Assignments</h1>
            <p className="text-sm text-muted-foreground">{classData.name}</p>
          </div>
          <Link href={`/classes/${classId}/assignments/new`}>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Create Assignment
            </Button>
          </Link>
        </div>

        {assignments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No assignments yet</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Create your first assignment
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="p-3 font-medium">Assignment</th>
                    <th className="p-3 font-medium">Due Date</th>
                    <th className="p-3 font-medium">Status</th>
                    <th className="p-3 font-medium text-center">Submitted</th>
                    <th className="p-3 font-medium text-center">Graded</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((a) => {
                    const submitted = a.submissions.filter(
                      (s) => s.status !== "SUBMITTED" || s.status === "SUBMITTED"
                    ).length;
                    const graded = a.submissions.filter(
                      (s) => s.status === "GRADED"
                    ).length;

                    return (
                      <tr
                        key={a.id}
                        className="border-b last:border-0 hover:bg-accent/50 transition-colors"
                      >
                        <td className="p-3">
                          <Link
                            href={`/classes/${classId}/assignments/${a.id}`}
                            className="font-medium hover:underline"
                          >
                            {a.title}
                          </Link>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {a.maxPoints} pts
                          </p>
                        </td>
                        <td className="p-3 text-sm">
                          {a.dueDate ? (
                            <span
                              className={
                                a.dueDate < new Date()
                                  ? "text-destructive"
                                  : ""
                              }
                            >
                              {timeAgo(a.dueDate)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">
                              No due date
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          <Badge
                            variant={
                              a.status === "PUBLISHED"
                                ? "default"
                                : a.status === "CLOSED"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {a.status}
                          </Badge>
                        </td>
                        <td className="p-3 text-center text-sm">
                          {submitted}/{memberCount}
                        </td>
                        <td className="p-3 text-center text-sm">
                          {graded}/{submitted}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Assignments</h1>
        <p className="text-sm text-muted-foreground">{classData.name}</p>
      </div>

      {assignments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No assignments yet</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Check back later
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {assignments.map((a) => {
            const submission = a.submissions[0];
            const isPastDue = a.dueDate ? a.dueDate < new Date() : false;

            let statusIcon = <Clock className="h-4 w-4 text-muted-foreground" />;
            let statusLabel = "Pending";
            let statusColor = "text-muted-foreground";

            if (submission) {
              if (submission.status === "GRADED") {
                statusIcon = <CheckCircle2 className="h-4 w-4 text-green-500" />;
                statusLabel = `Graded: ${(submission as any).grade}/${a.maxPoints}`;
                statusColor = "text-green-600";
              } else if (submission.status === "LATE") {
                statusIcon = <AlertCircle className="h-4 w-4 text-yellow-500" />;
                statusLabel = "Submitted (Late)";
                statusColor = "text-yellow-600";
              } else {
                statusIcon = <CheckCircle2 className="h-4 w-4 text-blue-500" />;
                statusLabel = "Submitted";
                statusColor = "text-blue-600";
              }
            } else if (isPastDue) {
              statusIcon = <XCircle className="h-4 w-4 text-destructive" />;
              statusLabel = "Missing";
              statusColor = "text-destructive";
            }

            return (
              <Link key={a.id} href={`/classes/${classId}/assignments/${a.id}`}>
                <Card className="hover:shadow-sm transition-shadow">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{a.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {a.dueDate && (
                          <span className="text-xs text-muted-foreground">
                            Due {timeAgo(a.dueDate)}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {a.maxPoints} pts
                        </span>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1.5 ${statusColor}`}>
                      {statusIcon}
                      <span className="text-sm font-medium">{statusLabel}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
