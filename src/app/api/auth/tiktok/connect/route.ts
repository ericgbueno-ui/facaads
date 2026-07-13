import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { auth } from "@/lib/auth";
import { storeTikTokAdsToken } from "@/lib/tiktok-ads/auth";
import { z } from "zod";

const ConnectTikTokSchema = z.object({
  accessToken: z.string().min(1, "Access token required"),
  advertiserId: z.string().min(1, "Advertiser ID required"),
  accountName: z.string().min(1, "Account name required"),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(auth);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { accessToken, advertiserId, accountName } = ConnectTikTokSchema.parse(body);

    // Verify token by making a test API call
    const verifyResponse = await fetch(
      `https://business-api.tiktok.com/open_api/v1.3/campaign/get?advertiser_id=${advertiserId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!verifyResponse.ok) {
      return NextResponse.json(
        { error: "Invalid TikTok Ads access token or Advertiser ID" },
        { status: 400 }
      );
    }

    const account = await storeTikTokAdsToken(session.user.email, {
      accessToken,
      advertiserId,
      accountName,
    });

    return NextResponse.json({
      ok: true,
      message: "TikTok Ads account connected successfully",
      account: {
        id: account.id,
        name: account.name,
        externalId: account.externalId,
      },
    });
  } catch (err) {
    console.error("Connect TikTok error:", err);

    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: err.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
