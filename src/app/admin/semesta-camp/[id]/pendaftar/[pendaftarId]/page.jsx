"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import AdminSidebar from "../../../../components/AdminSidebar.jsx";
import styles from "./page.module.css";

export default function PendaftarDetailPage({ params }) {
  const resolvedParams = use(params);
  const programId = resolvedParams.id;
  const pendaftarId = resolvedParams.pendaftarId ? parseInt(resolvedParams.pendaftarId) : null;
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // State untuk Data Pendaftar dari API
  const [pendaftar, setPendaftar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch Data Pendaftar
  useEffect(() => {
    if (!pendaftarId) {
      setLoading(false);
      return;
    }

    const fetchPendaftarDetail = async () => {
      try {
        // Asumsi struktur folder API Anda adalah /api/registrations/[id]/route.js
        const response = await fetch(`/api/registrations/${pendaftarId}`);
        if (!response.ok) throw new Error("Gagal mengambil data pendaftar");
        
        const data = await response.json();
        setPendaftar(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPendaftarDetail();
  }, [pendaftarId]);

  const getStatusBadgeClass = (status) => {
    if (status === "Diterima") return styles.badgeDiterima;
    if (status === "Ditolak") return styles.badgeDitolak;
    return styles.badgePending;
  };

  // Helper untuk memformat tanggal
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Helper untuk format ukuran file (Bytes ke KB)
  const formatFileSize = (bytes) => {
    if (!bytes) return "";
    return `${(bytes / 1024).toFixed(0)} KB`;
  };

  // Helper untuk me-mapping array file dari database
  const berkasList = (files) => {
    if (!files || !Array.isArray(files)) return [];
    
    const getFile = (key) => files.find(f => f.field_key === key);
    
    // Daftar file yang dicari (disesuaikan dengan form)
    return [
      { key: "instagramProof", label: "Bukti follow Instagram Semesta Manusia Indonesia (@semestamanusiaa)", file: getFile("instagramProof") },
      { key: "tiktokProof", label: "Bukti follow Tiktok Semesta Manusia Indonesia (@semestamanusia.indonesia)", file: getFile("tiktokProof") },
      { key: "storyProof", label: "Bukti upload Invitation Story ke Story Instagram", file: getFile("storyProof") }, // Hanya muncul jika ada (contoh: SJN)
      { key: "paymentProof", label: "Upload Bukti Pembayaran", file: getFile("paymentProof") },
    ].filter(item => item.file); // Hanya kembalikan file yang benar-benar di-upload
  };

  if (loading) {
    return (
      <div className={styles.pageLayout}>
        <AdminSidebar isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
        <main className={`${styles.mainContent} ${isSidebarCollapsed ? styles.expanded : ""}`}>
          <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>Memuat data pendaftar...</div>
        </main>
      </div>
    );
  }

  if (error || !pendaftar) {
    return (
      <div className={styles.pageLayout}>
        <AdminSidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
        <main className={`${styles.mainContent} ${isSidebarCollapsed ? styles.expanded : ""}`}>
          <div className={styles.notFound}>
            <h2>Pendaftar tidak ditemukan atau terjadi kesalahan</h2>
            {error && <p style={{ color: '#ef4444' }}>{error}</p>}
            <Link href={`/admin/semesta-camp/${programId}`} className={styles.backLinkError}>
              ← Kembali ke Daftar Pendaftar
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Dapatkan inisial untuk avatar (Contoh: "Budi Santoso" -> "BS")
  const avatarInitials = pendaftar.full_name
    ? pendaftar.full_name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "U";

  return (
    <div className={styles.pageLayout}>
      <AdminSidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <main className={`${styles.mainContent} ${isSidebarCollapsed ? styles.expanded : ""}`}>
        {/* Header */}
        <div className={styles.contentHeader}>
          <div className={styles.headerTop}>
            <Link href={`/admin/semesta-camp/${programId}`} className={styles.backButton}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </Link>
          </div>
          <div className={styles.headerText}>
            <div className={styles.headerTitleRow}>
              <h1 className={styles.pageTitle}>{pendaftar.full_name}</h1>
              <span className={`${styles.statusBadge} ${getStatusBadgeClass(pendaftar.status)}`}>
                {pendaftar.status}
              </span>
            </div>
            <p className={styles.pageSubtitle}>Detail pendaftar program</p>
          </div>
        </div>

        {/* Profile Card */}
        <div className={styles.profileCard}>
          <div className={styles.profileAvatar}>
            {avatarInitials}
          </div>
          <div className={styles.profileInfo}>
            <h2 className={styles.profileName}>{pendaftar.full_name}</h2>
            <p className={styles.profileInstitution}>{pendaftar.institution}</p>
          </div>
        </div>

        {/* Info Grid */}
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <h3 className={styles.infoCardTitle}>Data Diri</h3>
            <div className={styles.infoList}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Nama Lengkap</span>
                <span className={styles.infoValue}>{pendaftar.full_name}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Tanggal Lahir</span>
                <span className={styles.infoValue}>{formatDate(pendaftar.birth_date)}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Asal Daerah</span>
                <span className={styles.infoValue}>{pendaftar.region}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Nama Instansi</span>
                <span className={styles.infoValue}>{pendaftar.institution}</span>
              </div>
            </div>
          </div>

          <div className={styles.infoCard}>
            <h3 className={styles.infoCardTitle}>Kontak & Media Sosial</h3>
            <div className={styles.infoList}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>No. WhatsApp</span>
                <a
                  href={`https://wa.me/${pendaftar.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.infoLink}
                >
                  {pendaftar.whatsapp}
                </a>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Email</span>
                <a href={`mailto:${pendaftar.email}`} className={styles.infoLink}>
                  {pendaftar.email}
                </a>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Akun Instagram</span>
                <a
                  href={`https://instagram.com/${(pendaftar.instagram || "").replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.infoLink}
                >
                  {pendaftar.instagram}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Motivation Card */}
        <div className={styles.motivationCard}>
          <h3 className={styles.motivationTitle}>Alasan Mengikuti Kegiatan</h3>
          <p className={styles.motivationText}>{pendaftar.reason || pendaftar.why_join || "-"}</p>
        </div>

        {/* Kelengkapan Persyaratan (Berkas) Card */}
        <div className={styles.berkasCard}>
          <h3 className={styles.berkasTitle}>Kelengkapan Persyaratan</h3>
          <div className={styles.berkasList}>
            {berkasList(pendaftar.registration_files).length > 0 ? (
              berkasList(pendaftar.registration_files).map((item) => (
                <div key={item.key} className={styles.berkasItem}>
                  <div className={styles.berkasIcon}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                  <div className={styles.berkasInfo}>
                    <span className={styles.berkasLabel}>{item.label}</span>
                    <span className={styles.berkasName}>{item.file.file_name}</span>
                    <span className={styles.berkasSize}>{formatFileSize(item.file.file_size)}</span>
                  </div>
                  <a 
                    href={item.file.file_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={styles.berkasDownload} 
                    aria-label="Lihat/Download Berkas"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                    </svg>
                  </a>
                </div>
              ))
            ) : (
              <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>Belum ada berkas yang diunggah.</p>
            )}
          </div>
        </div>

        {/* Registration Info Card */}
        <div className={styles.registrationCard}>
          <h3 className={styles.registrationTitle}>Informasi Pendaftaran</h3>
          <div className={styles.registrationGrid}>
            <div className={styles.registrationItem}>
              <span className={styles.registrationLabel}>Tanggal Pendaftaran</span>
              <span className={styles.registrationValue}>{formatDate(pendaftar.registered_at)}</span>
            </div>
            <div className={styles.registrationItem}>
              <span className={styles.registrationLabel}>Kode Pendaftaran</span>
              <span className={styles.registrationValue}>
                {pendaftar.registration_code || "-"}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={styles.actionButtons}>
          <Link href={`/admin/semesta-camp/${programId}`} className={styles.backBtn}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Kembali
          </Link>
          <div className={styles.actionRight}>
            <a
              href={`https://wa.me/${pendaftar.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.whatsappBtn}
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Hubungi via WhatsApp
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}