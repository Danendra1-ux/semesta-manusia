"use client";

import Link from "next/link";
import Image from "next/image";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerWatermark}>
        <Image
          src="/LOGO SEMESTA MANUSIA.png"
          alt=""
          fill
          style={{ objectFit: "contain" }}
          aria-hidden="true"
        />
      </div>

      <div className={styles.footerContainer}>
        <div className={styles.footerCard}>
          <div className={styles.footerCardTop}>
            <div className={styles.footerBrand}>
              <Link href="/user/landingpage" className={styles.footerLogo}>
                <div className={styles.footerLogoIcon}>
                  <Image
                    src="/LOGO SEMESTA MANUSIA.png"
                    alt="Semesta Manusia"
                    fill
                    style={{ objectFit: "contain" }}
                  />
                </div>
                <div className={styles.footerLogoText}>
                  <span className={styles.footerLogoMain}>Semesta Manusia</span>
                  <span className={styles.footerLogoSub}>Indonesia</span>
                </div>
              </Link>
              <p className={styles.footerDescription}>
                Menjangkau Nusantara, Menciptakan Perubahan.<br />
                Jadilah relawan Semesta Manusia Indonesia.
              </p>
            </div>

            <div className={styles.footerLinks}>
              <div className={styles.footerColumn}>
                <h4>Tautan</h4>
                <ul>
                  <li><a href="/user/landingpage#beranda">Beranda</a></li>
                  <li><a href="/user/landingpage#tentang">Tentang</a></li>
                  <li><a href="/user/landingpage#program">Program</a></li>
                  <li><a href="/user/landingpage#galeri">Galeri</a></li>
                  <li><a href="/user/landingpage#kontak">Kontak</a></li>
                </ul>
              </div>

              <div className={styles.footerColumn}>
                <h4>Kontak</h4>
                <ul>
                  <li><a href="mailto:semestamanusia.indonesia@gmail.com">semestamanusia.indonesia@gmail.com</a></li>
                  <li><a href="https://wa.me/6285121594627">+62 851-2159-4627</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className={styles.footerDivider} />

          <div className={styles.footerBottom}>
            <p>© 2026 Semesta Manusia Indonesia. Seluruh hak cipta dilindungi.</p>
            <div className={styles.footerSocials}>
              <a href="https://www.instagram.com/semestamanusiaa/" target="_blank" rel="noopener noreferrer" className={styles.footerSocialLink} aria-label="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              <a href="https://tiktok.com/@semestamanusia.indonesia" target="_blank" rel="noopener noreferrer" className={styles.footerSocialLink} aria-label="TikTok">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>
              </a>
              <a href="https://youtube.com/@semestamanusia" target="_blank" rel="noopener noreferrer" className={styles.footerSocialLink} aria-label="YouTube">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
