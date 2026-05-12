"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import styles from "./landingpage.module.css";
import { previewPrograms, liputanData } from "../data/programs";

export default function LandingPage() {
  const [activeFilter, setActiveFilter] = useState("semua");

  const filteredPrograms = activeFilter === "semua"
    ? previewPrograms
    : activeFilter === "camp"
    ? previewPrograms.filter(p => p.category === "Semesta Camp")
    : previewPrograms.filter(p => p.category === "SJN");

  const filterTabs = [
    { key: "semua", label: "Semua" },
    { key: "camp", label: "Semesta Camp" },
    { key: "jelajah", label: "Semesta Jelajah Nusantara" }
  ];

  const stats = [
    { number: "1000+", label: "Volunteer" },
    { number: "50+", label: "Program" },
    { number: "20+", label: "Provinsi" }
  ];

  const programs = [
    {
      category: "Semesta Camp",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      ),
      description: "Program volunteer jangka pendek yang mempertemukan volunteer dengan komunitas lokal di lokasi yang telah ditentukan.",
      gradient: "linear-gradient(135deg, #00BFFF 0%, #0099CC 100%)",
      features: ["Durasi 1-4 minggu", "Tinggal dihomestay lokal", "Project berbasis komunitas", "Sertifikat volunteer"],
      image: "/camp.jpg",
      color: "#00BFFF"
    },
    {
      category: "Semesta Jelajah Nusantara",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M2 12h20"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
      ),
      description: "Program volunteer immersive yang memungkinkan peserta tinggal dan bekerja langsung dengan komunitas selama 1-6 bulan.",
      gradient: "linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)",
      features: ["Durasi 1-6 bulan", "Immersive living", "Skill-based volunteering", "Sustainable impact"],
      image: "/jelajah.jpg",
      color: "#7C3AED"
    }
  ];

  return (
    <div className={styles.container}>
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section id="beranda" className={styles.hero}>
        <div className={styles.heroContainer}>
          <div className={styles.heroContent}>
            <div className={styles.heroBadge}>
              <span className={styles.badgePulse}></span>
              <span>Pendaftaran Dibuka 2026</span>
            </div>
            <h1 className={styles.heroTitle}>
              <span className={styles.heroTitleLine}>Menjangkau Nusantara,</span>
              <span className={styles.heroTitleAccent}>Menciptakan Perubahan</span>
            </h1>
            <p className={styles.heroDescription}>
              Bergabunglah dalam komunitas volunteer terbesar Indonesia.
              Bersama, kita bisa menciptakan dampak nyata bagi masyarakat di seluruh penjuru Nusantara.
            </p>
            <div className={styles.heroActions}>
              <a href="#program" className={styles.primaryButton}>
                <span>Jelajahi Program</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </a>
              <a href="#tentang" className={styles.secondaryButton}>
                <span>Pelajari Lebih Lanjut</span>
              </a>
            </div>

            {/* Stats */}
            <div className={styles.statsContainer}>
              {stats.map((stat, index) => (
                <div key={index} className={styles.statItem}>
                  <div className={styles.statNumber}>{stat.number}</div>
                  <div className={styles.statLabel}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Illustration */}
          <div className={styles.heroVisual}>
            <div className={styles.heroLogo}>
              <Image
                src="/LOGO SEMESTA MANUSIA.png"
                alt="Semesta Manusia"
                fill
                style={{ objectFit: 'contain' }}
              />
            </div>
            <div className={styles.floatingCard} style={{ "--delay": "0s", "--translateY": "0" }}>
              <div className={styles.cardIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <span>1000+ Volunteer</span>
            </div>
            <div className={styles.floatingCard} style={{ "--delay": "0.5s", "--translateY": "10px" }}>
              <div className={styles.cardIcon} style={{ background: "#10B981" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <span>Berbadan Hukum</span>
            </div>
            <div className={styles.floatingCard} style={{ "--delay": "1s", "--translateY": "-5px" }}>
              <div className={styles.cardIcon} style={{ background: "#F59E0B" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <span>20+ Provinsi</span>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className={styles.scrollIndicator}>
          <div className={styles.scrollMouse}>
            <div className={styles.scrollWheel}></div>
          </div>
          <span>Scroll ke bawah</span>
        </div>
      </section>

      {/* Tentang Kami Section */}
      <section id="tentang" className={styles.aboutSection}>
        <div className={styles.sectionContainer}>
          <div className={styles.aboutGrid}>
            <div className={styles.aboutContent}>
              <span className={styles.sectionTag}>Tentang Kami</span>
              <h2 className={styles.sectionTitle}>
                Menghubungkan Hati,<br/>
                <span className={styles.titleAccent}>Menciptakan Dampak</span>
              </h2>
              <p className={styles.aboutDescription}>
                <strong>Semesta Manusia Indonesia</strong> adalah organisasi volunteer yang mempertemukan individu yang peduli dengan komunitas yang membutuhkan di seluruh Indonesia.
              </p>
              <p className={styles.aboutDescription}>
                Sejak <strong>2020</strong>, kami telah menghubungkan ribuan volunteer dengan program-program sosial yang bermakna. Bersama, kita bisa menjangkau setiap sudut Nusantara dan menciptakan perubahan nyata.
              </p>
              <div className={styles.aboutStats}>
                <div className={styles.aboutStat}>
                  <span className={styles.aboutStatNumber}>4+</span>
                  <span className={styles.aboutStatLabel}>Tahun Pengalaman</span>
                </div>
                <div className={styles.aboutStat}>
                  <span className={styles.aboutStatNumber}>50+</span>
                  <span className={styles.aboutStatLabel}>Program Aktif</span>
                </div>
                <div className={styles.aboutStat}>
                  <span className={styles.aboutStatNumber}>10K+</span>
                  <span className={styles.aboutStatLabel}>Penerima Manfaat</span>
                </div>
              </div>
            </div>
            <div className={styles.aboutVisual}>
              <div className={styles.aboutCard}>
                <div className={styles.aboutCardIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </div>
                <h4>Terpercaya</h4>
                <p>Berbadan hukum resmi dan transparan dalam operasional</p>
              </div>
              <div className={styles.aboutCard}>
                <div className={styles.aboutCardIcon} style={{ background: "#7C3AED" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <h4>Komunitas Solid</h4>
                <p>Ribuan volunteer siap kolaborasi dan berbagi</p>
              </div>
              <div className={styles.aboutCard}>
                <div className={styles.aboutCardIcon} style={{ background: "#10B981" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                </div>
                <h4>Dampak Terukur</h4>
                <p>Setiap program berdampak langsung ke masyarakat</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Program Categories Section */}
      <section id="program" className={styles.programSection}>
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>Program Kami</span>
            <h2 className={styles.sectionTitle}>
              Pilih Program yang<br/>
              <span className={styles.titleAccent}>Sesuai denganmu</span>
            </h2>
            <p className={styles.sectionDescription}>
              Ada dua kategori program volunteer yang bisa kamu pilih sesuai dengan ketersediaan dan passionmu
            </p>
          </div>

          <div className={styles.programCategories}>
            {programs.map((program, index) => (
              <div key={index} className={styles.programCategory}>
                <div className={styles.categoryHeader} style={{ background: program.gradient }}>
                  <div className={styles.categoryIcon}>
                    {program.icon}
                  </div>
                  <h3 className={styles.categoryTitle}>{program.category}</h3>
                </div>
                <div className={styles.categoryBody}>
                  <p className={styles.categoryDescription}>{program.description}</p>
                  <ul className={styles.categoryFeatures}>
                    {program.features.map((feature, i) => (
                      <li key={i}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <a href="#daftar" className={styles.categoryButton} style={{ background: program.gradient }}>
                    Pilih Program Ini
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Program Preview Section */}
      <section className={styles.previewSection}>
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>Jelajah Kegiatan</span>
            <h2 className={styles.sectionTitle}>
              Temukan Program yang<br/>
              <span className={styles.titleAccent}>Sesuai Passionmu</span>
            </h2>
            <p className={styles.sectionDescription}>
              Beragam program volunteer yang bisa kamu ikuti untuk berkontribusi di berbagai bidang dan lokasi di seluruh Indonesia.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className={styles.filterTabs}>
            {filterTabs.map(tab => (
              <button
                key={tab.key}
                className={`${styles.filterTab} ${activeFilter === tab.key ? styles.filterTabActive : ""}`}
                onClick={() => setActiveFilter(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Preview Grid */}
          <div className={styles.previewGrid}>
            {filteredPrograms.length > 0 ? (
              filteredPrograms.map(program => (
                <div key={program.id} className={styles.previewCard}>
                  <div className={styles.previewCardImage}>
                    <Image
                      src={program.image}
                      alt={program.title}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                    <span className={`${styles.previewCardBadge} ${program.category === "SJN" ? styles.jelajah : styles.camp}`}>
                      {program.category}
                    </span>
                  </div>
                  <div className={styles.previewCardBody}>
                    <h3 className={styles.previewTitle}>{program.title}</h3>
                    <p className={styles.previewDescription}>{program.description}</p>
                    <div className={styles.previewMeta}>
                      {program.date ? (
                        <div className={styles.previewMetaItem}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/>
                            <line x1="8" y1="2" x2="8" y2="6"/>
                            <line x1="3" y1="10" x2="21" y2="10"/>
                          </svg>
                          <span>{program.date}</span>
                        </div>
                      ) : (
                        <div className={styles.previewMetaItem}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/>
                            <line x1="8" y1="2" x2="8" y2="6"/>
                            <line x1="3" y1="10" x2="21" y2="10"/>
                          </svg>
                          <span>Coming Soon</span>
                        </div>
                      )}
                      {program.location ? (
                        <div className={styles.previewMetaItem}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                          </svg>
                          <span>{program.location}</span>
                        </div>
                      ) : (
                        <div className={styles.previewMetaItem}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                          </svg>
                          <span>Indonesia</span>
                        </div>
                      )}
                    </div>

                    {/* Registration Deadline Badge */}
                    {program.registrationDeadline && (
                      <div className={`${styles.previewDeadlineBadge} ${program.category === "SJN" ? styles.jelajah : styles.camp}`}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        <span>
                          {program.category === "SJN" && typeof program.registrationDeadline === "object"
                            ? `Batas Registrasi: ${program.registrationDeadline.fully}`
                            : typeof program.registrationDeadline === "string"
                              ? `Batas Registrasi: ${program.registrationDeadline}`
                              : null}
                        </span>
                      </div>
                    )}
                  </div>
                  <Link href={`/user/program/${program.id}`} className={styles.previewButton}>
                    <span>Daftar</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </Link>
                </div>
              ))
            ) : (
              <div className={styles.previewEmpty}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <p>Tidak ada program untuk kategori ini.</p>
              </div>
            )}
          </div>

          {/* Load More Button */}
          <Link href="/user/program" className={styles.previewLoadMore}>
            <span>Lihat lebih banyak</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>
      </section>

      {/* Galeri Section */}
      <section id="galeri" className={styles.gallerySection}>
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>Galeri</span>
            <h2 className={styles.sectionTitle}>
              Momen Berharga dari<br/>
              <span className={styles.titleAccent}>Para Volunteer Kami</span>
            </h2>
          </div>

          <div className={styles.galleryGrid}>
            {[1, 2, 3, 4, 5, 6].map((item, index) => (
              <div key={index} className={`${styles.galleryItem} ${index === 0 ? styles.galleryItemLarge : ""}`}>
                <div className={styles.galleryPlaceholder}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                </div>
                <div className={styles.galleryOverlay}>
                  <span className={styles.galleryTitle}>
                    {["Mengajar di Desa Terpencil", "Penyuluhan Kesehatan", "Penanaman Mangrove", "Pelatihan Keterampilan", "Kunjungan Panti", "Gotong Royong"][index]}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.galleryActions}>
            <a href="#" className={styles.viewAllButton}>
              <span>Lihat Semua Galeri</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Liputan Section */}
      <section className={styles.liputanSection}>
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>Liputan</span>
            <h2 className={styles.sectionTitle}>
              Berita & Cerita dari<br/>
              <span className={styles.titleAccent}>Semesta Manusia</span>
            </h2>
            <p className={styles.sectionDescription}>
              Ikuti perkembangan terbaru tentang kegiatan dan program volunteer yang dilakukan oleh komunitas Semesta Manusia di berbagai daerah.
            </p>
          </div>

          <div className={styles.liputanGrid}>
            {liputanData.slice(0, 4).map((item) => (
              <div key={item.id} className={styles.liputanCard}>
                <div className={styles.liputanCardImage}>
                  <Image src={item.image} alt={item.title} fill style={{ objectFit: 'cover' }} />
                </div>
                <div className={styles.liputanCardBody}>
                  <h3 className={styles.liputanCardTitle}>{item.title}</h3>
                  <p className={styles.liputanCardDescription}>{item.description}</p>
                </div>
                <a href="#" className={styles.liputanCardButton}>
                  <span>Baca Selengkapnya</span>
                </a>
              </div>
            ))}
          </div>

          <Link href="/user/liputan" className={styles.previewLoadMore}>
            <span>Lihat lebih banyak</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>
      </section>

      {/* Partner Section */}
      <section className={styles.partnerSection}>
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>Partner</span>
            <h2 className={styles.sectionTitle}>
              Didukung oleh<br/>
              <span className={styles.titleAccent}>Mitra Terpercaya</span>
            </h2>
            <p className={styles.sectionDescription}>
              Semesta Manusia menjalin kerja sama dengan berbagai pihak untuk memperluas dampak positif program volunteer di seluruh Indonesia.
            </p>
          </div>

          <div className={styles.partnerGrid}>
            {[
              { name: "Bank Indonesia", image: "/program-preview-1.jpg" },
              { name: "Kementerian Sosial", image: "/program-preview-2.jpg" },
              { name: "UNICEF Indonesia", image: "/program-preview-3.jpg" }
            ].map((partner, index) => (
              <div key={index} className={styles.partnerCard}>
                <Image src={partner.image} alt={partner.name} fill style={{ objectFit: 'contain' }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
