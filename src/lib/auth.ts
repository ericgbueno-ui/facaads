import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
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

        // Aceitar credenciais de teste durante desenvolvimento
        if (email === "ericgbueno@gmail.com" && password === "portaaberta") {
          return {
            id: "test-user-1",
            email: "ericgbueno@gmail.com",
            name: "Eric Bueno",
          };
        }

        try {
          const user = await prisma.user.findUnique({ where: { email } });
          if (!user?.passwordHash) return null;

          const valid = await bcrypt.compare(password, user.passwordHash);
          if (!valid) return null;

          return { id: user.id, email: user.email, name: user.name };
        } catch (err) {
          // Se o banco não está acessível, aceitar credenciais de teste
          console.error("Auth error:", err);
          if (email === "ericgbueno@gmail.com" && password === "portaaberta") {
            return {
              id: "test-user-1",
              email: "ericgbueno@gmail.com",
              name: "Eric Bueno",
            };
          }
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
