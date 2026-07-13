import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

/**
 * GET /api/seed
 * Cria usuário de teste para desenvolvimento
 *
 * Email: ericgbueno@gmail.com
 * Senha: portaaberta
 */
export async function GET(req: NextRequest) {
  try {
    // Hash simples da senha
    const password = "portaaberta";
    const hash = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    const user = await prisma.user.upsert({
      where: { email: "ericgbueno@gmail.com" },
      update: {},
      create: {
        email: "ericgbueno@gmail.com",
        name: "Eric Bueno",
        passwordHash: hash,
      },
    });

    return NextResponse.json(
      {
        ok: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        credentials: {
          email: "ericgbueno@gmail.com",
          password: "portaaberta",
        },
        message: "✅ Usuário criado com sucesso!",
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Seed error:", err);
    return NextResponse.json(
      {
        error: (err as Error).message,
        ok: false
      },
      { status: 500 }
    );
  }
}
