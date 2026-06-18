"use client";

import { useState, useRef, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminSidebar from "../../../components/AdminSidebar";
import { useSidebar } from "../../../components/SidebarContext";
import styles from "./page.module.css";
import { DEFAULT_FORM_TEMPLATE } from "@/lib/form-template";
import { createSupabaseClient } from "@/lib/supabaseClient";

// Inisialisasi Supabase untuk Upload Gambar Baru
const supabase = createSupabaseClient();

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

export default function EditProgramPage({ params }) {
  const resolvedParams = use(params);
  const programId = resolvedParams.id;
  const router = useRouter();
  const { isCollapsed, toggle: onToggleSidebar } = useSidebar();
  const fileInputRef = useRef(null);

  // Form state utama
  const [nama, setNama] = useState("");
  const [jadwalMulai, setJadwalMulai] = useState("");     // RANGE START
  const [jadwalSelesai, setJadwalSelesai] = useState(""); // RANGE END
  const [lokasi, setLokasi] = useState("");
  const [batasRegistrasi, setBatasRegistrasi] = useState(""); // Beda kolom
  const [deskripsi, setDeskripsi] = useState("");
  const [posterPreview, setPosterPreview] = useState(null);
  const [posterFile, setPosterFile] = useState(null);

  // Dynamic fields state (UI Only)
  const [detailFields, setDetailFields] = useState([]);
  const [pekerjaanFields, setPekerjaanFields] = useState([]);

  // File objects staged for upload (key: `${section}-${fieldId}`)
  const [uploadFiles, setUploadFiles] = useState({});

  // Custom registration form state
  const [customRegistrationForm, setCustomRegistrationForm] = useState(DEFAULT_FORM_TEMPLATE);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [targetSection, setTargetSection] = useState(null);
  const [modalFieldType, setModalFieldType] = useState("Teks");
  const [modalLabel, setModalLabel] = useState("");
  const [modalOptions, setModalOptions] = useState([""]);

  // Status & Toast
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toastShow, setToastShow] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastIsError, setToastIsError] = useState(false);

  // 1. Load draft from sessionStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const draftKey = `sc_edit_draft_${programId}`;
    const draft = sessionStorage.getItem(draftKey);
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        if (parsed.nama) setNama(parsed.nama);
        if (parsed.jadwalMulai) setJadwalMulai(parsed.jadwalMulai);
        if (parsed.jadwalSelesai) setJadwalSelesai(parsed.jadwalSelesai);
        if (parsed.lokasi) setLokasi(parsed.lokasi);
        if (parsed.deskripsi) setDeskripsi(parsed.deskripsi);
        if (parsed.batasRegistrasi) setBatasRegistrasi(parsed.batasRegistrasi);
        if (parsed.detailFields) setDetailFields(parsed.detailFields);
        if (parsed.pekerjaanFields) setPekerjaanFields(parsed.pekerjaanFields);
      } catch (e) {
        console.error("Failed to parse edit draft:", e);
      }
    }
  }, [programId]);

  // 2. Auto-save form state to sessionStorage on every change
  useEffect(() => {
    if (typeof window === "undefined" || !programId) return;
    const draftKey = `sc_edit_draft_${programId}`;
    sessionStorage.setItem(draftKey, JSON.stringify({
      nama, jadwalMulai, jadwalSelesai, lokasi, deskripsi, batasRegistrasi, detailFields, pekerjaanFields
    }));
  }, [programId, nama, jadwalMulai, jadwalSelesai, lokasi, deskripsi, batasRegistrasi, detailFields, pekerjaanFields]);

  // 3. Fetch Data Lama dari Database (only fills fields not yet in sessionStorage draft)
  useEffect(() => {
    if (!programId) return;

    const fetchProgram = async () => {
      try {
        const response = await fetch(`/api/programs/${programId}`, { cache: 'no-store' });
        if (!response.ok) throw new Error("Gagal mengambil data program");

        const data = await response.json();

        // Hanya set dari DB jika sessionStorage draft belum mengisinya.
        // Logic sama dengan tambah — supaya Jadwal Pelaksanaan dll.
        // tidak ter-reset saat admin bolak-balik ke halaman Formulir.
        setNama((prev) => prev || data.title || "");
        setJadwalMulai((prev) => prev || (data.event_start_date ? data.event_start_date.split('T')[0] : ""));
        setJadwalSelesai((prev) => prev || (data.event_end_date ? data.event_end_date.split('T')[0] : ""));
        setLokasi((prev) => prev || data.location || "");
        setDeskripsi((prev) => prev || data.description || "");

        if (data.program_funding_types && data.program_funding_types.length > 0) {
          const deadline = data.program_funding_types[0].deadline;
          setBatasRegistrasi((prev) => prev || (deadline ? deadline.split('T')[0] : ""));
        }

        // Dynamic fields — hanya replace jika state masih kosong
        if (data.detail_program && data.detail_program.length > 0) {
          setDetailFields((prev) => (prev && prev.length > 0) ? prev : data.detail_program);
        }
        if (data.pekerjaan && data.pekerjaan.length > 0) {
          setPekerjaanFields((prev) => (prev && prev.length > 0) ? prev : data.pekerjaan);
        }

        // Custom registration form (use saved form or fallback to default template)
        if (data.custom_registration_form && data.custom_registration_form.length > 0) {
          setCustomRegistrationForm((prev) =>
            prev && prev.length > 0 && JSON.stringify(prev) !== JSON.stringify(DEFAULT_FORM_TEMPLATE)
              ? prev
              : data.custom_registration_form
          );
        }

        if (data.image_url) {
          setPosterPreview((prev) => prev || data.image_url);
        }
      } catch (err) {
        showToast(err.message, true);
      } finally {
        setLoading(false);
      }
    };

    fetchProgram();
  }, [programId]);

  const showToast = (msg, isErr = false) => {
    setToastMessage(msg);
    setToastIsError(isErr);
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
    setModalOptions([""]);
    setModalOpen(true);
  };

  const handleAddOption = () => setModalOptions((prev) => [...prev, ""]);
  
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
    setUploadFiles((prev) => {
      const next = { ...prev };
      delete next[`${section}-${fieldId}`];
      return next;
    });
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

  // 2. Simpan Perubahan ke Database
  const handleSave = async () => {
    if (!nama.trim()) return showToast("Nama Program harus diisi!", true);
    if (!jadwalMulai || !jadwalSelesai) return showToast("Jadwal Pelaksanaan (Mulai & Selesai) harus diisi!", true);
    if (!lokasi.trim()) return showToast("Lokasi harus diisi!", true);
    if (batasRegistrasi && jadwalMulai && new Date(batasRegistrasi) > new Date(jadwalMulai)) {
      return showToast("Batas Registrasi tidak boleh setelah jadwal mulai!", true);
    }

    setIsSaving(true);
    try {
      let imageUrl = posterPreview;

      if (posterFile) {
        const fileExt = posterFile.name.split('.').pop();
        const fileName = `poster-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('program-images')
          .upload(fileName, posterFile);

        if (uploadError) throw new Error(`Gagal upload poster: ${uploadError.message}`);

        const { data: publicUrlData } = supabase.storage
          .from('program-images')
          .getPublicUrl(fileName);

        imageUrl = publicUrlData.publicUrl;
      }

      // Upload pending files before saving
      const processUploads = async (fields, section) => {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        const newFields = [...fields];
        for (let i = 0; i < newFields.length; i++) {
          const field = newFields[i];
          if (field.type === "upload-file") {
            const fileObj = uploadFiles[`${section}-${field.id}`];
            if (fileObj && typeof fileObj === "object" && !(fileObj instanceof URL || typeof fileObj === "string")) {
              const formData = new FormData();
              formData.append("file", fileObj);
              formData.append("bucket", "program-files");
              const res = await fetch("/api/upload-file", {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` },
                body: formData,
              });
              if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(`Gagal upload "${field.label}": ${errData.error || res.statusText}`);
              }
              const data = await res.json();
              newFields[i] = { ...field, value: data.url };
            } else if (typeof field.value === 'string' && field.value && !field.value.startsWith('http')) {
              // Was just a filename string — discard as invalid
              newFields[i] = { ...field, value: "" };
            }
          }
        }
        return newFields;
      };

      const processedDetail = await processUploads(detailFields, "detail");
      const processedPekerjaan = await processUploads(pekerjaanFields, "pekerjaan");
      setDetailFields(processedDetail);
      setPekerjaanFields(processedPekerjaan);

      // Payload untuk update tabel 'programs' dan 'program_funding_types'
      const payload = {
        title: nama,
        event_start_date: jadwalMulai,
        event_end_date: jadwalSelesai,
        location: lokasi,
        description: deskripsi,
        image_url: imageUrl,
        funding_deadline: batasRegistrasi,
        // --- TAMBAHAN BARU ---
        detail_program: processedDetail,
        pekerjaan: processedPekerjaan,
        custom_registration_form: customRegistrationForm,
        // ---------------------
      };

      const response = await fetch(`/api/programs/${programId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal menyimpan perubahan');
      }

      // NOTE: Update batasRegistrasi ke program_funding_types harusnya ada API terpisah 
      // atau logika tambahan di route PUT /api/programs.

      showToast("Perubahan berhasil disimpan!", false);

      // Clean up draft sessionStorage on successful save
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(`sc_edit_draft_${programId}`);
      }

      setTimeout(() => {
        router.push("/admin/semesta-camp");
      }, 1500);

    } catch (error) {
      showToast(error.message, true);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.pageLayout}>
        <AdminSidebar isCollapsed={isCollapsed} onToggle={onToggleSidebar} />
        <main className={`${styles.mainContent} ${isCollapsed ? styles.expanded : ""}`}>
          <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>Memuat data program...</div>
        </main>
      </div>
    );
  }

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
          <div className={styles.headerTop}>
            <Link href="/admin/semesta-camp" className={styles.backButton}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className={styles.headerTitle}>Detail Program</h1>
            <button className={styles.saveButtonTop} onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Menyimpan..." : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
                  </svg>
                  Simpan Perubahan
                </>
              )}
            </button>
          </div>
          <p className={styles.headerSubtitle}>Edit detail program anda</p>
        </div>

        {/* SECTION 1: Informasi */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Informasi</h2>
          <div className={styles.infoGrid}>
            
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

              <div className={styles.fieldRow}>
                {/* BATAS REGISTRASI - TERPISAH */}
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Batas Registrasi</label>
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
                          <span className={styles.fileNameText} title={decodeURIComponent(field.value.split('/').pop().split('?')[0])}>{decodeURIComponent(field.value.split('/').pop().split('?')[0])}</span>
                          <button
                            className={styles.clearUploadBtn}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFieldChange("detail", field.id, "");
                              setUploadFiles(prev => { const n = { ...prev }; delete n[`detail-${field.id}`]; return n; });
                            }}
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        </span>
                      ) : (
                        <div className={styles.uploadPlaceholderBox}>
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
                        if (file) {
                          setUploadFiles(prev => ({ ...prev, [`detail-${field.id}`]: file }));
                          handleFieldChange("detail", field.id, file.name);
                        }
                      }}
                    />
                  </div>
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
                          <span className={styles.fileNameText} title={decodeURIComponent(field.value.split('/').pop().split('?')[0])}>{decodeURIComponent(field.value.split('/').pop().split('?')[0])}</span>
                          <button
                            className={styles.clearUploadBtn}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFieldChange("pekerjaan", field.id, "");
                              setUploadFiles(prev => { const n = { ...prev }; delete n[`pekerjaan-${field.id}`]; return n; });
                            }}
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        </span>
                      ) : (
                        <div className={styles.uploadPlaceholderBox}>
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
                        if (file) {
                          setUploadFiles(prev => ({ ...prev, [`pekerjaan-${field.id}`]: file }));
                          handleFieldChange("pekerjaan", field.id, file.name);
                        }
                      }}
                    />
                  </div>
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
          <button className={styles.saveButtonBottom} onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Menyimpan..." : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                Simpan Perubahan
              </>
            )}
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

                {/* Dropdown Options */}
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