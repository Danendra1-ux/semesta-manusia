"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import AdminSidebar from "../components/AdminSidebar.jsx";
import { useSidebar } from "../components/SidebarContext";
import styles from "./page.module.css";

const ITEMS_PER_PAGE = 15;

export default function AdminUsersPage() {
  const { isCollapsed, toggle: onToggleSidebar } = useSidebar();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loginSort, setLoginSort] = useState("all");
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const filterDropdownRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);

  // 3-dots dropdown state
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const optionsButtonRefs = useRef({});

  // Delete confirmation modal
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    id: null,
    name: "",
    email: "",
  });
  const [deleting, setDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Warn / remind confirmation modal
  const [remindModal, setRemindModal] = useState({ open: false, id: null, name: "", email: "" });
  const [reminding, setReminding] = useState(false);

  useEffect(() => {
    fetch("/api/admin/users", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        setUsers(data.users || []);
      })
      .catch((err) => console.error("Fetch users error:", err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        activeDropdown &&
        !e.target.closest(`.${styles.optionsCell}`) &&
        !e.target.closest(`.${styles.optionsDropdown}`)
      ) {
        setActiveDropdown(null);
      }
      if (
        filterDropdownOpen &&
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(e.target)
      ) {
        setFilterDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeDropdown, filterDropdownOpen]);

  useEffect(() => {
    if (!activeDropdown) return;
    const close = () => setActiveDropdown(null);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [activeDropdown]);

  const toggleDropdown = (id) => {
    if (activeDropdown === id) {
      setActiveDropdown(null);
    } else {
      if (optionsButtonRefs.current[id]) {
        const rect = optionsButtonRefs.current[id].getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + 4,
          left: rect.right - 200,
        });
      }
      setActiveDropdown(id);
    }
  };

  const openDeleteModal = (user) => {
    setDeleteModal({
      open: true,
      id: user.id,
      name: user.name || "",
      email: user.email || "",
    });
    setActiveDropdown(null);
  };

  const closeDeleteModal = () => {
    if (deleting) return;
    setDeleteModal({ open: false, id: null, name: "", email: "" });
  };

  const handleDelete = async () => {
    const id = deleteModal.id;
    if (!id) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menghapus pengguna");
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setDeleteModal({ open: false, id: null, name: "", email: "" });
      showToast("Pengguna berhasil dihapus");
    } catch (err) {
      showToast(err.message || "Gagal menghapus", true);
    } finally {
      setDeleting(false);
    }
  };

  const openRemindModal = (user) => {
    setRemindModal({ open: true, id: user.id, name: user.name, email: user.email });
    setActiveDropdown(null);
  };

  const closeRemindModal = () => {
    if (reminding) return;
    setRemindModal({ open: false, id: null, name: "", email: "" });
  };

  const handleRemind = async () => {
    const id = remindModal.id;
    if (!id) return;
    setReminding(true);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengirim peringatan");
      setRemindModal({ open: false, id: null, name: "", email: "" });
      showToast("Peringatan berhasil dikirim");
    } catch (err) {
      showToast(err.message || "Gagal mengirim peringatan", true);
    } finally {
      setReminding(false);
    }
  };

  const showToast = (message, isError = false) => {
    setToastMessage({ message, isError });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const matched = users.filter((u) => {
      const active = u.effective_is_active !== false;
      if (statusFilter === "active" && !active) return false;
      if (statusFilter === "inactive" && active) return false;
      if (!q) return true;
      return (
        (u.name || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q) ||
        (u.region || "").toLowerCase().includes(q) ||
        (u.institution || "").toLowerCase().includes(q)
      );
    });

    if (loginSort === "newest") {
      return [...matched].sort((a, b) => {
        const at = a.last_login_at ? new Date(a.last_login_at).getTime() : 0;
        const bt = b.last_login_at ? new Date(b.last_login_at).getTime() : 0;
        return bt - at;
      });
    }
    if (loginSort === "oldest") {
      return [...matched].sort((a, b) => {
        const at = a.last_login_at ? new Date(a.last_login_at).getTime() : Number.POSITIVE_INFINITY;
        const bt = b.last_login_at ? new Date(b.last_login_at).getTime() : Number.POSITIVE_INFINITY;
        return at - bt;
      });
    }
    return matched;
  }, [users, searchQuery, statusFilter, loginSort]);

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
      active: users.filter((u) => u.effective_is_active !== false).length,
      inactive: users.filter((u) => u.effective_is_active === false).length,
    };
  }, [users]);

  const loginLabel = loginSort === "all" ? "Login Terakhir" : loginSort === "newest" ? "Terbaru" : "Terlama";

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
    <div className={styles.pageLayout}>
      <AdminSidebar
        isCollapsed={isCollapsed}
        onToggle={onToggleSidebar}
      />
      <main
        className={`${styles.mainContent} ${isCollapsed ? styles.expanded : ""}`}
      >
        {/* Content Header */}
        <div className={styles.contentHeader}>
          <div className={styles.headerText}>
            <h1 className={styles.pageTitle}>Manajemen Pengguna</h1>
            <p className={styles.pageSubtitle}>Kelola semua pengguna terdaftar di platform.</p>
          </div>

          {/* Stats Row */}
          <div className={styles.statsRow}>
            <div className={`${styles.statCard} ${styles.statCardBlue}`}>
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
            <div className={`${styles.statCard} ${styles.statCardGreen}`}>
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
            <div className={`${styles.statCard} ${styles.statCardRed}`}>
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
        </div>

        {/* Table Card */}
        <div className={styles.tableCard}>
          {/* Card Header */}
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Daftar Pengguna</h2>
          </div>

          {/* Search & Filter Bar */}
          <div className={styles.searchFilterBar} ref={filterDropdownRef}>
            <div className={styles.searchWrapper}>
              <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Cari nama atau email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className={styles.filterButtons}>
              {/* Status + Login Filter Dropdown */}
              <div className={styles.filterDropdown}>
                <button
                  className={`${styles.filterButton} ${(statusFilter !== "all" || loginSort !== "all") ? styles.active : ""}`}
                  onClick={() => setFilterDropdownOpen((v) => !v)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                  </svg>
                  {(statusFilter === "all" ? "Semua Status" : statusFilter === "active" ? "Aktif" : "Nonaktif") +
                    (loginSort !== "all" ? ` · ${loginLabel}` : "")}
                </button>
                {filterDropdownOpen && (
                  <div className={styles.statusDropdownMenu}>
                    {/* Status Options */}
                    {[
                      { value: "all", label: "Semua" },
                      { value: "active", label: "Aktif" },
                      { value: "inactive", label: "Nonaktif" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        className={`${styles.statusDropdownItem} ${statusFilter === opt.value ? styles.statusDropdownItemActive : ""}`}
                        onClick={() => {
                          setStatusFilter(opt.value);
                          setCurrentPage(1);
                        }}
                      >
                        {statusFilter === opt.value && (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 16, height: 16, flexShrink: 0 }}>
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                        {opt.label}
                      </button>
                    ))}
                    {/* Login Sort Section */}
                    <div className={styles.loginSortSection}>
                      <div className={styles.loginSortLabel}>Login Terakhir</div>
                      {[
                        { value: "all", label: "Semua" },
                        { value: "newest", label: "Terbaru" },
                        { value: "oldest", label: "Terlama" },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          className={`${styles.statusDropdownItem} ${loginSort === opt.value ? styles.statusDropdownItemActive : ""}`}
                          onClick={() => {
                            setLoginSort(opt.value);
                            setCurrentPage(1);
                          }}
                        >
                          {loginSort === opt.value && (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 16, height: 16, flexShrink: 0 }}>
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className={styles.tableLoading}>
              <div className={styles.spinner} />
              <span>Memuat data pengguna...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className={styles.tableEmpty}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 48, height: 48 }}>
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
              </svg>
              <span>Tidak ada pengguna ditemukan.</span>
            </div>
          ) : (
            <>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Pengguna</th>
                      <th>Status</th>
                      <th>Bergabung</th>
                      <th>Login Terakhir</th>
                      <th style={{ textAlign: "center" }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map((u) => (
                      <tr key={u.id} className={styles.tableRow}>
                        <td>
                          <div className={styles.userCell}>
                            <div className={styles.userAvatar}>
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
                            className={`${styles.statusBadge} ${
                              u.effective_is_active !== false ? styles.badgeActive : styles.badgeInactive
                            }`}
                          >
                            {u.effective_is_active !== false ? "Aktif" : "Nonaktif"}
                          </span>
                        </td>
                        <td className={styles.dateCell}>
                          {formatDate(u.created_at)}
                        </td>
                        <td className={styles.dateCell}>
                          {formatDate(u.last_login_at)}
                        </td>
                        <td className={styles.optionsCell}>
                          <button
                            ref={(el) => (optionsButtonRefs.current[u.id] = el)}
                            className={styles.optionsButton}
                            onClick={() => toggleDropdown(u.id)}
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="5" r="1" />
                              <circle cx="12" cy="12" r="1" />
                              <circle cx="12" cy="19" r="1" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              <div className={styles.pagination}>
                <span className={styles.paginationInfo}>
                  Menampilkan {start + 1}-{Math.min(start + ITEMS_PER_PAGE, filtered.length)} dari {filtered.length}
                </span>
                <div className={styles.paginationButtons}>
                  <button
                    className={styles.paginationButton}
                    disabled={safePage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>
                  {pageNumbers.map((n) => (
                    <button
                      key={n}
                      className={`${styles.paginationButton} ${n === safePage ? styles.active : ""}`}
                      onClick={() => setCurrentPage(n)}
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    className={styles.paginationButton}
                    disabled={safePage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Options Dropdown */}
      {activeDropdown !== null && paged.find((u) => u.id === activeDropdown) && (
        <div
          className={styles.optionsDropdown}
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className={styles.dropdownItem}
            onClick={() => {
              const user = paged.find((u) => u.id === activeDropdown);
              if (user) openRemindModal(user);
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>Peringatkan Pengguna</span>
          </button>
          <button
            className={`${styles.dropdownItem} ${styles.deleteItem}`}
            onClick={() => {
              const user = paged.find((u) => u.id === activeDropdown);
              if (user) openDeleteModal(user);
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
            <span>Hapus Pengguna</span>
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <div className={styles.modalBackdrop} onClick={closeDeleteModal}>
          <div
            className={styles.modalDialog}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-user-modal-title"
          >
            <div className={styles.modalIconWrap}>
              <svg className={styles.modalIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </div>

            <h3 id="delete-user-modal-title" className={styles.modalTitle}>
              Hapus Pengguna?
            </h3>
            <p className={styles.modalDescription}>
              Anda akan menghapus akun <strong>"{deleteModal.name || deleteModal.email}"</strong>. Tindakan ini tidak dapat dibatalkan dan akan menghapus akses login serta seluruh data terkait.
            </p>

            <div className={styles.modalActions}>
              <button
                className={styles.modalCancelBtn}
                onClick={closeDeleteModal}
                disabled={deleting}
              >
                Batal
              </button>
              <button
                className={styles.modalConfirmBtn}
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <span className={styles.modalSpinner} />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 16, height: 16 }}>
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                    <span>Ya, Hapus</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remind User Confirmation Modal */}
      {remindModal.open && (
        <div className={styles.modalBackdrop} onClick={closeRemindModal}>
          <div
            className={styles.modalDialog}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="remind-user-modal-title"
          >
            <div className={`${styles.modalIconWrap} ${styles.modalIconWrapWarn}`}>
              <svg className={styles.modalIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>

            <h3 id="remind-user-modal-title" className={styles.modalTitle}>
              Kirim Peringatan?
            </h3>
            <p className={styles.modalDescription}>
              Email peringatan akan dikirim ke <strong>{remindModal.name || remindModal.email}</strong> untuk mengingatkan akun mereka masih ingin digunakan.
            </p>
            <div className={styles.remindNote}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.remindNoteIcon}>
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span>
                Jika dalam <strong>1x24 jam</strong> pengguna tidak login, admin dapat menghapus akun melalui tombol &ldquo;Hapus Pengguna&rdquo;.
              </span>
            </div>

            <div className={styles.modalActions}>
              <button
                className={styles.modalCancelBtn}
                onClick={closeRemindModal}
                disabled={reminding}
              >
                Batal
              </button>
              <button
                className={`${styles.modalConfirmBtn} ${styles.modalConfirmWarn}`}
                onClick={handleRemind}
                disabled={reminding}
              >
                {reminding ? (
                  <>
                    <span className={styles.modalSpinner} />
                    <span>Mengirim...</span>
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 16, height: 16 }}>
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                    <span>Kirim Peringatan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMessage && (
        <div className={`${styles.toast} ${toastMessage.isError ? styles.toastError : styles.toastSuccess}`}>
          {toastMessage.isError ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={styles.toastIcon}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={styles.toastIcon}>
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
          <span>{toastMessage.message}</span>
        </div>
      )}
    </div>
  );
}
