"use client";

import { useState } from "react";
import Link from "next/link";
import { UserPlus, UserMinus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/shared/Avatar";
import { RankBadge } from "@/components/gamification/RankBadge";
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

interface UserCardProps {
  user: {
    id: string;
    name: string;
    username?: string;
    image?: string | null;
    rank: Rank;
    role: Role;
  };
  isFollowing?: boolean;
}

export function UserCard({ user, isFollowing: initialFollowing }: UserCardProps) {
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
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="flex items-center gap-3 p-4">
        <Link href={`/profile/${user.username}`}>
          <Avatar src={user.image} name={user.name} size="lg" />
        </Link>
        <div className="flex-1 min-w-0">
          <Link href={`/profile/${user.username}`} className="font-semibold text-sm hover:text-primary transition-colors">
            {user.name}
          </Link>
          {user.username && (
            <p className="text-xs text-muted-foreground">@{user.username}</p>
          )}
          <div className="flex items-center gap-1.5 mt-1">
            <RankBadge rank={user.rank} className="text-[10px]" />
            <Badge variant="secondary" className={cn("text-[10px] px-1.5 py-0", ROLE_STYLES[user.role])}>
              {ROLE_LABELS[user.role]}
            </Badge>
          </div>
        </div>
        <Button
          variant={following ? "outline" : "default"}
          size="sm"
          className="gap-1"
          onClick={handleToggleFollow}
          disabled={loading}
        >
          {following ? (
            <>
              <UserMinus className="h-3 w-3" />
              Following
            </>
          ) : (
            <>
              <UserPlus className="h-3 w-3" />
              Follow
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
