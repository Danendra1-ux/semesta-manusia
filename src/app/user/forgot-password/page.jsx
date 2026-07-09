"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg("Masukkan email yang valid.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/request-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        setErrorMsg("Gagal mengirim permintaan. Coba lagi nanti.");
        return;
      }

      setSent(true);
    } catch {
      setErrorMsg("Tidak dapat menghubungi server. Periksa koneksi kamu.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* Left Column */}
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
            Kami akan membantu kamu mengatur ulang password
          </p>

          <div className={styles.divider} />

          <div className={styles.features}>
            <div className={styles.featureItem}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Cek inbox email kamu untuk tautan reset</span>
            </div>
            <div className={styles.featureItem}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Tautan berlaku selama 1 jam</span>
            </div>
            <div className={styles.featureItem}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Bisa kirim ulang jika belum terima email</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className={styles.rightColumn}>
        <div className={styles.formContainer}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>Lupa Password</h2>
            <p className={styles.formSubtitle}>
              {sent
                ? "Cek email kamu sekarang!"
                : "Masukkan email akun kamu dan kami akan mengirimkan tautan untuk mengatur ulang password."}
            </p>
          </div>

          {!sent ? (
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
                <label htmlFor="email" className={styles.inputLabel}>
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  className={styles.inputField}
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  autoFocus
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
                    <span>Mengirim...</span>
                  </>
                ) : (
                  <>
                    <span>Kirim tautan reset</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className={styles.sentContent}>
              <div className={styles.successIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <p className={styles.sentMessage}>
                Kami sudah mengirim tautan reset password ke{" "}
                <strong>{email}</strong>
              </p>
              <p className={styles.sentSubtext}>
                Cek inbox (atau folder spam) kamu. Tautan berlaku selama 1 jam.
              </p>
            </div>
          )}

          <p className={styles.footer}>
            Ingat password kamu?
            <Link href="/user/login">Masuk</Link>
          </p>
        </div>
      </div>
    </div>
  );
}