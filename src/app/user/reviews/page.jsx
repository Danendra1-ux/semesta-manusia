"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createSupabaseClient } from "@/lib/supabaseClient";
import styles from "./page.module.css";

const RATING_LABELS = {
  1: "Sangat Buruk",
  2: "Buruk",
  3: "Cukup",
  4: "Bagus",
  5: "Luar Biasa",
};

export default function UserReviewsPage() {
  const router = useRouter();
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState(null);
  const toastTimeoutRef = useRef(null);

  // Form state
  const [form, setForm] = useState({
    name: "",
    program_title: "",
    rating: 0,
    content: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const inFlightRef = useRef(false);

  // Program options + history
  const [programs, setPrograms] = useState([]);
  const [programsLoading, setProgramsLoading] = useState(true);
  const [myReviews, setMyReviews] = useState([]);
  const [myReviewsLoading, setMyReviewsLoading] = useState(true);

  const showToast = (message, isError = false) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ message, isError });
    toastTimeoutRef.current = setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      const supabase = createSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/user/login?redirect=/user/reviews");
        return;
      }

      try {
        const [meRes, progsRes, reviewsRes] = await Promise.all([
          fetch("/api/users/me", { cache: "no-store" }),
          fetch("/api/programs?is_active=true", { cache: "no-store" }),
          fetch("/api/users/me/reviews", { cache: "no-store" }),
        ]);

        if (cancelled) return;

        if (meRes.ok) {
          const meData = await meRes.json();
          setUser(meData.user);
          setForm((prev) => ({
            ...prev,
            name: meData.user?.name || "",
          }));
        } else {
          showToast("Gagal memuat profil", true);
        }

        if (progsRes.ok) {
          const progs = await progsRes.json();
          setPrograms(Array.isArray(progs) ? progs : []);
        }

        if (reviewsRes.ok) {
          const revData = await reviewsRes.json();
          setMyReviews(revData.reviews || []);
        }
      } catch (err) {
        console.error("Reviews page load error:", err);
        if (!cancelled) showToast("Gagal memuat halaman ulasan", true);
      } finally {
        if (!cancelled) {
          setAuthLoading(false);
          setProgramsLoading(false);
          setMyReviewsLoading(false);
        }
      }
    };
    init();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const validate = () => {
    const next = {};
    if (!form.name || form.name.trim().length < 2) {
      next.name = "Nama minimal 2 karakter.";
    }
    if (!form.program_title) {
      next.program_title = "Pilih program yang ingin diulas.";
    }
    if (!form.rating || form.rating < 1 || form.rating > 5) {
      next.rating = "Pilih rating 1 sampai 5 bintang.";
    }
    const trimmedContent = form.content.trim();
    if (trimmedContent.length < 10) {
      next.content = "Ulasan minimal 10 karakter.";
    } else if (trimmedContent.length > 2000) {
      next.content = "Ulasan maksimal 2000 karakter.";
    }
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (inFlightRef.current) return;

    const v = validate();
    if (Object.keys(v).length > 0) {
      setErrors(v);
      return;
    }

    inFlightRef.current = true;
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          program_title: form.program_title,
          rating: form.rating,
          content: form.content.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data?.error || "Gagal mengirim ulasan", true);
        return;
      }
      showToast("Ulasan berhasil dikirim! Menunggu moderasi admin. ✨");
      setForm((prev) => ({
        ...prev,
        program_title: "",
        rating: 0,
        content: "",
      }));
      // Refresh history
      const historyRes = await fetch("/api/users/me/reviews", {
        cache: "no-store",
      });
      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setMyReviews(historyData.reviews || []);
      }
    } catch (err) {
      console.error("Submit review error:", err);
      showToast("Gagal mengirim ulasan. Coba lagi.", true);
    } finally {
      setSubmitting(false);
      inFlightRef.current = false;
    }
  };

  if (authLoading) {
    return (
      <div className={styles.loadingWrapper}>
        <div className={styles.loadingSpinner} />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const formatDate = (iso) => {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return "";
    }
  };

  return (
    <div className={styles.page}>
      <Navbar />

      <div className={styles.animatedBg}>
        <div className={styles.gradientOrb1} />
        <div className={styles.gradientOrb2} />
        <div className={styles.gradientOrb3} />
      </div>

      <div className={styles.container}>
        <header className={styles.pageHeader}>
          <div className={styles.headerBadge}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            Ulasanmu
          </div>
          <h1 className={styles.pageTitle}>Bagikan Pengalaman Relawanmu</h1>
          <p className={styles.pageSubtitle}>
            Ceritakan bagaimana pengalamanmu mengikuti program Semesta. Ulasanmu
            akan membantu calon relawan lain dan ditinjau admin sebelum
            ditampilkan di landing page.
          </p>
        </header>

        <div className={styles.formCard}>
          <form onSubmit={handleSubmit} noValidate>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="review-name">
                Nama <span className={styles.required}>*</span>
              </label>
              <input
                id="review-name"
                type="text"
                className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
                placeholder="Nama lengkapmu"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                maxLength={120}
              />
              {errors.name && (
                <p className={styles.errorText}>{errors.name}</p>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="review-program">
                Program <span className={styles.required}>*</span>
              </label>
              <select
                id="review-program"
                className={`${styles.select} ${errors.program_title ? styles.inputError : ""}`}
                value={form.program_title}
                onChange={(e) => handleChange("program_title", e.target.value)}
                disabled={programsLoading}
              >
                <option value="">
                  {programsLoading
                    ? "Memuat program..."
                    : programs.length === 0
                      ? "Belum ada program tersedia"
                      : "Pilih program yang diulas"}
                </option>
                {programs.map((p) => (
                  <option key={p.id} value={p.title}>
                    {p.title}
                  </option>
                ))}
              </select>
              {errors.program_title && (
                <p className={styles.errorText}>{errors.program_title}</p>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Rating <span className={styles.required}>*</span>
              </label>
              <div className={styles.ratingRow}>
                <div className={styles.stars}>
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = form.rating >= star;
                    return (
                      <button
                        key={star}
                        type="button"
                        className={`${styles.starButton} ${active ? styles.starActive : ""}`}
                        onClick={() => handleChange("rating", star)}
                        onMouseEnter={(e) => {
                          e.currentTarget.dataset.hover = star;
                        }}
                        aria-label={`Rating ${star} dari 5`}
                      >
                        <svg viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      </button>
                    );
                  })}
                </div>
                <span className={styles.ratingHint}>
                  {form.rating ? RATING_LABELS[form.rating] : "Pilih bintang"}
                </span>
              </div>
              {errors.rating && (
                <p className={styles.errorText}>{errors.rating}</p>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="review-content">
                Ulasan <span className={styles.required}>*</span>
              </label>
              <textarea
                id="review-content"
                rows={5}
                className={`${styles.textarea} ${errors.content ? styles.inputError : ""}`}
                placeholder="Bagaimana pengalamanmu? Ceritakan momen berkesan, pelajaran yang didapat, atau kesan selama mengikuti program."
                value={form.content}
                onChange={(e) => handleChange("content", e.target.value)}
                maxLength={2000}
              />
              <div className={styles.charCounter}>
                {form.content.trim().length} / 2000 karakter
              </div>
              {errors.content && (
                <p className={styles.errorText}>{errors.content}</p>
              )}
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={submitting}
            >
              {submitting ? "Mengirim..." : "Kirim Ulasan"}
            </button>
          </form>
        </div>

        <section className={styles.historySection}>
          <h2 className={styles.historyTitle}>Ulasan yang Pernah Kamu Kirim</h2>
          {myReviewsLoading ? (
            <div className={styles.historySkeleton}>
              {[1, 2].map((i) => (
                <div key={i} className={styles.skeletonCard} />
              ))}
            </div>
          ) : myReviews.length === 0 ? (
            <div className={styles.historyEmpty}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <p>Belum ada ulasan yang kamu kirim. Yuk bagikan pengalamanmu!</p>
            </div>
          ) : (
            <div className={styles.historyGrid}>
              {myReviews.map((r) => (
                <div key={r.id} className={styles.historyCard}>
                  <div className={styles.historyCardHeader}>
                    <div>
                      <div className={styles.historyProgram}>{r.program_title}</div>
                      <div className={styles.historyDate}>{formatDate(r.created_at)}</div>
                    </div>
                    <span
                      className={`${styles.statusBadge} ${r.is_published ? styles.statusPublished : styles.statusPending}`}
                    >
                      {r.is_published ? "Ditampilkan" : "Menunggu Moderasi"}
                    </span>
                  </div>
                  <div className={styles.historyStars}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <svg
                        key={s}
                        viewBox="0 0 24 24"
                        fill={r.rating >= s ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth="2"
                        className={styles.historyStar}
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ))}
                  </div>
                  <p className={styles.historyContent}>{r.content}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <Footer />

      {toast && (
        <div
          className={`${styles.toast} ${toast.isError ? styles.toastError : styles.toastSuccess}`}
          role="status"
          aria-live="polite"
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}