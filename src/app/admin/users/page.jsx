"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "../components/AdminSidebar.jsx";
import { useSidebar } from "../components/SidebarContext";
import styles from "./page.module.css";

const ITEMS_PER_PAGE = 15;

export default function AdminUsersPage() {
  const router = useRouter();
  const { isCollapsed, toggle: onToggleSidebar } = useSidebar();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetch("/api/admin/users", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        setUsers(data.users || []);
      })
      .catch((err) => console.error("Fetch users error:", err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return users.filter((u) => {
      if (statusFilter === "active" && !u.is_active) return false;
      if (statusFilter === "inactive" && u.is_active) return false;
      if (!q) return true;
      return (
        (u.name || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q) ||
        (u.region || "").toLowerCase().includes(q) ||
        (u.institution || "").toLowerCase().includes(q)
      );
    });
  }, [users, searchQuery, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const start = (safePage - 1) * ITEMS_PER_PAGE;
  const paged = filtered.slice(start, start + ITEMS_PER_PAGE);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [totalPages, currentPage]);

  const stats = useMemo(() => {
    return {
      total: users.length,
      active: users.filter((u) => u.is_active).length,
      inactive: users.filter((u) => !u.is_active).length,
    };
  }, [users]);

  const getInitials = (name, email) => {
    if (name) {
      const parts = name.trim().split(/\s+/);
      if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return (email || "?").substring(0, 2).toUpperCase();
  };

  const formatDate = (d) => {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const pageNumbers = useMemo(() => {
    const pages = [];
    const max = totalPages;
    let s = Math.max(1, safePage - 2);
    let e = Math.min(max, s + 4);
    s = Math.max(1, e - 4);
    for (let i = s; i <= e; i++) pages.push(i);
    return pages;
  }, [totalPages, safePage]);

  return (
    <div className={styles.pageWrapper}>
      <AdminSidebar />
      <main
        className={styles.main}
        style={isCollapsed ? { marginLeft: "5rem" } : undefined}
      >
        <div className={styles.headerRow}>
          <div className={styles.titleBlock}>
            <h1>Manajemen Pengguna</h1>
            <p>Kelola semua pengguna terdaftar di platform.</p>
          </div>
          <div className={styles.headerActions}>
            <div className={styles.searchWrap}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Cari nama, email, asal..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={styles.roleFilter}
            >
              <option value="all">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>
          </div>
        </div>

        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.statIconBlue}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87" />
                <path d="M16 3.13a4 4 0 010 7.75" />
              </svg>
            </div>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>Total Pengguna</span>
              <span className={styles.statValue}>{stats.total}</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.statIconGreen}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <polyline points="17 11 19 13 23 9" />
              </svg>
            </div>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>Pengguna Aktif</span>
              <span className={styles.statValue}>{stats.active}</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.statIconRed}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>Pengguna Nonaktif</span>
              <span className={styles.statValue}>{stats.inactive}</span>
            </div>
          </div>
        </div>

        <div className={styles.tableCard}>
          {loading ? (
            <div className={styles.tableLoading}>
              <div className={styles.spinner} />
              <span>Memuat data pengguna...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className={styles.tableEmpty}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
              </svg>
              <span>Tidak ada pengguna ditemukan.</span>
            </div>
          ) : (
            <>
              <div className={styles.tableScroll}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Pengguna</th>
                      <th>Status</th>
                      <th>Bergabung</th>
                      <th>Login Terakhir</th>
                      <th style={{ textAlign: "right" }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map((u) => (
                      <tr key={u.id}>
                        <td>
                          <div className={styles.userCell}>
                            <div className={styles.avatar}>
                              {u.avatar_url ? (
                                <img src={u.avatar_url} alt={u.name} />
                              ) : (
                                getInitials(u.name, u.email)
                              )}
                            </div>
                            <div className={styles.userInfo}>
                              <span className={styles.userName}>{u.name || "-"}</span>
                              <span className={styles.userEmail}>{u.email}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span
                            className={`${styles.statusPill} ${
                              u.is_active ? styles.statusActive : styles.statusInactive
                            }`}
                          >
                            <span className={styles.statusDot} />
                            {u.is_active ? "Aktif" : "Nonaktif"}
                          </span>
                        </td>
                        <td>
                          <span className={styles.dateText}>{formatDate(u.created_at)}</span>
                        </td>
                        <td>
                          <span className={styles.dateText}>
                            {formatDate(u.last_login_at)}
                          </span>
                        </td>
                        <td>
                          <div className={styles.actionCell}>
                            <button
                              className={styles.iconBtn}
                              title="Lihat detail"
                              onClick={() => router.push(`/admin/users/${u.id}`)}
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className={styles.pagination}>
                <span className={styles.paginationInfo}>
                  Menampilkan {start + 1}-{Math.min(start + ITEMS_PER_PAGE, filtered.length)} dari {filtered.length}
                </span>
                <div className={styles.paginationButtons}>
                  <button
                    className={styles.paginationBtn}
                    disabled={safePage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    ← Prev
                  </button>
                  {pageNumbers.map((n) => (
                    <button
                      key={n}
                      className={`${styles.paginationBtn} ${n === safePage ? styles.paginationBtnActive : ""}`}
                      onClick={() => setCurrentPage(n)}
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    className={styles.paginationBtn}
                    disabled={safePage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next →
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}