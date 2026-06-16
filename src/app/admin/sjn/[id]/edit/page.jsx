"use client";

import { useState, useRef, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from '@supabase/supabase-js';
import AdminSidebar from "../../../components/AdminSidebar.jsx";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
import styles from "./page.module.css";

const ChevronIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.chevronIcon}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const fieldTypes = ["Teks", "Textarea", "Angka", "Tanggal", "Dropdown", "Upload File"];

const Toast = ({ message, show, isError }) => (
  <div className={`${styles.toast} ${show ? styles.toastShow : ""} ${isError ? styles.toastError : ""}`}>
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

export default function EditSJNProgramPage({ params }) {
  const resolvedParams = use(params);
  const programId = resolvedParams.id;
  const router = useRouter();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const fileInputRef = useRef(null);

  // Loading State
  const [loading, setLoading] = useState(true);

  // Form state
  const [nama, setNama] = useState("");
  const [jadwalMulai, setJadwalMulai] = useState("");     // RANGE START
  const [jadwalSelesai, setJadwalSelesai] = useState(""); // RANGE END
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
  const [modalOptions, setModalOptions] = useState([""]);

  // Toast
  const [toastShow, setToastShow] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastIsError, setToastIsError] = useState(false);

  // Fetch Data dari API
  useEffect(() => {
    const fetchProgram = async () => {
      try {
        const res = await fetch(`/api/programs/${programId}`);
        if (res.ok) {
          const data = await res.json();
          setNama(data.title || "");
          setJadwalMulai(data.event_start_date ? data.event_start_date.split('T')[0] : "");
          setJadwalSelesai(data.event_end_date ? data.event_end_date.split('T')[0] : "");
          setLokasi(data.location || "");
          setDeskripsi(data.description || "");
          setPosterPreview(data.image_url || null);

          // Dynamic fields parsing
          setDetailFields(data.detail_program || []);
          setPekerjaanFields(data.pekerjaan || []);

          // Program Funding Types
          const fully = data.program_funding_types?.find(f => f.code === 'fully');
          const self = data.program_funding_types?.find(f => f.code === 'self');

          if (fully) {
            setFullyFundedBatasReg(fully.deadline ? fully.deadline.split('T')[0] : "");
            setFullyFundedStatus(fully.is_active !== false ? 'Aktif' : 'Non-aktif');
          }
          if (self) {
            setSelfFundedBatasReg(self.deadline ? self.deadline.split('T')[0] : "");
            setSelfFundedStatus(self.is_active !== false ? 'Aktif' : 'Non-aktif');
          }
        }
      } catch (err) {
        console.error("Gagal mengambil program detail:", err);
      } finally {
        setLoading(false);
      }
    };
    if (programId) fetchProgram();
  }, [programId]);

  const showToast = (msg, isErr = false) => {
    setToastIsError(isErr);
    setToastMessage(msg);
    setToastShow(true);
    setTimeout(() => setToastShow(false), 3000);
  };

  const handlePosterChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPosterFile(file);
      setPosterPreview(URL.createObjectURL(file));
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
    setModalOptions([""]);
    setModalOpen(true);
  };

  const handleAddOption = () => {
    setModalOptions((prev) => [...prev, ""]);
  };

  const handleOptionChange = (index, value) => {
    setModalOptions((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const handleRemoveOption = (index) => {
    setModalOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddField = () => {
    if (!modalLabel.trim()) return;

    const validOptions = modalOptions.filter((o) => o.trim() !== "");

    const newField = {
      id: `${targetSection === "detail" ? "df" : "pf"}-${Date.now()}`,
      label: modalLabel,
      type: modalFieldType.toLowerCase().replace(/\s+/g, "-"),
      value: "",
      ...(modalFieldType === "Dropdown" ? { options: validOptions } : {}),
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

  const handleSave = async () => {
    if (!nama.trim()) return showToast("Nama Program harus diisi!", true);
    if (!jadwalMulai || !jadwalSelesai) return showToast("Jadwal Pelaksanaan (Mulai & Selesai) harus diisi!", true);
    if (!lokasi.trim()) return showToast("Lokasi harus diisi!", true);
    if (!fullyFundedBatasReg) return showToast("Batas Registrasi Fully Funded harus diisi!", true);
    if (!selfFundedBatasReg) return showToast("Batas Registrasi Self Funded harus diisi!", true);
    if (new Date(fullyFundedBatasReg) > new Date(jadwalMulai)) {
      return showToast("Batas Registrasi Fully Funded tidak boleh setelah jadwal mulai!", true);
    }
    if (new Date(selfFundedBatasReg) > new Date(jadwalMulai)) {
      return showToast("Batas Registrasi Self Funded tidak boleh setelah jadwal mulai!", true);
    }
    
    try {
      let finalImageUrl = posterPreview || "";

      // Upload poster ke Supabase Storage jika ada file baru
      if (posterFile) {
        const fileName = `program-${programId}-${Date.now()}-${posterFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from('program-images')
          .upload(fileName, posterFile, { upsert: true });

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from('program-images')
            .getPublicUrl(fileName);
          if (urlData?.publicUrl) finalImageUrl = urlData.publicUrl;
        }
      }
      // Jika tidak ada file baru, gunakan URL yang sudah ada dari preview
      else if (posterPreview && posterPreview !== 'null') {
        finalImageUrl = posterPreview;
      }

      // Siapkan payload dengan field dinamis dimasukkan ke kolom detail_program dan pekerjaan
      const payload = {
        title: nama,
        description: deskripsi,
        event_start_date: jadwalMulai,
        event_end_date: jadwalSelesai,
        location: lokasi,
        detail_program: detailFields,
        pekerjaan: pekerjaanFields,
        program_funding_types: [
          { code: 'fully', label: 'Fully Funded', deadline: fullyFundedBatasReg, is_active: fullyFundedStatus === 'Aktif' },
          { code: 'self', label: 'Self Funded', deadline: selfFundedBatasReg, is_active: selfFundedStatus === 'Aktif' }
        ],
        image_url: finalImageUrl,
      };

      const res = await fetch(`/api/programs/${programId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showToast("Perubahan berhasil disimpan!");
      } else {
        const data = await res.json();
        showToast(data.error || "Gagal menyimpan perubahan.", true);
      }
    } catch (err) {
      console.error(err);
      showToast("Terjadi kesalahan pada server.", true);
    }
  };

  if (loading) {
    return (
      <div className={styles.pageLayout}>
        <AdminSidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
        <main className={`${styles.mainContent} ${isSidebarCollapsed ? styles.expanded : ""}`}>
          <div style={{ padding: '2rem', textAlign: 'center' }}>Memuat data program...</div>
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
        <Toast message={toastMessage} show={toastShow} isError={toastIsError} />

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
                {/* JADWAL PELAKSANAAN: RANGE DATE PICKER */}
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Jadwal Pelaksanaan <span className={styles.required}>*</span></label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div className={styles.inputWrapper} style={{ flex: 1 }}>
                      <input
                        type="date"
                        className={styles.input}
                        value={jadwalMulai}
                        onChange={(e) => setJadwalMulai(e.target.value)}
                      />
                    </div>
                    <span style={{ color: '#6b7280', fontWeight: 500 }}>-</span>
                    <div className={styles.inputWrapper} style={{ flex: 1 }}>
                      <input
                        type="date"
                        className={styles.input}
                        value={jadwalSelesai}
                        onChange={(e) => setJadwalSelesai(e.target.value)}
                      />
                    </div>
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
                    rows={3}
                  />
                ) : field.type === "angka" ? (
                  <input
                    type="number"
                    className={styles.input}
                    value={field.value}
                    onChange={(e) => handleFieldChange("detail", field.id, e.target.value)}
                  />
                ) : field.type === "tanggal" ? (
                  <input
                    type="date"
                    className={styles.input}
                    value={field.value}
                    onChange={(e) => handleFieldChange("detail", field.id, e.target.value)}
                  />
                ) : field.type === "dropdown" ? (
                  <div className={styles.dropdownList}>
                    {(field.options || []).map((opt, i) => (
                      <span key={i} className={styles.dropdownOption}>
                        <span className={styles.dropdownBullet}>-</span> {opt}
                      </span>
                    ))}
                  </div>
                ) : field.type === "upload-file" ? (
                  <div className={styles.uploadFileArea}>
                    <div className={styles.uploadFileBox}>
                      {field.value ? (
                        <span className={styles.uploadFileName}>
                          {field.value}
                          <button
                            className={styles.clearUploadBtn}
                            onClick={() => handleFieldChange("detail", field.id, "")}
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        </span>
                      ) : (
                        <div className={styles.uploadPlaceholder}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                          </svg>
                          <p className={styles.uploadPlaceholderText}>
                            Pilih file untuk diupload
                          </p>
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      className={styles.fileInput}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFieldChange("detail", field.id, file.name);
                      }}
                    />
                  </div>
                ) : (
                  <input
                    type="text"
                    className={styles.input}
                    value={field.value}
                    onChange={(e) => handleFieldChange("detail", field.id, e.target.value)}
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
                    rows={3}
                  />
                ) : field.type === "angka" ? (
                  <input
                    type="number"
                    className={styles.input}
                    value={field.value}
                    onChange={(e) => handleFieldChange("pekerjaan", field.id, e.target.value)}
                  />
                ) : field.type === "tanggal" ? (
                  <input
                    type="date"
                    className={styles.input}
                    value={field.value}
                    onChange={(e) => handleFieldChange("pekerjaan", field.id, e.target.value)}
                  />
                ) : field.type === "dropdown" ? (
                  <div className={styles.dropdownList}>
                    {(field.options || []).map((opt, i) => (
                      <span key={i} className={styles.dropdownOption}>
                        <span className={styles.dropdownBullet}>-</span> {opt}
                      </span>
                    ))}
                  </div>
                ) : field.type === "upload-file" ? (
                  <div className={styles.uploadFileArea}>
                    <div className={styles.uploadFileBox}>
                      {field.value ? (
                        <span className={styles.uploadFileName}>
                          {field.value}
                          <button
                            className={styles.clearUploadBtn}
                            onClick={() => handleFieldChange("pekerjaan", field.id, "")}
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        </span>
                      ) : (
                        <div className={styles.uploadPlaceholder}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                          </svg>
                          <p className={styles.uploadPlaceholderText}>
                            Pilih file untuk diupload
                          </p>
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      className={styles.fileInput}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFieldChange("pekerjaan", field.id, file.name);
                      }}
                    />
                  </div>
                ) : (
                  <input
                    type="text"
                    className={styles.input}
                    value={field.value}
                    onChange={(e) => handleFieldChange("pekerjaan", field.id, e.target.value)}
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
                    placeholder="Contoh: Divisi"
                  />
                </div>

                {/* Dropdown Options — only show when type is Dropdown */}
                {modalFieldType === "Dropdown" && (
                  <div className={styles.modalField}>
                    <label className={styles.fieldLabel}>Opsi</label>
                    <div className={styles.optionsList}>
                      {modalOptions.map((opt, idx) => (
                        <div key={idx} className={styles.optionItem}>
                          <input
                            type="text"
                            className={styles.input}
                            value={opt}
                            onChange={(e) => handleOptionChange(idx, e.target.value)}
                            placeholder={`Opsi ${idx + 1}`}
                          />
                          {modalOptions.length > 1 && (
                            <button
                              className={styles.removeOptionBtn}
                              onClick={() => handleRemoveOption(idx)}
                              title="Hapus opsi"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button className={styles.addOptionBtn} onClick={handleAddOption}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      Tambah Opsi
                    </button>
                  </div>
                )}
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