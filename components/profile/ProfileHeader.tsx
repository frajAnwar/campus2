import { Avatar } from "@/components/shared/Avatar";
import { RankBadge } from "@/components/gamification/RankBadge";
import { Badge } from "@/components/ui/badge";
import { Flame, MapPin, Link as LinkIcon, Code, Briefcase } from "lucide-react";
import { ProfileActions } from "./ProfileActions";
import Link from "next/link";

interface ProfileHeaderProps {
  user: any;
  isOwn: boolean;
}

export function ProfileHeader({ user, isOwn }: ProfileHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-[2.5rem] bg-white dark:bg-slate-900 border border-border/40 shadow-sm">
      {/* Banner Area */}
      <div 
        className="h-48 w-full bg-gradient-to-r from-primary/10 via-primary/5 to-transparent relative"
        style={user.banner ? { backgroundImage: `url(${user.banner})`, backgroundSize: 'cover' } : {}}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white dark:to-slate-900 opacity-60" />
      </div>

      <div className="px-8 md:px-12 pb-12 -mt-16 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
            <div className="relative">
              <Avatar 
                src={user.image} 
                name={user.name} 
                size="xl" 
                className="h-32 w-32 ring-8 ring-white dark:ring-slate-900 rounded-[2rem] shadow-xl" 
              />
              {user.currentStreak > 0 && (
                <div className="absolute -top-2 -right-2 bg-orange-500 text-white rounded-xl px-2 py-1 flex items-center gap-1 shadow-lg border-2 border-white dark:border-slate-900">
                  <Flame className="h-3.5 w-3.5 fill-white" />
                  <span className="text-[10px] font-bold">{user.currentStreak}</span>
                </div>
              )}
            </div>

            <div className="text-center md:text-left space-y-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <h1 className="text-3xl font-display font-bold tracking-tight">{user.name}</h1>
                <RankBadge rank={user.rank} />
              </div>
              <p className="text-muted-foreground font-medium">@{user.username}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isOwn ? (
              <Link href="/settings">
                <button className="px-6 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold hover:bg-slate-200 transition-all">
                  Edit Profile
                </button>
              </Link>
            ) : (
              <ProfileActions userId={user.id} />
            )}
          </div>
        </div>

        {/* Bio & Links */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="space-y-4">
            {user.tagline && (
              <p className="text-lg font-medium text-slate-700 dark:text-slate-300 italic">
                &quot;{user.tagline}&quot;
              </p>
            )}
            {user.bio && (
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
                {user.bio}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-3 justify-center md:justify-start lg:justify-end">
            {user.university && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="font-medium">{user.university.name}</span>
              </div>
            )}
            {user.websiteUrl && (
              <a href={user.websiteUrl} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary">
                <LinkIcon className="h-4 w-4" />
                <span className="font-medium">Website</span>
              </a>
            )}
            {user.githubUsername && (
              <a href={`https://github.com/${user.githubUsername}`} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary">
                <Code className="h-4 w-4" />
                <span className="font-medium">GitHub</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
