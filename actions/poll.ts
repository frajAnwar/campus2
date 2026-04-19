"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const pollVoteSchema = z.object({
  pollId: z.string(),
  optionIds: z.array(z.string()).min(1),
});

export async function voteOnPoll(input: z.infer<typeof pollVoteSchema>) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const parsed = pollVoteSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.message };

  const { pollId, optionIds } = parsed.data;

  const poll = await prisma.poll.findUnique({
    where: { id: pollId },
    include: { options: true },
  });
  if (!poll) return { success: false, error: "Poll not found" };

  if (poll.endsAt && new Date() > poll.endsAt) {
    return { success: false, error: "Poll has ended" };
  }

  if (!poll.isMultipleChoice && optionIds.length > 1) {
    return { success: false, error: "This poll only allows a single choice" };
  }

  const alreadyVoted = await prisma.pollVote.findFirst({
    where: { pollId, userId: session.user.id },
  });
  if (alreadyVoted) return { success: false, error: "You have already voted" };

  const validOptionIds = poll.options.map((o) => o.id);
  const invalidOptions = optionIds.filter((id) => !validOptionIds.includes(id));
  if (invalidOptions.length > 0) return { success: false, error: "Invalid poll options" };

  await prisma.pollVote.createMany({
    data: optionIds.map((optionId) => ({
      pollId,
      optionId,
      userId: session.user.id,
    })),
  });

  if (poll.postId) revalidatePath(`/forum/${poll.postId}`);
  return { success: true };
}
