import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  Calendar, 
  BarChart3,
  Settings,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";

const educatorNavItems = [
  { href: "/educator", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/educator/classes", icon: BookOpen, label: "My Classes" },
  { href: "/educator/students", icon: Users, label: "Students" },
  { href: "/educator/assignments", icon: Calendar, label: "Assignments" },
  { href: "/educator/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/educator/settings", icon: Settings, label: "Settings" },
];

export default async function EducatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const allowedRoles = [
    "EDUCATOR",
    "TEACHING_ASSISTANT",
    "PLATFORM_ADMIN",
  ];
  if (!allowedRoles.includes(session.user.role ?? "")) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Educator Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r bg-white dark:bg-slate-900">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/educator" className="font-display font-bold text-xl">
            Campus Educator
          </Link>
        </div>
        
        <nav className="flex-1 space-y-1 p-4">
          {educatorNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-foreground transition-colors"
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>
        
        <div className="border-t p-4 space-y-2">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-100 dark:bg-slate-800">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="font-bold text-primary">
                {session.user.name?.charAt(0) || "E"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{session.user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{session.user.role}</p>
            </div>
          </div>
          
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="w-full">
              <LogOut className="h-4 w-4 mr-2" />
              Back to Student View
            </Button>
          </Link>
        </div>
      </aside>
      
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
