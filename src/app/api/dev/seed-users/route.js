import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * POST /api/dev/seed-users — DEV-ONLY seed endpoint for the
 * /admin/users "auto-Nonaktif setelah 6 bulan" feature.
 *
 * Requires header `x-seed-key` matching env SEED_KEY. Returns 404 if the
 * key is unset so the route is inert in production.
 *
 * Creates dummy users with a spread of last_login_at values so the admin
 * UI exercises every branch:
 *   - active: logged in within the last week
 *   - active-edge: logged in ~5.5 months ago (just inside the 6-month window)
 *   - dormant: logged in ~7 months ago with is_active = true (will appear
 *              Nonaktif via effective_is_active on the listing)
 *   - dormant-inactive: logged in ~8 months ago with is_active = false
 *   - ancient: never logged in, created a year ago
 *
 * Idempotent: looks up by email first and only inserts auth.users for
 * misses. Updates last_login_at / is_active on existing rows so re-running
 * always resets to the expected state.
 */

const SIX_MONTHS_MS = 1000 * 60 * 60 * 24 * 30 * 6;
const FIXED_PASSWORD = "DummyPass123!";

const DUMMIES = [
  {
    email: "dummy.active@semesta-manusia.test",
    name: "Aktif Baru",
    lastLoginDaysAgo: 3,
    isActive: true,
    region: "Jakarta",
    institution: "Universitas Indonesia",
  },
  {
    email: "dummy.edge@semesta-manusia.test",
    name: "Aktif Tepat Ambang",
    lastLoginDaysAgo: 165, // 5.5 months — still Aktif
    isActive: true,
    region: "Bandung",
    institution: "ITB",
  },
  {
    email: "dummy.dormant.flag@semesta-manusia.test",
    name: "Dormant Flag Aktif",
    lastLoginDaysAgo: 210, // 7 months — effective Nonaktif
    isActive: true, // explicit flag is still true; computed view flips it
    region: "Yogyakarta",
    institution: "UGM",
  },
  {
    email: "dummy.dormant.inactive@semesta-manusia.test",
    name: "Dormant Nonaktif",
    lastLoginDaysAgo: 240,
    isActive: false,
    region: "Surabaya",
    institution: "ITS",
  },
  {
    email: "dummy.ancient@semesta-manusia.test",
    name: "Tidak Pernah Login",
    lastLoginDaysAgo: null, // never logged in
    isActive: true,
    region: "Medan",
    institution: "USU",
  },
  {
    email: "dummy.just.reactivated@semesta-manusia.test",
    name: "Baru Reaktif",
    lastLoginDaysAgo: 0, // just logged in (used to verify reactivation on next login)
    isActive: true,
    region: "Semarang",
    institution: "UNDIP",
  },
];

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Supabase env not configured.");
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function isoDaysAgo(days) {
  if (days === null || days === undefined) return null;
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

export async function POST(request) {
  const seedKey = process.env.SEED_KEY;
  const provided = request.headers.get("x-seed-key");

  if (!seedKey || provided !== seedKey) {
    // Treat as "endpoint not configured" — never leak the existence of the route.
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  try {
    const adminClient = getAdminClient();
    const results = [];

    for (const d of DUMMIES) {
      // 1) Ensure auth.users row exists.
      // Try to look up by listing users (small page size is fine — dummies are few).
      const { data: listData, error: listErr } =
        await adminClient.auth.admin.listUsers({ perPage: 1000 });
      if (listErr) {
        results.push({ email: d.email, step: "list", error: listErr.message });
        continue;
      }
      let authUser = listData?.users?.find((u) => u.email === d.email);

      if (!authUser) {
        const { data: created, error: createErr } =
          await adminClient.auth.admin.createUser({
            email: d.email,
            password: FIXED_PASSWORD,
            email_confirm: true,
            user_metadata: {
              name: d.name,
              region: d.region,
              institution: d.institution,
            },
          });
        if (createErr) {
          results.push({ email: d.email, step: "create", error: createErr.message });
          continue;
        }
        authUser = created.user;
      }

      // 2) Patch the public mirror row. The trigger may not have populated
      // `last_login_at`, `is_active`, `region`, `institution` — set them
      // explicitly so the listing reflects what we want.
      const update = {
        name: d.name,
        role: "user",
        is_active: d.isActive,
        last_login_at: isoDaysAgo(d.lastLoginDaysAgo),
        region: d.region,
        institution: d.institution,
      };

      const { error: updateErr } = await adminClient
        .from("users")
        .update(update)
        .eq("id", authUser.id);

      if (updateErr) {
        results.push({ email: d.email, step: "update", error: updateErr.message });
        continue;
      }

      results.push({
        email: d.email,
        id: authUser.id,
        last_login_at: update.last_login_at,
        is_active: update.is_active,
        effective_is_active:
          update.is_active &&
          (d.lastLoginDaysAgo === null
            ? false
            : d.lastLoginDaysAgo * 24 * 60 * 60 * 1000 <= SIX_MONTHS_MS),
      });
    }

    return NextResponse.json({
      ok: true,
      password: FIXED_PASSWORD,
      results,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Terjadi kesalahan." },
      { status: 500 }
    );
  }
}