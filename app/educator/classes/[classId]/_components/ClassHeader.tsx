"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Copy,
  BookOpen,
  Users,
  GraduationCap,
  Clock,
  CheckCheck,
} from "lucide-react";
import { toast } from "sonner";

interface ClassHeaderProps {
  classData: {
    id: string;
    name: string;
    term: string | null;
    subjectTag: string | null;
    enrollmentCode: string;
    isOpen: boolean;
    isLocked: boolean;
    university?: { name: string } | null;
    educator: { id: string; name: string; image: string | null };
  };
  studentCount: number;
  assignmentCount: number;
  pendingGradeCount: number;
}

export function ClassHeader({
  classData,
  studentCount,
  assignmentCount,
  pendingGradeCount,
}: ClassHeaderProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(classData.enrollmentCode);
    setCopied(true);
    toast.success("Enrollment code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="px-8 py-10 bg-primary text-primary-foreground">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <h1 className="text-3xl font-display font-bold">
              {classData.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-primary-foreground/80 text-sm">
              {classData.term && (
                <span className="flex items-center gap-1">
                  <GraduationCap className="h-4 w-4" />
                  {classData.term}
                </span>
              )}
              {classData.subjectTag && (
                <Badge
                  variant="secondary"
                  className="bg-white/20 text-white border-white/30"
                >
                  {classData.subjectTag}
                </Badge>
              )}
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {studentCount} students
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                {assignmentCount} assignments
              </span>
              {pendingGradeCount > 0 && (
                <span className="flex items-center gap-1 text-amber-200">
                  <Clock className="h-4 w-4" />
                  {pendingGradeCount} pending grades
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="bg-white/20 text-white hover:bg-white/30 border-white/20"
              onClick={handleCopyCode}
            >
              {copied ? (
                <CheckCheck className="h-4 w-4 mr-2" />
              ) : (
                <Copy className="h-4 w-4 mr-2" />
              )}
              {copied ? "Copied!" : "Copy Code"}
            </Button>
            <Link href={`/educator/classes/${classData.id}/settings`}>
              <Button
                variant="secondary"
                size="sm"
                className="bg-white/20 text-white hover:bg-white/30 border-white/20"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
