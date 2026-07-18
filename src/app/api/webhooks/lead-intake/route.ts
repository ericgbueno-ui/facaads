import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateLeadResponse } from "@/lib/ai-leads/response-generator";
import { z } from "zod";

const leadSchema = z.object({
  companyId: z.string(),
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  message: z.string(),
  source: z.enum(["google", "instagram", "website", "email", "whatsapp"]),
  metadata: z.record(z.any()).optional(),
});

/**
 * Webhook para receber leads de múltiplas fontes
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const lead = leadSchema.parse(body);

    // Validar que a company existe
    const company = await prisma.company.findUnique({
      where: { id: lead.companyId },
    });

    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    // Gerar resposta automática
    const aiResponse = await generateLeadResponse(lead.companyId, {
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      message: lead.message,
      source: lead.source,
    });

    if (!aiResponse) {
      return NextResponse.json(
        { error: "Failed to generate AI response" },
        { status: 500 }
      );
    }

    // Salvar lead no CRM se não existir
    let leadRecord = null;
    if (lead.email || lead.phone) {
      const lookupField = lead.email ? { email: lead.email } : { phone: lead.phone };

      leadRecord = await prisma.lead.upsert({
        where: {
          companyId_email_phone: {
            companyId: lead.companyId,
            email: lead.email || "",
            phone: lead.phone || "",
          },
        },
        update: {
          notes_internal: `[${lead.source}] ${lead.message}`,
        },
        create: {
          companyId: lead.companyId,
          name: lead.name || "Lead desconhecido",
          email: lead.email,
          phone: lead.phone,
          source: lead.source,
          estimatedValue: aiResponse.qualificationScore
            ? Math.max(100, aiResponse.qualificationScore * 10)
            : undefined,
          notes_internal: `[${lead.source}] ${lead.message}`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      leadId: leadRecord?.id,
      aiResponse: {
        message: aiResponse.response,
        action: aiResponse.actionType,
        qualification: aiResponse.qualificationScore,
        confidence: aiResponse.confidence,
      },
    });
  } catch (error) {
    console.error("Lead intake error:", error);

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

/**
 * GET para health check
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    endpoint: "/api/webhooks/lead-intake",
    methods: ["POST"],
  });
}
