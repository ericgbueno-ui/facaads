export { auth as proxy } from "@/lib/auth";

export const config = {
  matcher: ["/api/auth/:path*"],
};
