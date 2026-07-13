import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  // Proteger dashboard com auth
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    const session = await auth();
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Redirecionar para seleção de projeto se não houver projeto selecionado
    const projectId = request.cookies.get("selectedProject")?.value;
    if (!projectId) {
      return NextResponse.redirect(new URL("/projects", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
