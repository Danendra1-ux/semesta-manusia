"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import AdminSidebar from "../components/AdminSidebar.jsx";
import { useSidebar } from "../components/SidebarContext";
import styles from "./page.module.css";

const ITEMS_PER_PAGE = 10;

const Toast = ({ message, show, isError }) => (
  <div
    className={`${styles.toast} ${show ? styles.toastShow : ""} ${isError ? styles.toastError : ""}`}
    role="status"
    aria-live="polite"
  >
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      {isError ? (
        <>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </>
      ) : (
        <polyline points="20 6 9 17 4 12" />
      )}
    </svg>
    {message}
  </div>
);

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className={styles.pagination}>
      <button
        className={styles.paginationBtn}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Halaman sebelumnya"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {getPageNumbers().map((page, idx) =>
        page === "..." ? (
          <span key={`dots-${idx}`} className={styles.paginationDots}>...</span>
        ) : (
          <button
            key={page}
            className={`${styles.paginationBtn} ${currentPage === page ? styles.paginationBtnActive : ""}`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        )
      )}

      <button
        className={styles.paginationBtn}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Halaman berikutnya"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  );
};

const StarDisplay = ({ rating }) => (
  <div className={styles.starDisplay} aria-label={`Rating ${rating} dari 5`}>
    {[1, 2, 3, 4, 5].map((s) => (
      <svg
        key={s}
        viewBox="0 0 24 24"
        fill={rating >= s ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        className={styles.starIcon}
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ))}
  </div>
);

const formatDate = (iso) => {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
};

export default function AdminReviewsPage() {
  const { isCollapsed, toggle: onToggleSidebar } = useSidebar();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState("all"); // all | pending | published
  const [toastShow, setToastShow] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastIsError, setToastIsError] = useState(false);
  const [actionInFlight, setActionInFlight] = useState(null); // review id being processed
  const toastTimeoutRef = useRef(null);

  // Selected rows for bulk delete
  const [selectedRows, setSelectedRows] = useState([]);

  // Delete confirmation modal
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    id: null,
    name: "",
    isBulk: false,
    bulkCount: 0,
  });
  const [deleting, setDeleting] = useState(false);

  const showToast = useCallback((msg, isError = false) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    setToastIsError(isError);
    setToastShow(true);
    toastTimeoutRef.current = setTimeout(() => setToastShow(false), 3000);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await fetch("/api/admin/reviews", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Gagal memuat ulasan");
        setReviews([]);
        setLoading(false);
        return;
      }
      setReviews(data.reviews || []);
      setLoading(false);
    } catch (err) {
      console.error("Fetch admin reviews error:", err);
      setError("Tidak dapat terhubung ke server");
      setReviews([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleTogglePublish = async (review) => {
    if (actionInFlight) return;
    setActionInFlight(review.id);
    const nextState = !review.is_published;
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: review.id, is_published: nextState }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data?.error || "Gagal memperbarui ulasan", true);
        return;
      }
      setReviews((prev) =>
        prev.map((r) => (r.id === review.id ? { ...r, is_published: nextState } : r))
      );
      showToast(nextState ? "Ulasan ditampilkan" : "Ulasan disembunyikan");
    } catch (err) {
      console.error("Toggle publish error:", err);
      showToast("Gagal memperbarui ulasan", true);
    } finally {
      setActionInFlight(null);
    }
  };

  const openDeleteModal = (review) => {
    setDeleteModal({
      open: true,
      id: review.id,
      name: review.name || "",
      isBulk: false,
      bulkCount: 0,
    });
  };

  const openBulkDeleteModal = () => {
    setDeleteModal({
      open: true,
      id: null,
      name: "",
      isBulk: true,
      bulkCount: selectedRows.length,
    });
  };

  const closeDeleteModal = () => {
    if (deleting) return;
    setDeleteModal({ open: false, id: null, name: "", isBulk: false, bulkCount: 0 });
  };

  const handleDelete = async (review) => {
    if (actionInFlight || deleting) return;
    setDeleting(true);
    try {
      if (deleteModal.isBulk) {
        let successCount = 0;
        for (const id of selectedRows) {
          const res = await fetch(`/api/admin/reviews?id=${id}`, { method: "DELETE" });
          if (res.ok) successCount++;
        }
        await fetchReviews();
        setSelectedRows([]);
        setDeleteModal({ open: false, id: null, name: "", isBulk: false, bulkCount: 0 });
        showToast(`Berhasil menghapus ${successCount} ulasan`);
        return;
      }

      const id = deleteModal.id || review?.id;
      if (!id) return;
      const res = await fetch(`/api/admin/reviews?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data?.error || "Gagal menghapus ulasan", true);
        return;
      }
      setReviews((prev) => prev.filter((r) => r.id !== id));
      setSelectedRows((prev) => prev.filter((rowId) => rowId !== id));
      setDeleteModal({ open: false, id: null, name: "", isBulk: false, bulkCount: 0 });
      showToast("Ulasan berhasil dihapus");
    } catch (err) {
      console.error("Delete review error:", err);
      showToast("Gagal menghapus ulasan", true);
    } finally {
      setDeleting(false);
    }
  };

  // Filtered list
  const filteredReviews = reviews.filter((r) => {
    if (filter === "pending") return !r.is_published;
    if (filter === "published") return r.is_published;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const currentItems = filteredReviews.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

  const toggleSelectAll = () => {
    if (selectedRows.length === currentItems.length && currentItems.length > 0) {
      setSelectedRows([]);
    } else {
      setSelectedRows(currentItems.map((r) => r.id));
    }
  };

  const toggleSelectRow = (id) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const counts = {
    all: reviews.length,
    pending: reviews.filter((r) => !r.is_published).length,
    published: reviews.filter((r) => r.is_published).length,
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  return (
    <div className={styles.pageLayout}>
      <AdminSidebar
        isCollapsed={isCollapsed}
        onToggle={onToggleSidebar}
      />

      <main className={`${styles.mainContent} ${isCollapsed ? styles.expanded : ""}`}>
        <Toast message={toastMessage} show={toastShow} isError={toastIsError} />

        {/* Header */}
        <div className={styles.contentHeader}>
          <div className={styles.headerText}>
            <h1 className={styles.pageTitle}>Ulasan Relawan</h1>
            <p className={styles.pageSubtitle}>
              Moderasi ulasan yang dikirimkan oleh pengguna. Ulasan yang disetujui akan tampil di landing page.
            </p>
          </div>
        </div>

        {/* Main Card */}
        <div className={styles.tableCard}>
          {/* Filter Tabs */}
          <div className={styles.filterTabs} role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={filter === "all"}
              className={`${styles.filterTab} ${filter === "all" ? styles.filterTabActive : ""}`}
              onClick={() => handleFilterChange("all")}
            >
              Semua
              <span className={styles.filterCount}>{counts.all}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={filter === "pending"}
              className={`${styles.filterTab} ${filter === "pending" ? styles.filterTabActive : ""}`}
              onClick={() => handleFilterChange("pending")}
            >
              Menunggu
              <span className={styles.filterCount}>{counts.pending}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={filter === "published"}
              className={`${styles.filterTab} ${filter === "published" ? styles.filterTabActive : ""}`}
              onClick={() => handleFilterChange("published")}
            >
              Ditampilkan
              <span className={styles.filterCount}>{counts.published}</span>
            </button>
          </div>
          {/* Selected rows bar */}
          {selectedRows.length > 0 && !loading && (
            <div className={styles.selectedBar}>
              <span>{selectedRows.length} baris dipilih</span>
              <button
                className={styles.deleteSelectedBtn}
                onClick={() => openBulkDeleteModal()}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                </svg>
                Hapus yang dipilih
              </button>
              <button className={styles.cancelSelectionBtn} onClick={() => setSelectedRows([])}>
                Batalkan
              </button>
            </div>
          )}
          {loading ? (
            <div className={styles.skeletonList}>
              {[1, 2, 3].map((i) => (
                <div key={i} className={styles.skeletonRow} />
              ))}
            </div>
          ) : error ? (
            <div className={styles.errorState}>
              <p>{error}</p>
              <button
                className={styles.retryBtn}
                onClick={() => window.location.reload()}
              >
                Coba lagi
              </button>
            </div>
          ) : currentItems.length === 0 ? (
            <div className={styles.emptyState}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <p>
                {filter === "pending"
                  ? "Tidak ada ulasan yang menunggu moderasi."
                  : filter === "published"
                    ? "Belum ada ulasan yang ditampilkan."
                    : "Belum ada ulasan yang masuk."}
              </p>
            </div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.checkboxCell}>
                      <input
                        type="checkbox"
                        className={styles.checkbox}
                        checked={selectedRows.length === currentItems.length && currentItems.length > 0}
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th className={styles.thName}>Nama</th>
                    <th className={styles.thProgram}>Program</th>
                    <th className={styles.thRating}>Rating</th>
                    <th className={styles.thContent}>Ulasan</th>
                    <th className={styles.thDate}>Tanggal</th>
                    <th className={styles.thStatus}>Status</th>
                    <th className={styles.thActions}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((review) => (
                    <tr
                      key={review.id}
                      className={`${styles.tableRow} ${selectedRows.includes(review.id) ? styles.selected : ""}`}
                    >
                      <td className={styles.checkboxCell}>
                        <input
                          type="checkbox"
                          className={styles.checkbox}
                          checked={selectedRows.includes(review.id)}
                          onChange={() => toggleSelectRow(review.id)}
                        />
                      </td>
                      <td className={styles.tdName}>
                        <div className={styles.nameCell}>
                          <div className={styles.avatar}>
                            {review.name ? review.name.charAt(0).toUpperCase() : "?"}
                          </div>
                          <span className={styles.nameText}>{review.name}</span>
                        </div>
                      </td>
                      <td className={styles.tdProgram}>{review.program_title}</td>
                      <td className={styles.tdRating}>
                        <StarDisplay rating={review.rating} />
                      </td>
                      <td className={styles.tdContent}>
                        <p className={styles.contentText}>{review.content}</p>
                      </td>
                      <td className={styles.tdDate}>{formatDate(review.created_at)}</td>
                      <td className={styles.tdStatus}>
                        <span
                          className={`${styles.statusBadge} ${review.is_published ? styles.statusPublished : styles.statusPending}`}
                        >
                          {review.is_published ? "Ditampilkan" : "Menunggu"}
                        </span>
                      </td>
                      <td className={styles.tdActions}>
                        <div className={styles.actionGroup}>
                          <button
                            type="button"
                            className={`${styles.actionBtn} ${review.is_published ? styles.actionUnpublish : styles.actionPublish}`}
                            onClick={() => handleTogglePublish(review)}
                            disabled={actionInFlight === review.id}
                            title={review.is_published ? "Sembunyikan dari landing" : "Tampilkan di landing"}
                          >
                            {actionInFlight === review.id ? (
                              <span className={styles.miniSpinner} />
                            ) : review.is_published ? (
                              <>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                                  <line x1="1" y1="1" x2="23" y2="23" />
                                </svg>
                                Sembunyikan
                              </>
                            ) : (
                              <>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                                Setujui
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            className={`${styles.actionBtn} ${styles.actionDelete}`}
                            onClick={() => openDeleteModal(review)}
                            disabled={actionInFlight === review.id}
                            title="Hapus ulasan"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <Pagination
            currentPage={safePage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <div className={styles.modalBackdrop} onClick={closeDeleteModal}>
          <div
            className={styles.modalDialog}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-review-modal-title"
          >
            <div className={styles.modalIconWrap}>
              <svg className={styles.modalIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </div>

            <h3 id="delete-review-modal-title" className={styles.modalTitle}>
              {deleteModal.isBulk ? "Hapus Ulasan Terpilih?" : "Hapus Ulasan?"}
            </h3>
            <p className={styles.modalDescription}>
              {deleteModal.isBulk ? (
                <>Anda akan menghapus <strong>{deleteModal.bulkCount} ulasan</strong>. Tindakan ini tidak dapat dibatalkan.</>
              ) : (
                <>Anda akan menghapus ulasan dari <strong>&ldquo;{deleteModal.name}&rdquo;</strong>. Tindakan ini tidak dapat dibatalkan.</>
              )}
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
                onClick={() => handleDelete()}
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
    </div>
  );
}