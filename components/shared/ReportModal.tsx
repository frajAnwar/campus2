"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { submitReport } from "@/actions/report";
import { toast } from "sonner";

const CATEGORIES = [
  { value: "HARASSMENT", label: "Harassment or bullying" },
  { value: "INAPPROPRIATE", label: "Inappropriate content" },
  { value: "PLAGIARISM", label: "Plagiarism or cheating" },
  { value: "SPAM", label: "Spam or bot" },
  { value: "MISINFORMATION", label: "Misinformation" },
  { value: "OTHER", label: "Other" },
];

interface Props {
  open: boolean;
  onClose: () => void;
  postId?: string;
  commentId?: string;
  reportedId?: string;
}

export function ReportModal({
  open,
  onClose,
  postId,
  commentId,
  reportedId,
}: Props) {
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!category) return toast.error("Please select a category");
    setLoading(true);
    const result = await submitReport({
      category: category as any,
      note,
      postId,
      commentId,
      reportedId,
    });
    setLoading(false);
    if (result.success) {
      toast.success("Report submitted. We'll review it shortly.");
      onClose();
    } else {
      toast.error(result.error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report Content</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <RadioGroup value={category} onValueChange={setCategory}>
            {CATEGORIES.map((c) => (
              <div key={c.value} className="flex items-center space-x-2">
                <RadioGroupItem value={c.value} id={c.value} />
                <Label htmlFor={c.value}>{c.label}</Label>
              </div>
            ))}
          </RadioGroup>
          <Textarea
            placeholder="Additional details (optional, max 500 chars)"
            value={note}
            onChange={(e) => setNote(e.target.value.slice(0, 500))}
            rows={3}
          />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Report"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
