"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Loader2, Award } from "lucide-react";
import { reviewProject } from "@/actions/project";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function ProjectReviewForm({ projectId }: { projectId: string }) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    setLoading(true);
    const result = await reviewProject(projectId, rating, content);
    setLoading(false);

    if (result.success) {
      toast.success("Review submitted! +15 XP earned");
      setRating(0);
      setContent("");
    } else {
      toast.error(result.error || "Failed to submit review");
    }
  };

  return (
    <Card className="border-none shadow-sm ring-1 ring-border/50 overflow-hidden rounded-[2.5rem] bg-slate-50 dark:bg-slate-900/30">
      <CardHeader className="p-8 pb-4">
        <CardTitle className="text-xl font-display font-bold flex items-center gap-3">
          <Award className="h-5 w-5 text-primary" />
          Leave a Review
        </CardTitle>
        <p className="text-sm text-muted-foreground">Share your feedback and help the author improve!</p>
      </CardHeader>
      <CardContent className="p-8 pt-0 space-y-6">
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              onClick={() => setRating(star)}
              className="transition-transform active:scale-90"
            >
              <Star
                className={cn(
                  "size-8 transition-colors",
                  (hoveredRating || rating) >= star
                    ? "fill-primary text-primary"
                    : "text-muted-foreground/30"
                )}
              />
            </button>
          ))}
          <span className="ml-2 text-sm font-bold text-muted-foreground">
            {rating > 0 ? `${rating} Stars` : "Select rating"}
          </span>
        </div>

        <Textarea
          placeholder="What did you think about this project? (Technical complexity, design, usability...)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[120px] rounded-2xl bg-white dark:bg-slate-900 border-border/40 focus:ring-primary/20 transition-all text-sm leading-relaxed"
        />

        <Button
          onClick={handleSubmit}
          disabled={loading || rating === 0}
          className="w-full rounded-2xl h-12 font-bold bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 transition-all"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Submit Peer Review"}
        </Button>
      </CardContent>
    </Card>
  );
}
