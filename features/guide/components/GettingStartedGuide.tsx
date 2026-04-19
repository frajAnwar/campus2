import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Rocket, 
  Target, 
  Users, 
  Zap, 
  ChevronRight,
  ShieldCheck,
  Trophy
} from "lucide-react";
import Image from "next/image";

const STEPS = [
  {
    title: "Complete your Profile",
    description: "Add your university, skills, and bio to stand out in the community.",
    icon: Rocket,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    title: "Join your Classes",
    description: "Enter your enrollment codes to access assignments and class forums.",
    icon: Target,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    title: "Interact & Earn XP",
    description: "Post, comment, and help others to climb the leaderboard and unlock ranks.",
    icon: Zap,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    title: "Connect with Clubs",
    description: "Find organizations that match your interests and attend events.",
    icon: Users,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  }
];

export function GettingStartedGuide() {
  return (
    <Card className="border-none bg-gradient-to-br from-card to-card/50 shadow-xl ring-1 ring-border/50 overflow-hidden">
      <div className="relative h-48 w-full overflow-hidden">
        {/* Placeholder for the generated hero image */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-purple-600/80 mix-blend-multiply z-10" />
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-white p-6 text-center">
          <Badge className="mb-3 bg-white/20 hover:bg-white/30 text-white border-white/20 backdrop-blur-md">
            Welcome to Campus
          </Badge>
          <h2 className="text-3xl font-display font-bold tracking-tight">Your Academic Journey Starts Here</h2>
          <p className="text-white/80 text-sm mt-2 max-w-md">
            Master your studies, build your portfolio, and connect with fellow students across the globe.
          </p>
        </div>
      </div>
      
      <CardContent className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {STEPS.map((step, index) => (
            <div 
              key={step.title}
              className="group flex gap-4 p-4 rounded-2xl hover:bg-accent/50 transition-all duration-300 border border-transparent hover:border-border/50"
            >
              <div className={`${step.bg} h-12 w-12 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                <step.icon className={`h-6 w-6 ${step.color}`} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">Step 0{index + 1}</span>
                  <h3 className="text-sm font-bold group-hover:text-primary transition-colors">{step.title}</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="flex -space-x-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 w-8 rounded-full border-2 border-card bg-muted flex items-center justify-center text-[10px] font-bold overflow-hidden">
                   <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`} alt="User" />
                </div>
              ))}
              <div className="h-8 w-8 rounded-full border-2 border-card bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                +1k
              </div>
            </div>
            <p className="text-[10px] font-medium text-muted-foreground">
              Joined by <span className="text-foreground font-bold">1,200+ students</span> this week
            </p>
          </div>
          
          <button className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all">
            Open Member Guide
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
