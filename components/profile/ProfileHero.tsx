"use client";

import { useState } from "react";
import { Camera, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/shared/Avatar";
import { RankBadge } from "@/components/gamification/RankBadge";
import { StreakBadge } from "@/components/gamification/StreakBadge";
import { followUser, unfollowUser } from "@/actions/follow";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Role, Rank } from "@prisma/client";

const ROLE_STYLES: Record<string, string> = {
  PLATFORM_ADMIN: "bg-red-500/15 text-red-600 dark:text-red-400",
  UNIVERSITY_ADMIN: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
  EDUCATOR: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  STUDENT: "bg-green-500/15 text-green-600 dark:text-green-400",
  MODERATOR: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
};

const ROLE_LABELS: Record<string, string> = {
  PLATFORM_ADMIN: "Admin",
  UNIVERSITY_ADMIN: "Uni Admin",
  EDUCATOR: "Educator",
  STUDENT: "Student",
  MODERATOR: "Moderator",
};

interface ProfileHeroProps {
  user: {
    id: string;
    name: string;
    username?: string;
    image?: string | null;
    bannerUrl?: string | null;
    tagline?: string | null;
    role: Role;
    rank: Rank;
    university?: string | null;
    currentStreak: number;
  };
  isOwn?: boolean;
  isFollowing?: boolean;
}

export function ProfileHero({ user, isOwn, isFollowing: initialFollowing }: ProfileHeroProps) {
  const [following, setFollowing] = useState(initialFollowing ?? false);
  const [loading, setLoading] = useState(false);

  const handleToggleFollow = async () => {
    setLoading(true);
    const result = following
      ? await unfollowUser(user.id)
      : await followUser(user.id);
    setLoading(false);
    if (result.success) {
      setFollowing(!following);
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="relative">
      <div className="h-32 sm:h-48 bg-gradient-to-r from-primary/20 to-primary/5 rounded-xl overflow-hidden">
        {user.bannerUrl && (
          <img src={user.bannerUrl} alt="Banner" className="h-full w-full object-cover" />
        )}
        {isOwn && (
          <button className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors">
            <Camera className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="px-4 sm:px-6 -mt-12 sm:-mt-16">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
          <div className="relative">
            <Avatar src={user.image} name={user.name} size="lg" className="h-20 w-20 sm:h-28 sm:w-28 text-xl ring-4 ring-background" />
            {isOwn && (
              <button className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Camera className="h-3 w-3" />
              </button>
            )}
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold">{user.name}</h1>
              <RankBadge rank={user.rank} />
              <Badge variant="secondary" className={cn("text-[10px] px-1.5 py-0", ROLE_STYLES[user.role])}>
                {ROLE_LABELS[user.role]}
              </Badge>
            </div>
            {user.username && (
              <p className="text-sm text-muted-foreground">@{user.username}</p>
            )}
            {user.tagline && (
              <p className="text-sm text-muted-foreground">{user.tagline}</p>
            )}
            <div className="flex items-center gap-2">
              {user.university && (
                <span className="text-xs text-muted-foreground">{user.university}</span>
              )}
              <StreakBadge streak={user.currentStreak} />
            </div>
          </div>

          <div className="flex gap-2 shrink-0">
            {isOwn ? (
              <Button variant="outline" size="sm" className="gap-1.5">
                <Settings className="h-3.5 w-3.5" />
                Edit Profile
              </Button>
            ) : (
              <Button
                variant={following ? "outline" : "default"}
                size="sm"
                onClick={handleToggleFollow}
                disabled={loading}
              >
                {following ? "Following" : "Follow"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
