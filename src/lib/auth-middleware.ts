import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export interface AuthContext {
  userId: string;
  email: string;
  companyId?: string;
  role?: string;
  isOwner?: boolean;
}

/**
 * Valida que o usuário tem acesso à empresa especificada
 */
export async function validateCompanyAccess(
  userId: string,
  companyId: string
): Promise<{ valid: boolean; role?: string; isOwner?: boolean; error?: string }> {
  try {
    const companyUser = await prisma.companyUser.findUnique({
      where: {
        userId_companyId: {
          userId,
          companyId,
        },
      },
      select: {
        role: true,
        isOwner: true,
      },
    });

    if (!companyUser) {
      return { valid: false, error: "Acesso negado à empresa" };
    }

    return {
      valid: true,
      role: companyUser.role,
      isOwner: companyUser.isOwner,
    };
  } catch (error) {
    console.error("Erro ao validar acesso:", error);
    return { valid: false, error: "Erro ao validar acesso" };
  }
}

/**
 * Middleware para validar autenticação e company_id
 * Uso: Chamar no início de cada endpoint protegido
 */
export async function requireAuth(
  req: NextRequest
): Promise<{ context: AuthContext | null; response: NextResponse | null }> {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return {
        context: null,
        response: NextResponse.json(
          { error: "Não autenticado" },
          { status: 401 }
        ),
      };
    }

    const userId = session.user.id || "";
    const email = session.user.email;

    // Se a rota contém /companies/:id, validar acesso
    const companyIdMatch = req.nextUrl.pathname.match(/\/companies\/([^/]+)/i);
    if (companyIdMatch) {
      const companyId = companyIdMatch[1];
      const validation = await validateCompanyAccess(userId, companyId);

      if (!validation.valid) {
        return {
          context: null,
          response: NextResponse.json(
            { error: validation.error },
            { status: 403 }
          ),
        };
      }

      return {
        context: {
          userId,
          email,
          companyId,
          role: validation.role,
          isOwner: validation.isOwner,
        },
        response: null,
      };
    }

    return {
      context: {
        userId,
        email,
      },
      response: null,
    };
  } catch (error) {
    console.error("Erro no middleware de auth:", error);
    return {
      context: null,
      response: NextResponse.json(
        { error: "Erro ao autenticar" },
        { status: 500 }
      ),
    };
  }
}

/**
 * Extrai companyId da URL ou query params
 */
export function getCompanyIdFromRequest(req: NextRequest): string | null {
  // Tenta extrair de /companies/:id
  const pathMatch = req.nextUrl.pathname.match(/\/companies\/([^/]+)/i);
  if (pathMatch) return pathMatch[1];

  // Tenta extrair de ?companyId=...
  const searchParams = new URL(req.url).searchParams;
  const companyId = searchParams.get("companyId");
  if (companyId) return companyId;

  return null;
}

/**
 * Wrapper para endpoints que requerem autenticação e acesso a empresa
 */
export async function withCompanyAuth<T>(
  req: NextRequest,
  handler: (context: AuthContext) => Promise<T>
): Promise<NextResponse> {
  const { context, response } = await requireAuth(req);

  if (response) return response;
  if (!context) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const result = await handler(context);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Erro no handler:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
