"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import styles from "./GallerySlider.module.css";
import pageStyles from "@/app/user/landingpage/landingpage.module.css";

/* =========================================================
   DATA — tambah program baru cukup push ke array ini.
   ========================================================= */

const galleryPrograms = [
  {
    id: 1,
    title: "Semesta Jelajah Nusantara #1 — Sumba, NTT",
    date: "03–11 Februari 2025",
    image: "/galeri/galeri1.webp",
    stats: [
      { label: "Delegasi & Fasilitator", value: "21" },
      { label: "Jiwa Dijangkau", value: "±1.444" },
      { label: "Program Terlaksana", value: "10" },
    ],
    categories: [
      {
        name: "Health Impact",
        items: [
          "Medical Check Up masyarakat",
          "Pemeriksaan kesehatan gigi anak SD",
          "Edukasi pencegahan penyakit via sosialisasi bubuk abate",
        ],
      },
      {
        name: "Education & Youth Development",
        items: [
          "Pojok Baca untuk minat baca anak",
          "Cerdas Cermat siswa SMP",
          "Kelas Inspirasi dan Budaya",
        ],
      },
      {
        name: "Environmental Impact",
        items: [
          "Ocean Beach Clean Up",
          "Edukasi pemanfaatan sampah",
          "Program pembuatan Ecobrick",
        ],
      },
      {
        name: "Economic Empowerment",
        items: ["Pendampingan pengelolaan UMKM lokal"],
      },
      {
        name: "Cultural Preservation",
        items: [
          "Produksi dokumenter budaya & wisata Desa Kuta Londalima",
          "Dokumentasi eksplorasi budaya dan potensi wisata Sumba",
        ],
      },
    ],
  },
  {
    id: 2,
    title: "Semesta Jelajah Nusantara #2 — Wakatobi, Sultra",
    date: "07–21 Agustus 2025",
    image: "/galeri/galeri2.webp",
    stats: [
      { label: "Delegasi & Fasilitator", value: "31" },
      { label: "Jiwa Dijangkau", value: "±1.500" },
      { label: "Program Terlaksana", value: "12" },
    ],
    categories: [
      {
        name: "Health Impact",
        items: [
          "Medical Check Up masyarakat",
          "Sosialisasi Bantuan Hidup Dasar (BHD)",
          "Edukasi kesehatan reproduksi & Calon Pengantin Pintar",
          "Sosialisasi PHBS",
        ],
      },
      {
        name: "Education & Community Development",
        items: [
          "Kelas Literasi",
          "Sosialisasi peduli bencana",
          "Workshop kerajinan tangan",
        ],
      },
      {
        name: "Economic Empowerment",
        items: [
          "Pelatihan digitalisasi masyarakat",
          "Workshop lilin aromaterapi dari minyak jelantah",
          "Workshop totebag dari karung",
          "Demo masak bersama ibu-ibu",
        ],
      },
      {
        name: "Environmental Impact",
        items: [
          "Workshop daur ulang limbah rumah tangga",
          "Kelas Alam & Workshop Wind Chimes",
        ],
      },
      {
        name: "Cultural & Social Engagement",
        items: [
          "Dokumentasi eksplorasi sosial, budaya, dan potensi wisata Wakatobi",
        ],
      },
    ],
  },
  {
    id: 3,
    title: "Semesta Jelajah Nusantara #3 — Banda Neira, Maluku",
    date: "15–30 Januari 2026",
    image: "/galeri/galeri3.webp",
    stats: [
      { label: "Delegasi & Fasilitator", value: "21" },
      { label: "Jiwa Dijangkau", value: "±300" },
      { label: "Program Terlaksana", value: "10" },
    ],
    categories: [
      {
        name: "Health Impact",
        items: [
          "Medical Check Up masyarakat",
          "Pemeriksaan kesehatan ibu hamil",
          "Pengukuran antropometri balita",
          "Penyuluhan ASI dan MPASI",
          "Sosialisasi PHBS",
        ],
      },
      {
        name: "Education & Youth Development",
        items: [
          "Kelas Inspirasi dan Budaya",
          "English Club",
          "Workshop Fotografi dan Videografi",
        ],
      },
      {
        name: "Cultural Preservation & Tourism Promotion",
        items: [
          "Produksi dokumenter wisata & budaya Banda Neira",
          "Dokumentasi & publikasi potensi budaya lokal",
        ],
      },
      {
        name: "Economic Empowerment",
        items: ["Workshop Eco Printing"],
      },
      {
        name: "Cultural & Social Engagement",
        items: [
          "Dokumentasi eksplorasi sosial, budaya, dan potensi wisata Banda Neira",
        ],
      },
    ],
  },
  {
    id: 4,
    title: "Semesta Camp #4 — Manggarai, Flores",
    date: "22–30 Maret 2025",
    image: "/galeri/galeri4.webp",
    stats: [
      { label: "Delegasi & Fasilitator", value: "25" },
      { label: "Jiwa Dijangkau", value: "±890" },
      { label: "Program Terlaksana", value: "11" },
    ],
    categories: [
      {
        name: "Health Impact",
        items: [
          "Medical Check Up masyarakat",
          "Edukasi sanitasi dan air bersih",
          "Penyuluhan gizi balita",
        ],
      },
      {
        name: "Education & Youth Development",
        items: [
          "Pembuatan pojok baca desa",
          "Kelas inspirasi dan mentoring siswa",
          "Workshop seni dan budaya Flores",
        ],
      },
      {
        name: "Environmental Impact",
        items: [
          "Reboisasi lahan kritis",
          "Workshop pertanian organik",
          "Edukasi konservasi air",
        ],
      },
      {
        name: "Economic Empowerment",
        items: [
          "Pendampingan usaha tenun tradisional",
          "Pelatihan branding produk lokal",
        ],
      },
      {
        name: "Cultural Preservation",
        items: [
          "Dokumentasi tradisi Wae Rubu",
          "Eksplorasi potensi wisata adat",
        ],
      },
    ],
  },
  {
    id: 5,
    title: "Semesta Camp #5 — Ende, Flores",
    date: "08–18 Mei 2025",
    image: "/galeri/galeri5.webp",
    stats: [
      { label: "Delegasi & Fasilitator", value: "28" },
      { label: "Jiwa Dijangkau", value: "±1.200" },
      { label: "Program Terlaksana", value: "13" },
    ],
    categories: [
      {
        name: "Health Impact",
        items: [
          "Medical Check Up keliling",
          "Imunisasi dan pemberian vitamin anak",
          "Sosialisasi hidup sehat",
        ],
      },
      {
        name: "Education & Community Development",
        items: [
          "Renovasi dan pembangunan ruang kelas",
          "Program literasi digital",
          "Workshop keterampilan anak muda",
        ],
      },
      {
        name: "Environmental Impact",
        items: [
          "Pelatihan pengolahan sampah desa",
          "Penanaman pohon mangrove",
          "Edukasi ekosistem pesisir",
        ],
      },
      {
        name: "Economic Empowerment",
        items: [
          "Pendampingan koperasi desa",
          "Pelatihan digital marketing UMKM",
        ],
      },
      {
        name: "Cultural Preservation",
        items: [
          "Festival budaya Ende",
          "Dokumentasi tradisi lisan",
        ],
      },
    ],
  },
  {
    id: 6,
    title: "Semesta Camp #6 — Nias Selatan, Sumut",
    date: "20–28 Juli 2025",
    image: "/galeri/galeri6.webp",
    stats: [
      { label: "Delegasi & Fasilitator", value: "22" },
      { label: "Jiwa Dijangkau", value: "±1.650" },
      { label: "Program Terlaksana", value: "14" },
    ],
    categories: [
      {
        name: "Health Impact",
        items: [
          "Medical Check Up masyarakat Nias",
          "Pemeriksaan kesehatan gigi dan mulut",
          "Sosialisasi nutrisi dan kesehatan ibu",
        ],
      },
      {
        name: "Education & Youth Development",
        items: [
          "Kelas literasi dan numerasi",
          "Beasiswa pelajar berprestasi",
          "Workshop coding untuk anak muda",
        ],
      },
      {
        name: "Environmental Impact",
        items: [
          "Bersih pantai dan terumbu karang",
          "Penanaman bakau",
          "Edukasi lingkungan sekolah",
        ],
      },
      {
        name: "Economic Empowerment",
        items: [
          "Pelatihan kerajinan tangan lokal",
          "Pendampingan pariwisata desa",
        ],
      },
      {
        name: "Cultural Preservation",
        items: [
          "Dokumentasi budaya Nias Selatan",
          "Festival tarian dan musik tradisional",
        ],
      },
    ],
  },
];

/* =========================================================
   COMPONENT
   ========================================================= */

function getCategoryGradient(index) {
  const gradients = [
    "linear-gradient(180deg, transparent 30%, rgba(0,191,255,0.85) 100%)",
    "linear-gradient(180deg, transparent 30%, rgba(124,58,237,0.85) 100%)",
    "linear-gradient(180deg, transparent 30%, rgba(16,185,129,0.85) 100%)",
    "linear-gradient(180deg, transparent 30%, rgba(245,158,11,0.85) 100%)",
    "linear-gradient(180deg, transparent 30%, rgba(239,68,68,0.85) 100%)",
    "linear-gradient(180deg, transparent 30%, rgba(99,102,241,0.85) 100%)",
  ];
  return gradients[index % gradients.length];
}

function ChevronIcon({ expanded }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={expanded ? styles.chevronExpanded : styles.chevronCollapsed}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function StatBar({ stats }) {
  return (
    <div className={styles.statBar}>
      {stats.map((s, i) => (
        <div key={s.label} className={styles.statItem}>
          <span className={styles.statValue}>{s.value}</span>
          <span className={styles.statLabel}>{s.label}</span>
          {i < stats.length - 1 && <span className={styles.statDivider} />}
        </div>
      ))}
    </div>
  );
}

function CategoryBlock({ category, index }) {
  const borderColor = [
    "rgba(0,191,255,0.3)",
    "rgba(124,58,237,0.3)",
    "rgba(16,185,129,0.3)",
    "rgba(245,158,11,0.3)",
    "rgba(239,68,68,0.3)",
    "rgba(99,102,241,0.3)",
  ][index % 6];

  return (
    <div className={styles.categoryBlock} style={{ borderTopColor: borderColor }}>
      <h4 className={styles.categoryName}>{category.name}</h4>
      <ul className={styles.categoryList}>
        {category.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function ExpandPanel({ program }) {
  return (
    <div className={styles.expandPanel}>
      <StatBar stats={program.stats} />
      <div className={styles.categoriesGrid}>
        {program.categories.map((cat, i) => (
          <CategoryBlock key={cat.name} category={cat} index={i} />
        ))}
      </div>
    </div>
  );
}

/* Arrow button used left/right of the slider */
function SliderArrows({ onPrev, onNext, prevDisabled, nextDisabled }) {
  return (
    <>
      <button
        type="button"
        aria-label="Program sebelumnya"
        className={`${styles.sliderArrow} ${styles.sliderArrowLeft}`}
        onClick={onPrev}
        disabled={prevDisabled}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <button
        type="button"
        aria-label="Program berikutnya"
        className={`${styles.sliderArrow} ${styles.sliderArrowRight}`}
        onClick={onNext}
        disabled={nextDisabled}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </>
  );
}

/* Dot indicators below the slider */
function SliderDots({ count, activeIndex, onSelect }) {
  return (
    <div className={styles.sliderDots} role="tablist" aria-label="Navigasi galeri">
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          type="button"
          role="tab"
          aria-selected={i === activeIndex}
          aria-label={`Ke program ${i + 1}`}
          className={`${styles.sliderDot} ${i === activeIndex ? styles.sliderDotActive : ""}`}
          onClick={() => onSelect(i)}
        />
      ))}
    </div>
  );
}

/* =========================================================
   MAIN SLIDER — manages expand + scroll sync
   ========================================================= */

export default function GallerySlider() {
  const [expandedId, setExpandedId] = useState(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [slidesPerView, setSlidesPerView] = useState(3);
  const trackRef = useRef(null);
  const total = galleryPrograms.length;
  const pageCount = Math.max(1, total - slidesPerView + 1);

  // Responsive slidesPerView
  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
      if (w < 768) setSlidesPerView(1);
      else if (w < 1024) setSlidesPerView(2);
      else setSlidesPerView(3);
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  // Refs avoid recreating handleScroll and prevent stale closures
  const pageIndexRef = useRef(pageIndex);
  useEffect(() => { pageIndexRef.current = pageIndex; }, [pageIndex]);

  const slidesPerViewRef = useRef(slidesPerView);
  useEffect(() => { slidesPerViewRef.current = slidesPerView; }, [slidesPerView]);

  const pageCountRef = useRef(pageCount);
  useEffect(() => { pageCountRef.current = pageCount; }, [pageCount]);

  // Throttled scroll-sync — RAF ensures max 1-2 recalc per scroll event
  const rafRef = useRef(null);
  const handleScroll = useCallback(() => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const track = trackRef.current;
      if (!track || !track.children.length) return;

      const card = track.children[0];
      if (!card) return;

      // Card width + gap gives us the page step
      const cardWidth = card.offsetWidth;
      const gap = 24; // 1.5rem gap between cards
      const pageStep = cardWidth + gap;

      // Which page is mostly scrolled into view
      const p = Math.max(0, Math.min(Math.round(track.scrollLeft / pageStep), pageCountRef.current - 1));
      if (p !== pageIndexRef.current) setPageIndex(p);
    });
  }, []);

  // Manual page change — triggered by arrow buttons or dot clicks
  const goToPage = useCallback((idx) => {
    const wrapped = ((idx % pageCount) + pageCount) % pageCount;
    setPageIndex(wrapped);

    if (trackRef.current && trackRef.current.children[wrapped]) {
      trackRef.current.scrollTo({
        left: trackRef.current.children[wrapped].offsetLeft,
        behavior: "smooth",
      });
    }
  }, [pageCount]);

  const next = useCallback(() => {
    if (pageIndex < pageCount - 1) goToPage(pageIndex + 1);
  }, [pageIndex, pageCount, goToPage]);

  const prev = useCallback(() => {
    if (pageIndex > 0) goToPage(pageIndex - 1);
  }, [pageIndex, goToPage]);

  return (
    <section id="galeri" className={styles.gallerySection}>
      <div className={pageStyles.sectionContainer}>
        <div className={pageStyles.sectionHeader}>
          <span className={pageStyles.sectionTag}>Galeri</span>
          <h2 className={pageStyles.sectionTitle}>
            Momen Berharga dari<br />
            <span className={pageStyles.titleAccent}>Para Relawan Kami</span>
          </h2>
          <p className={pageStyles.sectionDescription}>
            Jelajahi program-program yang telah kita jalankan bersama untuk menciptakan dampak nyata di seluruh Indonesia.
          </p>
        </div>

        <div className={styles.sliderWrapper}>
          <SliderArrows
            onPrev={prev}
            onNext={next}
            prevDisabled={pageIndex <= 0}
            nextDisabled={pageIndex >= pageCount - 1}
          />

          <div
            ref={trackRef}
            className={styles.sliderTrack}
            onScroll={handleScroll}
          >
            {galleryPrograms.map((program, idx) => {
              const isExpanded = expandedId === program.id;

              return (
                <div
                  key={program.id}
                  className={styles.programCard}
                  style={{ "--overlay": getCategoryGradient(idx) }}
                  onClick={() => toggleExpand(program.id)}
                >
                  {/* Image + chevron — wrapped in cardImageRow */}
                  <div className={styles.cardImageRow}>
                    <div className={styles.cardImage}>
                      <Image
                        src={program.image}
                        alt={program.title}
                        fill
                        style={{ objectFit: "cover" }}
                        priority={idx < 3}
                      />
                      <div className={styles.cardOverlay} style={{ background: "var(--overlay)" }} />
                      <div className={styles.cardInfo}>
                        <div>
                          <h3 className={styles.cardTitle}>{program.title}</h3>
                          <p className={styles.cardDate}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                              <line x1="16" y1="2" x2="16" y2="6"/>
                              <line x1="8" y1="2" x2="8" y2="6"/>
                              <line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                            {program.date}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Chevron — overlay on bottom-right of image */}
                    <div className={styles.expandTrigger}>
                      <ChevronIcon expanded={isExpanded} />
                    </div>
                  </div>

                  {/* Expanded detail panel — animates height (outside cardImageRow) */}
                  <div className={`${styles.expandContainer} ${isExpanded ? styles.expandOpen : ""}`}>
                    <div className={styles.expandInner}>
                      {isExpanded && <ExpandPanel program={program} />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <SliderDots
            count={pageCount}
            activeIndex={pageIndex}
            onSelect={goToPage}
          />
        </div>
      </div>
    </section>
  );
}
