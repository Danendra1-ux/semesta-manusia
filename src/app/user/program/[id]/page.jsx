"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import styles from "./page.module.css";

export default function ProgramDetailPage({ params }) {
  const { id } = use(params);
  const programId = Number(id);
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("deskripsi");
  const [fundingOption, setFundingOption] = useState("fully");

  const [program, setProgram] = useState(null);
  const [formConfig, setFormConfig] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const tabRefs = { deskripsi: null, detail: null, divisi: null, pekerjaan: null };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [progRes, formRes] = await Promise.all([
          fetch(`/api/programs/${programId}`),
          fetch(`/api/programs/${programId}/form`)
        ]);

        if (progRes.ok) {
          const progData = await progRes.json();
          setProgram(progData);
        }

        if (formRes.ok) {
          const formData = await formRes.json();
          setFormConfig(formData || []);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [programId]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: program?.title || "Program Semesta Manusia",
          url,
        });
      } catch (err) {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    const el = tabRefs[tab];
    if (el) {
      const offset = 100;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  const getCategoryGradient = () => {
    if (!program) return "linear-gradient(135deg, #00BFFF 0%, #0099CC 100%)";
    if (program.category === "SJN") return "linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)";
    return "linear-gradient(135deg, #00BFFF 0%, #0099CC 100%)";
  };

  const getCategoryClass = () => {
    if (!program) return "";
    if (program.category === "SJN") return styles.sjn;
    if (program.category === "Semesta Camp") return styles.camp;
    return "";
  };

  const registerLabel = () => {
    if (!program) return "Daftar Sekarang";
    if (program.category === "SJN") {
      return fundingOption === "fully" ? "Daftar Fully Funded" : "Daftar Self Funded";
    }
    return "Daftar Sekarang";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Segera Diumumkan";
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatDateRange = (start, end) => {
    if (!start) return "Segera Hadir";
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    const startDate = new Date(start).toLocaleDateString('id-ID', options);
    if (!end || start === end) return startDate;
    const endDate = new Date(end).toLocaleDateString('id-ID', options);
    return `${startDate} - ${endDate}`;
  };

  // Loading state
  if (loading) {
    return (
      <div className={styles.page}>
        <Navbar showCta={false} />
        <div className={styles.notFound}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
          <h2>Memuat program...</h2>
        </div>
      </div>
    );
  }

  // Not found state
  if (error || !program) {
    return (
      <div className={styles.page}>
        <Navbar showCta={false} />
        <div className={styles.notFound}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
          <h2>Program Tidak Ditemukan</h2>
          <p>Program yang kamu cari tidak tersedia atau sudah berakhir.</p>
          <Link href="/user/program" className={styles.notFoundButton}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Kembali ke Cari Program
          </Link>
        </div>
      </div>
    );
  }

  const isSJN = program.category === "SJN";

  // Resolve funding deadlines from program_funding_types
  const fundingTypes = program.program_funding_types || [];
  const fullyDeadline = fundingTypes.find(f => f.code === 'fully')?.deadline;
  const selfDeadline = fundingTypes.find(f => f.code === 'self')?.deadline;

  return (
    <div className={styles.page}>
      {/* Navbar */}
      <Navbar />

      {/* Hero Section — 2 Column Layout */}
      <section className={styles.heroSection}>
        {/* Left: Hero Image */}
        <div className={styles.heroImageCol}>
          <div className={styles.heroImage}>
            <Image
              src={program.image_url || "/program-preview-1.jpg"}
              alt={program.title}
              fill
              style={{ objectFit: "cover" }}
            />
            {!program.image_url && (
              <div
                className={styles.imagePlaceholder}
                style={{ background: getCategoryGradient() }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
                <span>{program.title}</span>
              </div>
            )}
          </div>

          {/* Back Button — overlay on hero image */}
          <button
            className={styles.backButton}
            onClick={() => router.back()}
            aria-label="Kembali"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Right: Info & Registration */}
        <div className={styles.infoCol}>
          {/* Category Badge + Share */}
          <div className={styles.headerRow}>
            <span className={`${styles.badge} ${getCategoryClass()}`}>
              {program.category}
            </span>
            <button
              className={styles.shareButton}
              onClick={handleShare}
              aria-label="Bagikan"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
            </button>
          </div>

          {/* Program Title */}
          <h1 className={styles.programTitle}>{program.title}</h1>

          {/* Info Box */}
          <div className={styles.infoBox}>
            <div className={styles.infoRow}>
              <div className={`${styles.infoIcon} ${getCategoryClass()}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <div className={styles.infoContent}>
                <span className={styles.infoLabel}>Tanggal Pelaksanaan</span>
                <span className={styles.infoValue}>{formatDateRange(program.event_start_date, program.event_end_date)}</span>
              </div>
            </div>

            <div className={styles.infoRow}>
              <div className={`${styles.infoIcon} ${getCategoryClass()}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div className={styles.infoContent}>
                <span className={styles.infoLabel}>Lokasi</span>
                <span className={styles.infoValue}>
                  {program.location || "Indonesia"}
                </span>
              </div>
            </div>
          </div>

          {/* Warning Box — batas registrasi Semesta Camp */}
          {!isSJN && (
            <div className={styles.warningBox}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span className={styles.warningText}>
                Batas registrasi program: <strong>{formatDate(selfDeadline)}</strong>
              </span>
            </div>
          )}

          {/* Funding Options — SJN Only */}
          {isSJN && (
            <div className={styles.fundingSection}>
              <div className={styles.fundingOptions}>
                {/* Fully Funded */}
                <div
                  className={`${styles.fundingOption} ${
                    fundingOption === "fully" ? `${styles.active} ${styles.sjn}` : ""
                  }`}
                  onClick={() => setFundingOption("fully")}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && setFundingOption("fully")}
                >
                  <div className={styles.radioCircle}>
                    <div className={styles.radioDot} />
                  </div>
                  <div className={styles.fundingLabel}>
                    <span className={styles.fundingName}>
                      Fully Funded
                    </span>
                    <span className={styles.fundingNote}>
                      Biaya ditanggung penuh oleh penyelenggara
                    </span>
                  </div>
                </div>

                {/* Self Funded */}
                <div
                  className={`${styles.fundingOption} ${
                    fundingOption === "self" ? `${styles.active} ${styles.sjn}` : ""
                  }`}
                  onClick={() => setFundingOption("self")}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && setFundingOption("self")}
                >
                  <div className={styles.radioCircle}>
                    <div className={styles.radioDot} />
                  </div>
                  <div className={styles.fundingLabel}>
                    <span className={styles.fundingName}>Self Funded</span>
                    <span className={styles.fundingNote}>
                      Biaya transportasi & kebutuhan pribadi ditanggung sendiri
                    </span>
                  </div>
                </div>
              </div>

              {/* Warning Box — batas registrasi kondisional */}
              <div className={styles.warningBox}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <span className={styles.warningText}>
                  Batas registrasi{" "}
                  <strong>
                    {fundingOption === "fully" ? "Fully Funded" : "Self Funded"}
                  </strong>
                  :{" "}
                  <strong>
                    {fundingOption === "fully"
                      ? formatDate(fullyDeadline)
                      : formatDate(selfDeadline)}
                  </strong>
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className={styles.actionButtons}>
            <button
              className={`${styles.primaryAction} ${styles.gradient} ${getCategoryClass()}`}
              onClick={() => {
                if (isSJN) {
                  router.push(`/user/program/${programId}/register?type=${fundingOption === "fully" ? "fully-funded" : "self-funded"}`);
                } else {
                  router.push(`/user/program/${programId}/register?type=semesta-camp`);
                }
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
              {registerLabel()}
            </button>

            <button className={`${styles.primaryAction} ${styles.outlined} ${getCategoryClass()}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
              Hubungi Organisasi
            </button>
          </div>
        </div>
      </section>

      {/* Tab Content Section */}
      <section className={styles.tabSection}>
        <div className={styles.tabSectionInner}>
          {/* Tabs */}
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === "deskripsi" ? styles.active : ""}`}
              onClick={() => handleTabChange("deskripsi")}
            >
              Deskripsi
            </button>
            <button
              className={`${styles.tab} ${activeTab === "detail" ? styles.active : ""}`}
              onClick={() => handleTabChange("detail")}
            >
              Detail Aktivitas
            </button>
            {isSJN ? (
              <button
                className={`${styles.tab} ${activeTab === "divisi" ? styles.active : ""}`}
                onClick={() => handleTabChange("divisi")}
              >
                Divisi
              </button>
            ) : (
              <button
                className={`${styles.tab} ${activeTab === "pekerjaan" ? styles.active : ""}`}
                onClick={() => handleTabChange("pekerjaan")}
              >
                Pekerjaan
              </button>
            )}
          </div>

          {/* Tab Panels */}
          <div className={styles.tabPanel}>
            {/* === Tab: Deskripsi === */}
            {activeTab === "deskripsi" && (
              <div ref={(el) => (tabRefs.deskripsi = el)} className={styles.contentSection}>
                <h2 className={styles.sectionTitle}>Deskripsi</h2>
                {program.description ? (
                  <p className={styles.contentText}>
                    {program.description}
                  </p>
                ) : (
                  <p className={styles.contentText}>Belum ada deskripsi untuk program ini.</p>
                )}
              </div>
            )}

            {/* === Tab: Detail Aktivitas === */}
            {activeTab === "detail" && (
              <div ref={(el) => (tabRefs.detail = el)} className={styles.contentSection}>
                <h2 className={styles.sectionTitle}>Detail Aktivitas</h2>
                {formConfig && formConfig.length > 0 ? (
                  formConfig
                    .filter(section => section.section_key === "detail")
                    .map(section => (
                      <div key={section.id} className={styles.detailSection}>
                        {section.title && <h3 className={styles.detailSectionTitle}>{section.title}</h3>}
                        {section.description && (
                          <p className={styles.contentText}>{section.description}</p>
                        )}
                        {section.form_fields && section.form_fields.length > 0 && (
                          <div className={styles.detailFields}>
                            {section.form_fields.map(field => (
                              <div key={field.id} className={styles.detailField}>
                                <span className={styles.detailFieldLabel}>{field.label}</span>
                                {field.value && (
                                  <span className={styles.detailFieldValue}>
                                    {field.field_type === "select" && field.form_field_options && field.form_field_options.length > 0 ? (
                                      field.form_field_options
                                        .filter(opt => field.value.includes(opt.value))
                                        .map(opt => opt.label)
                                        .join(", ")
                                    ) : (
                                      field.value
                                    )}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                ) : (
                  <p className={styles.contentText}>Detail aktivitas akan segera diumumkan.</p>
                )}

                {/* Download Guide Book — SJN Only */}
                {isSJN && (
                  <button className={`${styles.downloadButton} ${getCategoryClass()}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                    Download Guide Book
                  </button>
                )}
              </div>
            )}

            {/* === Tab: Divisi — SJN Only === */}
            {isSJN && activeTab === "divisi" && (
              <div ref={(el) => (tabRefs.divisi = el)} className={styles.contentSection}>
                <h2 className={styles.sectionTitle}>Divisi</h2>
                {formConfig && formConfig.length > 0 ? (
                  formConfig
                    .filter(section => section.section_key === "divisi")
                    .map(section => (
                      <div key={section.id} className={styles.detailSection}>
                        {section.title && <h3 className={styles.detailSectionTitle}>{section.title}</h3>}
                        {section.description && (
                          <p className={styles.contentText}>{section.description}</p>
                        )}
                        {section.form_fields && section.form_fields.length > 0 && (
                          <div className={styles.divisiSection}>
                            {section.form_fields.map(field => (
                              <div key={field.id} className={styles.divisiItem}>
                                <div className={styles.divisiInfo}>
                                  <h4>{field.label}</h4>
                                  {field.placeholder && (
                                    <p>{field.placeholder}</p>
                                  )}
                                  {field.field_type === "select" && field.form_field_options && field.form_field_options.length > 0 && (
                                    <div className={styles.divisiOptions}>
                                      {field.form_field_options.map(opt => (
                                        <span key={opt.id} className={styles.divisiOption}>
                                          <span className={styles.divisiBullet}>-</span> {opt.label}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                ) : (
                  <p className={styles.contentText}>Informasi divisi akan segera diumumkan.</p>
                )}
              </div>
            )}

            {/* === Tab: Pekerjaan — Semesta Camp Only === */}
            {!isSJN && activeTab === "pekerjaan" && (
              <div ref={(el) => (tabRefs.pekerjaan = el)} className={styles.contentSection}>
                <h2 className={styles.sectionTitle}>Pekerjaan</h2>
                {formConfig && formConfig.length > 0 ? (
                  formConfig
                    .filter(section => section.section_key === "pekerjaan")
                    .map(section => (
                      <div key={section.id} className={styles.detailSection}>
                        {section.title && <h3 className={styles.detailSectionTitle}>{section.title}</h3>}
                        {section.description && (
                          <p className={styles.contentText}>{section.description}</p>
                        )}
                        {section.form_fields && section.form_fields.length > 0 && (
                          <div className={styles.detailFields}>
                            {section.form_fields.map(field => (
                              <div key={field.id} className={styles.detailField}>
                                <span className={styles.detailFieldLabel}>{field.label}</span>
                                {field.placeholder && (
                                  <span className={styles.detailFieldValue}>{field.placeholder}</span>
                                )}
                                {field.field_type === "select" && field.form_field_options && field.form_field_options.length > 0 && (
                                  <div className={styles.divisiOptions}>
                                    {field.form_field_options.map(opt => (
                                      <span key={opt.id} className={styles.divisiOption}>
                                        <span className={styles.divisiBullet}>-</span> {opt.label}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                ) : (
                  <p className={styles.contentText}>Informasi pekerjaan akan segera diumumkan.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
