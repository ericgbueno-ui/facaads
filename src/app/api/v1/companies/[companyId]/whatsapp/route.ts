import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateCompanyAccess } from "@/lib/auth-middleware";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/companies/:companyId/whatsapp
 * Listar conversas de WhatsApp
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { companyId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const companyId = params.companyId;

    // Validar acesso
    const validation = await validateCompanyAccess(session.user.id, companyId);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 403 });
    }

    // Parâmetros
    const searchParams = new URL(req.url).searchParams;
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Construir filtro
    const where: any = { companyId };
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { phoneNumber: { contains: search } },
        { lead: { name: { contains: search } } },
      ];
    }

    // Buscar conversas
    const [conversations, total] = await Promise.all([
      prisma.whatsAppConversation.findMany({
        where,
        include: {
          lead: {
            select: {
              id: true,
              name: true,
              email: true,
              customFields: true,
            },
          },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: {
              content: true,
              createdAt: true,
            },
          },
        },
        orderBy: { lastMessageAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.whatsAppConversation.count({ where }),
    ]);

    // Formatar resposta
    const formatted = conversations.map((conv) => ({
      id: conv.id,
      phoneNumber: conv.phoneNumber,
      status: conv.status,
      lastMessageAt: conv.lastMessageAt,
      lastMessage: conv.messages[0]?.content || null,
      lead: conv.lead,
      sentiment:
        (conv.lead?.customFields as any)?.sentiment || "unknown",
      purchaseLikelihood:
        (conv.lead?.customFields as any)?.purchaseLikelihood || 0,
    }));

    return NextResponse.json(
      {
        ok: true,
        conversations: formatted,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao listar conversas WhatsApp:", error);
    return NextResponse.json(
      { error: "Erro ao listar conversas" },
      { status: 500 }
    );
  }
}
