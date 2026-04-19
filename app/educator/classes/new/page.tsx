"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { createClass } from "@/actions/class";
import Link from "next/link";

export default function CreateClassPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [term, setTerm] = useState("");
  const [subjectTag, setSubjectTag] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Class name is required");
      return;
    }

    setLoading(true);
    try {
      const result = await createClass({
        name: name.trim(),
        description: description.trim() || undefined,
        term: term.trim() || undefined,
        subjectTag: subjectTag.trim() || undefined,
      });

      if (result.success && result.data) {
        toast.success("Class created successfully!");
        router.push(`/educator/classes/${result.data.id}`);
      } else {
        toast.error(result.error || "Failed to create class");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/educator/classes">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-display font-bold">Create Class</h1>
          <p className="text-muted-foreground mt-1">
            Set up a new class for your students
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Class Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Class Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Introduction to Computer Science"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this class covers..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="term">Term / Semester</Label>
                <Input
                  id="term"
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  placeholder="e.g. Fall 2026"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subjectTag">Subject Tag</Label>
                <Input
                  id="subjectTag"
                  value={subjectTag}
                  onChange={(e) => setSubjectTag(e.target.value)}
                  placeholder="e.g. Computer Science"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Link href="/educator/classes">
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={loading || !name.trim()}>
            {loading ? "Creating..." : "Create Class"}
          </Button>
        </div>
      </form>
    </div>
  );
}
