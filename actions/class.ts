"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { awardXP } from "@/lib/xp";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export async function joinClass(enrollmentCode: string) {
  const session = await auth();
  if (!session?.user?.id)
    return { success: false, error: "Unauthorized" };

  const classData = await prisma.class.findUnique({
    where: { enrollmentCode },
    include: { conversation: true },
  });

  if (!classData) return { success: false, error: "Invalid code" };
  if (!classData.isOpen) return { success: false, error: "Class is closed" };

  await prisma.classMember.upsert({
    where: {
      classId_userId: {
        classId: classData.id,
        userId: session.user.id,
      },
    },
    create: {
      classId: classData.id,
      userId: session.user.id,
      role: "STUDENT",
    },
    update: {},
  });

  if (classData.conversation) {
    await prisma.conversationMember.upsert({
      where: {
        conversationId_userId: {
          conversationId: classData.conversation.id,
          userId: session.user.id,
        },
      },
      create: {
        conversationId: classData.conversation.id,
        userId: session.user.id,
      },
      update: {},
    });
  }

  await awardXP(session.user.id, "CLUB_JOINED");
  revalidatePath("/classes");
  return { success: true, data: { classId: classData.id } };
}

const createClassSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  universityId: z.string().optional(),
  term: z.string().optional(),
  subjectTag: z.string().optional(),
});

export async function createClass(input: z.infer<typeof createClassSchema>) {
  const session = await auth();
  if (!session?.user?.id)
    return { success: false, error: "Unauthorized" };

  if (!["EDUCATOR", "TEACHING_ASSISTANT", "PLATFORM_ADMIN"].includes(session.user.role ?? ""))
    return { success: false, error: "Only educators can create classes" };

  const parsed = createClassSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.message };

  const newClass = await prisma.class.create({
    data: {
      ...parsed.data,
      educatorId: session.user.id,
      universityId: parsed.data.universityId ?? session.user.universityId!,
    },
  });

  await prisma.conversation.create({
    data: {
      isGroup: true,
      name: `${newClass.name} Discussion`,
      classId: newClass.id,
      members: {
        create: { userId: session.user.id },
      },
    },
  });

  revalidatePath("/classes");
  revalidatePath("/educator/classes");
  return { success: true, data: newClass };
}

const updateClassSchema = z.object({
  classId: z.string(),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  term: z.string().optional(),
  subjectTag: z.string().optional(),
  accentColor: z.string().optional(),
  coverImage: z.string().optional(),
  isOpen: z.boolean().optional(),
  isLocked: z.boolean().optional(),
});

export async function updateClass(input: z.infer<typeof updateClassSchema>) {
  const session = await auth();
  if (!session?.user?.id)
    return { success: false, error: "Unauthorized" };

  const { classId, ...data } = input;

  const existing = await prisma.class.findUnique({ where: { id: classId } });
  if (!existing) return { success: false, error: "Class not found" };
  if (existing.educatorId !== session.user.id)
    return { success: false, error: "Only the class educator can update" };

  const updated = await prisma.class.update({
    where: { id: classId },
    data,
  });

  revalidatePath(`/classes/${classId}`);
  revalidatePath(`/educator/classes/${classId}`);
  revalidatePath("/classes");
  revalidatePath("/educator/classes");
  return { success: true, data: updated };
}

export async function removeClassMember(classId: string, userId: string) {
  const session = await auth();
  if (!session?.user?.id)
    return { success: false, error: "Unauthorized" };

  const classData = await prisma.class.findUnique({ where: { id: classId } });
  if (!classData) return { success: false, error: "Class not found" };
  if (classData.educatorId !== session.user.id)
    return { success: false, error: "Only the educator can remove members" };
  if (userId === session.user.id)
    return { success: false, error: "Cannot remove yourself" };

  await prisma.classMember.delete({
    where: { classId_userId: { classId, userId } },
  });

  revalidatePath(`/educator/classes/${classId}`);
  return { success: true };
}

export async function leaveClass(classId: string) {
  const session = await auth();
  if (!session?.user?.id)
    return { success: false, error: "Unauthorized" };

  const classData = await prisma.class.findUnique({ where: { id: classId } });
  if (!classData) return { success: false, error: "Class not found" };
  if (classData.educatorId === session.user.id)
    return { success: false, error: "Educators cannot leave their own class" };

  await prisma.classMember.delete({
    where: { classId_userId: { classId, userId: session.user.id } },
  });

  revalidatePath("/classes");
  return { success: true };
}

export async function getClassEnrollmentCode(classId: string) {
  const session = await auth();
  if (!session?.user?.id)
    return { success: false, error: "Unauthorized" };

  const classData = await prisma.class.findUnique({
    where: { id: classId },
    select: { enrollmentCode: true, educatorId: true },
  });
  if (!classData) return { success: false, error: "Class not found" };
  if (classData.educatorId !== session.user.id)
    return { success: false, error: "Only the educator can view the code" };

  return { success: true, data: { enrollmentCode: classData.enrollmentCode } };
}

export async function getUserClasses() {
  const session = await auth();
  if (!session?.user?.id) return [];

  if (["EDUCATOR", "TEACHING_ASSISTANT"].includes(session.user.role ?? "")) {
    const educator = await prisma.class.findMany({
      where: { educatorId: session.user.id },
      include: {
        university: { select: { name: true } },
        _count: { select: { members: true, assignments: true } },
      },
    });
    const member = await prisma.class.findMany({
      where: { members: { some: { userId: session.user.id } } },
      include: {
        university: { select: { name: true } },
        educator: { select: { name: true } },
        _count: { select: { members: true, assignments: true } },
      },
    });
    return [...educator, ...member];
  }

  return prisma.class.findMany({
    where: { members: { some: { userId: session.user.id } } },
    include: {
      university: { select: { name: true } },
      educator: { select: { name: true } },
      _count: { select: { members: true, assignments: true } },
    },
  });
}
