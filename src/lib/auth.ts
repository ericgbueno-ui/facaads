import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

let authConfig: any = null;

function initAuth() {
  if (authConfig) return authConfig;

  authConfig = NextAuth({
    adapter: process.env.DATABASE_URL ? PrismaAdapter(prisma) : undefined,
    session: { strategy: "jwt" },
    pages: { signIn: "/login" },
    providers: [
      Credentials({
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Senha", type: "password" },
        },
        authorize: async (credentials) => {
          const email = credentials?.email as string | undefined;
          const password = credentials?.password as string | undefined;
          if (!email || !password) return null;

          if (!process.env.DATABASE_URL) {
            return null;
          }

          try {
            const user = await prisma.user.findUnique({ where: { email } });
            if (!user?.passwordHash) return null;

            const valid = await bcrypt.compare(password, user.passwordHash);
            if (!valid) return null;

            return { id: user.id, email: user.email, name: user.name };
          } catch (err) {
            console.error("Auth error:", err);
            return null;
          }
        },
      }),
    ],
    callbacks: {
      session: async ({ session, token }) => {
        if (session.user && token.sub) {
          session.user.id = token.sub;
        }
        return session;
      },
    },
  });

  return authConfig;
}

export const { handlers, auth, signIn, signOut } = initAuth();
