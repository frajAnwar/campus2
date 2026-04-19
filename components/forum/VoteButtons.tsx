"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { voteOnPost } from "@/actions/post";
import { voteOnComment } from "@/actions/comment";
import { toast } from "sonner";

interface VoteButtonsProps {
  itemId: string;
  score: number;
  userVote?: 1 | -1 | null;
  type?: "post" | "comment";
  size?: "sm" | "md";
  onVoteSuccess?: (newScore: number) => void;
}

export function VoteButtons({
  itemId,
  score,
  userVote,
  type = "post",
  size = "md",
  onVoteSuccess,
}: VoteButtonsProps) {
  const [currentVote, setCurrentVote] = useState(userVote ?? null);
  const [currentScore, setCurrentScore] = useState(score);
  const [loading, setLoading] = useState(false);

  const handleVote = async (value: 1 | -1) => {
    setLoading(true);
    try {
      const action = type === "post" ? voteOnPost : voteOnComment;
      const result = await (type === "post"
        ? voteOnPost(itemId, value)
        : voteOnComment(itemId, value));

      if (result.success) {
        if (currentVote === value) {
          setCurrentVote(null);
          setCurrentScore((s) => s - value);
        } else {
          const delta = currentVote ? value * 2 : value;
          setCurrentVote(value);
          setCurrentScore((s) => s + delta);
        }
        onVoteSuccess?.(currentScore);
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Failed to vote");
    } finally {
      setLoading(false);
    }
  };

  const btnClass = size === "sm" ? "h-6 w-6" : "h-8 w-8";
  const iconClass = size === "sm" ? "h-3 w-3" : "h-4 w-4";

  return (
    <div className="flex flex-col items-center gap-0.5">
      <button
        onClick={() => handleVote(1)}
        disabled={loading}
        className={cn(
          "flex items-center justify-center rounded-md hover:bg-accent transition-colors disabled:opacity-50",
          btnClass,
          currentVote === 1 && "text-orange-500"
        )}
      >
        <ChevronUp className={iconClass} />
      </button>
      <span
        className={cn(
          "text-xs font-semibold tabular-nums",
          currentVote === 1 && "text-orange-500",
          currentVote === -1 && "text-blue-500"
        )}
      >
        {currentScore}
      </span>
      <button
        onClick={() => handleVote(-1)}
        disabled={loading}
        className={cn(
          "flex items-center justify-center rounded-md hover:bg-accent transition-colors disabled:opacity-50",
          btnClass,
          currentVote === -1 && "text-blue-500"
        )}
      >
        <ChevronDown className={iconClass} />
      </button>
    </div>
  );
}
