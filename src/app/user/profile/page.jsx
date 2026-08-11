"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createSupabaseClient } from "@/lib/supabaseClient";
import styles from "./page.module.css";

const TABS = [
  { id: "personal", label: "Data Pribadi", icon: "user" },
  { id: "security", label: "Keamanan", icon: "lock" },
  { id: "programs", label: "Program Saya", icon: "list" },
];

export default function UserProfilePage() {
  const router = useRouter();
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("personal");
  const [toast, setToast] = useState(null);
  const toastTimeoutRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    whatsapp: "",
    instagram: "",
    birth_date: "",
    region: "",
    institution: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [savingPersonal, setSavingPersonal] = useState(false);

  const [pwdForm, setPwdForm] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [pwdErrors, setPwdErrors] = useState({});
  const [savingPwd, setSavingPwd] = useState(false);

  const [programs, setPrograms] = useState([]);
  const [programsLoading, setProgramsLoading] = useState(true);

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
        router.replace("/user/login?redirect=/user/profile");
        return;
      }

      try {
        const [profileRes, regsRes] = await Promise.all([
          fetch("/api/users/me", { cache: "no-store" }),
          fetch("/api/users/me/registrations", { cache: "no-store" }),
        ]);

        if (cancelled) return;

        const profileData = await profileRes.json();
        if (!profileRes.ok) {
          showToast(profileData?.error || "Gagal memuat profil", true);
          setAuthLoading(false);
          return;
        }
        setUser(profileData.user);
        setForm({
          name: profileData.user.name || "",
          whatsapp: profileData.user.whatsapp || "",
          instagram: profileData.user.instagram || "",
          birth_date: profileData.user.birth_date || "",
          region: profileData.user.region || "",
          institution: profileData.user.institution || "",
        });

        const regsData = await regsRes.json();
        if (regsRes.ok) {
          setPrograms(regsData.registrations || []);
        } else {
          console.error("Registrations load error:", regsData);
        }
      } catch (err) {
        console.error("Profile load error:", err);
        if (!cancelled) showToast("Gagal memuat profil", true);
      } finally {
        if (!cancelled) {
          setAuthLoading(false);
          setProgramsLoading(false);
        }
      }
    };
    init();
    return () => { cancelled = true; };
  }, [router]);

  const reloadPrograms = async () => {
    setProgramsLoading(true);
    try {
      const res = await fetch("/api/users/me/registrations", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        showToast(data?.error || "Gagal memuat program", true);
        setPrograms([]);
        return;
      }
      setPrograms(data.registrations || []);
    } catch (err) {
      console.error("Programs reload error:", err);
    } finally {
      setProgramsLoading(false);
    }
  };

  const handleFormChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (formErrors[key]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const validatePersonal = () => {
    const errs = {};
    if (!form.name.trim()) {
      errs.name = "Nama wajib diisi";
    } else if (form.name.trim().length < 2) {
      errs.name = "Nama minimal 2 karakter";
    }
    if (form.whatsapp && !/^\d+$/.test(form.whatsapp)) {
      errs.whatsapp = "Nomor WhatsApp hanya boleh berisi angka";
    } else if (form.whatsapp && form.whatsapp.length < 8) {
      errs.whatsapp = "Nomor WhatsApp minimal 8 digit";
    }
    return errs;
  };

  const handleSavePersonal = async (e) => {
    e.preventDefault();
    const errs = validatePersonal();
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }

    setSavingPersonal(true);
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          whatsapp: form.whatsapp.trim(),
          instagram: form.instagram.trim().replace(/^@/, ""),
          birth_date: form.birth_date || null,
          region: form.region.trim(),
          institution: form.institution.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data?.error || "Gagal menyimpan", true);
        return;
      }
      setUser((prev) => ({ ...prev, ...data.user }));
      showToast("Profil berhasil diperbarui");
    } catch (err) {
      console.error("Save profile error:", err);
      showToast("Gagal menyimpan profil", true);
    } finally {
      setSavingPersonal(false);
    }
  };

  const handlePwdChange = (key, value) => {
    setPwdForm((prev) => ({ ...prev, [key]: value }));
    if (pwdErrors[key]) {
      setPwdErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const validatePwd = () => {
    const errs = {};
    if (!pwdForm.current) errs.current = "Password saat ini wajib diisi";
    if (!pwdForm.new) {
      errs.new = "Password baru wajib diisi";
    } else if (pwdForm.new.length < 8) {
      errs.new = "Minimal 8 karakter";
    } else if (pwdForm.new.length > 72) {
      errs.new = "Maksimal 72 karakter";
    } else if (!/[a-zA-Z]/.test(pwdForm.new) || !/\d/.test(pwdForm.new)) {
      errs.new = "Harus ada huruf dan angka";
    }
    if (!pwdForm.confirm) {
      errs.confirm = "Konfirmasi password wajib diisi";
    } else if (pwdForm.new !== pwdForm.confirm) {
      errs.confirm = "Password tidak sama";
    }
    if (pwdForm.current && pwdForm.new && pwdForm.current === pwdForm.new) {
      errs.new = "Password baru harus berbeda dari yang lama";
    }
    return errs;
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const errs = validatePwd();
    if (Object.keys(errs).length > 0) {
      setPwdErrors(errs);
      return;
    }

    setSavingPwd(true);
    try {
      const res = await fetch("/api/users/me/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current: pwdForm.current,
          new: pwdForm.new,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data?.error || "Gagal mengubah password", true);
        return;
      }
      setPwdForm({ current: "", new: "", confirm: "" });
      showToast("Password berhasil diubah");
    } catch (err) {
      console.error("Change password error:", err);
      showToast("Gagal mengubah password", true);
    } finally {
      setSavingPwd(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  const statusBadgeClass = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "pending" || s === "menunggu") return styles.statusPending;
    if (s === "verified" || s === "diterima" || s === "approved") return styles.statusVerified;
    if (s === "rejected" || s === "ditolak") return styles.statusRejected;
    return styles.statusDefault;
  };

  const fundingTypeBadge = (p) => {
    if (p.program_category === "Semesta Camp") return { label: "—", cls: styles.typeNeutral };
    const code = (p.funding_type_code || "").toLowerCase();
    if (code === "fully") return { label: p.funding_type_label || "Fully Funded", cls: styles.typeFully };
    if (code === "self") return { label: p.funding_type_label || "Self Funded", cls: styles.typeSelf };
    return { label: p.funding_type_label || "—", cls: styles.typeNeutral };
  };

  if (authLoading) {
    return (
      <div className={styles.page}>
        <Navbar />
        <div className={styles.loadingWrapper}>
          <div className={styles.loadingSpinner} />
          <p>Memuat profil...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const stats = {
    total: programs.length,
    verified: programs.filter((p) => ["verified", "diterima", "approved"].includes((p.status || "").toLowerCase())).length,
    pending: programs.filter((p) => ["pending", "menunggu"].includes((p.status || "").toLowerCase())).length,
    rejected: programs.filter((p) => ["rejected", "ditolak"].includes((p.status || "").toLowerCase())).length,
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
        {/* Header Card */}
        <div className={styles.headerCard}>
          <div className={styles.headerContent}>
            <div className={styles.avatarLarge}>
              {getInitials(user.name)}
            </div>
            <div className={styles.headerInfo}>
              <h1>{user.name || "Relawan"}</h1>
              <p className={styles.headerEmail}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                {user.email}
              </p>
              <span className={styles.headerBadge}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Relawan Aktif
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
              </svg>
            </div>
            <div className={styles.statInfo}>
              <div className={styles.statValue}>{stats.total}</div>
              <div className={styles.statLabel}>Total Program</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: "rgba(245, 158, 11, 0.1)", color: "#f59e0b" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div className={styles.statInfo}>
              <div className={styles.statValue}>{stats.pending}</div>
              <div className={styles.statLabel}>Menunggu</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div className={styles.statInfo}>
              <div className={styles.statValue}>{stats.verified}</div>
              <div className={styles.statLabel}>Diterima</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <div className={styles.statInfo}>
              <div className={styles.statValue}>{stats.rejected}</div>
              <div className={styles.statLabel}>Ditolak</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.tabsBar}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`${styles.tabButton} ${activeTab === tab.id ? styles.tabButtonActive : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon === "user" && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              )}
              {tab.icon === "lock" && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
              )}
              {tab.icon === "list" && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="8" y1="6" x2="21" y2="6" />
                  <line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3.01" y2="6" />
                  <line x1="3" y1="12" x2="3.01" y2="12" />
                  <line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
              )}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Personal tab */}
        {activeTab === "personal" && (
          <div className={styles.tabContent}>
            <div className={styles.tabHeader}>
              <h2 className={styles.tabTitle}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Data Pribadi
              </h2>
            </div>

            <form onSubmit={handleSavePersonal} className={styles.formSection}>
              <div className={styles.formGroup}>
                <label htmlFor="email-readonly" className={styles.formLabel}>
                  Email
                </label>
                <input
                  id="email-readonly"
                  type="email"
                  className={styles.formInput}
                  value={user.email}
                  disabled
                />
                <p className={styles.fieldHint}>
                  Email tidak dapat diubah. Hubungi admin jika perlu mengganti email.
                </p>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="name" className={styles.formLabel}>
                  Nama Lengkap <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  className={`${styles.formInput} ${formErrors.name ? styles.formInputError : ""}`}
                  placeholder="Nama lengkapmu"
                  value={form.name}
                  onChange={(e) => handleFormChange("name", e.target.value)}
                />
                {formErrors.name && <p className={styles.formError}>{formErrors.name}</p>}
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="whatsapp" className={styles.formLabel}>
                    WhatsApp <span className={styles.optionalHint}>(opsional)</span>
                  </label>
                  <input
                    id="whatsapp"
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className={`${styles.formInput} ${formErrors.whatsapp ? styles.formInputError : ""}`}
                    placeholder="08xxxxxxxxxx"
                    value={form.whatsapp}
                    onChange={(e) => {
                      const sanitized = e.target.value.replace(/\D/g, "");
                      handleFormChange("whatsapp", sanitized);
                    }}
                  />
                  {formErrors.whatsapp && <p className={styles.formError}>{formErrors.whatsapp}</p>}
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="instagram" className={styles.formLabel}>
                    Instagram <span className={styles.optionalHint}>(opsional)</span>
                  </label>
                  <input
                    id="instagram"
                    type="text"
                    className={styles.formInput}
                    placeholder="@username"
                    value={form.instagram}
                    onChange={(e) => handleFormChange("instagram", e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="birth_date" className={styles.formLabel}>
                    Tanggal Lahir <span className={styles.optionalHint}>(opsional)</span>
                  </label>
                  <input
                    id="birth_date"
                    type="date"
                    className={styles.formInput}
                    value={form.birth_date}
                    onChange={(e) => handleFormChange("birth_date", e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="region" className={styles.formLabel}>
                    Domisili <span className={styles.optionalHint}>(opsional)</span>
                  </label>
                  <input
                    id="region"
                    type="text"
                    className={styles.formInput}
                    placeholder="Cth. Bandung, Jawa Barat"
                    value={form.region}
                    onChange={(e) => handleFormChange("region", e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="institution" className={styles.formLabel}>
                  Institusi / Asal <span className={styles.optionalHint}>(opsional)</span>
                </label>
                <input
                  id="institution"
                  type="text"
                  className={styles.formInput}
                  placeholder="Cth. Universitas Indonesia"
                  value={form.institution}
                  onChange={(e) => handleFormChange("institution", e.target.value)}
                />
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => {
                    setForm({
                      name: user.name || "",
                      whatsapp: user.whatsapp || "",
                      instagram: user.instagram || "",
                      birth_date: user.birth_date || "",
                      region: user.region || "",
                      institution: user.institution || "",
                    });
                    setFormErrors({});
                  }}
                  disabled={savingPersonal}
                >
                  Reset
                </button>
                <button type="submit" className={styles.btnPrimary} disabled={savingPersonal}>
                  {savingPersonal ? (
                    <>
                      <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                        <polyline points="17 21 17 13 7 13 7 21" />
                        <polyline points="7 3 7 8 15 8" />
                      </svg>
                      <span>Simpan Perubahan</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Security tab */}
        {activeTab === "security" && (
          <div className={styles.tabContent}>
            <div className={styles.tabHeader}>
              <h2 className={styles.tabTitle}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                Keamanan Akun
              </h2>
            </div>

            <form onSubmit={handleChangePassword} className={styles.formSection}>
              <div className={styles.formGroup}>
                <label htmlFor="current-pwd" className={styles.formLabel}>
                  Password Saat Ini
                </label>
                <input
                  id="current-pwd"
                  type="password"
                  className={`${styles.formInput} ${pwdErrors.current ? styles.formInputError : ""}`}
                  placeholder="Masukkan password saat ini"
                  value={pwdForm.current}
                  onChange={(e) => handlePwdChange("current", e.target.value)}
                  autoComplete="current-password"
                />
                {pwdErrors.current && <p className={styles.formError}>{pwdErrors.current}</p>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="new-pwd" className={styles.formLabel}>
                  Password Baru
                </label>
                <input
                  id="new-pwd"
                  type="password"
                  className={`${styles.formInput} ${pwdErrors.new ? styles.formInputError : ""}`}
                  placeholder="Min. 8 karakter, gabungan huruf & angka"
                  value={pwdForm.new}
                  onChange={(e) => handlePwdChange("new", e.target.value)}
                  autoComplete="new-password"
                />
                {pwdErrors.new && <p className={styles.formError}>{pwdErrors.new}</p>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="confirm-pwd" className={styles.formLabel}>
                  Konfirmasi Password Baru
                </label>
                <input
                  id="confirm-pwd"
                  type="password"
                  className={`${styles.formInput} ${pwdErrors.confirm ? styles.formInputError : ""}`}
                  placeholder="Ulangi password baru"
                  value={pwdForm.confirm}
                  onChange={(e) => handlePwdChange("confirm", e.target.value)}
                  autoComplete="new-password"
                />
                {pwdErrors.confirm && <p className={styles.formError}>{pwdErrors.confirm}</p>}
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => {
                    setPwdForm({ current: "", new: "", confirm: "" });
                    setPwdErrors({});
                  }}
                  disabled={savingPwd}
                >
                  Reset
                </button>
                <button type="submit" className={styles.btnPrimary} disabled={savingPwd}>
                  {savingPwd ? (
                    <>
                      <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                      <span>Mengubah...</span>
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>Ubah Password</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Programs tab */}
        {activeTab === "programs" && (
          <div className={styles.tabContent}>
            <div className={styles.tabHeader}>
              <h2 className={styles.tabTitle}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="8" y1="6" x2="21" y2="6" />
                  <line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3.01" y2="6" />
                  <line x1="3" y1="12" x2="3.01" y2="12" />
                  <line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
                Program Saya
              </h2>
            </div>

            {programsLoading ? (
              <div className={styles.loadingWrapper} style={{ minHeight: "200px" }}>
                <div className={styles.loadingSpinner} />
                <p>Memuat program...</p>
              </div>
            ) : programs.length === 0 ? (
              <div className={styles.emptyState}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                </svg>
                <h3>Belum Ada Program</h3>
                <p>Kamu belum mendaftar relawan di program apapun.</p>
                <button
                  className={styles.btnPrimary}
                  onClick={() => router.push("/user/program")}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <line x1="12" y1="5" x2="12" y2="19" />
                  </svg>
                  <span>Jelajahi Program</span>
                </button>
              </div>
            ) : (
              <div className={styles.programList}>
                {programs.map((p) => {
                  const tipe = fundingTypeBadge(p);
                  return (
                  <div key={p.id} className={styles.programCard}>
                    <div className={styles.programCardInfo}>
                      <h3 className={styles.programCardTitle}>{p.title || p.program_title || "Program"}</h3>
                      <div className={styles.programCardMeta}>
                        <span className={`${styles.programTypeBadge} ${tipe.cls}`}>
                          {tipe.label}
                        </span>
                        {p.registered_at && (
                          <span>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                              <line x1="16" y1="2" x2="16" y2="6" />
                              <line x1="8" y1="2" x2="8" y2="6" />
                              <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                            Daftar {new Date(p.registered_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={`${styles.programStatusBadge} ${statusBadgeClass(p.status)}`}>
                      {p.status_label || p.status || "Unknown"}
                    </span>
                  </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {toast && (
        <div className={`${styles.toast} ${toast.isError ? styles.toastError : ""}`}>
          {toast.isError ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
          <span>{toast.message}</span>
        </div>
      )}

      <Footer />
    </div>
  );
}
