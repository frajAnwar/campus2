"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function PrivacySettingsPage() {
  const [profileVisibility, setProfileVisibility] = useState("PUBLIC");
  const [allowDMs, setAllowDMs] = useState("EVERYONE");
  const [indexedBySearch, setIndexedBySearch] = useState(true);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [safeMode, setSafeMode] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings/privacy")
      .then((res) => res.json())
      .then((data) => {
        setProfileVisibility(data.profileVisibility || "PUBLIC");
        setAllowDMs(data.allowDMs || "EVERYONE");
        setIndexedBySearch(data.indexedBySearch ?? true);
        setShowOnlineStatus(data.showOnlineStatus ?? true);
        setSafeMode(data.safeMode ?? false);
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch("/api/settings/privacy", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileVisibility,
          allowDMs,
          indexedBySearch,
          showOnlineStatus,
          safeMode,
        }),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-display font-bold">Privacy Settings</h1>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Privacy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Profile Visibility</Label>
              <div className="flex gap-2">
                {["PUBLIC", "UNIVERSITY", "FOLLOWERS", "PRIVATE"].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setProfileVisibility(v)}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                      profileVisibility === v
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {v.charAt(0) + v.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Allow Direct Messages</Label>
              <div className="flex gap-2">
                {["EVERYONE", "FOLLOWERS", "NONE"].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setAllowDMs(v)}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                      allowDMs === v
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {v.charAt(0) + v.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Show in search results</Label>
                <p className="text-xs text-muted-foreground">
                  Allow others to find your profile via search
                </p>
              </div>
              <input
                type="checkbox"
                checked={indexedBySearch}
                onChange={(e) => setIndexedBySearch(e.target.checked)}
                className="rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Show online status</Label>
                <p className="text-xs text-muted-foreground">
                  Let others see when you&apos;re online
                </p>
              </div>
              <input
                type="checkbox"
                checked={showOnlineStatus}
                onChange={(e) => setShowOnlineStatus(e.target.checked)}
                className="rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Safe mode</Label>
                <p className="text-xs text-muted-foreground">
                  Filter potentially sensitive content
                </p>
              </div>
              <input
                type="checkbox"
                checked={safeMode}
                onChange={(e) => setSafeMode(e.target.checked)}
                className="rounded"
              />
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
