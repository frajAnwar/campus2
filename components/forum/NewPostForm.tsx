"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { RichTextEditor } from "@/components/shared/RichTextEditor";
import { VisibilityBadge } from "@/components/shared/VisibilityBadge";
import { cn } from "@/lib/utils";
import type { PostType, Visibility } from "@prisma/client";

const POST_TYPES: { value: PostType; label: string }[] = [
  { value: "QUESTION", label: "Question" },
  { value: "DISCUSSION", label: "Discussion" },
  { value: "SHOWCASE", label: "Showcase" },
  { value: "NOTE_SHARE", label: "Note Share" },
  { value: "POLL", label: "Poll" },
];

const VISIBILITY_OPTIONS: { value: Visibility; label: string }[] = [
  { value: "PUBLIC", label: "Public" },
  { value: "UNIVERSITY", label: "University" },
  { value: "CLASS", label: "Class" },
  { value: "FOLLOWERS", label: "Followers" },
  { value: "PRIVATE", label: "Private" },
];

interface NewPostFormProps {
  onSubmit: (data: {
    type: PostType;
    title: string;
    body: string;
    visibility: Visibility;
    tags: string[];
    pollOptions?: string[];
  }) => void;
  loading?: boolean;
  className?: string;
}

export function NewPostForm({ onSubmit, loading, className }: NewPostFormProps) {
  const [type, setType] = useState<PostType>("DISCUSSION");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("PUBLIC");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [showPoll, setShowPoll] = useState(false);
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addTag = (tag: string) => {
    const t = tag.trim().toLowerCase();
    if (t && !tags.includes(t) && tags.length < 5) {
      setTags([...tags, t]);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const addPollOption = () => {
    if (pollOptions.length < 6) {
      setPollOptions([...pollOptions, ""]);
    }
  };

  const updatePollOption = (index: number, value: string) => {
    const updated = [...pollOptions];
    updated[index] = value;
    setPollOptions(updated);
  };

  const removePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = "Title is required";
    if (!body.trim()) newErrors.body = "Body is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit({
      type,
      title: title.trim(),
      body,
      visibility,
      tags,
      pollOptions: showPoll ? pollOptions.filter((o) => o.trim()) : undefined,
    });
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Create Post</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs mb-1.5">Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as PostType)}>
              <SelectTrigger className="h-8 text-sm w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {POST_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs mb-1.5">Visibility</Label>
            <Select value={visibility} onValueChange={(v) => setVisibility(v as Visibility)}>
              <SelectTrigger className="h-8 text-sm w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VISIBILITY_OPTIONS.map((v) => (
                  <SelectItem key={v.value} value={v.value}>
                    {v.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label className="text-xs mb-1.5">Title</Label>
          <Input
            placeholder="What do you want to ask or share?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={cn("h-8 text-sm", errors.title && "border-destructive")}
          />
          {errors.title && <p className="text-xs text-destructive mt-1">{errors.title}</p>}
        </div>

        <div>
          <Label className="text-xs mb-1.5">Body</Label>
          <RichTextEditor value={body} onChange={setBody} className={cn(errors.body && "border-destructive")} />
          {errors.body && <p className="text-xs text-destructive mt-1">{errors.body}</p>}
        </div>

        <div>
          <Label className="text-xs mb-1.5">Tags (max 5)</Label>
          <Input
            placeholder="Add a tag and press Enter"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag(tagInput);
              }
            }}
            className="h-8 text-sm"
          />
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs gap-1 pr-1">
                  {tag}
                  <button onClick={() => removeTag(tag)} className="hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {(type === "POLL" || showPoll) && (
          <div className="space-y-2 rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium">Poll Options</Label>
              <Button variant="ghost" size="sm" onClick={() => setShowPoll(!showPoll)}>
                <X className="h-3 w-3" />
              </Button>
            </div>
            {pollOptions.map((option, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  placeholder={`Option ${i + 1}`}
                  value={option}
                  onChange={(e) => updatePollOption(i, e.target.value)}
                  className="h-7 text-sm"
                />
                {pollOptions.length > 2 && (
                  <Button variant="ghost" size="icon-xs" onClick={() => removePollOption(i)}>
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
            {pollOptions.length < 6 && (
              <Button variant="outline" size="sm" onClick={addPollOption} className="gap-1">
                <Plus className="h-3 w-3" />
                Add option
              </Button>
            )}
          </div>
        )}

        {type !== "POLL" && !showPoll && (
          <Button variant="ghost" size="sm" onClick={() => setShowPoll(true)} className="gap-1">
            <Plus className="h-3 w-3" />
            Add poll
          </Button>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" size="sm">
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={loading}>
            {loading ? "Posting..." : "Post"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
