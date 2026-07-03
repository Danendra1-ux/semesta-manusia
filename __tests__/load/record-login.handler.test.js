/**
 * record-login route handler test.
 *
 * What this tests:
 *   - Idempotency: many sequential calls update last_login_at without error.
 *   - Dormant reactivation: when previous last_login_at is >6 months ago AND
 *     is_active=false, the handler must set is_active=true and return
 *     { reactivated: true }.
 *   - Concurrency: 50 simultaneous calls for the same user_id must not
 *     produce contradictory writes (e.g. one branch reactivating while
 *     another doesn't).
 *
 * What this does NOT test (honest limits):
 *   - Real Supabase atomicity — we mock the admin client. Postgres-level
 *     race outcomes are out of scope for a unit test of this handler.
 *   - The cookies()/auth.getUser() cookie-jar plumbing — we stub it.
 *
 * Why this matters: see src/app/api/auth/record-login/route.js. The handler
 * does SELECT then UPDATE separately — a classic read-modify-write window
 * where two concurrent calls can both see "wasDormant=false" and both write
 * the same payload, or one sees true and another sees false depending on
 * timing. We assert the handler is internally consistent.
 */

const SIX_MONTHS_MS = 1000 * 60 * 60 * 24 * 30 * 6;

// ---- Module mocks ---------------------------------------------------------

// Mock `next/headers` cookies() to return whatever the test sets.
const cookieStoreState = { cookies: [] };
jest.mock('next/headers', () => ({
  cookies: jest.fn(async () => ({
    getAll: () => cookieStoreState.cookies,
    set: (k, v) => cookieStoreState.cookies.push({ name: k, value: v }),
  })),
}));

// Mock the @supabase/ssr server client (auth.getUser()).
const authState = { user: null };
jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(async () => ({ data: { user: authState.user } })),
    },
  })),
}));

// Mock @supabase/supabase-js — both the named factory and the namespace import
// are used in the route, so we capture every call to createClient().
const adminState = {
  // what .from('users').select(...).eq(...).maybeSingle() returns
  existingRow: null,
  // how .update() resolves — captured for assertion
  updateCalls: [],
  // whether update should throw
  updateShouldThrow: false,
};

jest.mock('@supabase/supabase-js', () => {
  const mockClient = {
    from: jest.fn((table) => {
      if (table !== 'users') {
        throw new Error(`Unexpected table read: ${table}`);
      }
      // Build a fluent query builder. update() also returns a builder
      // because the handler calls .update(...).eq(...).
      const builder = {
        select: jest.fn(() => builder),
        update: jest.fn((payload) => {
          adminState.updateCalls.push(payload);
          const updateBuilder = {
            eq: jest.fn(async () => {
              if (adminState.updateShouldThrow) {
                return { error: { message: 'forced error' } };
              }
              return { error: null };
            }),
          };
          return updateBuilder;
        }),
        eq: jest.fn(() => builder),
        maybeSingle: jest.fn(async () => ({
          data: adminState.existingRow,
          error: null,
        })),
      };
      return builder;
    }),
  };
  return {
    createClient: jest.fn(() => mockClient),
    __mockClient: mockClient,
    __adminState: adminState,
  };
});

// ---- Now import the route under test (AFTER mocks are registered) --------
const { POST } = require('../../src/app/api/auth/record-login/route.js');
const supabaseMod = require('@supabase/supabase-js');

// ---- Helpers -------------------------------------------------------------

function setAuthedUser(userId, email = 'user@example.com') {
  authState.user = { id: userId, email };
}

function setExistingUserRow(row) {
  adminState.existingRow = row;
}

function resetAdminState() {
  adminState.existingRow = null;
  adminState.updateCalls = [];
  adminState.updateShouldThrow = false;
  cookieStoreState.cookies = [];
  authState.user = null;
}

function isoMonthsAgo(n) {
  return new Date(Date.now() - n * 30 * 24 * 60 * 60 * 1000).toISOString();
}

function callHandler() {
  // Route expects a Request object but doesn't read it.
  return POST(new Request('http://localhost/api/auth/record-login', { method: 'POST' }));
}

// ---- Tests ---------------------------------------------------------------

describe('/api/auth/record-login handler', () => {
  beforeEach(() => {
    resetAdminState();
  });

  test('unauthenticated request returns 401 without touching DB', async () => {
    authState.user = null;
    const res = await callHandler();
    expect(res.status).toBe(401);
    expect(adminState.updateCalls).toHaveLength(0);
  });

  test('active user updates last_login_at and reports reactivated=false', async () => {
    setAuthedUser('u-1');
    setExistingUserRow({
      last_login_at: isoMonthsAgo(1), // 1 month ago, not dormant
      is_active: true,
    });

    const res = await callHandler();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.reactivated).toBe(false);
    expect(typeof body.last_login_at).toBe('string');
    expect(adminState.updateCalls).toHaveLength(1);
    expect(adminState.updateCalls[0]).toEqual({
      last_login_at: body.last_login_at,
    });
  });

  test('dormant inactive user is reactivated (is_active=true) and reactivated=true', async () => {
    setAuthedUser('u-2');
    setExistingUserRow({
      last_login_at: isoMonthsAgo(7), // 7 months ago -> dormant
      is_active: false,
    });

    const res = await callHandler();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.reactivated).toBe(true);
    expect(adminState.updateCalls).toHaveLength(1);
    expect(adminState.updateCalls[0].is_active).toBe(true);
    expect(typeof adminState.updateCalls[0].last_login_at).toBe('string');
  });

  test('recent active user is NOT reactivated', async () => {
    setAuthedUser('u-3');
    setExistingUserRow({
      last_login_at: isoMonthsAgo(0), // now-ish
      is_active: true,
    });
    const res = await callHandler();
    const body = await res.json();
    expect(body.reactivated).toBe(false);
    expect(adminState.updateCalls[0].is_active).toBeUndefined();
  });

  test('first login (no existing row) does not throw and does not write is_active', async () => {
    setAuthedUser('u-4');
    setExistingUserRow(null);
    const res = await callHandler();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.reactivated).toBe(false);
    expect(adminState.updateCalls).toHaveLength(1);
    expect(adminState.updateCalls[0].is_active).toBeUndefined();
  });

  // ---- The interesting test: concurrent calls for the same user ----------

  test('50 concurrent calls for the same user produce consistent writes', async () => {
    setAuthedUser('u-5');
    setExistingUserRow({
      last_login_at: isoMonthsAgo(1), // NOT dormant
      is_active: true,
    });

    const N = 50;
    const results = await Promise.all(
      Array.from({ length: N }, () => callHandler())
    );

    const statuses = results.map((r) => r.status);
    expect(new Set(statuses)).toEqual(new Set([200]));

    const bodies = await Promise.all(results.map((r) => r.json()));
    const reactivatedFlags = bodies.map((b) => b.reactivated);
    expect(new Set(reactivatedFlags)).toEqual(new Set([false]));

    // Every call produced exactly one update with the SAME shape (last_login_at only).
    expect(adminState.updateCalls).toHaveLength(N);
    for (const u of adminState.updateCalls) {
      expect(Object.keys(u).sort()).toEqual(['last_login_at']);
    }
  });

  test('20 concurrent calls for a dormant user all reactivate (consistent)', async () => {
    setAuthedUser('u-6');
    setExistingUserRow({
      last_login_at: isoMonthsAgo(8),
      is_active: false,
    });

    const N = 20;
    const results = await Promise.all(
      Array.from({ length: N }, () => callHandler())
    );

    const bodies = await Promise.all(results.map((r) => r.json()));
    // Every call must observe the same dormant snapshot -> all reactivate.
    expect(bodies.every((b) => b.reactivated === true)).toBe(true);

    expect(adminState.updateCalls).toHaveLength(N);
    for (const u of adminState.updateCalls) {
      expect(u.is_active).toBe(true);
    }
  });

  test('mixed sequential: 50 active-window calls then 1 dormant-state call flips reactivated', async () => {
    setAuthedUser('u-7');
    setExistingUserRow({
      last_login_at: isoMonthsAgo(2),
      is_active: true,
    });

    for (let i = 0; i < 50; i++) {
      const r = await callHandler();
      expect(r.status).toBe(200);
    }
    const reactivatedBefore = adminState.updateCalls.filter((u) => u.is_active).length;
    expect(reactivatedBefore).toBe(0);

    // Now flip the row to dormant+inactive (simulates 6 months passing)
    adminState.existingRow = {
      last_login_at: isoMonthsAgo(7),
      is_active: false,
    };
    const r = await callHandler();
    const body = await r.json();
    expect(body.reactivated).toBe(true);
    expect(adminState.updateCalls[adminState.updateCalls.length - 1].is_active).toBe(true);
  });
});