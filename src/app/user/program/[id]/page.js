"use client";

import { useState, useEffect, useRef } from "react";
import { use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import navbarStyles from "../../landingpage/landingpage.module.css";
import { allPrograms, programCategories } from "../../data/programs";

export default function ProgramDetailPage({ params }) {
  const { id } = use(params);
  const programId = Number(id);
  const router = useRouter();

  const [scrollY, setScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("deskripsi");
  const [fundingOption, setFundingOption] = useState("fully");
  const tabRefs = { deskripsi: null, detail: null, divisi: null, pekerjaan: null };

  const program = allPrograms.find((p) => p.id === programId);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: program?.title || "Program Semesta Manusia",
          url,
        });
      } catch (err) {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    const el = tabRefs[tab];
    if (el) {
      const offset = 100;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  const getCategoryGradient = () => {
    if (!program) return programCategories.SEMESTA_CAMP.gradient;
    return program.category === "SJN"
      ? programCategories.SJN.gradient
      : programCategories.SEMESTA_CAMP.gradient;
  };

  const getCategoryClass = () => {
    if (!program) return "";
    if (program.category === "SJN") return styles.sjn;
    if (program.category === "Semesta Camp") return styles.camp;
    return "";
  };

  const registerLabel = () => {
    if (!program) return "Daftar Sekarang";
    if (program.category === "SJN") {
      return fundingOption === "fully" ? "Daftar Fully Funded" : "Daftar Self Funded";
    }
    return "Daftar Sekarang";
  };

  // Not found state
  if (!program) {
    return (
      <div className={styles.page}>
        {/* Minimal Navbar for not-found state */}
        <nav className={navbarStyles.navbar}>
          <div className={navbarStyles.navContainer}>
            <Link href="/user/landingpage" className={navbarStyles.logo}>
              <div className={navbarStyles.logoImage}>
                <Image
                  src="/LOGO SEMESTA MANUSIA.png"
                  alt="Semesta Manusia Logo"
                  fill
                  style={{ objectFit: "contain" }}
                />
              </div>
            </Link>
          </div>
        </nav>

        <div className={styles.notFound}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
          <h2>Program Tidak Ditemukan</h2>
          <p>Program yang kamu cari tidak tersedia atau sudah berakhir.</p>
          <Link href="/user/program" className={styles.notFoundButton}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Kembali ke Cari Program
          </Link>
        </div>
      </div>
    );
  }

  const isSJN = program.category === "SJN";

  // Resolve registration deadlines from program data
  const campDeadline = typeof program.registrationDeadline === "string"
    ? program.registrationDeadline
    : null;
  const fullyDeadline = typeof program.registrationDeadline === "object"
    ? program.registrationDeadline.fully
    : null;
  const selfDeadline = typeof program.registrationDeadline === "object"
    ? program.registrationDeadline.self
    : null;

  return (
    <div className={styles.page}>
      {/* Animated Background */}
      <div className={navbarStyles.animatedBg}>
        <div
          className={navbarStyles.gradientOrb1}
          style={{ transform: `translateY(${scrollY * 0.3}px)` }}
        />
        <div
          className={navbarStyles.gradientOrb2}
          style={{ transform: `translateY(${scrollY * 0.2}px)` }}
        />
        <div
          className={navbarStyles.gradientOrb3}
          style={{ transform: `translateY(${scrollY * 0.4}px)` }}
        />
      </div>

      {/* Navbar */}
      <nav
        className={navbarStyles.navbar}
        style={{
          background: scrollY > 50 ? "rgba(255, 255, 255, 0.95)" : "transparent",
        }}
      >
        <div className={navbarStyles.navContainer}>
          <Link href="/user/landingpage" className={navbarStyles.logo}>
            <div className={navbarStyles.logoImage}>
              <Image
                src="/LOGO SEMESTA MANUSIA.png"
                alt="Semesta Manusia Logo"
                fill
                style={{ objectFit: "contain" }}
              />
            </div>
            <div className={navbarStyles.logoText}>
              <span className={navbarStyles.logoMain}>Semesta Manusia</span>
              <span className={navbarStyles.logoSub}>Indonesia</span>
            </div>
          </Link>

          <ul
            className={`${navbarStyles.navLinks} ${
              mobileMenuOpen ? navbarStyles.navLinksOpen : ""
            }`}
          >
            <li>
              <a href="/user/landingpage#beranda" className={navbarStyles.navLink}>
                Beranda
              </a>
            </li>
            <li>
              <a href="/user/landingpage#tentang" className={navbarStyles.navLink}>
                Tentang
              </a>
            </li>
            <li>
              <a href="/user/landingpage#program" className={navbarStyles.navLink}>
                Program
              </a>
            </li>
            <li>
              <a href="/user/landingpage#galeri" className={navbarStyles.navLink}>
                Galeri
              </a>
            </li>
            <li>
              <a href="/user/landingpage#kontak" className={navbarStyles.navLink}>
                Kontak
              </a>
            </li>
          </ul>

          <div className={navbarStyles.navActions}>
            <Link href="/user/program" className={navbarStyles.ctaButton}>
              <span>Daftar Volunteer</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <button
              className={navbarStyles.mobileMenuButton}
              onClick={toggleMobileMenu}
              aria-label="Menu"
            >
              <span
                className={`${navbarStyles.hamburger} ${
                  mobileMenuOpen ? navbarStyles.hamburgerOpen : ""
                }`}
              ></span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section — 2 Column Layout */}
      <section className={styles.heroSection}>
        {/* Left: Hero Image */}
        <div className={styles.heroImageCol}>
          <div className={styles.heroImage}>
            <Image
              src={program.image}
              alt={program.title}
              fill
              style={{ objectFit: "cover" }}
            />
            {/* Placeholder if no image */}
            {!program.image && (
              <div
                className={styles.imagePlaceholder}
                style={{ background: getCategoryGradient() }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
                <span>{program.title}</span>
              </div>
            )}
          </div>

          {/* Back Button — overlay on hero image */}
          <button
            className={styles.backButton}
            onClick={() => router.back()}
            aria-label="Kembali"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Right: Info & Registration */}
        <div className={styles.infoCol}>
          {/* Category Badge + Share */}
          <div className={styles.headerRow}>
            <span className={`${styles.badge} ${getCategoryClass()}`}>
              {program.category}
            </span>
            <button
              className={styles.shareButton}
              onClick={handleShare}
              aria-label="Bagikan"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
            </button>
          </div>

          {/* Program Title */}
          <h1 className={styles.programTitle}>{program.title}</h1>

          {/* Info Box */}
          <div className={styles.infoBox}>
            <div className={styles.infoRow}>
              <div className={`${styles.infoIcon} ${getCategoryClass()}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <div className={styles.infoContent}>
                <span className={styles.infoLabel}>Tanggal Pelaksanaan</span>
                <span className={styles.infoValue}>{program.date || "Segera Diumumkan"}</span>
              </div>
            </div>

            <div className={styles.infoRow}>
              <div className={`${styles.infoIcon} ${getCategoryClass()}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div className={styles.infoContent}>
                <span className={styles.infoLabel}>Lokasi</span>
                <span className={styles.infoValue}>
                  {program.location || "Indonesia"}
                </span>
              </div>
            </div>
          </div>

          {/* Warning Box — batas registrasi Semesta Camp */}
          {!isSJN && (
            <div className={styles.warningBox}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span className={styles.warningText}>
                Batas registrasi program: <strong>{campDeadline}</strong>
              </span>
            </div>
          )}

          {/* Funding Options — SJN Only */}
          {isSJN && (
            <div className={styles.fundingSection}>
              <div className={styles.fundingOptions}>
                {/* Fully Funded */}
                <div
                  className={`${styles.fundingOption} ${
                    fundingOption === "fully" ? `${styles.active} ${styles.sjn}` : ""
                  }`}
                  onClick={() => setFundingOption("fully")}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && setFundingOption("fully")}
                >
                  <div className={styles.radioCircle}>
                    <div className={styles.radioDot} />
                  </div>
                  <div className={styles.fundingLabel}>
                    <span className={styles.fundingName}>
                      Fully Funded
                    </span>
                    <span className={styles.fundingNote}>
                      Biaya ditanggung penuh oleh penyelenggara
                    </span>
                  </div>
                </div>

                {/* Self Funded */}
                <div
                  className={`${styles.fundingOption} ${
                    fundingOption === "self" ? `${styles.active} ${styles.sjn}` : ""
                  }`}
                  onClick={() => setFundingOption("self")}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && setFundingOption("self")}
                >
                  <div className={styles.radioCircle}>
                    <div className={styles.radioDot} />
                  </div>
                  <div className={styles.fundingLabel}>
                    <span className={styles.fundingName}>Self Funded</span>
                    <span className={styles.fundingNote}>
                      Biaya transportasi & kebutuhan pribadi ditanggung sendiri
                    </span>
                  </div>
                </div>
              </div>

              {/* Warning Box — batas registrasi kondisional */}
              <div className={styles.warningBox}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <span className={styles.warningText}>
                  Batas registrasi{" "}
                  <strong>
                    {fundingOption === "fully" ? "Fully Funded" : "Self Funded"}
                  </strong>
                  :{" "}
                  <strong>
                    {fundingOption === "fully"
                      ? fullyDeadline
                      : selfDeadline}
                  </strong>
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className={styles.actionButtons}>
            <button
              className={`${styles.primaryAction} ${styles.gradient} ${getCategoryClass()}`}
              onClick={() => {
                if (isSJN) {
                  router.push(`/user/program/${programId}/register?type=${fundingOption === "fully" ? "fully-funded" : "self-funded"}`);
                } else {
                  router.push(`/user/program/${programId}/register?type=semesta-camp`);
                }
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
              {registerLabel()}
            </button>

            <button className={`${styles.primaryAction} ${styles.outlined} ${getCategoryClass()}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
              Hubungi Organisasi
            </button>
          </div>
        </div>
      </section>

      {/* Tab Content Section */}
      <section className={styles.tabSection}>
        <div className={styles.tabSectionInner}>
          {/* Tabs */}
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === "deskripsi" ? styles.active : ""}`}
              onClick={() => handleTabChange("deskripsi")}
            >
              Deskripsi
            </button>
            <button
              className={`${styles.tab} ${activeTab === "detail" ? styles.active : ""}`}
              onClick={() => handleTabChange("detail")}
            >
              Detail Aktivitas
            </button>
            {isSJN ? (
              <button
                className={`${styles.tab} ${activeTab === "divisi" ? styles.active : ""}`}
                onClick={() => handleTabChange("divisi")}
              >
                Divisi
              </button>
            ) : (
              <button
                className={`${styles.tab} ${activeTab === "pekerjaan" ? styles.active : ""}`}
                onClick={() => handleTabChange("pekerjaan")}
              >
                Pekerjaan
              </button>
            )}
          </div>

          {/* Tab Panels */}
          <div className={styles.tabPanel}>
            {/* === Tab: Deskripsi === */}
            {activeTab === "deskripsi" && (
              <div ref={(el) => (tabRefs.deskripsi = el)} className={styles.contentSection}>
                <h2 className={styles.sectionTitle}>Deskripsi</h2>
                <p className={styles.contentText}>
                  {program.description}
                </p>
                <p className={styles.contentText}>
                  Program ini dirancang untuk memberikan pengalaman volunteering yang mendalam dan bermakna. Peserta akan berinteraksi langsung dengan masyarakat lokal, belajar tentang budaya, dan berkontribusi pada kegiatan pelestarian lingkungan atau sosial sesuai fokus program.
                </p>
                <p className={styles.contentText}>
                  Selama program, peserta akan dibimbing oleh tim profesional yang berpengalaman dan didukung oleh jaringan komunitas yang luas. Kegiatan sehari-hari mencakup kerja volunteer di pagi hari, workshop dan pelatihan di siang hari, serta kegiatan bonding dan refleksi di malam hari.
                </p>
              </div>
            )}

            {/* === Tab: Detail Aktivitas === */}
            {activeTab === "detail" && (
              <div ref={(el) => (tabRefs.detail = el)} className={styles.contentSection}>
                <h2 className={styles.sectionTitle}>Detail Aktivitas</h2>
                <p className={styles.contentText}>
                  Aktivitas dalam program ini mencakup berbagai kegiatan volunteering yang disesuaikan dengan kebutuhan lokasi dan jadwal yang telah ditentukan. Peserta akan mengikuti Orientasi Hari Pertama untuk pengenalan program, lingkungan, dan tim, kemudian memasuki fase Kerja Volunteer Utama selama beberapa hari dengan fokus pada tugas spesifik sesuai deskripsi pekerjaan, serta ditutup dengan Kegiatan Penutup dan Evaluasi Program.
                </p>

                {/* Download Guide Book — SJN Only */}
                {isSJN && (
                  <button className={`${styles.downloadButton} ${getCategoryClass()}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                    Download Guide Book
                  </button>
                )}
              </div>
            )}

            {/* === Tab: Divisi — SJN Only === */}
            {isSJN && activeTab === "divisi" && (
              <div ref={(el) => (tabRefs.divisi = el)} className={styles.contentSection}>
                <h2 className={styles.sectionTitle}>Divisi</h2>
                <p className={styles.contentText}>
                  Program ini terbagi menjadi beberapa divisi kerja yang masing-masing memiliki peran dan tanggung jawab spesifik. Peserta akan ditempatkan pada divisi yang sesuai dengan minat, keahlian, dan kebutuhan program.
                </p>

                <div className={styles.divisiSection}>
                  <div className={`${styles.divisiItem} ${getCategoryClass() ? "" : ""}`}>
                    <div className={`${styles.divisiIcon} ${getCategoryClass()}`}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
                        <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
                      </svg>
                    </div>
                    <div className={styles.divisiInfo}>
                      <h4>Pendidikan & Literasi</h4>
                      <p>Mengajar, membuat materi ajar, dan pendampingan belajar anak-anak</p>
                    </div>
                  </div>

                  <div className={styles.divisiItem}>
                    <div className={`${styles.divisiIcon} ${getCategoryClass()}`}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="2" y1="12" x2="22" y2="12" />
                        <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                      </svg>
                    </div>
                    <div className={styles.divisiInfo}>
                      <h4>Konservasi & Lingkungan</h4>
                      <p>Penanaman pohon, pembersihan area konservasi, dan edukasi lingkungan</p>
                    </div>
                  </div>

                  <div className={styles.divisiItem}>
                    <div className={`${styles.divisiIcon} ${getCategoryClass()}`}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 00-3-3.87" />
                        <path d="M16 3.13a4 4 0 010 7.75" />
                      </svg>
                    </div>
                    <div className={styles.divisiInfo}>
                      <h4>Pemberdayaan Masyarakat</h4>
                      <p>Pendampingan keterampilan, pelatihan usaha mikro, dan pengembangan komunitas</p>
                    </div>
                  </div>

                  <div className={styles.divisiItem}>
                    <div className={`${styles.divisiIcon} ${getCategoryClass()}`}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                        <circle cx="12" cy="13" r="4" />
                      </svg>
                    </div>
                    <div className={styles.divisiInfo}>
                      <h4>Dokumentasi & Komunikasi</h4>
                      <p>Fotografi, videografi, penulisan artikel, dan pengelolaan media sosial program</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* === Tab: Pekerjaan — Semesta Camp Only === */}
            {!isSJN && activeTab === "pekerjaan" && (
              <div ref={(el) => (tabRefs.pekerjaan = el)} className={styles.contentSection}>
                <h2 className={styles.sectionTitle}>Pekerjaan</h2>
                <p className={styles.contentText}>
                  Sebagai volunteer dalam program ini, kamu akan dipercaya untuk mengerjakan berbagai tugas yang mendukung kelancaran operasional dan pencapaian tujuan program. Setiap volunteer diharapkan mampu bekerja secara mandiri maupun dalam tim, menunjukkan inisiatif, dan menjaga profesionalisme selama masa volunteering.
                </p>
                <p className={styles.contentText}>
                  Deskripsi pekerjaan dapat meliputi bidang pendidikan dan pengajaran untuk anak-anak dan remaja di sekitar lokasi program, pendampingan dan bimbingan kepada masyarakat lokal dalam pengembangan keterampilan tertentu, serta partisipasi aktif dalam kegiatan pelestarian lingkungan dan ekosistem.
                </p>
                <p className={styles.contentText}>
                  Setiap volunteer diharapkan untuk sepenuhnya hadir dan berpartisipasi aktif dalam seluruh rangkaian kegiatan yang telah dijadwalkan. Komitmen, fleksibilitas, dan semangat gotong royong adalah kunci keberhasilan dalam program volunteering ini.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={navbarStyles.footer}>
        <div className={navbarStyles.footerContainer}>
          <div className={navbarStyles.footerMain}>
            <div className={navbarStyles.footerBrand}>
              <Link href="/user/landingpage" className={navbarStyles.footerLogo}>
                <div className={navbarStyles.footerLogoIcon}>
                  <Image
                    src="/LOGO SEMESTA MANUSIA.png"
                    alt="Semesta Manusia"
                    fill
                    style={{ objectFit: "contain" }}
                  />
                </div>
              </Link>
              <p className={navbarStyles.footerDescription}>
                Menjangkau Nusantara, Menciptakan Perubahan. Bergabunglah dalam komunitas volunteer terbesar
                Indonesia.
              </p>
            </div>

            <div className={navbarStyles.footerLinks}>
              <div className={navbarStyles.footerColumn}>
                <h4>Program</h4>
                <ul>
                  <li>
                    <a href="/user/landingpage#program">Semesta Camp</a>
                  </li>
                  <li>
                    <a href="/user/landingpage#program">Semesta Jelajah Nusantara</a>
                  </li>
                  <li>
                    <a href="/user/landingpage#program">Edukasi & Literasi</a>
                  </li>
                  <li>
                    <a href="/user/landingpage#program">Kesehatan</a>
                  </li>
                </ul>
              </div>
              <div className={navbarStyles.footerColumn}>
                <h4>Perusahaan</h4>
                <ul>
                  <li>
                    <a href="/user/landingpage#tentang">Tentang Kami</a>
                  </li>
                  <li>
                    <a href="/user/landingpage#galeri">Galeri</a>
                  </li>
                  <li>
                    <a href="/user/landingpage#kontak">Hubungi Kami</a>
                  </li>
                </ul>
              </div>
              <div className={navbarStyles.footerColumn}>
                <h4>Bantuan</h4>
                <ul>
                  <li>
                    <a href="#">FAQ</a>
                  </li>
                  <li>
                    <a href="#">Kebijakan Privasi</a>
                  </li>
                  <li>
                    <a href="#">Syarat & Ketentuan</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className={navbarStyles.footerBottom}>
            <p>© 2026 Semesta Manusia Indonesia. Seluruh hak cipta dilindungi.</p>
            <div className={navbarStyles.footerSocial}>
              <a href="#" aria-label="Instagram">
                IG
              </a>
              <a href="#" aria-label="Twitter">
                TW
              </a>
              <a href="#" aria-label="YouTube">
                YT
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
