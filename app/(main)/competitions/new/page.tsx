"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Trophy } from "lucide-react";

export default function NewCompetitionPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-2">
        <Link href="/competitions" className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" />
          Back to competitions
        </Link>
        <h1 className="text-2xl font-display font-bold">Create Competition</h1>
      </div>

      <Card>
        <CardContent className="py-12 text-center">
          <Trophy className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Competitions are now club-based</h3>
          <p className="text-muted-foreground mb-4">
            Competitions can only be created within clubs. Visit a club you manage to create a new competition.
          </p>
          <Link href="/clubs">
            <Button>
              Browse My Clubs
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
