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

  // Dummy pendaftar data (same as in detail page)
  const pendaftarData = {
    "semesta-camp-10-palembang": [
      { id: 1, tanggal: "2 Jan 2023", nama: "Andi Pratama", noWhatsapp: "081234567890", email: "andi.pratama@gmail.com", status: "Pending", instansi: "Universitas Padjadjaran",Domisili: "Bandung, Jawa Barat", bidang: "Pendidikan", motivasi: "Ingin berkontribusi dalam kegiatan sosial dan memperluas jaringan volunteering.", },
      { id: 2, tanggal: "14 Dec 2022", nama: "Siti Rahma", noWhatsapp: "081234567891", email: "siti.rahma@gmail.com", status: "Diterima", instansi: "SMA 12 Bandung", Domisili: "Yogyakarta, DIY", bidang: "Kesehatan", motivasi: "Menggabungkan passion di bidang kesehatan dengan kegiatan kemanusiaan.", },
      { id: 3, tanggal: "12 Dec 2022", nama: "Budi Santoso", noWhatsapp: "081234567892", email: "budi.santoso@gmail.com", status: "Ditolak", instansi: "Rumah Sakit Hasan Sadikin", Domisili: "Jakarta Selatan", bidang: "Logistik", motivasi: "Berpengalaman dalam manajemen logistik dan ingin berkontribusi lebih.", },
      { id: 4, tanggal: "7 Dec 2022", nama: "Dewi Lestari", noWhatsapp: "081234567893", email: "dewi.lestari@gmail.com", status: "Pending", instansi: "Universitas Indonesia", Domisili: "Depok, Jawa Barat", bidang: "Pendidikan", motivasi: "Dedicated untuk keberlanjutan program sosial di daerah terpencil.", },
      { id: 5, tanggal: "3 Dec 2022", nama: "Reza Firmansyah", noWhatsapp: "081234567894", email: "reza.f@gmail.com", status: "Pending", instansi: "Universitas Gadjah Mada", Domisili: "Sleman, Yogyakarta", bidang: "Teknologi", motivasi: "Menggabungkan keahlian tech untuk социаль impact.", },
      { id: 6, tanggal: "26 Nov 2022", nama: "Nadia Putri", noWhatsapp: "081234567895", email: "nadia.p@gmail.com", status: "Pending", instansi: "Universitas Diponegoro", Domisili: "Semarang, Jawa Tengah", bidang: "Pendidikan", motivasi: "Passionate dalam volunteer work dan community development.", },
      { id: 7, tanggal: "18 Nov 2022", nama: "Fajar Nugroho", noWhatsapp: "081234567896", email: "fajar.n@gmail.com", status: "Diterima", instansi: "Universitas Brawijaya", Domisili: "Malang, Jawa Timur", bidang: "Kesehatan", motivasi: "Bergabung untuk memperluas jaringan kesehatan masyarakat.", },
      { id: 8, tanggal: "13 Nov 2022", nama: "Ayu Rahayu", noWhatsapp: "081234567897", email: "ayu.r@gmail.com", status: "Diterima", instansi: "Universitas Airlangga", Domisili: "Surabaya, Jawa Timur", bidang: "Pendidikan", motivasi: "Semangat berkontribusi di bidang kemanusiaan dan pendidikan.", },
      { id: 9, tanggal: "11 Nov 2022", nama: "Rizky Maulana", noWhatsapp: "081234567898", email: "rizky.m@gmail.com", status: "Diterima", instansi: "Institut Teknologi Bandung", Domisili: "Bandung, Jawa Barat", bidang: "Teknologi", motivasi: "Ingin memanfaatkan keahlian IT untuk kegiatan sosial.", },
      { id: 10, tanggal: "9 Nov 2022", nama: "Intan Permata", noWhatsapp: "081234567899", email: "intan.p@gmail.com", status: "Ditolak", instansi: "Universitas Hasanuddin", Domisili: "Makassar, Sulawesi Selatan", bidang: "Logistik", motivasi: "Berminat berkontribusi dalam manajemen logistik bencana.", },
    ],
  };

  const pendaftarList = programId ? pendaftarData[programId] || [] : [];
  const pendaftar = pendaftarList.find((p) => p.id === pendaftarId);

  const getStatusBadgeClass = (status) => {
    if (status === "Diterima") return styles.badgeDiterima;
    if (status === "Ditolak") return styles.badgeDitolak;
    return styles.badgePending;
  };

  if (!pendaftar) {
    return (
      <div className={styles.pageLayout}>
        <AdminSidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
        <main className={`${styles.mainContent} ${isSidebarCollapsed ? styles.expanded : ""}`}>
          <div className={styles.notFound}>
            <h2>Pendaftar tidak ditemukan</h2>
            <Link href={`/admin/semesta-camp/${programId}`} className={styles.backLinkError}>
              ← Kembali ke Daftar Pendaftar
            </Link>
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
              <h1 className={styles.pageTitle}>{pendaftar.nama}</h1>
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
            {pendaftar.nama.split(" ").map((n) => n[0]).slice(0, 2).join("")}
          </div>
          <div className={styles.profileInfo}>
            <h2 className={styles.profileName}>{pendaftar.nama}</h2>
            <p className={styles.profileInstitution}>{pendaftar.instansi}</p>
            <div className={styles.profileStatus}>
              <span className={`${styles.statusBadge} ${getStatusBadgeClass(pendaftar.status)}`}>
                {pendaftar.status}
              </span>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <h3 className={styles.infoCardTitle}>Data Diri</h3>
            <div className={styles.infoList}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Nama Lengkap</span>
                <span className={styles.infoValue}>{pendaftar.nama}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Asal Instansi</span>
                <span className={styles.infoValue}>{pendaftar.instansi}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Domisili</span>
                <span className={styles.infoValue}>{pendaftar.Domisili}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Bidang Minat</span>
                <span className={styles.infoValue}>{pendaftar.bidang}</span>
              </div>
            </div>
          </div>

          <div className={styles.infoCard}>
            <h3 className={styles.infoCardTitle}>Kontak</h3>
            <div className={styles.infoList}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Nomor WhatsApp</span>
                <a
                  href={`https://wa.me/${pendaftar.noWhatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.infoLink}
                >
                  {pendaftar.noWhatsapp}
                </a>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Email</span>
                <a href={`mailto:${pendaftar.email}`} className={styles.infoLink}>
                  {pendaftar.email}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Motivation Card */}
        <div className={styles.motivationCard}>
          <h3 className={styles.motivationTitle}>Motivasi</h3>
          <p className={styles.motivationText}>{pendaftar.motivasi}</p>
        </div>

        {/* Registration Info Card */}
        <div className={styles.registrationCard}>
          <h3 className={styles.registrationTitle}>Informasi Pendaftaran</h3>
          <div className={styles.registrationGrid}>
            <div className={styles.registrationItem}>
              <span className={styles.registrationLabel}>Tanggal Pendaftaran</span>
              <span className={styles.registrationValue}>{pendaftar.tanggal}</span>
            </div>
            <div className={styles.registrationItem}>
              <span className={styles.registrationLabel}>Program</span>
              <span className={styles.registrationValue}>
                {programId ? programId.replace(/-/g, " ").replace("semesta camp ", "Semesta Camp ").replace(/\b\w/g, (l) => l.toUpperCase()) : "-"}
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
              href={`https://wa.me/${pendaftar.noWhatsapp}`}
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