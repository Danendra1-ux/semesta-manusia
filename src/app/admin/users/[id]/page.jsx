"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import AdminSidebar from "../../components/AdminSidebar.jsx";
import { useSidebar } from "../../components/SidebarContext";
import styles from "./page.module.css";

const STATUS_LABELS = {
  pending: "Menunggu",
  verified: "Diterima",
  rejected: "Ditolak",
  approved: "Diterima",
};

export default function AdminUserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params?.id;
  const { isCollapsed } = useSidebar();

  const [user, setUser] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toast, setToast] = useState(null);

  // Editable fields
  const [isActive, setIsActive] = useState(true);
  const [name, setName] = useState("");
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`/api/admin/users/${userId}`, { cache: "no-store" });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setToast({ type: "error", message: data.error || "Gagal memuat data." });
          setLoading(false);
          return;
        }
        setUser(data.user);
        setRegistrations(data.registrations || []);
        setIsActive(Boolean(data.user.is_active));
        setName(data.user.name || "");
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setToast({ type: "error", message: "Gagal memuat data." });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [userId]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const initials = useMemo(() => {
    if (!user) return "";
    if (user.name) {
      const parts = user.name.trim().split(/\s+/);
      if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return (user.email || "?").substring(0, 2).toUpperCase();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          is_active: isActive,
          name: name.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setToast({ type: "error", message: data.error || "Gagal menyimpan." });
      } else {
        setUser(data.user);
        setDirty(false);
        setToast({ type: "success", message: "Perubahan tersimpan." });
      }
    } catch (err) {
      setToast({ type: "error", message: "Gagal menyimpan." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setToast({ type: "error", message: data.error || "Gagal menghapus." });
        setDeleting(false);
        return;
      }
      setToast({ type: "success", message: "Pengguna dihapus." });
      setTimeout(() => router.push("/admin/users"), 800);
    } catch (err) {
      setToast({ type: "error", message: "Gagal menghapus." });
      setDeleting(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatDateTime = (d) => {
    if (!d) return "-";
    return new Date(d).toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className={styles.pageWrapper}>
        <AdminSidebar />
        <main
          className={styles.main}
          style={isCollapsed ? { marginLeft: "5rem" } : undefined}
        >
          <div className={styles.loadingState}>
            <div className={styles.spinner} />
            <p>Memuat data pengguna...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.pageWrapper}>
        <AdminSidebar />
        <main
          className={styles.main}
          style={isCollapsed ? { marginLeft: "5rem" } : undefined}
        >
          <Link href="/admin/users" className={styles.backLink}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Kembali ke daftar
          </Link>
          <div className={styles.loadingState}>
            <p>Pengguna tidak ditemukan.</p>
          </div>
        </main>
      </div>
    );
  }

  const regStatusClass = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "pending" || s === "menunggu") return styles.regStatusPending;
    if (s === "verified" || s === "approved" || s === "diterima") return styles.regStatusVerified;
    if (s === "rejected" || s === "ditolak") return styles.regStatusRejected;
    return styles.regStatusDefault;
  };

  return (
    <div className={styles.pageWrapper}>
      <AdminSidebar />
      <main
        className={styles.main}
        style={isCollapsed ? { marginLeft: "5rem" } : undefined}
      >
        <Link href="/admin/users" className={styles.backLink}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Kembali ke daftar
        </Link>

        <div className={styles.headerCard}>
          <div className={styles.bigAvatar}>
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.name} />
            ) : (
              initials
            )}
          </div>
          <div className={styles.headerInfo}>
            <h1>{user.name || "(Tanpa Nama)"}</h1>
            <p>{user.email}</p>
            <div className={styles.headerBadges}>
              <span className={styles.headerBadge}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Pengguna
              </span>
              <span className={styles.headerBadge}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {user.is_active ? (
                    <polyline points="20 6 9 17 4 12" />
                  ) : (
                    <>
                      <circle cx="12" cy="12" r="10" />
                      <line x1="15" y1="9" x2="9" y2="15" />
                      <line x1="9" y1="9" x2="15" y2="15" />
                    </>
                  )}
                </svg>
                {user.is_active ? "Aktif" : "Nonaktif"}
              </span>
            </div>
          </div>
          <div className={styles.headerActions}>
            <button
              className={`${styles.headerBtn} ${styles.headerBtnDanger}`}
              onClick={() => setShowDeleteModal(true)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
              </svg>
              Hapus
            </button>
          </div>
        </div>

        <div className={styles.detailGrid}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Profil
            </h3>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>ID</span>
              <span className={styles.fieldValueMono}>{user.id}</span>
            </div>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Email</span>
              <span className={styles.fieldValue}>{user.email}</span>
            </div>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>WhatsApp</span>
              <span className={styles.fieldValue}>{user.whatsapp || "-"}</span>
            </div>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Instagram</span>
              <span className={styles.fieldValue}>
                {user.instagram ? `@${user.instagram}` : "-"}
              </span>
            </div>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Tgl Lahir</span>
              <span className={styles.fieldValue}>{formatDate(user.birth_date)}</span>
            </div>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Domisili</span>
              <span className={styles.fieldValue}>{user.region || "-"}</span>
            </div>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Institusi</span>
              <span className={styles.fieldValue}>{user.institution || "-"}</span>
            </div>
          </div>

          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
              </svg>
              Pengaturan Akun
            </h3>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Nama</label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setDirty(true);
                }}
                className={styles.formInput}
                placeholder="Nama lengkap"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Status Akun</label>
              <select
                value={isActive ? "true" : "false"}
                onChange={(e) => {
                  setIsActive(e.target.value === "true");
                  setDirty(true);
                }}
                className={styles.formSelect}
              >
                <option value="true">Aktif</option>
                <option value="false">Nonaktif</option>
              </select>
            </div>
            <div className={styles.formActions}>
              <button
                className={styles.btnPrimary}
                disabled={!dirty || saving}
                onClick={handleSave}
              >
                {saving ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
              <button
                className={styles.btnSecondary}
                disabled={!dirty || saving}
                onClick={() => {
                  setIsActive(Boolean(user.is_active));
                  setName(user.name || "");
                  setDirty(false);
                }}
              >
                Reset
              </button>
            </div>
            <div style={{ marginTop: "1rem" }}>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Bergabung</span>
                <span className={styles.fieldValue}>{formatDate(user.created_at)}</span>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Login Terakhir</span>
                <span className={styles.fieldValue}>{formatDateTime(user.last_login_at)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.registrationsCard}>
          <h3 className={styles.cardTitle}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Riwayat Pendaftaran ({registrations.length})
          </h3>
          {registrations.length === 0 ? (
            <div className={styles.emptyReg}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              </svg>
              <p>Pengguna ini belum pernah mendaftar.</p>
            </div>
          ) : (
            <div className={styles.registrationsList}>
              {registrations.map((reg) => (
                <div key={reg.id} className={styles.regItem}>
                  <div className={styles.regItemInfo}>
                    <p className={styles.regItemTitle}>
                      {reg.programs?.title || "Program tidak tersedia"}
                    </p>
                    <div className={styles.regItemMeta}>
                      {reg.registration_code && (
                        <span>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 12, height: 12 }}>
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          {reg.registration_code}
                        </span>
                      )}
                      <span>
                        Daftar {formatDate(reg.created_at)}
                      </span>
                      {reg.programs?.start_date && (
                        <span>
                          Mulai {formatDate(reg.programs.start_date)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={styles.regItemActions}>
                    <span className={`${styles.regStatus} ${regStatusClass(reg.status)}`}>
                      {STATUS_LABELS[(reg.status || "").toLowerCase()] || reg.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {toast && (
          <div className={`${styles.toast} ${toast.type === "success" ? styles.toastSuccess : styles.toastError}`}>
            {toast.message}
          </div>
        )}

        {showDeleteModal && (
          <div className={styles.modalOverlay} onClick={() => !deleting && setShowDeleteModal(false)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <h3>Hapus Pengguna?</h3>
              <p>
                Tindakan ini tidak dapat dibatalkan. Akun <strong>{user.name || user.email}</strong> akan dihapus permanen
                dari sistem, termasuk akses login dan semua datanya.
              </p>
              <div className={styles.modalActions}>
                <button
                  className={styles.btnSecondary}
                  disabled={deleting}
                  onClick={() => setShowDeleteModal(false)}
                >
                  Batal
                </button>
                <button
                  className={styles.btnDanger}
                  disabled={deleting}
                  onClick={handleDelete}
                >
                  {deleting ? "Menghapus..." : "Ya, Hapus"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}