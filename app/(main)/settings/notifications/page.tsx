"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const NOTIFICATION_TYPES = [
  { key: "NEW_ASSIGNMENT", label: "New Assignment" },
  { key: "ASSIGNMENT_GRADED", label: "Assignment Graded" },
  { key: "FORUM_REPLY", label: "Forum Reply" },
  { key: "FORUM_UPVOTE", label: "Forum Upvote" },
  { key: "ANSWER_ACCEPTED", label: "Answer Accepted" },
  { key: "CLUB_EVENT", label: "Club Event" },
  { key: "ANNOUNCEMENT", label: "Announcement" },
  { key: "BADGE_EARNED", label: "Badge Earned" },
  { key: "RANK_UP", label: "Rank Up" },
  { key: "COLLAB_REQUEST", label: "Collab Request" },
  { key: "NEW_FOLLOWER", label: "New Follower" },
  { key: "SYSTEM", label: "System" },
];

export default function NotificationSettingsPage() {
  const [settings, setSettings] = useState<Record<string, boolean>>({});
  const [emailDigest, setEmailDigest] = useState("none");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings/notifications")
      .then((res) => res.json())
      .then((data) => {
        setSettings(data.types || {});
        setEmailDigest(data.emailDigest || "none");
      })
      .catch(() => {});
  }, []);

  const toggleSetting = (key: string) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch("/api/settings/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ types: settings, emailDigest }),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-display font-bold">Notification Settings</h1>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Push Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {NOTIFICATION_TYPES.map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between">
                <Label>{label}</Label>
                <input
                  type="checkbox"
                  checked={settings[key] !== false}
                  onChange={() => toggleSetting(key)}
                  className="rounded"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Email Digest</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              {["none", "daily", "weekly"].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setEmailDigest(v)}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                    emailDigest === v
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
