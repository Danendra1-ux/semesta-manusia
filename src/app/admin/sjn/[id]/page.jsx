"use client";

import { useState, useMemo, useRef, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminSidebar from "../../components/AdminSidebar.jsx";
import styles from "./page.module.css";

const programData = {
  "sjn-4-raja-ampat": {
    id: "sjn-4-raja-ampat",
    nama: "SJN #4 Raja Ampat",
    deskripsi: "Semesta Jelajah Nusantara #4 hadir di Raja Ampat, surga bawah laut Indonesia. Program ini mengajak para volunteer untuk berkontribusi dalam bidang pendidikan, kesehatan, dan pelestarian lingkungan laut bersama masyarakat lokal.",
    pendaftar: [
      { id: 1, tanggal: "3 Jan 2026", nama: "Bagas Prasetyo", noWhatsapp: "081298765432", email: "bagas.prasetyo@gmail.com", status: "Pending", instansi: "Universitas Indonesia", tipe: "Fully Funded" },
      { id: 2, tanggal: "28 Des 2025", nama: "Layla Nuraini", noWhatsapp: "082134567891", email: "layla.nuraini@gmail.com", status: "Diterima", instansi: "Institut Teknologi Bandung", tipe: "Fully Funded" },
      { id: 3, tanggal: "25 Des 2025", nama: "Wahyu Hidayat", noWhatsapp: "083145678902", email: "wahyu.hidayat@gmail.com", status: "Ditolak", instansi: "Universitas Gadjah Mada", tipe: "Self Funded" },
      { id: 4, tanggal: "20 Des 2025", nama: "Putri Anggraini", noWhatsapp: "084156789013", email: "putri.anggraini@gmail.com", status: "Pending", instansi: "Universitas Brawijaya", tipe: "Fully Funded" },
      { id: 5, tanggal: "15 Des 2025", nama: "Dimas Saputra", noWhatsapp: "085167890124", email: "dimas.saputra@gmail.com", status: "Pending", instansi: "Universitas Airlangga", tipe: "Self Funded" },
      { id: 6, tanggal: "10 Des 2025", nama: "Aulia Rahma", noWhatsapp: "086178901235", email: "aulia.rahma@gmail.com", status: "Diterima", instansi: "Universitas Diponegoro", tipe: "Fully Funded" },
      { id: 7, tanggal: "5 Des 2025", nama: "Rizal Firmansyah", noWhatsapp: "087189012346", email: "rizal.firmansyah@gmail.com", status: "Pending", instansi: "Universitas Hasanuddin", tipe: "Self Funded" },
      { id: 8, tanggal: "1 Des 2025", nama: "Citra Dewi", noWhatsapp: "088190123457", email: "citra.dewi@gmail.com", status: "Diterima", instansi: "Universitas Padjadjaran", tipe: "Fully Funded" },
      { id: 9, tanggal: "28 Nov 2025", nama: "Arif Budiman", noWhatsapp: "089101234568", email: "arif.budiman@gmail.com", status: "Ditolak", instansi: "Universitas Sebelas Maret", tipe: "Self Funded" },
      { id: 10, tanggal: "25 Nov 2025", nama: "Sari Pertiwi", noWhatsapp: "081212345679", email: "sari.pertiwi@gmail.com", status: "Pending", instansi: "Universitas Lampung", tipe: "Fully Funded" },
    ],
  },
  "sjn-3-sumba": {
    id: "sjn-3-sumba",
    nama: "SJN #3 Sumba",
    deskripsi: "Semesta Jelajah Nusantara #3 berlokasi di Pulau Sumba yang terkenal dengan kebudayaan megalitik dan kain tenun ikat tradisionalnya. Volunteer akan membantu masyarakat lokal dalam bidang pendidikan dan pemberdayaan ekonomi.",
    pendaftar: [
      { id: 1, tanggal: "1 Jun 2025", nama: "Hendra Kusuma", noWhatsapp: "081323456780", email: "hendra.kusuma@gmail.com", status: "Diterima", instansi: "Universitas Udayana", tipe: "Fully Funded" },
      { id: 2, tanggal: "28 Mei 2025", nama: "Mega Lestari", noWhatsapp: "082334567891", email: "mega.lestari@gmail.com", status: "Diterima", instansi: "Universitas Mataram", tipe: "Self Funded" },
      { id: 3, tanggal: "25 Mei 2025", nama: "Farid Maulana", noWhatsapp: "083345678902", email: "farid.maulana@gmail.com", status: "Ditolak", instansi: "Politeknik Negeri Bali", tipe: "Fully Funded" },
      { id: 4, tanggal: "20 Mei 2025", nama: "Yuni Astuti", noWhatsapp: "084356789013", email: "yuni.astuti@gmail.com", status: "Diterima", instansi: "Universitas Nusa Cendana", tipe: "Fully Funded" },
      { id: 5, tanggal: "15 Mei 2025", nama: "Taufik Rahman", noWhatsapp: "085367890124", email: "taufik.rahman@gmail.com", status: "Diterima", instansi: "Universitas Flores", tipe: "Self Funded" },
      { id: 6, tanggal: "10 Mei 2025", nama: "Indah Permata", noWhatsapp: "086378901235", email: "indah.permata@gmail.com", status: "Ditolak", instansi: "STIKES Kupang", tipe: "Fully Funded" },
      { id: 7, tanggal: "5 Mei 2025", nama: "Galih Wicaksono", noWhatsapp: "087389012346", email: "galih.wicaksono@gmail.com", status: "Diterima", instansi: "Universitas Timor", tipe: "Self Funded" },
      { id: 8, tanggal: "1 Mei 2025", nama: "Rini Handayani", noWhatsapp: "088390123457", email: "rini.handayani@gmail.com", status: "Diterima", instansi: "Universitas Mulawarman", tipe: "Fully Funded" },
      { id: 9, tanggal: "28 Apr 2025", nama: "Eko Santoso", noWhatsapp: "089301234568", email: "eko.santoso@gmail.com", status: "Ditolak", instansi: "Universitas Palangka Raya", tipe: "Self Funded" },
      { id: 10, tanggal: "25 Apr 2025", nama: "Fitri Rahayu", noWhatsapp: "081312345679", email: "fitri.rahayu@gmail.com", status: "Diterima", instansi: "Universitas Lambung Mangkurat", tipe: "Fully Funded" },
    ],
  },
  "sjn-2-flores": {
    id: "sjn-2-flores",
    nama: "SJN #2 Flores",
    deskripsi: "Semesta Jelajah Nusantara #2 di Flores membawa volunteer ke desa adat Wae Rebo yang tersembunyi di pegunungan Manggarai. Program fokus pada pelestarian budaya dan peningkatan kualitas pendidikan anak.",
    pendaftar: [
      { id: 1, tanggal: "10 Feb 2025", nama: "Bayu Setiawan", noWhatsapp: "081445678901", email: "bayu.setiawan@gmail.com", status: "Diterima", instansi: "Universitas Katolik Widya Mandala", tipe: "Fully Funded" },
      { id: 2, tanggal: "8 Feb 2025", nama: "Anisa Kumala", noWhatsapp: "082456789012", email: "anisa.kumala@gmail.com", status: "Diterima", instansi: "Universitas Dr. Soetomo", tipe: "Self Funded" },
      { id: 3, tanggal: "5 Feb 2025", nama: "Rudi Hermawan", noWhatsapp: "083467890123", email: "rudi.hermawan@gmail.com", status: "Pending", instansi: "Universitas Wijaya Kusuma", tipe: "Fully Funded" },
      { id: 4, tanggal: "3 Feb 2025", nama: "Dewi Lestari", noWhatsapp: "084478901234", email: "dewi.lestari@gmail.com", status: "Ditolak", instansi: "Universitas Airlangg", tipe: "Self Funded" },
      { id: 5, tanggal: "1 Feb 2025", nama: "Ahmad Zaini", noWhatsapp: "085489012345", email: "ahmad.zaini@gmail.com", status: "Diterima", instansi: "Institut Teknologi Sepuluh Nopember", tipe: "Fully Funded" },
    ],
  },
  "sjn-1-toraja": {
    id: "sjn-1-toraja",
    nama: "SJN #1 Toraja",
    deskripsi: "Program perdana Semesta Jelajah Nusantara hadir di Toraja, tanah yang kaya akan tradisi dan budaya unik. Volunteer turut serta dalam kegiatan pendidikan dan pelestarian warisan budaya lokal.",
    pendaftar: [
      { id: 1, tanggal: "20 Jul 2024", nama: "Mira Susanti", noWhatsapp: "081567890123", email: "mira.susanti@gmail.com", status: "Diterima", instansi: "Universitas Hasanuddin", tipe: "Fully Funded" },
      { id: 2, tanggal: "18 Jul 2024", nama: "Fajar Nugroho", noWhatsapp: "082578901234", email: "fajar.nugroho@gmail.com", status: "Diterima", instansi: "Universitas Brawijaya", tipe: "Self Funded" },
      { id: 3, tanggal: "15 Jul 2024", nama: "Siti Rahma", noWhatsapp: "083589012345", email: "siti.rahma@gmail.com", status: "Pending", instansi: "SMA 12 Bandung", tipe: "Fully Funded" },
      { id: 4, tanggal: "10 Jul 2024", nama: "Budi Santoso", noWhatsapp: "084590123456", email: "budi.santoso@gmail.com", status: "Ditolak", instansi: "Rumah Sakit Hasan Sadikin", tipe: "Self Funded" },
    ],
  },
  "sjn-pilot-kalimantan": {
    id: "sjn-pilot-kalimantan",
    nama: "SJN Pilot - Kalimantan",
    deskripsi: "Program pilot SJN pertama kali diuji coba di Desa Pampang, komunitas Dayak Kenyah di Samarinda. Program ini menjadi cikal bakal lahirnya program Semesta Jelajah Nusantara.",
    pendaftar: [
      { id: 1, tanggal: "1 Mar 2024", nama: "Andi Pratama", noWhatsapp: "081678901234", email: "andi.pratama@gmail.com", status: "Diterima", instansi: "Universitas Padjadjaran", tipe: "Fully Funded" },
      { id: 2, tanggal: "28 Feb 2024", nama: "Rina Marlina", noWhatsapp: "082689012345", email: "rina.marlina@gmail.com", status: "Diterima", instansi: "Universitas Padjadjaran", tipe: "Self Funded" },
      { id: 3, tanggal: "25 Feb 2024", nama: "Haris局", noWhatsapp: "083690123456", email: "haris@gmail.com", status: "Pending", instansi: "Politeknik Negeri Bandung", tipe: "Fully Funded" },
    ],
  },
};

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 14, height: 14, flexShrink: 0 }}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// Indonesian month mapping for date parsing
const MONTH_MAP = {
  "jan": 0, "januari": 0,
  "feb": 1, "februari": 1,
  "mar": 2, "maret": 2, "mara": 2,
  "apr": 3, "april": 3,
  "mei": 4,
  "jun": 5, "juni": 5,
  "jul": 6, "juli": 6,
  "ags": 7, "agustus": 7,
  "sep": 8, "september": 8,
  "okt": 9, "oktober": 9,
  "nov": 10, "nop": 10, "november": 10, "nopember": 10,
  "des": 11, "dés": 11, "desember": 11,
};

/** Parse Indonesian-format date string like "3 Jan 2026" into a Date object */
function parseIndonesianDate(str) {
  const parts = str.trim().split(/\s+/);
  if (parts.length < 3) return new Date(NaN);
  const day = parseInt(parts[0], 10);
  const month = MONTH_MAP[parts[1].toLowerCase().replace(/é/g, 'e')];
  const year = parseInt(parts[2], 10);
  if (isNaN(day) || month === undefined || isNaN(year)) return new Date(NaN);
  return new Date(year, month, day);
}

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
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [pendaftar, setPendaftar] = useState(null);
  const filterDropdownRef = useRef(null);
  const sortDropdownRef = useRef(null);

  useEffect(() => {
    if (programId && programData[programId]) {
      setPendaftar(programData[programId].pendaftar);
    }
  }, [programId]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(e.target)) {
        setFilterDropdownOpen(false);
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target)) {
        setSortDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const program = programId ? programData[programId] : null;

  const filteredPendaftar = useMemo(() => {
    if (!pendaftar) return [];
    let result = [...pendaftar];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
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
      result.sort((a, b) => parseIndonesianDate(b.tanggal) - parseIndonesianDate(a.tanggal));
    } else if (sortBy === "terlama") {
      result.sort((a, b) => parseIndonesianDate(a.tanggal) - parseIndonesianDate(b.tanggal));
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
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  const handleTerima = (id) => {
    setPendaftar((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "Diterima" } : p))
    );
    setActiveDropdown(null);
  };

  const handleTolak = (id) => {
    setPendaftar((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "Ditolak" } : p))
    );
    setActiveDropdown(null);
  };

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
        {/* Header */}
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

        {/* Table Card */}
        <div className={styles.tableCard}>
          {/* Card Header */}
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Pendaftar Program</h2>
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
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <div className={styles.filterButtons}>
              {/* Filter Dropdown */}
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

              {/* Sort Dropdown */}
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

          {/* Table */}
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
                      <a
                        href={`https://wa.me/${p.noWhatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.linkText}
                      >
                        {p.noWhatsapp}
                      </a>
                    </td>
                    <td className={styles.linkCell}>
                      <a
                        href={`mailto:${p.email}`}
                        className={styles.linkText}
                      >
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
                        className={styles.optionsButton}
                        onClick={() => toggleDropdown(p.id)}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="5" r="1" />
                          <circle cx="12" cy="12" r="1" />
                          <circle cx="12" cy="19" r="1" />
                        </svg>
                      </button>
                      {activeDropdown === p.id && (
                        <div className={styles.optionsDropdown}>
                          <button
                            className={styles.dropdownItem}
                            onClick={() => handleTerima(p.id)}
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Terima
                          </button>
                          <button
                            className={styles.dropdownItem}
                            onClick={() => handleTolak(p.id)}
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                            Tolak
                          </button>
                          <button className={`${styles.dropdownItem} ${styles.deleteItem}`}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                            </svg>
                            Hapus
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
    </div>
  );
}