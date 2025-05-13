// src/app/inbox/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function Inbox() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [threads, setThreads] = useState<any[]>([]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    api.get('/api/emails')
      .then(({ data }) => setThreads(data.threads))
      .catch((e) => console.error(e));
  }, [user, router]);

  return (
    <main className="p-6">
      <header className="flex justify-between mb-4">
        <h1 className="text-2xl font-semibold">Inbox</h1>
        <button className="btn" onClick={logout}>Logout</button>
      </header>

      <ul className="space-y-2">
        {threads.map((t) => (
          <li key={t[0].messageId} className="p-4 border rounded">
            <p className="font-medium">{t[0].subject || '(no subject)'}</p>
            <p className="text-sm text-gray-600">{t[0].from}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
