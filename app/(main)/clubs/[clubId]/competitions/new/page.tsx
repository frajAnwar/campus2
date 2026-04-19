"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Params = Promise<{ clubId: string }>;

export default function NewClubCompetitionPage({ params }: { params: Params }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [rules, setRules] = useState("");
  const [type, setType] = useState("CODING");
  const [prizeDescription, setPrizeDescription] = useState("");
  const [maxTeamSize, setMaxTeamSize] = useState("1");
  const [judgingType, setJudgingType] = useState("MANUAL");
  const [registrationOpensAt, setRegistrationOpensAt] = useState("");
  const [submissionsOpensAt, setSubmissionsOpensAt] = useState("");
  const [submissionsClosesAt, setSubmissionsClosesAt] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const competitionTypes = [
    "CODING",
    "DESIGN",
    "IDEA_PITCH",
    "ESSAY",
    "HACKATHON",
    "GAMING",
  ];
  const judgingTypes = ["MANUAL", "COMMUNITY_VOTE", "AUTO"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { clubId } = await params;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/clubs/${clubId}/competitions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          rules: rules || undefined,
          type,
          prizeDescription: prizeDescription || undefined,
          maxTeamSize: parseInt(maxTeamSize) || 1,
          judgingType,
          registrationOpensAt: registrationOpensAt
            ? new Date(registrationOpensAt).toISOString()
            : undefined,
          submissionsOpensAt: submissionsOpensAt
            ? new Date(submissionsOpensAt).toISOString()
            : undefined,
          submissionsClosesAt: submissionsClosesAt
            ? new Date(submissionsClosesAt).toISOString()
            : undefined,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/clubs/${clubId}/competitions/${data.id}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-2">
        <Link 
          href={`/clubs/${(async () => (await params).clubId)()}/competitions`} 
          className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to competitions
        </Link>
        <h1 className="text-2xl font-display font-bold">Create Club Competition</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Competition Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Club Hackathon 2025"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the competition..."
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rules">Rules</Label>
              <Textarea
                id="rules"
                value={rules}
                onChange={(e) => setRules(e.target.value)}
                placeholder="Competition rules and guidelines..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <div className="flex flex-wrap gap-2">
                {competitionTypes.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                      type === t
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t.replace(/_/g, " ")}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prize">Prize Description</Label>
              <Input
                id="prize"
                value={prizeDescription}
                onChange={(e) => setPrizeDescription(e.target.value)}
                placeholder="e.g. $500 cash prize + swag"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxTeamSize">Max Team Size</Label>
                <Input
                  id="maxTeamSize"
                  type="number"
                  min="1"
                  value={maxTeamSize}
                  onChange={(e) => setMaxTeamSize(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Judging Type</Label>
                <div className="flex gap-2 flex-wrap">
                  {judgingTypes.map((j) => (
                    <button
                      key={j}
                      type="button"
                      onClick={() => setJudgingType(j)}
                      className={`rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
                        judgingType === j
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {j.replace(/_/g, " ")}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="regOpen">Registration Opens</Label>
                <Input
                  id="regOpen"
                  type="datetime-local"
                  value={registrationOpensAt}
                  onChange={(e) => setRegistrationOpensAt(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subOpen">Submissions Open</Label>
                <Input
                  id="subOpen"
                  type="datetime-local"
                  value={submissionsOpensAt}
                  onChange={(e) => setSubmissionsOpensAt(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subClose">Submissions Close</Label>
                <Input
                  id="subClose"
                  type="datetime-local"
                  value={submissionsClosesAt}
                  onChange={(e) => setSubmissionsClosesAt(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={submitting || !title || !description}
              >
                {submitting ? "Creating..." : "Create Competition"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
