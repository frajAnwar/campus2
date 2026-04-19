"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, timeAgo } from "@/lib/utils";
import { getNotifications, markAsRead } from "@/actions/notification";
import { usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";

export function NotificationBell({ className }: { className?: string; unreadCount?: number }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const pathname = usePathname();

  const fetchCount = useCallback(async () => {
    const result = await getNotifications({ limit: 1, unreadOnly: true });
    if (result.success) {
      setUnreadCount((result as any).data.unreadCount);
    }
  }, []);

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [fetchCount]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const handleOpen = async () => {
    if (!open) {
      const result = await getNotifications({ limit: 10 });
      if (result.success) {
        setNotifications((result as any).data.items);
      }
    }
  };

  const handleMarkRead = async (id: string) => {
    await markAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, readAt: new Date() } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleOpen}
          className={cn(
            "relative rounded-xl hover:bg-primary/5 hover:text-primary transition-all duration-300",
            className
          )}
        >
          <Bell className="h-[1.15rem] w-[1.15rem]" />
          {unreadCount > 0 && (
            <>
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white ring-2 ring-white dark:ring-slate-900 z-10">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 animate-ping rounded-full bg-red-400 opacity-75" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 p-0 max-h-[500px] rounded-2xl shadow-xl">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-sm">Notifications</h3>
          <Link
            href="/notifications"
            onClick={() => setOpen(false)}
            className="text-xs text-primary font-medium hover:underline"
          >
            View all
          </Link>
        </div>

        <div className="overflow-y-auto max-h-[420px]">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No notifications
            </div>
          ) : (
            <DropdownMenuGroup>
              {notifications.map((n) => {
                const isUnread = !n.readAt;
                return (
                  <DropdownMenuItem
                    key={n.id}
                    className={cn(
                      "px-4 py-3 border-b last:border-0 hover:bg-accent/50 transition-colors cursor-pointer rounded-none",
                      isUnread && "bg-primary/5"
                    )}
                    onClick={() => n.url && handleMarkRead(n.id)}
                    asChild={!!n.url}
                  >
                    {n.url ? (
                      <Link href={n.url}>
                        <div className="flex items-start gap-3 w-full">
                          <div className="flex-1 min-w-0">
                            <p className={cn("text-sm", isUnread && "font-semibold")}>
                              {n.title}
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                              {n.body}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-[10px] text-muted-foreground">
                                {timeAgo(n.createdAt)}
                              </span>
                            </div>
                          </div>
                          {isUnread && (
                            <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                          )}
                        </div>
                      </Link>
                    ) : (
                      <div className="flex items-start gap-3 w-full">
                        <div className="flex-1 min-w-0">
                          <p className={cn("text-sm", isUnread && "font-semibold")}>
                            {n.title}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                            {n.body}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[10px] text-muted-foreground">
                              {timeAgo(n.createdAt)}
                            </span>
                          </div>
                        </div>
                        {isUnread && (
                          <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                        )}
                      </div>
                    )}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuGroup>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
