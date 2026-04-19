import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, BookOpen, Calendar } from "lucide-react";

interface StatsProps {
  stats: {
    postsThisWeek: number;
    submissionsCount: number;
    eventsAttended: number;
  };
}

export function DashboardStats({ stats }: StatsProps) {
  const items = [
    {
      label: "Posts this week",
      value: stats.postsThisWeek,
      icon: MessageSquare,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Submissions",
      value: stats.submissionsCount,
      icon: BookOpen,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
    },
    {
      label: "Events attended",
      value: stats.eventsAttended,
      icon: Calendar,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {items.map((item) => (
        <Card key={item.label} className="overflow-hidden border-none bg-card/50 backdrop-blur-sm shadow-sm ring-1 ring-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
                <p className="text-3xl font-display font-bold mt-1">{item.value}</p>
              </div>
              <div className={`${item.bg} p-3 rounded-xl`}>
                <item.icon className={`h-6 w-6 ${item.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
