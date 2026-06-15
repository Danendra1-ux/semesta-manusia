"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import AdminSidebar from "../../../../components/AdminSidebar.jsx";
import styles from "./page.module.css";

export default function SJNPendaftarDetailPage({ params }) {
  const resolvedParams = use(params);
  const programId = resolvedParams.id;
  const pendaftarId = resolvedParams.pendaftarId ? parseInt(resolvedParams.pendaftarId) : null;
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [pendaftar, setPendaftar] = useState(null);
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPendaftar = async () => {
      try {
        const res = await fetch(`/api/registrations/${pendaftarId}`);
        if (res.ok) {
          const data = await res.json();
          
          const answers = {};
          if (data.registration_answers) {
            data.registration_answers.forEach(a => {
              answers[a.form_fields?.field_key || a.field_id] = a.value_text;
            });
          }
          
          const berkas = {};
          if (data.registration_files) {
            data.registration_files.forEach(f => {
              berkas[f.field_key] = { name: f.file_name, size: f.file_size + ' KB', url: f.file_url };
            });
          }

          setPendaftar({
            fullName: data.full_name,
            status: data.status,
            institution: data.institution,
            tipe: data.program_funding_types?.label || 'Fully Funded',
            tanggal: new Date(data.registered_at).toLocaleDateString('id-ID', {day:'numeric', month:'short', year:'numeric'}),
            whatsapp: data.whatsapp,
            email: data.email,
            instagram: data.instagram,
            birthDate: new Date(data.birth_date).toLocaleDateString('id-ID', {day:'numeric', month:'short', year:'numeric'}),
            region: data.region,
            whyJoin: answers['whyJoin'] || '-',
            divisionChoice: answers['divisionChoice'] || '-',
            divisionReason: answers['divisionReason'] || '-',
            programProposal: answers['programProposal'] || '-',
            hopes: answers['hopes'] || '-',
            berkas: berkas
          });
        }
      } catch(e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    const fetchProgram = async () => {
      try {
         const res = await fetch(`/api/programs/${programId}`);
         if(res.ok) {
           const progData = await res.json();
           setProgram(progData);
         }
      } catch(e) {}
    };

    if (pendaftarId) fetchPendaftar();
    if (programId) fetchProgram();
  }, [pendaftarId, programId]);

  const getStatusBadgeClass = (status) => {
    if (status === "Diterima") return styles.badgeDiterima;
    if (status === "Ditolak") return styles.badgeDitolak;
    return styles.badgePending;
  };

  const getTipeBadgeClass = (tipe) => {
    if (tipe === "Fully Funded") return styles.badgeFullyFunded;
    return styles.badgeSelfFunded;
  };

  const formatDivisionLabel = (value) => {
    const map = {
      "pendidikan-literasi": "Pendidikan & Literasi",
      "konservasi-lingkungan": "Konservasi & Lingkungan",
      "pemberdayaan-masyarakat": "Pemberdayaan Masyarakat",
      "dokumentasi-komunikasi": "Dokumentasi & Komunikasi",
    };
    return map[value] || value;
  };

  const berkasList = (berkas) => {
    if (!berkas) return [];
    return [
      { key: "instagramProof", label: "Bukti follow Instagram Semesta Manusia Indonesia (@semestamanusiaa)", file: berkas.instagramProof },
      { key: "tiktokProof", label: "Bukti follow Tiktok Semesta Manusia Indonesia (@semestamanusia.indonesia)", file: berkas.tiktokProof },
      { key: "storyProof", label: "Bukti upload Invitation Story ke Story Instagram Anda", file: berkas.storyProof },
      { key: "paymentProof", label: "Upload Bukti Pembayaran", file: berkas.paymentProof },
    ];
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Memuat data pendaftar...</div>;
  }

  if (!pendaftar) {
    return (
      <div className={styles.pageLayout}>
        <AdminSidebar isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
        <main className={`${styles.mainContent} ${isSidebarCollapsed ? styles.expanded : ""}`}>
          <div className={styles.notFound}>
            <h2>Pendaftar tidak ditemukan</h2>
            <Link href={`/admin/sjn/${programId}`} className={styles.backLinkError}>← Kembali ke Daftar Pendaftar</Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.pageLayout}>
      <AdminSidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <main className={`${styles.mainContent} ${isSidebarCollapsed ? styles.expanded : ""}`}>
        <div className={styles.contentHeader}>
          <div className={styles.headerTop}>
            <Link href={`/admin/sjn/${programId}`} className={styles.backButton}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </Link>
          </div>
          <div className={styles.headerText}>
            <div className={styles.headerTitleRow}>
              <h1 className={styles.pageTitle}>{pendaftar.fullName}</h1>
              <span className={`${styles.statusBadge} ${getStatusBadgeClass(pendaftar.status)}`}>
                {pendaftar.status}
              </span>
            </div>
            <p className={styles.pageSubtitle}>Detail pendaftar program</p>
          </div>
        </div>

        <div className={styles.profileCard}>
          <div className={styles.profileAvatar}>
            {pendaftar.fullName.split(" ").map((n) => n[0]).slice(0, 2).join("")}
          </div>
          <div className={styles.profileInfo}>
            <h2 className={styles.profileName}>{pendaftar.fullName}</h2>
            <p className={styles.profileInstitution}>{pendaftar.institution}</p>
            <div className={styles.profileStatus}>
              <span className={`${styles.statusBadge} ${getTipeBadgeClass(pendaftar.tipe)}`}>
                {pendaftar.tipe}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <h3 className={styles.infoCardTitle}>Data Diri</h3>
            <div className={styles.infoList}>
              <div className={styles.infoItem}><span className={styles.infoLabel}>Nama Lengkap</span><span className={styles.infoValue}>{pendaftar.fullName}</span></div>
              <div className={styles.infoItem}><span className={styles.infoLabel}>Tanggal Lahir</span><span className={styles.infoValue}>{pendaftar.birthDate}</span></div>
              <div className={styles.infoItem}><span className={styles.infoLabel}>Asal Daerah</span><span className={styles.infoValue}>{pendaftar.region}</span></div>
              <div className={styles.infoItem}><span className={styles.infoLabel}>Nama Instansi</span><span className={styles.infoValue}>{pendaftar.institution}</span></div>
            </div>
          </div>

          <div className={styles.infoCard}>
            <h3 className={styles.infoCardTitle}>Kontak & Media Sosial</h3>
            <div className={styles.infoList}>
              <div className={styles.infoItem}><span className={styles.infoLabel}>No. WhatsApp</span><a href={`https://wa.me/${pendaftar.whatsapp}`} target="_blank" rel="noopener noreferrer" className={styles.infoLink}>{pendaftar.whatsapp}</a></div>
              <div className={styles.infoItem}><span className={styles.infoLabel}>Email</span><a href={`mailto:${pendaftar.email}`} className={styles.infoLink}>{pendaftar.email}</a></div>
              <div className={styles.infoItem}><span className={styles.infoLabel}>Akun Instagram</span><a href={`https://instagram.com/${pendaftar.instagram.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className={styles.infoLink}>{pendaftar.instagram}</a></div>
            </div>
          </div>
        </div>

        <div className={styles.descriptionCard}>
          <h3 className={styles.descriptionTitle}>Deskripsi Diri</h3>
          <div className={styles.descriptionGrid}>
            <div className={styles.descriptionItem}><span className={styles.descriptionLabel}>Jelaskan mengapa anda ingin bergabung dalam kegiatan ini?</span><p className={styles.descriptionValue}>{pendaftar.whyJoin}</p></div>
            <div className={styles.descriptionItem}><span className={styles.descriptionLabel}>Jika anda terpilih sebagai delegasi, bidang apa yang akan anda pilih?</span><span className={styles.descriptionValue}>{formatDivisionLabel(pendaftar.divisionChoice)}</span></div>
            <div className={styles.descriptionItem}><span className={styles.descriptionLabel}>Apa alasan anda memilih divisi tersebut?</span><p className={styles.descriptionValue}>{pendaftar.divisionReason}</p></div>
            <div className={styles.descriptionItem}><span className={styles.descriptionLabel}>Apa program kerja yang akan anda ajukan?</span><p className={styles.descriptionValue}>{pendaftar.programProposal}</p></div>
            <div className={styles.descriptionItem}><span className={styles.descriptionLabel}>Apa harapan dan rencana anda jika terpilih?</span><p className={styles.descriptionValue}>{pendaftar.hopes}</p></div>
          </div>
        </div>

        <div className={styles.berkasCard}>
          <h3 className={styles.berkasTitle}>Kelengkapan Persyaratan</h3>
          <div className={styles.berkasList}>
            {berkasList(pendaftar.berkas).map((item) => (
              <div key={item.key} className={styles.berkasItem}>
                <div className={styles.berkasIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                </div>
                <div className={styles.berkasInfo}>
                  <span className={styles.berkasLabel}>{item.label}</span>
                  <span className={styles.berkasName}>{item.file?.name || "—"}</span>
                  <span className={styles.berkasSize}>{item.file?.size || ""}</span>
                </div>
                {item.file?.url && (
                  <a href={item.file.url} target="_blank" rel="noopener noreferrer" className={styles.berkasDownload} aria-label="Download">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.registrationCard}>
          <h3 className={styles.registrationTitle}>Informasi Pendaftaran</h3>
          <div className={styles.registrationGrid}>
            <div className={styles.registrationItem}><span className={styles.registrationLabel}>Tanggal Pendaftaran</span><span className={styles.registrationValue}>{pendaftar.tanggal}</span></div>
            <div className={styles.registrationItem}><span className={styles.registrationLabel}>Program</span><span className={styles.registrationValue}>{program?.title || "Program SJN"}</span></div>
            <div className={styles.registrationItem}><span className={styles.registrationLabel}>Tipe Pendaftaran</span><span className={`${styles.statusBadge} ${getTipeBadgeClass(pendaftar.tipe)}`}>{pendaftar.tipe}</span></div>
          </div>
        </div>

        <div className={styles.actionButtons}>
          <Link href={`/admin/sjn/${programId}`} className={styles.backBtn}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            Kembali
          </Link>
          <div className={styles.actionRight}>
            <a href={`https://wa.me/${pendaftar.whatsapp}`} target="_blank" rel="noopener noreferrer" className={styles.whatsappBtn}>
              Hubungi via WhatsApp
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}