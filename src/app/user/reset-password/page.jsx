"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabaseClient";
import styles from "../forgot-password/page.module.css";

function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("verifying"); // verifying | ready | invalid | success
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      if (typeof window === "undefined") return;
      const supabase = createSupabaseClient();
      const { data } = await supabase.auth.getSession();

      // Supabase detectSessionInUrl picks up tokens from window.location.hash
      // on the client. We trigger an explicit exchange here so the recovery
      // session is established before the user submits a new password.
      const hash = window.location.hash || "";
      const hasRecoveryTokens =
        hash.includes("access_token") || hash.includes("type=recovery");

      if (hasRecoveryTokens) {
        try {
          await supabase.auth.exchangeCodeForSession(window.location.href);
        } catch (_e) {
          // Fall through to session check below.
        }
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;

      if (cancelled) return;

      if (session) {
        setStatus("ready");
      } else {
        setStatus("invalid");
      }
    }

    checkSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const validate = () => {
    if (!password) {
      setErrorMsg("Password baru tidak boleh kosong.");
      return false;
    }
    if (password.length < 8) {
      setErrorMsg("Password minimal 8 karakter.");
      return false;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Konfirmasi password tidak cocok.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!validate()) return;

    setIsLoading(true);
    try {
      const supabase = createSupabaseClient();
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setErrorMsg(error.message || "Gagal memperbarui password. Coba lagi.");
        return;
      }

      // Sign out so the user lands on login fresh instead of being auto-logged
      // into whatever protected page they were about to be sent to.
      await supabase.auth.signOut();

      setStatus("success");
    } catch (err) {
      setErrorMsg("Terjadi kesalahan. Coba lagi nanti.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    if (status === "verifying") {
      return (
        <div className={styles.sentContent}>
          <div className={styles.spinner} style={{ margin: "0 auto 1rem", borderTopColor: "#00bfff", borderColor: "rgba(0, 191, 255, 0.2)" }} />
          <p className={styles.sentMessage}>Memverifikasi tautan reset...</p>
        </div>
      );
    }

    if (status === "invalid") {
      return (
        <div className={styles.sentContent}>
          <div className={styles.successIcon} style={{ background: "#fef2f2", color: "#b91c1c" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <p className={styles.sentMessage}>
            Tautan reset tidak valid atau sudah kedaluwarsa.
          </p>
          <p className={styles.sentSubtext}>
            Minta tautan baru dari halaman lupa password.
          </p>
          <Link href="/user/forgot-password" className={styles.submitBtn} style={{ marginTop: "1.5rem", textDecoration: "none" }}>
            <span>Minta tautan baru</span>
          </Link>
        </div>
      );
    }

    if (status === "success") {
      return (
        <div className={styles.sentContent}>
          <div className={styles.successIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <p className={styles.sentMessage}>
            Password kamu sudah diperbarui!
          </p>
          <p className={styles.sentSubtext}>
            Sekarang kamu bisa masuk dengan password baru kamu.
          </p>
          <button
            type="button"
            onClick={() => router.push("/user/login")}
            className={styles.submitBtn}
            style={{ marginTop: "1.5rem" }}
          >
            <span>Masuk sekarang</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      );
    }

    return (
      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        {errorMsg && (
          <div className={styles.errorAlert}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{errorMsg}</span>
          </div>
        )}

        <div className={styles.inputGroup}>
          <label htmlFor="password" className={styles.inputLabel}>
            Password Baru
          </label>
          <div style={{ position: "relative" }}>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              className={styles.inputField}
              placeholder="Minimal 8 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              autoFocus
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              style={{
                position: "absolute",
                right: "0.75rem",
                top: "50%",
                transform: "translateY(-50%)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "0.4rem",
                color: "#64748b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "8px",
              }}
            >
              {showPassword ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="confirmPassword" className={styles.inputLabel}>
            Konfirmasi Password Baru
          </label>
          <input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            className={styles.inputField}
            placeholder="Ketik ulang password baru"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          className={styles.submitBtn}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className={styles.spinner} />
              <span>Menyimpan...</span>
            </>
          ) : (
            <>
              <span>Simpan Password Baru</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </>
          )}
        </button>
      </form>
    );
  };

  return (
    <div className={styles.page}>
      <div className={styles.leftColumn}>
        <div className={styles.circle1} />
        <div className={styles.circle2} />
        <div className={styles.circle3} />
        <div className={styles.lines} />

        <div className={styles.brandingContent}>
          <div className={styles.logoWrapper}>
            <Image
              src="/LOGO SEMESTA MANUSIA.png"
              alt="Semesta Manusia Logo"
              width={80}
              height={80}
              className={styles.logo}
            />
          </div>
          <h1 className={styles.orgName}>Semesta Manusia</h1>
          <p className={styles.tagline}>
            Buat password baru untuk akun kamu
          </p>

          <div className={styles.divider} />

          <div className={styles.features}>
            <div className={styles.featureItem}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Gunakan minimal 8 karakter</span>
            </div>
            <div className={styles.featureItem}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Pastikan password baru kamu kuat</span>
            </div>
            <div className={styles.featureItem}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Setelah disimpan, masuk dengan password baru</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.rightColumn}>
        <div className={styles.formContainer}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>Password Baru</h2>
            <p className={styles.formSubtitle}>
              {status === "ready"
                ? "Masukkan password baru untuk akun kamu."
                : status === "success"
                ? "Password sudah diperbarui."
                : status === "invalid"
                ? "Tautan tidak valid."
                : "Sedang memverifikasi tautan..."}
            </p>
          </div>

          {renderContent()}

          {status !== "success" && status !== "invalid" && (
            <p className={styles.footer}>
              Ingat password kamu?
              <Link href="/user/login">Masuk</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh" }} />}>
      <ResetPasswordForm />
    </Suspense>
  );
}