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

  // Dummy pendaftar data — matches Semesta Camp registration form fields
  const pendaftarData = {
    "semesta-camp-10-palembang": [
      { id: 1, tanggal: "2 Jan 2023", fullName: "Andi Pratama", email: "andi.pratama@gmail.com", whatsapp: "081234567890", instagram: "@andipratama", birthDate: "7 Feb 1998", region: "Bandung, Jawa Barat", institution: "Universitas Padjadjaran", reason: "Saya ingin mengikuti Semesta Camp untuk mengasah kemampuan leadership dan belajar berkolaborasi dengan peserta dari berbagai daerah, sekaligus memperluas jaringan dengan komunitas yang peduli pada isu sosial dan lingkungan.", berkas: { instagramProof: { name: "follow_ig_andi.jpg", size: "245 KB" }, tiktokProof: { name: "follow_tiktok_andi.jpg", size: "198 KB" }, paymentProof: { name: "bukti_bayar_andi.jpg", size: "187 KB" } }, status: "Pending" },
      { id: 2, tanggal: "14 Dec 2022", fullName: "Siti Rahma", email: "siti.rahma@gmail.com", whatsapp: "081234567891", instagram: "@sitirahma", birthDate: "21 Apr 1999", region: "Yogyakarta, DIY", institution: "SMA 12 Bandung", reason: "Bergabung dengan Semesta Camp adalah langkah konkret saya untuk belajar tentang teamwork, komunikasi lintas budaya, dan berkontribusi langsung pada kegiatan sosial yang terstruktur dan berdampak.", berkas: { instagramProof: { name: "follow_ig_siti.jpg", size: "252 KB" }, tiktokProof: { name: "follow_tiktok_siti.jpg", size: "210 KB" }, paymentProof: { name: "bukti_bayar_siti.jpg", size: "195 KB" } }, status: "Diterima" },
      { id: 3, tanggal: "12 Dec 2022", fullName: "Budi Santoso", email: "budi.santoso@gmail.com", whatsapp: "081234567892", instagram: "@budisantoso", birthDate: "15 Agt 1997", region: "Jakarta Selatan", institution: "Rumah Sakit Hasan Sadikin", reason: "Saya melihat Semesta Camp sebagai wadah yang tepat untuk mengaplikasikan pengalaman organisasi saya sekaligus belajar dari fasilitator dan teman-teman peserta yang punya latar belakang beragam.", berkas: { instagramProof: { name: "follow_ig_budi.jpg", size: "230 KB" }, tiktokProof: { name: "follow_tiktok_budi.jpg", size: "188 KB" }, paymentProof: { name: "bukti_bayar_budi.jpg", size: "203 KB" } }, status: "Ditolak" },
      { id: 4, tanggal: "7 Dec 2022", fullName: "Dewi Lestari", email: "dewi.lestari@gmail.com", whatsapp: "081234567893", instagram: "@dewilestari", birthDate: "3 Mei 2000", region: "Depok, Jawa Barat", institution: "Universitas Indonesia", reason: "Saya ingin menambah pengalaman di luar kampus, bertemu orang-orang inspiratif, dan ikut terlibat dalam program-program sosial yang dijalankan selama Semesta Camp berlangsung.", berkas: { instagramProof: { name: "follow_ig_dewi.jpg", size: "267 KB" }, tiktokProof: { name: "follow_tiktok_dewi.jpg", size: "221 KB" }, paymentProof: { name: "bukti_bayar_dewi.jpg", size: "192 KB" } }, status: "Pending" },
      { id: 5, tanggal: "3 Dec 2022", fullName: "Reza Firmansyah", email: "reza.f@gmail.com", whatsapp: "081234567894", instagram: "@rezafirmansyah", birthDate: "28 Nov 1998", region: "Sleman, Yogyakarta", institution: "Universitas Gadjah Mada", reason: "Saya mendaftar karena tertarik dengan kurikulum Semesta Camp yang menggabungkan hard skills dan soft skills, terutama sesi leadership dan project management yang ingin saya dalami lebih lanjut.", berkas: { instagramProof: { name: "follow_ig_reza.jpg", size: "241 KB" }, tiktokProof: { name: "follow_tiktok_reza.jpg", size: "194 KB" }, paymentProof: { name: "bukti_bayar_reza.jpg", size: "178 KB" } }, status: "Pending" },
      { id: 6, tanggal: "26 Nov 2022", fullName: "Nadia Putri", email: "nadia.p@gmail.com", whatsapp: "081234567895", instagram: "@nadiaputri", birthDate: "9 Jul 1999", region: "Semarang, Jawa Tengah", institution: "Universitas Diponegoro", reason: "Semesta Camp adalah kesempatan bagus untuk belajar langsung dari praktisi, membangun relasi dengan sesama peserta, dan mengembangkan diri di lingkungan yang suportif dan kolaboratif.", berkas: { instagramProof: { name: "follow_ig_nadia.jpg", size: "258 KB" }, tiktokProof: { name: "follow_tiktok_nadia.jpg", size: "215 KB" }, paymentProof: { name: "bukti_bayar_nadia.jpg", size: "184 KB" } }, status: "Pending" },
      { id: 7, tanggal: "18 Nov 2022", fullName: "Fajar Nugroho", email: "fajar.n@gmail.com", whatsapp: "081234567896", instagram: "@fajarnugroho", birthDate: "17 Sep 1998", region: "Malang, Jawa Timur", institution: "Universitas Brawijaya", reason: "Saya ingin keluar dari zona nyaman, melatih public speaking, dan mengasah kemampuan problem solving lewat studi kasus dan simulasi yang dirancang oleh tim Semesta Camp.", berkas: { instagramProof: { name: "follow_ig_fajar.jpg", size: "249 KB" }, tiktokProof: { name: "follow_tiktok_fajar.jpg", size: "201 KB" }, paymentProof: { name: "bukti_bayar_fajar.jpg", size: "189 KB" } }, status: "Diterima" },
      { id: 8, tanggal: "13 Nov 2022", fullName: "Ayu Rahayu", email: "ayu.r@gmail.com", whatsapp: "081234567897", instagram: "@ayurahayu", birthDate: "5 Mar 2000", region: "Surabaya, Jawa Timur", institution: "Universitas Airlangga", reason: "Saya melihat Semesta Camp sebagai ruang aman untuk mencoba hal baru, bertemu mentor yang berkualitas, dan membentuk jejaring dengan anak muda dari penjuru Indonesia.", berkas: { instagramProof: { name: "follow_ig_ayu.jpg", size: "255 KB" }, tiktokProof: { name: "follow_tiktok_ayu.jpg", size: "208 KB" }, paymentProof: { name: "bukti_bayar_ayu.jpg", size: "181 KB" } }, status: "Diterima" },
      { id: 9, tanggal: "11 Nov 2022", fullName: "Rizky Maulana", email: "rizky.m@gmail.com", whatsapp: "081234567898", instagram: "@rizkymaulana", birthDate: "22 Jun 1997", region: "Bandung, Jawa Barat", institution: "Institut Teknologi Bandung", reason: "Saya mendaftar karena ingin meningkatkan kemampuan komunikasi, kolaborasi tim, dan kepemimpinan melalui kegiatan yang dirancang secara intensif oleh tim Semesta Camp.", berkas: { instagramProof: { name: "follow_ig_rizky.jpg", size: "238 KB" }, tiktokProof: { name: "follow_tiktok_rizky.jpg", size: "197 KB" }, paymentProof: { name: "bukti_bayar_rizky.jpg", size: "186 KB" } }, status: "Diterima" },
      { id: 10, tanggal: "9 Nov 2022", fullName: "Intan Permata", email: "intan.p@gmail.com", whatsapp: "081234567899", instagram: "@intanpermata", birthDate: "12 Okt 1999", region: "Makassar, Sulawesi Selatan", institution: "Universitas Hasanuddin", reason: "Saya ingin belajar langsung dari mentor yang berpengalaman, mengikuti sesi workshop yang aplikatif, serta membangun koneksi dengan peserta lain yang punya semangat serupa.", berkas: { instagramProof: { name: "follow_ig_intan.jpg", size: "244 KB" }, tiktokProof: { name: "follow_tiktok_intan.jpg", size: "200 KB" }, paymentProof: { name: "bukti_bayar_intan.jpg", size: "191 KB" } }, status: "Ditolak" },
    ],
  };

  const pendaftarList = programId ? pendaftarData[programId] || [] : [];
  const pendaftar = pendaftarList.find((p) => p.id === pendaftarId);

  const getStatusBadgeClass = (status) => {
    if (status === "Diterima") return styles.badgeDiterima;
    if (status === "Ditolak") return styles.badgeDitolak;
    return styles.badgePending;
  };

  const berkasList = (berkas) => {
    if (!berkas) return [];
    return [
      { key: "instagramProof", label: "Bukti follow Instagram Semesta Manusia Indonesia (@semestamanusiaa)", file: berkas.instagramProof },
      { key: "tiktokProof", label: "Bukti follow Tiktok Semesta Manusia Indonesia (@semestamanusia.indonesia)", file: berkas.tiktokProof },
      { key: "paymentProof", label: "Upload Bukti Pembayaran", file: berkas.paymentProof },
    ];
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
              <h1 className={styles.pageTitle}>{pendaftar.fullName}</h1>
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
            {pendaftar.fullName.split(" ").map((n) => n[0]).slice(0, 2).join("")}
          </div>
          <div className={styles.profileInfo}>
            <h2 className={styles.profileName}>{pendaftar.fullName}</h2>
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
                <span className={styles.infoValue}>{pendaftar.fullName}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Tanggal Lahir</span>
                <span className={styles.infoValue}>{pendaftar.birthDate}</span>
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
                  href={`https://instagram.com/${pendaftar.instagram.replace("@", "")}`}
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
          <h3 className={styles.motivationTitle}>Alasan Mengikuti Kegiatan Semesta Camp</h3>
          <p className={styles.motivationText}>{pendaftar.reason}</p>
        </div>

        {/* Kelengkapan Persyaratan (Berkas) Card */}
        <div className={styles.berkasCard}>
          <h3 className={styles.berkasTitle}>Kelengkapan Persyaratan</h3>
          <div className={styles.berkasList}>
            {berkasList(pendaftar.berkas).map((item) => (
              <div key={item.key} className={styles.berkasItem}>
                <div className={styles.berkasIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
                <div className={styles.berkasInfo}>
                  <span className={styles.berkasLabel}>{item.label}</span>
                  <span className={styles.berkasName}>{item.file?.name || "—"}</span>
                  <span className={styles.berkasSize}>{item.file?.size || ""}</span>
                </div>
                <a href="#" className={styles.berkasDownload} aria-label="Download">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                  </svg>
                </a>
              </div>
            ))}
          </div>
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
