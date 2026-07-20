import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { storeMetaAccessToken } from "@/lib/meta-ads/auth";
import { z } from "zod";
import { validateCompanyAccess } from "@/lib/auth-middleware";

const ConnectDefaultSchema = z.object({
  accountId: z.string().min(1, "Account ID required"),
  accountName: z.string().min(1, "Account name required"),
  companyId: z.string().min(1, "Company ID required"),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accessToken = process.env.META_ADS_ACCESS_TOKEN;
    if (!accessToken) {
      return NextResponse.json(
        { error: "Meta Ads não está configurado no sistema (falta META_ADS_ACCESS_TOKEN)" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { accountId, accountName, companyId } = ConnectDefaultSchema.parse(body);
    const access = await validateCompanyAccess(session.user.id!, companyId);
    if (!access.valid) return NextResponse.json({ error: access.error }, { status: 403 });

    const account = await storeMetaAccessToken({
      accessToken,
      businessAccountId: accountId,
      accountName,
      companyId,
    });

    return NextResponse.json({
      ok: true,
      message: "Conta Meta Ads conectada com sucesso",
      account: {
        id: account.id,
        name: account.name,
        externalId: account.externalAccountId,
      },
    });
  } catch (err) {
    console.error("Connect Meta (default) error:", err);

    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: err.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
