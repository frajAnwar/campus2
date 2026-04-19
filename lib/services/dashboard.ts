import { prisma } from "@/lib/prisma";

export async function getDashboardData(userId: string, universityId?: string | null) {
  const userProfile = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true }
  });

  const [
    upcomingAssignments,
    recentPosts,
    recommendations,
    upcomingEvents,
    unansweredQuestions,
    recommendedClubs,
    stats,
  ] = await Promise.all([
// ... (assignments)
    prisma.assignment.findMany({
      where: {
        status: "PUBLISHED",
        class: {
          members: { some: { userId } },
        },
        dueDate: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 86400000),
        },
        submissions: { none: { studentId: userId } },
      },
      include: { class: { select: { name: true, id: true } } },
      orderBy: { dueDate: "asc" },
      take: 5,
    }),
// ... (recent posts)
    prisma.post.findMany({
      where: {
        visibility: "PUBLIC",
        ...(universityId ? { universityId } : {}),
      },
      include: {
        author: {
          select: { id: true, name: true, username: true, image: true, rank: true, role: true },
        },
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
// ... (recommendations)
    prisma.post.findMany({
      where: {
        visibility: "PUBLIC",
        authorId: { not: userId },
        ...(universityId ? { universityId } : {}),
      },
      include: {
        author: {
          select: { id: true, name: true, username: true, image: true, rank: true, role: true },
        },
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
// ... (the rest)
    prisma.event.findMany({
      where: {
        date: { gte: new Date() },
        club: {
          members: { some: { userId } },
        },
      },
      include: { club: { select: { name: true } } },
      orderBy: { date: "asc" },
      take: 3,
    }),
    prisma.post.findMany({
      where: {
        type: "QUESTION",
        comments: { none: { isAccepted: true } },
        ...(universityId ? { universityId } : {}),
      },
      include: {
        author: {
          select: {
            name: true,
            username: true,
            image: true,
            rank: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.club.findMany({
      where: {
        ...(universityId ? { universityId } : {}),
        members: { none: { userId } },
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        category: true,
        _count: { select: { members: true } },
      },
      take: 3,
    }),
    Promise.all([
      prisma.post.count({
        where: {
          authorId: userId,
          createdAt: { gte: new Date(Date.now() - 7 * 86400000) },
        },
      }),
      prisma.submission.count({ where: { studentId: userId } }),
      prisma.eventRegistration.count({ where: { userId } }),
    ]),
  ]);

  let educatorMetrics = null;
  if (userProfile) {
    // If educator, get specific metrics
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
    if (user?.role === "EDUCATOR") {
      const [totalStudents, pendingGrades] = await Promise.all([
        prisma.classMember.count({
          where: { class: { educatorId: userId } },
        }),
        prisma.submission.count({
          where: {
            assignment: { class: { educatorId: userId } },
            status: "SUBMITTED",
          },
        }),
      ]);
      educatorMetrics = { totalStudents, pendingGrades };
    }
  }

  return {
    upcomingAssignments,
    recentPosts,
    recommendations,
    upcomingEvents,
    unansweredQuestions,
    recommendedClubs,
    educatorMetrics,
    stats: {
      postsThisWeek: stats[0],
      submissionsCount: stats[1],
      eventsAttended: stats[2],
    },
  };
}
