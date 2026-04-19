import Link from "next/link";
import { Users, FileText, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/shared/Avatar";
import { cn, truncate } from "@/lib/utils";

interface ClassCardProps {
  classData: {
    id: string;
    name: string;
    subject: string;
    term: string;
    educator: {
      id: string;
      name: string;
      image?: string | null;
    };
    university: string;
    _count: { members: number; assignments: number };
  };
}

export function ClassCard({ classData }: ClassCardProps) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <Link href={`/classes/${classData.id}`} className="group">
              <CardTitle className="group-hover:text-primary transition-colors">
                {classData.name}
              </CardTitle>
            </Link>
            <p className="text-xs text-muted-foreground">{classData.university}</p>
          </div>
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0">
            {classData.term}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <Avatar src={classData.educator.image} name={classData.educator.name} size="sm" />
          <span className="text-xs text-muted-foreground">{classData.educator.name}</span>
        </div>

        <Badge variant="outline" className="text-[10px] px-1.5 py-0 gap-1">
          <BookOpen className="h-3 w-3" />
          {classData.subject}
        </Badge>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {classData._count.members} members
          </span>
          <span className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            {classData._count.assignments} assignments
          </span>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" size="sm" className="w-full">
          <Link href={`/classes/${classData.id}`}>View Class</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
