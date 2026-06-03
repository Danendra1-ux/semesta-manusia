"use client";

import { useState, useRef } from "react";
import AdminSidebar from "../components/AdminSidebar.jsx";
import styles from "./page.module.css";

const ITEMS_PER_PAGE = 8;

const liputanData = [
  {
    id: "l1",
    foto: null,
    judul: "Semesta Manusia Gelar SJN #4 di Raja Ampat",
    deskripsi: "Program volunteer tahunan Semesta Manusia kembali hadir di Raja Ampat, Papua Barat Daya. Puluhan relawan terpilih siap berkontribusi untuk masyarakat lokal.",
    linkBerita: "https://www.detik.com",
    saved: true,
  },
  {
    id: "l2",
    foto: null,
    judul: "Volunteer Muda Indonesia Bantu Pendidikan di Sumba",
    deskripsi: "Melalui program SJN #3, para relawan dari berbagai penjuru Indonesia hadir di Sumba untuk membantu kegiatan belajar mengajar di daerah terpencil.",
    linkBerita: "https://www.kompas.com",
    saved: true,
  },
  {
    id: "l3",
    foto: null,
    judul: "Semesta Camp #10 Palembang Sukses Digelar",
    deskripsi: "Lebih dari 100 peserta mengikuti Semesta Camp #10 di Palembang. Program ini berfokus pada pemberdayaan komunitas lokal dan peningkatan kesadaran lingkungan.",
    linkBerita: "https://www.tribunnews.com",
    saved: true,
  },
  {
    id: "l4",
    foto: null,
    judul: "Kisah Inspiratif Relawan SJN di Flores",
    deskripsi: "Para relawan Semesta Jelajah Nusantara #2 berbagi cerita tentang pengalaman mereka membantu warga di Desa Wae Rebo, Manggarai, Flores.",
    linkBerita: "https://www.tempo.co",
    saved: true,
  },
  {
    id: "l5",
    foto: null,
    judul: "Semesta Manusia: Membangun Indonesia Lewat Volunteering",
    deskripsi: "Organisasi Semesta Manusia Indonesia terus konsisten menjalankan misi kemanusiaan melalui program volunteer di berbagai pelosok nusantara.",
    linkBerita: "https://www.cnnindonesia.com",
    saved: true,
  },
  {
    id: "l6",
    foto: null,
    judul: "Program SJN Toraja: Melestarikan Budaya Lewat Aksi Nyata",
    deskripsi: "Relawan Semesta Manusia turut serta dalam pelestarian budaya Toraja sekaligus membantu kegiatan pendidikan anak di desa adat Ke'te Kesu.",
    linkBerita: "https://www.merdeka.com",
    saved: true,
  },
  {
    id: "l7",
    foto: null,
    judul: "Semesta Camp Hadir di 10 Kota, Ribuan Volunteer Bergabung",
    deskripsi: "Dalam kurun waktu 3 tahun, Semesta Camp telah hadir di 10 kota di Indonesia dengan total lebih dari 1.000 volunteer yang terlibat.",
    linkBerita: "https://www.liputan6.com",
    saved: true,
  },
  {
    id: "l8",
    foto: null,
    judul: "Generasi Muda dan Semangat Mengabdi: Cerita dari Raja Ampat",
    deskripsi: "Di balik keindahan alam Raja Ampat, para relawan muda Semesta Manusia berjuang membantu masyarakat pesisir yang membutuhkan akses pendidikan dan kesehatan.",
    linkBerita: "https://www.republika.co.id",
    saved: true,
  },
  {
    id: "l9",
    foto: null,
    judul: "Aksi Nyata di Kalimantan: SJN Pilot Program",
    deskripsi: "Program pilot perdana Semesta Jelajah Nusantara di Kalimantan Timur menjadi tonggak awal lahirnya program volunteer berskala nasional.",
    linkBerita: "https://www.detik.com",
    saved: true,
  },
  {
    id: "l10",
    foto: null,
    judul: "Semesta Camp Yogyakarta: Kolaborasi Budaya dan Kemanusiaan",
    deskripsi: "Di kota gudeg, para relawan tidak hanya membantu masyarakat tetapi juga belajar tentang kekayaan budaya Jawa yang luar biasa.",
    linkBerita: "https://www.kompas.com",
    saved: true,
  },
  {
    id: "l11",
    foto: null,
    judul: "Relawan Semesta Manusia Bantu Korban Banjir di Semarang",
    deskripsi: "Tim relawan bergerak cepat membantu warga terdampak banjir di Semarang dengan mendistribusikan bantuan logistik dan layanan kesehatan.",
    linkBerita: "https://www.tribunnews.com",
    saved: true,
  },
  {
    id: "l12",
    foto: null,
    judul: "SJN #3 Sumba: Menjangkau yang Tak Terjangkau",
    deskripsi: "Perjalanan panjang menuju Desa Londalima tidak menyurutkan semangat para relawan untuk memberikan yang terbaik bagi masyarakat Sumba Timur.",
    linkBerita: "https://www.tempo.co",
    saved: true,
  },
  {
    id: "l13",
    foto: null,
    judul: "Semesta Camp Bali: Harmoni Alam dan Pengabdian",
    deskripsi: "Program Semesta Camp di Bali mengajak relawan untuk peduli terhadap kelestarian lingkungan pesisir sambil memberdayakan komunitas lokal.",
    linkBerita: "https://www.cnnindonesia.com",
    saved: true,
  },
  {
    id: "l14",
    foto: null,
    judul: "Donasi Publik Dukung Program SJN Capai Target",
    deskripsi: "Antusiasme masyarakat dalam mendukung program Semesta Jelajah Nusantara terus meningkat, dengan donasi publik melampaui target yang ditetapkan.",
    linkBerita: "https://www.merdeka.com",
    saved: true,
  },
  {
    id: "l15",
    foto: null,
    judul: "Semesta Manusia Raih Penghargaan Organisasi Volunteer Terbaik",
    deskripsi: "Dedikasi dan konsistensi Semesta Manusia dalam menjalankan program kemanusiaan mendapatkan pengakuan dari berbagai lembaga nasional.",
    linkBerita: "https://www.liputan6.com",
    saved: true,
  },
  {
    id: "l16",
    foto: null,
    judul: "Cerita Perubahan: Dampak Nyata SJN di Pelosok Nusantara",
    deskripsi: "Dari Toraja hingga Raja Ampat, program Semesta Jelajah Nusantara telah meninggalkan jejak perubahan yang dirasakan langsung oleh masyarakat lokal.",
    linkBerita: "https://www.republika.co.id",
    saved: true,
  },
];

const Toast = ({ message, show }) => (
  <div className={`${styles.toast} ${show ? styles.toastShow : ""}`}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12" />
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
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  );
};

const LiputanCard = ({ item, onFieldChange, onDelete, onSave, fileInputRef }) => {
  const isSaveable = item.judul.trim() && item.linkBerita.trim();

  const handlePhotoClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.dataset.itemId = item.id;
      fileInputRef.current.click();
    }
  };

  return (
    <div className={styles.liputanCard}>
      {/* Delete button */}
      <button
        className={styles.deleteCardBtn}
        onClick={() => onDelete(item.id)}
        title="Hapus berita"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
          <line x1="10" y1="11" x2="10" y2="17" />
          <line x1="14" y1="11" x2="14" y2="17" />
        </svg>
      </button>

      <div className={styles.cardGrid}>
        {/* Kolom 1 — Foto */}
        <div className={styles.fotoColumn}>
          <label className={styles.fieldLabel}>Foto</label>
          <div className={styles.photoUpload} onClick={handlePhotoClick}>
            {item.foto ? (
              <div className={styles.photoPreview}>
                <img src={item.foto} alt="Foto" className={styles.photoImage} />
              </div>
            ) : (
              <div className={styles.photoPlaceholder}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
            )}
          </div>
          <p className={styles.uploadHint}>Upload Photo</p>
        </div>

        {/* Kolom 2 — Judul */}
        <div className={styles.judulColumn}>
          <label className={styles.fieldLabel}>Judul</label>
          <input
            type="text"
            className={styles.input}
            value={item.judul}
            onChange={(e) => onFieldChange(item.id, "judul", e.target.value)}
            placeholder="Placeholder"
          />
        </div>

        {/* Kolom 3 — Deskripsi */}
        <div className={styles.deskripsiColumn}>
          <label className={styles.fieldLabel}>Deskripsi</label>
          <textarea
            className={styles.textarea}
            value={item.deskripsi}
            onChange={(e) => onFieldChange(item.id, "deskripsi", e.target.value)}
            placeholder="Placeholder"
            rows={4}
          />
        </div>

        {/* Kolom 4 — Link + Aksi */}
        <div className={styles.linkColumn}>
          <label className={styles.fieldLabel}>Link Berita</label>
          <input
            type="text"
            className={styles.input}
            value={item.linkBerita}
            onChange={(e) => onFieldChange(item.id, "linkBerita", e.target.value)}
            placeholder="Placeholder"
          />
          <p className={styles.inputHint}>URL artikel eksternal (detik.com, kompas.com, dll.)</p>

          <button
            className={`${styles.saveCardBtn} ${isSaveable ? styles.saveCardBtnActive : styles.saveCardBtnDisabled}`}
            onClick={() => isSaveable && onSave(item.id)}
            disabled={!isSaveable}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default function LiputanPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [liputanList, setLiputanList] = useState(liputanData);
  const [currentPage, setCurrentPage] = useState(1);
  const [toastShow, setToastShow] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const fileInputRef = useRef(null);

  const totalPages = Math.max(1, Math.ceil(liputanList.length / ITEMS_PER_PAGE));
  const currentItems = liputanList.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const showToast = (msg) => {
    setToastMessage(msg);
    setToastShow(true);
    setTimeout(() => setToastShow(false), 3000);
  };

  const handleTambahBerita = () => {
    const newItem = {
      id: `l-${Date.now()}`,
      foto: null,
      judul: "",
      deskripsi: "",
      linkBerita: "",
      saved: false,
    };
    setLiputanList((prev) => [newItem, ...prev]);
    setCurrentPage(1);
  };

  const handleFieldChange = (id, field, value) => {
    setLiputanList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    const itemId = e.target.dataset.itemId;
    if (file && itemId) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLiputanList((prev) =>
          prev.map((item) =>
            item.id === itemId ? { ...item, foto: reader.result } : item
          )
        );
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const handleDelete = (id) => {
    setLiputanList((prev) => {
      const newList = prev.filter((item) => item.id !== id);
      const newTotalPages = Math.max(1, Math.ceil(newList.length / ITEMS_PER_PAGE));
      if (currentPage > newTotalPages) {
        setCurrentPage(newTotalPages);
      }
      return newList;
    });
  };

  const handleSave = (id) => {
    setLiputanList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, saved: true } : item))
    );
    showToast("Berita berhasil disimpan!");
  };

  return (
    <div className={styles.pageLayout}>
      <AdminSidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <main className={`${styles.mainContent} ${isSidebarCollapsed ? styles.expanded : ""}`}>
        <Toast message={toastMessage} show={toastShow} />

        {/* Header */}
        <div className={styles.contentHeader}>
          <h1 className={styles.headerTitle}>Liputan</h1>
          <p className={styles.headerSubtitle}>
            Kelola daftar berita dan liputan program Semesta Manusia
          </p>
        </div>

        {/* Card Utama */}
        <div className={styles.mainCard}>
          {/* Card Header */}
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Daftar Liputan</h2>
            <button className={styles.tambahBtn} onClick={handleTambahBerita}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Tambah Berita</span>
            </button>
          </div>

          {/* List Card */}
          <div className={styles.cardList}>
            {currentItems.length === 0 ? (
              <div className={styles.emptyState}>
                <p>Belum ada liputan. Klik "Tambah Berita" untuk membuat baru.</p>
              </div>
            ) : (
              currentItems.map((item) => (
                <LiputanCard
                  key={item.id}
                  item={item}
                  onFieldChange={handleFieldChange}
                  onDelete={handleDelete}
                  onSave={handleSave}
                  fileInputRef={fileInputRef}
                />
              ))
            )}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}

        {/* Hidden file input for photo upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className={styles.hiddenInput}
          onChange={handlePhotoChange}
        />
      </main>
    </div>
  );
}
