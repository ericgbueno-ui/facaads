import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { scrapeWebsite, formatKnowledgeBase } from "@/lib/ai-leads/scraper";
import { requireAuth } from "@/lib/auth-middleware";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAuth(request);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { websiteUrl } = body;

    if (!websiteUrl) {
      return NextResponse.json(
        { error: "Website URL is required" },
        { status: 400 }
      );
    }

    // Verificar que company existe
    const company = await prisma.company.findUnique({
      where: { id: params.id },
      include: { knowledge: true },
    });

    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    // Fazer scrape
    const scrapedData = await scrapeWebsite(websiteUrl);

    if (!scrapedData) {
      return NextResponse.json(
        { error: "Failed to scrape website" },
        { status: 400 }
      );
    }

    // Salvar no knowledge base
    const knowledge = await prisma.companyKnowledge.upsert({
      where: { companyId: params.id },
      update: {
        websiteUrl,
        websiteContent: scrapedData.content,
        products: scrapedData.products,
        services: scrapedData.services,
        businessHours: scrapedData.businessHours,
        phone: scrapedData.contactInfo.phone,
        email: scrapedData.contactInfo.email,
        lastScrapedAt: new Date(),
        scrapedFrom: "website",
      },
      create: {
        companyId: params.id,
        websiteUrl,
        websiteContent: scrapedData.content,
        products: scrapedData.products,
        services: scrapedData.services,
        businessHours: scrapedData.businessHours,
        phone: scrapedData.contactInfo.phone,
        email: scrapedData.contactInfo.email,
        lastScrapedAt: new Date(),
        scrapedFrom: "website",
      },
    });

    // Formatar para apresentação
    const formatted = formatKnowledgeBase({ website: scrapedData });

    return NextResponse.json({
      success: true,
      knowledge: {
        id: knowledge.id,
        websiteUrl: knowledge.websiteUrl,
        products: knowledge.products,
        services: knowledge.services,
        businessHours: knowledge.businessHours,
        contactInfo: {
          phone: knowledge.phone,
          email: knowledge.email,
        },
        lastScrapedAt: knowledge.lastScrapedAt,
      },
      preview: formatted,
    });
  } catch (error) {
    console.error("Website scraping error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
