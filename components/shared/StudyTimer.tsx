"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Timer, Play, Pause, RotateCcw, Award, Coffee, Brain, X, Loader2 } from "lucide-react";
import { completeStudySession } from "@/actions/gamification";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function StudyTimer() {
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(25 * 60); // 25 mins Pomodoro
  const [mode, setMode] = useState<"STUDY" | "BREAK">("STUDY");
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [awarding, setAwarding] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive && seconds > 0) {
      timerRef.current = setInterval(() => {
        setSeconds((s) => s - 1);
      }, 1000);
    } else if (seconds === 0) {
      handleSessionComplete();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, seconds]);

  const handleSessionComplete = async () => {
    setIsActive(false);
    if (mode === "STUDY") {
      setSessionsCompleted((s) => s + 1);
      setAwarding(true);
      
      const result = await completeStudySession();
      if (result.success) {
        toast.success("Focus session complete! +15 XP earned.");
      } else {
        toast.error("Session completed, but failed to sync XP.");
      }

      setMode("BREAK");
      setSeconds(5 * 60);
      setAwarding(false);
    } else {
      toast.info("Break over! Ready to focus?");
      setMode("STUDY");
      setSeconds(25 * 60);
    }
  };

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setSeconds(mode === "STUDY" ? 25 * 60 : 5 * 60);
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!isOpen) {
    return (
      <Button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 rounded-full size-14 shadow-2xl bg-slate-900 text-white hover:scale-110 transition-all z-50 group"
      >
        <Timer className={cn("size-6 group-hover:rotate-12 transition-transform", isActive && "animate-pulse")} />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-80 rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.4)] z-50 overflow-hidden border-none animate-in slide-in-from-bottom-10 fade-in duration-500">
      <CardHeader className={cn(
        "pb-6 pt-8 text-center transition-colors duration-500",
        mode === "STUDY" ? "bg-primary/5" : "bg-emerald-500/5"
      )}>
        <div className="flex items-center justify-between px-2 mb-2">
           <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Focus Engine</span>
           </div>
           <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-6 w-6 rounded-lg">
             <X className="size-3" />
           </Button>
        </div>
        <CardTitle className="text-4xl font-display font-black tracking-tighter">
          {formatTime(seconds)}
        </CardTitle>
        <CardDescription className="text-[10px] font-bold uppercase tracking-[0.3em] mt-2">
          {mode === "STUDY" ? "Deep Work Phase" : "Recovery Break"}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8 space-y-8">
        <div className="flex items-center justify-center gap-4">
          <Button 
            size="icon" 
            variant="outline" 
            onClick={resetTimer}
            className="rounded-2xl size-12 border-border/40 hover:bg-slate-50"
          >
            <RotateCcw className="size-5 text-muted-foreground" />
          </Button>
          
          <Button 
            size="lg" 
            onClick={toggleTimer}
            className={cn(
              "rounded-[2rem] h-16 w-32 shadow-xl transition-all hover:scale-105 active:scale-95",
              isActive ? "bg-slate-100 text-slate-900 shadow-none border" : "bg-primary text-white shadow-primary/20"
            )}
          >
            {isActive ? <Pause className="size-6 mr-2 fill-current" /> : <Play className="size-6 mr-2 fill-current" />}
            <span className="font-bold text-sm">{isActive ? "Pause" : "Start"}</span>
          </Button>

          <div className="size-12 rounded-2xl bg-primary/5 flex items-center justify-center">
             {mode === "STUDY" ? <Brain className="size-5 text-primary" /> : <Coffee className="size-5 text-emerald-500" />}
          </div>
        </div>

        <div className="pt-4 border-t flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="size-8 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Award className="size-4 text-amber-600" />
             </div>
             <div>
               <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sessions</p>
               <p className="text-xs font-bold">{sessionsCompleted} Focus Blocks</p>
             </div>
          </div>
          <div className="text-right">
             <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Earning</p>
             <p className="text-xs font-bold text-primary">+15 XP / Block</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
