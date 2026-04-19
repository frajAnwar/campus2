"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sparkles, X, MessageSquare, BookOpen, Lightbulb, Loader2, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { summarizeThread, explainAssignment } from "@/actions/ai";

interface AIChatPanelProps {
  type: "THREAD" | "ASSIGNMENT";
  targetId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AIChatPanel({ type, targetId, isOpen, onClose }: AIChatPanelProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleAction = async () => {
    setLoading(true);
    let res;
    if (type === "THREAD") {
      res = await summarizeThread(targetId);
    } else {
      res = await explainAssignment(targetId);
    }
    setLoading(false);
    if ((res as any).success) {
      setResult((res as any).data);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-80 md:w-96 bg-background/80 backdrop-blur-2xl border-l border-border/40 shadow-2xl z-50 p-6 flex flex-col gap-6 animate-in slide-in-from-right duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Sparkles className="size-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold">AI Assistant</h3>
            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Enhanced Intelligence</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl h-8 w-8">
          <X className="size-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6">
        {!result ? (
          <div className="space-y-6 py-4 text-center">
            <div className="size-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
               <Lightbulb className="size-10 text-primary opacity-20" />
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-base">How can I help you?</h4>
              <p className="text-xs text-muted-foreground px-4 leading-relaxed">
                I can summarize this discussion, explain assignment requirements, or suggest study approaches.
              </p>
            </div>
            <Button onClick={handleAction} disabled={loading} className="w-full rounded-xl h-12 shadow-lg shadow-primary/20">
              {loading ? <Loader2 className="size-4 animate-spin mr-2" /> : <Sparkles className="size-4 mr-2" />}
              {type === "THREAD" ? "Summarize Discussion" : "Explain Assignment"}
            </Button>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
            {type === "THREAD" ? (
               <div className="space-y-6">
                 <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                   <h5 className="text-[10px] font-black uppercase text-primary mb-2">Topic Summary</h5>
                   <p className="text-sm leading-relaxed">{result.topic}</p>
                 </div>
                 
                 <div className="space-y-3">
                   <h5 className="text-[10px] font-black uppercase text-muted-foreground/60 px-1">Key Insights</h5>
                   {result.key_points?.map((point: string, i: number) => (
                     <div key={i} className="flex gap-3 text-sm group">
                       <span className="text-primary font-black mt-0.5">0{i+1}</span>
                       <p className="text-muted-foreground group-hover:text-foreground transition-colors leading-snug">{point}</p>
                     </div>
                   ))}
                 </div>

                 {result.best_answer && (
                   <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-500/20">
                     <h5 className="text-[10px] font-black uppercase text-emerald-600 mb-2">Solved / Best Answer</h5>
                     <p className="text-sm text-emerald-700 dark:text-emerald-400">{result.best_answer}</p>
                   </div>
                 )}
               </div>
            ) : (
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                   <h5 className="text-[10px] font-black uppercase text-primary mb-2">The Mission</h5>
                   <p className="text-sm leading-relaxed">{result.what_to_do}</p>
                 </div>

                 <div className="space-y-4">
                    <div>
                      <h5 className="text-[10px] font-black uppercase text-muted-foreground/60 px-1 mb-2">Requirements</h5>
                      <ul className="space-y-2">
                        {result.requirements?.map((req: string, i: number) => (
                          <li key={i} className="flex gap-2 text-xs items-start">
                            <div className="size-1.5 rounded-full bg-primary/40 mt-1.5 shrink-0" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h5 className="text-[10px] font-black uppercase text-muted-foreground/60 px-1 mb-2">Suggested Approach</h5>
                      <ul className="space-y-2">
                        {result.suggested_approach?.map((app: string, i: number) => (
                          <li key={i} className="flex gap-2 text-xs items-start">
                             <span className="text-primary font-bold">{i+1}.</span>
                             {app}
                          </li>
                        ))}
                      </ul>
                    </div>
                 </div>
              </div>
            )}
            
            <Button variant="outline" onClick={() => setResult(null)} className="w-full rounded-xl h-10 text-xs">
               Clear & Reset
            </Button>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-border/40">
        <div className="relative">
          <Input 
            placeholder="Ask a specific question..." 
            className="rounded-xl h-12 pr-12 bg-slate-100/50 dark:bg-slate-800/50 border-none text-xs"
            disabled
          />
          <Button size="icon" disabled className="absolute right-1 top-1 h-10 w-10 rounded-lg">
            <Send className="size-4" />
          </Button>
        </div>
        <p className="text-[9px] text-muted-foreground text-center mt-3">
          AI-generated content may have inaccuracies. Use as a guide.
        </p>
      </div>
    </div>
  );
}
