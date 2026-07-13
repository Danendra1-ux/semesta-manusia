"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabaseClient";
import styles from "./page.module.css";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect") || "/user/program";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
    instagram: "",
    birth_date: "",
    region: "",
    institution: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [shakeField, setShakeField] = useState(null);
  const [success, setSuccess] = useState(null);
  const [emailTakenToast, setEmailTakenToast] = useState(null);
  const inFlightRef = useRef(false);

  const update = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
    if (key === "email" && emailTakenToast) {
      setEmailTakenToast(null);
    }
  };

  useEffect(() => {
    if (!emailTakenToast) return undefined;
    const id = setTimeout(() => setEmailTakenToast(null), 6000);
    return () => clearTimeout(id);
  }, [emailTakenToast]);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Nama wajib diisi";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Nama minimal 2 karakter";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email wajib diisi";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Format email tidak valid";
    }
    if (!formData.password) {
      newErrors.password = "Password wajib diisi";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password minimal 8 karakter";
    } else if (formData.password.length > 72) {
      newErrors.password = "Password terlalu panjang (maks 72 karakter)";
    } else if (!/[a-zA-Z]/.test(formData.password) || !/\d/.test(formData.password)) {
      newErrors.password = "Password harus mengandung huruf dan angka";
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
      triggerShake(Object.keys(validationErrors)[0]);
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
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          whatsapp: formData.whatsapp.trim(),
          instagram: formData.instagram.trim().replace(/^@/, ""),
          birth_date: formData.birth_date,
          region: formData.region.trim(),
          institution: formData.institution.trim(),
        }),
      });

      const data = await res.json();
      clearTimeout(timeoutId);
      inFlightRef.current = false;
      setIsLoading(false);

      if (!res.ok) {
        let msg = data?.error || "Pendaftaran gagal. Silakan coba lagi.";
        const isEmailTaken = data?.code === "email_taken";
        if (isEmailTaken) {
          msg = "Email sudah terdaftar. Silakan masuk atau gunakan email lain.";
          setEmailTakenToast({
            email: formData.email.trim(),
            id: Date.now(),
          });
        }
        setErrors({ general: msg });
        triggerShake("general");
        return;
      }

      if (!data.requiresConfirmation) {
        try {
          const supabase = createSupabaseClient();
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: formData.email.trim(),
            password: formData.password,
          });
          if (signInError) {
            router.replace(`/user/login?redirect=${encodeURIComponent(redirectParam)}`);
            return;
          }
        } catch {
          router.replace(`/user/login?redirect=${encodeURIComponent(redirectParam)}`);
          return;
        }
      }

      setSuccess({
        requiresConfirmation: data.requiresConfirmation,
        email: formData.email.trim(),
      });
    } catch (err) {
      clearTimeout(timeoutId);
      inFlightRef.current = false;
      setIsLoading(false);
      console.error("Signup error:", err);
      setErrors({ general: "Terjadi kesalahan. Periksa koneksi Anda lalu coba lagi." });
      triggerShake("general");
    }
  };

  const handleSuccessAction = () => {
    if (success?.requiresConfirmation) {
      router.replace(`/user/login?redirect=${encodeURIComponent(redirectParam)}`);
    } else {
      const safeRedirect = redirectParam.startsWith("/") ? redirectParam : "/user/program";
      router.replace(safeRedirect);
      router.refresh();
    }
  };

  return (
    <div className={styles.signupPage}>
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
            Buat akunmu dan mulai jadi bagian dari perubahan untuk Indonesia
          </p>

          <div className={styles.divider} />

          <div className={styles.features}>
            <div className={styles.featureItem}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Akses lengkap ke semua program relawan</span>
            </div>
            <div className={styles.featureItem}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Simpan progress dan datamu di akun pribadi</span>
            </div>
            <div className={styles.featureItem}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Gratis, cepat, dan terhubung langsung dengan tim kami</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.rightColumn}>
        <div className={styles.formContainer}>
          <div className={styles.formHeader}>
            <p className={styles.greeting}>Bergabung Sekarang!</p>
            <h2 className={styles.formTitle}>Buat Akun Relawan</h2>
            <p className={styles.formSubtitle}>
              Isi data dirimu di bawah untuk mulai mendaftar relawan
            </p>
          </div>

          <form onSubmit={handleSubmit} className={styles.signupForm} noValidate>
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

            <h3 className={styles.sectionLabel}>Akun</h3>

            <div className={styles.inputGroup}>
              <label htmlFor="name" className={styles.inputLabel}>
                Nama Lengkap
              </label>
              <input
                id="name"
                type="text"
                className={`${styles.inputField} ${errors.name ? styles.inputError : ""} ${shakeField === "name" ? styles.shake : ""}`}
                placeholder="Cth. Ahmad Fauzi"
                value={formData.name}
                onChange={(e) => update("name", e.target.value)}
                autoComplete="name"
              />
              {errors.name && (
                <p className={styles.fieldError}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {errors.name}
                </p>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="signup-email" className={styles.inputLabel}>
                Email
              </label>
              <input
                id="signup-email"
                type="email"
                className={`${styles.inputField} ${errors.email ? styles.inputError : ""} ${shakeField === "email" ? styles.shake : ""}`}
                placeholder="nama@email.com"
                value={formData.email}
                onChange={(e) => update("email", e.target.value)}
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
              <label htmlFor="signup-password" className={styles.inputLabel}>
                Password
              </label>
              <div className={styles.passwordWrapper}>
                <input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  className={`${styles.inputField} ${errors.password ? styles.inputError : ""} ${shakeField === "password" ? styles.shake : ""}`}
                  placeholder="Min. 8 karakter, gabungan huruf & angka"
                  value={formData.password}
                  onChange={(e) => update("password", e.target.value)}
                  autoComplete="new-password"
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

            <h3 className={styles.sectionLabel}>Data Diri <span className={styles.optionalHint}>(opsional, bisa diisi nanti)</span></h3>

            <div className={styles.row}>
              <div className={styles.inputGroup}>
                <label htmlFor="whatsapp" className={styles.inputLabel}>
                  WhatsApp
                </label>
                <input
                  id="whatsapp"
                  type="tel"
                  className={styles.inputField}
                  placeholder="08xxxxxxxxxx"
                  value={formData.whatsapp}
                  onChange={(e) => update("whatsapp", e.target.value)}
                  autoComplete="tel"
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="instagram" className={styles.inputLabel}>
                  Instagram
                </label>
                <input
                  id="instagram"
                  type="text"
                  className={styles.inputField}
                  placeholder="@username"
                  value={formData.instagram}
                  onChange={(e) => update("instagram", e.target.value)}
                  autoComplete="off"
                />
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.inputGroup}>
                <label htmlFor="birth_date" className={styles.inputLabel}>
                  Tanggal Lahir
                </label>
                <input
                  id="birth_date"
                  type="date"
                  className={styles.inputField}
                  value={formData.birth_date}
                  onChange={(e) => update("birth_date", e.target.value)}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="region" className={styles.inputLabel}>
                  Domisili
                </label>
                <input
                  id="region"
                  type="text"
                  className={styles.inputField}
                  placeholder="Cth. Bandung, Jawa Barat"
                  value={formData.region}
                  onChange={(e) => update("region", e.target.value)}
                  autoComplete="address-level2"
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="institution" className={styles.inputLabel}>
                Institusi / Asal
              </label>
              <input
                id="institution"
                type="text"
                className={styles.inputField}
                placeholder="Cth. Universitas Indonesia"
                value={formData.institution}
                onChange={(e) => update("institution", e.target.value)}
                autoComplete="organization"
              />
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className={styles.spinner} />
                  <span>Mendaftar...</span>
                </>
              ) : (
                <>
                  <span>Buat Akun</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <p className={styles.formFooter}>
            Sudah punya akun?
            <Link href={`/user/login${redirectParam !== "/user/program" ? `?redirect=${encodeURIComponent(redirectParam)}` : ""}`}>Masuk</Link>
          </p>
        </div>
      </div>

      {emailTakenToast && (
        <div
          className={styles.emailTakenToast}
          role="status"
          aria-live="polite"
        >
          <div className={styles.emailTakenToastIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div className={styles.emailTakenToastBody}>
            <p className={styles.emailTakenToastTitle}>Email sudah terdaftar</p>
            <p className={styles.emailTakenToastDescription}>
              {emailTakenToast.email} sudah dipakai. Silakan{" "}
              <Link href="/user/login">masuk</Link> atau gunakan email lain.
            </p>
          </div>
          <button
            type="button"
            className={styles.emailTakenToastClose}
            onClick={() => setEmailTakenToast(null)}
            aria-label="Tutup notifikasi"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {success && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalDialog}>
            <div className={styles.modalIconWrap}>
              <svg className={styles.modalIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 className={styles.modalTitle}>
              {success.requiresConfirmation ? "Cek Email Kamu" : "Selamat Datang!"}
            </h3>
            <p className={styles.modalDescription}>
              {success.requiresConfirmation ? (
                <>
                  Kami telah mengirim link konfirmasi ke <strong>{success.email}</strong>. Buka inbox kamu untuk mengaktifkan akun.
                </>
              ) : (
                <>
                  Akunmu berhasil dibuat. Mulai eksplorasi program relawan dan daftarkan dirimu.
                </>
              )}
            </p>
            <button className={styles.modalButton} onClick={handleSuccessAction}>
              {success.requiresConfirmation ? "Lanjut ke Halaman Masuk" : "Mulai Sekarang"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function UserSignupPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh" }} />}>
      <SignupForm />
    </Suspense>
  );
}