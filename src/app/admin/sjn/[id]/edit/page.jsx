"use client";

import { useState, useRef, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminSidebar from "../../../components/AdminSidebar.jsx";
import styles from "./page.module.css";

const ChevronIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.chevronIcon}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const programDetailData = {
  "sjn-4-raja-ampat": {
    id: "sjn-4-raja-ampat",
    nama: "SJN #4 Raja Ampat",
    jadwal: "2026-06-03",
    lokasi: "Desa Saleo, Raja Ampat, Papua Barat Daya",
    deskripsi: "Semesta Jelajah Nusantara #4 hadir di Raja Ampat, surga bawah laut Indonesia. Program ini mengajak para volunteer untuk berkontribusi dalam bidang pendidikan, kesehatan, dan pelestarian lingkungan laut bersama masyarakat lokal.",
    detailFields: [
      { id: "df1", label: "Kuota Peserta", type: "angka", value: "30", placeholder: "Masukkan jumlah kuota" },
      { id: "df2", label: "Tipe Pendanaan", type: "teks", value: "Fully Funded & Self Funded", placeholder: "Masukkan tipe pendanaan" },
    ],
    pekerjaanFields: [
      { id: "pf1", label: "Divisi", type: "textarea", value: "Pendidikan, Kesehatan, Lingkungan, Dokumentasi", placeholder: "Pisahkan dengan koma" },
      { id: "pf2", label: "Agenda", type: "textarea", value: "Day 1: Briefing & Orientasi Lapangan\nDay 2-4: Program Pendidikan di Sekolah Dasar\nDay 5-7: Program Kesehatan Masyarakat\nDay 8-9: Konservasi Terumbu Karang\nDay 10: Evaluasi & Penutupan", placeholder: "Masukkan agenda kegiatan" },
      { id: "pf3", label: "Biaya Fully Funded", type: "teks", value: "Rp 85.000", placeholder: "Masukkan biaya pendaftaran" },
      { id: "pf4", label: "Biaya Self Funded", type: "teks", value: "Rp 50.000", placeholder: "Masukkan biaya pendaftaran" },
    ],
    fullyFunded: {
      batasRegistrasi: "2026-05-15",
      status: "Aktif",
    },
    selfFunded: {
      batasRegistrasi: "2026-05-20",
      status: "Non-aktif",
    },
  },
  "sjn-3-sumba": {
    id: "sjn-3-sumba",
    nama: "SJN #3 Sumba",
    jadwal: "2025-07-13",
    lokasi: "Desa Londalima, Sumba Timur, NTT",
    deskripsi: "Semesta Jelajah Nusantara #3 berlokasi di Pulau Sumba yang terkenal dengan kebudayaan megalitik dan kain tenun ikat tradisionalnya. Volunteer akan membantu masyarakat lokal dalam bidang pendidikan dan pemberdayaan ekonomi.",
    detailFields: [
      { id: "df1", label: "Kuota Peserta", type: "angka", value: "25", placeholder: "Masukkan jumlah kuota" },
    ],
    pekerjaanFields: [
      { id: "pf1", label: "Divisi", type: "textarea", value: "Pendidikan, Pemberdayaan Ekonomi, Dokumentasi", placeholder: "Pisahkan dengan koma" },
      { id: "pf2", label: "Agenda", type: "textarea", value: "Day 1: Registrasi & Briefing\nDay 2-5: Program Pendidikan\nDay 6-8: Pemberdayaan Ekonomi\nDay 9: Evaluasi & Penutupan", placeholder: "Masukkan agenda kegiatan" },
    ],
    fullyFunded: {
      batasRegistrasi: "2025-06-15",
      status: "Aktif",
    },
    selfFunded: {
      batasRegistrasi: "2025-06-20",
      status: "Aktif",
    },
  },
  "sjn-2-flores": {
    id: "sjn-2-flores",
    nama: "SJN #2 Flores",
    jadwal: "2025-02-20",
    lokasi: "Desa Wae Rebo, Manggarai, NTT",
    deskripsi: "Semesta Jelajah Nusantara #2 di Flores membawa volunteer ke desa adat Wae Rebo yang tersembunyi di pegunungan Manggarai. Program fokus pada pelestarian budaya dan peningkatan kualitas pendidikan anak.",
    detailFields: [],
    pekerjaanFields: [],
    fullyFunded: {
      batasRegistrasi: "2025-02-05",
      status: "Aktif",
    },
    selfFunded: {
      batasRegistrasi: "2025-02-10",
      status: "Non-aktif",
    },
  },
  "sjn-1-toraja": {
    id: "sjn-1-toraja",
    nama: "SJN #1 Toraja",
    jadwal: "2024-08-05",
    lokasi: "Desa Ke'te Kesu, Toraja Utara, Sulawesi Selatan",
    deskripsi: "Program perdana Semesta Jelajah Nusantara hadir di Toraja, tanah yang kaya akan tradisi dan budaya unik. Volunteer turut serta dalam kegiatan pendidikan dan pelestarian warisan budaya lokal.",
    detailFields: [],
    pekerjaanFields: [],
    fullyFunded: {
      batasRegistrasi: "2024-07-20",
      status: "Aktif",
    },
    selfFunded: {
      batasRegistrasi: "2024-07-25",
      status: "Non-aktif",
    },
  },
  "sjn-pilot-kalimantan": {
    id: "sjn-pilot-kalimantan",
    nama: "SJN Pilot - Kalimantan",
    jadwal: "2024-03-12",
    lokasi: "Desa Pampang, Samarinda, Kalimantan Timur",
    deskripsi: "Program pilot SJN pertama kali diuji coba di Desa Pampang, komunitas Dayak Kenyah di Samarinda. Program ini menjadi cikal bakal lahirnya program Semesta Jelajah Nusantara.",
    detailFields: [],
    pekerjaanFields: [],
    fullyFunded: {
      batasRegistrasi: "2024-02-28",
      status: "Aktif",
    },
    selfFunded: {
      batasRegistrasi: "2024-03-01",
      status: "Non-aktif",
    },
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

export default function EditSJNProgramPage({ params }) {
  const resolvedParams = use(params);
  const programId = resolvedParams.id;
  const router = useRouter();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const fileInputRef = useRef(null);

  // Form state
  const [nama, setNama] = useState("");
  const [jadwal, setJadwal] = useState("");
  const [lokasi, setLokasi] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [posterPreview, setPosterPreview] = useState(null);
  const [posterFile, setPosterFile] = useState(null);

  // Fully Funded & Self Funded state (SJN-specific)
  const [fullyFundedBatasReg, setFullyFundedBatasReg] = useState("");
  const [fullyFundedStatus, setFullyFundedStatus] = useState("Aktif");
  const [selfFundedBatasReg, setSelfFundedBatasReg] = useState("");
  const [selfFundedStatus, setSelfFundedStatus] = useState("Aktif");

  // Dynamic fields
  const [detailFields, setDetailFields] = useState([]);
  const [pekerjaanFields, setPekerjaanFields] = useState([]);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [targetSection, setTargetSection] = useState(null);
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
      setDeskripsi(data.deskripsi);
      setDetailFields(data.detailFields);
      setPekerjaanFields(data.pekerjaanFields);
      if (data.fullyFunded) {
        setFullyFundedBatasReg(data.fullyFunded.batasRegistrasi);
        setFullyFundedStatus(data.fullyFunded.status);
      }
      if (data.selfFunded) {
        setSelfFundedBatasReg(data.selfFunded.batasRegistrasi);
        setSelfFundedStatus(data.selfFunded.status);
      }
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
    if (!fullyFundedBatasReg) return showToast("Batas Registrasi Fully Funded harus diisi!");
    if (!selfFundedBatasReg) return showToast("Batas Registrasi Self Funded harus diisi!");
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
        {/* Toast */}
        <Toast message={toastMessage} show={toastShow} />

        {/* Header */}
        <div className={styles.contentHeader}>
          <div className={styles.headerTop}>
            <Link href="/admin/sjn" className={styles.backButton}>
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

              {/* Fully Funded Sub-section */}
              <div className={styles.tipeSubSection}>
                <h3 className={styles.tipeSubTitle}>Fully Funded</h3>
                <div className={styles.fieldRow}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Batas Registrasi <span className={styles.required}>*</span></label>
                    <div className={styles.inputWrapper}>
                      <input
                        type="date"
                        className={styles.input}
                        value={fullyFundedBatasReg}
                        onChange={(e) => setFullyFundedBatasReg(e.target.value)}
                      />
                      <svg className={styles.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    </div>
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Status <span className={styles.required}>*</span></label>
                    <div className={styles.selectWrapper}>
                      <select
                        className={styles.input}
                        value={fullyFundedStatus}
                        onChange={(e) => setFullyFundedStatus(e.target.value)}
                      >
                        <option value="Aktif">Aktif</option>
                        <option value="Non-aktif">Non-aktif</option>
                      </select>
                      <ChevronIcon />
                    </div>
                  </div>
                  <Link href={`/admin/sjn/${programId}/formulir?tipe=fully-funded`} className={styles.viewFormBtn}>
                    Lihat Formulir
                  </Link>
                </div>
              </div>

              {/* Self Funded Sub-section */}
              <div className={styles.tipeSubSection}>
                <h3 className={styles.tipeSubTitle}>Self Funded</h3>
                <div className={styles.fieldRow}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Batas Registrasi <span className={styles.required}>*</span></label>
                    <div className={styles.inputWrapper}>
                      <input
                        type="date"
                        className={styles.input}
                        value={selfFundedBatasReg}
                        onChange={(e) => setSelfFundedBatasReg(e.target.value)}
                      />
                      <svg className={styles.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    </div>
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Status <span className={styles.required}>*</span></label>
                    <div className={styles.selectWrapper}>
                      <select
                        className={styles.input}
                        value={selfFundedStatus}
                        onChange={(e) => setSelfFundedStatus(e.target.value)}
                      >
                        <option value="Aktif">Aktif</option>
                        <option value="Non-aktif">Non-aktif</option>
                      </select>
                      <ChevronIcon />
                    </div>
                  </div>
                  <Link href={`/admin/sjn/${programId}/formulir?tipe=self-funded`} className={styles.viewFormBtn}>
                    Lihat Formulir
                  </Link>
                </div>
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