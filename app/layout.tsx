import type { Metadata, Viewport } from 'next';
import { Montserrat } from 'next/font/google';
import '@/styles/globals.scss';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-montserrat',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'RealityCheck — Cek Dulu Sebelum Dijalankan',
  description: 'Aplikasi evaluasi kelayakan rencana aktivitas harian berbasis analisis jadwal terstruktur.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={montserrat.variable}>
      <body className={montserrat.className}>{children}</body>
    </html>
  );
}
