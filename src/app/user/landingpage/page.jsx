"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar.jsx";
import Footer from "@/components/Footer.jsx";
import styles from "./landingpage.module.css";

export default function LandingPage() {
  const [activeFilter, setActiveFilter] = useState("semua");

  const [programs, setPrograms] = useState([]);
  const [liputan, setLiputan] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [programsRes, liputanRes, reviewsRes] = await Promise.all([
          fetch('/api/programs?is_active=true'),
          fetch('/api/liputan?is_published=true'),
          fetch('/api/reviews?limit=6'),
        ]);

        if (programsRes.ok) setPrograms(await programsRes.json());
        if (liputanRes.ok) setLiputan(await liputanRes.json());
        if (reviewsRes.ok) {
          const data = await reviewsRes.json();
          setReviews(data.reviews || []);
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
        setReviewsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredPrograms = activeFilter === "semua"
    ? programs
    : activeFilter === "camp"
    ? programs.filter(p => p.category === "Semesta Camp")
    : programs.filter(p => p.category === "SJN");

  const filterTabs = [
    { key: "semua", label: "Semua" },
    { key: "camp", label: "Semesta Camp" },
    { key: "jelajah", label: "Semesta Jelajah Nusantara" }
  ];

  const getCategoryGradient = (category) => {
    if (category === "SJN") return "linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)";
    return "linear-gradient(135deg, #00BFFF 0%, #0099CC 100%)";
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatDateRange = (start, end) => {
    if (!start) return null;

    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    const startDate = new Date(start).toLocaleDateString('id-ID', options);

    if (!end || start === end) {
      return startDate;
    }

    const endDate = new Date(end).toLocaleDateString('id-ID', options);
    return `${startDate} - ${endDate}`;
  };

  const getBadgeClass = (category) => {
    if (category === "SJN") return styles.jelajah;
    if (category === "Semesta Camp") return styles.camp;
    return "";
  };

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
              <span>Berbagi | Bermakna | Bergerak Lebih Luas</span>
            </div>
            <h1 className={styles.heroTitle}>
              <span className={styles.heroTitleLine}>Karena Kebaikan</span>
              <span className={styles.heroTitleAccent}>Tak Mengenal Batas.</span>
            </h1>
            <p className={styles.heroDescription}>
              Di setiap sudut Indonesia, selalu ada cerita yang perlu didengar, tangan yang perlu digenggam, dan harapan yang perlu dijaga. Bersama Semesta Manusia Indonesia, mari hadir melalui aksi nyata untuk berbagi, menginspirasi, dan menciptakan perubahan yang berarti bagi mereka yang membutuhkan.
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
        <div className={styles.aboutSectionInner}>
          <div className={styles.aboutGrid}>
            <div className={styles.aboutContent}>
              <h2 className={styles.aboutTitle}>
                Menghubungkan Hati,<br/>
                Menciptakan Dampak
              </h2>
              <p className={styles.aboutDescription}>
                <span className={styles.aboutHighlight}>Semesta Manusia Indonesia</span> adalah organisasi sosial yang lahir dari keyakinan bahwa setiap orang memiliki kemampuan untuk membawa perubahan. Kami mempertemukan individu yang peduli dengan anak-anak, komunitas, dan masyarakat yang membutuhkan melalui berbagai program kemanusiaan yang bermakna.
              </p>
              <p className={styles.aboutDescription}>
                Sejak <span className={styles.aboutHighlight}>Oktober 2024</span>, kami hadir sebagai ruang kolaborasi bagi generasi muda untuk berbagi, belajar, dan bergerak bersama. Dengan semangat kepedulian dan gotong royong, kami percaya bahwa langkah kecil yang dilakukan bersama dapat menghadirkan dampak besar bagi Indonesia.
              </p>
            </div>
            <div className={styles.aboutPhotoWrap}>
              <Image
                src="/about-section.png"
                alt="Relawan Semesta Manusia bersama anak-anak"
                fill
                style={{ objectFit: 'contain' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Program Categories Section */}
      <section id="program" className={styles.programSection}>
        <div className={styles.sectionContainer}>
          <div className={styles.programCard}>
            <div className={styles.programPhotos}>
              <div className={styles.programPhotoItem} style={{ background: "linear-gradient(165deg, rgba(0,191,255,0.15) 0%, rgba(0,153,204,0.85) 100%)", boxShadow: "0 20px 60px rgba(0,191,255,0.15), 0 4px 24px rgba(0,153,204,0.1)" }}>
                <Image
                  src="/sc-kategori.jpeg"
                  alt="Semesta Camp"
                  fill
                  style={{ objectFit: 'cover' }}
                  className={styles.programPhotoImg}
                />
                <div className={styles.programPhotoOverlay} style={{ background: "linear-gradient(180deg, transparent 30%, rgba(0,153,204,0.55) 70%, rgba(0,119,182,0.92) 100%)" }} />
                <div className={styles.programPhotoText}>
                  <h3 className={styles.programPhotoTitle}>Semesta Camp</h3>
                  <p className={styles.programPhotoDescription}>Program relawan berdurasi 1 hari yang mempertemukan relawan dengan komunitas lokal di lokasi tertentu.</p>
                </div>
              </div>
              <div className={styles.programPhotoItem} style={{ background: "linear-gradient(165deg, rgba(124,58,237,0.15) 0%, rgba(124,58,237,0.85) 100%)", boxShadow: "0 20px 60px rgba(124,58,237,0.15), 0 4px 24px rgba(168,85,247,0.1)" }}>
                <Image
                  src="/sjn-kategori.jpeg"
                  alt="Semesta Jelajah Nusantara"
                  fill
                  style={{ objectFit: 'cover' }}
                  className={styles.programPhotoImg}
                />
                <div className={styles.programPhotoOverlay} style={{ background: "linear-gradient(180deg, transparent 30%, rgba(124,58,237,0.55) 70%, rgba(91,33,182,0.92) 100%)" }} />
                <div className={styles.programPhotoText}>
                  <h3 className={styles.programPhotoTitle}>Semesta Jelajah Nusantara</h3>
                  <p className={styles.programPhotoDescription}>Program relawan yang memungkinkan peserta tinggal dan bekerja langsung dengan komunitas selama 10-14 hari.</p>
                </div>
              </div>
            </div>

            <div className={styles.programCardText}>
              <h2 className={styles.programCardTitle}>
                Berkontribusi dengan<br/>
                Cara yang Kamu Suka
              </h2>
              <p className={styles.programCardDescription}>
                Ada dua kategori program relawan yang bisa kamu pilih sesuai dengan ketersediaan dan minatnmu
              </p>
            </div>
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
              <span className={styles.titleAccent}>Sesuai Minatmu</span>
            </h2>
            <p className={styles.sectionDescription}>
              Beragam program relawan yang bisa kamu ikuti untuk berkontribusi di berbagai bidang dan lokasi di seluruh Indonesia.
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
            {loading ? (
              <div className={styles.previewEmpty}><p>Memuat program...</p></div>
            ) : filteredPrograms.length > 0 ? (
              filteredPrograms.slice(0, 8).map(program => (
                <div key={program.id} className={styles.previewCard}>
                  <div className={styles.previewCardImage}>
                    <Image
                      src={program.image_url || "/program-preview-1.jpg"}
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
                      <div className={styles.previewMetaItem}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                          <line x1="16" y1="2" x2="16" y2="6"/>
                          <line x1="8" y1="2" x2="8" y2="6"/>
                          <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        <span>
                          {formatDate(program.event_start_date) || "Segera Hadir"}
                        </span>
                      </div>
                      <div className={styles.previewMetaItem}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                          <circle cx="12" cy="10" r="3"/>
                        </svg>
                        <span>{program.location || "Indonesia"}</span>
                      </div>
                    </div>

                    {/* Deadline Badge */}
                    <div className={`${styles.previewDeadlineBadge} ${getBadgeClass(program.category)}`}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                      </svg>
                      <span>
                        {formatDateRange(program.event_start_date, program.event_end_date) || "Segera Daftar"}
                      </span>
                    </div>
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
              <span className={styles.titleAccent}>Para Relawan Kami</span>
            </h2>
          </div>

          <div className={styles.galleryGrid}>
            {[
              "/galeri/galeri1.jpeg",
              "/galeri/galeri2.jpeg",
              "/galeri/galeri3.jpeg",
              "/galeri/galeri4.jpeg",
              "/galeri/galeri5.jpeg",
              "/galeri/galeri6.JPG"
            ].map((src, index) => (
              <div key={index} className={`${styles.galleryItem} ${index === 0 ? styles.galleryItemLarge : ""}`}>
                <Image
                  src={src}
                  alt=""
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
            ))}
          </div>

          {/* <div className={styles.galleryActions}>
            <a href="#" className={styles.viewAllButton}>
              <span>Lihat Semua Galeri</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
          </div> */}
        </div>
      </section>

      {/* Liputan Section */}
      {/* <section className={styles.liputanSection}>
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>Liputan</span>
            <h2 className={styles.sectionTitle}>
              Berita & Cerita dari<br/>
              <span className={styles.titleAccent}>Semesta Manusia</span>
            </h2>
            <p className={styles.sectionDescription}>
              Ikuti perkembangan terbaru tentang kegiatan dan program relawan yang dilakukan oleh komunitas Semesta Manusia di berbagai daerah.
            </p>
          </div>

          <div className={styles.liputanGrid}>
            {loading ? (
              <div className={styles.previewEmpty}><p>Memuat liputan...</p></div>
            ) : liputan.slice(0, 4).map((item) => (
              <div key={item.id} className={styles.liputanCard}>
                <div className={styles.liputanCardImage}>
                  <Image
                    src={item.image_url || "/liputan-placeholder.svg"}
                    alt={item.title}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div className={styles.liputanCardBody}>
                  <h3 className={styles.liputanCardTitle}>{item.title}</h3>
                  <p className={styles.liputanCardDescription}>{item.description}</p>
                </div>
                <a
                  href={item.source_url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.liputanCardButton}
                >
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
      </section> */}

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
              Semesta Manusia menjalin kerja sama dengan berbagai pihak untuk memperluas dampak positif program relawan di seluruh Indonesia.
            </p>
          </div>

          <div className={styles.partnerGrid}>
            {[
              { name: "Manusa", image: "/manusa.png" },
              { name: "GVA", image: "/gva.png" },
              { name: "Akar", image: "/akar.png" }
            ].map((partner, index) => (
              <div key={index} className={styles.partnerCard}>
                <Image src={partner.image} alt={partner.name} fill style={{ objectFit: 'contain' }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section id="ulasan" className={styles.reviewsSection}>
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>Ulasan</span>
            <h2 className={styles.sectionTitle}>
              Cerita dari<br/>
              <span className={styles.titleAccent}>Para Relawan</span>
            </h2>
            <p className={styles.sectionDescription}>
              Pengalaman nyata mereka yang sudah mengikuti program Semesta. Bagikan ceritamu juga setelah mengikuti program!
            </p>
          </div>

          {reviewsLoading ? (
            <div className={styles.reviewsSkeleton}>
              {[1, 2, 3].map((i) => (
                <div key={i} className={styles.reviewSkeletonCard} />
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className={styles.reviewsEmpty}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <p>Belum ada ulasan. Jadilah yang pertama!</p>
            </div>
          ) : (
            <ReviewSlider reviews={reviews} />
          )}

          <div className={styles.reviewsCta}>
            <Link href="/user/reviews" className={styles.reviewsCtaButton}>
              <span>Beri Ulasanmu</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaWrapper}>
          {/* Layer 1: Photo background, full cover, rounded mengikuti container */}
            <div className={styles.ctaPhotoLayer}>
              <Image
                src="/last-section2.png"
                alt="Relawan Semesta Manusia"
                fill
                className={styles.ctaPhotoImg}
              />
            </div>
          <div className={styles.ctaContainer}>
            {/* Layer 2: Overlay gradient biru di atas foto */}
            <div className={styles.ctaOverlay} />

            {/* Layer 3: Konten teks & logo, paling atas */}
            <div className={styles.ctaContent}>
              <div className={styles.ctaLogoWrap}>
                <Image
                  src="/LOGO%20SEMESTA%20MANUSIA.png"
                  width={56}
                  height={56}
                  alt="Semesta Manusia"
                  className={styles.ctaLogoImg}
                />
              </div>

              <h2 className={styles.ctaHeading}>
                Semesta Butuh Versi Terbaikmu!
              </h2>
              <p className={styles.ctaSubheading}>
                Perjalananmu bermakna dimulai dari satu langkah.<br />
                Jadilah bagian dari gerakan yang nyata, berbagi dampak ke seluruh Nusantara.
              </p>
              <Link href="/user/program" className={styles.ctaButton}>
                <span>Daftar Sekarang</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
            </div>

            <div className={styles.ctaSlogan}>
              BERBAGI | BERMAKNA | BERGERAK LEBIH LUAS
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <section id="kontak">
        <Footer />
      </section>
    </div>
  );
}

function ReviewSlider({ reviews }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [slidesPerView, setSlidesPerView] = useState(3);
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef(null);
  const slidesRef = useRef([]);
  const dragStartX = useRef(0);
  const dragStartScroll = useRef(0);
  const autoplayTimerRef = useRef(null);
  const isPausedRef = useRef(false);
  const programmaticScrollRef = useRef(false);
  const total = reviews.length;
  const pageCount = Math.max(1, total - slidesPerView + 1);

  const goTo = useCallback((idx) => {
    if (total === 0) return;
    const wrapped = ((idx % pageCount) + pageCount) % pageCount;
    programmaticScrollRef.current = true;
    setActiveIndex(wrapped);
  }, [total, pageCount]);

  const next = useCallback(() => {
    if (total === 0) return;
    programmaticScrollRef.current = true;
    setActiveIndex((i) => (i + 1) % pageCount);
  }, [total, pageCount]);

  const prev = useCallback(() => {
    if (total === 0) return;
    programmaticScrollRef.current = true;
    setActiveIndex((i) => (i - 1 + pageCount) % pageCount);
  }, [total, pageCount]);

  // Responsive slidesPerView
  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
      if (w < 640) setSlidesPerView(1);
      else if (w < 1024) setSlidesPerView(2);
      else setSlidesPerView(3);
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  // Autoplay
  useEffect(() => {
    if (pageCount <= 1) return undefined;
    autoplayTimerRef.current = setInterval(() => {
      if (!isPausedRef.current) {
        programmaticScrollRef.current = true;
        setActiveIndex((i) => (i + 1) % pageCount);
      }
    }, 4500);
    return () => clearInterval(autoplayTimerRef.current);
  }, [pageCount]);

  // Track scrolling position for activeIndex sync (only during drag, not programmatic)
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;
    let raf = 0;
    const handle = () => {
      if (programmaticScrollRef.current) {
        programmaticScrollRef.current = false;
        return;
      }
      if (!isDragging) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const slides = slidesRef.current.filter(Boolean);
        if (slides.length === 0) return;
        const scrollLeft = track.scrollLeft;
        let nearest = 0;
        let minDiff = Infinity;
        slides.forEach((slide, i) => {
          const diff = Math.abs(slide.offsetLeft - scrollLeft);
          if (diff < minDiff) {
            minDiff = diff;
            nearest = i;
          }
        });
        setActiveIndex(Math.min(nearest, pageCount - 1));
      });
    };
    track.addEventListener("scroll", handle, { passive: true });
    return () => {
      track.removeEventListener("scroll", handle);
      cancelAnimationFrame(raf);
    };
  }, [isDragging, pageCount]);

  // Scroll to active page when activeIndex changes via buttons or autoplay.
  // Each page = slidesPerView cards; we snap to the first card of the page.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const targetSlide = slidesRef.current[activeIndex];
    if (!targetSlide) return;
    const targetLeft = targetSlide.offsetLeft;
    track.scrollTo({ left: targetLeft, behavior: isDragging ? "auto" : "smooth" });
  }, [activeIndex, isDragging]);

  const onPointerDown = (e) => {
    const track = trackRef.current;
    if (!track) return;
    isPausedRef.current = true;
    setIsDragging(true);
    dragStartX.current = e.clientX;
    dragStartScroll.current = track.scrollLeft;
    track.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!isDragging) return;
    const track = trackRef.current;
    if (!track) return;
    const dx = e.clientX - dragStartX.current;
    track.scrollLeft = dragStartScroll.current - dx;
  };

  const endDrag = (e) => {
    if (!isDragging) return;
    const track = trackRef.current;
    setIsDragging(false);
    isPausedRef.current = false;
    if (track && e?.pointerId != null) {
      track.releasePointerCapture?.(e.pointerId);
    }
  };

  const onMouseEnter = () => { isPausedRef.current = true; };
  const onMouseLeave = () => { if (!isDragging) isPausedRef.current = false; };

  if (total === 0) return null;

  return (
    <div
      className={styles.reviewsSlider}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <button
        type="button"
        aria-label="Ulasan sebelumnya"
        className={`${styles.sliderArrow} ${styles.sliderArrowLeft}`}
        onClick={prev}
        disabled={pageCount <= 1}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      <div
        ref={trackRef}
        className={`${styles.sliderTrack} ${isDragging ? styles.sliderTrackDragging : ""}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={(e) => { if (isDragging) endDrag(e); }}
      >
        {reviews.map((review, i) => (
          <article
            key={review.id}
            ref={(el) => { if (el) slidesRef.current[i] = el; }}
            className={styles.reviewCard}
          >
            <div className={styles.reviewStars} aria-label={`Rating ${review.rating} dari 5`}>
              {[1, 2, 3, 4, 5].map((s) => (
                <svg
                  key={s}
                  viewBox="0 0 24 24"
                  fill={review.rating >= s ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="2"
                  className={styles.reviewStar}
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              ))}
            </div>
            <p className={styles.reviewContent}>&ldquo;{review.content}&rdquo;</p>
            <div className={styles.reviewFooter}>
              <div className={styles.reviewAvatar}>
                {review.name ? review.name.charAt(0).toUpperCase() : "?"}
              </div>
              <div className={styles.reviewMeta}>
                <div className={styles.reviewName}>{review.name}</div>
                {review.institution && (
                  <div className={styles.reviewInstitution}>{review.institution}</div>
                )}
                <div className={styles.reviewProgram}>{review.program_title}</div>
              </div>
            </div>
          </article>
        ))}
      </div>

      <button
        type="button"
        aria-label="Ulasan berikutnya"
        className={`${styles.sliderArrow} ${styles.sliderArrowRight}`}
        onClick={next}
        disabled={pageCount <= 1}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      <div className={styles.sliderDots} role="tablist" aria-label="Navigasi ulasan">
        {Array.from({ length: pageCount }).map((_, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={i === activeIndex}
            aria-label={`Ke ulasan ${i + 1}`}
            className={`${styles.sliderDot} ${i === activeIndex ? styles.sliderDotActive : ""}`}
            onClick={() => goTo(i)}
          />
        ))}
      </div>
    </div>
  );
}
