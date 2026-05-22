"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import styles from "./page.module.css";
import { liputanData } from "../data/programs";

export default function LiputanPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const totalPages = Math.ceil(liputanData.length / itemsPerPage);
  const paginatedLiputan = liputanData.slice(
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
        {/* Liputan Grid */}
        <div className={styles.liputanGrid}>
          {paginatedLiputan.map((item) => (
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

        {/* Pagination */}
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
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
