"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const signupSchema = z.object({
  name: z.string().min(2),
  username: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[a-zA-Z0-9_.]+$/, {
      message: "Username can only contain letters, numbers, underscores, and dots",
    }),
  email: z.string().email(),
  password: z.string().min(8),
  universityId: z.string().optional(),
});

export async function registerUser(input: z.infer<typeof signupSchema>) {
  const parsed = signupSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.message };

  const { name, username, email, password, universityId } = parsed.data;

  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) return { success: false, error: "Email already in use" };

  const existingUsername = await prisma.user.findUnique({
    where: { username },
  });
  if (existingUsername)
    return { success: false, error: "Username taken" };

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      username,
      email,
      password: hashedPassword,
      universityId,
    },
  });

  return { success: true, data: { id: user.id } };
}

export async function checkUsernameAvailability(username: string) {
  const existing = await prisma.user.findUnique({ where: { username } });
  return { available: !existing };
}

export async function checkEmailAvailability(email: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  return { available: !existing };
}
