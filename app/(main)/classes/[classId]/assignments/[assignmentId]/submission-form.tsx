"use client";

import { useState } from "react";
import { submitAssignment } from "@/actions/assignment";
import { SubmissionForm } from "@/components/classroom/SubmissionForm";
import { useRouter } from "next/navigation";

export function SubmissionFormWrapper({
  assignmentId,
  classId,
}: {
  assignmentId: string;
  classId: string;
}) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (data: {
    body: string;
    githubUrl?: string;
    fileUrl?: string;
  }) => {
    setLoading(true);
    setError("");

    const result = await submitAssignment({
      assignmentId,
      content: data.body,
      githubUrl: data.githubUrl,
      fileUrl: data.fileUrl,
    });

    setLoading(false);

    if (result.success) {
      setSuccess(true);
      router.refresh();
    } else {
      setError(result.error ?? "Failed to submit");
    }
  };

  if (success) {
    return (
      <div className="rounded-xl bg-green-500/15 px-4 py-3 text-sm text-green-600 dark:text-green-400 text-center font-medium">
        Assignment submitted successfully!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-xl bg-destructive/15 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <SubmissionForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}
