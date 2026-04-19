import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { timeAgo } from "@/lib/utils";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Edit,
  Trash2,
  FileText,
  Star,
} from "lucide-react";
import Link from "next/link";
import { SubmissionList } from "./_components/SubmissionList";

type Params = Promise<{ classId: string; assignmentId: string }>;

export default async function AssignmentDetailPage({
  params,
}: {
  params: Params;
}) {
  const { classId, assignmentId } = await params;
  const session = await auth();
  if (!session?.user) return null;

  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: { class: { select: { educatorId: true } } },
  });

  if (
    !assignment ||
    assignment.classId !== classId ||
    assignment.class.educatorId !== session.user.id
  ) {
    notFound();
  }

  const submissions = await prisma.submission.findMany({
    where: { assignmentId },
    include: {
      student: {
        select: { id: true, name: true, image: true, username: true },
      },
    },
    orderBy: { submittedAt: "desc" },
  });

  const isPastDue = assignment.dueDate
    ? new Date() > assignment.dueDate
    : false;

  const statusColors: Record<string, string> = {
    PUBLISHED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    DRAFT: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    CLOSED: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/educator/classes/${classId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-display font-bold">
              {assignment.title}
            </h1>
            <Badge
              variant="secondary"
              className={statusColors[assignment.status] || ""}
            >
              {assignment.status}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">{assignment.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <SubmissionList
            submissions={submissions.map((s) => ({
              id: s.id,
              content: s.content,
              githubUrl: s.githubUrl,
              fileUrl: s.fileUrl,
              status: s.status,
              grade: s.grade,
              feedback: s.feedback,
              submittedAt: s.submittedAt,
              student: s.student,
            }))}
            maxPoints={assignment.maxPoints}
            assignmentId={assignmentId}
            classId={classId}
          />
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Assignment Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Max Points</span>
                <span className="font-semibold">{assignment.maxPoints}</span>
              </div>
              {assignment.dueDate && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Due Date</span>
                  <span
                    className={`font-medium ${
                      isPastDue ? "text-destructive" : ""
                    }`}
                  >
                    {new Date(assignment.dueDate).toLocaleDateString()}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Submissions</span>
                <span className="font-semibold">{submissions.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Type</span>
                <span className="font-medium">{assignment.submissionType}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Late Allowed</span>
                <span className="font-medium">
                  {assignment.allowLate ? "Yes" : "No"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-2">
              <Link
                href={`/educator/classes/${classId}/assignments/${assignmentId}/edit`}
              >
                <Button variant="outline" size="sm" className="w-full">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Assignment
                </Button>
              </Link>
              <form
                action={async () => {
                  "use server";
                  const { deleteAssignment } = await import(
                    "@/actions/assignment"
                  );
                  await deleteAssignment(assignmentId);
                }}
              >
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full"
                  type="submit"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Assignment
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
