import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { MobileNav } from "@/components/layout/MobileNav";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { StudyTimer } from "@/components/shared/StudyTimer";
import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";
import Link from "next/link";
import { PushNotificationRegistrar } from "@/components/notifications/PushNotificationRegistrar";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const isEducator = ["EDUCATOR", "TEACHING_ASSISTANT", "PLATFORM_ADMIN"].includes(session.user.role ?? "");

  return (
    <div className="flex min-h-screen bg-[#fcfcfd] dark:bg-[#09090b]">
      <MobileNav user={session.user} />
      
      {/* Sidebar - Desktop */}
      <Sidebar user={session.user} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col transition-all duration-300 lg:pl-64 [.sidebar-collapsed_&]:lg:pl-20">
        <Topbar user={session.user} />
        
        {/* Educator Switch Banner */}
        {isEducator && (
          <div className="px-6 py-3 border-b bg-blue-50 dark:bg-blue-950/30">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
              <p className="text-sm text-blue-700 dark:text-blue-300">You're in Student View</p>
              <Link href="/educator">
                <Button variant="secondary" size="sm" className="bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Switch to Educator Dashboard
                </Button>
              </Link>
            </div>
          </div>
        )}
        
        <main className="flex-1 px-4 py-8 lg:px-12 lg:py-10">
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </main>
      </div>

      <StudyTimer />
      
      {/* Mobile view padding */}
      <div className="lg:hidden h-20" />
      
      <PushNotificationRegistrar />
    </div>
  );
}
