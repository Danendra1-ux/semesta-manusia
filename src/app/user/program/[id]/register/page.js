"use client";

import { useState, useEffect, useRef } from "react";
import { use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import navbarStyles from "../../../landingpage/landingpage.module.css";
import { allPrograms } from "../../../data/programs";

export default function RegisterPage({ params }) {
  const { id } = use(params);
  const programId = Number(id);
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [files, setFiles] = useState({});
  const [errors, setErrors] = useState({});

  // Get type from URL (fully-funded, self-funded, semesta-camp)
  const [type, setType] = useState(null);
  const [program, setProgram] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    // Get search params
    const params = new URLSearchParams(window.location.search);
    const registrationType = params.get("type");
    setType(registrationType);

    // Find program
    const foundProgram = allPrograms.find((p) => p.id === programId);
    setProgram(foundProgram);
  }, [programId]);

  // Get total steps based on type
  const getTotalSteps = () => {
    if (type === "semesta-camp") return 2;
    return 3;
  };

  // Get step titles
  const getStepTitles = () => {
    const baseSteps = ["Data Diri"];
    if (type !== "semesta-camp") {
      baseSteps.push("Deskripsi Diri");
    }
    baseSteps.push("Kelengkapan Persyaratan");
    return baseSteps;
  };

  // Get sidebar title
  const getSidebarTitle = () => {
    if (!program) return "";
    if (program.category === "SJN") {
      const programNum = program.title.match(/#\d+/)?.[0] || "";
      const baseName = program.title.split(programNum)[0].trim();
      if (type === "fully-funded") return `Fully Funded - ${baseName} ${programNum}`;
      if (type === "self-funded") return `Self Funded - ${baseName} ${programNum}`;
      return `${baseName} ${programNum}`;
    }
    // Semesta Camp
    return program.title;
  };

  // Get registration fee info
  const getFeeInfo = () => {
    if (type === "fully-funded") {
      return {
        amount: "Rp. 85.000",
        label: "Fully Funded"
      };
    }
    if (type === "self-funded") {
      return {
        amount: "Rp. 50.000",
        label: "Self Funded"
      };
    }
    // Semesta Camp
    return {
      amount: "Rp. 25.000",
      label: "Semesta Camp"
    };
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleFileChange = (field, file) => {
    setFiles((prev) => ({ ...prev, [field]: file }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
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
      const requiredFields = [
        "fullName", "email", "whatsapp", "instagram",
        "birthDate", "region", "institution"
      ];
      if (type === "semesta-camp") {
        requiredFields.push("reason");
      }
      requiredFields.forEach((field) => {
        if (!formData[field]?.trim()) {
          newErrors[field] = "Field ini wajib diisi";
        }
      });
    }

    if (step === 2 && type !== "semesta-camp") {
      const requiredFields = [
        "whyJoin", "divisionChoice", "divisionReason",
        "programProposal", "hopes"
      ];
      requiredFields.forEach((field) => {
        if (!formData[field]?.trim()) {
          newErrors[field] = "Field ini wajib diisi";
        }
      });
    }

    if (step === 3 || (step === 2 && type === "semesta-camp")) {
      const requiredUploads = [];
      if (type === "fully-funded") {
        requiredUploads.push("instagramProof", "tiktokProof", "storyProof", "paymentProof");
      } else if (type === "self-funded") {
        requiredUploads.push("instagramProof", "tiktokProof", "storyProof", "paymentProof");
      } else {
        requiredUploads.push("instagramProof", "tiktokProof", "paymentProof");
      }
      requiredUploads.forEach((field) => {
        if (!files[field]) {
          newErrors[field] = "File ini wajib diupload";
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
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = () => {
    // TODO: Implement actual submission logic
    console.log("Form submitted:", formData, files);
    setShowSuccessModal(true);
  };

  const isStepComplete = (step) => {
    // Simplified check - in real app, check actual data
    return step < currentStep;
  };

  // Render sidebar stepper
  const renderStepper = () => {
    const steps = getStepTitles();
    const labels = ["Personal Info", "Essay", "Documents"];
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
                  className={`${styles.stepCircle} ${
                    isActive ? styles.active : isComplete ? styles.complete : ""
                  }`}
                >
                  {isComplete ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  ) : (
                    stepNum
                  )}
                </div>
                <div className={styles.stepText}>
                  <span
                    className={`${styles.stepTitle} ${
                      isActive ? styles.activeTitle : isComplete ? styles.completeTitle : ""
                    }`}
                  >
                    {title}
                  </span>
                  <span
                    className={`${styles.stepLabel} ${
                      isActive ? styles.activeLabel : ""
                    }`}
                  >
                    {labels[index] || `Step ${stepNum}`}
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

  // Render file upload component
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
                <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Upload Image</span>
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

  if (!program || !type) {
    return (
      <div className={styles.page}>
        <nav className={navbarStyles.navbar}>
          <div className={navbarStyles.navContainer}>
            <Link href="/user/landingpage" className={navbarStyles.logo}>
              <div className={navbarStyles.logoImage}>
                <Image
                  src="/LOGO SEMESTA MANUSIA.png"
                  alt="Semesta Manusia Logo"
                  fill
                  style={{ objectFit: "contain" }}
                />
              </div>
            </Link>
          </div>
        </nav>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  const stepTitles = getStepTitles();
  const totalSteps = getTotalSteps();

  return (
    <div className={styles.page}>
      {/* Navbar */}
      <nav className={navbarStyles.navbar}>
        <div className={navbarStyles.navContainer}>
          <Link href="/user/landingpage" className={navbarStyles.logo}>
            <div className={navbarStyles.logoImage}>
              <Image
                src="/LOGO SEMESTA MANUSIA.png"
                alt="Semesta Manusia Logo"
                fill
                style={{ objectFit: "contain" }}
              />
            </div>
            <div className={navbarStyles.logoText}>
              <span className={navbarStyles.logoMain}>Semesta Manusia</span>
              <span className={navbarStyles.logoSub}>Indonesia</span>
            </div>
          </Link>

          <ul className={navbarStyles.navLinks}>
            <li><a href="/user/landingpage#beranda" className={navbarStyles.navLink}>Beranda</a></li>
            <li><a href="/user/landingpage#tentang" className={navbarStyles.navLink}>Tentang</a></li>
            <li><a href="/user/landingpage#program" className={navbarStyles.navLink}>Program</a></li>
            <li><a href="/user/landingpage#galeri" className={navbarStyles.navLink}>Galeri</a></li>
            <li><a href="/user/landingpage#kontak" className={navbarStyles.navLink}>Kontak</a></li>
          </ul>

          <div className={navbarStyles.navActions}>
            <Link href="/user/program" className={navbarStyles.ctaButton}>
              <span>Daftar Volunteer</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className={styles.container}>
        {/* Animated Background */}
        <div className={styles.animatedBg}>
          <div className={styles.gradientOrb1} />
          <div className={styles.gradientOrb2} />
          <div className={styles.gradientOrb3} />
        </div>

        {/* Sidebar */}
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

          {/* Help Box */}
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

        {/* Form Content */}
        <main className={styles.mainContent}>
          <div className={styles.stepHeaderContent}>
            <h1 className={styles.stepPageTitle}>{stepTitles[currentStep - 1]}</h1>
            <div className={styles.stepMeta}>
              <span className={styles.stepNumber}>Step {currentStep} of {totalSteps}</span>
              <div className={styles.stepProgress}>
                {Array.from({ length: totalSteps }, (_, i) => (
                  <div
                    key={i}
                    className={`${styles.progressDot} ${
                      i + 1 === currentStep ? styles.active : i + 1 < currentStep ? styles.complete : ""
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* STEP 1: Data Diri */}
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

          {/* STEP 2: Deskripsi Diri (SJN Only) */}
          {currentStep === 2 && type !== "semesta-camp" && (
            <div className={styles.formSection}>
              <div className={styles.formField}>
                <label className={styles.label}>
                  Jelaskan mengapa anda ingin bergabung dalam kegiatan {program.title}?{" "}
                  <span className={styles.required}>*</span>
                </label>
                <textarea
                  className={`${styles.textarea} ${errors.whyJoin ? styles.inputError : ""}`}
                  rows={4}
                  value={formData.whyJoin || ""}
                  onChange={(e) => handleInputChange("whyJoin", e.target.value)}
                />
                {errors.whyJoin && <span className={styles.errorText}>{errors.whyJoin}</span>}
              </div>

              <div className={styles.formField}>
                <label className={styles.label}>
                  Jika anda terpilih sebagai delegasi, bidang apa yang akan anda pilih?{" "}
                  <span className={styles.required}>*</span>
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
                  rows={3}
                  value={formData.divisionReason || ""}
                  onChange={(e) => handleInputChange("divisionReason", e.target.value)}
                />
                {errors.divisionReason && <span className={styles.errorText}>{errors.divisionReason}</span>}
              </div>

              <div className={styles.formField}>
                <label className={styles.label}>
                  Apa program kerja yang akan anda ajukan untuk kegiatan {program.title}? (Jelaskan secara singkat dan detail){" "}
                  <span className={styles.required}>*</span>
                </label>
                <textarea
                  className={`${styles.textarea} ${errors.programProposal ? styles.inputError : ""}`}
                  rows={5}
                  value={formData.programProposal || ""}
                  onChange={(e) => handleInputChange("programProposal", e.target.value)}
                />
                {errors.programProposal && <span className={styles.errorText}>{errors.programProposal}</span>}
              </div>

              <div className={styles.formField}>
                <label className={styles.label}>
                  Apa harapan dan rencana anda jika terpilih menjadi delegasi {program.title}?{" "}
                  <span className={styles.required}>*</span>
                </label>
                <textarea
                  className={`${styles.textarea} ${errors.hopes ? styles.inputError : ""}`}
                  rows={4}
                  value={formData.hopes || ""}
                  onChange={(e) => handleInputChange("hopes", e.target.value)}
                />
                {errors.hopes && <span className={styles.errorText}>{errors.hopes}</span>}
              </div>
            </div>
          )}

          {/* STEP 3: Kelengkapan Persyaratan (SJN) / STEP 2: Kelengkapan (Semesta Camp) */}
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
                      <a
                        href="https://bit.ly/kelengkapanSJN4"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.link}
                      >
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
                  <p>
                    <strong>Biaya Pendaftaran {getFeeInfo().label} Sebesar {getFeeInfo().amount}</strong>
                  </p>
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

          {/* Navigation Buttons */}
          <div className={styles.navigation}>
            <button
              type="button"
              className={styles.backButton}
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <button
              type="button"
              className={styles.continueButton}
              onClick={handleNext}
            >
              {currentStep === totalSteps ? "Submit" : "Continue"}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </main>
      </div>

      {/* Success Modal */}
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
            <button
              className={styles.modalButton}
              onClick={() => router.push(`/user/program/${programId}`)}
            >
              Kembali ke Halaman Program
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className={navbarStyles.footer}>
        <div className={navbarStyles.footerContainer}>
          <div className={navbarStyles.footerMain}>
            <div className={navbarStyles.footerBrand}>
              <Link href="/user/landingpage" className={navbarStyles.footerLogo}>
                <div className={navbarStyles.footerLogoIcon}>
                  <Image
                    src="/LOGO SEMESTA MANUSIA.png"
                    alt="Semesta Manusia"
                    fill
                    style={{ objectFit: "contain" }}
                  />
                </div>
              </Link>
              <p className={navbarStyles.footerDescription}>
                Menjangkau Nusantara, Menciptakan Perubahan.
              </p>
            </div>

            <div className={navbarStyles.footerLinks}>
              <div className={navbarStyles.footerColumn}>
                <h4>Program</h4>
                <ul>
                  <li><a href="/user/landingpage#program">Semesta Camp</a></li>
                  <li><a href="/user/landingpage#program">Semesta Jelajah Nusantara</a></li>
                </ul>
              </div>
              <div className={navbarStyles.footerColumn}>
                <h4>Perusahaan</h4>
                <ul>
                  <li><a href="/user/landingpage#tentang">Tentang Kami</a></li>
                  <li><a href="/user/landingpage#kontak">Hubungi Kami</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className={navbarStyles.footerBottom}>
            <p>© 2026 Semesta Manusia Indonesia. Seluruh hak cipta dilindungi.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
