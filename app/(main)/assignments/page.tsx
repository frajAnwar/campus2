import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/shared/Avatar";
import { timeAgo, truncate } from "@/lib/utils";
import {
  Calendar,
  Clock,
  BookOpen,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { PageWrapper } from "@/components/layout/PageWrapper";

export default async function AssignmentsPage() {
  const session = await auth();
  if (!session?.user) return null;

  // Get all assignments from user's classes
  const classMemberships = await prisma.classMember.findMany({
    where: { userId: session.user.id },
    select: { classId: true },
  });

  const classIds = classMemberships.map(m => m.classId);

  const assignments = await prisma.assignment.findMany({
    where: {
      classId: { in: classIds },
      status: "PUBLISHED",
    },
    include: {
      class: {
        select: { name: true },
      },
      submissions: {
        where: { studentId: session.user.id },
        take: 1,
      },
    },
    orderBy: { dueDate: "asc" },
    take: 50,
  });

  const now = new Date();

  return (
    <PageWrapper title="Assignments">
      {assignments.length === 0 ? (
        <Card hoverable={false}>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No assignments found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {assignments.map((assignment) => {
            const isSubmitted = assignment.submissions.length > 0;
            const isOverdue = assignment.dueDate && new Date(assignment.dueDate) < now;
            const isDueSoon = assignment.dueDate && 
              new Date(assignment.dueDate) > now && 
              new Date(assignment.dueDate).getTime() - now.getTime() < 48 * 60 * 60 * 1000;

            return (
              <Link 
                key={assignment.id} 
                href={`/classes/${assignment.classId}/assignments/${assignment.id}`}
              >
                <Card hoverable>
                  <CardContent className="flex items-center gap-4 pt-4">
                    <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      {isSubmitted ? (
                        <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                      ) : isOverdue ? (
                        <AlertCircle className="h-6 w-6 text-red-500" />
                      ) : isDueSoon ? (
                        <Clock className="h-6 w-6 text-amber-500" />
                      ) : (
                        <BookOpen className="h-6 w-6 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{assignment.title}</h3>
                          <p className="text-sm text-muted-foreground">{assignment.class.name}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {isSubmitted ? (
                            <Badge variant="default" className="bg-emerald-500">Submitted</Badge>
                          ) : isOverdue ? (
                            <Badge variant="destructive">Overdue</Badge>
                          ) : isDueSoon ? (
                            <Badge variant="default" className="bg-amber-500">Due Soon</Badge>
                          ) : null}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        {assignment.dueDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Due: {new Date(assignment.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </PageWrapper>
  );
}
