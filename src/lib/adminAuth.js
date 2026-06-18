import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

function decodeJwtPayload(token) {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const padded = part.replace(/-/g, "+").replace(/_/g, "/");
    const json = Buffer.from(padded, "base64").toString("utf-8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const cookieList = cookieStore.getAll();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  let projectRef = "";
  try {
    projectRef = new URL(supabaseUrl).hostname.split(".")[0] || "";
  } catch {
    projectRef = "";
  }
  const cookieName = projectRef ? `sb-${projectRef}-auth-token` : "";

  // First try to use @supabase/ssr which knows the chunked cookie layout.
  if (supabaseUrl && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    try {
      const supabase = createServerClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {
            // No-op in a read-only check.
          },
        },
      });
      const { data } = await supabase.auth.getUser();
      const user = data?.user;
      if (user) {
        const role =
          user.app_metadata?.role || user.user_metadata?.role;
        if (role === "admin") {
          return { user, role };
        }
      }
    } catch {
      // fall through to the JWT path below
    }
  }

  // Fallback: read the chunked cookie manually and decode the JWT.
  for (const { name, value } of cookieList) {
    if (!cookieName || name !== cookieName) continue;
    if (!value) continue;
    let accessToken = null;
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed.access_token === "string") {
        accessToken = parsed.access_token;
      }
    } catch {
      if (value.split(".").length === 3) accessToken = value;
    }
    if (!accessToken) continue;
    const payload = decodeJwtPayload(accessToken);
    if (!payload) continue;
    const nowSec = Math.floor(Date.now() / 1000);
    if (typeof payload.exp !== "number" || payload.exp <= nowSec) continue;
    const role = payload.app_metadata?.role || payload.user_metadata?.role || payload.role;
    if (role === "admin") {
      return {
        user: {
          id: payload.sub,
          email: payload.email,
          app_metadata: payload.app_metadata,
          user_metadata: payload.user_metadata,
        },
        role,
      };
    }
  }

  return null;
}