import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { storeMetaAccessToken } from "@/lib/meta-ads/auth";
import { z } from "zod";

const ConnectMetaSchema = z.object({
  accessToken: z.string().min(1, "Access token required"),
  businessAccountId: z.string().min(1, "Business Account ID required"),
  accountName: z.string().min(1, "Account name required"),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { accessToken, businessAccountId, accountName } = ConnectMetaSchema.parse(body);

    // Verify token is valid by making a test API call
    const verifyResponse = await fetch(
      `https://graph.instagram.com/v21.0/${businessAccountId}?fields=name,id&access_token=${accessToken}`
    );

    if (!verifyResponse.ok) {
      return NextResponse.json(
        { error: "Invalid Meta Ads access token or Account ID" },
        { status: 400 }
      );
    }

    // Store token in database
    const account = await storeMetaAccessToken(session.user.email, {
      accessToken,
      businessAccountId,
      accountName,
    });

    return NextResponse.json({
      ok: true,
      message: "Meta Ads account connected successfully",
      account: {
        id: account.id,
        name: account.name,
        externalId: account.externalId,
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
