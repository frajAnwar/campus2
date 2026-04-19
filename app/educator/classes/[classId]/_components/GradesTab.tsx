import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/shared/Avatar";
import { timeAgo } from "@/lib/utils";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface GradesSubmission {
  id: string;
  studentId: string;
  student: { id: string; name: string; image: string | null };
  status: string;
  grade: number | null;
  submittedAt: Date | string;
}

export interface GradesAssignmentData {
  assignment: {
    id: string;
    title: string;
    maxPoints: number;
    status: string;
    dueDate: Date | null;
  };
  submissions: GradesSubmission[];
}

interface GradesTabProps {
  gradesData: GradesAssignmentData[];
  studentCount: number;
  classId: string;
}

const submissionStatusIcon = (status: string) => {
  switch (status) {
    case "GRADED":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "SUBMITTED":
      return <Clock className="h-4 w-4 text-amber-500" />;
    case "LATE":
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    case "RESUBMITTED":
      return <Clock className="h-4 w-4 text-blue-500" />;
    default:
      return <div className="h-4 w-4 rounded-full bg-muted-foreground/20" />;
  }
};

const submissionStatusLabel = (status: string) => {
  switch (status) {
    case "GRADED":
      return "Graded";
    case "SUBMITTED":
      return "Submitted";
    case "LATE":
      return "Late";
    case "RESUBMITTED":
      return "Resubmitted";
    default:
      return "Not submitted";
  }
};

export function GradesTab({
  gradesData,
  studentCount,
  classId,
}: GradesTabProps) {
  if (gradesData.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p>No assignments to grade yet.</p>
            <p className="text-sm mt-1">
              Create assignments to see the gradebook here.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {gradesData.map((item) => {
        const pendingCount = item.submissions.filter(
          (s) => s.status === "SUBMITTED" || s.status === "LATE"
        ).length;
        const gradedCount = item.submissions.filter(
          (s) => s.status === "GRADED"
        ).length;

        return (
          <Card key={item.assignment.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-base">
                    <Link
                      href={`/educator/classes/${classId}/assignments/${item.assignment.id}`}
                      className="hover:text-primary transition-colors"
                    >
                      {item.assignment.title}
                    </Link>
                  </CardTitle>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>{item.assignment.maxPoints} pts</span>
                    {item.assignment.dueDate && (
                      <span>
                        Due:{" "}
                        {new Date(
                          item.assignment.dueDate
                        ).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {pendingCount > 0 && (
                    <Badge variant="destructive">
                      {pendingCount} pending
                    </Badge>
                  )}
                  <Badge variant="secondary">
                    {gradedCount}/{studentCount} graded
                  </Badge>
                  <Link
                    href={`/educator/classes/${classId}/assignments/${item.assignment.id}`}
                  >
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {item.submissions.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No submissions yet
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="text-right">Grade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {item.submissions.map((sub) => (
                      <TableRow key={sub.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar
                              src={sub.student.image}
                              name={sub.student.name}
                              size="sm"
                            />
                            <span className="font-medium text-sm">
                              {sub.student.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {submissionStatusIcon(sub.status)}
                            <span className="text-sm">
                              {submissionStatusLabel(sub.status)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {timeAgo(sub.submittedAt)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {sub.grade !== null
                            ? `${sub.grade}/${item.assignment.maxPoints}`
                            : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
