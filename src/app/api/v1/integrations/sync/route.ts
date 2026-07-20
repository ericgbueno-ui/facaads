import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { validateCompanyAccess } from "@/lib/auth-middleware";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const { companyId } = await request.json();
  if (!companyId) return NextResponse.json({ error: "companyId é obrigatório" }, { status: 400 });
  const access = await validateCompanyAccess(session.user.id, companyId);
  if (!access.valid) return NextResponse.json({ error: access.error }, { status: 403 });
  return NextResponse.json(
    { success: false, code: "USE_CANONICAL_SYNC", error: "Use POST /api/sync/all-channels para sincronização real e auditável." },
    { status: 410 }
  );
}
