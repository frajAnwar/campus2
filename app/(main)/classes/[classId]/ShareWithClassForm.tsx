"use client";

import { useState } from "react";
import { createPost } from "@/actions/post";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/shared/Avatar";
import { Send, X } from "lucide-react";
import { useRouter } from "next/navigation";

export function ShareWithClassForm({
  classId,
  userName,
  userImage,
}: {
  classId: string;
  userName: string;
  userImage?: string | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async () => {
    if (!title.trim() || !body.trim()) return;
    setLoading(true);
    setError("");

    const result = await createPost({
      type: "DISCUSSION",
      title: title.trim(),
      body: body.trim(),
      visibility: "CLASS",
      tags: [],
      classId,
    });

    setLoading(false);

    if (result.success) {
      setTitle("");
      setBody("");
      setExpanded(false);
      router.refresh();
    } else {
      setError(result.error ?? "Failed to post");
    }
  };

  if (!expanded) {
    return (
      <div
        onClick={() => setExpanded(true)}
        className="flex items-center gap-3 rounded-xl border bg-card p-4 cursor-pointer hover:bg-accent/50 transition-colors"
      >
        <Avatar src={userImage} name={userName} size="sm" />
        <span className="text-sm text-muted-foreground">
          Share something with your class...
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar src={userImage} name={userName} size="sm" />
          <span className="text-sm font-medium">{userName}</span>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => {
            setExpanded(false);
            setError("");
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <Textarea
        placeholder="Share an announcement, question, or resource..."
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
      />

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={
            loading ||
            title.trim().length < 5 ||
            body.trim().length < 10
          }
          size="sm"
        >
          <Send className="mr-2 h-4 w-4" />
          {loading ? "Posting..." : "Post"}
        </Button>
      </div>
    </div>
  );
}
