"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { GithubIcon, GoogleIcon } from "@/components/shared/Icons";
import { registerUser, checkUsernameAvailability, checkEmailAvailability } from "@/actions/auth";

export function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<
    "idle" | "available" | "taken"
  >("idle");
  const [emailStatus, setEmailStatus] = useState<
    "idle" | "available" | "taken"
  >("idle");

  const handleUsernameBlur = async () => {
    if (username.length >= 3) {
      const { available } = await checkUsernameAvailability(username);
      setUsernameStatus(available ? "available" : "taken");
    }
  };

  const handleEmailBlur = async () => {
    if (email.includes("@")) {
      const { available } = await checkEmailAvailability(email);
      setEmailStatus(available ? "available" : "taken");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await registerUser({ name, username, email, password });

    if (!result.success) {
      setError((result as any).error ?? "Failed to sign up");
      setLoading(false);
      return;
    }

    const signInResult = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (signInResult?.ok) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  };

  return (
    <Card className="border-none bg-card/50 backdrop-blur-xl shadow-2xl ring-1 ring-border/50 overflow-hidden rounded-3xl">
      <CardHeader className="text-center pt-8 pb-4">
        <CardTitle className="text-2xl font-display font-bold">Create your account</CardTitle>
        <CardDescription>Join the future of campus collaboration</CardDescription>
      </CardHeader>
      <CardContent className="p-8 pt-4">
        <div className="grid gap-6">
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-11 rounded-xl border-border/50 hover:bg-accent/50 transition-colors gap-2"
              onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
            >
              <GithubIcon className="h-4 w-4" />
              <span className="text-xs font-bold">GitHub</span>
            </Button>
            <Button
              variant="outline"
              className="h-11 rounded-xl border-border/50 hover:bg-accent/50 transition-colors gap-2"
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            >
              <GoogleIcon className="h-4 w-4" />
              <span className="text-xs font-bold">Google</span>
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="bg-border/50" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
              <span className="bg-[#fcfcfd] dark:bg-[#09090b] px-3 text-muted-foreground/60 backdrop-blur-md rounded-full">
                Or fill in details
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-4">
            {error && (
              <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-xs font-medium text-destructive animate-in fade-in slide-in-from-top-1">
                {error}
              </div>
            )}
            
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-xs font-bold ml-1">Full name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                className="h-11 rounded-xl bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/20 transition-all"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="username" className="text-xs font-bold ml-1">Username</Label>
              <div className="relative">
                <Input
                  id="username"
                  placeholder="johndoe"
                  className="h-11 rounded-xl bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/20 transition-all pr-10"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setUsernameStatus("idle");
                  }}
                  onBlur={handleUsernameBlur}
                  required
                  minLength={3}
                  maxLength={20}
                />
                {usernameStatus === "available" && <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />}
                {usernameStatus === "taken" && <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive" />}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email" className="text-xs font-bold ml-1">University Email</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="you@university.edu"
                  className="h-11 rounded-xl bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/20 transition-all pr-10"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailStatus("idle");
                  }}
                  onBlur={handleEmailBlur}
                  required
                />
                {emailStatus === "available" && <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />}
                {emailStatus === "taken" && <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive" />}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password" title="password" className="text-xs font-bold ml-1">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="h-11 rounded-xl bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/20 transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>

            <Button 
              type="submit" 
              disabled={loading} 
              className="h-11 rounded-xl bg-primary shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all font-bold text-sm mt-4"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Create Student Account"
              )}
            </Button>
          </form>
          
          <div className="text-center pt-2">
            <p className="text-xs text-muted-foreground">
              Already have an account?{" "}
              <a href="/login" className="text-primary font-bold hover:underline">
                Sign in
              </a>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
