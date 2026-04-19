import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { timeAgo } from "@/lib/utils";
import {
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/shared/Avatar";
import { SubmissionsList } from "./SubmissionsList";

export default async function AssignmentSubmissionsPage({
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
      class: { select: { name: true, educatorId: true } },
      submissions: {
        include: {
          student: {
            select: { id: true, name: true, username: true, image: true },
          },
        },
        orderBy: { submittedAt: "desc" },
      },
    },
  });

  if (!assignment || assignment.classId !== classId) notFound();

  const isEducator = assignment.class.educatorId === session.user.id;
  if (!isEducator) redirect(`/classes/${classId}/assignments/${assignmentId}`);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <Link 
            href={`/classes/${classId}/assignments/${assignmentId}`}
            className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest mb-4"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to Assignment
          </Link>
          <h1 className="text-3xl font-display font-bold tracking-tight">Student Submissions</h1>
          <p className="text-muted-foreground">{assignment.title} &bull; {assignment.class.name}</p>
        </div>

        <div className="flex gap-4">
           <div className="px-6 py-4 bg-primary/5 rounded-2xl border border-primary/10 text-center">
              <p className="text-2xl font-black text-primary">{assignment.submissions.length}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Received</p>
           </div>
           <div className="px-6 py-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 text-center">
              <p className="text-2xl font-black text-emerald-600">{assignment.submissions.filter(s => s.status === "GRADED").length}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Graded</p>
           </div>
        </div>
      </div>

      <SubmissionsList submissions={assignment.submissions} assignment={assignment} />
    </div>
  );
}
