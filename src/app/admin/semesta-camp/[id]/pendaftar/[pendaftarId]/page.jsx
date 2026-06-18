"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import AdminSidebar from "../../../../components/AdminSidebar.jsx";
import { useSidebar } from "../../../../components/SidebarContext";
import styles from "./page.module.css";

export default function PendaftarDetailPage({ params }) {
  const resolvedParams = use(params);
  const programId = resolvedParams.id;
  const pendaftarId = resolvedParams.pendaftarId ? parseInt(resolvedParams.pendaftarId) : null;
  const { isCollapsed, toggle: onToggleSidebar } = useSidebar();
  // State untuk Data
  const [pendaftar, setPendaftar] = useState(null);
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch Data Pendaftar & Program
  useEffect(() => {
    if (!pendaftarId || !programId) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const [resPendaftar, resProgram] = await Promise.all([
          fetch(`/api/registrations/${pendaftarId}`),
          fetch(`/api/programs/${programId}`)
        ]);

        if (!resPendaftar.ok) throw new Error("Gagal mengambil data pendaftar");
        if (!resProgram.ok) throw new Error("Gagal mengambil data program");

        const dataPendaftar = await resPendaftar.json();
        const dataProgram = await resProgram.json();

        setPendaftar(dataPendaftar);
        setProgram(dataProgram);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [pendaftarId, programId]);

  const getStatusBadgeClass = (status) => {
    if (status === "Diterima") return styles.badgeDiterima;
    if (status === "Ditolak") return styles.badgeDitolak;
    return styles.badgePending;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "";
    return `${(bytes / 1024).toFixed(0)} KB`;
  };

  // Helper untuk mendapatkan jawaban Teks / Tipe Lainnya
  const getAnswerForField = (field) => {
    // 1. Coba cari di jawaban dinamis
    const dynamicAns = pendaftar?.registration_answers?.find(a => a.field_id === field.id);
    if (dynamicAns) {
      return dynamicAns.value_text || dynamicAns.value_date || dynamicAns.value_number || "-";
    }

    // 2. Fallback untuk data yang tersimpan di kolom statis lama
    const labelLower = field.label.toLowerCase();
    if (labelLower.includes("nama lengkap")) return pendaftar.full_name;
    if (labelLower.includes("email")) return pendaftar.email;
    if (labelLower.includes("whatsapp")) return pendaftar.whatsapp;
    if (labelLower.includes("instagram")) return pendaftar.instagram;
    if (labelLower.includes("tanggal lahir")) return formatDate(pendaftar.birth_date);
    if (labelLower.includes("asal daerah")) return pendaftar.region;
    if (labelLower.includes("instansi")) return pendaftar.institution;
    if (labelLower.includes("alasan")) return pendaftar.reason || pendaftar.why_join;
    
    return "-";
  };

  // Helper untuk mendapatkan URL & Info File Upload
  const getFileForField = (field) => {
    // 1. Cari berdasarkan ID field (Sistem baru)
    let fileObj = pendaftar?.registration_files?.find(f => f.field_key === field.id);
    
    // 2. Fallback berdasarkan Keyword Label (Sistem lama)
    if (!fileObj) {
      const labelLower = field.label.toLowerCase();
      if (labelLower.includes("instagram")) fileObj = pendaftar?.registration_files?.find(f => f.field_key === "instagramProof");
      else if (labelLower.includes("tiktok")) fileObj = pendaftar?.registration_files?.find(f => f.field_key === "tiktokProof");
      else if (labelLower.includes("pembayaran")) fileObj = pendaftar?.registration_files?.find(f => f.field_key === "paymentProof");
      else if (labelLower.includes("story")) fileObj = pendaftar?.registration_files?.find(f => f.field_key === "storyProof");
    }
    
    return fileObj;
  };

  if (loading) {
    return (
      <div className={styles.pageLayout}>
        <AdminSidebar isCollapsed={isCollapsed} onToggle={onToggleSidebar} />
        <main className={`${styles.mainContent} ${isCollapsed ? styles.expanded : ""}`}>
          <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>Memuat data pendaftar...</div>
        </main>
      </div>
    );
  }

  if (error || !pendaftar || !program) {
    return (
      <div className={styles.pageLayout}>
        <AdminSidebar isCollapsed={isCollapsed} onToggle={onToggleSidebar} />
        <main className={`${styles.mainContent} ${isCollapsed ? styles.expanded : ""}`}>
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

  const fullName = pendaftar.full_name || "User";
  const avatarInitials = fullName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

  // Ambil struktur form pendaftaran
  const formSections = program?.custom_registration_form || [];

  return (
    <div className={styles.pageLayout}>
      <AdminSidebar
        isCollapsed={isCollapsed}
        onToggle={onToggleSidebar}
      />

      <main className={`${styles.mainContent} ${isCollapsed ? styles.expanded : ""}`}>
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
              <h1 className={styles.pageTitle}>{fullName}</h1>
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
            <h2 className={styles.profileName}>{fullName}</h2>
            <p className={styles.profileInstitution}>{pendaftar.institution || "-"}</p>
          </div>
        </div>

        {/* RENDER SECTIONS SECARA DINAMIS */}
        <div className={styles.infoGrid}>
          {formSections.length > 0 ? (
            formSections.map((section) => (
              <div key={section.id} className={styles.infoCard} style={{ gridColumn: '1 / -1' }}>
                <h3 className={styles.infoCardTitle}>{section.title}</h3>
                
                <div className={styles.infoList} style={{ gap: '1.25rem' }}>
                  {section.fields.map((field) => {
                    // Cek apakah ada file yang terupload untuk field ini
                    const fileObj = pendaftar?.registration_files?.find(f => f.field_key === field.id);
                    
                    return (
                      <div key={field.id} className={styles.infoItem} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.4rem', width: '100%' }}>
                        <span className={styles.infoLabel}>{field.label}</span>
                        
                        {field.type === "upload" ? (
                          // RENDER FILE UPLOAD
                          fileObj ? (
                            <div className={styles.berkasItem} style={{ width: '100%', maxWidth: '600px', marginTop: '0.2rem' }}>
                              <div className={styles.berkasIcon}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                  <polyline points="14 2 14 8 20 8" />
                                </svg>
                              </div>
                              <div className={styles.berkasInfo}>
                                <span className={styles.berkasName} style={{ fontWeight: "normal", color: "#6b7280", fontSize: "0.8rem" }}>
                                  {fileObj.file_name} • {formatFileSize(fileObj.file_size)}
                                </span>
                              </div>
                              <a
                                href={`/api/files/${fileObj.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.berkasDownload}
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                                </svg>
                              </a>
                            </div>
                          ) : (
                            <span className={styles.infoValue} style={{ color: "#9ca3af" }}>Tidak ada berkas.</span>
                          )
                        ) : (
                          // RENDER TEKS / DROPDOWN / LAINNYA
                          <span className={styles.infoValue} style={{ whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                            {getAnswerForField(field)}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className={styles.infoCard} style={{ gridColumn: '1 / -1' }}>
              <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>Konfigurasi form belum tersedia.</p>
            </div>
          )}
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
              <span className={styles.registrationLabel}>Program</span>
              <span className={styles.registrationValue}>{program?.title || "Program Semesta Camp"}</span>
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
              href={`https://wa.me/${pendaftar.whatsapp || ""}`}
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