"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AdminSidebar from "../../components/AdminSidebar.jsx";
import styles from "./page.module.css";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const ChevronIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.chevronIcon}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const fieldTypes = ["Teks", "Textarea", "Angka", "Tanggal", "Dropdown", "Upload File"];

const Toast = ({ message, show, isError }) => (
  <div className={`${styles.toast} ${show ? styles.toastShow : ""} ${isError ? styles.toastError : ""}`}>
    {isError ? (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ) : (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    )}
    {message}
  </div>
);

export default function TambahSemestaCampProgramPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const fileInputRef = useRef(null);
   const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [nama, setNama] = useState("");
  const [jadwal, setJadwal] = useState("");
  const [lokasi, setLokasi] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [posterPreview, setPosterPreview] = useState(null);
  const [posterFile, setPosterFile] = useState(null);

  // Batas Registrasi — satu field tunggal, unlock setelah formulir dibuat
  const [batasRegistrasi, setBatasRegistrasi] = useState("");
  const [formulirCreated, setFormulirCreated] = useState(false);
  const isLocked = !formulirCreated;

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
  const [toastIsError, setToastIsError] = useState(false);

  // Tooltip state for "Buat Formulir" button
  const [tooltipShow, setTooltipShow] = useState(false);

  // Read formulir creation status from sessionStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const scCreated = sessionStorage.getItem("sc_formulir_created");
      if (scCreated === "true") setFormulirCreated(true);
    }
  }, []);

  // Check if navigated back from formulir page with created=true
  useEffect(() => {
    const created = searchParams.get("created");
    if (created === "true") {
      setFormulirCreated(true);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("sc_formulir_created", "true");
      }
      // Remove query params from URL without full reload
      const url = new URL(window.location.href);
      url.searchParams.delete("created");
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

  const handleBuatFormulir = () => {
    if (!nama.trim()) {
      setTooltipShow(true);
      setTimeout(() => setTooltipShow(false), 3000);
      return;
    }
    router.push(`/admin/semesta-camp/tambah/formulir?nama=${encodeURIComponent(nama)}`);
  };

  // 2. Perbarui fungsi handleSave menjadi async
  const handleSave = async () => {
    if (!nama.trim()) return showToast("Nama Program harus diisi!", true);
    if (!jadwal) return showToast("Jadwal Pelaksanaan harus diisi!", true);
    if (!lokasi.trim()) return showToast("Lokasi harus diisi!", true);

    setIsSaving(true);
    let imageUrl = null;

    try {
      // TAHAP 1: Upload Poster ke Supabase Storage (Jika ada file yang dipilih)
      if (posterFile) {
        // Buat nama file unik untuk mencegah bentrok
        const fileExt = posterFile.name.split('.').pop();
        const fileName = `poster-${Date.now()}.${fileExt}`;
        
        // Simpan langsung di root bucket program-images
        const filePath = fileName; 

        // Proses upload ke bucket BARU
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('program-images') // <--- NAMA BUCKET BARU
          .upload(filePath, posterFile);

        if (uploadError) {
          throw new Error(`Gagal upload poster: ${uploadError.message}`);
        }

        // Dapatkan Public URL dari file yang baru di-upload
        const { data: publicUrlData } = supabase.storage
          .from('program-images') // <--- NAMA BUCKET BARU
          .getPublicUrl(filePath);

        imageUrl = publicUrlData.publicUrl;
      }

      // TAHAP 2: Siapkan data untuk dikirim ke API
      const payload = {
        title: nama,
        category: "Semesta Camp", 
        description: deskripsi,
        event_start_date: jadwal,
        location: lokasi,
        image_url: imageUrl, 
        is_active: true,
      };

      // TAHAP 3: Simpan Data ke Database melalui API POST
      const response = await fetch('/api/programs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal menyimpan program ke database');
      }

      showToast("Program berhasil disimpan!");
      
      // Redirect setelah sukses
      setTimeout(() => {
        router.push("/admin/semesta-camp");
      }, 1500);

    } catch (error) {
      showToast(error.message, true);
    } finally {
      setIsSaving(false);
    }
  };

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
            <Link href="/admin/semesta-camp" className={styles.backButton}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className={styles.headerTitle}>Tambah Program Semesta Camp</h1>
          </div>
          <p className={styles.headerSubtitle}>Buat program Semesta Camp baru</p>
        </div>

        {/* SECTION 1: Informasi */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Informasi</h2>
          <div className={styles.infoGrid}>
            {/* Photo Upload */}
            <div className={styles.posterColumn}>
              <label className={styles.fieldLabel}>Photo</label>
              <div
                className={styles.posterUpload}
                onClick={() => fileInputRef.current?.click()}
              >
                {posterPreview ? (
                  <div className={styles.posterPreview}>
                    <img src={posterPreview} alt="Photo" className={styles.posterImage} />
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
                      placeholder="Placeholder"
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
                    placeholder="Placeholder"
                  />
                </div>
              </div>

              {/* Batas Registrasi + Buat Formulir — satu baris */}
              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Batas Registrasi <span className={styles.required}>*</span></label>
                  <div className={styles.inputWrapper}>
                    <input
                      type="date"
                      className={`${styles.input} ${isLocked ? styles.inputLocked : ""}`}
                      value={batasRegistrasi}
                      onChange={(e) => setBatasRegistrasi(e.target.value)}
                      disabled={isLocked}
                    />
                    <svg className={`${styles.inputIcon} ${isLocked ? styles.lockIcon : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </div>
                </div>

                <div className={styles.tipeBtnWrapper}>
                  <button
                    className={`${styles.viewFormBtn} ${formulirCreated ? styles.viewFormBtnCreated : ""}`}
                    onClick={handleBuatFormulir}
                    onMouseEnter={() => !nama.trim() && setTooltipShow(true)}
                    onMouseLeave={() => setTooltipShow(false)}
                  >
                    {formulirCreated ? (
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
                    {tooltipShow && (
                      <div className={styles.tooltip}>Isi Nama Program terlebih dahulu</div>
                    )}
                  </div>
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
              placeholder="Placeholder"
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
                    placeholder={field.placeholder || "Placeholder"}
                    rows={3}
                  />
                ) : field.type === "angka" ? (
                  <input
                    type="number"
                    className={styles.input}
                    value={field.value}
                    onChange={(e) => handleFieldChange("detail", field.id, e.target.value)}
                    placeholder={field.placeholder || "Placeholder"}
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
                    <option value="">Placeholder</option>
                  </select>
                ) : field.type === "upload file" ? (
                  <div className={styles.uploadBox}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <p className={styles.uploadText}>Klik untuk upload file</p>
                  </div>
                ) : (
                  <input
                    type="text"
                    className={styles.input}
                    value={field.value}
                    onChange={(e) => handleFieldChange("detail", field.id, e.target.value)}
                    placeholder={field.placeholder || "Placeholder"}
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
                    placeholder={field.placeholder || "Placeholder"}
                    rows={3}
                  />
                ) : field.type === "angka" ? (
                  <input
                    type="number"
                    className={styles.input}
                    value={field.value}
                    onChange={(e) => handleFieldChange("pekerjaan", field.id, e.target.value)}
                    placeholder={field.placeholder || "Placeholder"}
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
                    <option value="">Placeholder</option>
                  </select>
                ) : field.type === "upload file" ? (
                  <div className={styles.uploadBox}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <p className={styles.uploadText}>Klik untuk upload file</p>
                  </div>
                ) : (
                  <input
                    type="text"
                    className={styles.input}
                    value={field.value}
                    onChange={(e) => handleFieldChange("pekerjaan", field.id, e.target.value)}
                    placeholder={field.placeholder || "Placeholder"}
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
            Save Changes
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