"use client";

import { Bell, Search, Command, User, Settings, LogOut, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import Link from "next/link";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { signOut } from "next-auth/react";

interface TopbarProps {
  user: {
    id: string;
    name?: string | null;
    image?: string | null;
    username: string;
    role?: string | null;
  };
}

import { useState } from "react";
import { useRouter } from "next/navigation";

export function Topbar({ user }: TopbarProps) {
  const [searchValue, setSearchValue] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchValue.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchValue.trim())}`);
      setSearchValue("");
    }
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border/40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl px-6 lg:px-10 shadow-sm">
      <div className="flex-1">
        <div className="relative group max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-all duration-300" />
          <Input
            placeholder="Search everything..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={handleSearch}
            className="pl-11 pr-12 bg-slate-100/50 dark:bg-slate-800/50 border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-primary/20 transition-all duration-300 rounded-[1.25rem] h-10 text-sm shadow-inner"
            data-search-input
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-1.5 py-0.5 rounded-lg border border-border/50 bg-background/80 opacity-60 group-focus-within:opacity-0 transition-all duration-300">
            <Command className="h-3 w-3" />
            <span className="text-[10px] font-bold tracking-tighter">K</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-5">
        <NotificationBell />
        
        <div className="h-5 w-px bg-border/40 mx-1" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3.5 group outline-none">
              <div className="flex flex-col items-end text-right hidden sm:flex">
                <span className="text-sm font-bold leading-tight group-hover:text-primary transition-colors tracking-tight">
                  {user.name}
                </span>
                <span className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-widest mt-0.5">
                  @{user.username}
                </span>
              </div>
              <div className="relative">
                <Avatar className="h-10 w-10 border-2 border-white dark:border-slate-900 ring-2 ring-transparent group-hover:ring-primary/20 transition-all duration-300 shadow-md rounded-2xl overflow-hidden">
                  <AvatarImage src={user.image || undefined} alt={user.name || ""} className="object-cover" />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                    {getInitials(user.name || "U")}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 shadow-sm" />
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-xl border-border/50">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-3">
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-bold">{user.name}</p>
                  <p className="text-xs text-muted-foreground">@{user.username}</p>
                  {user.role && (
                    <p className="text-[10px] text-primary font-medium uppercase tracking-wider mt-1">{user.role.toLowerCase().replace(/_/g, ' ')}</p>
                  )}
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild className="h-10 rounded-xl cursor-pointer">
                <Link href={`/profile/${user.username}`} className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="text-sm">View Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="h-10 rounded-xl cursor-pointer">
                <Link href="/settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span className="text-sm">Settings</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem 
                onClick={() => signOut({ callbackUrl: "/" })} 
                className="h-10 rounded-xl cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-950/30"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm font-medium">Log out</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
