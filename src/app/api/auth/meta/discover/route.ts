import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
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

    const url = `https://graph.facebook.com/v21.0/me/adaccounts?fields=id,name&access_token=${accessToken}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok || data.error) {
      return NextResponse.json(
        { error: data.error?.message || "Erro ao buscar contas no Meta" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      accounts: (data.data || []).map((acc: any) => ({ id: acc.id, name: acc.name })),
    });
  } catch (err) {
    console.error("Meta discover error:", err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
