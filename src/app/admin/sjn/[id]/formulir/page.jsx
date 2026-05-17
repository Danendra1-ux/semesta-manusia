"use client";

import { useState, useRef, useEffect, use } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AdminSidebar from "../../../components/AdminSidebar.js";
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

const TrashIcon = ({ onClick }) => (
  <button
    className={styles.removeFieldBtn}
    onClick={onClick}
    title="Hapus field"
  >
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={styles.trashSvg}
    >
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

  // Edit placeholder state
  const [editPlaceholderOpen, setEditPlaceholderOpen] = useState(false);
  const [editPlaceholderField, setEditPlaceholderField] = useState(null);
  const [editPlaceholderValue, setEditPlaceholderValue] = useState("");
  const [editPlaceholderOptions, setEditPlaceholderOptions] = useState([""]);

  // Section state
  const [sections, setSections] = useState([
    {
      id: "data-diri-fixed",
      title: "Data Diri",
      isFixed: true,
      fields: [
        { id: "f1", label: "Nama Lengkap", type: "teks", required: true, isFixed: true, value: "" },
        { id: "f2", label: "Email", type: "teks", required: true, isFixed: true, value: "" },
        { id: "f3", label: "No. WhatsApp", type: "teks", required: true, isFixed: true, value: "" },
        { id: "f4", label: "Akun Instagram", type: "teks", required: true, isFixed: true, value: "" },
        { id: "f5", label: "Tanggal Lahir", type: "tanggal", required: true, isFixed: true, value: "" },
        { id: "f6", label: "Asal Daerah", type: "teks", required: true, isFixed: true, value: "" },
        { id: "f7", label: "Nama Instansi", type: "teks", required: true, isFixed: true, value: "" },
      ],
    },
    {
      id: "deskripsi-diri",
      title: "Data Diri",
      isFixed: false,
      fields: [
        { id: "f8", label: "Label 1", type: "textarea", placeholder: "Placeholder", required: false, isFixed: false, value: "" },
        { id: "f9", label: "Label 2", type: "textarea", placeholder: "Placeholder", required: false, isFixed: false, value: "" },
        { id: "f10", label: "Label 3", type: "dropdown", placeholder: "Pilih", required: false, isFixed: false, value: "", options: ["Opsi 1", "Opsi 2"] },
        { id: "f11", label: "Label 4", type: "textarea", placeholder: "Placeholder", required: false, isFixed: false, value: "" },
      ],
    },
    {
      id: "kelengkapan-persyaratan",
      title: "Kelengkapan Persyaratan",
      isFixed: false,
      fields: [
        { id: "f12", label: "Label 1", type: "upload", placeholder: "Unggah 1 file. Maks 100 MB.", required: false, isFixed: false, value: null },
        { id: "f13", label: "Label 2", type: "upload", placeholder: "Placeholder", required: false, isFixed: false, value: null },
        { id: "f14", label: "Label 3", type: "dropdown", placeholder: "Pilih", required: false, isFixed: false, value: "", options: [] },
        { id: "f15", label: "Label 4", type: "upload", placeholder: "Placeholder", required: false, isFixed: false, value: null },
      ],
    },
  ]);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [modalFieldType, setModalFieldType] = useState("Teks");
  const [modalLabel, setModalLabel] = useState("");
  const [modalPlaceholder, setModalPlaceholder] = useState("");
  const [modalOptions, setModalOptions] = useState([""]);

  // Editable title state
  const [editingTitle, setEditingTitle] = useState(null);
  const [titleValue, setTitleValue] = useState("");

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

  const handleAddPlaceholderOption = () => {
    setEditPlaceholderOptions((prev) => [...prev, ""]);
  };

  const handleRemovePlaceholderOption = (index) => {
    setEditPlaceholderOptions((prev) => prev.filter((_, i) => i !== index));
  };

  // Helper: render single field
  const renderField = (field, sectionId) => {
    const isNamaInstansi = field.label === "Nama Instansi";
    const isFullWidth = isNamaInstansi;

    return (
      <div
        key={field.id}
        className={`${styles.fieldItem} ${isFullWidth ? styles.fieldFullWidth : ""}`}
      >
        <div className={styles.fieldLabelRow}>
          <label className={styles.fieldLabel}>
            {field.label}
            {field.required && <span className={styles.required}>*</span>}
          </label>
          <div className={styles.fieldActions}>
            <button
              className={styles.editPlaceholderBtn}
              onClick={() => openEditPlaceholder(field, sectionId)}
              title="Edit placeholder"
            >
              <EditIcon />
            </button>
            <TrashIcon onClick={() => handleRemoveField(sectionId, field.id)} />
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
    if (!modalLabel.trim() || !activeSectionId) return;

    const validOptions = modalOptions.filter((o) => o.trim() !== "");

    const newField = {
      id: `f-${Date.now()}`,
      label: modalLabel,
      type: modalFieldType.toLowerCase(),
      placeholder: modalPlaceholder,
      required: false,
      isFixed: false,
      value: modalFieldType === "Upload File" ? null : "",
      ...(modalFieldType === "Dropdown" ? { options: validOptions } : {}),
    };

    setSections((prev) =>
      prev.map((s) =>
        s.id === activeSectionId ? { ...s, fields: [...s.fields, newField] } : s
      )
    );

    setModalOpen(false);
  };

  const handleRemoveField = (sectionId, fieldId) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId ? { ...s, fields: s.fields.filter((f) => f.id !== fieldId) } : s
      )
    );
  };

  const handleRemoveSection = (sectionId) => {
    setSections((prev) => prev.filter((s) => s.id !== sectionId));
  };

  const handleAddSection = () => {
    const newSection = {
      id: `section-${Date.now()}`,
      title: "Section Baru",
      isFixed: false,
      fields: [],
    };
    setSections((prev) => [...prev, newSection]);
  };

  const handleFieldChange = (sectionId, fieldId, value) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              fields: s.fields.map((f) =>
                f.id === fieldId ? { ...f, value } : f
              ),
            }
          : s
      )
    );
  };

  const startEditTitle = (sectionId, currentTitle) => {
    setEditingTitle(sectionId);
    setTitleValue(currentTitle);
  };

  const handleTitleChange = () => {
    if (!editingTitle) return;
    setSections((prev) =>
      prev.map((s) => (s.id === editingTitle ? { ...s, title: titleValue } : s))
    );
    setEditingTitle(null);
  };

  const handleSave = () => {
    showToast("Form berhasil disimpan!");
  };

  // Filter only real sections (not the add section trigger at bottom)
  const realSections = sections;

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

        {/* Sections */}
        <div className={styles.sectionsContainer}>
          {realSections.map((section) => {
            return (
              <div key={section.id} className={styles.section}>
                {/* Section Header */}
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
                      <button
                        className={styles.removeSectionBtn}
                        onClick={() => handleRemoveSection(section.id)}
                        title="Hapus section"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* Fields Card */}
                <div className={styles.sectionCard}>
                  <div className={styles.fieldsGrid}>
                    {/* Bagian 1: Field fixed (grid 2 kolom, kecuali Nama Instansi) */}
                    {section.fields
                      .filter(f => f.isFixed && f.label !== "Nama Instansi")
                      .map(field => renderField(field, section.id))}

                    {/* Bagian 2: Nama Instansi (full width, fixed) */}
                    {section.fields
                      .filter(f => f.label === "Nama Instansi")
                      .map(field => renderField(field, section.id))}

                    {/* Bagian 3: Field tambahan (tidak fixed, ditambah user) */}
                    {section.fields
                      .filter(f => !f.isFixed)
                      .map(field => renderField(field, section.id))}

                    {/* Bagian 4: Tombol tambah — selalu di bawah semua field */}
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
            );
          })}

          {/* Add Section Card */}
          <div className={styles.section}>
            <div className={styles.addSectionCard} onClick={handleAddSection}>
              <button className={styles.addSectionBtn} onClick={handleAddSection}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Tambah Section
              </button>
            </div>
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

        {/* Modal Tambah Form */}
        {modalOpen && (
          <div className={styles.modalOverlay} onClick={() => setModalOpen(false)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3 className={styles.modalTitle}>Tambah Form</h3>
                <button className={styles.modalClose} onClick={() => setModalOpen(false)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <div className={styles.modalBody}>
                <div className={styles.modalField}>
                  <label className={styles.fieldLabel}>Pilih Tipe Form</label>
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

                <div className={styles.modalField}>
                  <label className={styles.fieldLabel}>Placeholder</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={modalPlaceholder}
                    onChange={(e) => setModalPlaceholder(e.target.value)}
                    placeholder="Contoh: Pilih divisi"
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

        {/* Modal Edit Placeholder */}
        {editPlaceholderOpen && editPlaceholderField && (
          <div className={styles.modalOverlay} onClick={() => setEditPlaceholderOpen(false)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3 className={styles.modalTitle}>Edit Placeholder</h3>
                <button className={styles.modalClose} onClick={() => setEditPlaceholderOpen(false)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <div className={styles.modalBody}>
                <div className={styles.modalField}>
                  <label className={styles.fieldLabel}>Label</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={editPlaceholderField.label}
                    disabled
                  />
                </div>

                <div className={styles.modalField}>
                  <label className={styles.fieldLabel}>Placeholder</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={editPlaceholderValue}
                    onChange={(e) => setEditPlaceholderValue(e.target.value)}
                    placeholder="Contoh: Masukkan nama lengkap"
                  />
                </div>

                {editPlaceholderField.type === "dropdown" && (
                  <div className={styles.modalField}>
                    <label className={styles.fieldLabel}>Opsi</label>
                    <div className={styles.optionsList}>
                      {editPlaceholderOptions.map((opt, idx) => (
                        <div key={idx} className={styles.optionItem}>
                          <input
                            type="text"
                            className={styles.input}
                            value={opt}
                            onChange={(e) => handlePlaceholderOptionChange(idx, e.target.value)}
                            placeholder={`Opsi ${idx + 1}`}
                          />
                          {editPlaceholderOptions.length > 1 && (
                            <button
                              className={styles.removeOptionBtn}
                              onClick={() => handleRemovePlaceholderOption(idx)}
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
                    <button className={styles.addOptionBtn} onClick={handleAddPlaceholderOption}>
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
                onClick={handleSavePlaceholder}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Simpan
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}