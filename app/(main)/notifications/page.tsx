"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Bell, 
  Check, 
  Trash2, 
  MessageSquare, 
  Award, 
  Trophy, 
  Users, 
  BookOpen,
  MailOpen,
  Clock,
  ExternalLink
} from "lucide-react";
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from "@/actions/notification";
import { timeAgo, cn } from "@/lib/utils";
import Link from "next/link";
import { toast } from "sonner";

const TYPE_ICONS: Record<string, any> = {
  FORUM_REPLY: MessageSquare,
  BADGE_EARNED: Award,
  RANK_UP: Trophy,
  CLUB_JOINED: Users,
  NEW_ASSIGNMENT: BookOpen,
  ANSWER_ACCEPTED: Check,
  SYSTEM: Bell,
};

const TYPE_COLORS: Record<string, string> = {
  FORUM_REPLY: "text-blue-500 bg-blue-500/10",
  BADGE_EARNED: "text-amber-500 bg-amber-500/10",
  RANK_UP: "text-purple-500 bg-purple-500/10",
  CLUB_JOINED: "text-emerald-500 bg-emerald-500/10",
  NEW_ASSIGNMENT: "text-primary bg-primary/10",
  ANSWER_ACCEPTED: "text-emerald-500 bg-emerald-500/10",
  SYSTEM: "text-slate-500 bg-slate-500/10",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    setLoading(true);
    const result = await getNotifications({ limit: 50 });
    if (result.success) {
      setNotifications((result as any).data.items);
      setUnreadCount((result as any).data.unreadCount);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id: string) => {
    const result = await markAsRead(id);
    if (result.success) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, readAt: new Date() } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const handleMarkAllRead = async () => {
    const result = await markAllAsRead();
    if (result.success) {
      setNotifications(prev => prev.map(n => ({ ...n, readAt: new Date() })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    }
  };

  const handleDelete = async (id: string) => {
    const result = await deleteNotification(id);
    if (result.success) {
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success("Notification deleted");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-[1.5rem] bg-primary/10 flex items-center justify-center text-primary">
            <Bell className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight">Notification Center</h1>
            <p className="text-muted-foreground text-sm">Stay updated with your community activities.</p>
          </div>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead} className="rounded-xl font-bold h-10 gap-2 border-primary/20 text-primary">
            <MailOpen className="h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>

      <Card className="border-none shadow-sm ring-1 ring-border/50 overflow-hidden rounded-[2.5rem]">
        <CardContent className="p-0">
          {loading ? (
            <div className="py-20 text-center space-y-4">
              <div className="h-10 w-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
              <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest">Loading Updates...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-24 text-center space-y-4">
               <div className="h-20 w-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
                  <Bell className="h-10 w-10 text-muted-foreground" />
               </div>
               <div className="space-y-1">
                 <h3 className="font-bold text-lg">All caught up!</h3>
                 <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                   You don&apos;t have any notifications at the moment. We&apos;ll let you know when something happens.
                 </p>
               </div>
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {notifications.map((notification) => {
                const Icon = TYPE_ICONS[notification.type] || Bell;
                const colorClass = TYPE_COLORS[notification.type] || "text-slate-500 bg-slate-500/10";
                const isUnread = !notification.readAt;

                return (
                  <div 
                    key={notification.id}
                    className={cn(
                      "p-6 flex gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors group relative",
                      isUnread && "bg-primary/[0.02]"
                    )}
                  >
                    {isUnread && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                    )}
                    
                    <div className={cn("h-12 w-12 rounded-2xl shrink-0 flex items-center justify-center", colorClass)}>
                      <Icon className="h-6 w-6" />
                    </div>

                    <div className="flex-1 space-y-1 pr-12">
                      <div className="flex items-center gap-2">
                        <h4 className={cn("text-sm font-bold leading-none", isUnread ? "text-foreground" : "text-muted-foreground")}>
                          {notification.title}
                        </h4>
                        <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {timeAgo(notification.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {notification.body}
                      </p>
                      
                      {notification.url && (
                        <Link 
                          href={notification.url}
                          onClick={() => handleMarkRead(notification.id)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline mt-2"
                        >
                          View Details
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      )}
                    </div>

                    <div className="absolute right-6 top-6 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {isUnread && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleMarkRead(notification.id)}
                          className="h-8 w-8 rounded-lg text-primary hover:bg-primary/10"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDelete(notification.id)}
                        className="h-8 w-8 rounded-lg text-red-500 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
