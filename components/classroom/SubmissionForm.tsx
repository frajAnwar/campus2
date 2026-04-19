"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { GithubIcon } from "@/components/shared/Icons";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUpload } from "@/components/shared/FileUpload";
import { cn } from "@/lib/utils";

interface SubmissionFormProps {
  onSubmit: (data: { body: string; githubUrl?: string; fileUrl?: string }) => void;
  loading?: boolean;
  className?: string;
}

export function SubmissionForm({ onSubmit, loading, className }: SubmissionFormProps) {
  const [body, setBody] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFileUpload = async (file: File): Promise<void> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (!res.ok) throw new Error("Upload failed");
    const data = await res.json();
    setFileUrl(data.url);
  };

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};
    if (!body.trim()) newErrors.body = "Please add a description or notes";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    onSubmit({
      body: body.trim(),
      githubUrl: githubUrl.trim() || undefined,
      fileUrl: fileUrl || undefined,
    });
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <Label className="text-xs mb-1.5">Notes / Description</Label>
        <Textarea
          placeholder="Describe your submission..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className={cn("min-h-[100px]", errors.body && "border-destructive")}
        />
        {errors.body && <p className="text-xs text-destructive mt-1">{errors.body}</p>}
      </div>

      <div>
        <Label className="text-xs mb-1.5">GitHub URL (optional)</Label>
        <div className="relative">
          <GithubIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="https://github.com/..."
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>
      </div>

      <div>
        <Label className="text-xs mb-1.5">Attachment (optional)</Label>
        <FileUpload onUpload={handleFileUpload} maxSizeMB={25} />
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={loading} className="gap-1.5">
          <Send className="h-3.5 w-3.5" />
          {loading ? "Submitting..." : "Submit"}
        </Button>
      </div>
    </div>
  );
}
