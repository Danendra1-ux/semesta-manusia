"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabaseClient";
import styles from "./AdminSidebar.module.css";

const menuItems = [
  {
    label: "Beranda",
    href: "/admin/dashboard",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: "Semesta Camp",
    href: "/admin/semesta-camp",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 21l9-15 9 15" />
        <path d="M9 21V11h6v10" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    label: "Semesta Jelajah Nusantara",
    href: "/admin/sjn",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20" />
        <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
      </svg>
    ),
  },
  {
    label: "Pengguna",
    href: "/admin/users",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  // {
  //   label: "Liputan",
  //   href: "/admin/liputan",
  //   icon: (
  //     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
  //       <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
  //       <polyline points="14 2 14 8 20 8" />
  //       <line x1="16" y1="13" x2="8" y2="13" />
  //       <line x1="16" y1="17" x2="8" y2="17" />
  //       <polyline points="10 9 9 9 8 9" />
  //     </svg>
  //   ),
  // },
  {
    label: "Ulasan",
    href: "/admin/reviews",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
];

export default function AdminSidebar({ isCollapsed, onToggle }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const isActive = (href) => {
    return pathname === href || pathname.startsWith(href + "/");
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    // Safety net: if signOut hangs (network/auth issue), reset state and still navigate.
    const timeoutId = setTimeout(() => {
      setIsLoggingOut(false);
      setShowLogoutConfirm(false);
      router.push("/admin/login");
      router.refresh();
    }, 5000);

    try {
      const supabase = createSupabaseClient();
      await supabase.auth.signOut();
      clearTimeout(timeoutId);
      router.push("/admin/login");
      router.refresh();
    } catch (err) {
      clearTimeout(timeoutId);
      console.error("Logout gagal:", err);
      setIsLoggingOut(false);
      setShowLogoutConfirm(false);
    }
  };

  const openLogoutConfirm = () => {
    if (isLoggingOut) return;
    setShowLogoutConfirm(true);
  };

  const closeLogoutConfirm = () => {
    if (isLoggingOut) return;
    setShowLogoutConfirm(false);
  };

  return (
    <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""}`}>
      {/* Sidebar Header */}
      <div className={styles.sidebarHeader}>
        <div className={styles.logoRow}>
          <div className={styles.logoWrapper}>
            <Image
              src="/LOGO SEMESTA MANUSIA.png"
              alt="Semesta Manusia Logo"
              width={36}
              height={36}
              className={styles.logo}
            />
            {!isCollapsed && (
              <div className={styles.logoText}>
                <span className={styles.orgNameMain}>Semesta Manusia</span>
                <span className={styles.orgNameSub}>Indonesia</span>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <button
              className={styles.collapseToggle}
              onClick={onToggle}
              title="Ciutkan sidebar"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 17l-5-5 5-5M18 17l-5-5 5-5" />
              </svg>
            </button>
          )}
        </div>
        {isCollapsed && (
          <button
            className={styles.collapseToggle}
            onClick={onToggle}
            title="Perluas sidebar"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13 17l5-5-5-5M6 17l5-5-5-5" />
            </svg>
          </button>
        )}
      </div>

      {/* Menu Section */}
      <div className={styles.menuSection}>
        {!isCollapsed && (
          <p className={styles.menuLabel}>MENU</p>
        )}
        <nav className={styles.menuNav}>
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.menuItem} ${isActive(item.href) ? styles.active : ""}`}
              title={isCollapsed ? item.label : ""}
            >
              <span className={styles.menuIcon}>{item.icon}</span>
              {!isCollapsed && (
                <span className={styles.menuText}>{item.label}</span>
              )}
            </Link>
          ))}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className={styles.bottomSection}>
        {/* Admin Profile */}
        <div className={`${styles.adminProfile} ${isCollapsed ? styles.profileCollapsed : ""}`}>
          <div className={styles.avatar}>
            <span>AM</span>
          </div>
          {!isCollapsed && (
            <div className={styles.profileInfo}>
              <span className={styles.adminName}>Admin Semesta</span>
              <span className={styles.adminEmail}>admin@semestamanusia.id</span>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <button
          className={styles.logoutButton}
          onClick={openLogoutConfirm}
          disabled={isLoggingOut}
          title="Keluar"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          {!isCollapsed && <span>{isLoggingOut ? "Keluar..." : "Keluar"}</span>}
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className={styles.modalBackdrop} onClick={closeLogoutConfirm}>
          <div
            className={styles.modalDialog}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-confirm-title"
          >
            <div className={styles.modalIconWrap}>
              <svg className={styles.modalIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </div>

            <h3 id="logout-confirm-title" className={styles.modalTitle}>
              Keluar dari Dashboard?
            </h3>
            <p className={styles.modalDescription}>
              Anda akan keluar dari sesi admin. Anda perlu masuk kembali untuk mengakses dashboard.
            </p>

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.modalCancelBtn}
                onClick={closeLogoutConfirm}
                disabled={isLoggingOut}
              >
                Batal
              </button>
              <button
                type="button"
                className={styles.modalConfirmBtn}
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <>
                    <span className={styles.modalSpinner} />
                    <span>Keluar...</span>
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 16, height: 16 }}>
                      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    <span>Ya, Keluar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}