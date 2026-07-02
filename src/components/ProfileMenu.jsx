"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabaseClient";
import styles from "./ProfileMenu.module.css";

/**
 * Compute two-letter initials from a name or email.
 * Falls back to "U" if neither is provided.
 */
function getInitials(user) {
  if (!user) return "U";
  const name = (user.name || user.email || "U").trim();
  const parts = name.split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function ProfileMenu({ user, open, onClose, anchor = "right" }) {
  const router = useRouter();
  const pathname = usePathname();
  const wrapperRef = useRef(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, onClose]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  const handleNavigate = (href) => {
    onClose();
    setShowLogoutModal(false);
    router.push(href);
  };

  const openLogout = () => {
    setShowLogoutModal(true);
  };

  const closeLogout = () => {
    if (isLoggingOut) return;
    setShowLogoutModal(false);
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    // Safety net: if signOut hangs, still navigate.
    const timeoutId = setTimeout(() => {
      setIsLoggingOut(false);
      setShowLogoutModal(false);
      onClose();
      router.push("/user/landingpage");
      router.refresh();
    }, 5000);

    try {
      const supabase = createSupabaseClient();
      await supabase.auth.signOut();
      clearTimeout(timeoutId);
      setIsLoggingOut(false);
      setShowLogoutModal(false);
      onClose();
      router.push("/user/landingpage");
      router.refresh();
    } catch (err) {
      clearTimeout(timeoutId);
      console.error("Logout gagal:", err);
      setIsLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  if (!open) return null;

  const initials = getInitials(user);

  return (
    <div className={styles.menuWrapper} ref={wrapperRef}>
      <div className={styles.dropdown} role="menu" aria-label="Menu profil">
        <div className={styles.header}>
          <div className={styles.avatar} aria-hidden="true">{initials}</div>
          <div className={styles.headerText}>
            <p className={styles.headerName}>{user?.name || "Pengguna"}</p>
            <p className={styles.headerEmail}>{user?.email}</p>
          </div>
        </div>

        <button
          type="button"
          role="menuitem"
          className={styles.menuItem}
          onClick={() => handleNavigate("/user/profile")}
        >
          <span className={styles.menuItemIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </span>
          <span>Data Diri</span>
        </button>

        <button
          type="button"
          role="menuitem"
          className={styles.menuItem}
          onClick={() => handleNavigate("/user/reviews")}
        >
          <span className={styles.menuItemIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </span>
          <span>Ulasanmu</span>
        </button>

        <div className={styles.divider} />

        <button
          type="button"
          className={styles.logoutButton}
          onClick={openLogout}
        >
          <span className={styles.logoutIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </span>
          <span>Keluar</span>
        </button>
      </div>

      {showLogoutModal && (
        <div
          className={styles.modalBackdrop}
          onClick={closeLogout}
          role="dialog"
          aria-modal="true"
          aria-labelledby="profile-logout-title"
        >
          <div
            className={styles.modalDialog}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalIconWrap}>
              <svg
                className={styles.modalIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </div>
            <h3 id="profile-logout-title" className={styles.modalTitle}>
              Keluar dari akun?
            </h3>
            <p className={styles.modalDescription}>
              Anda akan keluar dari sesi relawan. Anda perlu masuk kembali untuk mengakses fitur pribadi.
            </p>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.modalCancelBtn}
                onClick={closeLogout}
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
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      style={{ width: 16, height: 16 }}
                    >
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
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
    </div>
  );
}
