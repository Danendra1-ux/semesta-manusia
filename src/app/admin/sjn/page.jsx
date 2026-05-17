"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "../components/AdminSidebar.js";
import styles from "./page.module.css";

const initialPrograms = [
  { id: 1, tanggal: "3 Jun 2026", nama: "SJN #4 Raja Ampat", programId: "sjn-4-raja-ampat", lokasi: "Desa Saleo, Raja Ampat, Papua Barat Daya", status: "Dibuka", pendaftar: 72 },
  { id: 2, tanggal: "13 Jul 2025", nama: "SJN #3 Sumba", programId: "sjn-3-sumba", lokasi: "Desa Londalima, Sumba Timur, NTT", status: "Ditutup", pendaftar: 88 },
  { id: 3, tanggal: "20 Feb 2025", nama: "SJN #2 Flores", programId: "sjn-2-flores", lokasi: "Desa Wae Rebo, Manggarai, NTT", status: "Ditutup", pendaftar: 64 },
  { id: 4, tanggal: "5 Agu 2024", nama: "SJN #1 Toraja", programId: "sjn-1-toraja", lokasi: "Desa Ke'te Kesu, Toraja Utara, Sulawesi Selatan", status: "Ditutup", pendaftar: 56 },
  { id: 5, tanggal: "12 Mar 2024", nama: "SJN Pilot - Kalimantan", programId: "sjn-pilot-kalimantan", lokasi: "Desa Pampang, Samarinda, Kalimantan Timur", status: "Ditutup", pendaftar: 40 },
];

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
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const filterDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(e.target)) {
        setStatusDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const itemsPerPage = 10;

  const toggleDropdown = (id) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  const filteredPrograms = useMemo(() => {
    let result = [...initialPrograms];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((p) =>
        p.nama.toLowerCase().includes(query) ||
        p.lokasi.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== "Semua") {
      result = result.filter((p) => p.status === statusFilter);
    }

    // Date sort
    if (sortDate === "asc") {
      result.sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));
    } else if (sortDate === "desc") {
      result.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
    }

    // Status sort
    if (sortStatus === "asc") {
      result.sort((a, b) => a.status.localeCompare(b.status));
    } else if (sortStatus === "desc") {
      result.sort((a, b) => b.status.localeCompare(a.status));
    }

    return result;
  }, [searchQuery, statusFilter, sortDate, sortStatus]);

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
    setDate(null);
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

      {/* Main Content */}
      <main className={`${styles.mainContent} ${isSidebarCollapsed ? styles.expanded : ""}`}>
        {/* Header */}
        <div className={styles.contentHeader}>
          <div className={styles.headerText}>
            <h1 className={styles.pageTitle}>Semesta Jelajah Nusantara</h1>
            <p className={styles.pageSubtitle}>
              Kelola dan pantau seluruh program Semesta Jelajah Nusantara
            </p>
          </div>
        </div>

        {/* Card Table */}
        <div className={styles.tableCard}>
          {/* Card Header */}
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Daftar Program</h2>
            <button className={styles.addButton}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Tambah Program</span>
            </button>
          </div>

          {/* Search & Filter Bar */}
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

          {/* Table */}
          <div className={styles.tableWrapper}>
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
                        className={styles.optionsButton}
                        onClick={() => toggleDropdown(program.id)}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="5" r="1" />
                          <circle cx="12" cy="12" r="1" />
                          <circle cx="12" cy="19" r="1" />
                        </svg>
                      </button>
                      {activeDropdown === program.id && (
                        <div className={styles.optionsDropdown}>
                          <button
                            className={styles.dropdownItem}
                            onClick={() => router.push(`/admin/sjn/${program.programId}/edit`)}
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            <span>Edit</span>
                          </button>
                          <button className={styles.dropdownItem}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                              <path d="M7 11V7a5 5 0 0110 0v4" />
                            </svg>
                            <span>{program.status === "Dibuka" ? "Tutup Program" : "Buka Program"}</span>
                          </button>
                          <button className={`${styles.dropdownItem} ${styles.deleteItem}`}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                            </svg>
                            <span>Hapus</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
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
    </div>
  );
}