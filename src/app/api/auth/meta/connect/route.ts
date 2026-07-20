import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { storeMetaAccessToken } from "@/lib/meta-ads/auth";
import { z } from "zod";
import { validateCompanyAccess } from "@/lib/auth-middleware";

const ConnectMetaSchema = z.object({
  accessToken: z.string().min(1, "Access token required"),
  businessAccountId: z.string().min(1, "Business Account ID required"),
  accountName: z.string().min(1, "Account name required"),
  companyId: z.string().min(1, "Company ID required"),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { accessToken, businessAccountId, accountName, companyId } = ConnectMetaSchema.parse(body);
    const access = await validateCompanyAccess(session.user.id!, companyId);
    if (!access.valid) return NextResponse.json({ error: access.error }, { status: 403 });

    // Verify token is valid by making a test API call
    const verifyResponse = await fetch(
      `https://graph.facebook.com/v21.0/${businessAccountId}?fields=name,id&access_token=${accessToken}`
    );

    if (!verifyResponse.ok) {
      return NextResponse.json(
        { error: "Invalid Meta Ads access token or Account ID" },
        { status: 400 }
      );
    }

    // Store token in database
    const account = await storeMetaAccessToken({
      accessToken,
      businessAccountId,
      accountName,
      companyId,
    });

    return NextResponse.json({
      ok: true,
      message: "Meta Ads account connected successfully",
      account: {
        id: account.id,
        name: account.name,
        externalId: account.externalAccountId,
      },
    });
  } catch (err) {
    console.error("Connect Meta error:", err);

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
