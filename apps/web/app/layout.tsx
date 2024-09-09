import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { meta } from './content';
import Navbar from './components/navbar';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NODE_ENV === 'production'
      ? 'https://flipbook.codes'
      : 'http://localhost:3000'
  ),
  title: meta.title,
  description: meta.description,
  icons: [
    {
      url: '/apple-touch-icon.png',
      sizes: '180x180',
      type: 'image/png',
      rel: 'apple-touch-icon',
    },
    {
      url: '/favicon-32x32.png',
      sizes: '32x32',
      type: 'image/png',
      rel: 'icon',
    },
    {
      url: '/favicon-16x16.png',
      sizes: '16x16',
      type: 'image/png',
      rel: 'icon',
    },
    {
      url: '/safari-pinned-tab.svg',
      color: '#444444',
      rel: 'mask-icon',
    },
  ],
  manifest: '/site.webmanifest',
  openGraph: {
    type: 'website',
    url: meta.url,
    title: meta.title,
    description: meta.description,
    images: [meta.logotype],
  },
  twitter: {
    card: 'summary_large_image',
    site: meta.url,
    title: meta.title,
    description: meta.description,
    images: [meta.logotype],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Suspense fallback={null}>
          <Navbar />
        </Suspense>

        {children}

        <Analytics />
      </body>
    </html>
  );
}
