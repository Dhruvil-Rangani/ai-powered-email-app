'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { ComposeProvider } from '@/contexts/ComposeContext';
import type { ReactNode } from 'react';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ComposeProvider>
        {children}
      </ComposeProvider>
    </AuthProvider>
  );
} 