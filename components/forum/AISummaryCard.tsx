"use client";

import { useState } from "react";
import { Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { summarizeThread } from "@/actions/ai";
import { toast } from "sonner";

interface AISummary {
  topic?: string;
  key_points?: string[];
  best_answer?: string | null;
  unresolved?: string | null;
}

interface AISummaryCardProps {
  postId: string;
  existingSummary?: AISummary | null;
}

export function AISummaryCard({ postId, existingSummary }: AISummaryCardProps) {
  const [summary, setSummary] = useState<AISummary | null>(existingSummary ?? null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleSummarize = async () => {
    setLoading(true);
    const result = await summarizeThread(postId);
    setLoading(false);
    if (result.success && result.data) {
      const parsed = typeof result.data === "string" ? JSON.parse(result.data) : result.data;
      setSummary(parsed);
      setExpanded(true);
    } else {
      toast.error(result.error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Sparkles className="h-4 w-4 text-amber-500" />
          AI Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!summary && !loading && (
          <Button variant="outline" size="sm" onClick={handleSummarize} className="gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            Summarize thread
          </Button>
        )}

        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <LoadingSpinner size="sm" />
            Summarizing thread...
          </div>
        )}

        {summary && (
          <div className="space-y-3">
            {summary.topic && (
              <p className="text-sm font-medium">{summary.topic}</p>
            )}

            {summary.key_points && summary.key_points.length > 0 && (
              <div>
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Key points ({summary.key_points.length})
                  {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </button>
                {expanded && (
                  <ul className="mt-2 space-y-1">
                    {summary.key_points.map((point, i) => (
                      <li key={i} className="text-sm text-muted-foreground pl-3 border-l-2 border-primary/30">
                        {point}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {summary.best_answer && expanded && (
              <div className="rounded-md bg-emerald-500/10 p-3">
                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-1">Best Answer</p>
                <p className="text-sm">{summary.best_answer}</p>
              </div>
            )}

            {summary.unresolved && expanded && (
              <div className="rounded-md bg-amber-500/10 p-3">
                <p className="text-xs font-medium text-amber-600 dark:text-amber-400 mb-1">Unresolved</p>
                <p className="text-sm">{summary.unresolved}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
