import { NextResponse } from "next/server";

/**
 * Provisionamento via HTTP foi desativado por segurança.
 * Use `npm run db:seed` com SEED_ADMIN_EMAIL e SEED_ADMIN_PASSWORD.
 */
export async function GET() {
  return NextResponse.json(
    {
      ok: false,
      code: "SEED_ROUTE_DISABLED",
      error: "Provisionamento via HTTP desativado.",
    },
    { status: 410 }
  );
}
