'use client';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

interface ThreadMsg {
  subject: string;
  from: string;
  date: string;
  messageId: string;
}

export default function Inbox() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [threads, setThreads] = useState<ThreadMsg[][]>([]);
  const [active, setActive]   = useState<number | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    api.get('/api/emails').then(({ data }) => setThreads(data.threads));
  }, [user, router]);

  return (
    <main className="flex min-h-screen bg-slate-950 text-slate-100">
      {/* Sidebar */}
      <aside className="w-80 border-r border-slate-800 p-5">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Inbox</h1>
          <button onClick={logout} title="Logout">
            <ArrowRightOnRectangleIcon className="h-6 w-6 text-slate-400 hover:text-red-400 cursor-pointer" />
          </button>
        </header>

        <ul className="space-y-2">
          {threads.map((t, idx) => {
            const first = t[0];
            return (
              <motion.li
                key={first.messageId}
                onClick={() => setActive(idx)}
                whileHover={{ scale: 1.02 }}
                className={`cursor-pointer rounded-md p-3 ring-1 ring-transparent transition ${
                  active === idx
                    ? 'bg-indigo-500/20 ring-indigo-400'
                    : 'hover:bg-slate-800/60'
                }`}
              >
                <p className="truncate font-medium">{first.subject || '(no subject)'}</p>
                <p className="truncate text-xs text-slate-400">{first.from}</p>
              </motion.li>
            );
          })}
        </ul>
      </aside>

      {/* Thread preview */}
      <section className="flex-1 p-8">
        <AnimatePresence mode="wait">
          {active !== null && (
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: 'spring', stiffness: 90, damping: 14 }}
              className="prose max-w-3xl prose-invert"
            >
              {threads[active].map((m) => (
                <article key={m.messageId} className="mb-10">
                  <h2 className="mb-1 text-xl">{m.subject || '(no subject)'}</h2>
                  <p className="mb-4 text-sm text-slate-400">From: {m.from}</p>
                  <pre className="rounded bg-slate-900 p-4">{m.date}</pre>
                </article>
              ))}
            </motion.div>
          )}
          {active === null && (
            <motion.p
              key="placeholder"
              className="text-slate-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Select a thread to read
            </motion.p>
          )}
        </AnimatePresence>
      </section>
    </main>
  );
}
