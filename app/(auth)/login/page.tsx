import { LoginForm } from "@/components/auth/LoginForm";
import Link from "next/link";import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#fcfcfd] dark:bg-[#09090b] overflow-hidden px-4">
      {/* Background Ornaments */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      <div className="relative z-10 w-full max-w-md flex flex-col gap-8 items-center">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="size-10 rounded-xl bg-white/5 border border-border/40 flex items-center justify-center shadow-xl shadow-primary/20 overflow-hidden group-hover:scale-110 transition-transform duration-300">
            <Image src="/campus-mark-only.png" alt="Campus Logo" width={32} height={32} className="object-contain" />
          </div>
          <span className="text-2xl font-display font-bold tracking-tight">Campus</span>
        </Link>
        
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both">
          <LoginForm />
        </div>

        <p className="text-xs text-muted-foreground text-center max-w-xs leading-relaxed">
          By signing in, you agree to our <span className="underline cursor-pointer">Terms of Service</span> and <span className="underline cursor-pointer">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
}
