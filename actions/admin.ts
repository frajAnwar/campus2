"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { Role, ReportStatus } from "@prisma/client";

function requireAdmin(session: any): { success: false; error: string } | null {
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };
  if (!["PLATFORM_ADMIN", "UNIVERSITY_ADMIN"].includes(session.user.role ?? "")) {
    return { success: false, error: "Not authorized" };
  }
  return null;
}

export async function adminGetUsers(options?: {
  search?: string;
  role?: string;
  universityId?: string;
  cursor?: string;
  limit?: number;
}) {
  const session = await auth();
  const denied = requireAdmin(session);
  if (denied) return denied;

  const { search, role, universityId, cursor, limit = 20 } = options ?? {};

  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { username: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }
  if (role) where.role = role;
  if (universityId) where.universityId = universityId;

  const users = await prisma.user.findMany({
    where,
    take: limit + 1,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      role: true,
      rank: true,
      xp: true,
      universityId: true,
      isAlumni: true,
      createdAt: true,
      _count: {
        select: { posts: true, reportsReceived: true, strikes: true },
      },
    },
  });

  let nextCursor: string | undefined;
  if (users.length > limit) {
    const nextItem = users.pop();
    nextCursor = nextItem!.id;
  }

  return { success: true, data: { items: users, nextCursor, hasMore: !!nextCursor } };
}

const updateRoleSchema = z.object({
  userId: z.string(),
  role: z.nativeEnum(Role),
});

export async function adminUpdateUserRole(input: z.infer<typeof updateRoleSchema>) {
  const session = await auth();
  const denied = requireAdmin(session);
  if (denied) return denied;

  const parsed = updateRoleSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.message };

  if (!session || !session.user) return { success: false, error: "Unauthorized" };
  if (parsed.data.userId === session.user.id) {
    return { success: false, error: "Cannot change your own role" };
  }

  if (session.user.role !== "PLATFORM_ADMIN" && parsed.data.role === "PLATFORM_ADMIN") {
    return { success: false, error: "Only platform admins can assign PLATFORM_ADMIN role" };
  }

  const user = await prisma.user.update({
    where: { id: parsed.data.userId },
    data: { role: parsed.data.role },
    select: { id: true, name: true, role: true },
  });

  revalidatePath("/admin/users");
  return { success: true, data: user };
}

export async function adminBanUser(userId: string, reason: string) {
  const session = await auth();
  const denied = requireAdmin(session);
  if (denied) return denied;

  if (!session || !session.user) return { success: false, error: "Unauthorized" };
  if (userId === session.user.id) return { success: false, error: "Cannot ban yourself" };

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) return { success: false, error: "User not found" };

  if (
    ["PLATFORM_ADMIN"].includes(target.role) &&
    session.user.role !== "PLATFORM_ADMIN"
  ) {
    return { success: false, error: "Cannot ban a platform admin" };
  }

  await prisma.strike.create({
    data: {
      userId,
      issuedById: session.user.id,
      reason,
      expiresAt: null,
    },
  });

  await prisma.notification.create({
    data: {
      userId,
      type: "SYSTEM",
      title: "Account Action",
      body: `Your account has received a strike: ${reason}`,
    },
  });

  revalidatePath("/admin/users");
  return { success: true };
}

export async function adminGetReports(options?: {
  status?: string;
  cursor?: string;
  limit?: number;
}) {
  const session = await auth();
  const denied = requireAdmin(session);
  if (denied) return denied;

  const { status, cursor, limit = 20 } = options ?? {};

  const where: any = {};
  if (status) where.status = status;
  else where.status = "PENDING";

  const reports = await prisma.report.findMany({
    where,
    take: limit + 1,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      reporter: { select: { id: true, name: true, username: true } },
      reported: { select: { id: true, name: true, username: true } },
      post: { select: { id: true, title: true } },
      comment: { select: { id: true, body: true } },
    },
  });

  let nextCursor: string | undefined;
  if (reports.length > limit) {
    const nextItem = reports.pop();
    nextCursor = nextItem!.id;
  }

  return { success: true, data: { items: reports, nextCursor, hasMore: !!nextCursor } };
}

const resolveReportSchema = z.object({
  reportId: z.string(),
  action: z.nativeEnum(ReportStatus),
});

export async function adminResolveReport(input: z.infer<typeof resolveReportSchema>) {
  const session = await auth();
  const denied = requireAdmin(session);
  if (denied) return denied;

  const parsed = resolveReportSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.message };
  if (!session || !session.user) return { success: false, error: "Unauthorized" };

  const report = await prisma.report.update({
    where: { id: parsed.data.reportId },
    data: {
      status: parsed.data.action,
      resolvedById: session.user.id,
      resolvedAt: new Date(),
    },
    include: { post: true, comment: true, reported: true },
  });

  if (parsed.data.action === "RESOLVED_REMOVED") {
    if (report.postId) await prisma.post.delete({ where: { id: report.postId } });
    if (report.commentId) await prisma.comment.delete({ where: { id: report.commentId } });
    if (report.reportedId) {
      await prisma.strike.create({
        data: {
          userId: report.reportedId,
          issuedById: session.user.id,
          reason: report.category,
        },
      });
    }
  }

  revalidatePath("/admin/reports");
  return { success: true };
}

export async function adminGetAnalytics() {
  const session = await auth();
  const denied = requireAdmin(session);
  if (denied) return denied;

  const [
    totalUsers,
    totalPosts,
    totalComments,
    totalProjects,
    totalClubs,
    totalEvents,
    totalCompetitions,
    pendingReports,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.post.count(),
    prisma.comment.count(),
    prisma.project.count(),
    prisma.club.count(),
    prisma.event.count(),
    prisma.competition.count(),
    prisma.report.count({ where: { status: "PENDING" } }),
  ]);

  const usersByRole = await prisma.user.groupBy({
    by: ["role"],
    _count: { role: true },
  });

  const postsByType = await prisma.post.groupBy({
    by: ["type"],
    _count: { type: true },
  });

  const recentSignups = await prisma.user.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      username: true,
      role: true,
      universityId: true,
      createdAt: true,
    },
  });

  return {
    success: true,
    data: {
      totals: {
        users: totalUsers,
        posts: totalPosts,
        comments: totalComments,
        projects: totalProjects,
        clubs: totalClubs,
        events: totalEvents,
        competitions: totalCompetitions,
        pendingReports,
      },
      usersByRole: usersByRole.map((r) => ({ role: r.role, count: r._count.role })),
      postsByType: postsByType.map((p) => ({ type: p.type, count: p._count.type })),
      recentSignups,
    },
  };
}

export async function adminResolveRequest(requestId: string, status: "APPROVED" | "REJECTED", adminNote?: string) {
  const session = await auth();
  const denied = requireAdmin(session);
  if (denied) return denied;

  const request = await prisma.request.findUnique({
    where: { id: requestId },
    include: { user: true },
  });

  if (!request) return { success: false, error: "Request not found" };

  await prisma.request.update({
    where: { id: requestId },
    data: { status, adminNote, updatedAt: new Date() },
  });

  if (status === "APPROVED") {
    if (request.type === "ROLE_CHANGE" && request.data) {
      const { role } = request.data as any;
      await prisma.user.update({
        where: { id: request.userId },
        data: { role },
      });
    } else if (request.type === "CLUB_CREATION" && request.data) {
      const clubData = request.data as any;
      const slug = clubData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") +
        "-" + Math.random().toString(36).substring(2, 6);

      const club = await prisma.club.create({
        data: {
          name: clubData.name,
          slug,
          description: clubData.description,
          category: clubData.category,
          universityId: clubData.universityId || request.user.universityId,
          managerId: request.userId,
          members: {
            create: { userId: request.userId, role: "MANAGER" },
          },
        },
      });

      // Initialize Club Group Chat
      await prisma.conversation.create({
        data: {
          isGroup: true,
          name: `${club.name} Main Chat`,
          clubId: club.id,
          members: {
            create: { userId: request.userId },
          },
        },
      });
    }
  }

  await prisma.notification.create({
    data: {
      userId: request.userId,
      type: "SYSTEM",
      title: `Request ${status === "APPROVED" ? "Approved" : "Rejected"}`,
      body: `Your request for ${request.type.toLowerCase().replace("_", " ")} has been ${status.toLowerCase()}.${adminNote ? ` Note: ${adminNote}` : ""}`,
      url: request.type === "CLUB_CREATION" && status === "APPROVED" ? "/clubs" : undefined,
    },
  });

  revalidatePath("/admin/dashboard");
  return { success: true };
}
