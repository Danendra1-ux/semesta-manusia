import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const ADMIN_LOGIN_PATH = "/admin/login";
const USER_LOGIN_PATH = "/user/login";

function isAdminPath(pathname) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

function isUserPath(pathname) {
  return pathname === "/user" || pathname.startsWith("/user/");
}

/**
 * Volunteer-only routes. Anyone hitting these must be authenticated as
 * a regular user (non-admin). Admins are bounced to the admin dashboard.
 */
const USER_PROTECTED_PREFIXES = ["/user/profile", "/user/my-programs"];

function isUserProtectedPath(pathname) {
  return USER_PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

function getSupabaseServer(req) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return null;
  const reqCookies = req.cookies.getAll();
  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: async () => reqCookies,
      setAll: () => {
        // No-op — proxy only reads.
      },
    },
  });
}

/**
 * Check whether the request carries a valid Supabase admin session.
 */
async function getAdminSession(req) {
  const supabase = getSupabaseServer(req);
  if (!supabase) return null;

  try {
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

/**
 * Check whether the request carries a valid Supabase user session.
 * Returns the user object if signed in, else null.
 */
async function getUserSession(req) {
  const supabase = getSupabaseServer(req);
  if (!supabase) return null;
  try {
    const { data } = await supabase.auth.getUser();
    return data?.user || null;
  } catch {
    return null;
  }
}

/** @type {import('next/server').NextRequestHandler} */
export default async function proxy(req) {
  const { pathname, search } = req.nextUrl;

  // ---- Admin routes ----
  if (isAdminPath(pathname)) {
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

  // ---- Volunteer protected routes ----
  if (isUserPath(pathname) && isUserProtectedPath(pathname)) {
    const user = await getUserSession(req);
    if (!user) {
      const url = req.nextUrl.clone();
      url.pathname = USER_LOGIN_PATH;
      const requested = pathname + (search || "");
      if (requested && requested !== USER_LOGIN_PATH) {
        url.searchParams.set("redirect", requested);
      }
      return NextResponse.redirect(url);
    }

    // Admins use the admin dashboard, not the volunteer profile.
    const role =
      user.app_metadata?.role ||
      user.user_metadata?.role ||
      user.role;
    if (role === "admin") {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/dashboard";
      return NextResponse.redirect(url);
    }
  }

  // ---- Volunteer auth pages (login/signup) — bounce signed-in users ----
  if (pathname === "/user/login" || pathname === "/user/signup") {
    const user = await getUserSession(req);
    if (user) {
      const role =
        user.app_metadata?.role ||
        user.user_metadata?.role ||
        user.role;
      const url = req.nextUrl.clone();
      url.pathname = role === "admin" ? "/admin/dashboard" : "/user/landingpage";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico|css|js|map)$).*)"],
};