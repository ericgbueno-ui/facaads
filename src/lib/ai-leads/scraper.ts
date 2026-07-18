import * as cheerio from "cheerio";

/**
 * Scraper para extrair informações do website da empresa
 */
export async function scrapeWebsite(url: string): Promise<{
  content: string;
  products: string[];
  services: string[];
  contactInfo: Record<string, string>;
  businessHours: Record<string, string>;
} | null> {
  try {
    // Fetch página
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) return null;

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extrair texto principal
    $("script, style, noscript").remove();
    const content = $.text()
      .replace(/\s+/g, " ")
      .substring(0, 5000);

    // Extrair contato
    const contactInfo: Record<string, string> = {};
    const phone = $("a[href^='tel:']").first().text();
    const email = $("a[href^='mailto:']").first().text();
    const whatsapp = $("a[href*='wa.me']").first().text();

    if (phone) contactInfo.phone = phone;
    if (email) contactInfo.email = email;
    if (whatsapp) contactInfo.whatsapp = whatsapp;

    // Extrair produtos/serviços (heurística)
    const products: string[] = [];
    const services: string[] = [];

    // Procurar por seções comuns
    $("h2, h3").each((_, el) => {
      const text = $(el).text().toLowerCase();
      if (text.includes("produto")) {
        const next = $(el).nextUntil("h2, h3");
        next.find("li, span, p").each((_, item) => {
          const itemText = $(item).text().trim();
          if (itemText.length > 3 && itemText.length < 100) {
            products.push(itemText);
          }
        });
      } else if (text.includes("serviço")) {
        const next = $(el).nextUntil("h2, h3");
        next.find("li, span, p").each((_, item) => {
          const itemText = $(item).text().trim();
          if (itemText.length > 3 && itemText.length < 100) {
            services.push(itemText);
          }
        });
      }
    });

    // Extrair horários (heurística)
    const businessHours: Record<string, string> = {};
    const hoursPattern =
      /(\s|^)(seg|segunda|mon|segunda|terça|ter|tuesday|quarta|qua|wednesday|quinta|qui|thursday|sexta|sex|friday|sábado|sab|saturday|domingo|dom|sunday)\s*[:-]?\s*([\d:apm\s\-]+)/gi;
    const matches = content.matchAll(hoursPattern);

    for (const match of matches) {
      const day = match[2].toLowerCase();
      const hours = match[3].trim();
      if (day.includes("seg") || day.includes("mon")) businessHours.seg = hours;
      if (day.includes("ter")) businessHours.ter = hours;
      if (day.includes("qua") || day.includes("wed")) businessHours.qua = hours;
      if (day.includes("qui") || day.includes("thu")) businessHours.qui = hours;
      if (day.includes("sex") || day.includes("fri")) businessHours.sex = hours;
      if (day.includes("sab") || day.includes("sat")) businessHours.sab = hours;
      if (day.includes("dom") || day.includes("sun")) businessHours.dom = hours;
    }

    return {
      content: content.substring(0, 3000),
      products: [...new Set(products)].slice(0, 10),
      services: [...new Set(services)].slice(0, 10),
      contactInfo,
      businessHours,
    };
  } catch (error) {
    console.error("Erro ao fazer scrape:", error);
    return null;
  }
}

/**
 * Scraper para Instagram (simulado - em prod usaria Graph API)
 */
export async function scrapeInstagram(handle: string): Promise<{
  bio: string;
  posts: Array<{ caption: string; likes: number }>;
  followers: number;
} | null> {
  try {
    // TODO: Implementar com Instagram Graph API
    // Por enquanto, apenas estrutura
    return {
      bio: "",
      posts: [],
      followers: 0,
    };
  } catch (error) {
    console.error("Erro ao scrape Instagram:", error);
    return null;
  }
}

/**
 * Processar dados coletados em formato legível
 */
export function formatKnowledgeBase(data: {
  website?: Awaited<ReturnType<typeof scrapeWebsite>>;
  instagram?: Awaited<ReturnType<typeof scrapeInstagram>>;
  contact?: Record<string, string>;
}): string {
  let formatted = "=== CONHECIMENTO DA EMPRESA ===\n\n";

  if (data.website) {
    formatted += "📱 WEBSITE:\n";
    if (data.website.contactInfo.phone)
      formatted += `📞 Telefone: ${data.website.contactInfo.phone}\n`;
    if (data.website.contactInfo.email)
      formatted += `📧 Email: ${data.website.contactInfo.email}\n`;
    if (data.website.contactInfo.whatsapp)
      formatted += `💬 WhatsApp: ${data.website.contactInfo.whatsapp}\n`;

    if (Object.keys(data.website.businessHours).length > 0) {
      formatted += "\n⏰ HORÁRIOS:\n";
      Object.entries(data.website.businessHours).forEach(([day, hours]) => {
        formatted += `${day}: ${hours}\n`;
      });
    }

    if (data.website.products.length > 0) {
      formatted += "\n🛍️ PRODUTOS:\n";
      data.website.products.forEach((p) => {
        formatted += `• ${p}\n`;
      });
    }

    if (data.website.services.length > 0) {
      formatted += "\n🎯 SERVIÇOS:\n";
      data.website.services.forEach((s) => {
        formatted += `• ${s}\n`;
      });
    }
  }

  if (data.instagram) {
    formatted += "\n📸 INSTAGRAM:\n";
    formatted += `Bio: ${data.instagram.bio}\n`;
    formatted += `Followers: ${data.instagram.followers}\n`;
  }

  return formatted;
}
