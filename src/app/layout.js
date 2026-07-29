import "./globals.css";
import { Poppins } from "next/font/google";
import { getSupabaseAnonKey } from "@/lib/supabaseKeys";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

export const metadata = {
  title: "Semesta Manusia — Platform Sukarelawan Indonesia",
  description: "Bergabunglah dengan Semesta Manusia untuk menciptakan dampak positif bagi masyarakat Indonesia melalui program sukarela di bidang pendidikan, kesehatan, dan pemberdayaan sosial.",
  icons: {
    icon: "/icon.png",
  },
};

// [LOCAL TESTING] One-shot Supabase connection probe — runs on server boot.
// Logs which Supabase project you're hitting so you can confirm you're on the test DB.
async function logSupabaseConnection() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = getSupabaseAnonKey();

  const host = url ? new URL(url).host : "(missing URL)";

  if (!url || !serviceKey) {
    console.log("\n┌─── Supabase connection ─────────────────────────");
    console.log(`│ URL host : ${host}`);
    console.log(`│ Service key: ${serviceKey ? "present" : "MISSING"}`);
    console.log("│ Status   : SKIPPED — required env vars missing");
    console.log("└─────────────────────────────────────────────────\n");
    return;
  }

  const start = Date.now();
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const admin = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Lightweight read against auth.users (1 row max) to verify the link is live.
    const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1 });
    const ms = Date.now() - start;

    if (error) throw error;

    console.log("\n┌─── Supabase connection ─────────────────────────");
    console.log(`│ URL host : ${host}`);
    console.log(`│ Service key: present (anon key: ${anonKey ? "present" : "MISSING"})`);
    console.log(`│ Latency  : ${ms} ms`);
    console.log(`│ Status   : CONNECTED ✓`);
    console.log("└─────────────────────────────────────────────────\n");
  } catch (err) {
    const ms = Date.now() - start;
    console.log("\n┌─── Supabase connection ─────────────────────────");
    console.log(`│ URL host : ${host}`);
    console.log(`│ Status   : FAILED ✗  (${ms} ms)`);
    console.log(`│ Error    : ${err?.message || err}`);
    console.log("└─────────────────────────────────────────────────\n");
  }
}

void logSupabaseConnection();

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={poppins.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
