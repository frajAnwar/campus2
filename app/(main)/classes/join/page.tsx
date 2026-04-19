"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { joinClass } from "@/actions/class";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LogIn } from "lucide-react";
import Link from "next/link";

export default function JoinClassPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await joinClass(code.trim());

    setLoading(false);

    if (result.success && result.data) {
      router.push(`/classes/${result.data.classId}`);
    } else {
      setError(result.error ?? "Failed to join class");
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 lg:px-8 py-16 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-display font-bold tracking-tight">Join a Class</h1>
        <p className="text-muted-foreground mt-2">
          Enter the enrollment code provided by your educator
        </p>
      </div>

      <Card className="border-border/40">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <LogIn className="h-5 w-5" />
            Enrollment Code
          </CardTitle>
          <CardDescription>
            Ask your educator for the class enrollment code
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="code">Enrollment Code</Label>
              <Input
                id="code"
                placeholder="Enter enrollment code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="h-12"
              />
            </div>
            <Button type="submit" disabled={loading || !code.trim()} className="w-full h-12">
              {loading ? "Joining..." : "Join Class"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="text-center">
        <Link
          href="/classes"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to classes
        </Link>
      </div>
    </div>
  );
}
