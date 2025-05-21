// src/app/layout.tsx
import { Inter } from 'next/font/google';
import type { ReactNode } from 'react';
import Providers from './providers';
import '../styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = { 
  title: 'Custom Email App', 
  description: 'Self‑hosted inbox with AI power', 
  icons: {
    icon: '/logo.png',
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-950 text-slate-100 antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
