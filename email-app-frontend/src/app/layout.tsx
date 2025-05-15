// src/app/layout.tsx
import '../styles/globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import type { ReactNode } from 'react';
import Head from 'next/head';

export const metadata = { 
  title: 'Custom Email App', 
  description: 'Self‑hosted inbox with AI power', 
  icons: {
    icon: '/logo.png',
}};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className='min-h-screen font-sans antialiased bg-slate-950 text-slate-100'>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
