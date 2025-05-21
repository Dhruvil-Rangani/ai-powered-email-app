// src/app/layout.tsx
import { Inter } from 'next/font/google';
import type { ReactNode } from 'react';
import Providers from './providers';
import Navbar from '@/components/Navbar';
import '../styles/globals.css';
import { headers } from 'next/headers';

const inter = Inter({ subsets: ['latin'] });

export const metadata = { 
  title: 'Custom Email App', 
  description: 'Self‑hosted inbox with AI power', 
  icons: {
    icon: '/logo.png',
  }
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';
  const showNavbar = !pathname.startsWith('/inbox');

  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-950 text-slate-100 antialiased`}>
        <Providers>
          {showNavbar && <Navbar />}
          {children}
        </Providers>
      </body>
    </html>
  );
}
