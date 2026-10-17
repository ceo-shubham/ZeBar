import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'ZeBar - Dynamic & Media QR Platform | by ZENSTRO',
  description:
    'Create high-impact QR codes for Text, MP3 audio, Images, and Web Links with custom center brand logos. Built by ZENSTRO, directed by Shubham Pathak.',
  keywords: ['ZeBar', 'ZENSTRO', 'QR code generator', 'MP3 QR code', 'Image QR code', 'custom logo QR'],
  authors: [{ name: 'Shubham Pathak', url: 'https://zenstro.space' }],
  metadataBase: new URL('https://zebar.zenstro.space'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} dark`}>
      <body className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
