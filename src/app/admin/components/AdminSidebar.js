"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import styles from "./AdminSidebar.module.css";

const menuItems = [
  {
    label: "Dashboard",
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
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
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
    label: "Liputan",
    href: "/admin/liputan",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
];

export default function AdminSidebar({ isCollapsed, onToggle }) {
  const pathname = usePathname();

  const isActive = (href) => {
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""}`}>
      {/* Sidebar Header */}
      <div className={styles.sidebarHeader}>
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
              <span className={styles.orgName}>Semesta</span>
              <span className={styles.orgNameBold}>Manusia</span>
            </div>
          )}
        </div>
        {!isCollapsed && <div className={styles.headerDivider} />}
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
        <button className={styles.logoutButton} title="Keluar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          {!isCollapsed && <span>Keluar</span>}
        </button>

        {/* Collapse Toggle */}
        <button
          className={styles.collapseToggle}
          onClick={onToggle}
          title={isCollapsed ? "Perluas sidebar" : "Ciutkan sidebar"}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {isCollapsed ? (
              <path d="M13 17l5-5-5-5M6 17l5-5-5-5" />
            ) : (
              <path d="M11 17l-5-5 5-5M18 17l-5-5 5-5" />
            )}
          </svg>
        </button>
      </div>
    </aside>
  );
}