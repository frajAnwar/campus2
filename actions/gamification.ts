"use server";

import { auth } from "@/lib/auth";
import { awardXP } from "@/lib/xp";
import { revalidatePath } from "next/cache";

export async function completeStudySession() {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  // Award XP for completing a study session
  const result = await awardXP(session.user.id, "STUDY_SESSION_COMPLETED");
  
  revalidatePath("/");
  return { success: true, data: result };
}
