"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Supabase verify endpoint redirects to the site root with hash tokens:
    //   /#access_token=...&type=recovery    → password reset
    //   /#access_token=...&type=signup     → email confirmation (go to login)
    const hash = window.location.hash.slice(1);
    const searchQuery = window.location.search;
    const queryParts = [hash, searchQuery].filter(Boolean).join("&");

    // Only redirect to reset-password for recovery tokens.
    if (queryParts.includes("type=recovery") && queryParts.includes("access_token")) {
      window.history.replaceState(null, "", "/user/reset-password");
      router.replace("/user/reset-password");
      return;
    }

    // Signup confirmation tokens → redirect to login page.
    if (queryParts.includes("type=signup") || queryParts.includes("access_token")) {
      window.history.replaceState(null, "", "/user/login");
      router.replace("/user/login");
      return;
    }

    // Normal root behaviour: go to landing page.
    router.replace("/user/landingpage");
  }, [router]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: '#00BFFF',
      color: 'white',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Semesta Manusia</h1>
        <p style={{ opacity: 0.9 }}>Memuat...</p>
      </div>
    </div>
  );
}
