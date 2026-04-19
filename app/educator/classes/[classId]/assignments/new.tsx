"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft, Save, Send } from "lucide-react";
import { createAssignment } from "@/actions/assignment";

type Params = Promise<{ classId: string }>;

export default function NewAssignmentPage({ params }: { params: Params }) {
  const router = useRouter();
  const { classId } = React.use(params);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [maxPoints, setMaxPoints] = useState("100");
  const [allowLate, setAllowLate] = useState(true);
  const [allowResubmit, setAllowResubmit] = useState(false);
  const [submissionType, setSubmissionType] = useState("TEXT");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (status: "PUBLISHED" | "DRAFT") => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!description.trim()) {
      toast.error("Description is required");
      return;
    }

    setLoading(true);
    try {
      const result = await createAssignment({
        classId,
        title: title.trim(),
        description: description.trim(),
        dueDate: dueDate || undefined,
        maxPoints: parseInt(maxPoints) || 100,
        allowLate,
        allowResubmit,
        submissionType,
        status,
      });

      if (result.success) {
        toast.success(
          status === "PUBLISHED"
            ? "Assignment published!"
            : "Draft saved!"
        );
        router.push(`/educator/classes/${classId}`);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to create assignment");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href={`/educator/classes/${classId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-display font-bold">
            Create Assignment
          </h1>
          <p className="text-muted-foreground mt-1">
            Create a new assignment for your students
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Assignment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                Assignment Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Midterm Project - Database Design"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide detailed instructions for this assignment..."
                rows={6}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxPoints">Maximum Points</Label>
                <Input
                  id="maxPoints"
                  type="number"
                  value={maxPoints}
                  onChange={(e) => setMaxPoints(e.target.value)}
                  min="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="submissionType">Submission Type</Label>
              <Select value={submissionType} onValueChange={(v) => setSubmissionType(v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select submission type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TEXT">Text Only</SelectItem>
                  <SelectItem value="FILE">File Upload</SelectItem>
                  <SelectItem value="BOTH">Text & File</SelectItem>
                  <SelectItem value="GITHUB">GitHub Repository</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Submission Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Allow Late Submissions</p>
                <p className="text-sm text-muted-foreground">
                  Students can submit after the due date
                </p>
              </div>
              <Switch checked={allowLate} onCheckedChange={setAllowLate} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Allow Resubmissions</p>
                <p className="text-sm text-muted-foreground">
                  Students can resubmit before grading
                </p>
              </div>
              <Switch
                checked={allowResubmit}
                onCheckedChange={setAllowResubmit}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Link href={`/educator/classes/${classId}`}>
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Link>
          <Button
            variant="secondary"
            disabled={loading || !title.trim() || !description.trim()}
            onClick={() => handleSubmit("DRAFT")}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button
            disabled={loading || !title.trim() || !description.trim()}
            onClick={() => handleSubmit("PUBLISHED")}
          >
            <Send className="h-4 w-4 mr-2" />
            {loading ? "Publishing..." : "Publish"}
          </Button>
        </div>
      </div>
    </div>
  );
}
