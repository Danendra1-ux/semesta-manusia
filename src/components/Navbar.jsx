"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import styles from "./Navbar.module.css";

const navItems = [
  { href: "/user/landingpage#beranda", label: "Beranda", key: "beranda" },
  { href: "/user/landingpage#tentang", label: "Tentang", key: "tentang" },
  { href: "/user/landingpage#program", label: "Program", key: "program" },
  { href: "/user/landingpage#galeri", label: "Galeri", key: "galeri" },
  { href: "/user/landingpage#kontak", label: "Kontak", key: "kontak" },
];

export default function Navbar({ showCta = true, ctaLink = "/user/program", ctaText = "Daftar Relawan" }) {
  const [scrollY, setScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("beranda");

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
      className={`${styles.navbar} ${scrollY > 30 ? styles.navbarScrolled : ""}`}
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
          {navItems.map((item) => (
            <li key={item.key}>
              <Link
                href={item.href}
                className={`${styles.navLink} ${activeSection === item.key ? styles.navLinkActive : ""}`}
                onClick={() => {
                  setActiveSection(item.key);
                  setMobileMenuOpen(false);
                }}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className={`${styles.navActions} ${mobileMenuOpen ? styles.hideOnDesktop : ""}`}>
          {showCta && (
            <Link
              href={ctaLink}
              className={styles.ctaButton}
              onClick={() => {
                setActiveSection("volunteer");
                setMobileMenuOpen(false);
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <line x1="19" y1="8" x2="19" y2="14"/>
                <line x1="22" y1="11" x2="16" y2="11"/>
              </svg>
              {ctaText}
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
