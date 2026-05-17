"use client";

import { useState, useMemo, useRef, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminSidebar from "../../components/AdminSidebar.js";
import styles from "./page.module.css";

const programData = {
  "semesta-camp-10-palembang": {
    id: "semesta-camp-10-palembang",
    nama: "Semesta Camp #10 Palembang",
    deskripsi: "Program kemanusiaan terbaik untuk paravolunteer Indonesia",
    pendaftar: [
      { id: 1, tanggal: "2 Jan 2023", nama: "Andi Pratama", noWhatsapp: "081234567890", email: "andi.pratama@gmail.com", status: "Pending", instansi: "Universitas Padjadjaran" },
      { id: 2, tanggal: "14 Dec 2022", nama: "Siti Rahma", noWhatsapp: "081234567891", email: "siti.rahma@gmail.com", status: "Diterima", instansi: "SMA 12 Bandung" },
      { id: 3, tanggal: "12 Dec 2022", nama: "Budi Santoso", noWhatsapp: "081234567892", email: "budi.santoso@gmail.com", status: "Ditolak", instansi: "Rumah Sakit Hasan Sadikin" },
      { id: 4, tanggal: "7 Dec 2022", nama: "Dewi Lestari", noWhatsapp: "081234567893", email: "dewi.lestari@gmail.com", status: "Pending", instansi: "Universitas Indonesia" },
      { id: 5, tanggal: "3 Dec 2022", nama: "Reza Firmansyah", noWhatsapp: "081234567894", email: "reza.f@gmail.com", status: "Pending", instansi: "Universitas Gadjah Mada" },
      { id: 6, tanggal: "26 Nov 2022", nama: "Nadia Putri", noWhatsapp: "081234567895", email: "nadia.p@gmail.com", status: "Pending", instansi: "Universitas Diponegoro" },
      { id: 7, tanggal: "18 Nov 2022", nama: "Fajar Nugroho", noWhatsapp: "081234567896", email: "fajar.n@gmail.com", status: "Diterima", instansi: "Universitas Brawijaya" },
      { id: 8, tanggal: "13 Nov 2022", nama: "Ayu Rahayu", noWhatsapp: "081234567897", email: "ayu.r@gmail.com", status: "Diterima", instansi: "Universitas Airlangga" },
      { id: 9, tanggal: "11 Nov 2022", nama: "Rizky Maulana", noWhatsapp: "081234567898", email: "rizky.m@gmail.com", status: "Diterima", instansi: "Institut Teknologi Bandung" },
      { id: 10, tanggal: "9 Nov 2022", nama: "Intan Permata", noWhatsapp: "081234567899", email: "intan.p@gmail.com", status: "Ditolak", instansi: "Universitas Hasanuddin" },
      { id: 11, tanggal: "8 Nov 2022", nama: "Dian Anggraini", noWhatsapp: "081234567800", email: "dian.a@gmail.com", status: "Pending", instansi: "Universitas Diponegoro" },
      { id: 12, tanggal: "7 Nov 2022", nama: "Hendra Wijaya", noWhatsapp: "081234567801", email: "hendra.w@gmail.com", status: "Pending", instansi: "Universitas Padjadjaran" },
      { id: 13, tanggal: "5 Nov 2022", nama: "Maya Sari", noWhatsapp: "081234567802", email: "maya.s@gmail.com", status: "Diterima", instansi: "Politeknik Negeri Bandung" },
      { id: 14, tanggal: "3 Nov 2022", nama: "Ferry Susanto", noWhatsapp: "081234567803", email: "ferry.s@gmail.com", status: "Pending", instansi: "Universitas Sebelas Maret" },
      { id: 15, tanggal: "1 Nov 2022", nama: "Lina Marlina", noWhatsapp: "081234567804", email: "lina.m@gmail.com", status: "Diterima", instansi: "Universitas Sriwijaya" },
      { id: 16, tanggal: "30 Oct 2022", nama: "Agus Setiawan", noWhatsapp: "081234567805", email: "agus.set@gmail.com", status: "Pending", instansi: "Universitas Andalas" },
      { id: 17, tanggal: "28 Oct 2022", nama: "Rina Wahyuni", noWhatsapp: "081234567806", email: "rina.w@gmail.com", status: "Ditolak", instansi: "Universitas Lambung Mangkurat" },
      { id: 18, tanggal: "26 Oct 2022", nama: "Yusuf Ibrahim", noWhatsapp: "081234567807", email: "yusuf.i@gmail.com", status: "Pending", instansi: "Universitas Mulawarman" },
      { id: 19, tanggal: "24 Oct 2022", nama: "Wati Susilowati", noWhatsapp: "081234567808", email: "wati.s@gmail.com", status: "Diterima", instansi: "Universitas Cenderawasih" },
      { id: 20, tanggal: "22 Oct 2022", nama: "Toni Hermawan", noWhatsapp: "081234567809", email: "toni.h@gmail.com", status: "Pending", instansi: "Universitas Halu Oleo" },
      { id: 21, tanggal: "20 Oct 2022", nama: "Sari Dewi", noWhatsapp: "081234567810", email: "sari.d@gmail.com", status: "Pending", instansi: "Universitas Sam Ratulangi" },
      { id: 22, tanggal: "18 Oct 2022", nama: "Bimo Prasetyo", noWhatsapp: "081234567811", email: "bimo.p@gmail.com", status: "Diterima", instansi: "Universitas Pattimura" },
      { id: 23, tanggal: "16 Oct 2022", nama: "Nisa Khoirunnisa", noWhatsapp: "081234567812", email: "nisa.k@gmail.com", status: "Pending", instansi: "Universitas Islam Indonesia" },
      { id: 24, tanggal: "14 Oct 2022", nama: "Yoga Pratama", noWhatsapp: "081234567813", email: "yoga.p@gmail.com", status: "Diterima", instansi: "Universitas Ahmad Dahlan" },
      { id: 25, tanggal: "12 Oct 2022", nama: "Diah Fatmawati", noWhatsapp: "081234567814", email: "diah.f@gmail.com", status: "Pending", instansi: "Universitas Negeri Jakarta" },
      { id: 26, tanggal: "10 Oct 2022", nama: "Raka Septiawan", noWhatsapp: "081234567815", email: "raka.s@gmail.com", status: "Pending", instansi: "Universitas Indonesia" },
      { id: 27, tanggal: "8 Oct 2022", nama: "Feni Rahmawati", noWhatsapp: "081234567816", email: "feni.r@gmail.com", status: "Ditolak", instansi: "Universitas Padjadjaran" },
      { id: 28, tanggal: "6 Oct 2022", nama: "Aldi Ferdian", noWhatsapp: "081234567817", email: "aldi.f@gmail.com", status: "Diterima", instansi: "Universitas Brawijaya" },
      { id: 29, tanggal: "4 Oct 2022", nama: "Putri Maharani", noWhatsapp: "081234567818", email: "putri.m@gmail.com", status: "Pending", instansi: "Universitas Hasanuddin" },
      { id: 30, tanggal: "2 Oct 2022", nama: "Gilang Ramadhan", noWhatsapp: "081234567819", email: "gilang.r@gmail.com", status: "Pending", instansi: "Institut Teknologi Sepuluh Nopember" },
    ],
  },
  "semesta-camp-9-yogyakarta": {
    id: "semesta-camp-9-yogyakarta",
    nama: "Semesta Camp #9 Yogyakarta",
    deskripsi: "Program kemanusiaan terbaik untuk paravolunteer Indonesia",
    pendaftar: [
      { id: 1, tanggal: "14 Dec 2022", nama: "Siti Rahma", noWhatsapp: "081234567891", email: "siti.rahma@gmail.com", status: "Pending", instansi: "Universitas Gadjah Mada" },
      { id: 2, tanggal: "13 Dec 2022", nama: "Wulan Safitri", noWhatsapp: "081234567820", email: "wulan.s@gmail.com", status: "Diterima", instansi: "Universitas Islam Indonesia" },
      { id: 3, tanggal: "12 Dec 2022", nama: "Joko Widodo", noWhatsapp: "081234567821", email: "joko.w@gmail.com", status: "Pending", instansi: "Universitas Atma Jaya" },
      { id: 4, tanggal: "11 Dec 2022", nama: "Rini Hartati", noWhatsapp: "081234567822", email: "rini.h@gmail.com", status: "Ditolak", instansi: "Universitas Sanata Dharma" },
      { id: 5, tanggal: "10 Dec 2022", nama: "Ahmad Fauzi", noWhatsapp: "081234567823", email: "ahmad.f@gmail.com", status: "Diterima", instansi: "Universitas Negeri Yogyakarta" },
      { id: 6, tanggal: "9 Dec 2022", nama: "Lisa Permatasari", noWhatsapp: "081234567824", email: "lisa.p@gmail.com", status: "Pending", instansi: "Universitas Ahmad Dahlan" },
      { id: 7, tanggal: "8 Dec 2022", nama: "Bayu Firmansyah", noWhatsapp: "081234567825", email: "bayu.f@gmail.com", status: "Diterima", instansi: "Politeknik Negeri Yogyakarta" },
      { id: 8, tanggal: "7 Dec 2022", nama: "Anisa Nuraini", noWhatsapp: "081234567826", email: "anisa.n@gmail.com", status: "Diterima", instansi: "Universitas PGRI Yogyakarta" },
      { id: 9, tanggal: "6 Dec 2022", nama: "Dimas Ardiansyah", noWhatsapp: "081234567827", email: "dimas.a@gmail.com", status: "Pending", instansi: "Universitas Mercu Buana" },
      { id: 10, tanggal: "5 Dec 2022", nama: "Ratri Kusuma", noWhatsapp: "081234567828", email: "ratri.k@gmail.com", status: "Ditolak", instansi: "Universitas Atma Jaya" },
    ],
  },
  "semesta-camp-8-bandung": {
    id: "semesta-camp-8-bandung",
    nama: "Semesta Camp #8 Bandung",
    deskripsi: "Program kemanusiaan terbaik untuk paravolunteer Indonesia",
    pendaftar: [
      { id: 1, tanggal: "12 Dec 2022", nama: "Budi Santoso", noWhatsapp: "081234567892", email: "budi.santoso@gmail.com", status: "Pending", instansi: "Institut Teknologi Bandung" },
      { id: 2, tanggal: "11 Dec 2022", nama: "Rina Marlina", noWhatsapp: "081234567829", email: "rina.m@gmail.com", status: "Diterima", instansi: "Universitas Padjadjaran" },
      { id: 3, tanggal: "10 Dec 2022", nama: "Haris局", noWhatsapp: "081234567830", email: "haris.h@gmail.com", status: "Pending", instansi: "Politeknik Negeri Bandung" },
      { id: 4, tanggal: "9 Dec 2022", nama: "Mila Kumala", noWhatsapp: "081234567831", email: "mila.k@gmail.com", status: "Ditolak", instansi: "Universitas Parahyangan" },
      { id: 5, tanggal: "8 Dec 2022", nama: "Arif Rahman", noWhatsapp: "081234567832", email: "arif.r@gmail.com", status: "Diterima", instansi: "Universitas Islam Bandung" },
      { id: 6, tanggal: "7 Dec 2022", nama: "Sari Wulandari", noWhatsapp: "081234567833", email: "sari.w@gmail.com", status: "Pending", instansi: "Universitas Widyatama" },
      { id: 7, tanggal: "6 Dec 2022", nama: "Fajar Hidayat", noWhatsapp: "081234567834", email: "fajar.h@gmail.com", status: "Diterima", instansi: "Politeknik Negeri Bandung" },
      { id: 8, tanggal: "5 Dec 2022", nama: "Dina Kartika", noWhatsapp: "081234567835", email: "dina.k@gmail.com", status: "Diterima", instansi: "Universitas Marlan" },
      { id: 9, tanggal: "4 Dec 2022", nama: "Rizki Ramadhan", noWhatsapp: "081234567836", email: "rizki.r@gmail.com", status: "Pending", instansi: "Universitas Pasundan" },
      { id: 10, tanggal: "3 Dec 2022", nama: "Yuni Susilowati", noWhatsapp: "081234567837", email: "yuni.s@gmail.com", status: "Ditolak", instansi: "Universitas Buana Perjuangan" },
    ],
  },
  "semesta-camp-7-surabaya": {
    id: "semesta-camp-7-surabaya",
    nama: "Semesta Camp #7 Surabaya",
    deskripsi: "Program kemanusiaan terbaik untuk paravolunteer Indonesia",
    pendaftar: [
      { id: 1, tanggal: "7 Dec 2022", nama: "Dewi Lestari", noWhatsapp: "081234567893", email: "dewi.lestari@gmail.com", status: "Pending", instansi: "Universitas Airlangg" },
      { id: 2, tanggal: "6 Dec 2022", nama: "Ahmad Zaini", noWhatsapp: "081234567838", email: "ahmad.z@gmail.com", status: "Diterima", instansi: "Institut Teknologi Sepuluh Nopember" },
      { id: 3, tanggal: "5 Dec 2022", nama: "Rita Susilowati", noWhatsapp: "081234567839", email: "rita.s@gmail.com", status: "Pending", instansi: "Universitas Surabaya" },
      { id: 4, tanggal: "4 Dec 2022", nama: "Fauzi Rahman", noWhatsapp: "081234567840", email: "fauzi.r@gmail.com", status: "Ditolak", instansi: "Politeknik Negeri Surabaya" },
      { id: 5, tanggal: "3 Dec 2022", nama: "Lina Rohmah", noWhatsapp: "081234567841", email: "lina.r@gmail.com", status: "Diterima", instansi: "Universitas Muhammadiyah Surabaya" },
      { id: 6, tanggal: "2 Dec 2022", nama: "Dony Firmansyah", noWhatsapp: "081234567842", email: "dony.f@gmail.com", status: "Pending", instansi: "Universitas Katolik Widya Mandala" },
      { id: 7, tanggal: "1 Dec 2022", nama: "Mega Ardianti", noWhatsapp: "081234567843", email: "mega.a@gmail.com", status: "Diterima", instansi: "Universitas Dr. Soetomo" },
      { id: 8, tanggal: "30 Nov 2022", nama: "Bayu Setiawan", noWhatsapp: "081234567844", email: "bayu.set@gmail.com", status: "Diterima", instansi: "Politeknik Perkapalan Negeri" },
      { id: 9, tanggal: "29 Nov 2022", nama: "Yanti Kusuma", noWhatsapp: "081234567845", email: "yanti.k@gmail.com", status: "Pending", instansi: "Universitas Wijaya Kusuma" },
      { id: 10, tanggal: "28 Nov 2022", nama: "Rudi Hermawan", noWhatsapp: "081234567846", email: "rudi.h@gmail.com", status: "Ditolak", instansi: "Universitas Katolik Laurentius" },
    ],
  },
  "semesta-camp-6-medan": {
    id: "semesta-camp-6-medan",
    nama: "Semesta Camp #6 Medan",
    deskripsi: "Program kemanusiaan terbaik untuk paravolunteer Indonesia",
    pendaftar: [
      { id: 1, tanggal: "3 Dec 2022", nama: "Reza Firmansyah", noWhatsapp: "081234567894", email: "reza.f@gmail.com", status: "Pending", instansi: "Universitas Sumatera Utara" },
      { id: 2, tanggal: "2 Dec 2022", nama: "Sari Aminah", noWhatsapp: "081234567847", email: "sari.a@gmail.com", status: "Diterima", instansi: "Institut Teknologi Medan" },
      { id: 3, tanggal: "1 Dec 2022", nama: "Bobby Wijaya", noWhatsapp: "081234567848", email: "bobby.w@gmail.com", status: "Pending", instansi: "Universitas Negeri Medan" },
      { id: 4, tanggal: "30 Nov 2022", nama: "Mila Susilowati", noWhatsapp: "081234567849", email: "mila.s@gmail.com", status: "Ditolak", instansi: "Politeknik Negeri Medan" },
      { id: 5, tanggal: "29 Nov 2022", nama: "Fahmi Ramadhan", noWhatsapp: "081234567850", email: "fahmi.r@gmail.com", status: "Diterima", instansi: "Universitas Islam Sumatera Utara" },
      { id: 6, tanggal: "28 Nov 2022", nama: "Nadya Safitri", noWhatsapp: "081234567851", email: "nadya.s@gmail.com", status: "Pending", instansi: "Universitas Muhammadiyah Sumatera" },
      { id: 7, tanggal: "27 Nov 2022", nama: "Agus Pratama", noWhatsapp: "081234567852", email: "agus.p@gmail.com", status: "Diterima", instansi: "Universitas HKBP Nommensen" },
      { id: 8, tanggal: "26 Nov 2022", nama: "Fitri Rahmawati", noWhatsapp: "081234567853", email: "fitri.r@gmail.com", status: "Diterima", instansi: "Universitas Prima Indonesia" },
      { id: 9, tanggal: "25 Nov 2022", nama: "Dimas Saputra", noWhatsapp: "081234567854", email: "dimas.s@gmail.com", status: "Pending", instansi: "Politeknik Negeri Medan" },
      { id: 10, tanggal: "24 Nov 2022", nama: "Rini Andriani", noWhatsapp: "081234567855", email: "rini.and@gmail.com", status: "Ditolak", instansi: "Universitas Pembangunan Panca Budi" },
    ],
  },
  "semesta-camp-5-makassar": {
    id: "semesta-camp-5-makassar",
    nama: "Semesta Camp #5 Makassar",
    deskripsi: "Program kemanusiaan terbaik untuk paravolunteer Indonesia",
    pendaftar: [
      { id: 1, tanggal: "26 Nov 2022", nama: "Nadia Putri", noWhatsapp: "081234567895", email: "nadia.p@gmail.com", status: "Pending", instansi: "Universitas Hasanuddin" },
      { id: 2, tanggal: "25 Nov 2022", nama: "Irwan Basri", noWhatsapp: "081234567856", email: "irwan.b@gmail.com", status: "Diterima", instansi: "Universitas Negeri Makassar" },
      { id: 3, tanggal: "24 Nov 2022", nama: "Yuniarti", noWhatsapp: "081234567857", email: "yuni.a@gmail.com", status: "Pending", instansi: "Politeknik Negeri Makassar" },
      { id: 4, tanggal: "23 Nov 2022", nama: "Ruslan Abdullah", noWhatsapp: "081234567858", email: "ruslan.a@gmail.com", status: "Ditolak", instansi: "Universitas Islam Negeri Alauddin" },
      { id: 5, tanggal: "22 Nov 2022", nama: "Sukmawati", noWhatsapp: "081234567859", email: "sukma.w@gmail.com", status: "Diterima", instansi: "Universitas Muslim Indonesia" },
      { id: 6, tanggal: "21 Nov 2022", nama: "Jusuf Ahmad", noWhatsapp: "081234567860", email: "jusuf.ahmad@gmail.com", status: "Pending", instansi: "Universitasbosow" },
      { id: 7, tanggal: "20 Nov 2022", nama: "Nur Hasanah", noWhatsapp: "081234567861", email: "nur.h@gmail.com", status: "Diterima", instansi: "Politeknik Negeri Ujung Pandang" },
      { id: 8, tanggal: "19 Nov 2022", nama: "Mahmud Yusuf", noWhatsapp: "081234567862", email: "mahmud.y@gmail.com", status: "Diterima", instansi: "Universitas Fajar" },
      { id: 9, tanggal: "18 Nov 2022", nama: "Aisyah Putri", noWhatsapp: "081234567863", email: "aisyah.p@gmail.com", status: "Pending", instansi: "Universitas Hassanuddin" },
      { id: 10, tanggal: "17 Nov 2022", nama: "Bahri Tahir", noWhatsapp: "081234567864", email: "bahri.t@gmail.com", status: "Ditolak", instansi: "Universitas Patria Artha" },
    ],
  },
  "semesta-camp-4-semarang": {
    id: "semesta-camp-4-semarang",
    nama: "Semesta Camp #4 Semarang",
    deskripsi: "Program kemanusiaan terbaik untuk paravolunteer Indonesia",
    pendaftar: [
      { id: 1, tanggal: "18 Nov 2022", nama: "Fajar Nugroho", noWhatsapp: "081234567896", email: "fajar.n@gmail.com", status: "Pending", instansi: "Universitas Diponegoro" },
      { id: 2, tanggal: "17 Nov 2022", nama: "Putri Ardiani", noWhatsapp: "081234567865", email: "putri.a@gmail.com", status: "Diterima", instansi: "Universitas Negeri Semarang" },
      { id: 3, tanggal: "16 Nov 2022", nama: "Hakim Setiawan", noWhatsapp: "081234567866", email: "hakim.s@gmail.com", status: "Pending", instansi: "Politeknik Negeri Semarang" },
      { id: 4, tanggal: "15 Nov 2022", nama: "Siti Nurhaliza", noWhatsapp: "081234567867", email: "siti.n@gmail.com", status: "Ditolak", instansi: "Universitas Islam Sultan Agung" },
      { id: 5, tanggal: "14 Nov 2022", nama: "Bagas Wicaksono", noWhatsapp: "081234567868", email: "bagas.w@gmail.com", status: "Diterima", instansi: "Universitas Katolik Soegijapranoto" },
      { id: 6, tanggal: "13 Nov 2022", nama: "Ratri Oktaviani", noWhatsapp: "081234567869", email: "ratri.o@gmail.com", status: "Pending", instansi: "Universitas Muhammadiyah Semarang" },
      { id: 7, tanggal: "12 Nov 2022", nama: "Denny Prasetyo", noWhatsapp: "081234567870", email: "denny.p@gmail.com", status: "Diterima", instansi: "Politeknik Negeri Semarang" },
      { id: 8, tanggal: "11 Nov 2022", nama: "Anisa Fitria", noWhatsapp: "081234567871", email: "anisa.f@gmail.com", status: "Diterima", instansi: "Universitas Veteran Bangun Nusantara" },
      { id: 9, tanggal: "10 Nov 2022", nama: "Galang Ramadan", noWhatsapp: "081234567872", email: "galang.r@gmail.com", status: "Pending", instansi: "Universitas Dian Nuswantoro" },
      { id: 10, tanggal: "9 Nov 2022", nama: "Niken Wardani", noWhatsapp: "081234567873", email: "niken.w@gmail.com", status: "Ditolak", instansi: "Universitas Ngudi Waluyo" },
    ],
  },
  "semesta-camp-3-jakarta": {
    id: "semesta-camp-3-jakarta",
    nama: "Semesta Camp #3 Jakarta",
    deskripsi: "Program kemanusiaan terbaik untuk paravolunteer Indonesia",
    pendaftar: [
      { id: 1, tanggal: "13 Nov 2022", nama: "Ayu Rahayu", noWhatsapp: "081234567897", email: "ayu.r@gmail.com", status: "Pending", instansi: "Universitas Indonesia" },
      { id: 2, tanggal: "12 Nov 2022", nama: "Hendra Gunawan", noWhatsapp: "081234567874", email: "hendra.g@gmail.com", status: "Diterima", instansi: "Universitas Trisakti" },
      { id: 3, tanggal: "11 Nov 2022", nama: "Reni Marlina", noWhatsapp: "081234567875", email: "reni.m@gmail.com", status: "Pending", instansi: "Universitas Mercu Buana" },
      { id: 4, tanggal: "10 Nov 2022", nama: "Dadan Supriatna", noWhatsapp: "081234567876", email: "dadan.s@gmail.com", status: "Ditolak", instansi: "Universitas Pelita Harapan" },
      { id: 5, tanggal: "9 Nov 2022", nama: "Lisa Amelia", noWhatsapp: "081234567877", email: "lisa.e@gmail.com", status: "Diterima", instansi: "Universitas Atma Jaya" },
      { id: 6, tanggal: "8 Nov 2022", nama: "Taufik Hidayat", noWhatsapp: "081234567878", email: "taufik.h@gmail.com", status: "Pending", instansi: "Universitas Jayabaya" },
      { id: 7, tanggal: "7 Nov 2022", nama: "Mila Gunawan", noWhatsapp: "081234567879", email: "mila.g@gmail.com", status: "Diterima", instansi: "Politeknik Negeri Jakarta" },
      { id: 8, tanggal: "6 Nov 2022", nama: "Rudianto", noWhatsapp: "081234567880", email: "rudianto@gmail.com", status: "Diterima", instansi: "Universitas Budi Luhur" },
      { id: 9, tanggal: "5 Nov 2022", nama: "Fitriani", noWhatsapp: "081234567881", email: "fitri.a@gmail.com", status: "Pending", instansi: "Universitas Islam Indonesia" },
      { id: 10, tanggal: "4 Nov 2022", nama: "Ardi Yunus", noWhatsapp: "081234567882", email: "ardi.y@gmail.com", status: "Ditolak", instansi: "Universitas Bakrie" },
    ],
  },
  "semesta-camp-2-bali": {
    id: "semesta-camp-2-bali",
    nama: "Semesta Camp #2 Bali",
    deskripsi: "Program kemanusiaan terbaik untuk paravolunteer Indonesia",
    pendaftar: [
      { id: 1, tanggal: "11 Nov 2022", nama: "Rizky Maulana", noWhatsapp: "081234567898", email: "rizky.m@gmail.com", status: "Pending", instansi: "Universitas Udayana" },
      { id: 2, tanggal: "10 Nov 2022", nama: "Kadek Sri", noWhatsapp: "081234567883", email: "kadek.s@gmail.com", status: "Diterima", instansi: "Universitas Ngurah Rai" },
      { id: 3, tanggal: "9 Nov 2022", nama: "Made Surya", noWhatsapp: "081234567884", email: "made.s@gmail.com", status: "Pending", instansi: "Politeknik Negeri Bali" },
      { id: 4, tanggal: "8 Nov 2022", nama: "Nyoman Parta", noWhatsapp: "081234567885", email: "nyoman.p@gmail.com", status: "Ditolak", instansi: "Universitas Dwijendra" },
      { id: 5, tanggal: "7 Nov 2022", nama: "Ketut Budi", noWhatsapp: "081234567886", email: "ketut.b@gmail.com", status: "Diterima", instansi: "Universitas Mahasaraswati" },
      { id: 6, tanggal: "6 Nov 2022", nama: "Ayu Lestari", noWhatsapp: "081234567887", email: "ayu.l@gmail.com", status: "Pending", instansi: "Universitas Pendidikan Ganesha" },
      { id: 7, tanggal: "5 Nov 2022", nama: "Komang Jaya", noWhatsapp: "081234567888", email: "komang.j@gmail.com", status: "Diterima", instansi: "Politeknik Negeri Bali" },
      { id: 8, tanggal: "4 Nov 2022", nama: "Luh Putu", noWhatsapp: "081234567889", email: "luh.putu@gmail.com", status: "Diterima", instansi: "Universitas Hindu Indonesia" },
      { id: 9, tanggal: "3 Nov 2022", nama: "I Gusti Ayu", noWhatsapp: "081234567890", email: "gustiayu@gmail.com", status: "Pending", instansi: "Universitas Ngurah Rai" },
      { id: 10, tanggal: "2 Nov 2022", nama: "Wayan Sudarma", noWhatsapp: "081234567891", email: "wayan.s@gmail.com", status: "Ditolak", instansi: "Universitas Bali International" },
    ],
  },
  "semesta-camp-1-jakarta": {
    id: "semesta-camp-1-jakarta",
    nama: "Semesta Camp #1 Jakarta",
    deskripsi: "Program kemanusiaan terbaik untuk paravolunteer Indonesia",
    pendaftar: [
      { id: 1, tanggal: "9 Nov 2022", nama: "Intan Permata", noWhatsapp: "081234567899", email: "intan.p@gmail.com", status: "Pending", instansi: "Universitas Indonesia" },
      { id: 2, tanggal: "8 Nov 2022", nama: "Galang Firmansyah", noWhatsapp: "081234567892", email: "galang.f@gmail.com", status: "Diterima", instansi: "Universitas Trisakti" },
      { id: 3, tanggal: "7 Nov 2022", nama: "Dewi Kartika", noWhatsapp: "081234567893", email: "dewi.k@gmail.com", status: "Pending", instansi: "Universitas Mercu Buana" },
      { id: 4, tanggal: "6 Nov 2022", nama: "Rizky Pratama", noWhatsapp: "081234567894", email: "rizky.pratama@gmail.com", status: "Ditolak", instansi: "Universitas Pelita Harapan" },
      { id: 5, tanggal: "5 Nov 2022", nama: "Mira Susanti", noWhatsapp: "081234567895", email: "mira.s@gmail.com", status: "Diterima", instansi: "Universitas Atma Jaya" },
      { id: 6, tanggal: "4 Nov 2022", nama: "Fajar Wicaksono", noWhatsapp: "081234567896", email: "fajar.w@gmail.com", status: "Pending", instansi: "Universitas Jayabaya" },
      { id: 7, tanggal: "3 Nov 2022", nama: "Anisa Nurul", noWhatsapp: "081234567897", email: "anisa.n@gmail.com", status: "Diterima", instansi: "Politeknik Negeri Jakarta" },
      { id: 8, tanggal: "2 Nov 2022", nama: "Bagus Prakoso", noWhatsapp: "081234567898", email: "bagus.p@gmail.com", status: "Diterima", instansi: "Universitas Budi Luhur" },
      { id: 9, tanggal: "1 Nov 2022", nama: "Sari Devi", noWhatsapp: "081234567899", email: "sari.d@gmail.com", status: "Pending", instansi: "Universitas Islam Indonesia" },
      { id: 10, tanggal: "31 Oct 2022", nama: "Yusuf Ardiansyah", noWhatsapp: "081234567900", email: "yusuf.a@gmail.com", status: "Ditolak", instansi: "Universitas Bakrie" },
    ],
  },
};

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 14, height: 14, flexShrink: 0 }}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const getStatusBadgeClass = (status) => {
  if (status === "Diterima") return styles.badgeDiterima;
  if (status === "Ditolak") return styles.badgeDitolak;
  return styles.badgePending;
};

export default function SemestaCampDetailPage({ params }) {
  const resolvedParams = use(params);
  const programId = resolvedParams.id;
  const router = useRouter();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [sortBy, setSortBy] = useState(null); // "terbaru" | "terlama" | "nama-az" | "nama-za"
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [pendaftar, setPendaftar] = useState(null);
  const filterDropdownRef = useRef(null);
  const sortDropdownRef = useRef(null);

  useEffect(() => {
    if (programId && programData[programId]) {
      setPendaftar(programData[programId].pendaftar);
    }
  }, [programId]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(e.target)) {
        setFilterDropdownOpen(false);
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target)) {
        setSortDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const program = programId ? programData[programId] : null;

  const filteredPendaftar = useMemo(() => {
    if (!pendaftar) return [];
    let result = [...pendaftar];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.nama.toLowerCase().includes(query) ||
          p.email.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== "Semua") {
      result = result.filter((p) => p.status === statusFilter);
    }

    if (sortBy === "terbaru") {
      result.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
    } else if (sortBy === "terlama") {
      result.sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));
    } else if (sortBy === "nama-az") {
      result.sort((a, b) => a.nama.localeCompare(b.nama, "id", { sensitivity: "base" }));
    } else if (sortBy === "nama-za") {
      result.sort((a, b) => b.nama.localeCompare(a.nama, "id", { sensitivity: "base" }));
    }

    return result;
  }, [pendaftar, searchQuery, statusFilter, sortBy]);

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredPendaftar.length / itemsPerPage);
  const paginatedPendaftar = filteredPendaftar.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleSelectAll = () => {
    if (selectedRows.length === paginatedPendaftar.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(paginatedPendaftar.map((p) => p.id));
    }
  };

  const toggleSelectRow = (id) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const toggleDropdown = (id) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  const handleTerima = (id) => {
    setPendaftar((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "Diterima" } : p))
    );
    setActiveDropdown(null);
  };

  const handleTolak = (id) => {
    setPendaftar((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "Ditolak" } : p))
    );
    setActiveDropdown(null);
  };

  if (!program) {
    return (
      <div className={styles.pageLayout}>
        <AdminSidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
        <main className={`${styles.mainContent} ${isSidebarCollapsed ? styles.expanded : ""}`}>
          <div className={styles.notFound}>
            <h2>Program tidak ditemukan</h2>
            <Link href="/admin/semesta-camp" className={styles.backLinkError}>
              ← Kembali ke Daftar Program
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.pageLayout}>
      <AdminSidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <main className={`${styles.mainContent} ${isSidebarCollapsed ? styles.expanded : ""}`}>
        {/* Header */}
        <div className={styles.contentHeader}>
          <div className={styles.headerTop}>
            <Link href="/admin/semesta-camp" className={styles.backButton}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </Link>
          </div>
          <div className={styles.headerText}>
            <h1 className={styles.pageTitle}>{program.nama}</h1>
            <p className={styles.pageSubtitle}>{program.deskripsi}</p>
          </div>
        </div>

        {/* Table Card */}
        <div className={styles.tableCard}>
          {/* Card Header */}
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Pendaftar Program</h2>
          </div>

          {/* Search & Filter Bar */}
          <div className={styles.searchFilterBar}>
            <div className={styles.searchWrapper}>
              <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <div className={styles.filterButtons}>
              {/* Filter Dropdown */}
              <div className={styles.filterDropdown} ref={filterDropdownRef}>
                <button
                  className={`${styles.filterBtn} ${statusFilter !== "Semua" ? styles.filterBtnActive : ""}`}
                  onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                  </svg>
                  Filter
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14, transform: filterDropdownOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                {filterDropdownOpen && (
                  <div className={styles.filterDropdownMenu}>
                    <button
                      className={`${styles.filterDropdownItem} ${statusFilter === "Semua" ? styles.filterDropdownItemActive : ""}`}
                      onClick={() => { setStatusFilter("Semua"); setFilterDropdownOpen(false); setCurrentPage(1); }}
                    >
                      {statusFilter === "Semua" && <CheckIcon />}
                      Semua
                    </button>
                    <button
                      className={`${styles.filterDropdownItem} ${statusFilter === "Pending" ? styles.filterDropdownItemActive : ""}`}
                      onClick={() => { setStatusFilter("Pending"); setFilterDropdownOpen(false); setCurrentPage(1); }}
                    >
                      {statusFilter === "Pending" && <CheckIcon />}
                      Pending
                    </button>
                    <button
                      className={`${styles.filterDropdownItem} ${statusFilter === "Diterima" ? styles.filterDropdownItemActive : ""}`}
                      onClick={() => { setStatusFilter("Diterima"); setFilterDropdownOpen(false); setCurrentPage(1); }}
                    >
                      {statusFilter === "Diterima" && <CheckIcon />}
                      Diterima
                    </button>
                    <button
                      className={`${styles.filterDropdownItem} ${statusFilter === "Ditolak" ? styles.filterDropdownItemActive : ""}`}
                      onClick={() => { setStatusFilter("Ditolak"); setFilterDropdownOpen(false); setCurrentPage(1); }}
                    >
                      {statusFilter === "Ditolak" && <CheckIcon />}
                      Ditolak
                    </button>
                  </div>
                )}
              </div>

              {/* Sort Dropdown */}
              <div className={styles.filterDropdown} ref={sortDropdownRef}>
                <button
                  className={`${styles.filterBtn} ${sortBy !== null ? styles.filterBtnActive : ""}`}
                  onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="4" y1="6" x2="16" y2="6" />
                    <line x1="4" y1="12" x2="12" y2="12" />
                    <line x1="4" y1="18" x2="8" y2="18" />
                  </svg>
                  Urutkan
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14, transform: sortDropdownOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                {sortDropdownOpen && (
                  <div className={styles.filterDropdownMenu}>
                    <button
                      className={`${styles.filterDropdownItem} ${sortBy === "terbaru" ? styles.filterDropdownItemActive : ""}`}
                      onClick={() => { setSortBy("terbaru"); setSortDropdownOpen(false); setCurrentPage(1); }}
                    >
                      {sortBy === "terbaru" && <CheckIcon />}
                      Terbaru
                    </button>
                    <button
                      className={`${styles.filterDropdownItem} ${sortBy === "terlama" ? styles.filterDropdownItemActive : ""}`}
                      onClick={() => { setSortBy("terlama"); setSortDropdownOpen(false); setCurrentPage(1); }}
                    >
                      {sortBy === "terlama" && <CheckIcon />}
                      Terlama
                    </button>
                    <button
                      className={`${styles.filterDropdownItem} ${sortBy === "nama-az" ? styles.filterDropdownItemActive : ""}`}
                      onClick={() => { setSortBy("nama-az"); setSortDropdownOpen(false); setCurrentPage(1); }}
                    >
                      {sortBy === "nama-az" && <CheckIcon />}
                      Nama A → Z
                    </button>
                    <button
                      className={`${styles.filterDropdownItem} ${sortBy === "nama-za" ? styles.filterDropdownItemActive : ""}`}
                      onClick={() => { setSortBy("nama-za"); setSortDropdownOpen(false); setCurrentPage(1); }}
                    >
                      {sortBy === "nama-za" && <CheckIcon />}
                      Nama Z → A
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.checkboxCell}>
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      checked={selectedRows.length === paginatedPendaftar.length && paginatedPendaftar.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th>Tanggal</th>
                  <th>Nama</th>
                  <th>Nomor WhatsApp</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Asal Instansi</th>
                  <th>Aksi</th>
                  <th>Opsi</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPendaftar.map((p) => (
                  <tr
                    key={p.id}
                    className={`${styles.tableRow} ${selectedRows.includes(p.id) ? styles.selected : ""}`}
                  >
                    <td className={styles.checkboxCell}>
                      <input
                        type="checkbox"
                        className={styles.checkbox}
                        checked={selectedRows.includes(p.id)}
                        onChange={() => toggleSelectRow(p.id)}
                      />
                    </td>
                    <td className={styles.dateCell}>{p.tanggal}</td>
                    <td className={styles.nameCell}>{p.nama}</td>
                    <td className={styles.linkCell}>
                      <a
                        href={`https://wa.me/${p.noWhatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.linkText}
                      >
                        {p.noWhatsapp}
                      </a>
                    </td>
                    <td className={styles.linkCell}>
                      <a
                        href={`mailto:${p.email}`}
                        className={styles.linkText}
                      >
                        {p.email}
                      </a>
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${getStatusBadgeClass(p.status)}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className={styles.instansiCell}>
                      <span className={styles.instansiText}>{p.instansi}</span>
                    </td>
                    <td>
                      <button
                        className={styles.viewButton}
                        onClick={() => router.push(`/admin/semesta-camp/${programId}/pendaftar/${p.id}`)}
                      >
                        Lihat
                      </button>
                    </td>
                    <td className={styles.optionsCell}>
                      <button
                        className={styles.optionsButton}
                        onClick={() => toggleDropdown(p.id)}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="5" r="1" />
                          <circle cx="12" cy="12" r="1" />
                          <circle cx="12" cy="19" r="1" />
                        </svg>
                      </button>
                      {activeDropdown === p.id && (
                        <div className={styles.optionsDropdown}>
                          <button
                            className={styles.dropdownItem}
                            onClick={() => handleTerima(p.id)}
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Terima
                          </button>
                          <button
                            className={styles.dropdownItem}
                            onClick={() => handleTolak(p.id)}
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                            Tolak
                          </button>
                          <button className={`${styles.dropdownItem} ${styles.deleteItem}`}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                            </svg>
                            Hapus
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className={styles.pagination}>
            <span className={styles.paginationInfo}>
              {filteredPendaftar.length > 0
                ? `${(currentPage - 1) * itemsPerPage + 1} - ${Math.min(currentPage * itemsPerPage, filteredPendaftar.length)} dari ${filteredPendaftar.length}`
                : "0 dari 0"}
            </span>
            <div className={styles.paginationButtons}>
              <button
                className={styles.paginationButton}
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button
                className={styles.paginationButton}
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}