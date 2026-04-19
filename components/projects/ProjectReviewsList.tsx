"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/shared/Avatar";
import { Star } from "lucide-react";
import { timeAgo, cn } from "@/lib/utils";

export function ProjectReviewsList({ reviews }: { reviews: any[] }) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-20 px-8 bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-border/40">
        <Star className="size-12 text-muted-foreground/20 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-muted-foreground">No reviews yet</h3>
        <p className="text-sm text-muted-foreground">Be the first to review this project!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <Card key={review.id} className="border-none shadow-sm ring-1 ring-border/50 overflow-hidden rounded-[2.5rem] bg-white dark:bg-slate-900/50">
          <CardContent className="p-8">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-4">
                <Avatar src={review.reviewer.image} name={review.reviewer.name} size="md" />
                <div>
                  <h4 className="font-bold text-sm">{review.reviewer.name}</h4>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                    {timeAgo(review.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-primary/5 px-3 py-1.5 rounded-full border border-primary/10">
                <Star className="size-3 fill-primary text-primary" />
                <span className="text-xs font-black text-primary">{review.rating}</span>
              </div>
            </div>
            {review.content && (
              <p className="text-sm text-muted-foreground leading-relaxed italic">
                &quot;{review.content}&quot;
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
