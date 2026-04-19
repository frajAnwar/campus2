"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowLeft, Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RichTextEditor } from "@/components/shared/RichTextEditor";
import { createPost } from "@/actions/post";
import { toast } from "sonner";
import type { PostType, Visibility } from "@prisma/client";

const schema = z.object({
  type: z.enum(["QUESTION", "DISCUSSION", "SHOWCASE", "NOTE_SHARE", "POLL"]),
  title: z.string().min(5).max(200),
  body: z.string().min(10).max(10000),
  visibility: z.enum(["PUBLIC", "UNIVERSITY", "CLASS", "FOLLOWERS"]),
  tags: z.array(z.string()).max(5),
});

type FormValues = z.infer<typeof schema>;

export default function NewPostPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [showPoll, setShowPoll] = useState(false);
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollAnonymous, setPollAnonymous] = useState(false);
  const [pollMultiple, setPollMultiple] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      type: "DISCUSSION",
      title: "",
      body: "",
      visibility: "PUBLIC",
      tags: [],
    },
  });

  const tags = watch("tags");
  const visibility = watch("visibility");
  const postType = watch("type");

  const addTag = (tag: string) => {
    const t = tag.trim().toLowerCase();
    if (t && !tags.includes(t) && tags.length < 5) {
      setValue("tags", [...tags, t]);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setValue(
      "tags",
      tags.filter((t) => t !== tag)
    );
  };

  const addPollOption = () => {
    if (pollOptions.length < 6) {
      setPollOptions([...pollOptions, ""]);
    }
  };

  const removePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  const onSubmit = async (data: FormValues) => {
    setSubmitting(true);
    try {
      const input: any = { ...data };

      if (showPoll && postType === "POLL") {
        const validOptions = pollOptions.filter((o) => o.trim());
        if (!pollQuestion.trim()) {
          toast.error("Poll question is required");
          setSubmitting(false);
          return;
        }
        if (validOptions.length < 2) {
          toast.error("Poll needs at least 2 options");
          setSubmitting(false);
          return;
        }
        input.poll = {
          question: pollQuestion,
          options: validOptions,
          isAnonymous: pollAnonymous,
          isMultipleChoice: pollMultiple,
        };
      }

      const result = await createPost(input);
      if (result.success && result.data) {
        toast.success("Post created!");
        router.push(`/forum/${result.data.id}`);
      } else {
        toast.error(result.error || "Failed to create post");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold">Create Post</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Post Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select
                  value={postType}
                  onValueChange={(v) => setValue("type", v as PostType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="QUESTION">Question</SelectItem>
                    <SelectItem value="DISCUSSION">Discussion</SelectItem>
                    <SelectItem value="SHOWCASE">Showcase</SelectItem>
                    <SelectItem value="NOTE_SHARE">Note Share</SelectItem>
                    <SelectItem value="POLL">Poll</SelectItem>
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-xs text-destructive">{errors.type.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>Visibility</Label>
                <Select
                  value={visibility}
                  onValueChange={(v) => setValue("visibility", v as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PUBLIC">Public</SelectItem>
                    <SelectItem value="UNIVERSITY">University</SelectItem>
                    <SelectItem value="CLASS">Class</SelectItem>
                    <SelectItem value="FOLLOWERS">Followers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input
                {...register("title")}
                placeholder="What's on your mind?"
                maxLength={200}
              />
              {errors.title && (
                <p className="text-xs text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Body</Label>
              <RichTextEditor
                value={watch("body")}
                onChange={(v) => setValue("body", v)}
              />
              {errors.body && (
                <p className="text-xs text-destructive">{errors.body.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Tags (max 5)</Label>
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
              />
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {postType === "POLL" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Poll</CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowPoll(!showPoll)}
              >
                {showPoll ? "Remove Poll" : "Add Poll"}
              </Button>
            </CardHeader>
            {(showPoll || postType === "POLL") && (
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Question</Label>
                  <Input
                    value={pollQuestion}
                    onChange={(e) => setPollQuestion(e.target.value)}
                    placeholder="What do you want to ask?"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Options</Label>
                  {pollOptions.map((opt, i) => (
                    <div key={i} className="flex gap-2">
                      <Input
                        value={opt}
                        onChange={(e) => {
                          const next = [...pollOptions];
                          next[i] = e.target.value;
                          setPollOptions(next);
                        }}
                        placeholder={`Option ${i + 1}`}
                      />
                      {pollOptions.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removePollOption(i)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  {pollOptions.length < 6 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addPollOption}
                      className="gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      Add option
                    </Button>
                  )}
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={pollAnonymous}
                      onChange={(e) => setPollAnonymous(e.target.checked)}
                      className="rounded"
                    />
                    Anonymous voting
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={pollMultiple}
                      onChange={(e) => setPollMultiple(e.target.checked)}
                      className="rounded"
                    />
                    Multiple choice
                  </label>
                </div>
              </CardContent>
            )}
          </Card>
        )}

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Create Post
          </Button>
        </div>
      </form>
    </div>
  );
}
