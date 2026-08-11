import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseAnonKey, getSupabaseServiceKey } from "@/lib/supabaseKeys";

const ADMIN_LOGIN_PATH = "/user/login";
const USER_LOGIN_PATH = "/user/login";

function isAdminPath(pathname) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

function isUserPath(pathname) {
  return pathname === "/user" || pathname.startsWith("/user/");
}

const USER_PROTECTED_PREFIXES = ["/user/profile", "/user/my-programs"];

function isUserProtectedPath(pathname) {
  return USER_PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

function getSupabaseServer(req) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = getSupabaseAnonKey();
  if (!supabaseUrl || !supabaseKey) return null;
  const reqCookies = req.cookies.getAll();
  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: async () => reqCookies,
      setAll: () => {},
    },
  });
}

async function getAdminSession(req) {
  const supabase = getSupabaseServer(req);
  if (!supabase) return null;
  try {
    const { data } = await supabase.auth.getUser();
    const user = data?.user;
    if (!user) return null;
    const role = user.app_metadata?.role || user.user_metadata?.role || user.role;
    if (role !== "admin") return null;
    return { user, role };
  } catch {
    return null;
  }
}

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

/**
 * Verify the authenticated user still exists and is active in public.users.
 * Returns true if the user is active (or row not yet created by trigger).
 * Returns false if the user was deleted or explicitly deactivated.
 */
async function isUserActive(authUserId) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = getSupabaseServiceKey();
  if (!supabaseUrl || !serviceKey) return true;

  try {
    const adminClient = createClient(supabaseUrl, serviceKey);
    const { data: row } = await adminClient
      .from("users")
      .select("is_active")
      .eq("id", authUserId)
      .maybeSingle();

    if (!row) return false; // deleted from public.users
    if (row.is_active === false) return false; // explicitly deactivated
    return true;
  } catch {
    return true; // on DB error, don't block legitimate users
  }
}

export default async function proxy(req) {
  const { pathname, search } = req.nextUrl;

  // ---- Admin routes ----
  if (isAdminPath(pathname)) {
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

    const adminActive = await isUserActive(session.user.id);
    if (!adminActive) {
      const url = req.nextUrl.clone();
      url.pathname = ADMIN_LOGIN_PATH;
      url.searchParams.set("redirect", pathname + (search || ""));
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

    const userActive = await isUserActive(user.id);
    if (!userActive) {
      const url = req.nextUrl.clone();
      url.pathname = USER_LOGIN_PATH;
      url.searchParams.set("redirect", pathname + (search || ""));
      return NextResponse.redirect(url);
    }

    const role = user.app_metadata?.role || user.user_metadata?.role || user.role;
    if (role === "admin") {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/dashboard";
      return NextResponse.redirect(url);
    }
  }

  // ---- Volunteer auth pages — bounce signed-in users ----
  if (pathname === "/user/login" || pathname === "/user/signup") {
    const user = await getUserSession(req);
    if (user) {
      const role = user.app_metadata?.role || user.user_metadata?.role || user.role;
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