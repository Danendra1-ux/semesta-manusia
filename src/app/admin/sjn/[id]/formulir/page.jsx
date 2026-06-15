"use client";

import { useState, useRef, useEffect, use } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AdminSidebar from "../../../components/AdminSidebar.jsx";
import styles from "./page.module.css";

const fieldTypes = ["Teks", "Textarea", "Angka", "Tanggal", "Dropdown", "Upload File"];

const Toast = ({ message, show }) => (
  <div className={`${styles.toast} ${show ? styles.toastShow : ""}`}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12" />
    </svg>
    {message}
  </div>
);

// ... (komponen ikon TrashIcon, CalendarIcon, ChevronIcon, EditIcon tetap sama seperti sebelumnya) ...
const TrashIcon = ({ onClick }) => (
  <button className={styles.removeFieldBtn} onClick={onClick} title="Hapus field">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.trashSvg}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    </svg>
  </button>
);

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.calendarIcon}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const ChevronIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.chevronIcon}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const EditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.editIcon}>
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

export default function FormulirSJNPage({ params }) {
  const resolvedParams = use(params);
  const programId = resolvedParams.id;
  const searchParams = useSearchParams();
  const tipe = searchParams.get("tipe") || "fully-funded";

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [toastShow, setToastShow] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // Edit placeholder state
  const [editPlaceholderOpen, setEditPlaceholderOpen] = useState(false);
  const [editPlaceholderField, setEditPlaceholderField] = useState(null);
  const [editPlaceholderValue, setEditPlaceholderValue] = useState("");
  const [editPlaceholderOptions, setEditPlaceholderOptions] = useState([""]);

  // Section state di-fetch dari API
  const [sections, setSections] = useState([]);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [modalFieldType, setModalFieldType] = useState("Teks");
  const [modalLabel, setModalLabel] = useState("");
  const [modalPlaceholder, setModalPlaceholder] = useState("");
  const [modalOptions, setModalOptions] = useState([""]);

  const [editingTitle, setEditingTitle] = useState(null);
  const [titleValue, setTitleValue] = useState("");

  // ============================================================
  // Default sections — used when DB has no form data yet
  // ============================================================
  const getDefaultSections = (tipe) => {
    const baseId = `section-${tipe}-${Date.now()}`;

    return [
      // ===== DATA DIRI (fixed fields) =====
      {
        id: `${baseId}-data-diri`,
        title: "DATA DIRI",
        isFixed: true,
        fields: [
          { id: `f-${baseId}-1`, label: "Nama Lengkap", type: "teks", required: true, isFixed: true, value: "" },
          { id: `f-${baseId}-2`, label: "Email", type: "teks", required: true, isFixed: true, value: "" },
          { id: `f-${baseId}-3`, label: "No. WhatsApp", type: "teks", required: true, isFixed: true, value: "" },
          { id: `f-${baseId}-4`, label: "Akun Instagram", type: "teks", required: true, isFixed: true, value: "" },
          { id: `f-${baseId}-5`, label: "Tanggal Lahir", type: "tanggal", required: true, isFixed: true, value: "" },
          { id: `f-${baseId}-6`, label: "Asal Daerah", type: "teks", required: true, isFixed: true, value: "" },
          { id: `f-${baseId}-7`, label: "Nama Instansi", type: "teks", required: true, isFixed: true, value: "" },
        ],
      },
      // ===== DESKRIPSI DIRI =====
      {
        id: `${baseId}-deskripsi`,
        title: "DESKRIPSI DIRI",
        isFixed: false,
        fields: [
          {
            id: `f-${baseId}-d1`,
            label: "Jelaskan mengapa anda ingin bergabung dalam kegiatan Semesta Jelajah Nusantara?",
            type: "textarea",
            required: true,
            isFixed: false,
            value: "",
            placeholder: "Masukkan jelaskan mengapa anda ingin bergabung dalam kegiatan semesta jelajah nusantara?",
          },
          {
            id: `f-${baseId}-d2`,
            label: "Jika anda terpilih sebagai delegasi, bidang apa yang akan anda pilih?",
            type: "dropdown",
            required: true,
            isFixed: false,
            value: "",
            placeholder: "Pilih bidang",
            options: [],
          },
          {
            id: `f-${baseId}-d3`,
            label: "Apa alasan anda memilih divisi tersebut?",
            type: "textarea",
            required: true,
            isFixed: false,
            value: "",
            placeholder: "Masukkan apa alasan anda memilih divisi tersebut?",
          },
          {
            id: `f-${baseId}-d4`,
            label: "Apa program kerja yang akan anda ajukan untuk kegiatan Semesta Jelajah Nusantara? (Jelaskan secara singkat dan detail)",
            type: "textarea",
            required: true,
            isFixed: false,
            value: "",
            placeholder: "Masukkan apa program kerja yang akan anda ajukan untuk kegiatan semesta jelajah nusantara? (jelaskan secara singkat dan detail)",
          },
          {
            id: `f-${baseId}-d5`,
            label: "Apa harapan dan rencana anda jika terpilih menjadi delegasi Semesta Jelajah Nusantara?",
            type: "textarea",
            required: true,
            isFixed: false,
            value: "",
            placeholder: "Masukkan apa harapan dan rencana anda jika terpilih menjadi delegasi semesta jelajah nusantara?",
          },
        ],
      },
      // ===== KELENGKAPAN PERSYARATAN =====
      {
        id: `${baseId}-persyaratan`,
        title: "KELENGKAPAN PERSYARATAN",
        isFixed: false,
        fields: [
          {
            id: `f-${baseId}-p1`,
            label: "Bukti follow Instagram Semesta Manusia Indonesia (@semestamanusiaa)",
            type: "upload",
            required: true,
            isFixed: false,
            value: null,
            placeholder: "Unggah 1 file. Maks 100 MB.",
          },
          {
            id: `f-${baseId}-p2`,
            label: "Bukti follow Tiktok Semesta Manusia Indonesia (@semestamanusia.indonesia)",
            type: "upload",
            required: true,
            isFixed: false,
            value: null,
            placeholder: "Unggah 1 file. Maks 100 MB.",
          },
          {
            id: `f-${baseId}-p3`,
            label: "Bukti upload Invitation Story ke Story Instagram Anda",
            type: "upload",
            required: true,
            isFixed: false,
            value: null,
            placeholder: "Unggah 1 file. Maks 100 MB.",
          },
          {
            id: `f-${baseId}-p4`,
            label: "Upload Bukti Pembayaran",
            type: "upload",
            required: true,
            isFixed: false,
            value: null,
            placeholder: "Unggah 1 file. Maks 100 MB.",
          },
        ],
      },
    ];
  };

  // Ambil form data dari database (custom_registration_form pada program)
  useEffect(() => {
    const fetchFormulir = async () => {
      try {
        const response = await fetch(`/api/programs/${programId}`);
        if (response.ok) {
          const data = await response.json();
          // custom_registration_form adalah JSONB pada tabel programs
          if (data && Array.isArray(data.custom_registration_form) && data.custom_registration_form.length > 0) {
            setSections(data.custom_registration_form);
          } else {
            setSections(getDefaultSections(tipe));
          }
        } else {
          setSections(getDefaultSections(tipe));
        }
      } catch (err) {
        console.error("Gagal mengambil data formulir:", err);
        setSections(getDefaultSections(tipe));
      } finally {
        setLoading(false);
      }
    };
    if (programId) fetchFormulir();
  }, [programId, tipe]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setToastShow(true);
    setTimeout(() => setToastShow(false), 3000);
  };

  const openEditPlaceholder = (field, sectionId) => {
    setEditPlaceholderField({ ...field, sectionId });
    setEditPlaceholderValue(field.placeholder || "");
    setEditPlaceholderOptions(field.options ? [...field.options] : [""]);
    setEditPlaceholderOpen(true);
  };

  const handleSavePlaceholder = () => {
    if (!editPlaceholderField) return;
    setSections((prev) =>
      prev.map((s) =>
        s.id === editPlaceholderField.sectionId
          ? {
              ...s,
              fields: s.fields.map((f) =>
                f.id === editPlaceholderField.id
                  ? {
                      ...f,
                      placeholder: editPlaceholderValue,
                      ...(f.type === "dropdown" ? { options: editPlaceholderOptions.filter((o) => o.trim() !== "") } : {}),
                    }
                  : f
              ),
            }
          : s
      )
    );
    setEditPlaceholderOpen(false);
    showToast("Placeholder berhasil diperbarui!");
  };

  const handlePlaceholderOptionChange = (index, value) => {
    setEditPlaceholderOptions((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const handleAddPlaceholderOption = () => setEditPlaceholderOptions((prev) => [...prev, ""]);
  const handleRemovePlaceholderOption = (index) => setEditPlaceholderOptions((prev) => prev.filter((_, i) => i !== index));

  const renderField = (field, sectionId) => {
    const isNamaInstansi = field.label === "Nama Instansi";
    const isFullWidth = isNamaInstansi;

    return (
      <div key={field.id} className={`${styles.fieldItem} ${isFullWidth ? styles.fieldFullWidth : ""}`}>
        <div className={styles.fieldLabelRow}>
          <label className={styles.fieldLabel}>
            {field.label}
            {field.required && <span className={styles.required}>*</span>}
          </label>
          <div className={styles.fieldActions}>
            {!field.isFixed && (
              <>
                <button className={styles.editPlaceholderBtn} onClick={() => openEditPlaceholder(field, sectionId)} title="Edit placeholder">
                  <EditIcon />
                </button>
                <TrashIcon onClick={() => handleRemoveField(sectionId, field.id)} />
              </>
            )}
          </div>
        </div>

        {field.type === "teks" ? (
          <input type="text" className={styles.input} value={field.value} placeholder={field.placeholder || "Masukkan " + field.label.toLowerCase()} disabled />
        ) : field.type === "tanggal" ? (
          <div className={styles.inputWrapper}>
            <input type="date" className={styles.input} value={field.value} disabled />
            <CalendarIcon />
          </div>
        ) : field.type === "textarea" ? (
          <textarea className={styles.textarea} value={field.value} placeholder={field.placeholder || "Masukkan " + field.label.toLowerCase()} rows={3} disabled />
        ) : field.type === "dropdown" ? (
          <div className={styles.selectWrapper}>
            <select className={styles.input} value={field.value} disabled>
              <option value="">{field.placeholder || "Pilih"}</option>
              {(field.options || []).map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
            </select>
            <ChevronIcon />
          </div>
        ) : field.type === "upload" ? (
          <div className={styles.uploadBox}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={styles.uploadIcon}>
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <p className={styles.uploadText}>{field.placeholder || "Klik untuk mengunggah file"}</p>
            <button className={styles.uploadBtn} disabled>Unggah</button>
          </div>
        ) : field.type === "angka" ? (
          <input type="number" className={styles.input} value={field.value} placeholder={field.placeholder || "Masukkan angka"} disabled />
        ) : null}
      </div>
    );
  };

  const openModal = (sectionId) => {
    setActiveSectionId(sectionId);
    setModalFieldType("Teks");
    setModalLabel("");
    setModalPlaceholder("");
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
  const handleRemoveOption = (index) => setModalOptions((prev) => prev.filter((_, i) => i !== index));

  const handleAddField = () => {
    if (!modalLabel.trim() || !activeSectionId) return;

    const validOptions = modalOptions.filter((o) => o.trim() !== "");
    const newField = {
      id: `f-${Date.now()}`,
      label: modalLabel,
      type: modalFieldType === "Upload File" ? "upload" : modalFieldType.toLowerCase(),
      placeholder: modalPlaceholder,
      required: false,
      isFixed: false,
      value: modalFieldType === "Upload File" ? null : "",
      ...(modalFieldType === "Dropdown" ? { options: validOptions } : {}),
    };

    setSections((prev) => prev.map((s) => s.id === activeSectionId ? { ...s, fields: [...s.fields, newField] } : s));
    setModalOpen(false);
  };

  const handleRemoveField = (sectionId, fieldId) => {
    setSections((prev) => prev.map((s) => s.id === sectionId ? { ...s, fields: s.fields.filter((f) => f.id !== fieldId) } : s));
  };

  const handleRemoveSection = (sectionId) => {
    setSections((prev) => prev.filter((s) => s.id !== sectionId));
  };

  const handleAddSection = () => {
    const newSection = {
      id: `section-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: "Section Baru",
      isFixed: false,
      fields: [],
    };
    setSections((prev) => [...prev, newSection]);
  };

  const startEditTitle = (sectionId, currentTitle) => {
    setEditingTitle(sectionId);
    setTitleValue(currentTitle);
  };

  const handleTitleChange = () => {
    if (!editingTitle) return;
    setSections((prev) => prev.map((s) => (s.id === editingTitle ? { ...s, title: titleValue } : s)));
    setEditingTitle(null);
  };

  // Simpan kembali form ke backend (custom_registration_form pada program)
  const handleSave = async () => {
    try {
      const res = await fetch(`/api/programs/${programId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ custom_registration_form: sections })
      });
      if (res.ok) {
        showToast("Form berhasil disimpan!");
      } else {
        const data = await res.json();
        showToast(data.error || "Gagal menyimpan formulir.", true);
      }
    } catch (err) {
      console.error(err);
      showToast("Terjadi kesalahan saat menyimpan formulir.", true);
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Memuat Formulir...</div>;

  return (
    <div className={styles.pageLayout}>
      <AdminSidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <main className={`${styles.mainContent} ${isSidebarCollapsed ? styles.expanded : ""}`}>
        <Toast message={toastMessage} show={toastShow} />

        <div className={styles.contentHeader}>
          <div className={styles.headerTop}>
            <Link href={`/admin/sjn/${programId}/edit`} className={styles.backButton}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className={styles.headerTitle}>Form Pendaftaran — {tipe === "fully-funded" ? "Fully Funded" : "Self Funded"}</h1>
            <button className={styles.saveButtonTop} onClick={handleSave}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              Simpan Perubahan
            </button>
          </div>
          <p className={styles.headerSubtitle}>Buat dan kelola form pendaftaran untuk program ini</p>
        </div>

        <div className={styles.sectionsContainer}>
          {sections.map((section) => (
            <div key={section.id} className={styles.section}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionTitleRow}>
                  {editingTitle === section.id ? (
                    <input
                      type="text"
                      className={styles.sectionTitleInput}
                      value={titleValue}
                      onChange={(e) => setTitleValue(e.target.value)}
                      onBlur={handleTitleChange}
                      onKeyDown={(e) => e.key === "Enter" && handleTitleChange()}
                      autoFocus
                    />
                  ) : (
                    <h2
                      className={`${styles.sectionTitle} ${!section.isFixed ? styles.sectionTitleEditable : ""}`}
                      onClick={() => !section.isFixed && startEditTitle(section.id, section.title)}
                    >
                      {section.title}
                    </h2>
                  )}
                  {!section.isFixed && (
                    <button className={styles.removeSectionBtn} onClick={() => handleRemoveSection(section.id)} title="Hapus section">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              <div className={styles.sectionCard}>
                <div className={styles.fieldsGrid}>
                  {section.fields.filter(f => f.isFixed && f.label !== "Nama Instansi").map(field => renderField(field, section.id))}
                  {section.fields.filter(f => f.label === "Nama Instansi").map(field => renderField(field, section.id))}
                  {section.fields.filter(f => !f.isFixed).map(field => renderField(field, section.id))}

                  <div className={`${styles.fieldItem} ${styles.addFormWrapper}`}>
                    <button className={styles.addFormBtn} onClick={() => openModal(section.id)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      Klik untuk tambah form
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className={styles.section}>
            <div className={styles.addSectionCard} onClick={handleAddSection}>
              <button className={styles.addSectionBtn}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Tambah Section
              </button>
            </div>
          </div>
        </div>

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

        {/* Modal Tambah Field & Modal Edit Placeholder dipangkas untuk efisiensi, menggunakan struktur yang identik dengan sebelumnya */}
        {modalOpen && (
          <div className={styles.modalOverlay} onClick={() => setModalOpen(false)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3 className={styles.modalTitle}>Tambah Field</h3>
                <button className={styles.modalClose} onClick={() => setModalOpen(false)}>X</button>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.modalField}>
                  <label className={styles.fieldLabel}>Pilih Tipe Field</label>
                  <select className={styles.input} value={modalFieldType} onChange={(e) => setModalFieldType(e.target.value)}>
                    {fieldTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                  </select>
                </div>
                <div className={styles.modalField}>
                  <label className={styles.fieldLabel}>Label</label>
                  <input type="text" className={styles.input} value={modalLabel} onChange={(e) => setModalLabel(e.target.value)} />
                </div>
                <div className={styles.modalField}>
                  <label className={styles.fieldLabel}>Placeholder</label>
                  <input type="text" className={styles.input} value={modalPlaceholder} onChange={(e) => setModalPlaceholder(e.target.value)} />
                </div>
                {modalFieldType === "Dropdown" && (
                  <div className={styles.modalField}>
                    <label className={styles.fieldLabel}>Opsi</label>
                    <div className={styles.optionsList}>
                      {modalOptions.map((opt, idx) => (
                        <div key={idx} className={styles.optionItem}>
                          <input type="text" className={styles.input} value={opt} onChange={(e) => handleOptionChange(idx, e.target.value)} />
                          {modalOptions.length > 1 && (
                            <button className={styles.removeOptionBtn} onClick={() => handleRemoveOption(idx)}>X</button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button className={styles.addOptionBtn} onClick={handleAddOption}>Tambah Opsi</button>
                  </div>
                )}
              </div>
              <button className={styles.addFieldModalBtn} onClick={handleAddField} disabled={!modalLabel.trim()}>Add Field</button>
            </div>
          </div>
        )}

        {editPlaceholderOpen && editPlaceholderField && (
           <div className={styles.modalOverlay} onClick={() => setEditPlaceholderOpen(false)}>
             <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
               <div className={styles.modalHeader}>
                 <h3 className={styles.modalTitle}>Edit Placeholder</h3>
                 <button className={styles.modalClose} onClick={() => setEditPlaceholderOpen(false)}>X</button>
               </div>
               <div className={styles.modalBody}>
                 <div className={styles.modalField}>
                   <label className={styles.fieldLabel}>Label</label>
                   <input type="text" className={styles.input} value={editPlaceholderField.label} disabled />
                 </div>
                 <div className={styles.modalField}>
                   <label className={styles.fieldLabel}>Placeholder</label>
                   <input type="text" className={styles.input} value={editPlaceholderValue} onChange={(e) => setEditPlaceholderValue(e.target.value)} />
                 </div>
                 {editPlaceholderField.type === "dropdown" && (
                   <div className={styles.modalField}>
                     <label className={styles.fieldLabel}>Opsi</label>
                     <div className={styles.optionsList}>
                       {editPlaceholderOptions.map((opt, idx) => (
                         <div key={idx} className={styles.optionItem}>
                           <input type="text" className={styles.input} value={opt} onChange={(e) => handlePlaceholderOptionChange(idx, e.target.value)} />
                           {editPlaceholderOptions.length > 1 && (
                             <button className={styles.removeOptionBtn} onClick={() => handleRemovePlaceholderOption(idx)}>X</button>
                           )}
                         </div>
                       ))}
                     </div>
                       <button className={styles.addOptionBtn} onClick={handleAddPlaceholderOption}>Tambah Opsi</button>
                   </div>
                 )}
               </div>
               <button className={styles.addFieldModalBtn} onClick={handleSavePlaceholder}>Simpan</button>
             </div>
           </div>
        )}
      </main>
    </div>
  );
}