"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Supabase verify endpoint redirects to the site root with hash tokens:
    //   /#access_token=...&type=recovery
    // Detect recovery tokens and forward to the password-reset page.
    const hash = window.location.hash.slice(1);
    const searchQuery = window.location.search;
    const queryParts = [hash, searchQuery].filter(Boolean).join("&");
    const hasRecoveryTokens =
      queryParts.includes("access_token") ||
      queryParts.includes("type=recovery") ||
      queryParts.includes("type=signup");

    if (hasRecoveryTokens) {
      // Clean the URL and navigate to the password-reset page.
      window.history.replaceState(null, "", "/user/reset-password");
      router.replace("/user/reset-password");
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
