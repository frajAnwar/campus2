import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Calendar,
  Clock,
  FileText,
  CheckCircle,
  Users,
} from "lucide-react";
import Link from "next/link";
import { timeAgo } from "@/lib/utils";
import { EmptyState } from "@/components/shared/EmptyState";

export interface ClassAssignment {
  id: string;
  title: string;
  description: string;
  dueDate: Date | null;
  status: string;
  maxPoints: number;
  createdAt: Date | string;
  submissionCount: number;
}

interface ClassworkTabProps {
  assignments: ClassAssignment[];
  classId: string;
  studentCount: number;
}

const statusColors: Record<string, string> = {
  PUBLISHED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  DRAFT: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  CLOSED: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
};

export function ClassworkTab({
  assignments,
  classId,
  studentCount,
}: ClassworkTabProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Classwork</h2>
        <Link href={`/educator/classes/${classId}/assignments/new`}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Assignment
          </Button>
        </Link>
      </div>

      {assignments.length === 0 ? (
        <EmptyState
          title="No assignments yet"
          description="Create your first assignment to start tracking student work."
          actionLabel="Create Assignment"
          actionHref={`/educator/classes/${classId}/assignments/new`}
        />
      ) : (
        <div className="space-y-3">
          {assignments.map((assignment) => {
            const isPastDue =
              assignment.dueDate && new Date(assignment.dueDate) < new Date();
            return (
              <Link
                key={assignment.id}
                href={`/educator/classes/${classId}/assignments/${assignment.id}`}
              >
                <Card className="hover:shadow-sm transition-shadow cursor-pointer group">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="mt-0.5 rounded-lg bg-primary/10 p-2.5">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold group-hover:text-primary transition-colors">
                              {assignment.title}
                            </h3>
                            <Badge
                              variant="secondary"
                              className={statusColors[assignment.status] || ""}
                            >
                              {assignment.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {assignment.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                            {assignment.dueDate && (
                              <span
                                className={`flex items-center gap-1 ${
                                  isPastDue ? "text-destructive" : ""
                                }`}
                              >
                                <Calendar className="h-3.5 w-3.5" />
                                Due{" "}
                                {new Date(
                                  assignment.dueDate
                                ).toLocaleDateString()}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Users className="h-3.5 w-3.5" />
                              {assignment.submissionCount}/{studentCount}{" "}
                              submitted
                            </span>
                            <span>{assignment.maxPoints} pts</span>
                          </div>
                        </div>
                      </div>
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
