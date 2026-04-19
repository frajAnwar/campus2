import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, Clock, Plus, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/shared/Avatar";

interface EducatorDashboardProps {
  user: any;
  data: any;
}

export function EducatorDashboard({ user, data }: EducatorDashboardProps) {
  // data would include educator specific stats, classes, and pending grades
  const { classes = [], pendingGrades = 0 } = data;
  
  const totalStudents = classes.reduce((acc: number, cls: any) => acc + (cls._count?.members || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-indigo-950 p-10 text-white shadow-2xl">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/20 blur-[80px]" />
        <div className="relative z-10 space-y-4">
          <Badge className="bg-indigo-500/20 text-indigo-300 border-none px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
            Instructor Portal
          </Badge>
          <h1 className="text-3xl md:text-5xl font-display font-bold tracking-tight">
            Welcome, Professor {user.name?.split(" ").pop()}
          </h1>
          <p className="text-indigo-300/80 text-sm max-w-md leading-relaxed">
            Manage your courses, track student progress, and provide impactful feedback all in one workspace.
          </p>
          <div className="flex gap-4 pt-4">
            <Link href="/classes/create">
              <button className="flex items-center gap-2 bg-white text-indigo-950 px-6 py-3 rounded-xl text-xs font-bold hover:bg-slate-100 transition-all shadow-xl">
                Create New Class
                <Plus className="h-4 w-4" />
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-border/40 p-6 rounded-[2rem] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Total Students</p>
            <p className="text-3xl font-bold mt-2">{totalStudents}</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
            <Users className="h-6 w-6 text-blue-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-border/40 p-6 rounded-[2rem] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Active Courses</p>
            <p className="text-3xl font-bold mt-2">{classes.length}</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-indigo-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-border/40 p-6 rounded-[2rem] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Pending Grades</p>
            <p className="text-3xl font-bold mt-2">{pendingGrades}</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-orange-500/10 flex items-center justify-center">
            <Clock className="h-6 w-6 text-orange-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-display font-bold px-2">Your Classes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {classes.map((cls: any) => (
              <Card key={cls.id} className="overflow-hidden border-none bg-white dark:bg-slate-900 ring-1 ring-border/40 rounded-[2rem] group hover:ring-primary/40 transition-all">
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {cls.name[0]}
                    </div>
                    <Badge variant="secondary" className="text-[10px] font-bold">{cls.term}</Badge>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg group-hover:text-primary transition-colors">{cls.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{cls.description}</p>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs font-medium text-muted-foreground">{cls._count.members} Students</span>
                    <Link href={`/classes/${cls.id}`} className="text-xs font-bold text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Go to Class <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-display font-bold px-2">Pending Tasks</h3>
          <Card className="rounded-[2rem] border-none ring-1 ring-border/40 bg-card/50 backdrop-blur-sm overflow-hidden">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">Urgent</span>
                  <p className="text-sm font-bold">Grade Python HW #1</p>
                  <p className="text-xs text-muted-foreground">8 submissions waiting for review</p>
                </div>
                <button className="w-full bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white rounded-xl py-2.5 text-xs font-bold hover:opacity-90 transition-all">
                  Start Grading
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
