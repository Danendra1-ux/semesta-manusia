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

  // Dummy pendaftar data (same as in SJN detail page)
  const pendaftarData = {
    "sjn-4-raja-ampat": [
      { id: 1, tanggal: "3 Jan 2026", nama: "Bagas Prasetyo", noWhatsapp: "081298765432", email: "bagas.prasetyo@gmail.com", status: "Pending", instansi: "Universitas Indonesia", tipe: "Fully Funded", domisili: "Depok, Jawa Barat", bidang: "Pendidikan", motivasi: "Ingin berkontribusi dalam program pendidikan di daerah terpencil dan memperluas wawasan tentang konservasi laut." },
      { id: 2, tanggal: "28 Des 2025", nama: "Layla Nuraini", noWhatsapp: "082134567891", email: "layla.nuraini@gmail.com", status: "Diterima", instansi: "Institut Teknologi Bandung", tipe: "Fully Funded", domisili: "Bandung, Jawa Barat", bidang: "Kesehatan", motivasi: "Passionate dalam kegiatan kesehatan masyarakat dan ingin berkontribusi untuk masyarakat Raja Ampat." },
      { id: 3, tanggal: "25 Des 2025", nama: "Wahyu Hidayat", noWhatsapp: "083145678902", email: "wahyu.hidayat@gmail.com", status: "Ditolak", instansi: "Universitas Gadjah Mada", tipe: "Self Funded", domisili: "Sleman, Yogyakarta", bidang: "Lingkungan", motivasi: "Memiliki pengalaman dalam konservasi terumbu karang dan ingin berbagi ilmu dengan masyarakat lokal." },
      { id: 4, tanggal: "20 Des 2025", nama: "Putri Anggraini", noWhatsapp: "084156789013", email: "putri.anggraini@gmail.com", status: "Pending", instansi: "Universitas Brawijaya", tipe: "Fully Funded", domisili: "Malang, Jawa Timur", bidang: "Dokumentasi", motivasi: "Ingin mendokumentasikan keindahan Raja Ampat dan kegiatan sosial untuk publikasi." },
      { id: 5, tanggal: "15 Des 2025", nama: "Dimas Saputra", noWhatsapp: "085167890124", email: "dimas.saputra@gmail.com", status: "Pending", instansi: "Universitas Airlangga", tipe: "Self Funded", domisili: "Surabaya, Jawa Timur", bidang: "Pendidikan", motivasi: "Berpengalaman dalam mengajar anak-anak dan ingin berkontribusi di bidang pendidikan." },
      { id: 6, tanggal: "10 Des 2025", nama: "Aulia Rahma", noWhatsapp: "086178901235", email: "aulia.rahma@gmail.com", status: "Diterima", instansi: "Universitas Diponegoro", tipe: "Fully Funded", domisili: "Semarang, Jawa Tengah", bidang: "Kesehatan", motivasi: "Dedicated untuk meningkatkan kesehatan masyarakat pesisir dan pulau-pulau terpencil." },
      { id: 7, tanggal: "5 Des 2025", nama: "Rizal Firmansyah", noWhatsapp: "087189012346", email: "rizal.firmansyah@gmail.com", status: "Pending", instansi: "Universitas Hasanuddin", tipe: "Self Funded", domisili: "Makassar, Sulawesi Selatan", bidang: "Lingkungan", motivasi: "Passionate dalam pelestarian lingkungan laut dan ingin berkontribusi langsung." },
      { id: 8, tanggal: "1 Des 2025", nama: "Citra Dewi", noWhatsapp: "088190123457", email: "citra.dewi@gmail.com", status: "Diterima", instansi: "Universitas Padjadjaran", tipe: "Fully Funded", domisili: "Bandung, Jawa Barat", bidang: "Pendidikan", motivasi: "Ingin berbagi ilmu dan pengalaman dengan anak-anak di Raja Ampat." },
      { id: 9, tanggal: "28 Nov 2025", nama: "Arif Budiman", noWhatsapp: "089101234568", email: "arif.budiman@gmail.com", status: "Ditolak", instansi: "Universitas Sebelas Maret", tipe: "Self Funded", domisili: "Surakarta, Jawa Tengah", bidang: "Dokumentasi", motivasi: "Memiliki keahlian fotografi dan videografi untuk mendokumentasikan program." },
      { id: 10, tanggal: "25 Nov 2025", nama: "Sari Pertiwi", noWhatsapp: "081212345679", email: "sari.pertiwi@gmail.com", status: "Pending", instansi: "Universitas Lampung", tipe: "Fully Funded", domisili: "Bandar Lampung, Lampung", bidang: "Kesehatan", motivasi: "Ingin berkontribusi dalam program kesehatan masyarakat di daerah kepulauan." },
    ],
    "sjn-3-sumba": [
      { id: 1, tanggal: "1 Jun 2025", nama: "Hendra Kusuma", noWhatsapp: "081323456780", email: "hendra.kusuma@gmail.com", status: "Diterima", instansi: "Universitas Udayana", tipe: "Fully Funded", domisili: "Denpasar, Bali", bidang: "Pendidikan", motivasi: "Passionate dalam pendidikan dan pemberdayaan ekonomi masyarakat." },
      { id: 2, tanggal: "28 Mei 2025", nama: "Mega Lestari", noWhatsapp: "082334567891", email: "mega.lestari@gmail.com", status: "Diterima", instansi: "Universitas Mataram", tipe: "Self Funded", domisili: "Mataram, NTB", bidang: "Ekonomi", motivasi: "Ingin membantu pemberdayaan ekonomi masyarakat Sumba melalui tenun ikat." },
    ],
    "sjn-2-flores": [
      { id: 1, tanggal: "10 Feb 2025", nama: "Bayu Setiawan", noWhatsapp: "081445678901", email: "bayu.setiawan@gmail.com", status: "Diterima", instansi: "Universitas Katolik Widya Mandala", tipe: "Fully Funded", domisili: "Surabaya, Jawa Timur", bidang: "Pendidikan", motivasi: "Ingin berkontribusi dalam pelestarian budaya dan pendidikan anak di Wae Rebo." },
      { id: 2, tanggal: "8 Feb 2025", nama: "Anisa Kumala", noWhatsapp: "082456789012", email: "anisa.kumala@gmail.com", status: "Diterima", instansi: "Universitas Dr. Soetomo", tipe: "Self Funded", domisili: "Surabaya, Jawa Timur", bidang: "Budaya", motivasi: "Passionate dalam pelestarian budaya lokal dan ingin belajar langsung dari masyarakat adat." },
    ],
    "sjn-1-toraja": [
      { id: 1, tanggal: "20 Jul 2024", nama: "Mira Susanti", noWhatsapp: "081567890123", email: "mira.susanti@gmail.com", status: "Diterima", instansi: "Universitas Hasanuddin", tipe: "Fully Funded", domisili: "Makassar, Sulawesi Selatan", bidang: "Budaya", motivasi: "Ingin mempelajari dan melestarikan tradisi Toraja yang unik." },
      { id: 2, tanggal: "18 Jul 2024", nama: "Fajar Nugroho", noWhatsapp: "082578901234", email: "fajar.nugroho@gmail.com", status: "Diterima", instansi: "Universitas Brawijaya", tipe: "Self Funded", domisili: "Malang, Jawa Timur", bidang: "Pendidikan", motivasi: "Passionate dalam pendidikan dan ingin berkontribusi di Toraja." },
    ],
    "sjn-pilot-kalimantan": [
      { id: 1, tanggal: "1 Mar 2024", nama: "Andi Pratama", noWhatsapp: "081678901234", email: "andi.pratama@gmail.com", status: "Diterima", instansi: "Universitas Padjadjaran", tipe: "Fully Funded", domisili: "Bandung, Jawa Barat", bidang: "Budaya", motivasi: "Ingin belajar tentang budaya Dayak Kenyah dan berkontribusi dalam program pilot." },
      { id: 2, tanggal: "28 Feb 2024", nama: "Rina Marlina", noWhatsapp: "082689012345", email: "rina.marlina@gmail.com", status: "Diterima", instansi: "Universitas Padjadjaran", tipe: "Self Funded", domisili: "Bandung, Jawa Barat", bidang: "Pendidikan", motivasi: "Passionate dalam pendidikan dan ingin berkontribusi di komunitas Dayak." },
    ],
  };

  const pendaftarList = programId ? pendaftarData[programId] || [] : [];
  const pendaftar = pendaftarList.find((p) => p.id === pendaftarId);

  const getStatusBadgeClass = (status) => {
    if (status === "Diterima") return styles.badgeDiterima;
    if (status === "Ditolak") return styles.badgeDitolak;
    return styles.badgePending;
  };

  const getTipeBadgeClass = (tipe) => {
    if (tipe === "Fully Funded") return styles.badgeFullyFunded;
    return styles.badgeSelfFunded;
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
            <Link href={`/admin/sjn/${programId}`} className={styles.backLinkError}>
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
            <Link href={`/admin/sjn/${programId}`} className={styles.backButton}>
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
              <span className={`${styles.statusBadge} ${getTipeBadgeClass(pendaftar.tipe)}`}>
                {pendaftar.tipe}
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
                <span className={styles.infoValue}>{pendaftar.domisili}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Bidang Minat</span>
                <span className={styles.infoValue}>{pendaftar.bidang}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Tipe Pendaftaran</span>
                <span className={`${styles.statusBadge} ${getTipeBadgeClass(pendaftar.tipe)}`}>
                  {pendaftar.tipe}
                </span>
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
                {programId ? programId.replace(/-/g, " ").replace("sjn ", "SJN ").replace(/\b\w/g, (l) => l.toUpperCase()) : "-"}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={styles.actionButtons}>
          <Link href={`/admin/sjn/${programId}`} className={styles.backBtn}>
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