"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { AIChatPanel } from "@/components/shared/AIChatPanel";

export function AssignmentClientWrapper({ assignmentId }: { assignmentId: string }) {
  const [aiOpen, setAiOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setAiOpen(true)}
        className="rounded-xl h-10 gap-2 border-primary/20 text-primary hover:bg-primary/5 shadow-sm px-4"
      >
        <Sparkles className="h-4 w-4" />
        AI Explain
      </Button>

      <AIChatPanel
        type="ASSIGNMENT"
        targetId={assignmentId}
        isOpen={aiOpen}
        onClose={() => setAiOpen(false)}
      />
    </>
  );
}
