"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar.jsx";
import Footer from "@/components/Footer.jsx";
import styles from "./page.module.css";

export default function LiputanPage() {
  const router = useRouter();

  const [liputan, setLiputan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchLiputan = async () => {
      try {
        const response = await fetch('/api/liputan?is_published=true');
        if (!response.ok) throw new Error('Gagal mengambil data liputan');
        const data = await response.json();
        setLiputan(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLiputan();
  }, []);

  const totalPages = Math.ceil(liputan.length / itemsPerPage);
  const paginatedLiputan = liputan.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
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

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className={styles.liputanPage}>
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
          <h1 className={styles.pageTitle}>Liputan</h1>
          <p className={styles.pageSubtitle}>
            Berita dan liputan program Semesta Manusia dari berbagai media nasional Indonesia
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {loading && (
          <div className={styles.emptyState} style={{ padding: '4rem 2rem' }}>
            <h3>Memuat liputan...</h3>
          </div>
        )}

        {error && !loading && (
          <div className={styles.emptyState} style={{ padding: '4rem 2rem' }}>
            <h3>Error Terjadi</h3>
            <p>{error}</p>
          </div>
        )}

        {/* Liputan Grid */}
        {!loading && !error && (
          <>
            <div className={styles.liputanGrid}>
              {paginatedLiputan.length > 0 ? (
                paginatedLiputan.map((item) => (
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
                      {item.published_at && (
                        <span className={styles.liputanCardMeta}>
                          {formatDate(item.published_at)}
                          {item.read_time ? ` • ${item.read_time}` : ''}
                        </span>
                      )}
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
                ))
              ) : (
                <div className={styles.emptyState}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="11" cy="11" r="8"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <h3>Tidak ada liputan ditemukan</h3>
                  <p>Belum ada liputan yang dipublikasikan.</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
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
          </>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
