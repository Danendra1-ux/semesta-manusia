"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import AdminSidebar from "../../../../components/AdminSidebar.jsx";
import styles from "./page.module.css";

export default function SJNPendaftarDetailPage({ params }) {
  const resolvedParams = use(params);
  const programId = resolvedParams.id;
  const pendaftarId = resolvedParams.pendaftarId ? parseInt(resolvedParams.pendaftarId) : null;
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Dummy pendaftar data — matches SJN registration form fields
  const pendaftarData = {
    "sjn-4-raja-ampat": [
      { id: 1, tanggal: "3 Jan 2026", tipe: "Fully Funded", fullName: "Bagas Prasetyo", email: "bagas.prasetyo@gmail.com", whatsapp: "081298765432", instagram: "@bagasprasetyo", birthDate: "15 Mar 2000", region: "Depok, Jawa Barat", institution: "Universitas Indonesia", whyJoin: "Saya ingin berkontribusi langsung dalam program pendidikan di daerah kepulauan terpencil seperti Raja Ampat, sekaligus belajar tentang konservasi laut dan budaya masyarakat pesisir yang sangat kaya.", divisionChoice: "pendidikan-literasi", divisionReason: "Saya aktif mengajar di komunitas literasi selama 2 tahun terakhir dan percaya pendidikan adalah fondasi perubahan berkelanjutan, terutama untuk anak-anak pesisir.", programProposal: "Membentuk perpustakaan keliling berbasis perahu tradisional yang melayani 3 desa di Raja Ampat, dilengkapi dengan modul konservasi laut dan budaya lokal.", hopes: "Harapan saya, program ini bisa menjadi titik awal kolaborasi jangka panjang antara mahasiswa dan masyarakat Raja Ampat, serta menginspirasi lebih banyak teman untuk peduli terhadap pendidikan di Indonesia Timur.", status: "Pending", berkas: { instagramProof: { name: "follow_ig_bagas.jpg", size: "245 KB" }, tiktokProof: { name: "follow_tiktok_bagas.jpg", size: "198 KB" }, storyProof: { name: "story_ig_bagas.jpg", size: "312 KB" }, paymentProof: { name: "bukti_bayar_bagas.jpg", size: "187 KB" } } },
      { id: 2, tanggal: "28 Des 2025", tipe: "Fully Funded", fullName: "Layla Nuraini", email: "layla.nuraini@gmail.com", whatsapp: "082134567891", instagram: "@laylanuraini", birthDate: "22 Jul 1999", region: "Bandung, Jawa Barat", institution: "Institut Teknologi Bandung", whyJoin: "Saya passionate dalam kegiatan kesehatan masyarakat dan ingin belajar langsung bagaimana pelayanan kesehatan dilakukan di daerah dengan akses terbatas seperti Raja Ampat.", divisionChoice: "konservasi-lingkungan", divisionReason: "Latar belakang saya di bidang lingkungan hidup membuat saya ingin berkontribusi dalam menjaga kelestarian Raja Ampat sebagai surga biodiversitas laut dunia.", programProposal: "Program edukasi kesehatan lingkungan berbasis masyarakat, mencakup pengelolaan sampah plastik pesisir, water sanitation, dan pelatihan kader kesehatan lokal.", hopes: "Saya berharap bisa membawa pulang pelajaran berharga tentang harmoni antara manusia dan alam, serta mengaplikasikannya di komunitas tempat saya tinggal.", status: "Diterima", berkas: { instagramProof: { name: "follow_ig_layla.jpg", size: "252 KB" }, tiktokProof: { name: "follow_tiktok_layla.jpg", size: "210 KB" }, storyProof: { name: "story_ig_layla.jpg", size: "298 KB" }, paymentProof: { name: "bukti_bayar_layla.jpg", size: "195 KB" } } },
      { id: 3, tanggal: "25 Des 2025", tipe: "Self Funded", fullName: "Wahyu Hidayat", email: "wahyu.hidayat@gmail.com", whatsapp: "083145678902", instagram: "@wahyuhidayat", birthDate: "10 Sep 1998", region: "Sleman, Yogyakarta", institution: "Universitas Gadjah Mada", whyJoin: "Saya memiliki pengalaman dalam konservasi terumbu karang melalui program KKN sebelumnya dan ingin melanjutkan kontribusi di Raja Ampat.", divisionChoice: "konservasi-lingkungan", divisionReason: "Bidang ini adalah passion saya sejak kuliah, dan Raja Ampat adalah laboratorium alam terbaik untuk belajar tentang konservasi laut.", programProposal: "Mapping terumbu karang bersama masyarakat lokal dan pembuatan zona konservasi berbasis kearifan lokal Suku Moi.", hopes: "Semoga keterlibatan saya bisa membantu memperkuat upaya konservasi yang sudah berjalan dan memberikan dampak ekonomi melalui ekowisata.", status: "Ditolak", berkas: { instagramProof: { name: "follow_ig_wahyu.jpg", size: "230 KB" }, tiktokProof: { name: "follow_tiktok_wahyu.jpg", size: "188 KB" }, storyProof: { name: "story_ig_wahyu.jpg", size: "276 KB" }, paymentProof: { name: "bukti_bayar_wahyu.jpg", size: "203 KB" } } },
      { id: 4, tanggal: "20 Des 2025", tipe: "Fully Funded", fullName: "Putri Anggraini", email: "putri.anggraini@gmail.com", whatsapp: "084156789013", instagram: "@putrianggraini", birthDate: "5 Mei 2001", region: "Malang, Jawa Timur", institution: "Universitas Brawijaya", whyJoin: "Saya ingin mendokumentasikan keindahan Raja Ampat dan kegiatan sosial untuk publikasi yang lebih luas agar masyarakat Indonesia lebih mengenal nusantara.", divisionChoice: "dokumentasi-komunikasi", divisionReason: "Saya hobi fotografi dan videografi, serta aktif mengelola media sosial komunitas kampus. Saya ingin mengabadikan cerita-cerita inspiratif di Raja Ampat.", programProposal: "Produksi mini dokumenter 5 episode tentang kehidupan masyarakat dan keindahan alam Raja Ampat, disebarluaskan melalui YouTube dan Instagram.", hopes: "Saya berharap dokumentasi ini bisa menjadi sarana promosi potensi wisata budaya dan alam Indonesia, sekaligus menginspirasi generasi muda untuk berkunjung.", status: "Pending", berkas: { instagramProof: { name: "follow_ig_putri.jpg", size: "267 KB" }, tiktokProof: { name: "follow_tiktok_putri.jpg", size: "221 KB" }, storyProof: { name: "story_ig_putri.jpg", size: "305 KB" }, paymentProof: { name: "bukti_bayar_putri.jpg", size: "192 KB" } } },
      { id: 5, tanggal: "15 Des 2025", tipe: "Self Funded", fullName: "Dimas Saputra", email: "dimas.saputra@gmail.com", whatsapp: "085167890124", instagram: "@dimassaputra", birthDate: "18 Agt 2000", region: "Surabaya, Jawa Timur", institution: "Universitas Airlangga", whyJoin: "Saya berpengalaman mengajar anak-anak di panti asuhan dan ingin menerapkan kemampuan itu di daerah yang lebih membutuhkan seperti Raja Ampat.", divisionChoice: "pendidikan-literasi", divisionReason: "Saya percaya setiap anak berhak mendapatkan pendidikan berkualitas, termasuk anak-anak di pelosok nusantara.", programProposal: "Kelas tambahan untuk anak-anak SD di 2 desa di Raja Ampat, fokus pada literasi membaca, matematika dasar, dan bahasa Inggris percakapan.", hopes: "Semoga kegiatan ini bisa menjadi pemantik semangat belajar bagi anak-anak dan membuka peluang kolaborasi pendidikan lanjutan.", status: "Pending", berkas: { instagramProof: { name: "follow_ig_dimas.jpg", size: "241 KB" }, tiktokProof: { name: "follow_tiktok_dimas.jpg", size: "194 KB" }, storyProof: { name: "story_ig_dimas.jpg", size: "288 KB" }, paymentProof: { name: "bukti_bayar_dimas.jpg", size: "178 KB" } } },
      { id: 6, tanggal: "10 Des 2025", tipe: "Fully Funded", fullName: "Aulia Rahma", email: "aulia.rahma@gmail.com", whatsapp: "086178901235", instagram: "@auliarahma", birthDate: "30 Nov 1999", region: "Semarang, Jawa Tengah", institution: "Universitas Diponegoro", whyJoin: "Saya dedicated untuk meningkatkan kesehatan masyarakat pesisir dan pulau-pulau terpencil, sekaligus belajar tentang tantangan geografis di daerah 3T.", divisionChoice: "pemberdayaan-masyarakat", divisionReason: "Saya aktif di program Posyandu Remaja dan ingin membawa pengalaman itu ke masyarakat kepulauan dengan adaptasi yang sesuai.", programProposal: "Pelatihan kader kesehatan remaja desa, pemeriksaan kesehatan berkala, dan edukasi gizi untuk ibu dan anak di pulau-pulau kecil.", hopes: "Saya berharap bisa menjadi jembatan antara dunia akademik dan kebutuhan nyata masyarakat, serta pulang dengan perspektif baru tentang Indonesia.", status: "Diterima", berkas: { instagramProof: { name: "follow_ig_aulia.jpg", size: "258 KB" }, tiktokProof: { name: "follow_tiktok_aulia.jpg", size: "215 KB" }, storyProof: { name: "story_ig_aulia.jpg", size: "291 KB" }, paymentProof: { name: "bukti_bayar_aulia.jpg", size: "184 KB" } } },
      { id: 7, tanggal: "5 Des 2025", tipe: "Self Funded", fullName: "Rizal Firmansyah", email: "rizal.firmansyah@gmail.com", whatsapp: "087189012346", instagram: "@rizalfirmansyah", birthDate: "12 Feb 2000", region: "Makassar, Sulawesi Selatan", institution: "Universitas Hasanuddin", whyJoin: "Saya passionate dalam pelestarian lingkungan laut dan ingin berkontribusi langsung di Raja Ampat yang merupakan heart of the Coral Triangle.", divisionChoice: "konservasi-lingkungan", divisionReason: "Sebagai mahasiswa kelautan, saya ingin mengaplikasikan ilmu yang saya pelajari di lapangan nyata.", programProposal: "Program beach cleanup terpadu, sorting sampah, daur ulang kreatif, dan edukasi bahaya mikroplastik untuk siswa sekolah.", hopes: "Semoga kontribusi kecil ini bisa berdampak besar untuk keberlanjutan Raja Ampat di masa depan.", status: "Pending", berkas: { instagramProof: { name: "follow_ig_rizal.jpg", size: "249 KB" }, tiktokProof: { name: "follow_tiktok_rizal.jpg", size: "201 KB" }, storyProof: { name: "story_ig_rizal.jpg", size: "284 KB" }, paymentProof: { name: "bukti_bayar_rizal.jpg", size: "189 KB" } } },
      { id: 8, tanggal: "1 Des 2025", tipe: "Fully Funded", fullName: "Citra Dewi", email: "citra.dewi@gmail.com", whatsapp: "088190123457", instagram: "@citradewi", birthDate: "25 Apr 2001", region: "Bandung, Jawa Barat", institution: "Universitas Padjadjaran", whyJoin: "Saya ingin berbagi ilmu dan pengalaman dengan anak-anak di Raja Ampat, sekaligus belajar tentang kearifan lokal mereka.", divisionChoice: "pendidikan-literasi", divisionReason: "Saya suka mengajar dan ingin berkontribusi untuk pemerataan kualitas pendidikan di Indonesia timur.", programProposal: "Kelas kreatif untuk anak-anak dengan metode belajar sambil bermain, storytelling budaya lokal, dan workshop menulis.", hopes: "Saya berharap bisa belajar sebanyak yang saya ajarkan, dan pulang dengan hati yang lebih kaya.", status: "Diterima", berkas: { instagramProof: { name: "follow_ig_citra.jpg", size: "255 KB" }, tiktokProof: { name: "follow_tiktok_citra.jpg", size: "208 KB" }, storyProof: { name: "story_ig_citra.jpg", size: "295 KB" }, paymentProof: { name: "bukti_bayar_citra.jpg", size: "181 KB" } } },
      { id: 9, tanggal: "28 Nov 2025", tipe: "Self Funded", fullName: "Arif Budiman", email: "arif.budiman@gmail.com", whatsapp: "089101234568", instagram: "@arifbudiman", birthDate: "8 Jun 1998", region: "Surakarta, Jawa Tengah", institution: "Universitas Sebelas Maret", whyJoin: "Saya memiliki keahlian fotografi dan videografi untuk mendokumentasikan program, dan ingin berkontribusi lewat medium visual.", divisionChoice: "dokumentasi-komunikasi", divisionReason: "Visual adalah cara paling kuat untuk bercerita, dan saya ingin menceritakan kisah inspiratif dari Raja Ampat.", programProposal: "Dokumentasi foto jurnalistik kehidupan sehari-hari masyarakat, budaya lokal, dan kegiatan volunteer selama program berlangsung.", hopes: "Semoga karya visual saya bisa menjadi referensi dan inspirasi bagi program-program sosial selanjutnya.", status: "Ditolak", berkas: { instagramProof: { name: "follow_ig_arif.jpg", size: "238 KB" }, tiktokProof: { name: "follow_tiktok_arif.jpg", size: "197 KB" }, storyProof: { name: "story_ig_arif.jpg", size: "279 KB" }, paymentProof: { name: "bukti_bayar_arif.jpg", size: "186 KB" } } },
      { id: 10, tanggal: "25 Nov 2025", tipe: "Fully Funded", fullName: "Sari Pertiwi", email: "sari.pertiwi@gmail.com", whatsapp: "081212345679", instagram: "@saripertiwi", birthDate: "20 Okt 2000", region: "Bandar Lampung, Lampung", institution: "Universitas Lampung", whyJoin: "Saya ingin berkontribusi dalam program kesehatan masyarakat di daerah kepulauan yang memiliki tantangan geografis unik.", divisionChoice: "pemberdayaan-masyarakat", divisionReason: "Saya ingin belajar langsung tentang bagaimana mengorganisir program kesehatan di tengah keterbatasan akses.", programProposal: "Penyuluhan kesehatan ibu dan anak, pelatihan hygiene sanitasi, dan program pencegahan stunting berbasis makanan lokal.", hopes: "Saya berharap bisa membawa pulang best practices yang bisa diterapkan di daerah asal saya.", status: "Pending", berkas: { instagramProof: { name: "follow_ig_sari.jpg", size: "244 KB" }, tiktokProof: { name: "follow_tiktok_sari.jpg", size: "200 KB" }, storyProof: { name: "story_ig_sari.jpg", size: "287 KB" }, paymentProof: { name: "bukti_bayar_sari.jpg", size: "191 KB" } } },
    ],
    "sjn-3-sumba": [
      { id: 1, tanggal: "1 Jun 2025", tipe: "Fully Funded", fullName: "Hendra Kusuma", email: "hendra.kusuma@gmail.com", whatsapp: "081323456780", instagram: "@hendrakusuma", birthDate: "14 Jan 1999", region: "Denpasar, Bali", institution: "Universitas Udayana", whyJoin: "Saya passionate dalam pendidikan dan pemberdayaan ekonomi masyarakat, dan Sumba adalah tempat yang tepat untuk belajar keduanya.", divisionChoice: "pemberdayaan-masyarakat", divisionReason: "Saya ingin belajar dari kebijaksanaan lokal Sumba tentang gotong royong dan menerapkannya untuk program pemberdayaan.", programProposal: "Pelatihan digital marketing untuk pengrajin tenun ikat Sumba agar bisa menjual produk ke pasar nasional dan internasional.", hopes: "Saya berharap tenun ikat Sumba bisa dikenal lebih luas dan memberikan nilai ekonomi yang lebih baik untuk para penenun.", status: "Diterima", berkas: { instagramProof: { name: "follow_ig_hendra.jpg", size: "251 KB" }, tiktokProof: { name: "follow_tiktok_hendra.jpg", size: "206 KB" }, storyProof: { name: "story_ig_hendra.jpg", size: "293 KB" }, paymentProof: { name: "bukti_bayar_hendra.jpg", size: "188 KB" } } },
      { id: 2, tanggal: "28 Mei 2025", tipe: "Self Funded", fullName: "Mega Lestari", email: "mega.lestari@gmail.com", whatsapp: "082334567891", instagram: "@megalestari", birthDate: "3 Mar 2000", region: "Mataram, NTB", institution: "Universitas Mataram", whyJoin: "Saya ingin membantu pemberdayaan ekonomi masyarakat Sumba melalui tenun ikat yang merupakan warisan budaya NTB.", divisionChoice: "pemberdayaan-masyarakat", divisionReason: "Sebagai mahasiswa daerah, saya merasa terpanggil untuk mengangkat potensi lokal Sumba yang belum tergarap optimal.", programProposal: "Pendampingan UMKM tenun ikat dari hulu ke hilir, mulai dari desain, produksi, branding, hingga pemasaran digital.", hopes: "Semoga program ini bisa menjadi role model pemberdayaan berbasis budaya untuk daerah lain di Indonesia Timur.", status: "Diterima", berkas: { instagramProof: { name: "follow_ig_mega.jpg", size: "246 KB" }, tiktokProof: { name: "follow_tiktok_mega.jpg", size: "202 KB" }, storyProof: { name: "story_ig_mega.jpg", size: "289 KB" }, paymentProof: { name: "bukti_bayar_mega.jpg", size: "183 KB" } } },
    ],
    "sjn-2-flores": [
      { id: 1, tanggal: "10 Feb 2025", tipe: "Fully Funded", fullName: "Bayu Setiawan", email: "bayu.setiawan@gmail.com", whatsapp: "081445678901", instagram: "@bayusetiawan", birthDate: "7 Jul 1999", region: "Surabaya, Jawa Timur", institution: "Universitas Katolik Widya Mandala", whyJoin: "Saya ingin berkontribusi dalam pelestarian budaya dan pendidikan anak di Wae Rebo, desa adat yang sangat ikonik di Flores.", divisionChoice: "pendidikan-literasi", divisionReason: "Saya percaya anak-anak Wae Rebo berhak mendapatkan akses pendidikan yang baik sambil tetap mengenal budaya Manggarai.", programProposal: "Kelas bilingual Indonesia-Manggarai untuk anak-anak, pelatihan guru lokal, dan dokumentasi cerita rakyat dalam dua bahasa.", hopes: "Saya berharap generasi muda Wae Rebo tumbuh dengan bangga pada budayanya dan siap bersaing di era modern.", status: "Diterima", berkas: { instagramProof: { name: "follow_ig_bayu.jpg", size: "253 KB" }, tiktokProof: { name: "follow_tiktok_bayu.jpg", size: "209 KB" }, storyProof: { name: "story_ig_bayu.jpg", size: "294 KB" }, paymentProof: { name: "bukti_bayar_bayu.jpg", size: "190 KB" } } },
      { id: 2, tanggal: "8 Feb 2025", tipe: "Self Funded", fullName: "Anisa Kumala", email: "anisa.kumala@gmail.com", whatsapp: "082456789012", instagram: "@anisakumala", birthDate: "19 Sep 2000", region: "Surabaya, Jawa Timur", institution: "Universitas Dr. Soetomo", whyJoin: "Saya passionate dalam pelestarian budaya lokal dan ingin belajar langsung dari masyarakat adat Manggarai di Wae Rebo.", divisionChoice: "dokumentasi-komunikasi", divisionReason: "Saya ingin mengabadikan kearifan lokal Wae Rebo agar tidak hilang dimakan zaman dan dikenal generasi muda.", programProposal: "Dokumentasi audiovisual tradisi, ritual adat, dan kearifan lokal Manggarai untuk arsip budaya dan konten digital.", hopes: "Saya berharap dokumentasi ini bisa menjadi warisan digital yang bisa diakses oleh peneliti dan masyarakat luas.", status: "Diterima", berkas: { instagramProof: { name: "follow_ig_anisa.jpg", size: "247 KB" }, tiktokProof: { name: "follow_tiktok_anisa.jpg", size: "204 KB" }, storyProof: { name: "story_ig_anisa.jpg", size: "291 KB" }, paymentProof: { name: "bukti_bayar_anisa.jpg", size: "185 KB" } } },
    ],
    "sjn-1-toraja": [
      { id: 1, tanggal: "20 Jul 2024", tipe: "Fully Funded", fullName: "Mira Susanti", email: "mira.susanti@gmail.com", whatsapp: "081567890123", instagram: "@mirasusanti", birthDate: "28 Feb 2000", region: "Makassar, Sulawesi Selatan", institution: "Universitas Hasanuddin", whyJoin: "Saya ingin mempelajari dan melestarikan tradisi Toraja yang unik, termasuk ritual Rambu Solo' yang kaya makna.", divisionChoice: "dokumentasi-komunikasi", divisionReason: "Toraja memiliki warisan budaya yang luar biasa dan perlu didokumentasikan dengan cara yang menghormati nilai adatnya.", programProposal: "Dokumentasi multimedia tentang siklus kehidupan adat Toraja, arsitektur tongkonan, dan cerita rakyat lokal.", hopes: "Saya berharap budaya Toraja tetap lestari dan semakin dikenal dunia tanpa kehilangan esensi aslinya.", status: "Diterima", berkas: { instagramProof: { name: "follow_ig_mira.jpg", size: "250 KB" }, tiktokProof: { name: "follow_tiktok_mira.jpg", size: "205 KB" }, storyProof: { name: "story_ig_mira.jpg", size: "290 KB" }, paymentProof: { name: "bukti_bayar_mira.jpg", size: "187 KB" } } },
      { id: 2, tanggal: "18 Jul 2024", tipe: "Self Funded", fullName: "Fajar Nugroho", email: "fajar.nugroho@gmail.com", whatsapp: "082578901234", instagram: "@fajarnugroho", birthDate: "11 Apr 1999", region: "Malang, Jawa Timur", institution: "Universitas Brawijaya", whyJoin: "Saya passionate dalam pendidikan dan ingin berkontribusi di Toraja, daerah yang memiliki kekayaan budaya sangat tinggi.", divisionChoice: "pendidikan-literasi", divisionReason: "Saya ingin membantu meningkatkan kualitas literasi anak-anak Toraja dengan metode yang kontekstual terhadap budaya lokal.", programProposal: "Kelas membaca kreatif berbasis cerita rakyat Toraja, dan pelatihan menulis untuk siswa SMA.", hopes: "Saya berharap anak-anak Toraja tumbuh menjadi generasi yang bangga pada identitasnya dan cakap dalam membaca dunia.", status: "Diterima", berkas: { instagramProof: { name: "follow_ig_fajar.jpg", size: "248 KB" }, tiktokProof: { name: "follow_tiktok_fajar.jpg", size: "203 KB" }, storyProof: { name: "story_ig_fajar.jpg", size: "288 KB" }, paymentProof: { name: "bukti_bayar_fajar.jpg", size: "186 KB" } } },
    ],
    "sjn-pilot-kalimantan": [
      { id: 1, tanggal: "1 Mar 2024", tipe: "Fully Funded", fullName: "Andi Pratama", email: "andi.pratama@gmail.com", whatsapp: "081678901234", instagram: "@andipratama", birthDate: "5 Agt 1998", region: "Bandung, Jawa Barat", institution: "Universitas Padjadjaran", whyJoin: "Saya ingin belajar tentang budaya Dayak Kenyah dan berkontribusi dalam program pilot yang pertama kali ini.", divisionChoice: "dokumentasi-komunikasi", divisionReason: "Saya tertarik dengan keunikan budaya Dayak dan ingin memperkenalkan kekayaan Kalimantan ke khalayak luas.", programProposal: "Dokumentasi budaya Dayak Kenyah, termasuk rumah panjang, tarian tradisional, dan ritual adat, dalam format konten digital modern.", hopes: "Saya berharap budaya Dayak Kenyah bisa lebih dikenal dan tetap lestari di tengah arus modernisasi.", status: "Diterima", berkas: { instagramProof: { name: "follow_ig_andi.jpg", size: "252 KB" }, tiktokProof: { name: "follow_tiktok_andi.jpg", size: "207 KB" }, storyProof: { name: "story_ig_andi.jpg", size: "292 KB" }, paymentProof: { name: "bukti_bayar_andi.jpg", size: "189 KB" } } },
      { id: 2, tanggal: "28 Feb 2024", tipe: "Self Funded", fullName: "Rina Marlina", email: "rina.marlina@gmail.com", whatsapp: "082689012345", instagram: "@rinamarlina", birthDate: "22 Nov 1999", region: "Bandung, Jawa Barat", institution: "Universitas Padjadjaran", whyJoin: "Saya passionate dalam pendidikan dan ingin berkontribusi di komunitas Dayak yang sangat terbuka terhadap pengetahuan baru.", divisionChoice: "pendidikan-literasi", divisionReason: "Saya ingin menjadi jembatan antara dunia pendidikan modern dan kearifan lokal Dayak yang kaya.", programProposal: "Kelas tambahan untuk anak-anak SD dan SMP dengan pendekatan multilingual, menghargai bahasa Dayak lokal.", hopes: "Saya berharap setiap anak Dayak tumbuh dengan percaya diri, baik dalam budaya mereka maupun dalam menghadapi dunia luar.", status: "Diterima", berkas: { instagramProof: { name: "follow_ig_rina.jpg", size: "245 KB" }, tiktokProof: { name: "follow_tiktok_rina.jpg", size: "201 KB" }, storyProof: { name: "story_ig_rina.jpg", size: "286 KB" }, paymentProof: { name: "bukti_bayar_rina.jpg", size: "184 KB" } } },
    ],
  };

  const pendaftarList = programId ? pendaftarData[programId] || [] : [];
  const pendaftar = pendaftarList.find((p) => p.id === pendaftarId);

  const getStatusBadgeClass = (status) => {
    if (status === "Diterima") return styles.badgeDiterima;
    if (status === "Ditolak") return styles.badgeDitolak;
    return styles.badgePending;
  };

  const getTipeBadgeClass = (tipe) => {
    if (tipe === "Fully Funded") return styles.badgeFullyFunded;
    return styles.badgeSelfFunded;
  };

  const formatDivisionLabel = (value) => {
    const map = {
      "pendidikan-literasi": "Pendidikan & Literasi",
      "konservasi-lingkungan": "Konservasi & Lingkungan",
      "pemberdayaan-masyarakat": "Pemberdayaan Masyarakat",
      "dokumentasi-komunikasi": "Dokumentasi & Komunikasi",
    };
    return map[value] || value;
  };

  const programNameMap = {
    "sjn-4-raja-ampat":     "Semesta Jelajah Nusantara #4 Raja Ampat",
    "sjn-3-sumba":          "Semesta Jelajah Nusantara #3 Sumba",
    "sjn-2-flores":         "Semesta Jelajah Nusantara #2 Flores",
    "sjn-1-toraja":         "Semesta Jelajah Nusantara #1 Toraja",
    "sjn-pilot-kalimantan": "Semesta Jelajah Nusantara Pilot Kalimantan",
  };

  const programName = programNameMap[programId] || formatProgramName?.(programId) || programId.replace(/-/g, " ");

  const berkasList = (berkas) => {
    if (!berkas) return [];
    return [
      { key: "instagramProof", label: "Bukti follow Instagram Semesta Manusia Indonesia (@semestamanusiaa)", file: berkas.instagramProof },
      { key: "tiktokProof", label: "Bukti follow Tiktok Semesta Manusia Indonesia (@semestamanusia.indonesia)", file: berkas.tiktokProof },
      { key: "storyProof", label: "Bukti upload Invitation Story ke Story Instagram Anda", file: berkas.storyProof },
      { key: "paymentProof", label: "Upload Bukti Pembayaran", file: berkas.paymentProof },
    ];
  };

  if (!pendaftar) {
    return (
      <div className={styles.pageLayout}>
        <AdminSidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
        <main className={`${styles.mainContent} ${isSidebarCollapsed ? styles.expanded : ""}`}>
          <div className={styles.notFound}>
            <h2>Pendaftar tidak ditemukan</h2>
            <Link href={`/admin/sjn/${programId}`} className={styles.backLinkError}>
              ← Kembali ke Daftar Pendaftar
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
            <Link href={`/admin/sjn/${programId}`} className={styles.backButton}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </Link>
          </div>
          <div className={styles.headerText}>
            <div className={styles.headerTitleRow}>
              <h1 className={styles.pageTitle}>{pendaftar.fullName}</h1>
              <span className={`${styles.statusBadge} ${getStatusBadgeClass(pendaftar.status)}`}>
                {pendaftar.status}
              </span>
            </div>
            <p className={styles.pageSubtitle}>Detail pendaftar program</p>
          </div>
        </div>

        {/* Profile Card */}
        <div className={styles.profileCard}>
          <div className={styles.profileAvatar}>
            {pendaftar.fullName.split(" ").map((n) => n[0]).slice(0, 2).join("")}
          </div>
          <div className={styles.profileInfo}>
            <h2 className={styles.profileName}>{pendaftar.fullName}</h2>
            <p className={styles.profileInstitution}>{pendaftar.institution}</p>
            <div className={styles.profileStatus}>
              <span className={`${styles.statusBadge} ${getTipeBadgeClass(pendaftar.tipe)}`}>
                {pendaftar.tipe}
              </span>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <h3 className={styles.infoCardTitle}>Data Diri</h3>
            <div className={styles.infoList}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Nama Lengkap</span>
                <span className={styles.infoValue}>{pendaftar.fullName}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Tanggal Lahir</span>
                <span className={styles.infoValue}>{pendaftar.birthDate}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Asal Daerah</span>
                <span className={styles.infoValue}>{pendaftar.region}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Nama Instansi</span>
                <span className={styles.infoValue}>{pendaftar.institution}</span>
              </div>
            </div>
          </div>

          <div className={styles.infoCard}>
            <h3 className={styles.infoCardTitle}>Kontak & Media Sosial</h3>
            <div className={styles.infoList}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>No. WhatsApp</span>
                <a
                  href={`https://wa.me/${pendaftar.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.infoLink}
                >
                  {pendaftar.whatsapp}
                </a>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Email</span>
                <a href={`mailto:${pendaftar.email}`} className={styles.infoLink}>
                  {pendaftar.email}
                </a>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Akun Instagram</span>
                <a
                  href={`https://instagram.com/${pendaftar.instagram.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.infoLink}
                >
                  {pendaftar.instagram}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Deskripsi Diri Card */}
        <div className={styles.descriptionCard}>
          <h3 className={styles.descriptionTitle}>Deskripsi Diri</h3>
          <div className={styles.descriptionGrid}>
            <div className={styles.descriptionItem}>
              <span className={styles.descriptionLabel}>Jelaskan mengapa anda ingin bergabung dalam kegiatan {programName}?</span>
              <p className={styles.descriptionValue}>{pendaftar.whyJoin}</p>
            </div>
            <div className={styles.descriptionItem}>
              <span className={styles.descriptionLabel}>Jika anda terpilih sebagai delegasi, bidang apa yang akan anda pilih?</span>
              <span className={styles.descriptionValue}>{formatDivisionLabel(pendaftar.divisionChoice)}</span>
            </div>
            <div className={styles.descriptionItem}>
              <span className={styles.descriptionLabel}>Apa alasan anda memilih divisi tersebut?</span>
              <p className={styles.descriptionValue}>{pendaftar.divisionReason}</p>
            </div>
            <div className={styles.descriptionItem}>
              <span className={styles.descriptionLabel}>Apa program kerja yang akan anda ajukan untuk kegiatan {programName}? (Jelaskan secara singkat dan detail)</span>
              <p className={styles.descriptionValue}>{pendaftar.programProposal}</p>
            </div>
            <div className={styles.descriptionItem}>
              <span className={styles.descriptionLabel}>Apa harapan dan rencana anda jika terpilih menjadi delegasi {programName}?</span>
              <p className={styles.descriptionValue}>{pendaftar.hopes}</p>
            </div>
          </div>
        </div>

        {/* Kelengkapan Persyaratan (Berkas) Card */}
        <div className={styles.berkasCard}>
          <h3 className={styles.berkasTitle}>Kelengkapan Persyaratan</h3>
          <div className={styles.berkasList}>
            {berkasList(pendaftar.berkas).map((item) => (
              <div key={item.key} className={styles.berkasItem}>
                <div className={styles.berkasIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
                <div className={styles.berkasInfo}>
                  <span className={styles.berkasLabel}>{item.label}</span>
                  <span className={styles.berkasName}>{item.file?.name || "—"}</span>
                  <span className={styles.berkasSize}>{item.file?.size || ""}</span>
                </div>
                <a href="#" className={styles.berkasDownload} aria-label="Download">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                  </svg>
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Registration Info Card */}
        <div className={styles.registrationCard}>
          <h3 className={styles.registrationTitle}>Informasi Pendaftaran</h3>
          <div className={styles.registrationGrid}>
            <div className={styles.registrationItem}>
              <span className={styles.registrationLabel}>Tanggal Pendaftaran</span>
              <span className={styles.registrationValue}>{pendaftar.tanggal}</span>
            </div>
            <div className={styles.registrationItem}>
              <span className={styles.registrationLabel}>Program</span>
              <span className={styles.registrationValue}>{programName}</span>
            </div>
            <div className={styles.registrationItem}>
              <span className={styles.registrationLabel}>Tipe Pendaftaran</span>
              <span className={`${styles.statusBadge} ${getTipeBadgeClass(pendaftar.tipe)}`}>
                {pendaftar.tipe}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={styles.actionButtons}>
          <Link href={`/admin/sjn/${programId}`} className={styles.backBtn}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Kembali
          </Link>
          <div className={styles.actionRight}>
            <a
              href={`https://wa.me/${pendaftar.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.whatsappBtn}
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Hubungi via WhatsApp
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
