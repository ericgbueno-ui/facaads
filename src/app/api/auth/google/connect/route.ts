import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { auth } from "@/lib/auth";
import { storeGoogleAdsToken } from "@/lib/google-ads/auth";
import { z } from "zod";

const ConnectGoogleSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token required"),
  customerId: z.string().min(1, "Customer ID required"),
  accountName: z.string().min(1, "Account name required"),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(auth);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { refreshToken, customerId, accountName } = ConnectGoogleSchema.parse(body);

    // Validate token by trying to get access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_ADS_CLIENT_ID || "",
        client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET || "",
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }).toString(),
    });

    if (!tokenResponse.ok) {
      return NextResponse.json(
        { error: "Invalid Google Ads credentials" },
        { status: 400 }
      );
    }

    const account = await storeGoogleAdsToken(session.user.email, {
      refreshToken,
      customerId,
      accountName,
    });

    return NextResponse.json({
      ok: true,
      message: "Google Ads account connected successfully",
      account: {
        id: account.id,
        name: account.name,
        externalId: account.externalId,
      },
    });
  } catch (err) {
    console.error("Connect Google Ads error:", err);

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
