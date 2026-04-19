import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { timeAgo } from "@/lib/utils";
import { Avatar } from "@/components/shared/Avatar";
import { Users, GraduationCap, Shield } from "lucide-react";
import Link from "next/link";

export default async function MembersPage({
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

  const [educator, members] = await Promise.all([
    prisma.user.findUnique({
      where: { id: classData.educatorId },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        rank: true,
        role: true,
        tagline: true,
      },
    }),
    prisma.classMember.findMany({
      where: { classId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            role: true,
          },
        },
      },
      orderBy: { joinedAt: "asc" },
    }),
  ]);

  const tas = members.filter(
    (m) =>
      m.role === "TEACHING_ASSISTANT" ||
      m.user.role === "TEACHING_ASSISTANT"
  );
  const students = members.filter(
    (m) =>
      m.role !== "TEACHING_ASSISTANT" &&
      m.user.role !== "TEACHING_ASSISTANT"
  );

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link
            href={`/classes/${classId}`}
            className="hover:underline"
          >
            {classData.name}
          </Link>
          <span>/</span>
          <span>People</span>
        </div>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <Users className="h-6 w-6" />
          Class Members
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {members.length + 1} member
          {members.length + 1 !== 1 ? "s" : ""}
        </p>
      </div>

      {educator && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Instructor
          </h2>
          <Card>
            <CardContent className="p-4">
              <Link
                href={`/profile/${educator.username}`}
                className="flex items-center gap-4"
              >
                <Avatar
                  src={educator.image}
                  name={educator.name}
                  size="lg"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">{educator.name}</p>
                  <p className="text-sm text-muted-foreground">
                    @{educator.username}
                  </p>
                  {educator.tagline && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {educator.tagline}
                    </p>
                  )}
                </div>
                <Badge variant="secondary" className="gap-1">
                  <GraduationCap className="h-3 w-3" />
                  Instructor
                </Badge>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}

      {tas.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Teaching Assistants ({tas.length})
          </h2>
          <Card>
            <div className="divide-y">
              {tas.map((m) => (
                <Link
                  key={m.id}
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
                  <Badge variant="outline">TA</Badge>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      )}

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Users className="h-4 w-4" />
          Students ({students.length})
        </h2>
        {students.length === 0 ? (
          <Card className="border-dashed border-2 border-border/50 bg-transparent">
            <CardContent className="py-8 text-center">
              <Users className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No students yet
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <div className="divide-y">
              {students.map((m) => (
                <Link
                  key={m.id}
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
                      Joined {timeAgo(m.joinedAt)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
