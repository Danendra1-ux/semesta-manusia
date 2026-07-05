"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar.jsx";
import Footer from "@/components/Footer.jsx";
import styles from "./page.module.css";

export default function ProgramPage() {
  const router = useRouter();
  
  // State untuk API Data
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State untuk UI & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("semua");
  const [sortBy, setSortBy] = useState("terbaru");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  
  // State untuk Paginasi
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 16;

  // 1. Mengambil data dari API
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await fetch('/api/programs?is_active=true');
        if (!response.ok) throw new Error('Gagal mengambil data program');
        const data = await response.json();
        setPrograms(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  // 2. Menutup dropdown saat klik di luar area
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showSortDropdown && !e.target.closest(`.${styles.sortWrapper}`)) {
        setShowSortDropdown(false);
      }
      if (showFilterDropdown && !e.target.closest(`.${styles.filterWrapper}`)) {
        setShowFilterDropdown(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showSortDropdown, showFilterDropdown]);

  const sortOptions = [
    { value: "terbaru", label: "Aktivitas Terbaru" },
    { value: "terlama", label: "Aktivitas Terlama" },
    { value: "az", label: "Nama A-Z" },
    { value: "za", label: "Nama Z-A" }
  ];

  const filterOptions = [
    { value: "semua", label: "Semua" },
    { value: "camp", label: "Semesta Camp" },
    { value: "sjn", label: "Semesta Jelajah Nusantara" }
  ];

  const getActiveFilterLabel = () => {
    return filterOptions.find(f => f.value === activeFilter)?.label || "Filter";
  };

  // 3. Logika Filter & Sort menggunakan data dari API (programs)
  const filteredPrograms = useMemo(() => {
    let result = [...programs];

    if (activeFilter === "camp") {
      result = result.filter(p => p.category === "Semesta Camp");
    } else if (activeFilter === "sjn") {
      result = result.filter(p => p.category === "SJN");
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p =>
        (p.title && p.title.toLowerCase().includes(query)) ||
        (p.description && p.description.toLowerCase().includes(query)) ||
        (p.location && p.location.toLowerCase().includes(query))
      );
    }

    result.sort((a, b) => {
      if (sortBy === "terbaru") {
        if (a.category === "SJN" && b.category !== "SJN") return -1;
        if (a.category !== "SJN" && b.category === "SJN") return 1;
        return b.id - a.id;
      } else if (sortBy === "terlama") {
        if (a.category === "SJN" && b.category !== "SJN") return -1;
        if (a.category !== "SJN" && b.category === "SJN") return 1;
        return a.id - b.id;
      } else if (sortBy === "az") {
        if (a.category === "SJN" && b.category !== "SJN") return -1;
        if (a.category !== "SJN" && b.category === "SJN") return 1;
        const ta = (a.title || "").replace(/^Semesta (Camp|Jelajah Nusantara) #\d+[:]? /, "");
        const tb = (b.title || "").replace(/^Semesta (Camp|Jelajah Nusantara) #\d+[:]? /, "");
        return ta.localeCompare(tb, "id", { sensitivity: "base" });
      } else if (sortBy === "za") {
        if (a.category === "SJN" && b.category !== "SJN") return -1;
        if (a.category !== "SJN" && b.category === "SJN") return 1;
        const ta = (a.title || "").replace(/^Semesta (Camp|Jelajah Nusantara) #\d+[:]? /, "");
        const tb = (b.title || "").replace(/^Semesta (Camp|Jelajah Nusantara) #\d+[:]? /, "");
        return ta.localeCompare(tb, "id", { sensitivity: "base" }) * -1;
      }
      return 0;
    });

    return result;
  }, [programs, searchQuery, activeFilter, sortBy]);

  // 4. Logika Paginasi
  const totalPages = Math.ceil(filteredPrograms.length / itemsPerPage);
  const paginatedPrograms = filteredPrograms.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleFilter = (value) => {
    setActiveFilter(value);
    setShowFilterDropdown(false);
    setCurrentPage(1);
  };

  const handleSort = (option) => {
    setSortBy(option);
    setShowSortDropdown(false);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const getBadgeClass = (category) => {
    if (category === "SJN") return styles.jelajah;
    if (category === "Semesta Camp") return styles.camp;
    return styles.placeholder;
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

  return (
    <div className={styles.programPage}>
      {/* Navbar */}
      <Navbar />

      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderContainer}>
          <button className={styles.backButton} onClick={() => router.back()}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <h1 className={styles.pageTitle}>Cari Program</h1>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className={styles.searchFilterBar}>
        <div className={styles.searchFilterBarContainer}>
          <div className={styles.searchBar}>
            <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Cari program..."
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>

          <div className={styles.actionButtons}>
            {/* Filter Dropdown */}
            <div className={styles.filterWrapper}>
              <button
                className={styles.actionButton}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFilterDropdown(!showFilterDropdown);
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="4" y1="21" x2="4" y2="14"/>
                  <line x1="4" y1="10" x2="4" y2="3"/>
                  <line x1="12" y1="21" x2="12" y2="12"/>
                  <line x1="12" y1="8" x2="12" y2="3"/>
                  <line x1="20" y1="21" x2="20" y2="16"/>
                  <line x1="20" y1="12" x2="20" y2="3"/>
                  <line x1="1" y1="14" x2="7" y2="14"/>
                  <line x1="9" y1="8" x2="15" y2="8"/>
                  <line x1="17" y1="16" x2="23" y2="16"/>
                </svg>
                <span>{getActiveFilterLabel()}</span>
              </button>

              {showFilterDropdown && (
                <div className={styles.filterDropdown}>
                  {filterOptions.map((option) => (
                    <button
                      key={option.value}
                      className={`${styles.filterOption} ${activeFilter === option.value ? styles.active : ''}`}
                      onClick={() => handleFilter(option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className={styles.sortWrapper}>
              <button
                className={styles.actionButton}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSortDropdown(!showSortDropdown);
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <polyline points="19 12 12 19 5 12"/>
                </svg>
                <span>Urutkan: {sortOptions.find(o => o.value === sortBy)?.label}</span>
              </button>

              {showSortDropdown && (
                <div className={styles.sortDropdown}>
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      className={`${styles.sortOption} ${sortBy === option.value ? styles.active : ''}`}
                      onClick={() => handleSort(option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className={styles.mainContent}>
        
        {/* Indikator Loading & Error */}
        {loading && (
          <div className={styles.emptyState} style={{ padding: '4rem 2rem' }}>
            <h3>Memuat program...</h3>
          </div>
        )}

        {error && !loading && (
          <div className={styles.emptyState} style={{ padding: '4rem 2rem' }}>
            <h3>Error Terjadi</h3>
            <p>{error}</p>
          </div>
        )}

        {/* Program Grid */}
        {!loading && !error && (
          <div className={styles.programGrid}>
            {paginatedPrograms.length > 0 ? (
              paginatedPrograms.map((program) => (
                <div key={program.id} className={styles.programCard}>
                  
                  {/* Pengecekan URL Gambar. Menggunakan image_url dari API, atau fallback ke image */}
                  {(program.image_url || program.image) && (
                    <div className={styles.programCardImage}>
                      <Image
                        src={program.image_url || program.image}
                        alt={program.title}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                      <span className={`${styles.programCardBadge} ${getBadgeClass(program.category)}`}>
                        {program.category}
                      </span>
                    </div>
                  )}

                  <div className={styles.programCardBody}>
                    <h3 className={styles.programCardTitle}>{program.title}</h3>
                    <p className={styles.programCardDescription}>{program.description}</p>
                    <div className={styles.programCardMeta}>
                      <div className={styles.programCardMetaItem}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                          <line x1="16" y1="2" x2="16" y2="6"/>
                          <line x1="8" y1="2" x2="8" y2="6"/>
                          <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        {/* Memanggil event_start_date ke icon kalender */}
                        <span>
                          {program.event_start_date 
                            ? new Date(program.event_start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) 
                            : "Segera Hadir"}
                        </span>
                      </div>
                      <div className={styles.programCardMetaItem}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                          <circle cx="12" cy="10" r="3"/>
                        </svg>
                        <span>{program.location || "Indonesia"}</span>
                      </div>
                    </div>

                    {/* Registration / Event Deadline Badge */}
                    <div className={`${styles.deadlineBadge} ${getBadgeClass(program.category)}`}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                      </svg>
                      {/* Memasukkan format tanggal ke dalam Badge */}
                      <span>
                        {program.event_start_date 
                          ? formatDateRange(program.event_start_date, program.event_end_date)
                          : "Segera Daftar"}
                      </span>
                    </div>

                  </div>
                  <Link href={`/user/program/${program.id}`} className={styles.programCardButton}>
                    <span>Daftar</span>
                  </Link>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <h3>Tidak ada program ditemukan</h3>
                <p>Coba ubah kata kunci pencarian atau filter yang digunakan.</p>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && filteredPrograms.length > 0 && (
          <div className={styles.pagination}>
            <button
              className={styles.paginationButton}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </button>

            {getPageNumbers().map((page, index) => (
              page === '...' ? (
                <span key={`ellipsis-${index}`} className={styles.paginationEllipsis}>...</span>
              ) : (
                <button
                  key={page}
                  className={`${styles.paginationButton} ${currentPage === page ? styles.active : ''}`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              )
            ))}

            <button
              className={styles.paginationButton}
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}