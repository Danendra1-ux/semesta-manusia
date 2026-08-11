"""
Concurrent load test for POST /api/registrations.

Generates 1000 random registration bodies and fires them at the local dev
server in parallel. Adjust CONCURRENCY to tune max inflight requests.

Run:
    python scripts/loadtest_registrations.py

The dev server must be running on http://localhost:3000.

Cleans up nothing — load test inserts real rows. The companion cleanup
script removes rows whose emails match the test prefix.
"""

import argparse
import json
import random
import string
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import date, timedelta

import requests

PROGRAM_ID = "9d578e4d-51b2-4879-b3a2-e316c5aa9b0e"
FUNDING_TYPE_ID = "6b6d79e9-7749-4777-94f4-07bca8d7a89f"
BASE_URL = "http://localhost:3000"
EMAIL_PREFIX = "loadtest+"
TARGET = 1000


def rand_digits(n: int) -> str:
    return "".join(random.choices(string.digits, k=n))


def rand_letters(n: int) -> str:
    return "".join(random.choices(string.ascii_lowercase, k=n))


def rand_date() -> str:
    start = date(1990, 1, 1)
    end = date(2005, 12, 31)
    delta = (end - start).days
    return (start + timedelta(days=random.randint(0, delta))).isoformat()


def build_payload() -> dict:
    uid = rand_digits(10)
    return {
        "program_id": PROGRAM_ID,
        "funding_type_id": FUNDING_TYPE_ID,
        "full_name": f"Load Test {uid}",
        "email": f"{EMAIL_PREFIX}{uid}@example.com",
        "whatsapp": f"62{rand_digits(10)}",
        "instagram": f"@loadtest_{rand_letters(6)}",
        "birth_date": rand_date(),
        "region": random.choice(["Jakarta", "Bandung", "Surabaya", "Yogyakarta", "Medan"]),
        "institution": random.choice(["Universitas Indonesia", "ITB", "UGM", "ITS", "UNDIP"]),
        "reason": "Stress test"
        + rand_letters(20),
        "dynamic_answers": [],
        "uploaded_files": [],
    }


def fire(session: requests.Session, payload: dict) -> tuple[int, float, str]:
    t0 = time.perf_counter()
    try:
        r = session.post(f"{BASE_URL}/api/registrations", json=payload, timeout=30)
        elapsed = time.perf_counter() - t0
        return r.status_code, elapsed, (r.text or "")[:200]
    except requests.RequestException as e:
        return 0, time.perf_counter() - t0, f"EXC: {e}"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--target", type=int, default=TARGET)
    ap.add_argument("--concurrency", type=int, default=50)
    ap.add_argument("--seed", type=int, default=42)
    args = ap.parse_args()

    random.seed(args.seed)
    payloads = [build_payload() for _ in range(args.target)]

    counts = {2: 0, 4: 0, 5: 0}  # 2xx, 4xx, 5xx
    durations = []
    failures = []

    def render_progress(done: int, total: int, elapsed: float) -> str:
        pct = done / total if total else 0
        bar_w = 30
        filled = int(bar_w * pct)
        bar = "#" * filled + "-" * (bar_w - filled)
        rps = done / elapsed if elapsed > 0 else 0
        c2, c4, c5 = counts.get(2, 0), counts.get(4, 0), counts.get(5, 0)
        return (
            f"\r  [{bar}] {done}/{total} ({pct*100:5.1f}%)  "
            f"{rps:5.1f} req/s  "
            f"2xx:{c2}  4xx:{c4}  5xx:{c5}  "
            f"elapsed:{elapsed:5.1f}s "
        )

    print(f"=== {args.target} requests, concurrency={args.concurrency} ===")
    print(f"  seed={args.seed}  url={BASE_URL}")
    print(f"  starting...{' ' * 40}")

    with requests.Session() as session:
        t_start = time.perf_counter()
        last_render = 0.0
        with ThreadPoolExecutor(max_workers=args.concurrency) as pool:
            futs = {pool.submit(fire, session, p): p for p in payloads}
            for i, fut in enumerate(as_completed(futs), 1):
                code, dur, body = fut.result()
                durations.append(dur)
                bucket = code // 100
                counts[bucket] = counts.get(bucket, 0) + 1
                if code >= 400:
                    failures.append((code, body))
                now = time.perf_counter()
                if now - last_render > 0.1 or i == args.target:
                    print(render_progress(i, args.target, now - t_start), end="", flush=True)
                    last_render = now
        total = time.perf_counter() - t_start
    print()  # newline after progress bar

    durations.sort()
    n = len(durations)
    p50 = durations[n // 2]
    p95 = durations[min(n - 1, int(n * 0.95))]
    p99 = durations[min(n - 1, int(n * 0.99))]
    pmin = durations[0]
    pmax = durations[-1]
    avg = sum(durations) / n if n else 0
    rps = args.target / total if total > 0 else 0
    ok = counts.get(2, 0)
    err = counts.get(4, 0) + counts.get(5, 0)
    ok_pct = ok / args.target * 100 if args.target else 0

    by_code: dict[int, int] = {}
    for code, _ in failures:
        by_code[code] = by_code.get(code, 0) + 1

    def fmt_bar(p: float, width: int = 24) -> str:
        return "#" * int(width * p) + "-" * (width - int(width * p))

    print()
    print("+-- Summary " + "-" * 56 + "+")
    print(f"| {'Requests':<14} : {args.target} total (success {ok} / errors {err})  [{ok_pct:5.1f}% ok]")
    print(f"| {'Concurrency':<14} : {args.concurrency} workers")
    print(f"| {'Wall time':<14} : {total:.2f}s")
    print(f"| {'Throughput':<14} : {rps:.2f} req/s")
    print("+-- Latency " + "-" * 56 + "+")
    print(f"| {'avg':<14} : {avg*1000:7.1f} ms  {fmt_bar(min(avg/max(pmax,1e-6),1))}")
    print(f"| {'min':<14} : {pmin*1000:7.1f} ms")
    print(f"| {'p50':<14} : {p50*1000:7.1f} ms  {fmt_bar(min(p50/max(pmax,1e-6),1))}")
    print(f"| {'p95':<14} : {p95*1000:7.1f} ms  {fmt_bar(min(p95/max(pmax,1e-6),1))}")
    print(f"| {'p99':<14} : {p99*1000:7.1f} ms  {fmt_bar(min(p99/max(pmax,1e-6),1))}")
    print(f"| {'max':<14} : {pmax*1000:7.1f} ms")
    print("+-- Status codes " + "-" * 49 + "+")
    print(f"| 2xx : {counts.get(2,0):>5}  {fmt_bar(counts.get(2,0)/args.target)}")
    print(f"| 4xx : {counts.get(4,0):>5}  {fmt_bar(counts.get(4,0)/args.target)}")
    print(f"| 5xx : {counts.get(5,0):>5}  {fmt_bar(counts.get(5,0)/args.target)}")
    if by_code:
        print("+-- Failures by code " + "-" * 47 + "+")
        for code, n in sorted(by_code.items()):
            print(f"| {code} : {n}")
    if failures:
        print("+-- Sample failures " + "-" * 47 + "+")
        for code, body in failures[:5]:
            short = body[:80].replace("\n", " ")
            print(f"| {code}: {short}")
        print("+" + "-" * 63 + "+")


if __name__ == "__main__":
    main()
