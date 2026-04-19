"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PollResults } from "@/components/polls/PollResults";
import { voteOnPoll } from "@/actions/poll";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PollOption {
  id: string;
  text: string;
  _count?: { votes: number };
}

interface PollCardProps {
  poll: {
    id: string;
    question: string;
    isMultipleChoice: boolean;
    endsAt?: Date | string | null;
    options: PollOption[];
    totalVotes?: number;
    hasVoted?: boolean;
  };
}

export function PollCard({ poll }: PollCardProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [voted, setVoted] = useState(poll.hasVoted ?? false);
  const [loading, setLoading] = useState(false);

  const isExpired = poll.endsAt ? new Date(poll.endsAt) < new Date() : false;
  const totalVotes = poll.totalVotes ?? poll.options.reduce((sum, o) => sum + (o._count?.votes ?? 0), 0);

  const toggleOption = (id: string) => {
    const next = new Set(selected);
    if (poll.isMultipleChoice) {
      if (next.has(id)) next.delete(id);
      else next.add(id);
    } else {
      next.clear();
      next.add(id);
    }
    setSelected(next);
  };

  const handleVote = async () => {
    if (selected.size === 0) return;
    setLoading(true);
    const result = await voteOnPoll({ pollId: poll.id, optionIds: [...selected] });
    setLoading(false);
    if (result.success) {
      setVoted(true);
    } else {
      toast.error(result.error);
    }
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-semibold">{poll.question}</h4>
          <div className="flex items-center gap-1.5 shrink-0">
            {poll.isMultipleChoice && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">Multiple</Badge>
            )}
            {isExpired && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-zinc-500/15 text-zinc-500">Ended</Badge>
            )}
          </div>
        </div>

        {!voted && !isExpired ? (
          <div className="space-y-1.5">
            {poll.options.map((option) => (
              <button
                key={option.id}
                onClick={() => toggleOption(option.id)}
                className={cn(
                  "w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                  selected.has(option.id)
                    ? "border-primary bg-primary/5"
                    : "border-muted hover:border-muted-foreground/30"
                )}
              >
                {option.text}
              </button>
            ))}
            <Button
              size="sm"
              className="w-full mt-2"
              onClick={handleVote}
              disabled={loading || selected.size === 0}
            >
              {loading ? "Voting..." : "Vote"}
            </Button>
          </div>
        ) : (
          <PollResults options={poll.options} totalVotes={totalVotes} />
        )}

        <p className="text-[10px] text-muted-foreground text-right">
          {totalVotes} vote{totalVotes !== 1 ? "s" : ""}
        </p>
      </CardContent>
    </Card>
  );
}
