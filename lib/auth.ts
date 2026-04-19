import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID || "github_id",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "github_secret",
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "google_id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "google_secret",
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });
        if (!user || !user.password) return null;
        const valid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );
        return valid ? user : null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role as any;
        token.username = user.username as string;
        token.universityId = user.universityId as string | null;
        token.xp = user.xp as number;
        token.rank = user.rank as any;
        token.currentStreak = (user as any).currentStreak || 0;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as any;
        session.user.username = token.username as string;
        session.user.universityId = token.universityId as string | null;
        session.user.xp = token.xp as number;
        session.user.rank = token.rank as any;
        (session.user as any).currentStreak = token.currentStreak as number;

        // Update streak and activity in background
        if (session.user.id) {
          const { updateStreak } = await import("@/lib/xp");
          await Promise.all([
            updateStreak(session.user.id),
            prisma.user.update({
              where: { id: session.user.id },
              data: { lastActiveDate: new Date() }
            }).catch(() => {})
          ]);
        }
      }
      return session;
    },
    async signIn({ user, account }) {
      if (account?.provider === "github" && account.providerAccountId) {
        await prisma.user
          .update({
            where: { id: user.id },
            data: { githubId: account.providerAccountId },
          })
          .catch(() => {});
      }
      return true;
    },
  },
});
