import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const ADMIN_LOGIN_PATH = "/admin/login";

function isAdminPath(pathname) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

/**
 * Check whether the request carries a valid Supabase admin session.
 *
 * Reads all cookies from the request, filters for Supabase cookie names,
 * and calls Supabase server client getUser() with an async getAll handler
 * so chunked cookies are handled automatically.
 */
async function getAdminSession(req) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return null;

  try {
    // Gather Supabase cookie names from all request cookies
    const reqCookies = req.cookies.getAll();

    // Build an async getAll that returns ALL cookies (not a hint-based subset).
    // This is necessary because @supabase/ssr getAll expects an array of hints.
    // We pass the cookie names themselves as hints.
    const cookieNames = reqCookies.map((c) => c.name);

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll: async () => reqCookies,
        setAll: () => {
          // No-op — proxy only reads.
        },
      },
    });

    const { data } = await supabase.auth.getUser();
    const user = data?.user;
    if (!user) return null;

    const role =
      user.app_metadata?.role ||
      user.user_metadata?.role ||
      user.role;

    if (role !== "admin") return null;

    return { user, role };
  } catch {
    return null;
  }
}

/** @type {import('next/server').NextRequestHandler} */
export default async function proxy(req) {
  const { pathname, search } = req.nextUrl;

  if (!isAdminPath(pathname)) {
    return NextResponse.next();
  }

  // Public admin route — anyone can reach the login page.
  if (pathname === ADMIN_LOGIN_PATH) {
    const session = await getAdminSession(req);
    if (session) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/dashboard";
      url.search = "";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Protected admin routes — require an admin session.
  const session = await getAdminSession(req);
  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = ADMIN_LOGIN_PATH;
    const requested = pathname + (search || "");
    if (requested && requested !== ADMIN_LOGIN_PATH) {
      url.searchParams.set("redirect", requested);
    }
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico|css|js|map)$).*)"],
};