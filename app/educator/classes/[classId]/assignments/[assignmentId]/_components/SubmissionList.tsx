"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/shared/Avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { timeAgo } from "@/lib/utils";
import {
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Clock,
  AlertCircle,
  Sparkles,
  Loader2,
  ExternalLink,
  Globe,
} from "lucide-react";
import { gradeSubmission } from "@/actions/assignment";
import { gradeSubmission as aiGradeSubmission } from "@/actions/ai";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface SubmissionData {
  id: string;
  content: string | null;
  githubUrl: string | null;
  fileUrl: string | null;
  status: string;
  grade: number | null;
  feedback: string | null;
  submittedAt: Date | string;
  student: {
    id: string;
    name: string;
    image: string | null;
    username: string;
  };
}

interface SubmissionListProps {
  submissions: SubmissionData[];
  maxPoints: number;
  assignmentId: string;
  classId: string;
}

const statusIcon = (status: string) => {
  switch (status) {
    case "GRADED":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "SUBMITTED":
      return <Clock className="h-4 w-4 text-amber-500" />;
    case "LATE":
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
};

const statusLabel = (status: string) => {
  switch (status) {
    case "GRADED":
      return "Graded";
    case "SUBMITTED":
      return "Submitted";
    case "LATE":
      return "Late";
    case "RESUBMITTED":
      return "Resubmitted";
    default:
      return status;
  }
};

export function SubmissionList({
  submissions,
  maxPoints,
  assignmentId,
  classId,
}: SubmissionListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [gradingStates, setGradingStates] = useState<Record<string, {
    grade: string;
    feedback: string;
    aiResult: {
      suggested_grade: number;
      feedback: string;
      strengths: string[];
      weaknesses: string[];
    } | null;
  }>>({});
  const [grading, setGrading] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const router = useRouter();

  const getGradingState = (submissionId: string) => {
    return gradingStates[submissionId] || {
      grade: "",
      feedback: "",
      aiResult: null
    };
  };

  const setGradingState = (submissionId: string, updates: Partial<typeof gradingStates[string]>) => {
    setGradingStates(prev => ({
      ...prev,
      [submissionId]: {
        ...getGradingState(submissionId),
        ...updates
      }
    }));
  };

  const handleGrade = async (submissionId: string) => {
    const state = getGradingState(submissionId);
    const grade = parseFloat(state.grade);
    if (isNaN(grade) || grade < 0 || grade > maxPoints) {
      toast.error(`Grade must be between 0 and ${maxPoints}`);
      return;
    }

    setGrading(submissionId);
    try {
      const result = await gradeSubmission(
        submissionId,
        grade,
        state.feedback
      );
      if (result.success) {
        toast.success("Submission graded!");
        setExpandedId(null);
        setGradingStates(prev => {
          const newStates = { ...prev };
          delete newStates[submissionId];
          return newStates;
        });
        router.refresh();
      } else {
        toast.error(result.error || "Failed to grade");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setGrading(null);
    }
  };

  const handleAiGrade = async (submissionId: string) => {
    setAiLoading(submissionId);
    setGradingState(submissionId, { aiResult: null });
    try {
      const result = await aiGradeSubmission(submissionId);
      if ((result as any).success && (result as any).data) {
        const data = (result as any).data;
        setGradingState(submissionId, {
          aiResult: data,
          grade: data.suggested_grade !== undefined ? String(data.suggested_grade) : getGradingState(submissionId).grade,
          feedback: data.feedback || getGradingState(submissionId).feedback
        });
        toast.success("AI suggestion generated!");
      } else {
        toast.error((result as any).error || "AI grading failed");
      }
    } catch {
      toast.error("AI grading failed");
    } finally {
      setAiLoading(null);
    }
  };

  const toggleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      setGradingStates(prev => {
        const newStates = { ...prev };
        delete newStates[id];
        return newStates;
      });
    } else {
      const sub = submissions.find((s) => s.id === id);
      setGradingState(id, {
        grade: sub?.grade !== null ? String(sub?.grade) : "",
        feedback: sub?.feedback || "",
        aiResult: null
      });
      setExpandedId(id);
    }
  };

  if (submissions.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <p>No submissions yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">
        Submissions ({submissions.length})
      </h2>
      {submissions.map((sub) => (
        <Card
          key={sub.id}
          className={
            expandedId === sub.id ? "ring-2 ring-primary/20" : ""
          }
        >
          <CardContent className="p-4">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleExpand(sub.id)}
            >
              <div className="flex items-center gap-3">
                <Avatar
                  src={sub.student.image}
                  name={sub.student.name}
                  size="md"
                />
                <div>
                  <p className="font-medium text-sm">{sub.student.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {statusIcon(sub.status)}
                    <span>{statusLabel(sub.status)}</span>
                    <span>&bull;</span>
                    <span>{timeAgo(sub.submittedAt)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {sub.grade !== null && (
                  <Badge variant="secondary" className="text-sm">
                    {sub.grade}/{maxPoints}
                  </Badge>
                )}
                {expandedId === sub.id ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>

            {expandedId === sub.id && (
              <div className="mt-4 pt-4 border-t space-y-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Submission Content</h4>
                  {sub.content ? (
                    <div className="rounded-lg bg-muted/50 p-4 text-sm whitespace-pre-wrap">
                      {sub.content}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No text content submitted
                    </p>
                  )}

                  {sub.githubUrl && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      <a
                        href={sub.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                      >
                        {sub.githubUrl}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}

                  {sub.fileUrl && (
                    <div className="flex items-center gap-2">
                      <a
                        href={sub.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                      >
                        View attached file
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </div>

                {getGradingState(sub.id).aiResult && (
                  <div className="rounded-lg border bg-purple-50 dark:bg-purple-950/20 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-purple-700 dark:text-purple-300">
                      <Sparkles className="h-4 w-4" />
                      AI Suggestion
                    </div>
                    <p className="text-sm">Suggested Grade: {getGradingState(sub.id).aiResult!.suggested_grade}/{maxPoints}</p>
                    <p className="text-sm text-muted-foreground">{getGradingState(sub.id).aiResult!.feedback}</p>
                    {getGradingState(sub.id).aiResult!.strengths?.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-green-600">Strengths:</p>
                        <ul className="list-disc list-inside text-xs text-muted-foreground">
                          {getGradingState(sub.id).aiResult!.strengths.map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {getGradingState(sub.id).aiResult!.weaknesses?.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-amber-600">Areas for improvement:</p>
                        <ul className="list-disc list-inside text-xs text-muted-foreground">
                          {getGradingState(sub.id).aiResult!.weaknesses.map((w, i) => (
                            <li key={i}>{w}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAiGrade(sub.id)}
                    disabled={aiLoading === sub.id}
                  >
                    {aiLoading === sub.id ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4 mr-2" />
                    )}
                    AI Grade
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`grade-${sub.id}`}>
                      Grade (out of {maxPoints})
                    </Label>
                     <Input
                       id={`grade-${sub.id}`}
                       type="number"
                       min="0"
                       max={maxPoints}
                       step="0.5"
                       value={getGradingState(sub.id).grade}
                       onChange={(e) => setGradingState(sub.id, { grade: e.target.value })}
                       placeholder={`0-${maxPoints}`}
                     />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`feedback-${sub.id}`}>Feedback</Label>
                     <Textarea
                       id={`feedback-${sub.id}`}
                       value={getGradingState(sub.id).feedback}
                       onChange={(e) => setGradingState(sub.id, { feedback: e.target.value })}
                       placeholder="Provide feedback to the student..."
                       rows={3}
                     />
                  </div>
                </div>

                <div className="flex justify-end">
                   <Button
                     onClick={() => handleGrade(sub.id)}
                     disabled={
                       grading === sub.id || !getGradingState(sub.id).grade
                     }
                     size="sm"
                   >
                    {grading === sub.id ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    {sub.status === "GRADED"
                      ? "Update Grade"
                      : "Grade Submission"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
