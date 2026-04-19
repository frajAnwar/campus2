import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, Plus } from "lucide-react";
import Link from "next/link";

export default async function EducatorClassesPage() {
  const session = await auth();
  if (!session?.user) return null;

  const classes = await prisma.class.findMany({
    where: { educatorId: session.user.id },
    include: {
      university: { select: { name: true } },
      _count: { select: { members: true, assignments: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">My Classes</h1>
          <p className="text-muted-foreground mt-1">Manage your courses and class materials</p>
        </div>
        <Link href="/educator/classes/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create New Class
          </Button>
        </Link>
      </div>

      {classes.length === 0 ? (
        <Card className="border-dashed border-2 border-border/50 bg-transparent">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BookOpen className="h-16 w-16 text-muted-foreground/40 mb-4" />
            <h3 className="text-xl font-semibold">No classes yet</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm text-center">
              Create your first class to start managing your course materials and students
            </p>
            <Button className="mt-6">
              <Plus className="h-4 w-4 mr-2" />
              Create Class
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => (
            <Link key={cls.id} href={`/educator/classes/${cls.id}`}>
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl">{cls.name}</CardTitle>
                  {cls.university && (
                    <p className="text-sm text-muted-foreground">{cls.university.name}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4" />
                      <span>{cls._count.members} students</span>
                    </div>
                    <Badge variant="secondary">{cls._count.assignments} assignments</Badge>
                  </div>
                  {cls.term && <Badge variant="outline">{cls.term}</Badge>}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
