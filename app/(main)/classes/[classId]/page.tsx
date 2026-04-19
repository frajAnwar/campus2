import type { ReactNode } from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar } from "@/components/shared/Avatar";
import { timeAgo, cn } from "@/lib/utils";
import {
  BookOpen,
  Users,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  GraduationCap,
  Calendar,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";
import { ClassHeader } from "@/components/classroom/ClassHeader";
import { ShareWithClassForm } from "./ShareWithClassForm";
import { ExplainButton } from "./assignments/[assignmentId]/explain-button";

export default async function ClassDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ classId: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { classId } = await params;
  const { tab } = await searchParams;
  const session = await auth();
  if (!session?.user) return null;

  const classData = await prisma.class.findUnique({
    where: { id: classId },
    include: {
      educator: {
        select: {
          id: true,
          name: true,
          image: true,
          username: true,
        },
      },
      university: { select: { name: true } },
      members: {
        select: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
            },
          },
        },
        orderBy: { joinedAt: "asc" },
      },
      _count: { select: { members: true, assignments: true } },
    },
  });

  if (!classData) notFound();

  const [posts, assignments] = await Promise.all([
    prisma.post.findMany({
      where: { classId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            role: true,
          },
        },
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.assignment.findMany({
      where: { classId, status: "PUBLISHED" },
      include: {
        submissions: {
          where: { studentId: session.user.id },
          select: { id: true, status: true, grade: true },
        },
      },
      orderBy: { dueDate: "asc" },
    }),
  ]);

  const now = new Date();
  const upcoming = assignments.filter(
    (a) => !a.dueDate || a.dueDate > now
  );
  const pastDue = assignments.filter(
    (a) => a.dueDate && a.dueDate <= now
  );

  function getSubmissionStatus(
    assignment: (typeof assignments)[0]
  ) {
    const sub = assignment.submissions[0];
    if (!sub) {
      const isPast = assignment.dueDate && assignment.dueDate <= now;
      return {
        label: isPast ? "Missing" : "Not submitted",
        color: isPast
          ? "text-destructive"
          : "text-muted-foreground",
        icon: isPast ? (
          <XCircle className="h-4 w-4" />
        ) : (
          <Clock className="h-4 w-4" />
        ),
      };
    }
    switch (sub.status) {
      case "GRADED":
        return {
          label: `Graded: ${sub.grade}/${assignment.maxPoints}`,
          color: "text-green-600 dark:text-green-400",
          icon: <CheckCircle2 className="h-4 w-4" />,
        };
      case "LATE":
        return {
          label: "Late",
          color: "text-yellow-600 dark:text-yellow-400",
          icon: <AlertCircle className="h-4 w-4" />,
        };
      default:
        return {
          label: "Submitted",
          color: "text-blue-600 dark:text-blue-400",
          icon: <CheckCircle2 className="h-4 w-4" />,
        };
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <ClassHeader
        name={classData.name}
        description={classData.description}
        educatorName={classData.educator.name || "Professor"}
        universityName={classData.university?.name}
        term={classData.term}
        memberCount={classData._count.members}
      />

      <Tabs defaultValue={tab || "stream"} className="w-full">
        <TabsList className="w-full bg-muted/50 p-1 h-auto">
          {[
            {
              value: "stream",
              icon: MessageSquare,
              label: "Stream",
            },
            {
              value: "classwork",
              icon: BookOpen,
              label: "Classwork",
            },
            { value: "people", icon: Users, label: "People" },
          ].map((t) => (
            <TabsTrigger
              key={t.value}
              value={t.value}
              className="flex-1 py-2.5 data-[state=active]:bg-background"
            >
              <t.icon className="size-4 mr-2" />
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="stream" className="mt-6 space-y-4">
          <ShareWithClassForm
            classId={classId}
            userName={session.user.name || "You"}
            userImage={session.user.image}
          />

          {posts.length === 0 ? (
            <Card className="border-dashed border-2 border-border/50 bg-transparent">
              <CardContent className="py-12 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                <h3 className="font-semibold">No posts yet</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Be the first to share something with the class
                </p>
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => {
              const isInstructor =
                post.authorId === classData.educatorId ||
                ["EDUCATOR", "TEACHING_ASSISTANT"].includes(
                  post.author.role ?? ""
                );
              return (
                <Card
                  key={post.id}
                  className={cn(
                    "transition-colors",
                    isInstructor &&
                      "border-primary/20 bg-primary/[0.02] dark:bg-primary/[0.04]"
                  )}
                >
                  <CardContent className="p-6 space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={post.author.image}
                        name={post.author.name}
                        size="sm"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-sm">
                            {post.author.name}
                          </p>
                          {isInstructor && (
                            <Badge className="bg-primary text-[10px] px-1.5 py-0">
                              Instructor
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {timeAgo(post.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <h4 className="font-semibold">{post.title}</h4>
                    <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {post.body}
                    </div>

                    <div className="flex items-center gap-2 pt-2 text-sm text-muted-foreground">
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span>
                        {post._count.comments}{" "}
                        {post._count.comments === 1
                          ? "comment"
                          : "comments"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="classwork" className="mt-6 space-y-6">
          {assignments.length === 0 ? (
            <Card className="border-dashed border-2 border-border/50 bg-transparent">
              <CardContent className="py-12 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                <h3 className="font-semibold">No assignments yet</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Check back later for published assignments
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {upcoming.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Upcoming ({upcoming.length})
                  </h3>
                  <div className="space-y-2">
                    {upcoming.map((a) => {
                      const status = getSubmissionStatus(a);
                      return (
                        <AssignmentRow
                          key={a.id}
                          assignment={a}
                          classId={classId}
                          status={status}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {pastDue.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Past Due ({pastDue.length})
                  </h3>
                  <div className="space-y-2">
                    {pastDue.map((a) => {
                      const status = getSubmissionStatus(a);
                      return (
                        <AssignmentRow
                          key={a.id}
                          assignment={a}
                          classId={classId}
                          status={status}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="people" className="mt-6 space-y-6">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Instructor
            </h3>
            <Card>
              <CardContent className="p-4">
                <Link
                  href={`/profile/${classData.educator.username}`}
                  className="flex items-center gap-3"
                >
                  <Avatar
                    src={classData.educator.image}
                    name={classData.educator.name}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">
                      {classData.educator.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      @{classData.educator.username}
                    </p>
                  </div>
                  <Badge variant="secondary">Instructor</Badge>
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Users className="h-4 w-4" />
              Classmates ({classData.members.length})
            </h3>
            {classData.members.length === 0 ? (
              <Card className="border-dashed border-2 border-border/50 bg-transparent">
                <CardContent className="py-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    No classmates yet
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <div className="divide-y">
                  {classData.members.map((m) => (
                    <Link
                      key={m.user.id}
                      href={`/profile/${m.user.username}`}
                      className="flex items-center gap-3 p-3 hover:bg-accent/50 transition-colors"
                    >
                      <Avatar
                        src={m.user.image}
                        name={m.user.name}
                        size="sm"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">
                          {m.user.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          @{m.user.username}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AssignmentRow({
  assignment,
  classId,
  status,
}: {
  assignment: {
    id: string;
    title: string;
    dueDate: Date | null;
    maxPoints: number;
    submissions: { status: string; grade: number | null }[];
  };
  classId: string;
  status: {
    label: string;
    color: string;
    icon: ReactNode;
  };
}) {
  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className="size-10 rounded-lg bg-muted flex flex-col items-center justify-center shrink-0">
              <Calendar className="size-3.5 text-muted-foreground" />
              <span className="text-[10px] font-bold leading-none mt-0.5">
                {assignment.dueDate
                  ? new Date(assignment.dueDate).getDate()
                  : "--"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <Link
                href={`/classes/${classId}/assignments/${assignment.id}`}
                className="font-medium hover:text-primary transition-colors"
              >
                {assignment.title}
              </Link>
              <div className="flex items-center gap-3 mt-1">
                {assignment.dueDate && (
                  <span className="text-xs text-muted-foreground">
                    Due {timeAgo(assignment.dueDate)}
                  </span>
                )}
                <span className="text-xs text-muted-foreground">
                  {assignment.maxPoints} pts
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div
              className={cn(
                "flex items-center gap-1.5 text-sm font-medium",
                status.color
              )}
            >
              {status.icon}
              <span className="hidden sm:inline">{status.label}</span>
            </div>
            <ExplainButton assignmentId={assignment.id} compact />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
