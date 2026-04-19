import { auth } from "@/lib/auth";
import { getDashboardData } from "@/lib/services/dashboard";
import { StudentDashboard } from "@/features/dashboard/components/StudentDashboard";
import { EducatorDashboard } from "@/features/dashboard/components/EducatorDashboard";
import { AdminDashboard } from "@/features/dashboard/components/AdminDashboard";
import { prisma } from "@/lib/prisma";


export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) return null;

  const user = session.user;
  
  // Base dashboard data
  const baseData = await getDashboardData(user.id, user.universityId);

  // Role-specific data
  let roleData: any = { ...baseData };

  if (user.role === "EDUCATOR") {
    const classes = await prisma.class.findMany({
      where: { educatorId: user.id },
      include: { _count: { select: { members: true, assignments: true } } }
    });
    const pendingGrades = await prisma.submission.count({
      where: { 
        assignment: { class: { educatorId: user.id } },
        status: "SUBMITTED"
      }
    });
    roleData.classes = classes;
    roleData.pendingGrades = pendingGrades;
  } else if (user.role === "PLATFORM_ADMIN" || user.role === "UNIVERSITY_ADMIN") {
    const activeReports = await prisma.report.count({
      where: { status: "PENDING" }
    });
    const totalUsers = await prisma.user.count();
    const pendingRequests = await prisma.report.findMany({
      where: { status: "PENDING" },
      include: { reporter: { select: { name: true, image: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 5
    });
    roleData.activeReports = activeReports;
    roleData.totalUsers = totalUsers;
    roleData.pendingRequests = pendingRequests.map(r => ({ ...r, user: r.reporter, type: r.category }));
  }

  return (
    <div className="max-w-6xl mx-auto pb-12">
      {user.role === "EDUCATOR" ? (
        <EducatorDashboard user={user} data={roleData} />
      ) : (user.role === "PLATFORM_ADMIN" || user.role === "UNIVERSITY_ADMIN") ? (
        <AdminDashboard user={user} data={roleData} />
      ) : (
        <StudentDashboard user={user} data={roleData} />
      )}
    </div>
  );
}

