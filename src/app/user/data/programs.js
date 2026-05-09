// Shared program data untuk Landing Page dan Program Page

export const programCategories = {
  SJN: {
    name: "SJN",
    gradient: "linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)"
  },
  SEMESTA_CAMP: {
    name: "Semesta Camp",
    gradient: "linear-gradient(135deg, #00BFFF 0%, #0099CC 100%)"
  }
};

export const allPrograms = [
  // SJN items (3) - dengan data lengkap
  {
    id: 1,
    title: "Semesta Jelajah Nusantara #4 Raja Ampat",
    description: "Jelajahi keindahan alam bawah laut Raja Ampat sambil berkontribusi untuk pelestarian lingkungan.",
    category: "SJN",
    date: "03 Jun 2026 – 13 Jun 2026",
    location: "Raja Ampat, Papua",
    image: "/PosterSJN/SJN4.jpeg",
    registrationDeadline: { fully: "15 Mei 2026", self: "20 Mei 2026" }
  },
  {
    id: 2,
    title: "Semesta Jelajah Nusantara #5 Sumba Expedition",
    description: "Mendalami budaya dan tradisi masyarakat Sumba melalui program immersive selama dua minggu.",
    category: "SJN",
    date: "13 Jul 2026 – 23 Jul 2026",
    location: "Sumba, NTT",
    image: "/program-preview-2.jpg",
    registrationDeadline: { fully: "20 Jun 2026", self: "25 Jun 2026" }
  },
  {
    id: 3,
    title: "Semesta Jelajah Nusantara #6 Flores Adventure",
    description: "Petualangan volunteer di Flores dengan fokus pada pendidikan anak-anak di desa-desa terpencil.",
    category: "SJN",
    date: "25 Ags 2026 – 05 Sep 2026",
    location: "Flores, NTT",
    image: "/program-preview-1.jpg",
    registrationDeadline: { fully: "01 Ags 2026", self: "08 Ags 2026" }
  },
  // Semesta Camp items (3) dengan tanggal
  {
    id: 4,
    title: "Semesta Camp: Pendampingan Anak Yatim Jakarta",
    description: "Program pendampingan dan bimbingan anak-anak di panti asuhan kawasan Jakarta Timur.",
    category: "Semesta Camp",
    date: "13 Apr 2026 – 27 Apr 2026",
    location: "Jakarta Timur",
    image: "/program-preview-3.jpg",
    registrationDeadline: "05 Apr 2026"
  },
  {
    id: 5,
    title: "Semesta Camp: Literasi Anak Jakarta Timur",
    description: "Membantu anak-anak di permukiman padat penduduk belajar membaca dan menulis dengan menyenangkan.",
    category: "Semesta Camp",
    date: "20 Apr 2026 – 04 Mei 2026",
    location: "Jakarta Timur",
    image: "/program-preview-4.jpg",
    registrationDeadline: "10 Apr 2026"
  },
  {
    id: 6,
    title: "Semesta Camp: Pemberdayaan Ibu-ibu di Bandung",
    description: "Membantu ibu-ibu di komunitas perkampungan untuk mengembangkan keterampilan usaha mikro.",
    category: "Semesta Camp",
    date: "05 Mei 2026 – 19 Mei 2026",
    location: "Bandung, Jawa Barat",
    image: "/program-preview-5.jpg",
    registrationDeadline: "25 Apr 2026"
  },
  // Placeholder items (10)
  {
    id: 7,
    title: "Semesta Camp: Konservasi Terumbu Karang",
    description: "Program konservasi terumbu karang dan pendidikan lingkungan laut untuk komunitas pesisir.",
    category: "Semesta Camp",
    date: null,
    location: null,
    image: "/program-preview-6.jpg",
    registrationDeadline: "20 Jun 2026"
  },
  {
    id: 8,
    title: "Semesta Camp: Seni dan Budaya untuk Anak",
    description: "Mengenalkan seni dan budaya lokal kepada anak-anak melalui workshop kreatif dan ekspresif.",
    category: "Semesta Camp",
    date: null,
    location: null,
    image: "/program-preview-3.jpg",
    registrationDeadline: "01 Jul 2026"
  },
  {
    id: 9,
    title: "Semesta Camp: Pertanian Berkelanjutan",
    description: "Pelatihan pertanian organik dan berkelanjutan untuk masyarakat di daerah peri-urban.",
    category: "Semesta Camp",
    date: null,
    location: null,
    image: "/program-preview-4.jpg",
    registrationDeadline: "15 Jul 2026"
  },
  {
    id: 10,
    title: "Semesta Camp: Digital Literacy untuk Remaja",
    description: "Memberikan pelatihan teknologi digital dan komputer untuk remaja di daerah tertinggal.",
    category: "Semesta Camp",
    date: null,
    location: null,
    image: "/program-preview-5.jpg",
    registrationDeadline: "01 Ags 2026"
  },
  {
    id: 11,
    title: "Semesta Camp: Kesehatan Gigi dan Mulut",
    description: "Penyuluhan dan pemeriksaan kesehatan gigi untuk anak-anak sekolah dasar di pedesaan.",
    category: "Semesta Camp",
    date: null,
    location: null,
    image: "/program-preview-6.jpg",
    registrationDeadline: "15 Ags 2026"
  },
  {
    id: 12,
    title: "Semesta Camp: English Teaching Program",
    description: "Program pengajaran bahasa Inggris untuk meningkatkan kemampuan komunikasi anak-anak.",
    category: "Semesta Camp",
    date: null,
    location: null,
    image: "/program-preview-3.jpg",
    registrationDeadline: "01 Sep 2026"
  },
  {
    id: 13,
    title: "Semesta Camp: Building for Better Future",
    description: "Program pembangunan infrastruktur sederhana untuk mendukung kegiatan belajar mengajar.",
    category: "Semesta Camp",
    date: null,
    location: null,
    image: "/program-preview-4.jpg",
    registrationDeadline: "15 Sep 2026"
  },
  {
    id: 14,
    title: "Semesta Camp: Waste Management Education",
    description: "Edukasi pengelolaan sampah dan daur ulang untuk komunitas dan sekolah-sekolah.",
    category: "Semesta Camp",
    date: null,
    location: null,
    image: "/program-preview-5.jpg",
    registrationDeadline: "01 Okt 2026"
  },
  {
    id: 15,
    title: "Semesta Camp: Music and Art Therapy",
    description: "Program terapi seni musik untuk anak-anak dengan kebutuhan khusus di panti rehabilitasi.",
    category: "Semesta Camp",
    date: null,
    location: null,
    image: "/program-preview-6.jpg",
    registrationDeadline: "15 Okt 2026"
  },
  {
    id: 16,
    title: "Semesta Camp: Women's Empowerment Workshop",
    description: "Workshop pemberdayaan perempuan melalui pelatihan keterampilan dan kewirausahaan.",
    category: "Semesta Camp",
    date: null,
    location: null,
    image: "/program-preview-3.jpg",
    registrationDeadline: "01 Nov 2026"
  }
];

// Preview programs untuk landing page (8 items dari allPrograms)
export const previewPrograms = allPrograms.slice(0, 8).map(program => ({
  ...program,
  gradient: program.category === "SJN"
    ? programCategories.SJN.gradient
    : programCategories.SEMESTA_CAMP.gradient
}));