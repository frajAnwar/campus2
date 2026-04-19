"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/shared/Avatar";
import { timeAgo } from "@/lib/utils";
import { MessageSquare, Send } from "lucide-react";
import { createPost } from "@/actions/post";
import { toast } from "sonner";
import { EmptyState } from "@/components/shared/EmptyState";

export interface ClassPost {
  id: string;
  title: string;
  body: string;
  createdAt: Date | string;
  author: { id: string; name: string; image: string | null };
  _count: { comments: number };
}

interface ClassStreamProps {
  posts: ClassPost[];
  classId: string;
  educatorName: string;
  educatorImage: string | null;
}

export function ClassStream({
  posts,
  classId,
  educatorName,
  educatorImage,
}: ClassStreamProps) {
  const [announcement, setAnnouncement] = useState("");
  const [posting, setPosting] = useState(false);
  const router = useRouter();

  const handlePost = async () => {
    if (!announcement.trim()) return;
    setPosting(true);
    try {
      const result = await createPost({
        type: "DISCUSSION",
        title: announcement.trim().slice(0, 200),
        body: announcement.trim(),
        visibility: "CLASS",
        tags: ["announcement"],
        classId,
      });
      if (result.success) {
        setAnnouncement("");
        toast.success("Announcement posted!");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to post");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Avatar
              src={educatorImage}
              name={educatorName}
              size="md"
            />
            <div className="flex-1 space-y-3">
              <Textarea
                placeholder="Post an announcement to your class..."
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
                rows={3}
                className="resize-none"
              />
              <div className="flex justify-end">
                <Button
                  onClick={handlePost}
                  disabled={posting || !announcement.trim()}
                  size="sm"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {posting ? "Posting..." : "Post"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {posts.length === 0 ? (
        <EmptyState
          title="No posts yet"
          description="Post your first announcement to get the conversation started."
        />
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <Avatar
                    src={post.author.image}
                    name={post.author.name}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">
                        {post.author.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {timeAgo(post.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 font-medium">{post.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap line-clamp-4">
                      {post.body}
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                      <MessageSquare className="h-3.5 w-3.5" />
                      {post._count.comments} comments
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
