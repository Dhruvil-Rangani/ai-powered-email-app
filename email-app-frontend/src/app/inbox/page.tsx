'use client';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { ArrowRightOnRectangleIcon, PaperClipIcon } from '@heroicons/react/24/outline';
import FileSaver from 'file-saver';

interface ThreadMsg {
  subject: string;
  from: string;
  date: string;
  text: string;
  messageId: string;
  attachments?: { filename: string }[];
}

export default function Inbox() {
  const [loading, setLoading] = useState(true);
  const { user, logout, initialized } = useAuth();
  const router = useRouter();
  const [threads, setThreads] = useState<ThreadMsg[][]>([]);
  const [active, setActive]   = useState<number | null>(null);

  // —— helper to download an attachment ————————————————
  async function handleDownload(messageId: string, filename: string) {
    try {
      const { data } = await api.get(
        `/api/emails/${encodeURIComponent(messageId)}/attachments/${encodeURIComponent(filename)}`,
        { responseType: 'blob' }
      );
      FileSaver.saveAs(data, filename);      // or use URL.createObjectURL if you prefer
    } catch {
      alert('Download failed');
    }
  }

  useEffect(() => {
    // wait until AuthProvider has finished loading tokens
    if (!initialized) return;

    // if initialized & still no user, redirect to login
    if (!user) {
      router.push('/login');
      return;
    }

    setLoading(true);
    api
      .get('/api/emails/inbox', { params: { limit: 20 } })
      .then(({ data }) => setThreads(data.threads))
      .finally(() => setLoading(false));
  }, [initialized, user, router]);

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

        {loading && <p className="text-slate-400">Fetching your data…</p>}
        <ul className={`space-y-2 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
          {threads.map((t, idx) => {
            const first = t[0];
            const snippet = first.text?.slice(0, 50).replace(/\s+/g, ' ') || '';
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
                <p className="truncate text-xs text-slate-400">
                  {first.from} • {new Date(first.date).toLocaleString()}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {snippet}
                  {first.attachments?.length ? (
                    <PaperClipIcon className="ml-1 inline h-4 w-4" />
                  ) : null}
                </p>
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
                  <p className="mb-1 text-sm text-slate-400">
                    {m.from} • {new Date(m.date).toLocaleString()}
                  </p>
                  <pre className="rounded bg-slate-900 p-4 whitespace-pre-wrap">
                    {m.text}
                  </pre>

                  {m.attachments?.length ? (
                    <div className="mt-2 space-y-1">
                      <h3 className="text-sm font-semibold">Attachments</h3>
                      {m.attachments.map(att => (
                        <button
                          key={att.filename}
                          onClick={() => handleDownload(m.messageId, att.filename)}
                          className="block text-left text-indigo-400 hover:underline cursor-pointer"
                        >
                          {att.filename}
                        </button>
                      ))}
                    </div>
                  ) : null}
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
