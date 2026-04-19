"use client";

import React, { useState } from "react";
import { explainAssignment } from "@/actions/ai";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ExplainButtonProps {
  assignmentId: string;
  compact?: boolean;
}

export function ExplainButton({ assignmentId, compact }: ExplainButtonProps) {
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<any>(null);
  const [error, setError] = useState("");
  const [collapsed, setCollapsed] = useState(false);

  const handleExplain = async () => {
    if (explanation && !collapsed) {
      setCollapsed(true);
      return;
    }
    if (explanation && collapsed) {
      setCollapsed(false);
      return;
    }

    setLoading(true);
    setError("");

    const result = await explainAssignment(assignmentId);

    setLoading(false);

    if ((result as any).success && (result as any).data) {
      setExplanation((result as any).data);
      setCollapsed(false);
    } else {
      setError((result as any).error ?? "Failed to generate explanation");
    }
  };

  return (
    <div className="space-y-3">
      <Button
        variant="outline"
        size={compact ? "sm" : "default"}
        onClick={handleExplain}
        disabled={loading}
        className={cn(compact && "h-8 text-xs px-2.5 gap-1")}
      >
        {loading ? (
          <Loader2 className={cn("animate-spin", compact ? "h-3 w-3" : "mr-2 h-4 w-4")} />
        ) : (
          <Sparkles className={cn(compact ? "h-3 w-3" : "mr-2 h-4 w-4")} />
        )}
        {loading
          ? "Explaining..."
          : compact
            ? "AI Explain"
            : explanation
              ? "AI Explain"
              : "AI Explain"}
        {explanation && !loading && (
          collapsed ? (
            <ChevronDown className="h-3 w-3 ml-1" />
          ) : (
            <ChevronUp className="h-3 w-3 ml-1" />
          )
        )}
      </Button>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {explanation && !collapsed && (
        <Card className="border-primary/20 bg-primary/[0.02] dark:bg-primary/[0.04]">
          <CardContent className={cn("space-y-4", compact ? "p-4" : "p-6")}>
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="h-4 w-4" />
              <span className="font-semibold text-sm">AI Explanation</span>
            </div>

            {explanation.what_to_do && (
              <div>
                <p className="font-medium text-sm mb-1">What to do</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {explanation.what_to_do}
                </p>
              </div>
            )}
            {explanation.requirements?.length > 0 && (
              <div>
                <p className="font-medium text-sm mb-1">Requirements</p>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {explanation.requirements.map((r: string, i: number) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
            {explanation.suggested_approach?.length > 0 && (
              <div>
                <p className="font-medium text-sm mb-1">Suggested Approach</p>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {explanation.suggested_approach.map((s: string, i: number) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
            {explanation.common_mistakes?.length > 0 && (
              <div>
                <p className="font-medium text-sm mb-1">Common Mistakes</p>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {explanation.common_mistakes.map((m: string, i: number) => (
                    <li key={i}>{m}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
