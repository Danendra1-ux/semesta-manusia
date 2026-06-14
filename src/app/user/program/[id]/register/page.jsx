"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import styles from "./page.module.css";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Komponen Toast Notification
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

export default function RegisterPage({ params }) {
  const { id } = use(params);
  const programId = Number(id);
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

  // State untuk Toast
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

  // Helper memunculkan Toast
  const showToast = (msg, isErr = true) => {
    setToastMessage(msg);
    setToastIsError(isErr);
    setToastShow(true);
    setTimeout(() => setToastShow(false), 4000); // Hilang otomatis setelah 4 detik
  };

  const getTotalSteps = () => type === "semesta-camp" ? 2 : 3;

  const getStepTitles = () => {
    const baseSteps = ["Data Diri"];
    if (type !== "semesta-camp") baseSteps.push("Deskripsi Diri");
    baseSteps.push("Kelengkapan Persyaratan");
    return baseSteps;
  };

  const getSidebarTitle = () => {
    if (!program) return "";
    if (program.category === "SJN") {
      const programNum = program.title.match(/#\d+/)?.[0] || "";
      const baseName = program.title.split(programNum)[0].trim();
      if (type === "fully-funded") return `Fully Funded - ${baseName} ${programNum}`;
      if (type === "self-funded") return `Self Funded - ${baseName} ${programNum}`;
      return `${baseName} ${programNum}`;
    }
    return program.title;
  };

  const getFeeInfo = () => {
    if (type === "fully-funded") return { amount: "Rp. 85.000", label: "Fully Funded" };
    if (type === "self-funded") return { amount: "Rp. 50.000", label: "Self Funded" };
    return { amount: "Rp. 25.000", label: "Semesta Camp" };
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const handleFileChange = (field, file) => {
    setFiles((prev) => ({ ...prev, [field]: file }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const handleRemoveFile = (field) => {
    setFiles((prev) => {
      const newFiles = { ...prev };
      delete newFiles[field];
      return newFiles;
    });
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      const requiredFields = ["fullName", "email", "whatsapp", "instagram", "birthDate", "region", "institution"];
      if (type === "semesta-camp") requiredFields.push("reason");
      requiredFields.forEach((field) => {
        if (!formData[field]?.trim()) newErrors[field] = "Field ini wajib diisi";
      });
    }

    if (step === 2 && type !== "semesta-camp") {
      const requiredFields = ["whyJoin", "divisionChoice", "divisionReason", "programProposal", "hopes"];
      requiredFields.forEach((field) => {
        if (!formData[field]?.trim()) newErrors[field] = "Field ini wajib diisi";
      });
    }

    if (step === 3 || (step === 2 && type === "semesta-camp")) {
      const requiredUploads = [];
      if (type === "fully-funded" || type === "self-funded") {
        requiredUploads.push("instagramProof", "tiktokProof", "storyProof", "paymentProof");
      } else {
        requiredUploads.push("instagramProof", "tiktokProof", "paymentProof");
      }
      requiredUploads.forEach((field) => {
        if (!files[field]) newErrors[field] = "File ini wajib diupload";
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
          const fileExt = file.name.split('.').pop();
          const fileName = `${programId}-${Date.now()}-${fieldKey}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from('registration-files')
            .upload(fileName, file);

          if (uploadError) throw new Error(`Gagal upload ${fieldKey}: ${uploadError.message}`);

          const { data: publicUrlData } = supabase.storage
            .from('registration-files')
            .getPublicUrl(fileName);

          uploaded_files.push({
            field_key: fieldKey,
            file_url: publicUrlData.publicUrl,
            file_name: file.name,
            file_size: file.size,
            mime_type: file.type
          });
        }
      }

      const payload = {
        program_id: programId,
        funding_type_id: fundingTypeId,
        
        full_name: formData.fullName,
        email: formData.email,
        whatsapp: formData.whatsapp,
        instagram: formData.instagram,
        birth_date: formData.birthDate,
        region: formData.region,
        institution: formData.institution,
        reason: formData.reason,
        
        why_join: formData.whyJoin,
        division_code: formData.divisionChoice,
        division_reason: formData.divisionReason,
        program_proposal: formData.programProposal,
        hopes: formData.hopes,
        
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
      // GANTI ALERT MENJADI TOAST
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

  const FileUpload = ({ label, field, instruction }) => {
    const file = files[field];
    const error = errors[field];

    return (
      <div className={styles.uploadField}>
        <label className={styles.uploadLabel}>
          {label} <span className={styles.required}>*</span>
        </label>
        {instruction && <p className={styles.uploadInstruction}>{instruction}</p>}
        <div
          className={`${styles.uploadBox} ${file ? styles.hasFile : ""} ${error ? styles.hasError : ""}`}
          onClick={() => !file && document.getElementById(`file-${field}`)?.click()}
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
                    handleRemoveFile(field);
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
                <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Unggah 1 file. Maks 100 MB.</span>
              <small>Drag & drop atau klik untuk upload</small>
            </div>
          )}
        </div>
        <input
          id={`file-${field}`}
          type="file"
          accept="image/*"
          className={styles.fileInput}
          onChange={(e) => handleFileChange(field, e.target.files[0])}
        />
        {error && <span className={styles.errorText}>{error}</span>}
      </div>
    );
  };

  if (loading || !program || !type) {
    return (
      <div className={styles.page}>
        <Navbar showCta={false} />
        <div className={styles.loading}>Memuat form pendaftaran...</div>
      </div>
    );
  }

  const stepTitles = getStepTitles();
  const totalSteps = getTotalSteps();

  return (
    <div className={styles.page}>
      <Navbar />

      {/* Komponen Toast dirender di sini */}
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
            {type === "semesta-camp" ? "Semesta Camp Registration" : "SJN Registration"}
          </span>
          {renderStepper()}

          <div className={styles.helpBox}>
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
          </div>
        </aside>

        <main className={styles.mainContent}>
          <div className={styles.stepHeaderContent}>
            <h1 className={styles.stepPageTitle}>{stepTitles[currentStep - 1]}</h1>
            <div className={styles.stepMeta}>
              <span className={styles.stepNumber}>Step {currentStep} of {totalSteps}</span>
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

          {currentStep === 1 && (
            <div className={styles.formGrid}>
              <div className={styles.formField}>
                <label className={styles.label}>
                  Nama Lengkap <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  className={`${styles.input} ${errors.fullName ? styles.inputError : ""}`}
                  placeholder="Masukkan nama lengkap"
                  value={formData.fullName || ""}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                />
                {errors.fullName && <span className={styles.errorText}>{errors.fullName}</span>}
              </div>

              <div className={styles.formField}>
                <label className={styles.label}>
                  Email <span className={styles.required}>*</span>
                </label>
                <input
                  type="email"
                  className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
                  placeholder="contoh@email.com"
                  value={formData.email || ""}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
                {errors.email && <span className={styles.errorText}>{errors.email}</span>}
              </div>

              <div className={styles.formField}>
                <label className={styles.label}>
                  No. WhatsApp <span className={styles.required}>*</span>
                </label>
                <input
                  type="tel"
                  className={`${styles.input} ${errors.whatsapp ? styles.inputError : ""}`}
                  placeholder="(123) 000-0000"
                  value={formData.whatsapp || ""}
                  onChange={(e) => handleInputChange("whatsapp", e.target.value)}
                />
                {errors.whatsapp && <span className={styles.errorText}>{errors.whatsapp}</span>}
              </div>

              <div className={styles.formField}>
                <label className={styles.label}>
                  Akun Instagram <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  className={`${styles.input} ${errors.instagram ? styles.inputError : ""}`}
                  placeholder="@username"
                  value={formData.instagram || ""}
                  onChange={(e) => handleInputChange("instagram", e.target.value)}
                />
                {errors.instagram && <span className={styles.errorText}>{errors.instagram}</span>}
              </div>

              <div className={styles.formField}>
                <label className={styles.label}>
                  Tanggal Lahir <span className={styles.required}>*</span>
                </label>
                <div className={styles.dateInputWrapper}>
                  <input
                    type="date"
                    className={`${styles.input} ${styles.dateInput} ${errors.birthDate ? styles.inputError : ""}`}
                    value={formData.birthDate || ""}
                    onChange={(e) => handleInputChange("birthDate", e.target.value)}
                  />
                  <svg className={styles.calendarIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                {errors.birthDate && <span className={styles.errorText}>{errors.birthDate}</span>}
              </div>

              <div className={styles.formField}>
                <label className={styles.label}>
                  Asal Daerah <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  className={`${styles.input} ${errors.region ? styles.inputError : ""}`}
                  placeholder="Kota/Kabupaten"
                  value={formData.region || ""}
                  onChange={(e) => handleInputChange("region", e.target.value)}
                />
                {errors.region && <span className={styles.errorText}>{errors.region}</span>}
              </div>

              <div className={`${styles.formField} ${styles.fullWidth}`}>
                <label className={styles.label}>
                  Nama Instansi <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  className={`${styles.input} ${errors.institution ? styles.inputError : ""}`}
                  placeholder="Nama universitas/sekolah/instansi"
                  value={formData.institution || ""}
                  onChange={(e) => handleInputChange("institution", e.target.value)}
                />
                {errors.institution && <span className={styles.errorText}>{errors.institution}</span>}
              </div>

              {type === "semesta-camp" && (
                <div className={`${styles.formField} ${styles.fullWidth}`}>
                  <label className={styles.label}>
                    Alasan Mengikuti Kegiatan Semesta Camp <span className={styles.required}>*</span>
                  </label>
                  <textarea
                    className={`${styles.textarea} ${errors.reason ? styles.inputError : ""}`}
                    placeholder="Jelaskan alasan Anda ingin mengikuti kegiatan ini"
                    rows={4}
                    value={formData.reason || ""}
                    onChange={(e) => handleInputChange("reason", e.target.value)}
                  />
                  {errors.reason && <span className={styles.errorText}>{errors.reason}</span>}
                </div>
              )}
            </div>
          )}

          {currentStep === 2 && type !== "semesta-camp" && (
            <div className={styles.formSection}>
              <div className={styles.formField}>
                <label className={styles.label}>
                  Jelaskan mengapa anda ingin bergabung dalam kegiatan {program.title}? <span className={styles.required}>*</span>
                </label>
                <textarea
                  className={`${styles.textarea} ${errors.whyJoin ? styles.inputError : ""}`}
                  placeholder="Ceritakan motivasi dan alasan anda bergabung..."
                  rows={4}
                  value={formData.whyJoin || ""}
                  onChange={(e) => handleInputChange("whyJoin", e.target.value)}
                />
                {errors.whyJoin && <span className={styles.errorText}>{errors.whyJoin}</span>}
              </div>

              <div className={styles.formField}>
                <label className={styles.label}>
                  Jika anda terpilih sebagai delegasi, bidang apa yang akan anda pilih? <span className={styles.required}>*</span>
                </label>
                <select
                  className={`${styles.select} ${errors.divisionChoice ? styles.inputError : ""}`}
                  value={formData.divisionChoice || ""}
                  onChange={(e) => handleInputChange("divisionChoice", e.target.value)}
                >
                  <option value="">Pilih bidang</option>
                  <option value="pendidikan-literasi">Pendidikan & Literasi</option>
                  <option value="konservasi-lingkungan">Konservasi & Lingkungan</option>
                  <option value="pemberdayaan-masyarakat">Pemberdayaan Masyarakat</option>
                  <option value="dokumentasi-komunikasi">Dokumentasi & Komunikasi</option>
                </select>
                {errors.divisionChoice && <span className={styles.errorText}>{errors.divisionChoice}</span>}
              </div>

              <div className={styles.formField}>
                <label className={styles.label}>
                  Apa alasan anda memilih divisi tersebut? <span className={styles.required}>*</span>
                </label>
                <textarea
                  className={`${styles.textarea} ${errors.divisionReason ? styles.inputError : ""}`}
                  placeholder="Jelaskan alasan anda memilih bidang tersebut..."
                  rows={3}
                  value={formData.divisionReason || ""}
                  onChange={(e) => handleInputChange("divisionReason", e.target.value)}
                />
                {errors.divisionReason && <span className={styles.errorText}>{errors.divisionReason}</span>}
              </div>

              <div className={styles.formField}>
                <label className={styles.label}>
                  Apa program kerja yang akan anda ajukan untuk kegiatan {program.title}? (Jelaskan secara singkat dan detail) <span className={styles.required}>*</span>
                </label>
                <textarea
                  className={`${styles.textarea} ${errors.programProposal ? styles.inputError : ""}`}
                  placeholder="Deskripsikan program kerja yang akan anda ajukan secara singkat dan detail..."
                  rows={5}
                  value={formData.programProposal || ""}
                  onChange={(e) => handleInputChange("programProposal", e.target.value)}
                />
                {errors.programProposal && <span className={styles.errorText}>{errors.programProposal}</span>}
              </div>

              <div className={styles.formField}>
                <label className={styles.label}>
                  Apa harapan dan rencana anda jika terpilih menjadi delegasi {program.title}? <span className={styles.required}>*</span>
                </label>
                <textarea
                  className={`${styles.textarea} ${errors.hopes ? styles.inputError : ""}`}
                  placeholder="Tuliskan harapan dan rencana anda jika terpilih sebagai delegasi..."
                  rows={4}
                  value={formData.hopes || ""}
                  onChange={(e) => handleInputChange("hopes", e.target.value)}
                />
                {errors.hopes && <span className={styles.errorText}>{errors.hopes}</span>}
              </div>
            </div>
          )}

          {(currentStep === 3 || (currentStep === 2 && type === "semesta-camp")) && (
            <div className={styles.formSection}>
              <FileUpload
                label="Bukti follow Instagram Semesta Manusia Indonesia (@semestamanusiaa)"
                field="instagramProof"
              />
              <FileUpload
                label="Bukti follow Tiktok Semesta Manusia Indonesia (@semestamanusia.indonesia)"
                field="tiktokProof"
              />
              {type !== "semesta-camp" && (
                <FileUpload
                  label="Bukti upload Invitation Story ke Story Instagram Anda"
                  field="storyProof"
                  instruction={
                    <span>
                      Link download dan ketentuan:{" "}
                      <a href="https://bit.ly/kelengkapanSJN4" target="_blank" rel="noopener noreferrer" className={styles.link}>
                        https://bit.ly/kelengkapanSJN4
                      </a>
                      <br />
                      <strong className={styles.note}>NOTE: WAJIB TAG AKUN SEMESTA (Bakal di cek satu persatu)</strong>
                    </span>
                  }
                />
              )}

              <div className={styles.paymentSection}>
                <h3 className={styles.paymentTitle}>Bukti pembayaran biaya pendaftaran</h3>
                <div className={styles.paymentInfo}>
                  <p><strong>Biaya Pendaftaran {getFeeInfo().label} Sebesar {getFeeInfo().amount}</strong></p>
                  <p>NAIL AMMASHUN ALYAHYA</p>
                  <p>Bank Mandiri 1120022119304</p>
                  <p>E-Wallet an Na'il Ammashun Alyahya Putra</p>
                  <p>082179435759 (Dana)</p>
                  <p>082179435759 (ShopeePay)</p>
                  <p>082179435759 (GoPay)</p>
                </div>
              </div>

              <FileUpload
                label="Upload Bukti Pembayaran"
                field="paymentProof"
              />
            </div>
          )}

          <div className={styles.navigation}>
            {currentStep > 1 && (
              <button type="button" className={styles.backButton} onClick={handleBack} disabled={isSubmitting}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Back
              </button>
            )}
            <button type="button" className={styles.continueButton} onClick={handleNext} disabled={isSubmitting}>
              {currentStep === totalSteps ? (isSubmitting ? "Mengirim..." : "Submit") : "Continue"}
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