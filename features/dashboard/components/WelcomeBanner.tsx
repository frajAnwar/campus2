import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowRight, GraduationCap, Users, Globe } from "lucide-react";
import Link from "next/link";

export function WelcomeBanner({ userName }: { userName: string }) {
  return (
    <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-8 text-white shadow-2xl">
      {/* Visual background elements - simple and clean */}
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-[80px]" />
      <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-blue-500/10 blur-[80px]" />
      
      <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1 space-y-4 text-center md:text-left">
          <Badge className="bg-primary/20 text-primary border-none px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
            Academic Hub
          </Badge>
          <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight">
            Welcome back, {userName}!
          </h1>
          <p className="text-slate-400 text-sm max-w-md leading-relaxed">
            Your university life, simplified. Track your classes, collaborate on projects, and connect with your campus community in one place.
          </p>
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
            <Link href="/classes/join">
              <button className="flex items-center gap-2 bg-white text-slate-950 px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-100 transition-all shadow-lg shadow-white/5">
                Join a Class
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </Link>
            <Link href="/forum">
              <button className="flex items-center gap-2 bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-700 transition-all">
                Browse Forum
              </button>
            </Link>
          </div>
        </div>

        {/* Quick Info Grid - Not hardcore, just helpful */}
        <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
          <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-4 rounded-2xl flex flex-col items-center gap-2 min-w-[120px]">
            <div className="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <GraduationCap className="h-4 w-4 text-blue-400" />
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase">Classes</span>
            <span className="text-lg font-bold">Manage</span>
          </div>
          <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-4 rounded-2xl flex flex-col items-center gap-2 min-w-[120px]">
            <div className="h-8 w-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Users className="h-4 w-4 text-purple-400" />
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase">Clubs</span>
            <span className="text-lg font-bold">Join</span>
          </div>
        </div>
      </div>
    </div>
  );
}
