import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { timeAgo } from "@/lib/utils";
import {
  Clock,
  FileText,
  CheckCircle2,
  AlertCircle,
  Send,
  GraduationCap,
} from "lucide-react";
import Link from "next/link";
import { ExplainButton } from "./explain-button";
import { SubmissionFormWrapper } from "./submission-form";

export default async function AssignmentDetailPage({
  params,
}: {
  params: Promise<{ classId: string; assignmentId: string }>;
}) {
  const { classId, assignmentId } = await params;
  const session = await auth();
  if (!session?.user) return null;

  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: {
      class: {
        select: { id: true, name: true, educatorId: true },
      },
      submissions: {
        where: { studentId: session.user.id },
      },
    },
  });

  if (!assignment || assignment.classId !== classId) notFound();

  const isEducator = assignment.class.educatorId === session.user.id;
  const submission = assignment.submissions[0];
  const now = new Date();
  const isPastDue = assignment.dueDate ? now > assignment.dueDate : false;
  const dueMs = assignment.dueDate
    ? assignment.dueDate.getTime() - now.getTime()
    : null;

  let dueDisplay = "";
  if (dueMs !== null) {
    if (dueMs < 0) {
      dueDisplay = `Overdue by ${timeAgo(assignment.dueDate!)}`;
    } else if (dueMs < 86400000) {
      const hours = Math.floor(dueMs / 3600000);
      const mins = Math.floor((dueMs % 3600000) / 60000);
      dueDisplay = `Due in ${hours}h ${mins}m`;
    } else {
      dueDisplay = `Due ${timeAgo(assignment.dueDate!)}`;
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link
              href={`/classes/${classId}`}
              className="hover:underline"
            >
              {assignment.class.name}
            </Link>
            <span>/</span>
            <span>Assignments</span>
          </div>
          <h1 className="text-3xl font-display font-bold tracking-tight">
            {assignment.title}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <Badge
              variant={isPastDue ? "destructive" : "secondary"}
              className="gap-1 rounded-lg px-3 py-1"
            >
              <Clock className="h-3 w-3" />
              {dueDisplay || "No due date"}
            </Badge>
            <Badge
              variant="outline"
              className="rounded-lg px-3 py-1 font-bold"
            >
              {assignment.maxPoints} pts
            </Badge>
            <Badge
              variant={
                assignment.status === "PUBLISHED"
                  ? "default"
                  : assignment.status === "CLOSED"
                    ? "destructive"
                    : "secondary"
              }
              className="rounded-lg px-3 py-1 font-bold uppercase tracking-widest text-[10px]"
            >
              {assignment.status}
            </Badge>
          </div>
        </div>
        <ExplainButton assignmentId={assignmentId} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Assignment Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap leading-relaxed">
                {assignment.description}
              </div>
            </CardContent>
          </Card>

          {assignment.rubric && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Grading Rubric</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-muted rounded-lg border">
                  <pre className="text-sm overflow-auto font-mono">
                    {JSON.stringify(assignment.rubric, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {isEducator ? (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  Instructor Panel
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Manage submissions and grade student work.
                </p>
                <Link
                  href={`/classes/${classId}/assignments/${assignmentId}/submissions`}
                >
                  <Badge className="w-full flex items-center justify-center h-10 rounded-lg cursor-pointer hover:bg-primary/90">
                    View All Submissions
                  </Badge>
                </Link>
              </CardContent>
            </Card>
          ) : submission ? (
            <Card className="border-emerald-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  {submission.status === "GRADED" ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <AlertCircle className="h-5 w-5" />
                  )}
                  Your Submission
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={
                      submission.status === "GRADED"
                        ? "default"
                        : submission.status === "LATE"
                          ? "destructive"
                          : "secondary"
                    }
                    className="rounded-lg px-3 py-1 text-xs uppercase font-bold"
                  >
                    {submission.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground py-1">
                    Submitted {timeAgo(submission.submittedAt)}
                  </span>
                </div>

                {submission.grade !== null && (
                  <div className="p-6 bg-primary/5 rounded-xl border border-primary/10 text-center">
                    <p className="text-4xl font-black text-primary">
                      {submission.grade}
                      <span className="text-lg text-muted-foreground">
                        /{assignment.maxPoints}
                      </span>
                    </p>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-2">
                      Final Grade
                    </p>
                  </div>
                )}

                {submission.feedback && (
                  <div className="p-4 bg-muted rounded-xl border">
                    <p className="text-xs font-bold uppercase text-muted-foreground mb-2">
                      Feedback
                    </p>
                    <p className="text-sm leading-relaxed italic">
                      &quot;{submission.feedback}&quot;
                    </p>
                  </div>
                )}

                {assignment.allowResubmit &&
                  submission.status !== "GRADED" && (
                    <SubmissionFormWrapper
                      assignmentId={assignmentId}
                      classId={classId}
                    />
                  )}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-primary">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Submit Work
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isPastDue && !assignment.allowLate ? (
                  <div className="rounded-xl bg-destructive/10 p-4 border border-destructive/20 text-sm text-destructive font-medium text-center">
                    The deadline has passed and late submissions are not
                    allowed.
                  </div>
                ) : (
                  <SubmissionFormWrapper
                    assignmentId={assignmentId}
                    classId={classId}
                  />
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
