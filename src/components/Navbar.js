"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import styles from "./Navbar.module.css";

export default function Navbar({ showCta = true, ctaLink = "/user/program", ctaText = "Daftar Volunteer" }) {
  const [scrollY, setScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav
      className={styles.navbar}
      style={{
        background: scrollY > 50 ? "rgba(255, 255, 255, 0.95)" : "transparent",
        boxShadow: scrollY > 50 ? "0 4px 20px rgba(0, 0, 0, 0.08)" : "none",
      }}
    >
      <div className={styles.navContainer}>
        <Link href="/user/landingpage" className={styles.logo}>
          <div className={styles.logoImage}>
            <Image
              src="/LOGO SEMESTA MANUSIA.png"
              alt="Semesta Manusia Logo"
              fill
              style={{ objectFit: "contain" }}
            />
          </div>
          <div className={styles.logoText}>
            <span className={styles.logoMain}>Semesta Manusia</span>
            <span className={styles.logoSub}>Indonesia</span>
          </div>
        </Link>

        <ul className={`${styles.navLinks} ${mobileMenuOpen ? styles.navLinksOpen : ""}`}>
          <li>
            <a href="/user/landingpage#beranda" className={styles.navLink}>
              Beranda
            </a>
          </li>
          <li>
            <a href="/user/landingpage#tentang" className={styles.navLink}>
              Tentang
            </a>
          </li>
          <li>
            <a href="/user/landingpage#program" className={styles.navLink}>
              Program
            </a>
          </li>
          <li>
            <a href="/user/landingpage#galeri" className={styles.navLink}>
              Galeri
            </a>
          </li>
          <li>
            <a href="/user/landingpage#kontak" className={styles.navLink}>
              Kontak
            </a>
          </li>
        </ul>

        <div className={styles.navActions}>
          {showCta && (
            <Link href={ctaLink} className={styles.ctaButton}>
              <span>{ctaText}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          )}
          <button
            className={styles.mobileMenuButton}
            onClick={toggleMobileMenu}
            aria-label="Menu"
          >
            <span className={`${styles.hamburger} ${mobileMenuOpen ? styles.hamburgerOpen : ""}`} />
          </button>
        </div>
      </div>
    </nav>
  );
}