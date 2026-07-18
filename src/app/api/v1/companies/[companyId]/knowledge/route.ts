import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-middleware";
import { z } from "zod";

const updateKnowledgeSchema = z.object({
  websiteUrl: z.string().url().optional(),
  instagramHandle: z.string().optional(),
  mission: z.string().optional(),
  values: z.array(z.string()).optional(),
  history: z.string().optional(),
  products: z.array(z.string()).optional(),
  services: z.array(z.string()).optional(),
});

/**
 * GET /api/v1/companies/:id/knowledge
 * Obter knowledge base da empresa
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const authResult = await requireAuth(request);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: 401 });
  }

  try {
    const { companyId } = await params;
    const knowledge = await prisma.companyKnowledge.findUnique({
      where: { companyId },
    });

    if (!knowledge) {
      return NextResponse.json(
        { error: "Knowledge base not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: knowledge.id,
        websiteUrl: knowledge.websiteUrl,
        websiteContent: knowledge.websiteContent,
        instagramHandle: knowledge.instagramHandle,
        instagramBio: knowledge.instagramBio,
        products: knowledge.products,
        services: knowledge.services,
        mission: knowledge.mission,
        values: knowledge.values,
        history: knowledge.history,
        businessHours: knowledge.businessHours,
        phone: knowledge.phone,
        email: knowledge.email,
        lastScrapedAt: knowledge.lastScrapedAt,
        createdAt: knowledge.createdAt,
        updatedAt: knowledge.updatedAt,
      },
    });
  } catch (error) {
    console.error("Get knowledge error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/v1/companies/:id/knowledge
 * Atualizar knowledge base manualmente
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const authResult = await requireAuth(request);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: 401 });
  }

  try {
    const { companyId } = await params;
    const body = await request.json();
    const data = updateKnowledgeSchema.parse(body);

    const knowledge = await prisma.companyKnowledge.upsert({
      where: { companyId },
      update: {
        websiteUrl: data.websiteUrl,
        instagramHandle: data.instagramHandle,
        mission: data.mission,
        values: data.values,
        history: data.history,
        products: data.products,
        services: data.services,
      },
      create: {
        companyId,
        websiteUrl: data.websiteUrl,
        instagramHandle: data.instagramHandle,
        mission: data.mission,
        values: data.values,
        history: data.history,
        products: data.products,
        services: data.services,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: knowledge.id,
        websiteUrl: knowledge.websiteUrl,
        instagramHandle: knowledge.instagramHandle,
        products: knowledge.products,
        services: knowledge.services,
        mission: knowledge.mission,
        values: knowledge.values,
        history: knowledge.history,
        updatedAt: knowledge.updatedAt,
      },
    });
  } catch (error) {
    console.error("Update knowledge error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request body", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
