import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ClassSettingsForm } from "./ClassSettingsForm";

type Params = Promise<{ classId: string }>;

export default async function ClassSettingsPage({
  params,
}: {
  params: Params;
}) {
  const { classId } = await params;
  const session = await auth();
  if (!session?.user) return null;

  const classData = await prisma.class.findUnique({
    where: { id: classId },
    select: {
      id: true,
      name: true,
      description: true,
      term: true,
      subjectTag: true,
      isOpen: true,
      isLocked: true,
      educatorId: true,
    },
  });

  if (!classData || classData.educatorId !== session.user.id) {
    notFound();
  }

  return <ClassSettingsForm classData={classData} />;
}
