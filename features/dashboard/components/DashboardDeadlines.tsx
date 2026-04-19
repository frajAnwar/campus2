import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { timeAgo } from "@/lib/utils";

interface Assignment {
  id: string;
  title: string;
  classId: string;
  dueDate: Date | null;
  class: { name: true; id: true };
}

interface DeadlinesProps {
  assignments: any[];
}

export function DashboardDeadlines({ assignments }: DeadlinesProps) {
  return (
    <Card className="border-none bg-card/50 backdrop-blur-sm shadow-sm ring-1 ring-border/50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-display font-semibold flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Upcoming Deadlines
        </CardTitle>
        <Link href="/classes" className="text-xs text-muted-foreground hover:text-primary transition-colors">
          View All
        </Link>
      </CardHeader>
      <CardContent>
        {assignments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm text-muted-foreground">All caught up!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {assignments.map((a) => {
              const isUrgent = a.dueDate && (new Date(a.dueDate).getTime() - Date.now() < 86400000);
              return (
                <Link
                  key={a.id}
                  href={`/classes/${a.classId}/assignments/${a.id}`}
                  className="group flex items-center justify-between p-3 rounded-xl hover:bg-accent/50 transition-all border border-transparent hover:border-border/50"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-1">
                      {a.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                      {a.class.name}
                    </p>
                  </div>
                  <Badge
                    variant={isUrgent ? "destructive" : "secondary"}
                    className="text-[10px] font-bold px-2 py-0"
                  >
                    {a.dueDate ? timeAgo(a.dueDate) : "No date"}
                  </Badge>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
