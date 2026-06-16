"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "../components/AdminSidebar.jsx";
import styles from "./page.module.css";

const getStatusBadgeClass = (status) => {
  return status === "Dibuka" ? styles.badgeDibuka : styles.badgeDitutup;
};

export default function SJNPage() {
  const router = useRouter();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [sortDate, setSortDate] = useState(null);
  const [sortStatus, setSortStatus] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const filterDropdownRef = useRef(null);
  const optionsButtonRefs = useRef({});

  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal konfirmasi hapus program
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null, title: "", pendaftar: 0 });
  const [deleting, setDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const fetchPrograms = async () => {
    try {
      const response = await fetch('/api/programs?category=SJN', { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        const formatted = data.map(p => ({
          ...p,
          tanggal: p.event_start_date ? new Date(p.event_start_date).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'}) : '-',
          nama: p.title,
          programId: p.id,
          lokasi: p.location || '-',
          status: p.status || 'Dibuka',
          pendaftar: p.registration_count || 0
        }));
        setPrograms(formatted);
      }
    } catch (err) {
      console.error("Gagal mengambil data program:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  useEffect(() => {
    const handleFocus = () => fetchPrograms();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(e.target)) {
        setStatusDropdownOpen(false);
      }
      if (activeDropdown && !e.target.closest(`.${styles.optionsCell}`) && !e.target.closest(`.${styles.optionsDropdown}`)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeDropdown]);

  useEffect(() => {
    if (!activeDropdown) return;
    const handleScroll = () => setActiveDropdown(null);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleScroll);
    };
  }, [activeDropdown]);

  useEffect(() => {
    if (activeDropdown && optionsButtonRefs.current[activeDropdown]) {
      const rect = optionsButtonRefs.current[activeDropdown].getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.right - 160,
      });
    }
  }, [activeDropdown]);

  const itemsPerPage = 10;

  const toggleDropdown = (id) => {
    if (activeDropdown === id) {
      setActiveDropdown(null);
    } else {
      if (optionsButtonRefs.current[id]) {
        const rect = optionsButtonRefs.current[id].getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + 4,
          left: rect.right - 160,
        });
      }
      setActiveDropdown(id);
    }
  };

  // --- FUNGSI HAPUS PROGRAM ---
  const openDeleteModal = (id) => {
    const target = programs.find((p) => p.programId === id);
    setDeleteModal({
      open: true,
      id,
      title: target?.nama || target?.title || "Program ini",
      pendaftar: target?.pendaftar ?? target?.registration_count ?? 0,
    });
    setActiveDropdown(null);
  };

  const closeDeleteModal = () => {
    if (deleting) return;
    setDeleteModal({ open: false, id: null, title: "", pendaftar: 0 });
  };

  const handleDelete = async () => {
    const id = deleteModal.id;
    if (!id) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/programs/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Gagal menghapus program");

      setPrograms((prev) => prev.filter((p) => p.programId !== id));
      setSelectedRows((prev) => prev.filter((rowId) => rowId !== id));
      setDeleteModal({ open: false, id: null, title: "", pendaftar: 0 });
      showToast("Program berhasil dihapus");
    } catch (err) {
      showToast(`Gagal menghapus: ${err.message}`, true);
    } finally {
      setDeleting(false);
    }
  };

  const showToast = (message, isError = false) => {
    setToastMessage({ message, isError });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredPrograms = useMemo(() => {
    let result = [...programs];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((p) =>
        p.nama.toLowerCase().includes(query) ||
        p.lokasi.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== "Semua") {
      result = result.filter((p) => p.status === statusFilter);
    }

    if (sortDate === "asc") {
      result.sort((a, b) => new Date(a.event_start_date || a.created_at) - new Date(b.event_start_date || b.created_at));
    } else if (sortDate === "desc") {
      result.sort((a, b) => new Date(b.event_start_date || b.created_at) - new Date(a.event_start_date || a.created_at));
    }

    if (sortStatus === "asc") {
      result.sort((a, b) => a.status.localeCompare(b.status));
    } else if (sortStatus === "desc") {
      result.sort((a, b) => b.status.localeCompare(a.status));
    }

    return result;
  }, [searchQuery, statusFilter, sortDate, sortStatus, programs]);

  const totalPages = Math.ceil(filteredPrograms.length / itemsPerPage);
  const paginatedPrograms = filteredPrograms.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleSelectAll = () => {
    if (selectedRows.length === paginatedPrograms.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(paginatedPrograms.map((p) => p.id));
    }
  };

  const toggleSelectRow = (id) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const handleSortDate = () => {
    if (sortDate === null) {
      setSortDate("desc");
    } else if (sortDate === "desc") {
      setSortDate("asc");
    } else {
      setSortDate(null);
    }
    setSortStatus(null);
    setCurrentPage(1);
  };

  const handleSortStatus = () => {
    if (sortStatus === null) {
      setSortStatus("desc");
    } else if (sortStatus === "desc") {
      setSortStatus("asc");
    } else {
      setSortStatus(null);
    }
    setSortDate(null);
    setCurrentPage(1);
  };

  const getSortIcon = (currentSort, thisSort) => {
    if (currentSort === null) {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.3 }}>
          <path d="M7 10l5-5 5 5M7 14l5 5 5-5" />
        </svg>
      );
    }
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        {currentSort === thisSort ? (
          thisSort === "asc" ? (
            <path d="M7 14l5-5 5 5" />
          ) : (
            <path d="M7 10l5 5 5-5" />
          )
        ) : (
          <>
            <path d="M7 10l5-5 5 5M7 14l5 5 5-5" />
          </>
        )}
      </svg>
    );
  };

  return (
    <div className={styles.pageLayout}>
      <AdminSidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <main className={`${styles.mainContent} ${isSidebarCollapsed ? styles.expanded : ""}`}>
        <div className={styles.contentHeader}>
          <div className={styles.headerText}>
            <h1 className={styles.pageTitle}>Semesta Jelajah Nusantara</h1>
            <p className={styles.pageSubtitle}>
              Kelola dan pantau seluruh program Semesta Jelajah Nusantara
            </p>
          </div>
        </div>

        <div className={styles.tableCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Daftar Program</h2>
            <button className={styles.addButton} onClick={() => router.push("/admin/sjn/tambah")}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Tambah Program</span>
            </button>
          </div>

          <div className={styles.searchFilterBar}>
            <div className={styles.searchWrapper}>
              <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Cari program..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <div className={styles.filterButtons}>
              <div className={styles.filterDropdown} ref={filterDropdownRef}>
                <button
                  className={`${styles.filterButton} ${statusFilter !== "Semua" ? styles.active : ""}`}
                  onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                  </svg>
                  <span>Status: {statusFilter}</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14, transform: statusDropdownOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                {statusDropdownOpen && (
                  <div className={styles.statusDropdownMenu}>
                    {["Semua", "Dibuka", "Ditutup"].map((option) => (
                      <button
                        key={option}
                        className={`${styles.statusDropdownItem} ${statusFilter === option ? styles.statusDropdownItemActive : ""}`}
                        onClick={() => {
                          setStatusFilter(option);
                          setStatusDropdownOpen(false);
                          setCurrentPage(1);
                        }}
                      >
                        {statusFilter === option && (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 14, height: 14, flexShrink: 0 }}>
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={styles.tableWrapper}>
            {loading ? (
               <div style={{ padding: '2rem', textAlign: 'center' }}>Memuat data...</div>
            ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.checkboxCell}>
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      checked={selectedRows.length === paginatedPrograms.length && paginatedPrograms.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className={styles.sortableHeader} onClick={handleSortDate}>
                    <span>Tanggal</span>
                    <span className={styles.sortIcon}>{getSortIcon(sortDate, sortDate)}</span>
                  </th>
                  <th>Nama</th>
                  <th>Lokasi</th>
                  <th className={styles.sortableHeader} onClick={handleSortStatus}>
                    <span>Status</span>
                    <span className={styles.sortIcon}>{getSortIcon(sortStatus, sortStatus)}</span>
                  </th>
                  <th>Jumlah Pendaftar</th>
                  <th>Aksi</th>
                  <th>Opsi</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPrograms.map((program) => (
                  <tr
                    key={program.id}
                    className={`${styles.tableRow} ${selectedRows.includes(program.id) ? styles.selected : ""}`}
                  >
                    <td className={styles.checkboxCell}>
                      <input
                        type="checkbox"
                        className={styles.checkbox}
                        checked={selectedRows.includes(program.id)}
                        onChange={() => toggleSelectRow(program.id)}
                      />
                    </td>
                    <td className={styles.dateCell}>{program.tanggal}</td>
                    <td className={styles.nameCell}>{program.nama}</td>
                    <td className={styles.locationCell}>
                      <span className={styles.locationText}>{program.lokasi}</span>
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${getStatusBadgeClass(program.status)}`}>
                        {program.status}
                      </span>
                    </td>
                    <td className={styles.pendaftarCell}>
                      {program.pendaftar !== null ? program.pendaftar : "—"}
                    </td>
                    <td>
                      <button
                        className={styles.viewButton}
                        onClick={() => router.push(`/admin/sjn/${program.programId}`)}
                      >
                        Lihat
                      </button>
                    </td>
                    <td className={styles.optionsCell}>
                      <button
                        ref={(el) => (optionsButtonRefs.current[program.id] = el)}
                        className={styles.optionsButton}
                        onClick={() => toggleDropdown(program.id)}
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
            )}
          </div>

          <div className={styles.pagination}>
            <span className={styles.paginationInfo}>
              {filteredPrograms.length > 0
                ? `${(currentPage - 1) * itemsPerPage + 1} - ${Math.min(currentPage * itemsPerPage, filteredPrograms.length)} dari ${filteredPrograms.length}`
                : "0 dari 0"}
            </span>
            <div className={styles.paginationButtons}>
              <button
                className={styles.paginationButton}
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button
                className={styles.paginationButton}
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          </div>
        </div>

      </main>

      {activeDropdown !== null && paginatedPrograms.find((p) => p.id === activeDropdown) && (
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
              const program = paginatedPrograms.find((p) => p.id === activeDropdown);
              setActiveDropdown(null);
              router.push(`/admin/sjn/${program.programId}/edit`);
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            <span>Edit</span>
          </button>
          <button
            className={styles.dropdownItem}
            onClick={() => setActiveDropdown(null)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
            <span>{paginatedPrograms.find((p) => p.id === activeDropdown)?.status === "Dibuka" ? "Tutup Program" : "Buka Program"}</span>
          </button>
          <button
            className={`${styles.dropdownItem} ${styles.deleteItem}`}
            onClick={() => {
              const program = paginatedPrograms.find((p) => p.programId === activeDropdown);
              openDeleteModal(program.programId);
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
            <span>Hapus</span>
          </button>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Program */}
      {deleteModal.open && (
        <div className={styles.modalBackdrop} onClick={closeDeleteModal}>
          <div
            className={styles.modalDialog}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-program-modal-title"
          >
            <div className={styles.modalIconWrap}>
              <svg className={styles.modalIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </div>

            <h3 id="delete-program-modal-title" className={styles.modalTitle}>
              Hapus Program?
            </h3>
            <p className={styles.modalDescription}>
              Anda akan menghapus program <strong>"{deleteModal.title}"</strong>.
              {deleteModal.pendaftar > 0 && (
                <> Program ini memiliki <strong>{deleteModal.pendaftar} pendaftar</strong> yang akan ikut terhapus.</>
              )}
              {" "}
              Tindakan ini tidak dapat dibatalkan.
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

      {/* Toast Notification */}
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