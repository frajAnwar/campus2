import { SignupForm } from "@/components/auth/SignupForm";
import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#fcfcfd] dark:bg-[#09090b] overflow-hidden px-4 py-12">
      {/* Background Ornaments */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      <div className="relative z-10 w-full max-w-lg flex flex-col gap-8 items-center">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="size-10 rounded-xl bg-primary flex items-center justify-center text-white text-xl font-bold shadow-xl shadow-primary/20 group-hover:scale-110 transition-transform duration-300">
            C
          </div>
          <span className="text-2xl font-display font-bold tracking-tight">Campus</span>
        </Link>
        
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both">
          <SignupForm />
        </div>

        <p className="text-xs text-muted-foreground text-center max-w-xs leading-relaxed">
          Join thousands of students and start building your academic legacy today.
        </p>
      </div>
    </div>
  );
}
