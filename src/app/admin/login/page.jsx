"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { createSupabaseClient } from "@/lib/supabaseClient";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [shakeField, setShakeField] = useState(null);
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

    // Safety net: if anything hangs for >15s, reset the loading state.
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        clearTimeout(timeoutId);
        inFlightRef.current = false;
        setIsLoading(false);
        setErrors({ general: "Email atau password yang anda masukkan salah" });
        triggerShake("general");
        return;
      }

      // Role check: ensure the user has the admin role in app_metadata or user_metadata
      const role =
        data?.user?.app_metadata?.role || data?.user?.user_metadata?.role;
      if (role !== "admin") {
        await supabase.auth.signOut();
        clearTimeout(timeoutId);
        inFlightRef.current = false;
        setIsLoading(false);
        setErrors({ general: "Akun ini tidak memiliki akses admin" });
        triggerShake("general");
        return;
      }

      clearTimeout(timeoutId);
      // Replace history entry so the back button doesn't return to a stale form.
      router.replace("/admin/dashboard");
      router.refresh();
      // isLoading stays true through navigation; the new page will mount and unmount this one.
    } catch (err) {
      clearTimeout(timeoutId);
      inFlightRef.current = false;
      setIsLoading(false);
      console.error("Login error:", err);
      setErrors({ general: "Terjadi kesalahan saat masuk. Silakan coba lagi." });
      triggerShake("general");
    }
  };

  return (
    <div className={styles.loginPage}>
      {/* Left Column - Visual Branding */}
      <div className={styles.leftColumn}>
        {/* Decorative Elements */}
        <div className={styles.decorativeCircle1} />
        <div className={styles.decorativeCircle2} />
        <div className={styles.decorativeCircle3} />
        <div className={styles.decorativeLines} />

        {/* Branding Content */}
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
            Membangun Indonesia melalui kegiatan relawan
          </p>

          <div className={styles.divider} />

          <div className={styles.features}>
            <div className={styles.featureItem}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Kelola program relawan dengan mudah</span>
            </div>
            <div className={styles.featureItem}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Pantau pendaftaran & data relawan</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className={styles.rightColumn}>
        <div className={styles.formContainer}>
          <div className={styles.formHeader}>
            <p className={styles.greeting}>Selamat datang Admin!</p>
            <h2 className={styles.formTitle}>Masuk ke Dashboard</h2>
            <p className={styles.formSubtitle}>
              Masukkan kredensial anda untuk melanjutkan
            </p>
          </div>

          <form onSubmit={handleSubmit} className={styles.loginForm} noValidate>
            {/* General Error */}
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

            {/* Email Field */}
            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.inputLabel}>
                Email address
              </label>
              <input
                id="email"
                type="email"
                className={`${styles.inputField} ${errors.email ? styles.inputError : ""} ${shakeField === "email" ? styles.shake : ""}`}
                placeholder="Masukkan email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: "" });
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

            {/* Password Field */}
            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.inputLabel}>
                Password
              </label>
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

            {/* Submit Button */}
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
            Hanya untuk akun yang sudah terdaftar
          </p>
        </div>
      </div>
    </div>
  );
}
