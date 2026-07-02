"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import ProfileMenu from "./ProfileMenu.jsx";
import styles from "./Navbar.module.css";

const navItems = [
  { href: "/user/landingpage#beranda", label: "Beranda", key: "beranda" },
  { href: "/user/landingpage#tentang", label: "Tentang", key: "tentang" },
  { href: "/user/landingpage#program", label: "Program", key: "program" },
  { href: "/user/landingpage#galeri", label: "Galeri", key: "galeri" },
  { href: "/user/landingpage#faq", label: "FAQ", key: "faq" },
  { href: "/user/landingpage#kontak", label: "Kontak", key: "kontak" },
];

function getInitials(user) {
  if (!user) return "U";
  const name = (user.name || user.email || "U").trim();
  const parts = name.split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Navbar({
  showCta = true,
  ctaLink = "/user/login",
  ctaText = "Daftar Relawan",
}) {
  const [scrollY, setScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("beranda");
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Fetch the current user (if any) on mount and on window focus
  // so login/logout in another tab updates this navbar.
  const inFlightAuth = useRef(false);
  const fetchUser = async () => {
    if (inFlightAuth.current) return;
    inFlightAuth.current = true;
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setUser(data?.user || null);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setAuthLoading.current = false;
      inFlightAuth.current = false;
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    const onFocus = () => fetchUser();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close the profile menu on route change.
  useEffect(() => {
    setProfileMenuOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  const toggleMobileMenu = () => {
    setProfileMenuOpen(false);
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleProfileMenu = () => {
    setMobileMenuOpen(false);
    setProfileMenuOpen((prev) => !prev);
  };

  const initials = getInitials(user);

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
          {!authLoading && user && (
            <div className={styles.profileWrapper}>
              <button
                type="button"
                className={`${styles.profileButton} ${profileMenuOpen ? styles.profileButtonActive : ""}`}
                onClick={toggleProfileMenu}
                aria-haspopup="menu"
                aria-expanded={profileMenuOpen}
                aria-label="Menu profil"
              >
                <span className={styles.profileButtonInitials}>{initials}</span>
              </button>
              <ProfileMenu
                user={user}
                open={profileMenuOpen}
                onClose={() => setProfileMenuOpen(false)}
              />
            </div>
          )}

          {!authLoading && !user && showCta && (
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