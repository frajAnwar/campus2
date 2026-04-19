"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  NAV_GROUPS, 
  ADMIN_NAV, 
  ICON_MAP, 
  canSeeNav, 
  EDUCATOR_QUICK_ACTIONS,
  CLUB_MANAGER_QUICK_ACTIONS,
  hasMinimumRole
} from "@/lib/navigation";
import { Command, ArrowRight, ChevronRight, Plus, Sparkles, Menu } from "lucide-react";
import { ActiveUsers } from "./ActiveUsers";
import type { User } from "@/types";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface SidebarProps {
  user: any;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.querySelector<HTMLInputElement>('[data-search-input]')?.focus();
      }
      
      // Number shortcuts for first 9 nav items
      if (e.altKey && /^\d$/.test(e.key)) {
        const index = parseInt(e.key) - 1;
        const allItems = NAV_GROUPS.flatMap(g => g.items.filter(i => canSeeNav(i, user.role)));
        if (allItems[index]) {
          e.preventDefault();
          router.push(allItems[index].href);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router, user.role]);

  // Get quick actions based on user role
  const quickActions = [
    ...EDUCATOR_QUICK_ACTIONS.filter(item => canSeeNav(item, user.role)),
    ...CLUB_MANAGER_QUICK_ACTIONS.filter(item => canSeeNav(item, user.role)),
  ];

  return (
    <aside 
      className={cn(
        "hidden lg:flex flex-col fixed inset-y-0 border-r border-border/40 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-2xl transition-all duration-300 z-30",
        isCollapsed ? "w-20" : "w-64"
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Logo Section */}
      <div className="flex h-16 items-center px-4 border-b border-border/40">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="size-9 rounded-2xl bg-white/5 border border-border/40 flex items-center justify-center shadow-xl shadow-primary/10 overflow-hidden group-hover:scale-105 transition-transform">
            <Image src="/campus-mark-only.png" alt="Campus" width={24} height={24} className="object-contain" />
          </div>
          {!isCollapsed && (
            <span className="font-display font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-slate-900 to-slate-500 dark:from-white dark:to-slate-400">
              Campus
            </span>
          )}
        </Link>
        
        {/* Collapse toggle */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="ml-auto p-1.5 rounded-lg hover:bg-accent/50 transition-colors text-muted-foreground hover:text-foreground"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronRight className={cn("h-4 w-4 transition-transform duration-300", isCollapsed && "rotate-180")} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-8">
        {/* Quick Actions - Role Based */}
        {quickActions.length > 0 && !isCollapsed && (
          <div className="space-y-2 px-1">
            <div className="flex items-center gap-2 px-3 mb-2">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                Quick Actions
              </h3>
            </div>
            <div className="space-y-1">
              {quickActions.map((action) => {
                const Icon = ICON_MAP[action.icon];
                return (
                  <Button
                    key={action.href}
                    variant="ghost"
                    className="w-full justify-start gap-3 rounded-xl h-9 text-sm font-medium"
                    onClick={() => router.push(action.href)}
                  >
                    <Plus className="h-4 w-4 text-primary" />
                    <span>{action.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {/* Navigation Groups */}
        {NAV_GROUPS.map((group) => {
          const visibleItems = group.items.filter((item) => canSeeNav(item, user.role));
          if (visibleItems.length === 0) return null;
          
          const isExpanded = expandedGroups[group.label] !== false;
          
          return (
            <div key={group.label} className="space-y-1.5">
              {!isCollapsed && (
                <button 
                  className="w-full flex items-center gap-2 px-3 mb-1"
                  onClick={() => setExpandedGroups(p => ({ ...p, [group.label]: !isExpanded }))}
                >
                  <ChevronRight className={cn("h-3 w-3 text-muted-foreground/40 transition-transform", isExpanded && "rotate-90")} />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
                    {group.label}
                  </h3>
                </button>
              )}
              
              {isExpanded && (
                <ul className="space-y-1">
                  {visibleItems.map((item) => {
                    const Icon = ICON_MAP[item.icon];
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={cn(
                            "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 relative",
                            isCollapsed ? "justify-center px-0 py-3" : "",
                            isActive
                              ? "bg-white dark:bg-slate-800 text-primary shadow-sm ring-1 ring-border/20"
                              : "text-muted-foreground/80 hover:bg-white dark:hover:bg-slate-800 hover:text-primary"
                          )}
                          aria-current={isActive ? "page" : undefined}
                        >
                          {isActive && !isCollapsed && (
                            <div className="absolute left-0 w-1 h-5 bg-primary rounded-full -ml-px" />
                          )}
                          {Icon && (
                            <Icon className={cn(
                              "h-[1.15rem] w-[1.15rem] transition-all duration-200 flex-shrink-0",
                              isActive ? "text-primary scale-110" : "group-hover:text-primary group-hover:scale-110"
                            )} />
                          )}
                          {!isCollapsed && (
                            <span className="tracking-tight">{item.label}</span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}

        {/* Admin Navigation */}
        {canSeeNav(ADMIN_NAV, user.role) && !isCollapsed && (
          <div className="pt-4 mt-4 border-t border-border/40 space-y-2">
             <h3 className="px-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 mb-1">
                Administration
              </h3>
              <Link
                href={ADMIN_NAV.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  pathname.startsWith(ADMIN_NAV.href)
                    ? "bg-red-500/5 text-red-500 shadow-sm ring-1 ring-red-500/10"
                    : "text-muted-foreground/80 hover:bg-red-500/5 hover:text-red-500"
                )}
              >
                {(() => {
                  const AdminIcon = ICON_MAP[ADMIN_NAV.icon];
                  return AdminIcon ? <AdminIcon className="h-[1.15rem] w-[1.15rem]" /> : null;
                })()}
                <span className="tracking-tight">{ADMIN_NAV.label}</span>
              </Link>
          </div>
        )}

        {/* Active Users */}
        {!isCollapsed && <ActiveUsers />}
      </div>

      {/* Help Section */}
      <div className={cn("border-t border-border/40", isCollapsed ? "p-2" : "p-4")}>
        <div className={cn(
          "rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/10 relative overflow-hidden group",
          isCollapsed ? "p-2 justify-center flex" : "p-4"
        )}>
          {isCollapsed ? (
            <Command className="h-5 w-5 text-primary/70" />
          ) : (
            <>
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform">
                 <Command className="size-16" />
              </div>
              <p className="text-xs font-bold text-primary tracking-tight">Keyboard shortcuts</p>
              <p className="text-[10px] text-muted-foreground/80 mt-1 leading-relaxed font-medium">
                Press <kbd className="px-1 py-0.5 bg-background/50 rounded text-[10px] border border-border/40">⌘K</kbd> to search
              </p>
               <Link href="/dashboard" className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-primary hover:gap-2 transition-all uppercase tracking-wider">
                 Dashboard <ArrowRight className="h-3 w-3" />
               </Link>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
