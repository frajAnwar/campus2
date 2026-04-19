import { Role, Rank } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: Role;
      username: string;
      universityId: string | null;
      xp: number;
      rank: Rank;
    };
  }

  interface User {
    role?: Role;
    username?: string;
    universityId?: string | null;
    xp?: number;
    rank?: Rank;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    username: string;
    universityId: string | null;
    xp: number;
    rank: Rank;
  }
}
