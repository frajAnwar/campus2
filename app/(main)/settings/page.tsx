import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SettingsClient } from "./SettingsClient";
import { notFound } from "next/navigation";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) notFound();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      username: true,
      bio: true,
      tagline: true,
      accentColor: true,
      language: true,
      theme: true,
      safeMode: true,
      profileVisibility: true,
      allowDMs: true,
      showOnlineStatus: true,
      indexedBySearch: true,
      githubUsername: true,
      linkedinUrl: true,
      websiteUrl: true,
      twitterUrl: true,
      isOpenToCollab: true,
      openToCollabNote: true,
      fieldOfStudy: true,
      academicYear: true,
      graduationYear: true,
      currentRole: true,
      currentCompany: true,
    },
  });

  if (!user) notFound();

  return <SettingsClient initialUser={user} />;
}
