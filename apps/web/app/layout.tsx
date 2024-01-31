import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { title, description, url, logotype } from './content';

import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NODE_ENV === 'production'
      ? 'https://flipbook.codes'
      : 'http://localhost:3000'
  ),
  title,
  description,
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
    url,
    title,
    description,
    images: [logotype],
  },
  twitter: {
    card: 'summary_large_image',
    site: url,
    title,
    description,
    images: [logotype],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
