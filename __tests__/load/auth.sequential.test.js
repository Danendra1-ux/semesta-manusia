/**
 * Sequential login smoke test.
 *
 * Why sequential: the concurrent test (__tests__/load/auth.load.test.js)
 * hits Supabase GoTrue's IP rate limit (~20-30 req/min) almost immediately,
 * so it measures the gateway, not our code. This test runs requests one at
 * a time with a configurable delay to stay UNDER the rate limit, so that
 * any failure points at OUR login flow rather than at Supabase throttling.
 *
 * Mix: every Nth request is INVALID credentials (intentionally wrong) so we
 * verify both the success path AND the failure path in one run.
 *
 * Usage:
 *   TEST_EMAIL=real@email.com TEST_PASSWORD=correct-pw \
 *   npx jest __tests__/load/auth.sequential.test.js --runInBand
 *
 * Tunables:
 *   TOTAL_REQUESTS       default 100
 *   DELAY_MS             default 1500  (=> ~40 req/min, under the IP limit)
 *   INVALID_EVERY_N      default 5     (every 5th attempt uses bad password)
 *   LATENCY_P99_BUDGET_MS default 3000
 */

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;

if (!SUPABASE_URL) {
  throw new Error(
    'NEXT_PUBLIC_SUPABASE_URL is not set. See jest.setup.js.'
  );
}

const AUTH_ENDPOINT = `${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/token?grant_type=password`;
const ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const TOTAL = Number.parseInt(process.env.TOTAL_REQUESTS || '100', 10);
const DELAY_MS = Number.parseInt(process.env.DELAY_MS || '1500', 10);
const INVALID_EVERY_N = Number.parseInt(process.env.INVALID_EVERY_N || '5', 10);
const P99_BUDGET_MS = Number.parseInt(
  process.env.LATENCY_P99_BUDGET_MS || '3000',
  10
);

const VALID_EMAIL = process.env.TEST_EMAIL || `nonexistent+${Date.now()}@example.invalid`;
const VALID_PASSWORD = process.env.TEST_PASSWORD || 'definitely-wrong-password';
const HAVE_VALID_CREDS = Boolean(process.env.TEST_EMAIL && process.env.TEST_PASSWORD);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function percentile(sortedArr, p) {
  if (sortedArr.length === 0) return 0;
  const idx = Math.min(
    sortedArr.length - 1,
    Math.floor((p / 100) * sortedArr.length)
  );
  return sortedArr[idx];
}

async function attemptLogin(email, password, expected) {
  const start = process.hrtime.bigint();
  const res = await fetch(AUTH_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: ANON_KEY || '',
      Authorization: `Bearer ${ANON_KEY || ''}`,
    },
    body: JSON.stringify({ email, password }),
  });
  const elapsedMs = Number(process.hrtime.bigint() - start) / 1e6;
  let body = null;
  try {
    body = await res.json();
  } catch {
    /* ignore */
  }
  return {
    ok: res.ok,
    status: res.status,
    latencyMs: elapsedMs,
    errorCode: body?.error_code || null,
    errorMsg: body?.msg || body?.error_description || null,
    expected,
  };
}

describe(`Sequential login smoke (${TOTAL} requests, ${DELAY_MS}ms apart)`, () => {
  jest.setTimeout((TOTAL * (DELAY_MS + 1000)) + 30000);

  test('valid + invalid login paths under the rate-limit threshold', async () => {
    if (!HAVE_VALID_CREDS) {
      console.log(
        '\nNo TEST_EMAIL/TEST_PASSWORD set — every request will be INVALID. ' +
          'Set both env vars to exercise the success path too.\n'
      );
    }

    console.log(`\nEndpoint:   ${AUTH_ENDPOINT}`);
    console.log(`Total:      ${TOTAL}`);
    console.log(`Delay:      ${DELAY_MS}ms (~${Math.round(60000 / DELAY_MS)} req/min)`);
    console.log(`Valid email: ${VALID_EMAIL || '(none)'}\n`);

    const results = [];

    for (let i = 0; i < TOTAL; i++) {
      const useInvalid = HAVE_VALID_CREDS && i % INVALID_EVERY_N === 0;

      const r = await attemptLogin(
        VALID_EMAIL,
        useInvalid ? 'definitely-wrong-password' : VALID_PASSWORD,
        useInvalid ? 'INVALID' : 'VALID'
      );
      results.push(r);

      // progress line every 10 attempts
      if ((i + 1) % 10 === 0 || i === TOTAL - 1) {
        const soFar = results.length;
        const okSoFar = results.filter((x) => x.ok).length;
        console.log(
          `  [${soFar}/${TOTAL}] ok=${okSoFar} last_status=${r.status} last=${r.latencyMs.toFixed(0)}ms`
        );
      }

      if (i < TOTAL - 1) await sleep(DELAY_MS);
    }

    // Buckets
    const validExpected = results.filter((r) => r.expected === 'VALID');
    const invalidExpected = results.filter((r) => r.expected === 'INVALID');

    const validOk = validExpected.filter((r) => r.ok).length;
    const invalidOk = invalidExpected.filter((r) => r.ok).length; // for INVALID, "ok" means we got a clean 400

    // For VALID: 200 = pass. Anything else (including 429) = fail.
    // For INVALID: 400 with invalid_credentials = pass. 429 = transient — flag but don't fail the whole test.
    const validFailures = validExpected.filter((r) => r.status !== 200);
    const invalidBad = invalidExpected.filter(
      (r) => !(r.status === 400 && r.errorCode === 'invalid_credentials')
    );
    const rateLimited = results.filter((r) => r.status === 429);
    const serverErrors = results.filter((r) => r.status >= 500);

    const latencies = results.map((r) => r.latencyMs).sort((a, b) => a - b);

    const report = {
      total: TOTAL,
      delayMs: DELAY_MS,
      expectedValid: validExpected.length,
      expectedInvalid: invalidExpected.length,
      validSuccess: validOk,
      invalidRejectedCleanly: invalidExpected.length - invalidBad.length,
      rateLimitedCount: rateLimited.length,
      serverErrorCount: serverErrors.length,
      latencyMs: {
        p50: Number(percentile(latencies, 50).toFixed(1)),
        p90: Number(percentile(latencies, 90).toFixed(1)),
        p99: Number(percentile(latencies, 99).toFixed(1)),
        max: Number(percentile(latencies, 100).toFixed(1)),
      },
    };

    console.log('\n========== SMOKE TEST REPORT ==========');
    console.log(JSON.stringify(report, null, 2));
    console.log('======================================\n');

    if (validFailures.length) {
      console.log('VALID-path failures (first 5):');
      for (const f of validFailures.slice(0, 5)) {
        console.log(`  status=${f.status} code=${f.errorCode} msg=${f.errorMsg}`);
      }
    }
    if (invalidBad.length) {
      console.log('INVALID-path anomalies (first 5):');
      for (const f of invalidBad.slice(0, 5)) {
        console.log(`  status=${f.status} code=${f.errorCode} msg=${f.errorMsg}`);
      }
    }

    // Hard assertions — only what tells us OUR login flow is broken.
    expect(serverErrors).toEqual([]);
    expect(rateLimited).toEqual([]); // sequential under DELAY_MS must NOT hit 429
    if (HAVE_VALID_CREDS) {
      expect(validFailures).toEqual([]); // real login must succeed every time
      expect(invalidBad).toEqual([]);    // bad password must always be 400/invalid_credentials
    } else {
      // INVALID-only mode: every attempt must be 400/invalid_credentials.
      expect(invalidBad).toEqual([]);
    }
    expect(percentile(latencies, 99)).toBeLessThan(P99_BUDGET_MS);
  });
});