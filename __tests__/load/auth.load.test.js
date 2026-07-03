/**
 * Concurrent login load test for Supabase GoTrue.
 *
 * Goal: drive 1000 auth attempts against the project's Supabase project in
 * parallel and report what actually happens — success rate, latency
 * distribution, status code buckets, and rate-limit / 429 behaviour.
 *
 * Usage:
 *   TEST_EMAIL=existing@example.com \
 *   TEST_PASSWORD=correct-password \
 *   CONCURRENCY=50 \
 *   npx jest __tests__/load/auth.load.test.js --runInBand
 *
 * If TEST_EMAIL / TEST_PASSWORD are not set, the test runs an INVALID-password
 * storm (intentionally bad credentials). That still hits GoTrue and exercises
 * the rate-limit path, but every request will return 400 with
 * "Invalid login credentials" — which is what we want for a pure load test
 * that doesn't depend on having a real account provisioned.
 *
 * Configurable via env:
 *   TOTAL_REQUESTS  default 1000
 *   CONCURRENCY     default 50  (parallel in-flight requests)
 *   TEST_EMAIL      default none -> invalid-credentials path
 *   TEST_PASSWORD   default none
 */

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;

if (!SUPABASE_URL) {
  throw new Error(
    'NEXT_PUBLIC_SUPABASE_URL is not set. Did .env / .env.test load? ' +
      'See jest.setup.js.'
  );
}

const AUTH_ENDPOINT = `${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/token?grant_type=password`;
const ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const TOTAL = Number.parseInt(process.env.TOTAL_REQUESTS || '1000', 10);
const CONCURRENCY = Number.parseInt(process.env.CONCURRENCY || '50', 10);
const EMAIL = process.env.TEST_EMAIL || `loadtest+${Date.now()}@example.invalid`;
const PASSWORD = process.env.TEST_PASSWORD || 'definitely-wrong-password';

const SCENARIO =
  process.env.TEST_EMAIL && process.env.TEST_PASSWORD
    ? 'VALID_CREDENTIALS'
    : 'INVALID_CREDENTIALS';

function percentile(sortedArr, p) {
  if (sortedArr.length === 0) return 0;
  const idx = Math.min(
    sortedArr.length - 1,
    Math.floor((p / 100) * sortedArr.length)
  );
  return sortedArr[idx];
}

async function attemptLogin() {
  const start = process.hrtime.bigint();
  try {
    const res = await fetch(AUTH_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: ANON_KEY || '',
        Authorization: `Bearer ${ANON_KEY || ''}`,
      },
      body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
    });
    const elapsedMs = Number(process.hrtime.bigint() - start) / 1e6;
    let body = null;
    try {
      body = await res.json();
    } catch {
      // non-JSON body — keep going with status only
    }
    return {
      ok: res.ok,
      status: res.status,
      latencyMs: elapsedMs,
      errorCode: body?.error_code || null,
      errorMsg: body?.msg || body?.error_description || null,
    };
  } catch (err) {
    const elapsedMs = Number(process.hrtime.bigint() - start) / 1e6;
    return {
      ok: false,
      status: 0,
      latencyMs: elapsedMs,
      errorCode: 'NETWORK',
      errorMsg: err.message,
    };
  }
}

async function runWithConcurrency(tasks, limit) {
  const results = new Array(tasks.length);
  let cursor = 0;
  async function worker() {
    while (true) {
      const i = cursor++;
      if (i >= tasks.length) return;
      results[i] = await tasks[i]();
    }
  }
  const workers = Array.from({ length: Math.min(limit, tasks.length) }, () =>
    worker()
  );
  await Promise.all(workers);
  return results;
}

describe(`Concurrent login load test (${TOTAL} requests, concurrency=${CONCURRENCY})`, () => {
  jest.setTimeout(10 * 60 * 1000);

  test(`fires ${TOTAL} signInWithPassword calls against Supabase`, async () => {
    console.log(`\nEndpoint:   ${AUTH_ENDPOINT}`);
    console.log(`Scenario:   ${SCENARIO}`);
    console.log(`Email used: ${EMAIL}`);
    console.log(`Total:      ${TOTAL}    Concurrency: ${CONCURRENCY}\n`);

    const tasks = Array.from({ length: TOTAL }, () => attemptLogin);

    const wallStart = Date.now();
    const results = await runWithConcurrency(tasks, CONCURRENCY);
    const wallElapsed = Date.now() - wallStart;

    // Bucket results.
    const byStatus = new Map();
    const byErrorCode = new Map();
    let success = 0;
    let rateLimited = 0;
    for (const r of results) {
      byStatus.set(r.status, (byStatus.get(r.status) || 0) + 1);
      if (r.errorCode) {
        byErrorCode.set(r.errorCode, (byErrorCode.get(r.errorCode) || 0) + 1);
      }
      if (r.status === 200) success++;
      if (r.status === 429) rateLimited++;
    }

    const latencies = results.map((r) => r.latencyMs).sort((a, b) => a - b);

    const report = {
      scenario: SCENARIO,
      total: TOTAL,
      concurrency: CONCURRENCY,
      wallClockMs: wallElapsed,
      throughputRps: Math.round((TOTAL / wallElapsed) * 1000),
      successCount: success,
      rateLimitedCount: rateLimited,
      successRate: Number(((success / TOTAL) * 100).toFixed(2)),
      latencyMs: {
        p50: Number(percentile(latencies, 50).toFixed(1)),
        p90: Number(percentile(latencies, 90).toFixed(1)),
        p99: Number(percentile(latencies, 99).toFixed(1)),
        max: Number(percentile(latencies, 100).toFixed(1)),
      },
      statusCounts: Object.fromEntries(
        [...byStatus.entries()].sort((a, b) => b[1] - a[1])
      ),
      errorCodeCounts: Object.fromEntries(
        [...byErrorCode.entries()].sort((a, b) => b[1] - a[1])
      ),
    };

    console.log('\n========== LOAD TEST REPORT ==========');
    console.log(JSON.stringify(report, null, 2));
    console.log('======================================\n');

    // Sanity: at minimum, every request must return *some* status (network
    // failures count as status 0 in our bucketing). We fail the test only on
    // a complete network blackout — partial degradation / 429s are exactly
    // what we want this test to surface.
    const networkFailures =
      (byStatus.get(0) || 0) + (byErrorCode.get('NETWORK') || 0);
    expect(networkFailures).toBeLessThan(TOTAL);
  });
});