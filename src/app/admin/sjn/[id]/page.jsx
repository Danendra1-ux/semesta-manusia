"use client";

import { useState, useMemo, useRef, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminSidebar from "../../components/AdminSidebar.jsx";
import styles from "./page.module.css";

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 14, height: 14, flexShrink: 0 }}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const getStatusBadgeClass = (status) => {
  if (status === "Diterima") return styles.badgeDiterima;
  if (status === "Ditolak") return styles.badgeDitolak;
  return styles.badgePending;
};

const getTipeBadgeClass = (tipe) => {
  if (tipe === "Fully Funded") return styles.badgeFullyFunded;
  return styles.badgeSelfFunded;
};

export default function SJNDetailPage({ params }) {
  const resolvedParams = use(params);
  const programId = resolvedParams.id;
  const router = useRouter();
  
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [sortBy, setSortBy] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [program, setProgram] = useState(null);
  const [pendaftar, setPendaftar] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal konfirmasi hapus
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null, fullName: "" });
  const [deleting, setDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const filterDropdownRef = useRef(null);
  const sortDropdownRef = useRef(null);
  const optionsButtonRefs = useRef({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [progRes, regRes] = await Promise.all([
          fetch(`/api/programs/${programId}`),
          fetch(`/api/registrations?program_id=${programId}`)
        ]);
        
        if (progRes.ok) {
          const progData = await progRes.json();
          setProgram({
            nama: progData.title,
            deskripsi: progData.description
          });
        }
        
        if (regRes.ok) {
          const regData = await regRes.json();
          const formattedPendaftar = regData.map(r => ({
            id: r.id,
            tanggal: new Date(r.registered_at).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'}),
            rawDate: new Date(r.registered_at),
            nama: r.full_name,
            noWhatsapp: r.whatsapp,
            email: r.email,
            status: r.status,
            instansi: r.institution,
            tipe: r.program_funding_types?.label || 'Fully Funded'
          }));
          setPendaftar(formattedPendaftar);
        }
      } catch (err) {
        console.error("Gagal memuat data detail SJN:", err);
      } finally {
        setLoading(false);
      }
    };
    if (programId) fetchData();
  }, [programId]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(e.target)) setFilterDropdownOpen(false);
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target)) setSortDropdownOpen(false);
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

  const filteredPendaftar = useMemo(() => {
    let result = [...pendaftar];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((p) =>
        p.nama.toLowerCase().includes(query) ||
        p.email.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== "Semua") {
      if (statusFilter === "Fully Funded" || statusFilter === "Self Funded") {
        result = result.filter((p) => p.tipe === statusFilter);
      } else {
        result = result.filter((p) => p.status === statusFilter);
      }
    }

    if (sortBy === "terbaru") {
      result.sort((a, b) => b.rawDate - a.rawDate);
    } else if (sortBy === "terlama") {
      result.sort((a, b) => a.rawDate - b.rawDate);
    } else if (sortBy === "nama-az") {
      result.sort((a, b) => a.nama.localeCompare(b.nama, "id", { sensitivity: "base" }));
    } else if (sortBy === "nama-za") {
      result.sort((a, b) => b.nama.localeCompare(a.nama, "id", { sensitivity: "base" }));
    }

    return result;
  }, [pendaftar, searchQuery, statusFilter, sortBy]);

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredPendaftar.length / itemsPerPage);
  const paginatedPendaftar = filteredPendaftar.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleSelectAll = () => {
    if (selectedRows.length === paginatedPendaftar.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(paginatedPendaftar.map((p) => p.id));
    }
  };

  const toggleSelectRow = (id) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

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

  const updateRegistrationStatus = async (id, status) => {
    try {
      const res = await fetch(`/api/registrations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setPendaftar((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
      }
    } catch (err) {
      console.error(err);
    }
    setActiveDropdown(null);
  };

  const handleTerima = (id) => updateRegistrationStatus(id, "Diterima");
  const handleTolak = (id) => updateRegistrationStatus(id, "Ditolak");

  const openDeleteModal = (id) => {
    const target = pendaftar.find((p) => p.id === id);
    setDeleteModal({ open: true, id, fullName: target?.full_name || "Pendaftar ini" });
    setActiveDropdown(null);
  };

  const closeDeleteModal = () => {
    if (deleting) return;
    setDeleteModal({ open: false, id: null, fullName: "" });
  };

  const handleHapus = async () => {
    const id = deleteModal.id;
    if (!id) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/registrations/${id}`, { method: "DELETE" });
      if (res.ok) {
        setPendaftar((prev) => prev.filter((p) => p.id !== id));
        setDeleteModal({ open: false, id: null, fullName: "" });
        showToast("Pendaftar berhasil dihapus");
      } else {
        showToast("Gagal menghapus pendaftar", true);
      }
    } catch (err) {
      console.error(err);
      showToast(`Gagal menghapus: ${err.message}`, true);
    } finally {
      setDeleting(false);
    }
  };

  const showToast = (message, isError = false) => {
    setToastMessage({ message, isError });
    setTimeout(() => setToastMessage(null), 3000);
  };

  if (loading) {
     return <div style={{ padding: '2rem', textAlign: 'center' }}>Memuat data pendaftar...</div>;
  }

  if (!program) {
    return (
      <div className={styles.pageLayout}>
        <AdminSidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
        <main className={`${styles.mainContent} ${isSidebarCollapsed ? styles.expanded : ""}`}>
          <div className={styles.notFound}>
            <h2>Program tidak ditemukan</h2>
            <Link href="/admin/sjn" className={styles.backLinkError}>
              ← Kembali ke Daftar Program
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.pageLayout}>
      <AdminSidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <main className={`${styles.mainContent} ${isSidebarCollapsed ? styles.expanded : ""}`}>
        <div className={styles.contentHeader}>
          <div className={styles.headerTop}>
            <Link href="/admin/sjn" className={styles.backButton}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </Link>
          </div>
          <div className={styles.headerText}>
            <h1 className={styles.pageTitle}>{program.nama}</h1>
            <p className={styles.pageSubtitle}>{program.deskripsi}</p>
          </div>
        </div>

        <div className={styles.tableCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Pendaftar Program</h2>
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
                placeholder="Search..."
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
                  className={`${styles.filterBtn} ${statusFilter !== "Semua" ? styles.filterBtnActive : ""}`}
                  onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                  </svg>
                  Filter
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14, transform: filterDropdownOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                {filterDropdownOpen && (
                  <div className={styles.filterDropdownMenu}>
                    <button
                      className={`${styles.filterDropdownItem} ${statusFilter === "Semua" ? styles.filterDropdownItemActive : ""}`}
                      onClick={() => { setStatusFilter("Semua"); setFilterDropdownOpen(false); setCurrentPage(1); }}
                    >
                      {statusFilter === "Semua" && <CheckIcon />}
                      Semua
                    </button>
                    <button
                      className={`${styles.filterDropdownItem} ${statusFilter === "Pending" ? styles.filterDropdownItemActive : ""}`}
                      onClick={() => { setStatusFilter("Pending"); setFilterDropdownOpen(false); setCurrentPage(1); }}
                    >
                      {statusFilter === "Pending" && <CheckIcon />}
                      Pending
                    </button>
                    <button
                      className={`${styles.filterDropdownItem} ${statusFilter === "Diterima" ? styles.filterDropdownItemActive : ""}`}
                      onClick={() => { setStatusFilter("Diterima"); setFilterDropdownOpen(false); setCurrentPage(1); }}
                    >
                      {statusFilter === "Diterima" && <CheckIcon />}
                      Diterima
                    </button>
                    <button
                      className={`${styles.filterDropdownItem} ${statusFilter === "Ditolak" ? styles.filterDropdownItemActive : ""}`}
                      onClick={() => { setStatusFilter("Ditolak"); setFilterDropdownOpen(false); setCurrentPage(1); }}
                    >
                      {statusFilter === "Ditolak" && <CheckIcon />}
                      Ditolak
                    </button>
                    <button
                      className={`${styles.filterDropdownItem} ${statusFilter === "Fully Funded" ? styles.filterDropdownItemActive : ""}`}
                      onClick={() => { setStatusFilter("Fully Funded"); setFilterDropdownOpen(false); setCurrentPage(1); }}
                    >
                      {statusFilter === "Fully Funded" && <CheckIcon />}
                      Fully Funded
                    </button>
                    <button
                      className={`${styles.filterDropdownItem} ${statusFilter === "Self Funded" ? styles.filterDropdownItemActive : ""}`}
                      onClick={() => { setStatusFilter("Self Funded"); setFilterDropdownOpen(false); setCurrentPage(1); }}
                    >
                      {statusFilter === "Self Funded" && <CheckIcon />}
                      Self Funded
                    </button>
                  </div>
                )}
              </div>

              <div className={styles.filterDropdown} ref={sortDropdownRef}>
                <button
                  className={`${styles.filterBtn} ${sortBy !== null ? styles.filterBtnActive : ""}`}
                  onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="4" y1="6" x2="16" y2="6" />
                    <line x1="4" y1="12" x2="12" y2="12" />
                    <line x1="4" y1="18" x2="8" y2="18" />
                  </svg>
                  Urutkan
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14, transform: sortDropdownOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                {sortDropdownOpen && (
                  <div className={styles.filterDropdownMenu}>
                    <button
                      className={`${styles.filterDropdownItem} ${sortBy === "terbaru" ? styles.filterDropdownItemActive : ""}`}
                      onClick={() => { setSortBy("terbaru"); setSortDropdownOpen(false); setCurrentPage(1); }}
                    >
                      {sortBy === "terbaru" && <CheckIcon />}
                      Terbaru
                    </button>
                    <button
                      className={`${styles.filterDropdownItem} ${sortBy === "terlama" ? styles.filterDropdownItemActive : ""}`}
                      onClick={() => { setSortBy("terlama"); setSortDropdownOpen(false); setCurrentPage(1); }}
                    >
                      {sortBy === "terlama" && <CheckIcon />}
                      Terlama
                    </button>
                    <button
                      className={`${styles.filterDropdownItem} ${sortBy === "nama-az" ? styles.filterDropdownItemActive : ""}`}
                      onClick={() => { setSortBy("nama-az"); setSortDropdownOpen(false); setCurrentPage(1); }}
                    >
                      {sortBy === "nama-az" && <CheckIcon />}
                      Nama A → Z
                    </button>
                    <button
                      className={`${styles.filterDropdownItem} ${sortBy === "nama-za" ? styles.filterDropdownItemActive : ""}`}
                      onClick={() => { setSortBy("nama-za"); setSortDropdownOpen(false); setCurrentPage(1); }}
                    >
                      {sortBy === "nama-za" && <CheckIcon />}
                      Nama Z → A
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.checkboxCell}>
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      checked={selectedRows.length === paginatedPendaftar.length && paginatedPendaftar.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className={styles.dateCell}>Tanggal</th>
                  <th className={styles.nameCell}>Nama</th>
                  <th className={styles.linkCell}>Nomor WhatsApp</th>
                  <th className={styles.linkCell}>Email</th>
                  <th className={styles.tipeCell}>Tipe</th>
                  <th className={styles.statusCell}>Status</th>
                  <th className={styles.instansiCell}>Asal Instansi</th>
                  <th className={styles.aksiCell}>Aksi</th>
                  <th className={styles.optionsCell}>Opsi</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPendaftar.map((p) => (
                  <tr
                    key={p.id}
                    className={`${styles.tableRow} ${selectedRows.includes(p.id) ? styles.selected : ""}`}
                  >
                    <td className={styles.checkboxCell}>
                      <input
                        type="checkbox"
                        className={styles.checkbox}
                        checked={selectedRows.includes(p.id)}
                        onChange={() => toggleSelectRow(p.id)}
                      />
                    </td>
                    <td className={styles.dateCell}>{p.tanggal}</td>
                    <td className={styles.nameCell}>{p.nama}</td>
                    <td className={styles.linkCell}>
                      <a href={`https://wa.me/${p.noWhatsapp}`} target="_blank" rel="noopener noreferrer" className={styles.linkText}>
                        {p.noWhatsapp}
                      </a>
                    </td>
                    <td className={styles.linkCell}>
                      <a href={`mailto:${p.email}`} className={styles.linkText}>
                        {p.email}
                      </a>
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${getTipeBadgeClass(p.tipe)}`}>
                        {p.tipe}
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${getStatusBadgeClass(p.status)}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className={styles.instansiCell}>
                      <span className={styles.instansiText}>{p.instansi}</span>
                    </td>
                    <td>
                      <button
                        className={styles.viewButton}
                        onClick={() => router.push(`/admin/sjn/${programId}/pendaftar/${p.id}`)}
                      >
                        Lihat
                      </button>
                    </td>
                    <td className={styles.optionsCell}>
                      <button
                        ref={(el) => (optionsButtonRefs.current[p.id] = el)}
                        className={styles.optionsButton}
                        onClick={() => toggleDropdown(p.id)}
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

          <div className={styles.pagination}>
            <span className={styles.paginationInfo}>
              {filteredPendaftar.length > 0
                ? `${(currentPage - 1) * itemsPerPage + 1} - ${Math.min(currentPage * itemsPerPage, filteredPendaftar.length)} dari ${filteredPendaftar.length}`
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

      {activeDropdown !== null && paginatedPendaftar.find((p) => p.id === activeDropdown) && (
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
            onClick={() => handleTerima(activeDropdown)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Terima
          </button>
          <button
            className={styles.dropdownItem}
            onClick={() => handleTolak(activeDropdown)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            Tolak
          </button>
          <button
            className={`${styles.dropdownItem} ${styles.deleteItem}`}
            onClick={() => openDeleteModal(activeDropdown)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
            Hapus
          </button>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {deleteModal.open && (
        <div className={styles.modalBackdrop} onClick={closeDeleteModal}>
          <div
            className={styles.modalDialog}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
          >
            <div className={styles.modalIconWrap}>
              <svg className={styles.modalIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </div>

            <h3 id="delete-modal-title" className={styles.modalTitle}>
              Hapus Pendaftar?
            </h3>
            <p className={styles.modalDescription}>
              Anda akan menghapus pendaftar <strong>"{deleteModal.fullName}"</strong> dari program SJN ini.
              Seluruh data formulir dan file yang terhubung akan ikut terhapus dan tidak dapat dikembalikan.
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
                onClick={handleHapus}
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