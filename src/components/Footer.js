"use client";

import Link from "next/link";
import Image from "next/image";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <div className={styles.footerMain}>
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
              Menjangkau Nusantara, Menciptakan Perubahan. Bergabunglah dalam komunitas volunteer terbesar Indonesia.
            </p>
          </div>

          <div className={styles.footerLinks}>
            <div className={styles.footerColumn}>
              <h4>Program</h4>
              <ul>
                <li><a href="/user/landingpage#program">Semesta Camp</a></li>
                <li><a href="/user/landingpage#program">Semesta Jelajah Nusantara</a></li>
                <li><a href="/user/landingpage#program">Edukasi & Literasi</a></li>
                <li><a href="/user/landingpage#program">Kesehatan</a></li>
              </ul>
            </div>

            <div className={styles.footerColumn}>
              <h4>Perusahaan</h4>
              <ul>
                <li><a href="/user/landingpage#tentang">Tentang Kami</a></li>
                <li><a href="/user/landingpage#galeri">Galeri</a></li>
                <li><a href="/user/landingpage#kontak">Hubungi Kami</a></li>
              </ul>
            </div>

            <div className={styles.footerColumn}>
              <h4>Bantuan</h4>
              <ul>
                <li><a href="#">FAQ</a></li>
                <li><a href="#">Kebijakan Privasi</a></li>
                <li><a href="#">Syarat & Ketentuan</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <p>© 2026 Semesta Manusia Indonesia. Seluruh hak cipta dilindungi.</p>
          <div className={styles.footerSocial}>
            <a href="#" aria-label="Instagram">IG</a>
            <a href="#" aria-label="Twitter">TW</a>
            <a href="#" aria-label="YouTube">YT</a>
          </div>
        </div>
      </div>
    </footer>
  );
}