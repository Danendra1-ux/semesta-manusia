"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar.jsx";
import Footer from "@/components/Footer.jsx";
import styles from "./page.module.css";
import { createClient } from '@supabase/supabase-js';
import { getSupabaseAnonKey } from '@/lib/supabaseKeys';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = getSupabaseAnonKey();
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const Toast = ({ message, show, isError }) => (
  <div className={`${styles.toast} ${show ? styles.toastShow : ""} ${isError ? styles.toastError : ""}`}>
    {isError ? (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 20, height: 20, flexShrink: 0 }}>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ) : (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 20, height: 20, flexShrink: 0 }}>
        <polyline points="20 6 9 17 4 12" />
      </svg>
    )}
    <span>{message}</span>
  </div>
);

const CalendarIcon = () => (
  <svg className={styles.calendarIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

export default function RegisterPage({ params }) {
  const { id } = use(params);
  const programId = id;
  const router = useRouter();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [files, setFiles] = useState({});
  const [errors, setErrors] = useState({});

  const [type, setType] = useState(null);
  const [program, setProgram] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [toastShow, setToastShow] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastIsError, setToastIsError] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const registrationType = params.get("type");
    setType(registrationType);

    const fetchProgram = async () => {
      try {
        const response = await fetch(`/api/programs/${programId}`);
        if (response.ok) {
          const data = await response.json();
          setProgram(data);
        }
      } catch (err) {
        console.error('Failed to fetch program:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProgram();
  }, [programId]);

  // Auto-fill "Data Diri"
  useEffect(() => {
    if (!program) return;

    const fetchAndPrefill = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) return;
        const { user } = await res.json();
        if (!user) return;

        const hasData =
          user.name || user.email || user.whatsapp || user.instagram ||
          user.birth_date || user.region || user.institution;
        if (!hasData) return;

        const schema = getFormSchema();
        const firstSection = schema?.[0];
        if (!firstSection?.fields) return;

        setFormData((prev) => {
          if (Object.keys(prev).length > 0) return prev;

          const next = { ...prev };

          const fillByLabel = (regex, value) => {
            if (!value) return;
            const field = firstSection.fields.find((f) => regex.test(f.label ?? ""));
            if (!field) return;
            if (next[field.id]) return;
            if (value === "") return;
            next[field.id] = value;
          };

          fillByLabel(/nama\s*lengkap|^nama|name/i, user.name);
          fillByLabel(/email/i, user.email);
          fillByLabel(/whatsapp|no\.?hp|handphone|wa/i, user.whatsapp);
          fillByLabel(/instagram|^ig$|\big\b|sosmed/i, user.instagram);
          fillByLabel(/tanggal\s*lahir|birth.?date|tgl\s*lahir/i, user.birth_date);
          fillByLabel(/asal\s*daerah|^daerah|region|kota|kabupaten/i, user.region);
          fillByLabel(/instansi|institution|perguruan|sekolah|kampus/i, user.institution);

          return next;
        });
      } catch (err) {
        console.error("Prefill from /api/auth/me failed:", err);
      }
    };

    fetchAndPrefill();
  }, [program]);

  const showToast = (msg, isErr = true) => {
    setToastMessage(msg);
    setToastIsError(isErr);
    setToastShow(true);
    setTimeout(() => setToastShow(false), 4000); 
  };

  const getFormSchema = () => {
    if (!program) return null;
    if (program.category === "SJN") {
      if (type === "fully-funded") return program.custom_registration_form_fully || null;
      if (type === "self-funded") return program.custom_registration_form_self || null;
    }
    return program.custom_registration_form || null;
  };

  const getTotalSteps = () => {
    const schema = getFormSchema();
    if (schema && Array.isArray(schema) && schema.length > 0) return schema.length;
    return type === "semesta-camp" ? 2 : 3;
  };

  const getStepTitles = () => {
    const schema = getFormSchema();
    if (schema && Array.isArray(schema) && schema.length > 0) {
      return schema.map(section => section.title);
    }
    const baseSteps = ["Data Diri"];
    if (type !== "semesta-camp") baseSteps.push("Deskripsi Diri");
    baseSteps.push("Kelengkapan Persyaratan");
    return baseSteps;
  };

  const getSidebarTitle = () => {
    if (!program) return "";
    if (program.category === "SJN") {
      const baseName = program.title.split("#")[0].trim();
      const programNum = program.title.match(/#\d+/)?.[0] || "";
      const restAfterNum = programNum
        ? program.title.split(programNum)[1]?.trim() || ""
        : "";
      const baseTitle = `${baseName} ${programNum}${restAfterNum ? " " + restAfterNum : ""}`.trim();
      if (type === "fully-funded") return `${baseTitle} - Fully Funded`;
      if (type === "self-funded") return `${baseTitle} - Self Funded`;
      return baseTitle;
    }
    return program.title;
  };

  const handleInputChange = (fieldId, value) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
    if (errors[fieldId]) setErrors((prev) => ({ ...prev, [fieldId]: null }));
  };

  const handleFileChange = (fieldId, file) => {
    setFiles((prev) => ({ ...prev, [fieldId]: file }));
    if (errors[fieldId]) setErrors((prev) => ({ ...prev, [fieldId]: null }));
  };

  const handleRemoveFile = (fieldId) => {
    setFiles((prev) => {
      const newFiles = { ...prev };
      delete newFiles[fieldId];
      return newFiles;
    });
  };

  const validateStep = (step) => {
    const newErrors = {};
    const customSections = getFormSchema();

    if (customSections && customSections[step - 1]) {
      const currentSection = customSections[step - 1];

      currentSection.fields.forEach((field) => {
        if (field.type === "upload") {
          if (field.required && !files[field.id]) {
            newErrors[field.id] = "File ini wajib diupload";
          }
          return;
        }

        const value = formData[field.id];
        const label = (field.label || "").toLowerCase();

        if (field.required && !value?.trim()) {
          newErrors[field.id] = "Field ini wajib diisi";
          return;
        }

        if (!value?.trim()) return;

        if (label.includes("email")) {
          if (!value.includes("@")) {
            newErrors[field.id] = "Email harus mengandung karakter '@'";
          } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            newErrors[field.id] = "Format email tidak valid";
          }
        } else if (label.includes("whatsapp") || label.includes("no. hp") || label.includes("no hp") || label.includes("handphone")) {
          if (!/^\d+$/.test(value)) {
            newErrors[field.id] = "Nomor WhatsApp hanya boleh berisi angka";
          }
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < getTotalSteps()) {
        setCurrentStep(currentStep + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        handleSubmit();
      }
    } else {
      showToast("Terdapat kolom wajib yang belum diisi", true);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      let fundingTypeId = null;
      if (program && program.program_funding_types) {
        const fundingCode = type === "fully-funded" ? "fully" : "self";
        const ft = program.program_funding_types.find((f) => f.code === fundingCode);
        if (ft) fundingTypeId = ft.id;
      }

      const uploaded_files = [];
      
      for (const [fieldKey, file] of Object.entries(files)) {
        if (file) {
          const fd = new FormData();
          fd.append('file', file);
          fd.append('fieldKey', fieldKey);
          fd.append('programId', programId);

          const uploadRes = await fetch('/api/uploads/registration-files', {
            method: 'POST',
            body: fd,
          });

          if (!uploadRes.ok) {
            const errBody = await uploadRes.json().catch(() => ({}));
            throw new Error(`Gagal upload ${fieldKey}: ${errBody.error || uploadRes.statusText}`);
          }

          const uploaded = await uploadRes.json();
          uploaded_files.push(uploaded);
        }
      }

      const formSchema = getFormSchema() || [];
      const dynamic_answers = Object.entries(formData).map(([key, value]) => {
        return {
          field_id: key,
          value_text: value
        };
      });

      const fieldMap = new Map();
      formSchema.forEach((sec) => {
        sec.fields?.forEach((f) => fieldMap.set(f.id, f));
      });

      const findFieldId = (regex) => [...fieldMap.keys()].find((k) => regex.test(fieldMap.get(k)?.label ?? ''));

      const val = (fieldId) => formData[fieldId] || '';

      const nameId = findFieldId(/nama|name/i);
      const emailId = findFieldId(/email/i);
      const waId = findFieldId(/whatsapp|no\.?hp|handphone/i);
      const igId = findFieldId(/instagram|ig|sosmed/i);
      const birthId = findFieldId(/tanggal.?lahir|birth.?date/i);
      const regionId = findFieldId(/daerah|region|kota|kabupaten/i);
      const instId = findFieldId(/instansi|institution|perguruan|sekolah/i);
      const reasonId = findFieldId(/alasan|reason|mengapa/i);

      const firstFieldId = formSchema?.[0]?.fields?.[0]?.id;

      const payload = {
        program_id: programId,
        funding_type_id: fundingTypeId,

        full_name: val(nameId) || val(firstFieldId ?? ''),
        email: val(emailId) || '',
        whatsapp: val(waId) || '',
        instagram: val(igId) || '',
        birth_date: val(birthId) || '',
        region: val(regionId) || '',
        institution: val(instId) || '',
        reason: val(reasonId) || '',

        dynamic_answers: dynamic_answers,
        uploaded_files: uploaded_files
      };

      const response = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal menyimpan pendaftaran');
      }

      setShowSuccessModal(true);

    } catch (error) {
      console.error("Error submitting form:", error);
      showToast(error.message, true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepComplete = (step) => step < currentStep;

  const renderStepper = () => {
    const steps = getStepTitles();
    return (
      <div className={styles.stepper}>
        {steps.map((title, index) => {
          const stepNum = index + 1;
          const isActive = stepNum === currentStep;
          const isComplete = isStepComplete(stepNum);

          return (
            <div key={stepNum} className={styles.stepItem}>
              <div className={styles.stepHeader}>
                <div
                  className={`${styles.stepCircle} ${isActive ? styles.active : isComplete ? styles.complete : ""}`}
                >
                  {isComplete ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  ) : stepNum}
                </div>
                <div className={styles.stepText}>
                  <span className={`${styles.stepTitle} ${isActive ? styles.activeTitle : isComplete ? styles.completeTitle : ""}`}>
                    {title}
                  </span>
                </div>
              </div>
              {index < steps.length - 1 && <div className={styles.stepLine} />}
            </div>
          );
        })}
      </div>
    );
  };

  const FileUpload = ({ label, fieldId, instruction }) => {
    const file = files[fieldId];
    const error = errors[fieldId];

    return (
      <div className={styles.uploadField}>
        <label className={styles.uploadLabel}>
          {label} <span className={styles.required}>*</span>
        </label>
        {instruction && <p className={styles.uploadInstruction}>{instruction}</p>}
        <div
          className={`${styles.uploadBox} ${file ? styles.hasFile : ""} ${error ? styles.hasError : ""}`}
          onClick={() => !file && document.getElementById(`file-${fieldId}`)?.click()}
        >
          {file ? (
            <div className={styles.filePreview}>
              <Image
                src={URL.createObjectURL(file)}
                alt={file.name}
                width={200}
                height={150}
                className={styles.previewImage}
              />
              <div className={styles.fileInfo}>
                <span className={styles.fileName}>{file.name}</span>
                <button
                  type="button"
                  className={styles.removeFile}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile(fieldId);
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.uploadPlaceholder}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
              <span>Unggah 1 file.</span>
              <small>Drag & drop atau klik untuk upload</small>
            </div>
          )}
        </div>
        <input
          id={`file-${fieldId}`}
          type="file"
          accept="image/*,application/pdf"
          className={styles.fileInput}
          onChange={(e) => handleFileChange(fieldId, e.target.files[0])}
        />
        {error && <span className={styles.errorText}>{error}</span>}
      </div>
    );
  };

  const fundingTypes = program?.program_funding_types || [];
  const selfEntry = fundingTypes.find((f) => f.code === "self");
  const fullyEntry = fundingTypes.find((f) => f.code === "fully");
  const isFundingTypeClosed =
    program?.category === "Semesta Camp"
      ? selfEntry?.is_active === false
      : type === "fully-funded"
        ? fullyEntry?.is_active === false
        : type === "self-funded"
          ? selfEntry?.is_active === false
          : false;
  const isClosed =
    program?.is_active === false ||
    program?.status === "Ditutup" ||
    isFundingTypeClosed;

  useEffect(() => {
    if (!loading && program && isClosed) {
      router.replace("/user/program");
    }
  }, [loading, program, isClosed, router]);

  if (loading || !program || !type || isClosed) {
    return (
      <div className={styles.page}>
        <Navbar showCta={false} />
        <div className={styles.loading}>Memuat form pendaftaran...</div>
      </div>
    );
  }

  const stepTitles = getStepTitles();
  const totalSteps = getTotalSteps();
  const formSchema = getFormSchema();
  const currentSectionData = formSchema?.[currentStep - 1];

  return (
    <div className={styles.page}>
      <Navbar />
      <Toast message={toastMessage} show={toastShow} isError={toastIsError} />

      <div className={styles.container}>
        <aside className={styles.sidebar}>
          <button className={styles.sidebarBackButton} onClick={() => router.replace(`/user/program/${programId}`)} aria-label="Kembali">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <h2 className={styles.sidebarTitle}>{getSidebarTitle()}</h2>
          <span className={styles.sidebarSubtitle}>
            {type === "semesta-camp" ? "Pendaftaran Semesta Camp" : "Pendaftaran SJN"}
          </span>
          {renderStepper()}

          <a
            href="https://wa.me/6285121594627"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.helpBox}
          >
            <div className={styles.helpIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                <line x1="9" y1="9" x2="9.01" y2="9" />
                <line x1="12" y1="9" x2="12.01" y2="9" />
                <line x1="15" y1="9" x2="15.01" y2="9" />
              </svg>
            </div>
            <div className={styles.helpContent}>
              <h4>Butuh Bantuan?</h4>
              <p>Hubungi kami via WhatsApp</p>
            </div>
          </a>
        </aside>

        <main className={styles.mainContent}>
          <div className={styles.stepHeaderContent}>
            <h1 className={styles.stepPageTitle}>{stepTitles[currentStep - 1]}</h1>
            <div className={styles.stepMeta}>
              <span className={styles.stepNumber}>Langkah {currentStep} dari {totalSteps}</span>
              <div className={styles.stepProgress}>
                {Array.from({ length: totalSteps }, (_, i) => (
                  <div
                    key={i}
                    className={`${styles.progressDot} ${i + 1 === currentStep ? styles.active : i + 1 < currentStep ? styles.complete : ""}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className={styles.formGrid}>
            {/* RENDER FORM DINAMIS */}
            {currentSectionData && currentSectionData.fields.map((field) => {
              const isFullWidth = field.type === 'textarea' || field.type === 'upload' || field.label.includes('Nama Instansi');
              
              return (
                <div key={field.id} className={`${styles.formField} ${isFullWidth ? styles.fullWidth : ''}`}>
                  
                  {/* Field Teks / Email / Telp / Angka */}
                  {(field.type === "teks" || field.type === "angka") && (
                    <>
                      <label className={styles.label}>
                        {field.label} {field.required && <span className={styles.required}>*</span>}
                      </label>
                      <input
                        type={field.label.toLowerCase().includes("email") ? "email" : field.label.toLowerCase().includes("whatsapp") ? "tel" : field.type === "angka" ? "number" : "text"}
                        inputMode={field.label.toLowerCase().includes("whatsapp") ? "numeric" : undefined}
                        pattern={field.label.toLowerCase().includes("whatsapp") ? "[0-9]*" : undefined}
                        className={`${styles.input} ${errors[field.id] ? styles.inputError : ""}`}
                        placeholder={field.placeholder || ("Masukkan " + field.label.toLowerCase())}
                        value={formData[field.id] || ""}
                        onChange={(e) => {
                          const raw = e.target.value;
                          const isWa = /whatsapp|no\.?\s*hp|handphone/i.test(field.label || "");
                          const sanitized = isWa ? raw.replace(/\D/g, "") : raw;
                          handleInputChange(field.id, sanitized);
                        }}
                      />
                      {errors[field.id] && <span className={styles.errorText}>{errors[field.id]}</span>}
                    </>
                  )}

                  {/* Field Textarea */}
                  {field.type === "textarea" && (
                    <>
                      <label className={styles.label}>
                        {field.label} {field.required && <span className={styles.required}>*</span>}
                      </label>
                      <textarea
                        className={`${styles.textarea} ${errors[field.id] ? styles.inputError : ""}`}
                        placeholder={field.placeholder || ("Masukkan " + field.label.toLowerCase())}
                        rows={4}
                        value={formData[field.id] || ""}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                      />
                      {errors[field.id] && <span className={styles.errorText}>{errors[field.id]}</span>}
                    </>
                  )}

                  {/* Field Dropdown */}
                  {field.type === "dropdown" && (
                    <>
                      <label className={styles.label}>
                        {field.label} {field.required && <span className={styles.required}>*</span>}
                      </label>
                      <select
                        className={`${styles.select} ${errors[field.id] ? styles.inputError : ""}`}
                        value={formData[field.id] || ""}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                      >
                        <option value="">{field.placeholder || "Pilih"}</option>
                        {field.options?.map((opt, i) => (
                          <option key={i} value={opt}>{opt}</option>
                        ))}
                      </select>
                      {errors[field.id] && <span className={styles.errorText}>{errors[field.id]}</span>}
                    </>
                  )}

                  {/* Field Tanggal */}
                  {field.type === "tanggal" && (
                    <>
                      <label className={styles.label}>
                        {field.label} {field.required && <span className={styles.required}>*</span>}
                      </label>
                      <div className={styles.dateInputWrapper}>
                        <input
                          type="date"
                          className={`${styles.input} ${styles.dateInput} ${errors[field.id] ? styles.inputError : ""}`}
                          value={formData[field.id] || ""}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                        />
                        <CalendarIcon />
                      </div>
                      {errors[field.id] && <span className={styles.errorText}>{errors[field.id]}</span>}
                    </>
                  )}

                  {/* Field Upload File */}
                  {field.type === "upload" && (
                    <FileUpload
                      label={field.label}
                      fieldId={field.id}
                      instruction={field.placeholder}
                    />
                  )}
                </div>
              );
            })}
            
          </div>

          <div className={styles.navigation}>
            {currentStep > 1 && (
              <button type="button" className={styles.backButton} onClick={handleBack} disabled={isSubmitting}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Kembali
              </button>
            )}
            <button type="button" className={styles.continueButton} onClick={handleNext} disabled={isSubmitting}>
              {currentStep === totalSteps ? (isSubmitting ? "Mengirim..." : "Kirim") : "Lanjutkan"}
              {!isSubmitting && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              )}
            </button>
          </div>
        </main>
      </div>

      {showSuccessModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <path d="M22 4L12 14.01l-3-3" />
              </svg>
            </div>
            <h2 className={styles.modalTitle}>Pendaftaran Berhasil!</h2>
            <p className={styles.modalText}>
              Terima kasih telah mendaftar sebagai volunteer. Tim kami akan segera menghubungi kamu melalui WhatsApp atau email yang telah diberikan.
            </p>
            <button className={styles.modalButton} onClick={() => router.push(`/user/program/${programId}`)}>
              Kembali ke Halaman Program
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}