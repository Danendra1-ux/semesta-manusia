"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabaseClient";
import styles from "./page.module.css";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect") || "/user/program";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [shakeField, setShakeField] = useState(null);
  const [emailNotConfirmed, setEmailNotConfirmed] = useState(false);
  const [resendStatus, setResendStatus] = useState({ state: "idle", message: "" });
  const inFlightRef = useRef(false);

  const validate = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = "Email tidak boleh kosong";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Format email tidak valid";
    }
    if (!password.trim()) {
      newErrors.password = "Password tidak boleh kosong";
    }
    return newErrors;
  };

  const triggerShake = (field) => {
    setShakeField(field);
    setTimeout(() => setShakeField(null), 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (inFlightRef.current) return;
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstErrorField = Object.keys(validationErrors)[0];
      triggerShake(firstErrorField);
      return;
    }

    setErrors({});
    setIsLoading(true);
    inFlightRef.current = true;

    const timeoutId = setTimeout(() => {
      if (inFlightRef.current) {
        inFlightRef.current = false;
        setIsLoading(false);
        setErrors({ general: "Permintaan terlalu lama. Silakan coba lagi." });
        triggerShake("general");
      }
    }, 15000);

    try {
      const supabase = createSupabaseClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        clearTimeout(timeoutId);
        inFlightRef.current = false;
        setIsLoading(false);
        let msg = "Email atau password yang anda masukkan salah";
        const isUnconfirmed = /email not confirmed/i.test(error.message);
        if (isUnconfirmed) {
          msg = "Email belum dikonfirmasi. Cek inbox kamu.";
          setEmailNotConfirmed(true);
        } else {
          setEmailNotConfirmed(false);
        }
        if (/network|fetch/i.test(error.message)) {
          msg = "Koneksi bermasalah. Periksa internet kamu lalu coba lagi.";
        }
        setErrors({ general: msg });
        triggerShake("general");
        return;
      }

      clearTimeout(timeoutId);

      try {
        await fetch("/api/auth/record-login", { method: "POST" });
      } catch (_e) {
      }

      // jika role admin
      const session = await supabase.auth.getSession();
      const role = session.data.session?.user?.app_metadata?.role
        || session.data.session?.user?.user_metadata?.role;
      if (role === "admin") {
        const adminRedirect = redirectParam.startsWith("/admin") ? redirectParam : "/admin/dashboard";
        router.replace(adminRedirect);
        router.refresh();
        return;
      }

      const safeRedirect = redirectParam.startsWith("/") ? redirectParam : "/user/program";
      router.replace(safeRedirect);
      router.refresh();
    } catch (err) {
      clearTimeout(timeoutId);
      inFlightRef.current = false;
      setIsLoading(false);
      console.error("Login error:", err);
      setErrors({ general: "Terjadi kesalahan saat masuk. Silakan coba lagi." });
      triggerShake("general");
    }
  };

  const handleResend = async () => {
    if (!email.trim()) return;
    setResendStatus({ state: "loading", message: "" });
    try {
      const res = await fetch("/api/auth/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResendStatus({
          state: "error",
          message: data?.error || "Gagal mengirim ulang email. Coba lagi nanti.",
        });
        return;
      }
      setResendStatus({
        state: "success",
        message: "Email verifikasi sudah dikirim ulang. Cek inbox (atau folder spam) kamu.",
      });
    } catch (err) {
      setResendStatus({
        state: "error",
        message: "Tidak dapat menghubungi server. Periksa koneksi kamu.",
      });
    }
  };

  return (
    <div className={styles.loginPage}>
      {/* Left Column */}
      <div className={styles.leftColumn}>
        <div className={styles.decorativeCircle1} />
        <div className={styles.decorativeCircle2} />
        <div className={styles.decorativeCircle3} />
        <div className={styles.decorativeLines} />

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
            Berkontribusi untuk Indonesia lewat program relawan kami
          </p>

          <div className={styles.divider} />

          <div className={styles.features}>
            <div className={styles.featureItem}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Daftarkan dirimu untuk berbagai program relawan</span>
            </div>
            <div className={styles.featureItem}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Pantau status pendaftaranmu kapan saja</span>
            </div>
            <div className={styles.featureItem}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Data dirimu tersimpan aman &amp; terenkripsi</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className={styles.rightColumn}>
        <div className={styles.formContainer}>
          <div className={styles.formHeader}>
            <p className={styles.greeting}>Halo Relawan!</p>
            <h2 className={styles.formTitle}>Masuk ke Akunmu</h2>
            <p className={styles.formSubtitle}>
              Masukkan email dan password untuk melanjutkan
            </p>
          </div>

          <form onSubmit={handleSubmit} className={styles.loginForm} noValidate>
            {errors.general && (
              <div className={`${styles.errorMessage} ${shakeField === "general" ? styles.shake : ""}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{errors.general}</span>
              </div>
            )}

            {emailNotConfirmed && (
              <div className={styles.resendBlock}>
                <button
                  type="button"
                  className={styles.resendButton}
                  onClick={handleResend}
                  disabled={resendStatus.state === "loading"}
                >
                  {resendStatus.state === "loading"
                    ? "Mengirim..."
                    : "Kirim ulang email verifikasi"}
                </button>
                {resendStatus.message && (
                  <p
                    className={`${styles.resendStatus} ${
                      resendStatus.state === "success"
                        ? styles.resendStatusSuccess
                        : styles.resendStatusError
                    }`}
                  >
                    {resendStatus.message}
                  </p>
                )}
              </div>
            )}

            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.inputLabel}>
                Email
              </label>
              <input
                id="email"
                type="email"
                className={`${styles.inputField} ${errors.email ? styles.inputError : ""} ${shakeField === "email" ? styles.shake : ""}`}
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: "" });
                  if (emailNotConfirmed) {
                    setEmailNotConfirmed(false);
                    setResendStatus({ state: "idle", message: "" });
                  }
                }}
                autoComplete="email"
              />
              {errors.email && (
                <p className={styles.fieldError}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {errors.email}
                </p>
              )}
            </div>

            <div className={styles.inputGroup}>
              <div className={styles.passwordLabelRow}>
                <label htmlFor="password" className={styles.inputLabel}>
                  Password
                </label>
                <Link href="/user/forgot-password" className={styles.forgotLink}>
                  Lupa password?
                </Link>
              </div>
              <div className={styles.passwordWrapper}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className={`${styles.inputField} ${errors.password ? styles.inputError : ""} ${shakeField === "password" ? styles.shake : ""}`}
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: "" });
                  }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className={styles.fieldError}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {errors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className={styles.spinner} />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <span>Masuk</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <p className={styles.formFooter}>
            Belum punya akun?
            <Link href={`/user/signup${redirectParam !== "/user/program" ? `?redirect=${encodeURIComponent(redirectParam)}` : ""}`}>Daftar sekarang</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function UserLoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh" }} />}>
      <LoginForm />
    </Suspense>
  );
}