"use client";

import { useState, useRef, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminSidebar from "../../../components/AdminSidebar.js";
import styles from "./page.module.css";

const ChevronIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.chevronIcon}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const programDetailData = {
  "semesta-camp-10-palembang": {
    id: "semesta-camp-10-palembang",
    nama: "Semesta Camp #10 Palembang",
    jadwal: "2023-01-15",
    lokasi: "Jl. Merdeka No.1, Palembang, Sumatera Selatan",
    batasRegistrasi: "2023-01-10",
    deskripsi: "Program kemanusiaan terbaik untuk paravolunteer Indonesia yang diselenggarakan di kota Palembang, Sumatera Selatan.",
    detailFields: [
      { id: "df1", label: "Kuota Peserta", type: "angka", value: "50", placeholder: "Masukkan jumlah kuota" },
    ],
    pekerjaanFields: [
      { id: "pf1", label: "Divisi", type: "textarea", value: "Pendidikan, Kesehatan, Logistik", placeholder: "Pisahkan dengan koma" },
      { id: "pf2", label: "Agenda", type: "textarea", value: "Day 1: Registrasi & Briefing\nDay 2: Kegiatan Volunteer\nDay 3: Evaluasi & Penutupan", placeholder: "Masukkan agenda kegiatan" },
    ],
  },
  "semesta-camp-9-yogyakarta": {
    id: "semesta-camp-9-yogyakarta",
    nama: "Semesta Camp #9 Yogyakarta",
    jadwal: "2022-12-20",
    lokasi: "Jl. Malioboro No.5, Yogyakarta",
    batasRegistrasi: "2022-12-15",
    deskripsi: "Program kemanusiaan di kota gudeg dengan suasana budaya yang kaya.",
    detailFields: [],
    pekerjaanFields: [],
  },
  "semesta-camp-8-bandung": {
    id: "semesta-camp-8-bandung",
    nama: "Semesta Camp #8 Bandung",
    jadwal: "2022-12-18",
    lokasi: "Jl. Braga No.10, Bandung, Jawa Barat",
    batasRegistrasi: "2022-12-13",
    deskripsi: "Program kemanusiaan di kota kembang dengan udara sejuk pegunungan.",
    detailFields: [],
    pekerjaanFields: [],
  },
  "semesta-camp-7-surabaya": {
    id: "semesta-camp-7-surabaya",
    nama: "Semesta Camp #7 Surabaya",
    jadwal: "2022-12-12",
    lokasi: "Jl. Pemuda No.3, Surabaya, Jawa Timur",
    batasRegistrasi: "2022-12-07",
    deskripsi: "Program kemanusiaan di kota pahlawan Surabaya.",
    detailFields: [],
    pekerjaanFields: [],
  },
  "semesta-camp-6-medan": {
    id: "semesta-camp-6-medan",
    nama: "Semesta Camp #6 Medan",
    jadwal: "2022-12-08",
    lokasi: "Jl. Gatot Subroto No.7, Medan, Sumatera Utara",
    batasRegistrasi: "2022-12-03",
    deskripsi: "Program kemanusiaan di kota Medan.",
    detailFields: [],
    pekerjaanFields: [],
  },
  "semesta-camp-5-makassar": {
    id: "semesta-camp-5-makassar",
    nama: "Semesta Camp #5 Makassar",
    jadwal: "2022-11-30",
    lokasi: "Jl. Sam Ratulangi No.2, Makassar, Sulawesi Selatan",
    batasRegistrasi: "2022-11-25",
    deskripsi: "Program kemanusiaan di kota Makassar.",
    detailFields: [],
    pekerjaanFields: [],
  },
  "semesta-camp-4-semarang": {
    id: "semesta-camp-4-semarang",
    nama: "Semesta Camp #4 Semarang",
    jadwal: "2022-11-22",
    lokasi: "Jl. Pandanaran No.8, Semarang, Jawa Tengah",
    batasRegistrasi: "2022-11-17",
    deskripsi: "Program kemanusiaan di kota Semarang.",
    detailFields: [],
    pekerjaanFields: [],
  },
  "semesta-camp-3-jakarta": {
    id: "semesta-camp-3-jakarta",
    nama: "Semesta Camp #3 Jakarta",
    jadwal: "2022-11-17",
    lokasi: "Jl. Sudirman No.15, Jakarta Selatan",
    batasRegistrasi: "2022-11-12",
    deskripsi: "Program kemanusiaan di ibu kota Jakarta.",
    detailFields: [],
    pekerjaanFields: [],
  },
  "semesta-camp-2-bali": {
    id: "semesta-camp-2-bali",
    nama: "Semesta Camp #2 Bali",
    jadwal: "2022-11-14",
    lokasi: "Jl. Sunset Road No.4, Kuta, Bali",
    batasRegistrasi: "2022-11-09",
    deskripsi: "Program kemanusiaan di Pulau Dewata.",
    detailFields: [],
    pekerjaanFields: [],
  },
  "semesta-camp-1-jakarta": {
    id: "semesta-camp-1-jakarta",
    nama: "Semesta Camp #1 Jakarta",
    jadwal: "2022-11-12",
    lokasi: "Jl. Thamrin No.1, Jakarta Pusat",
    batasRegistrasi: "2022-11-07",
    deskripsi: "Program kemanusiaan pertama di Jakarta.",
    detailFields: [],
    pekerjaanFields: [],
  },
};

const fieldTypes = ["Teks", "Textarea", "Angka", "Tanggal", "Dropdown", "Upload File"];

const Toast = ({ message, show }) => (
  <div className={`${styles.toast} ${show ? styles.toastShow : ""}`}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12" />
    </svg>
    {message}
  </div>
);

export default function EditProgramPage({ params }) {
  const resolvedParams = use(params);
  const programId = resolvedParams.id;
  const router = useRouter();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const fileInputRef = useRef(null);

  // Form state
  const [nama, setNama] = useState("");
  const [jadwal, setJadwal] = useState("");
  const [lokasi, setLokasi] = useState("");
  const [batasRegistrasi, setBatasRegistrasi] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [posterPreview, setPosterPreview] = useState(null);
  const [posterFile, setPosterFile] = useState(null);

  // Dynamic fields
  const [detailFields, setDetailFields] = useState([]);
  const [pekerjaanFields, setPekerjaanFields] = useState([]);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [targetSection, setTargetSection] = useState(null); // "detail" | "pekerjaan"
  const [modalFieldType, setModalFieldType] = useState("Teks");
  const [modalLabel, setModalLabel] = useState("");

  // Toast
  const [toastShow, setToastShow] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    if (programId && programDetailData[programId]) {
      const data = programDetailData[programId];
      setNama(data.nama);
      setJadwal(data.jadwal);
      setLokasi(data.lokasi);
      setBatasRegistrasi(data.batasRegistrasi);
      setDeskripsi(data.deskripsi);
      setDetailFields(data.detailFields);
      setPekerjaanFields(data.pekerjaanFields);
    }
  }, [programId]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setToastShow(true);
    setTimeout(() => setToastShow(false), 3000);
  };

  const handlePosterChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPosterFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPosterPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePoster = () => {
    setPosterPreview(null);
    setPosterFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const openModal = (section) => {
    setTargetSection(section);
    setModalFieldType("Teks");
    setModalLabel("");
    setModalOpen(true);
  };

  const handleAddField = () => {
    if (!modalLabel.trim()) return;

    const newField = {
      id: `${targetSection === "detail" ? "df" : "pf"}-${Date.now()}`,
      label: modalLabel,
      type: modalFieldType.toLowerCase(),
      value: "",
      placeholder: "",
    };

    if (targetSection === "detail") {
      setDetailFields((prev) => [...prev, newField]);
    } else {
      setPekerjaanFields((prev) => [...prev, newField]);
    }

    setModalOpen(false);
  };

  const handleRemoveField = (section, fieldId) => {
    if (section === "detail") {
      setDetailFields((prev) => prev.filter((f) => f.id !== fieldId));
    } else {
      setPekerjaanFields((prev) => prev.filter((f) => f.id !== fieldId));
    }
  };

  const handleFieldChange = (section, fieldId, value) => {
    if (section === "detail") {
      setDetailFields((prev) =>
        prev.map((f) => (f.id === fieldId ? { ...f, value } : f))
      );
    } else {
      setPekerjaanFields((prev) =>
        prev.map((f) => (f.id === fieldId ? { ...f, value } : f))
      );
    }
  };

  const handleSave = () => {
    if (!nama.trim()) return showToast("Nama Program harus diisi!");
    if (!jadwal) return showToast("Jadwal Pelaksanaan harus diisi!");
    if (!lokasi.trim()) return showToast("Lokasi harus diisi!");
    if (!batasRegistrasi) return showToast("Batas Registrasi harus diisi!");
    showToast("Perubahan berhasil disimpan!");
  };

  const program = programId ? programDetailData[programId] : null;

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
            <Link href="/admin/semesta-camp" className={styles.backLinkError}>
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
        {/* Toast */}
        <Toast message={toastMessage} show={toastShow} />

        {/* Header */}
        <div className={styles.contentHeader}>
          <div className={styles.headerTop}>
            <Link href="/admin/semesta-camp" className={styles.backButton}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className={styles.headerTitle}>Detail Program</h1>
            <button className={styles.saveButtonTop} onClick={handleSave}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              Simpan Perubahan
            </button>
          </div>
          <p className={styles.headerSubtitle}>Edit detail program anda</p>
        </div>

        {/* SECTION 1: Informasi */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Informasi</h2>
          <div className={styles.infoGrid}>
            {/* Poster */}
            <div className={styles.posterColumn}>
              <label className={styles.fieldLabel}>Poster</label>
              <div
                className={styles.posterUpload}
                onClick={() => fileInputRef.current?.click()}
              >
                {posterPreview ? (
                  <div className={styles.posterPreview}>
                    <img src={posterPreview} alt="Poster" className={styles.posterImage} />
                    <button
                      className={styles.removePosterBtn}
                      onClick={(e) => { e.stopPropagation(); handleRemovePoster(); }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className={styles.posterPlaceholder}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    <span>Upload Photo</span>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className={styles.hiddenInput}
                onChange={handlePosterChange}
              />
            </div>

            {/* Fields */}
            <div className={styles.fieldsColumn}>
              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Nama Program <span className={styles.required}>*</span></label>
                  <div className={styles.inputWrapper}>
                    <input
                      type="text"
                      className={styles.input}
                      value={nama}
                      onChange={(e) => setNama(e.target.value)}
                      placeholder="Masukkan nama program"
                    />
                  </div>
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Jadwal Pelaksanaan <span className={styles.required}>*</span></label>
                  <div className={styles.inputWrapper}>
                    <input
                      type="date"
                      className={styles.input}
                      value={jadwal}
                      onChange={(e) => setJadwal(e.target.value)}
                    />
                    <svg className={styles.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Lokasi <span className={styles.required}>*</span></label>
                <div className={styles.inputWrapper}>
                  <input
                    type="text"
                    className={styles.input}
                    value={lokasi}
                    onChange={(e) => setLokasi(e.target.value)}
                    placeholder="Masukkan lokasi kegiatan"
                  />
                </div>
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Batas Registrasi <span className={styles.required}>*</span></label>
                  <div className={styles.inputWrapper}>
                    <input
                      type="date"
                      className={styles.input}
                      value={batasRegistrasi}
                      onChange={(e) => setBatasRegistrasi(e.target.value)}
                    />
                    <svg className={styles.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </div>
                </div>
                <Link href={`/admin/semesta-camp/${programId}/formulir`} className={styles.viewFormBtn}>
                  Lihat Formulir
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: Deskripsi */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Deskripsi</h2>
          <div className={styles.sectionCard}>
            <label className={styles.fieldLabel}>Deskripsi</label>
            <textarea
              className={styles.textarea}
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Masukkan deskripsi program..."
              rows={5}
            />
          </div>
        </div>

        {/* SECTION 3: Detail Program */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Detail Program</h2>
          <div className={styles.sectionCard}>
            {detailFields.map((field) => (
              <div key={field.id} className={styles.dynamicField}>
                <div className={styles.dynamicFieldHeader}>
                  <label className={styles.fieldLabel}>{field.label}</label>
                  <button
                    className={styles.removeFieldBtn}
                    onClick={() => handleRemoveField("detail", field.id)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                  </button>
                </div>
                {field.type === "textarea" ? (
                  <textarea
                    className={styles.textarea}
                    value={field.value}
                    onChange={(e) => handleFieldChange("detail", field.id, e.target.value)}
                    placeholder={field.placeholder}
                    rows={3}
                  />
                ) : field.type === "angka" ? (
                  <input
                    type="number"
                    className={styles.input}
                    value={field.value}
                    onChange={(e) => handleFieldChange("detail", field.id, e.target.value)}
                    placeholder={field.placeholder}
                  />
                ) : field.type === "tanggal" ? (
                  <input
                    type="date"
                    className={styles.input}
                    value={field.value}
                    onChange={(e) => handleFieldChange("detail", field.id, e.target.value)}
                  />
                ) : field.type === "dropdown" ? (
                  <select
                    className={styles.input}
                    value={field.value}
                    onChange={(e) => handleFieldChange("detail", field.id, e.target.value)}
                  >
                    <option value="">{field.placeholder || "Pilih..."}</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    className={styles.input}
                    value={field.value}
                    onChange={(e) => handleFieldChange("detail", field.id, e.target.value)}
                    placeholder={field.placeholder}
                  />
                )}
              </div>
            ))}

            <button className={styles.addFieldBtn} onClick={() => openModal("detail")}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Click to add more field
            </button>
          </div>
        </div>

        {/* SECTION 4: Pekerjaan */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Pekerjaan</h2>
          <div className={styles.sectionCard}>
            {pekerjaanFields.map((field) => (
              <div key={field.id} className={styles.dynamicField}>
                <div className={styles.dynamicFieldHeader}>
                  <label className={styles.fieldLabel}>{field.label}</label>
                  <button
                    className={styles.removeFieldBtn}
                    onClick={() => handleRemoveField("pekerjaan", field.id)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                  </button>
                </div>
                {field.type === "textarea" ? (
                  <textarea
                    className={styles.textarea}
                    value={field.value}
                    onChange={(e) => handleFieldChange("pekerjaan", field.id, e.target.value)}
                    placeholder={field.placeholder}
                    rows={3}
                  />
                ) : field.type === "angka" ? (
                  <input
                    type="number"
                    className={styles.input}
                    value={field.value}
                    onChange={(e) => handleFieldChange("pekerjaan", field.id, e.target.value)}
                    placeholder={field.placeholder}
                  />
                ) : field.type === "tanggal" ? (
                  <input
                    type="date"
                    className={styles.input}
                    value={field.value}
                    onChange={(e) => handleFieldChange("pekerjaan", field.id, e.target.value)}
                  />
                ) : field.type === "dropdown" ? (
                  <select
                    className={styles.input}
                    value={field.value}
                    onChange={(e) => handleFieldChange("pekerjaan", field.id, e.target.value)}
                  >
                    <option value="">{field.placeholder || "Pilih..."}</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    className={styles.input}
                    value={field.value}
                    onChange={(e) => handleFieldChange("pekerjaan", field.id, e.target.value)}
                    placeholder={field.placeholder}
                  />
                )}
              </div>
            ))}

            <button className={styles.addFieldBtn} onClick={() => openModal("pekerjaan")}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Click to add more field
            </button>
          </div>
        </div>

        {/* Save Button Bottom */}
        <div className={styles.saveSection}>
          <button className={styles.saveButtonBottom} onClick={handleSave}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            Simpan Perubahan
          </button>
        </div>

        {/* Modal Tambah Field */}
        {modalOpen && (
          <div className={styles.modalOverlay} onClick={() => setModalOpen(false)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3 className={styles.modalTitle}>Tambah Field</h3>
                <button className={styles.modalClose} onClick={() => setModalOpen(false)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <div className={styles.modalBody}>
                <div className={styles.modalField}>
                  <label className={styles.fieldLabel}>Pilih Tipe Field</label>
                  <div className={styles.selectWrapper}>
                    <select
                      className={styles.input}
                      value={modalFieldType}
                      onChange={(e) => setModalFieldType(e.target.value)}
                    >
                      {fieldTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    <ChevronIcon />
                  </div>
                </div>

                <div className={styles.modalField}>
                  <label className={styles.fieldLabel}>Label</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={modalLabel}
                    onChange={(e) => setModalLabel(e.target.value)}
                    placeholder="Label"
                  />
                </div>
              </div>

              <button
                className={styles.addFieldModalBtn}
                onClick={handleAddField}
                disabled={!modalLabel.trim()}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Field
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}