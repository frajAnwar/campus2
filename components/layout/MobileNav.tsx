"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Menu, LayoutDashboard, MessageSquare, BookOpen, User, Sparkles, Plus } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  NAV_GROUPS, 
  ADMIN_NAV, 
  ICON_MAP, 
  canSeeNav, 
  EDUCATOR_QUICK_ACTIONS,
  CLUB_MANAGER_QUICK_ACTIONS
} from "@/lib/navigation";

interface MobileNavProps {
  user: { role?: string | null };
}

const BOTTOM_NAV = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
  { href: "/forum", icon: MessageSquare, label: "Forum" },
  { href: "/classes", icon: BookOpen, label: "Classes" },
  { href: "/profile", icon: User, label: "Profile" },
];

export function MobileNav({ user }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Get quick actions based on user role
  const quickActions = [
    ...EDUCATOR_QUICK_ACTIONS.filter(item => canSeeNav(item, user.role as any)),
    ...CLUB_MANAGER_QUICK_ACTIONS.filter(item => canSeeNav(item, user.role as any)),
  ];

  return (
    <>
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex h-16 items-center gap-4 border-b border-border/50 bg-background/50 backdrop-blur-xl px-4">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger render={<Button variant="ghost" size="icon" className="rounded-xl" />}>
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0 border-r border-border/50 bg-card/50 backdrop-blur-xl">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <div className="flex h-16 items-center px-6 border-b border-border/50">
              <Link href="/dashboard" className="flex items-center gap-2 font-display font-bold text-xl tracking-tight" onClick={() => setOpen(false)}>
                <div className="size-8 rounded-lg bg-white/5 border border-border/40 flex items-center justify-center shadow-lg shadow-primary/10 overflow-hidden">
                  <Image src="/campus-mark-only.png" alt="Campus" width={24} height={24} className="object-contain" />
                </div>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                  Campus
                </span>
              </Link>
            </div>
            <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
              {/* Quick Actions */}
              {quickActions.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 px-3 mb-2">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
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
                          onClick={() => {
                            setOpen(false);
                            router.push(action.href);
                          }}
                        >
                          <Plus className="h-4 w-4 text-primary" />
                          <span>{action.label}</span>
                        </Button>
                      );
                    })}
                  </div>
                </div>
              )}

              {NAV_GROUPS.map((group) => {
                const visibleItems = group.items.filter((item) => canSeeNav(item, user.role as any));
                if (visibleItems.length === 0) return null;

                return (
                  <div key={group.label} className="space-y-2">
                    <h3 className="px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                      {group.label}
                    </h3>
                    <ul className="space-y-1">
                      {visibleItems.map((item) => {
                        const Icon = ICON_MAP[item.icon];
                        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                        return (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              onClick={() => setOpen(false)}
                              className={cn(
                                "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200",
                                isActive
                                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/10"
                                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                              )}
                            >
                              {Icon && (
                                <Icon className={cn(
                                  "h-4 w-4 transition-transform group-hover:scale-110",
                                  isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary"
                                )} />
                              )}
                              {item.label}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}

              {canSeeNav(ADMIN_NAV, user.role as any) && (
                <div className="pt-4 mt-4 border-t border-border/50 space-y-2">
                   <h3 className="px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                      Admin
                    </h3>
                    <Link
                      href={ADMIN_NAV.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200",
                        pathname.startsWith(ADMIN_NAV.href)
                          ? "bg-destructive/10 text-destructive"
                          : "text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      )}
                    >
                      {(() => {
                        const AdminIcon = ICON_MAP[ADMIN_NAV.icon];
                        return AdminIcon ? <AdminIcon className="h-4 w-4" /> : null;
                      })()}
                      {ADMIN_NAV.label}
                    </Link>
                </div>
              )}
            </nav>
          </SheetContent>
        </Sheet>
        <span className="font-display font-bold text-lg tracking-tight">
          <span className="text-primary">C</span>ampus
        </span>
      </div>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-border/50 bg-background/50 backdrop-blur-xl px-2">
        {BOTTOM_NAV.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all duration-200 min-w-[64px]",
                isActive ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-accent/50"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-bold tracking-wide uppercase">{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
