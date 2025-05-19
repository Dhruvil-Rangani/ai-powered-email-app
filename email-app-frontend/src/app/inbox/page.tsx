// src/app/inbox/page.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import {
  ArrowRightOnRectangleIcon,
  PaperClipIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline';
import FileSaver from 'file-saver';
import io from 'socket.io-client';
import dynamic from 'next/dynamic';

const ComposeCard = dynamic(() => import('@/components/ComposeCard'), { ssr: false });

interface ThreadMsg {
  subject: string;
  from: string;
  date: string;
  text: string;
  messageId: string;
  attachments?: { filename: string }[];
}

export default function Inbox() {
  /* ─────────── state ─────────── */
  const [loading, setLoading] = useState(true);
  const { user, logout, initialized } = useAuth();
  const router = useRouter();
  const [threads, setThreads] = useState<ThreadMsg[][]>([]);
  const [active, setActive] = useState<number | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [highlightId, setHighlightId] = useState<string | null>(null);

  /* ─────────── refs ─────────── */
  const socketRef = useRef<ReturnType<typeof io>>(null);
  const listRef = useRef<HTMLUListElement>(null);

  /* ─────────── helpers ─────────── */
  async function handleDownload(messageId: string, filename: string) {
    try {
      const { data } = await api.get(
        `/api/emails/${encodeURIComponent(messageId)}/attachments/${encodeURIComponent(
          filename
        )}`,
        { responseType: 'blob' }
      );
      FileSaver.saveAs(data, filename);
    } catch {
      alert('Download failed');
    }
  }

  /* ─────────── initial load + socket ─────────── */
  useEffect(() => {
    if (!initialized) return;
    if (!user) {
      router.push('/login');
      return;
    }

    // fetch inbox
    setLoading(true);
    api
      .get('/api/emails/inbox', { params: { limit: 20 } })
      .then(({ data }) => setThreads(data.threads))
      .finally(() => setLoading(false));

    // setup socket once
    if (!socketRef.current) {
      socketRef.current = io(process.env.NEXT_PUBLIC_API_URL as string, {
        auth: { token: localStorage.getItem('accessToken') },
      });

      socketRef.current.on('new_email', (email: ThreadMsg) => {
        setThreads((prev) => {
          if (prev.some((t) => t[0].messageId === email.messageId)) return prev;

          // highlight & scroll
          setHighlightId(email.messageId);
          setTimeout(() => setHighlightId(null), 5000);
          listRef.current?.scrollTo({ top: 0, behavior: 'smooth' });

          return [[email], ...prev];
        });
      });
    }

    // cleanup on unmount
    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [initialized, user, router]);

  /* ─────────── esc-key handler ─────────── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowCompose(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  /* ─────────── render ─────────── */
  return (
    <main className="flex min-h-screen bg-slate-950 text-slate-100">
      {/* ───────── sidebar ───────── */}
      <aside className="w-80 border-r border-slate-800 p-5">
        <header className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img src="/logo.png" alt="Logo" className="h-6 w-6 object-contain" />
            <h1 className="text-xl font-semibold leading-none">Inbox</h1>
          </div>
          <button onClick={logout} title="Logout">
            <ArrowRightOnRectangleIcon className="h-6 w-6 cursor-pointer text-slate-400 hover:text-red-400" />
          </button>
        </header>

        <button
          onClick={() => setShowCompose(true)}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-md bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-500 cursor-pointer"
        >
          <PencilSquareIcon className="h-4 w-4" /> Compose
        </button>

        {loading && <p className="text-slate-400">Fetching your data…</p>}
        <ul
          ref={listRef}
          className={`space-y-2 overflow-y-auto ${
            loading ? 'pointer-events-none opacity-50' : ''
          }`}
        >
          {threads.map((t, idx) => {
            const first = t[0];
            const snippet = first.text?.slice(0, 50).replace(/\s+/g, ' ') || '';
            const isActive = active === idx;
            const isNew = first.messageId === highlightId;
            return (
              <motion.li
                key={first.messageId}
                onClick={() => setActive(idx)}
                whileHover={{ scale: 1.02 }}
                className={`cursor-pointer rounded-md p-3 transition ${
                  isActive
                    ? 'bg-indigo-500/20 ring-1 ring-indigo-400'
                    : 'hover:bg-slate-800/60'
                } ${isNew ? 'ring-2 ring-green-400/70' : ''}`}
              >
                <p className="truncate font-medium">
                  {first.subject || '(no subject)'}
                </p>
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

      {/* ───────── thread preview ───────── */}
      <section className="flex-1 p-8">
        <AnimatePresence mode="wait">
          {active !== null ? (
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: 'tween', duration: 0.1 }}
              className="prose prose-invert max-w-3xl"
            >
              {threads[active].map((m) => (
                <article key={m.messageId} className="mb-10">
                  <h2 className="mb-1 text-xl">{m.subject || '(no subject)'}</h2>
                  <p className="mb-1 text-sm text-slate-400">
                    {m.from} • {new Date(m.date).toLocaleString()}
                  </p>
                  <pre className="whitespace-pre-wrap rounded bg-slate-900 p-4">
                    {m.text}
                  </pre>

                  {m.attachments?.length && (
                    <div className="mt-2 space-y-1">
                      <h3 className="text-sm font-semibold">Attachments</h3>
                      {m.attachments.map((att) => (
                        <button
                          key={att.filename}
                          onClick={() => handleDownload(m.messageId, att.filename)}
                          className="block cursor-pointer text-left text-indigo-400 hover:underline"
                        >
                          {att.filename}
                        </button>
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </motion.div>
          ) : (
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

      {/* ───────── compose overlay ───────── */}
      <AnimatePresence>
        {showCompose && (
          <ComposeCard
            onClose={() => setShowCompose(false)}
            afterSend={() =>
              api
                .get('/api/emails/inbox', { params: { limit: 20 } })
                .then(({ data }) => setThreads(data.threads))
            }
          />
        )}
      </AnimatePresence>
    </main>
  );
}
