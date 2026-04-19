"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createRoleRequest } from "@/actions/request";
import { toast } from "sonner";
import { ShieldCheck, GraduationCap, School, Loader2 } from "lucide-react";

export function RoleRequestSection() {
  const [role, setRole] = useState<string>("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) {
      toast.error("Please select a role");
      return;
    }
    setLoading(true);
    const result = await createRoleRequest(role, reason);
    setLoading(false);

    if (result.success) {
      toast.success("Request submitted successfully!");
      setReason("");
      setRole("");
    } else {
      toast.error(result.error || "Failed to submit request");
    }
  };

  return (
    <Card className="border-none shadow-sm ring-1 ring-border/50 overflow-hidden rounded-[2rem]">
      <CardHeader className="bg-slate-50 dark:bg-slate-900/50">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <CardTitle>Role Verification</CardTitle>
            <CardDescription>Request a role upgrade to access specialized features.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Select Requested Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as any)}>
              <SelectTrigger className="rounded-xl h-12">
                <SelectValue placeholder="What is your role?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="STUDENT" className="py-3">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    <span>Student</span>
                  </div>
                </SelectItem>
                <SelectItem value="EDUCATOR" className="py-3">
                  <div className="flex items-center gap-2">
                    <School className="h-4 w-4" />
                    <span>Educator / Professor</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Verification Note</Label>
            <Textarea 
              placeholder="e.g. Please verify my student ID or faculty email for access to private class forums." 
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="rounded-xl min-h-[100px]"
            />
          </div>

          <Button type="submit" className="w-full rounded-xl h-11" disabled={loading || !role}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Submit Verification Request
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
