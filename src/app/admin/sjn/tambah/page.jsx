"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AdminSidebar from "../../components/AdminSidebar.jsx";
import { useSidebar } from "../../components/SidebarContext";
import styles from "./page.module.css";
import { createSupabaseClient } from "@/lib/supabaseClient";

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

export default function TambahSJNProgramPage() {
  return (
    <Suspense fallback={<div style={{ padding: "2rem" }}>Memuat...</div>}>
      <TambahSJNProgramPageInner />
    </Suspense>
  );
}

function TambahSJNProgramPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isCollapsed, toggle: onToggleSidebar } = useSidebar();
  const fileInputRef = useRef(null);

  // Form state
  const [nama, setNama] = useState("");
  const [jadwalMulai, setJadwalMulai] = useState("");
  const [jadwalSelesai, setJadwalSelesai] = useState("");
  const [lokasi, setLokasi] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [posterPreview, setPosterPreview] = useState(null);
  const [posterFile, setPosterFile] = useState(null);

  const [fullyFundedBatasReg, setFullyFundedBatasReg] = useState("");
  const [fullyFundedStatus, setFullyFundedStatus] = useState("Aktif");
  const [selfFundedBatasReg, setSelfFundedBatasReg] = useState("");
  const [selfFundedStatus, setSelfFundedStatus] = useState("Non-aktif");

  // Formulir lock/unlock state — pisah per tipe (fully-funded & self-funded)
  const [fullyFormulirCreated, setFullyFormulirCreated] = useState(false);
  const [selfFormulirCreated, setSelfFormulirCreated] = useState(false);
  const [tooltipShow, setTooltipShow] = useState(null); // null | "fully" | "self"

  // Dynamic fields
  const [detailFields, setDetailFields] = useState([]);
  const [pekerjaanFields, setPekerjaanFields] = useState([]);

  // File objects staged for upload (key: `${section}-${fieldId}`)
  const [uploadFiles, setUploadFiles] = useState({});

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [targetSection, setTargetSection] = useState(null);
  const [modalFieldType, setModalFieldType] = useState("Teks");
  const [modalLabel, setModalLabel] = useState("");
  const [modalOptions, setModalOptions] = useState([""]);

  const [toastShow, setToastShow] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastIsError, setToastIsError] = useState(false);

  // 1. Load draft & created-flag dari sessionStorage saat mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const fullyCreated = sessionStorage.getItem("sjn_formulir_created_fully");
      if (fullyCreated === "true") setFullyFormulirCreated(true);

      const selfCreated = sessionStorage.getItem("sjn_formulir_created_self");
      if (selfCreated === "true") setSelfFormulirCreated(true);

      const draft = sessionStorage.getItem("sjn_draft");
      if (draft) {
        const parsed = JSON.parse(draft);
        if (parsed.nama) setNama(parsed.nama);
        if (parsed.jadwalMulai) setJadwalMulai(parsed.jadwalMulai);
        if (parsed.jadwalSelesai) setJadwalSelesai(parsed.jadwalSelesai);
        if (parsed.lokasi) setLokasi(parsed.lokasi);
        if (parsed.deskripsi) setDeskripsi(parsed.deskripsi);
        if (parsed.fullyFundedBatasReg) setFullyFundedBatasReg(parsed.fullyFundedBatasReg);
        if (parsed.selfFundedBatasReg) setSelfFundedBatasReg(parsed.selfFundedBatasReg);
        if (parsed.detailFields) setDetailFields(parsed.detailFields);
        if (parsed.pekerjaanFields) setPekerjaanFields(parsed.pekerjaanFields);
      }

      // Reconstruct Poster File from Base64
      const posterDraft = sessionStorage.getItem("sjn_poster_draft");
      const posterName = sessionStorage.getItem("sjn_poster_name");
      const posterType = sessionStorage.getItem("sjn_poster_type");
      if (posterDraft && posterName && posterType) {
        setPosterPreview(posterDraft);
        try {
          const arr = posterDraft.split(",");
          const bstr = atob(arr[1]);
          const n = bstr.length;
          const u8arr = new Uint8Array(n);
          let i = n;
          while (i--) u8arr[i] = bstr.charCodeAt(i);
          setPosterFile(new File([u8arr], posterName, { type: posterType }));
        } catch (e) {
          console.error("Failed to restore poster from storage:", e);
        }
      }
    }
  }, []);

  // 2. Auto-save draft on every relevant change
  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("sjn_draft", JSON.stringify({
        nama, jadwalMulai, jadwalSelesai, lokasi, deskripsi,
        fullyFundedBatasReg, selfFundedBatasReg, detailFields, pekerjaanFields
      }));
    }
  }, [nama, jadwalMulai, jadwalSelesai, lokasi, deskripsi, fullyFundedBatasReg, selfFundedBatasReg, detailFields, pekerjaanFields]);

  // 3. Detect redirect back from formulir page with created=true
  useEffect(() => {
    const created = searchParams.get("created");
    const createdTipe = searchParams.get("tipe");
    if (created === "true") {
      if (createdTipe === "self-funded") {
        setSelfFormulirCreated(true);
        if (typeof window !== "undefined") {
          sessionStorage.setItem("sjn_formulir_created_self", "true");
        }
      } else {
        setFullyFormulirCreated(true);
        if (typeof window !== "undefined") {
          sessionStorage.setItem("sjn_formulir_created_fully", "true");
        }
      }
      const url = new URL(window.location.href);
      url.searchParams.delete("created");
      url.searchParams.delete("tipe");
      window.history.replaceState({}, "", url.pathname);
    }
  }, [searchParams]);

  const showToast = (msg, isErr = false) => {
    setToastIsError(isErr);
    setToastMessage(msg);
    setToastShow(true);
    setTimeout(() => setToastShow(false), 3500);
  };

  const handlePosterChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPosterFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPosterPreview(reader.result);
        try {
          sessionStorage.setItem("sjn_poster_draft", reader.result);
          sessionStorage.setItem("sjn_poster_name", file.name);
          sessionStorage.setItem("sjn_poster_type", file.type);
        } catch (err) {
          console.warn("File too large for auto-save.");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePoster = () => {
    setPosterPreview(null);
    setPosterFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    sessionStorage.removeItem("sjn_poster_draft");
    sessionStorage.removeItem("sjn_poster_name");
    sessionStorage.removeItem("sjn_poster_type");
  };

  const handleBuatFormulir = (tipe) => {
    if (!nama.trim()) {
      setTooltipShow(tipe);
      setTimeout(() => setTooltipShow(null), 3000);
      return;
    }
    router.push(`/admin/sjn/tambah/formulir?nama=${encodeURIComponent(nama)}&tipe=${tipe}`);
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

  const clearUploadFile = (section, fieldId) => {
    handleFieldChange(section, fieldId, "");
    setUploadFiles((prev) => {
      const next = { ...prev };
      delete next[`${section}-${fieldId}`];
      return next;
    });
  };

  const processUploadFiles = async (fields, section) => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    const updated = [...fields];
    for (let i = 0; i < updated.length; i++) {
      const field = updated[i];
      if (field.type !== "upload-file") continue;
      const key = `${section}-${field.id}`;
      const file = uploadFiles[key];
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('bucket', 'program-files');
        const res = await fetch('/api/upload-file', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData,
        });
        if (res.ok) {
          const result = await res.json();
          updated[i] = { ...field, value: result.url };
        } else {
          const err = await res.json().catch(() => ({ error: 'Unknown' }));
          throw new Error(`Gagal upload file "${field.label}": ${err.error}`);
        }
      }
    }
    return updated;
  };

  const handleSave = async () => {
    if (!nama.trim()) return showToast("Nama Program harus diisi!", true);
    if (!jadwalMulai || !jadwalSelesai) return showToast("Jadwal Pelaksanaan (Mulai & Selesai) harus diisi!", true);
    if (!lokasi.trim()) return showToast("Lokasi harus diisi!", true);
    if (fullyFormulirCreated && !fullyFundedBatasReg) return showToast("Batas Registrasi Fully Funded harus diisi!", true);
    if (selfFormulirCreated && !selfFundedBatasReg) return showToast("Batas Registrasi Self Funded harus diisi!", true);
    if (fullyFormulirCreated && fullyFundedBatasReg && jadwalMulai && new Date(fullyFundedBatasReg) > new Date(jadwalMulai)) {
      return showToast("Batas Registrasi Fully Funded tidak boleh setelah jadwal mulai!", true);
    }
    if (selfFormulirCreated && selfFundedBatasReg && jadwalMulai && new Date(selfFundedBatasReg) > new Date(jadwalMulai)) {
      return showToast("Batas Registrasi Self Funded tidak boleh setelah jadwal mulai!", true);
    }

    try {
      let customFormFully = [];
      let customFormSelf = [];
      if (typeof window !== "undefined") {
        const savedFully = sessionStorage.getItem("sjn_custom_registration_form_fully");
        const savedSelf = sessionStorage.getItem("sjn_custom_registration_form_self");
        if (savedFully) {
          try { customFormFully = JSON.parse(savedFully); } catch (e) { console.error(e); }
        }
        if (savedSelf) {
          try { customFormSelf = JSON.parse(savedSelf); } catch (e) { console.error(e); }
        }
      }

      let imageUrl = "";

      // Upload poster ke Supabase Storage jika ada file
      if (posterFile) {
        const fileName = `program-new-${Date.now()}-${posterFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from('program-images')
          .upload(fileName, posterFile);

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from('program-images')
            .getPublicUrl(fileName);
          if (urlData?.publicUrl) imageUrl = urlData.publicUrl;
        }
      }

      // Upload file Upload File dari detail/pekerjaan ke Supabase Storage
      const processedDetail = await processUploadFiles(detailFields, "detail");
      const processedPekerjaan = await processUploadFiles(pekerjaanFields, "pekerjaan");

      const payload = {
        title: nama,
        description: deskripsi,
        category: "SJN",
        event_start_date: jadwalMulai,
        event_end_date: jadwalSelesai,
        location: lokasi,
        detail_program: processedDetail,
        pekerjaan: processedPekerjaan,
        custom_registration_form_fully: customFormFully,
        custom_registration_form_self: customFormSelf,
        image_url: imageUrl || null,
        program_funding_types: [
          { code: 'fully', label: 'Fully Funded', deadline: fullyFundedBatasReg, is_active: fullyFundedStatus === 'Aktif' },
          { code: 'self', label: 'Self Funded', deadline: selfFundedBatasReg, is_active: selfFundedStatus === 'Aktif' }
        ]
      };

      const response = await fetch('/api/programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        showToast("Program berhasil dibuat!");
        sessionStorage.removeItem("sjn_draft");
        sessionStorage.removeItem("sjn_formulir_created_fully");
        sessionStorage.removeItem("sjn_formulir_created_self");
        sessionStorage.removeItem("sjn_custom_registration_form_fully");
        sessionStorage.removeItem("sjn_custom_registration_form_self");
        sessionStorage.removeItem("sjn_poster_draft");
        sessionStorage.removeItem("sjn_poster_name");
        sessionStorage.removeItem("sjn_poster_type");
        setTimeout(() => router.push("/admin/sjn"), 1500);
      } else {
        const data = await response.json().catch(() => null);
        showToast(data?.error || "Terjadi kesalahan. Cek kembali data Anda.", true);
      }
    } catch (err) {
      console.error(err);
      showToast("Gagal menyimpan program.", true);
    }
  };

  return (
    <div className={styles.pageLayout}>
      <AdminSidebar
        isCollapsed={isCollapsed}
        onToggle={onToggleSidebar}
      />

      <main className={`${styles.mainContent} ${isCollapsed ? styles.expanded : ""}`}>
        <Toast message={toastMessage} show={toastShow} isError={toastIsError} />

        <div className={styles.contentHeader}>
          <div className={styles.headerTop}>
            <Link href="/admin/sjn" className={styles.backButton}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className={styles.headerTitle}>Tambah Program SJN</h1>
            <button className={styles.saveButtonTop} onClick={handleSave}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              Simpan Program
            </button>
          </div>
          <p className={styles.headerSubtitle}>Buat program Semesta Jelajah Nusantara baru</p>
        </div>

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
                    <input type="text" className={styles.input} value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Masukkan Nama Program" />
                  </div>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Jadwal Pelaksanaan <span className={styles.required}>*</span></label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div className={styles.inputWrapper} style={{ flex: 1 }}>
                      <input type="date" className={styles.input} value={jadwalMulai} onChange={(e) => setJadwalMulai(e.target.value)} />
                    </div>
                    <span style={{ color: '#6b7280', fontWeight: 500 }}>-</span>
                    <div className={styles.inputWrapper} style={{ flex: 1 }}>
                      <input type="date" className={styles.input} value={jadwalSelesai} onChange={(e) => setJadwalSelesai(e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Lokasi <span className={styles.required}>*</span></label>
                <div className={styles.inputWrapper}>
                  <input type="text" className={styles.input} value={lokasi} onChange={(e) => setLokasi(e.target.value)} placeholder="Lokasi Program" />
                </div>
              </div>

              <div className={styles.tipeSubSection}>
                <h3 className={styles.tipeSubTitle}>Fully Funded</h3>
                <div className={styles.fieldRow}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Batas Registrasi <span className={styles.required}>*</span></label>
                    <div className={styles.inputWrapper}>
                      <input
                        type="date"
                        className={`${styles.input} ${!fullyFormulirCreated ? styles.inputLocked : ""}`}
                        value={fullyFundedBatasReg}
                        onChange={(e) => setFullyFundedBatasReg(e.target.value)}
                        disabled={!fullyFormulirCreated}
                      />
                      <svg className={`${styles.inputIcon} ${!fullyFormulirCreated ? styles.lockIcon : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                  <div className={styles.tipeBtnWrapper}>
                    <button
                      className={`${styles.viewFormBtn} ${fullyFormulirCreated ? styles.viewFormBtnCreated : ""}`}
                      onClick={() => handleBuatFormulir("fully-funded")}
                      onMouseEnter={() => !nama.trim() && setTooltipShow("fully")}
                      onMouseLeave={() => setTooltipShow(null)}
                    >
                      {fullyFormulirCreated ? (
                        <>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                          Lihat Formulir
                        </>
                      ) : (
                        <>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="12" y1="18" x2="12" y2="12" />
                            <line x1="9" y1="15" x2="15" y2="15" />
                          </svg>
                          Buat Formulir
                        </>
                      )}
                    </button>
                    <div className={styles.tooltipWrapper}>
                      {tooltipShow === "fully" && (
                        <div className={styles.tooltip}>Isi Nama Program terlebih dahulu</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.tipeSubSection}>
                <h3 className={styles.tipeSubTitle}>Self Funded</h3>
                <div className={styles.fieldRow}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Batas Registrasi <span className={styles.required}>*</span></label>
                    <div className={styles.inputWrapper}>
                      <input
                        type="date"
                        className={`${styles.input} ${!selfFormulirCreated ? styles.inputLocked : ""}`}
                        value={selfFundedBatasReg}
                        onChange={(e) => setSelfFundedBatasReg(e.target.value)}
                        disabled={!selfFormulirCreated}
                      />
                      <svg className={`${styles.inputIcon} ${!selfFormulirCreated ? styles.lockIcon : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                  <div className={styles.tipeBtnWrapper}>
                    <button
                      className={`${styles.viewFormBtn} ${selfFormulirCreated ? styles.viewFormBtnCreated : ""}`}
                      onClick={() => handleBuatFormulir("self-funded")}
                      onMouseEnter={() => !nama.trim() && setTooltipShow("self")}
                      onMouseLeave={() => setTooltipShow(null)}
                    >
                      {selfFormulirCreated ? (
                        <>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                          Lihat Formulir
                        </>
                      ) : (
                        <>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="12" y1="18" x2="12" y2="12" />
                            <line x1="9" y1="15" x2="15" y2="15" />
                          </svg>
                          Buat Formulir
                        </>
                      )}
                    </button>
                    <div className={styles.tooltipWrapper}>
                      {tooltipShow === "self" && (
                        <div className={styles.tooltip}>Isi Nama Program terlebih dahulu</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Deskripsi</h2>
          <div className={styles.sectionCard}>
            <label className={styles.fieldLabel}>Deskripsi</label>
            <textarea className={styles.textarea} value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} placeholder="Tuliskan deskripsi..." rows={5} />
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
                          <span className={styles.fileNameText} title={field.value}>{field.value}</span>
                          <button
                            className={styles.clearUploadBtn}
                            onClick={(e) => { e.stopPropagation(); clearUploadFile("detail", field.id); }}
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
                          handleFieldChange("detail", field.id, file.name);
                          setUploadFiles((prev) => ({ ...prev, [`detail-${field.id}`]: file }));
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
                          <span className={styles.fileNameText} title={field.value}>{field.value}</span>
                          <button
                            className={styles.clearUploadBtn}
                            onClick={(e) => { e.stopPropagation(); clearUploadFile("pekerjaan", field.id); }}
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
                          handleFieldChange("pekerjaan", field.id, file.name);
                          setUploadFiles((prev) => ({ ...prev, [`pekerjaan-${field.id}`]: file }));
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

        <div className={styles.saveSection}>
          <button className={styles.saveButtonBottom} onClick={handleSave}>
            Simpan Program
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
