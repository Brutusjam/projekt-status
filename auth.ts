import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { Rolle } from "@/app/generated/prisma/client";
import { authConfig } from "@/auth.config";
import { verifyCredentials } from "@/lib/domain/auth/login";
import { prisma } from "@/lib/prisma";

declare module "next-auth" {
  interface User {
    id: string;
    rolle: Rolle;
    mustChangePassword: boolean;
  }

  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      rolle: Rolle;
      mustChangePassword: boolean;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    rolle: Rolle;
    mustChangePassword: boolean;
  }
}

export const { handlers, auth, signIn, signOut, unstable_update } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "E-Mail", type: "email" },
        password: { label: "Passwort", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!email || !password) {
          return null;
        }

        const result = await verifyCredentials(prisma, email, password);
        if (!result.user) {
          return null;
        }

        return {
          id: String(result.user.id),
          name: result.user.name,
          email: result.user.email,
          rolle: result.user.rolle,
          mustChangePassword: result.user.mustChangePassword,
        };
      },
    }),
  ],
});
