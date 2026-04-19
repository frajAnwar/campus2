import Link from "next/link";
import { Calendar, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, timeAgo } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  SUBMITTED: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  GRADED: "bg-green-500/15 text-green-600 dark:text-green-400",
  LATE: "bg-red-500/15 text-red-600 dark:text-red-400",
  MISSING: "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400",
};

interface AssignmentCardProps {
  assignment: {
    id: string;
    title: string;
    dueDate: Date | string;
    status: string;
    submissionStatus?: string;
    classId: string;
    className?: string;
  };
}

export function AssignmentCard({ assignment }: AssignmentCardProps) {
  const isOverdue = new Date(assignment.dueDate) < new Date() && assignment.status === "PENDING";

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/classes/${assignment.classId}/assignments/${assignment.id}`} className="group">
            <h3 className="text-sm font-semibold group-hover:text-primary transition-colors">
              {assignment.title}
            </h3>
          </Link>
          <Badge
            variant="secondary"
            className={cn("text-[10px] px-1.5 py-0 shrink-0", STATUS_STYLES[assignment.status] ?? "bg-zinc-500/15 text-zinc-400")}
          >
            {assignment.status}
          </Badge>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Due {timeAgo(assignment.dueDate)}
          </span>
        </div>

        {assignment.submissionStatus && (
          <div className="flex items-center gap-1.5">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Submission: {assignment.submissionStatus}
            </span>
          </div>
        )}

        {isOverdue && (
          <p className="text-xs text-destructive font-medium">Overdue</p>
        )}
      </CardContent>
    </Card>
  );
}
