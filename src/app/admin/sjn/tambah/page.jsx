"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AdminSidebar from "../../components/AdminSidebar.jsx";
import styles from "./page.module.css";

const ChevronIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.chevronIcon}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const Toast = ({ message, show, isError }) => (
  <div className={`${styles.toast} ${show ? styles.toastShow : ""} ${isError ? styles.toastError : ""}`}>
    {message}
  </div>
);

export default function TambahSJNProgramPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
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

  const [toastShow, setToastShow] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastIsError, setToastIsError] = useState(false);

  // Cek redirect flag (contoh: kembali dari buat formulir)
  useEffect(() => {
    const draft = sessionStorage.getItem("sjn_draft");
    if (draft) {
      const parsed = JSON.parse(draft);
      if (parsed.nama) setNama(parsed.nama);
      if (parsed.jadwalMulai) setJadwalMulai(parsed.jadwalMulai);
      if (parsed.jadwalSelesai) setJadwalSelesai(parsed.jadwalSelesai);
      if (parsed.lokasi) setLokasi(parsed.lokasi);
      if (parsed.deskripsi) setDeskripsi(parsed.deskripsi);
    }
  }, []);

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

  const handleSave = async () => {
    if (!nama.trim()) return showToast("Nama Program harus diisi!", true);
    if (!jadwalMulai || !jadwalSelesai) return showToast("Jadwal Pelaksanaan harus diisi!", true);
    if (!lokasi.trim()) return showToast("Lokasi harus diisi!", true);

    try {
      const payload = {
        title: nama,
        slug: nama.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""),
        description: deskripsi,
        category: "SJN",
        event_start_date: jadwalMulai,
        event_end_date: jadwalSelesai,
        location: lokasi,
        status: "Dibuka",
        program_funding_types: [
          { code: 'fully', label: 'Fully Funded', deadline: fullyFundedBatasReg, is_default: true },
          { code: 'self', label: 'Self Funded', deadline: selfFundedBatasReg, is_default: false }
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
        setTimeout(() => router.push("/admin/sjn"), 1500);
      } else {
        showToast("Terjadi kesalahan. Cek kembali data Anda.", true);
      }
    } catch (err) {
      console.error(err);
      showToast("Gagal menyimpan program.", true);
    }
  };

  return (
    <div className={styles.pageLayout}>
      <AdminSidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <main className={`${styles.mainContent} ${isSidebarCollapsed ? styles.expanded : ""}`}>
        <Toast message={toastMessage} show={toastShow} isError={toastIsError} />

        <div className={styles.contentHeader}>
          <div className={styles.headerTop}>
            <Link href="/admin/sjn" className={styles.backButton}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className={styles.headerTitle}>Tambah Program SJN</h1>
          </div>
          <p className={styles.headerSubtitle}>Buat program Semesta Jelajah Nusantara baru</p>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Informasi</h2>
          <div className={styles.infoGrid}>
            <div className={styles.posterColumn}>
              <label className={styles.fieldLabel}>Photo</label>
              <div className={styles.posterUpload} onClick={() => fileInputRef.current?.click()}>
                {posterPreview ? (
                  <div className={styles.posterPreview}>
                    <img src={posterPreview} alt="Photo" className={styles.posterImage} />
                    <button className={styles.removePosterBtn} onClick={(e) => { e.stopPropagation(); handleRemovePoster(); }}>
                      X
                    </button>
                  </div>
                ) : (
                  <div className={styles.posterPlaceholder}>
                    <span>Upload Photo</span>
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className={styles.hiddenInput} onChange={handlePosterChange} />
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
                <div className={styles.tipeRow}>
                  <div className={styles.tipeFieldGroup}>
                    <label className={styles.fieldLabel}>Batas Registrasi</label>
                    <div className={styles.inputWrapper}>
                      <input type="date" className={styles.input} value={fullyFundedBatasReg} onChange={(e) => setFullyFundedBatasReg(e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.tipeSubSection}>
                <h3 className={styles.tipeSubTitle}>Self Funded</h3>
                <div className={styles.tipeRow}>
                  <div className={styles.tipeFieldGroup}>
                    <label className={styles.fieldLabel}>Batas Registrasi</label>
                    <div className={styles.inputWrapper}>
                      <input type="date" className={styles.input} value={selfFundedBatasReg} onChange={(e) => setSelfFundedBatasReg(e.target.value)} />
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

        <div className={styles.saveSection}>
          <button className={styles.saveButtonBottom} onClick={handleSave}>
            Simpan Program
          </button>
        </div>
      </main>
    </div>
  );
}