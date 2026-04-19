"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/shared/Avatar";
import { timeAgo, cn } from "@/lib/utils";
import { 
  Sparkles, 
  ChevronRight, 
  ExternalLink, 
  FileText,
  CheckCircle2,
  Clock,
  Loader2,
  BrainCircuit
} from "lucide-react";
import { GithubIcon } from "@/components/shared/Icons";
import { gradeSubmission } from "@/actions/ai";
import { toast } from "sonner";

export function SubmissionsList({ submissions, assignment }: any) {
  const [gradingId, setGradingId] = useState<string | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<Record<string, any>>({});

  const handleAiGrade = async (submissionId: string) => {
    setGradingId(submissionId);
    const result = await gradeSubmission(submissionId);
    setGradingId(null);

    if ((result as any).success && (result as any).data) {
      setAiSuggestions(prev => ({ ...prev, [submissionId]: (result as any).data }));
      toast.success("AI Analysis Complete");
    } else {
      toast.error((result as any).error || "AI Grading failed");
    }
  };

  return (
    <div className="grid gap-4">
      {submissions.map((submission: any) => {
        const suggestion = aiSuggestions[submission.id];
        const isGrading = gradingId === submission.id;

        return (
          <Card key={submission.id} className="border-none shadow-sm ring-1 ring-border/50 overflow-hidden rounded-[2rem] group transition-all hover:ring-primary/20">
            <CardContent className="p-0">
              <div className="p-8 flex flex-col lg:flex-row gap-8">
                <div className="flex-1 space-y-6">
                  <div className="flex items-center gap-4">
                    <Avatar src={submission.student.image} name={submission.student.name} size="md" />
                    <div>
                      <h3 className="font-bold text-lg">{submission.student.name}</h3>
                      <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">@{submission.student.username}</p>
                    </div>
                    <div className="ml-auto flex items-center gap-3">
                      <span className="text-xs text-muted-foreground font-medium">
                        Submitted {timeAgo(submission.submittedAt)}
                      </span>
                      {submission.status === "LATE" && (
                        <Badge variant="destructive" className="text-[10px] font-black uppercase tracking-widest">Late</Badge>
                      )}
                      <Badge className={cn(
                        "text-[10px] font-black uppercase tracking-widest px-3",
                        submission.status === "GRADED" ? "bg-emerald-500/10 text-emerald-600 border-none" : "bg-blue-500/10 text-blue-600 border-none"
                      )}>
                        {submission.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {submission.content && (
                      <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-border/40 text-sm line-clamp-3 italic text-muted-foreground">
                        &quot;{submission.content}&quot;
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {submission.githubUrl && (
                        <a href={submission.githubUrl} target="_blank" className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all">
                          <GithubIcon className="h-4 w-4" /> View Repo
                        </a>
                      )}
                      {submission.fileUrl && (
                        <a href={submission.fileUrl} target="_blank" className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl text-xs font-bold hover:bg-primary/20 transition-all">
                          <FileText className="h-4 w-4" /> Attachment
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="w-full lg:w-80 shrink-0 flex flex-col gap-4 border-t lg:border-t-0 lg:border-l border-border/30 pt-6 lg:pt-0 lg:pl-8">
                  {submission.status === "GRADED" ? (
                    <div className="space-y-4">
                       <div className="flex items-center justify-between">
                         <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Final Grade</span>
                         <span className="text-2xl font-black text-emerald-600">{submission.grade}/{assignment.maxPoints}</span>
                       </div>
                       <Button variant="outline" className="w-full rounded-xl text-xs font-bold h-10">Edit Grade</Button>
                    </div>
                  ) : suggestion ? (
                    <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
                      <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/20 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">AI Suggested</span>
                          <span className="text-xl font-black text-emerald-600">{suggestion.suggested_grade}/{assignment.maxPoints}</span>
                        </div>
                        <p className="text-[11px] text-emerald-700/80 leading-relaxed font-medium">
                          {suggestion.feedback}
                        </p>
                      </div>
                      <Button className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold h-10 shadow-lg shadow-emerald-500/10">
                        Apply AI Grade
                      </Button>
                      <Button 
                        variant="ghost" 
                        onClick={() => setAiSuggestions(prev => {
                          const n = {...prev};
                          delete n[submission.id];
                          return n;
                        })}
                        className="w-full text-[10px] font-bold text-muted-foreground uppercase tracking-widest"
                      >
                        Discard
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Button 
                        onClick={() => handleAiGrade(submission.id)}
                        disabled={isGrading}
                        className="w-full rounded-2xl bg-gradient-to-br from-primary to-purple-600 text-white font-bold h-12 shadow-xl shadow-primary/20 relative overflow-hidden group"
                      >
                        {isGrading ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <>
                            <BrainCircuit className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                            AI Grading Assist
                          </>
                        )}
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Button>
                      <Button variant="outline" className="w-full rounded-2xl h-12 font-bold text-xs">Manual Grade</Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {submissions.length === 0 && (
        <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-border/40">
           <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-30" />
           <h3 className="text-lg font-bold">Waiting for Submissions</h3>
           <p className="text-sm text-muted-foreground">Students haven&apos;t turned in their work yet.</p>
        </div>
      )}
    </div>
  );
}
