import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  ClassStream,
  type ClassPost,
} from "./_components/ClassStream";
import { ClassworkTab, type ClassAssignment } from "./_components/ClassworkTab";
import { PeopleTab, type ClassMemberWithUser } from "./_components/PeopleTab";
import { GradesTab, type GradesAssignmentData } from "./_components/GradesTab";
import { ClassHeader } from "./_components/ClassHeader";

type Params = Promise<{ classId: string }>;

export default async function EducatorClassDetailPage({
  params,
}: {
  params: Params;
}) {
  const { classId } = await params;
  const session = await auth();
  if (!session?.user) return null;

  const classData = await prisma.class.findUnique({
    where: { id: classId },
    include: {
      educator: {
        select: { id: true, name: true, image: true },
      },
      university: { select: { name: true } },
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
              email: true,
            },
          },
        },
      },
      _count: {
        select: { members: true, assignments: true, posts: true },
      },
    },
  });

  if (!classData || classData.educatorId !== session.user.id) {
    notFound();
  }

  const [assignments, posts] = await Promise.all([
    prisma.assignment.findMany({
      where: { classId },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { submissions: true } },
      },
    }),
    prisma.post.findMany({
      where: { classId },
      include: {
        author: { select: { id: true, name: true, image: true } },
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const studentCount = classData.members.length;

  const pendingGradeCount = await prisma.submission.count({
    where: {
      assignment: { classId },
      status: { in: ["SUBMITTED", "LATE"] },
    },
  });

  const gradesData: GradesAssignmentData[] = await Promise.all(
    assignments.map(async (a) => {
      const subs = await prisma.submission.findMany({
        where: { assignmentId: a.id },
        include: {
          student: {
            select: { id: true, name: true, image: true },
          },
        },
      });
      return {
        assignment: {
          id: a.id,
          title: a.title,
          maxPoints: a.maxPoints,
          status: a.status,
          dueDate: a.dueDate,
        },
        submissions: subs.map((s) => ({
          id: s.id,
          studentId: s.studentId,
          student: s.student,
          status: s.status,
          grade: s.grade,
          submittedAt: s.submittedAt,
        })),
      };
    })
  );

  const typedPosts: ClassPost[] = posts.map((p) => ({
    id: p.id,
    title: p.title,
    body: p.body,
    createdAt: p.createdAt,
    author: p.author,
    _count: { comments: p._count.comments },
  }));

  const typedAssignments: ClassAssignment[] = assignments.map((a) => ({
    id: a.id,
    title: a.title,
    description: a.description,
    dueDate: a.dueDate,
    status: a.status,
    maxPoints: a.maxPoints,
    createdAt: a.createdAt,
    submissionCount: a._count.submissions,
  }));

  const typedMembers: ClassMemberWithUser[] = classData.members.map((m) => ({
    userId: m.userId,
    classId: m.classId,
    role: m.role,
    joinedAt: m.joinedAt,
    user: m.user,
  }));

  return (
    <div className="space-y-0">
      <ClassHeader
        classData={classData}
        studentCount={studentCount}
        assignmentCount={classData._count.assignments}
        pendingGradeCount={pendingGradeCount}
      />

      <div className="px-8 pb-8">
        <Tabs defaultValue="stream" className="w-full">
          <TabsList className="w-full justify-start bg-transparent border-b h-auto p-0 rounded-none">
            <TabsTrigger
              value="stream"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 px-6"
            >
              Stream
            </TabsTrigger>
            <TabsTrigger
              value="classwork"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 px-6"
            >
              Classwork
            </TabsTrigger>
            <TabsTrigger
              value="people"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 px-6"
            >
              People
            </TabsTrigger>
            <TabsTrigger
              value="grades"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 px-6"
            >
              Grades
              {pendingGradeCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {pendingGradeCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stream" className="mt-6">
            <ClassStream
              posts={typedPosts}
              classId={classId}
              educatorName={classData.educator.name}
              educatorImage={classData.educator.image}
            />
          </TabsContent>

          <TabsContent value="classwork" className="mt-6">
            <ClassworkTab
              assignments={typedAssignments}
              classId={classId}
              studentCount={studentCount}
            />
          </TabsContent>

          <TabsContent value="people" className="mt-6">
            <PeopleTab
              educator={classData.educator}
              members={typedMembers}
              classId={classId}
              enrollmentCode={classData.enrollmentCode}
            />
          </TabsContent>

          <TabsContent value="grades" className="mt-6">
            <GradesTab
              gradesData={gradesData}
              studentCount={studentCount}
              classId={classId}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
