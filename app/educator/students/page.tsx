import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/shared/Avatar";
import { Users, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default async function EducatorStudentsPage() {
  const session = await auth();
  if (!session?.user) return null;

  const classes = await prisma.class.findMany({
    where: { educatorId: session.user.id },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
              email: true,
              role: true,
              xp: true,
              rank: true
            }
          }
        }
      }
    }
  });

  const allStudents = classes.flatMap(c => c.members.map(m => ({
    ...m.user,
    className: c.name,
    classId: c.id
  })));

  const uniqueStudents = Array.from(new Map(allStudents.map(s => [s.id, s])).values());

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold">Students</h1>
        <p className="text-muted-foreground mt-1">View and manage students across all your classes</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search students..." className="pl-10" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {uniqueStudents.map((student) => (
          <Card key={student.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Avatar src={student.image} name={student.name} size="lg" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-lg">{student.name}</p>
                  <p className="text-sm text-muted-foreground">@{student.username}</p>
                  <Badge variant="secondary" className="mt-2">{student.className}</Badge>
                  
                  <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                    <span>XP: {student.xp}</span>
                    <span className="capitalize">{student.rank.toLowerCase()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
