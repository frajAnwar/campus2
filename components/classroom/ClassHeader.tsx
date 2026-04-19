import { Badge } from "@/components/ui/badge";
import { GraduationCap, Users, Calendar, MapPin } from "lucide-react";

interface ClassHeaderProps {
  name: string;
  description?: string | null;
  educatorName: string;
  universityName?: string;
  term?: string | null;
  memberCount: number;
}

export function ClassHeader({
  name,
  description,
  educatorName,
  universityName,
  term,
  memberCount,
}: ClassHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-[2.5rem] bg-white dark:bg-slate-900 p-8 md:p-12 shadow-sm border border-border/40">
      {/* Subtle decorative background */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20" />
      
      <div className="relative z-10 space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-bold px-3 py-1">
            Active Course
          </Badge>
          {term && (
            <Badge variant="outline" className="border-border/50 text-muted-foreground font-medium px-3 py-1">
              {term}
            </Badge>
          )}
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl md:text-5xl font-display font-bold tracking-tight text-slate-900 dark:text-white">
            {name}
          </h1>
          {description && (
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl text-base leading-relaxed">
              {description}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-y-4 gap-x-8 pt-4 border-t border-border/40">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-none">Instructor</p>
              <p className="text-sm font-bold mt-1">{educatorName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Users className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-none">Classmates</p>
              <p className="text-sm font-bold mt-1">{memberCount} Students</p>
            </div>
          </div>

          {universityName && (
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-none">University</p>
                <p className="text-sm font-bold mt-1">{universityName}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
