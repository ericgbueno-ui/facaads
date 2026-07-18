import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateCompanyAccess } from "@/lib/auth-middleware";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/companies/:companyId/whatsapp/:conversationId
 * Obter detalhes da conversa com histórico
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { companyId: string; conversationId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { companyId, conversationId } = params;

    // Validar acesso
    const validation = await validateCompanyAccess(session.user.id, companyId);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 403 });
    }

    // Buscar conversa
    const conversation = await prisma.whatsAppConversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
        lead: true,
      },
    });

    if (!conversation || conversation.companyId !== companyId) {
      return NextResponse.json(
        { error: "Conversa não encontrada" },
        { status: 404 }
      );
    }

    // Buscar análises
    const analyses = await prisma.aIAnalysis.findMany({
      where: { conversationId },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    return NextResponse.json(
      {
        ok: true,
        conversation: {
          ...conversation,
          analyses,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao obter conversa:", error);
    return NextResponse.json(
      { error: "Erro ao obter conversa" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/companies/:companyId/whatsapp/:conversationId/send
 * Enviar mensagem via WhatsApp
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { companyId: string; conversationId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { companyId, conversationId } = params;

    // Validar acesso
    const validation = await validateCompanyAccess(session.user.id, companyId);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 403 });
    }

    // Buscar conversa
    const conversation = await prisma.whatsAppConversation.findUnique({
      where: { id: conversationId },
      select: { companyId: true, phoneNumber: true },
    });

    if (!conversation || conversation.companyId !== companyId) {
      return NextResponse.json(
        { error: "Conversa não encontrada" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { message } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Mensagem inválida" },
        { status: 400 }
      );
    }

    // TODO: Integrar com WhatsApp Cloud API para enviar mensagem
    // const whatsappResponse = await sendWhatsAppMessage(
    //   phoneNumber,
    //   message,
    //   accessToken
    // );

    // Salvar mensagem como enviada (simulado)
    const savedMessage = await prisma.whatsAppMessage.create({
      data: {
        conversationId,
        role: "assistant",
        content: message,
        type: "text",
      },
    });

    // Atualizar conversa
    await prisma.whatsAppConversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        companyId,
        userId: session.user.id,
        action: "create",
        resource: "WhatsAppMessage",
        resourceId: savedMessage.id,
        description: "Mensagem enviada via WhatsApp",
      },
    });

    return NextResponse.json(
      { ok: true, message: savedMessage },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error);
    return NextResponse.json(
      { error: "Erro ao enviar mensagem" },
      { status: 500 }
    );
  }
}
