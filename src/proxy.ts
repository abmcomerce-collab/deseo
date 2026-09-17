import { NextResponse, type NextRequest } from "next/server";
import { decrypt, SESSION_COOKIE } from "@/lib/session";

/**
 * Comprobación optimista de sesión (solo cookie, sin BD).
 * La autorización real se repite en cada página/acción del servidor.
 */
export default async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const session = await decrypt(req.cookies.get(SESSION_COOKIE)?.value);

  const isAdmin = pathname.startsWith("/admin");
  const isAccount = pathname.startsWith("/cuenta") && !pathname.startsWith("/cuenta/acceso") && !pathname.startsWith("/cuenta/registro");

  if ((isAdmin || isAccount) && !session) {
    const url = new URL("/cuenta/acceso", req.nextUrl);
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }
  if (isAdmin && session?.role !== "admin") {
    return NextResponse.redirect(new URL("/cuenta", req.nextUrl));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/cuenta/:path*"],
};
