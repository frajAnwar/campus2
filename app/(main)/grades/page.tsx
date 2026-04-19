import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Award,
  BookOpen,
} from "lucide-react";

export default async function GradesPage() {
  const session = await auth();
  if (!session?.user) return null;

  // Get all submissions with grades
  const submissions = await prisma.submission.findMany({
    where: { 
      studentId: session.user.id,
      grade: { not: null },
    },
    include: {
      assignment: {
        select: { 
          title: true, 
          maxPoints: true,
          class: { select: { name: true } },
        },
      },
    },
    orderBy: { gradedAt: "desc" },
    take: 50,
  });

  // Calculate GPA
  const totalPoints = submissions.reduce((sum, s) => sum + (s.grade || 0), 0);
  const maxPossible = submissions.reduce((sum, s) => sum + s.assignment.maxPoints, 0);
  const percentage = maxPossible > 0 ? (totalPoints / maxPossible) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">Grades</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Overall Average</p>
              <p className="text-4xl font-bold">{percentage.toFixed(1)}%</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Total Assignments</p>
              <p className="text-4xl font-bold">{submissions.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Points Earned</p>
              <p className="text-4xl font-bold">{totalPoints.toFixed(0)} / {maxPossible}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Grades</CardTitle>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <div className="py-12 text-center">
              <Award className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No grades available yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {submissions.map((submission) => (
                <div key={submission.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{submission.assignment.title}</p>
                      <p className="text-sm text-muted-foreground">{submission.assignment.class.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={submission.grade! >= submission.assignment.maxPoints * 0.7 ? "default" : "destructive"}>
                      {submission.grade} / {submission.assignment.maxPoints}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
