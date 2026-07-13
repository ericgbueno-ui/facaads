import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  // Proteger dashboard com auth
  const session = await auth();
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirecionar para seleção de projeto se não houver projeto selecionado
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
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
