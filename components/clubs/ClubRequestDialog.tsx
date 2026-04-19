"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createClubRequest } from "@/actions/request";
import { toast } from "sonner";
import { Loader2, PlusCircle } from "lucide-react";

export function ClubRequestDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;

    const result = await createClubRequest(name, description);
    setLoading(false);

    if (result.success) {
      toast.success("Request submitted successfully!");
      setOpen(false);
    } else {
      toast.error(result.error || "Failed to submit request.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-xl gap-2 shadow-lg shadow-primary/20">
          <PlusCircle className="h-4 w-4" />
          Request New Club
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display font-bold">Start a New Club</DialogTitle>
          <DialogDescription>
            Submit a request to the platform administrators to create a new community club.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Club Name</Label>
            <Input id="name" name="name" placeholder="e.g. AI Innovators Hub" required className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Purpose & Description</Label>
            <Textarea 
              id="description" 
              name="description" 
              placeholder="What is the goal of this club? Who is it for?" 
              required 
              className="rounded-xl min-h-[120px]"
            />
          </div>
          <Button type="submit" className="w-full rounded-xl" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Submit Request
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
