"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Mail, Loader2 } from "lucide-react";
import { GithubIcon, GoogleIcon } from "@/components/shared/Icons";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <Card className="border-none bg-card/50 backdrop-blur-xl shadow-2xl ring-1 ring-border/50 overflow-hidden rounded-3xl">
      <CardHeader className="text-center pt-8 pb-4">
        <CardTitle className="text-2xl font-display font-bold">Welcome back</CardTitle>
        <CardDescription>Sign in to your student community</CardDescription>
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
                Or continue with
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
              <Label htmlFor="email" className="text-xs font-bold ml-1">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@university.edu"
                className="h-11 rounded-xl bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/20 transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between ml-1">
                <Label htmlFor="password" title="password" className="text-xs font-bold">Password</Label>
                <a href="#" className="text-[10px] font-bold text-primary hover:underline">Forgot?</a>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="h-11 rounded-xl bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/20 transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button 
              type="submit" 
              disabled={loading} 
              className="h-11 rounded-xl bg-primary shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all font-bold text-sm mt-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Sign in to Dashboard"
              )}
            </Button>
          </form>
          
          <div className="text-center pt-2">
            <p className="text-xs text-muted-foreground">
              New to Campus?{" "}
              <a href="/signup" className="text-primary font-bold hover:underline">
                Create an account
              </a>
            </p>
          </div>

          {/* Demo Accounts */}
          <div className="mt-6 pt-6 border-t border-border/30 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-base">🔑</span>
              <h3 className="text-sm font-bold">Demo Accounts</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              All accounts use the password: <code className="px-1.5 py-0.5 rounded bg-muted/50 text-[11px] font-mono font-bold">password123</code>
            </p>
            <div className="rounded-xl border border-border/30 overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border/30 bg-muted/20">
                    <th className="text-left py-2.5 px-3 font-bold text-muted-foreground">Role</th>
                    <th className="text-left py-2.5 px-3 font-bold text-muted-foreground">Email</th>
                    <th className="text-left py-2.5 px-3 font-bold text-muted-foreground">Username</th>
                    <th className="py-2.5 px-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { role: "Admin", email: "admin@campus.com", username: "admin", color: "text-red-400" },
                    { role: "Educator", email: "prof.smith@campus.com", username: "drsmith", color: "text-blue-400" },
                    { role: "Student", email: "john.doe@campus.com", username: "johndoe", color: "text-emerald-400" },
                  ].map((account) => (
                    <tr key={account.role} className="border-b border-border/20 last:border-b-0 hover:bg-muted/10 transition-colors">
                      <td className={`py-2.5 px-3 font-bold ${account.color}`}>{account.role}</td>
                      <td className="py-2.5 px-3">
                        <code className="text-[11px] font-mono bg-muted/30 px-1.5 py-0.5 rounded">{account.email}</code>
                      </td>
                      <td className="py-2.5 px-3">
                        <code className="text-[11px] font-mono bg-muted/30 px-1.5 py-0.5 rounded">{account.username}</code>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setEmail(account.email);
                            setPassword("password123");
                          }}
                          className="text-[10px] font-bold text-primary hover:underline"
                        >
                          Use →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Seeded Content Note */}
            <div className="flex items-start gap-2 pt-1">
              <span className="text-sm">📋</span>
              <p className="text-[11px] text-muted-foreground/60 leading-relaxed">
                <span className="font-bold text-muted-foreground/80">Seeded Content</span> — Demo accounts come with pre-populated classes, assignments, forum posts, clubs, and projects.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
