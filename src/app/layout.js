import "./globals.css";

export const metadata = {
  title: "Semesta Manusia — Platform Volunteer Indonesia",
  description: "Bergabunglah dengan Semesta Manusia untuk menciptakan dampak positif bagi masyarakat Indonesia melalui program volunteer di bidang pendidikan, kesehatan, dan pemberdayaan sosial.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
