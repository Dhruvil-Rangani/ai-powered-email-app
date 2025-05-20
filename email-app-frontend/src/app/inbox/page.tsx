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
import Image from 'next/image';
import EmailHTMLContent from '@/components/EmailHTMLContent';
import md5 from 'crypto-js/md5';

const ComposeCard = dynamic(() => import('@/components/ComposeCard'), { ssr: false });

interface ThreadMsg {
  subject: string;
  from: string;
  to?: string;
  cc?: string;
  date: string;
  text: string;
  html?: string;
  messageId: string;
  inReplyTo?: string;
  references?: string[];
  attachments?: { filename: string }[];
}

function getGravatarUrl(email: string): string {
  const hash = md5(email.trim().toLowerCase()).toString();
  return `https://www.gravatar.com/avatar/${hash}?d=identicon`;
}


export default function Inbox() {
  const [loading, setLoading] = useState(true);
  const { user, logout, initialized } = useAuth();
  const router = useRouter();
  const [threads, setThreads] = useState<ThreadMsg[][]>([]);
  const [active, setActive] = useState<number | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const replyBoxRef = useRef<HTMLTextAreaElement>(null);
  const socketRef = useRef<ReturnType<typeof io>>(null);
  const listRef = useRef<HTMLUListElement>(null);

  async function handleDownload(messageId: string, filename: string) {
    try {
      const { data } = await api.get(
        `/api/emails/${encodeURIComponent(messageId)}/attachments/${encodeURIComponent(filename)}`,
        { responseType: 'blob' }
      );
      FileSaver.saveAs(data, filename);
    } catch {
      alert('Download failed');
    }
  }

  async function handleReply(original: ThreadMsg) {
  try {
    await api.post('/api/emails/send', {
      to: original.from,
      subject: `Re: ${original.subject}`,
      body: replyContent,
      inReplyTo: original.messageId,
      references: [original.messageId, ...(original.references || [])],
    });
    setReplyContent('');
  } catch {
    alert('Failed to send reply');
  }
}


  useEffect(() => {
    if (!initialized) return;
    if (!user) return router.push('/login');

    setLoading(true);
    api
      .get('/api/emails/inbox', { params: { limit: 20 } })
      .then(({ data }) => setThreads(data.threads))
      .finally(() => setLoading(false));

    if (!socketRef.current) {
      socketRef.current = io(process.env.NEXT_PUBLIC_API_URL as string, {
        auth: { token: localStorage.getItem('accessToken') },
      });

      socketRef.current.on('new_email', (email: ThreadMsg) => {
        setThreads((prev) => {
          if (prev.some((t) => t[0].messageId === email.messageId)) return prev;
          setHighlightId(email.messageId);
          setTimeout(() => setHighlightId(null), 5000);
          listRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
          return [[email], ...prev];
        });
      });
    }

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [initialized, user, router]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowCompose(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <main className="flex min-h-screen bg-slate-950 text-slate-100">
      <aside className="w-80 border-r border-slate-800 p-5">
        <header className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Image src="/logo.png" alt="Logo" width={24} height={24} />
            <h1 className="text-xl font-semibold">Inbox</h1>
          </div>
          <button onClick={logout}>
            <ArrowRightOnRectangleIcon className="h-6 w-6 text-slate-400 hover:text-red-400 cursor-pointer" />
          </button>
        </header>

        <button
          onClick={() => setShowCompose(true)}
          className="mb-4 w-full rounded-md bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-500 flex items-center justify-center gap-2 cursor-pointer"
        >
          <PencilSquareIcon className="h-4 w-4" /> Compose
        </button>

        {loading && <p className="text-slate-400">Fetching your data…</p>}
        <ul ref={listRef} className="space-y-2 overflow-y-auto">
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
                className={`cursor-pointer rounded-md p-3 transition-all ${isActive ? 'bg-indigo-500/20 ring-1 ring-indigo-400' : 'hover:bg-slate-800/60'
                  } ${isNew ? 'ring-2 ring-green-400/70' : ''}`}
              >
                <p className="truncate font-medium">{first.subject || '(no subject)'}</p>
                <p className="truncate text-xs text-slate-400">{first.from}</p>
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

      <section className="flex-1 p-8 overflow-y-auto">
        <AnimatePresence mode="wait">
          {active !== null ? (
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: 'tween', duration: 0.1 }}
              className="max-w-4xl space-y-10"
            >
              {threads[active].map((m, i) => (
                <article key={m.messageId} className="rounded-md border border-slate-700 bg-slate-900 p-6 shadow-md">
                  <div className="flex items-start gap-4 mb-4">
                    <Image
                      src={getGravatarUrl(m.from.split('<')[1]?.replace('>', '') || '')}
                      alt="avatar"
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                    <div className="flex-1">
                      <h2 className="text-lg font-semibold text-white">{m.subject || '(no subject)'}</h2>
                      <p className="text-sm text-slate-300">{m.from}</p>
                      <p className="text-xs text-slate-500">
                        To: {m.to || 'you'}
                        {m.cc && <span className="ml-2">Cc: {m.cc}</span>} •{' '}
                        {new Date(m.date).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {m.html ? (
                    <EmailHTMLContent html={m.html} />
                  ) : (
                    <pre className="whitespace-pre-wrap rounded bg-slate-800 p-4 text-sm text-white">{m.text}</pre>
                  )}

                  {Array.isArray(m.attachments) && m.attachments.length > 0 && (
                    <div className="mt-6 rounded bg-slate-800 p-4">
                      <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-300">
                        <PaperClipIcon className="h-4 w-4" />
                        Attachments
                      </h3>
                      <ul className="space-y-1 text-sm">
                        {m.attachments.map((att) => (
                          <li key={att.filename}>
                            <button
                              onClick={() => handleDownload(m.messageId, att.filename)}
                              className="text-indigo-400 hover:underline"
                            >
                              {att.filename}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {i === 0 && (
                    <div className="mt-6 border-t border-slate-700 pt-4">
                      <textarea
                        ref={replyBoxRef}
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Reply…"
                        className="w-full rounded bg-slate-800 p-2 text-sm text-white"
                        rows={3}
                        onFocus={() => {
                          // Optional: Scroll to reply on focus
                          replyBoxRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }}
                      />
                      <button
                        onClick={() => handleReply(m)}
                        className="mt-2 rounded bg-indigo-600 px-4 py-1 text-sm text-white hover:bg-indigo-500 cursor-pointer"
                      >
                        Send
                      </button>
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

      <AnimatePresence>
        {showCompose && (
          <ComposeCard
            onClose={() => setShowCompose(false)}
            afterSend={() =>
              api.get('/api/emails/inbox', { params: { limit: 20 } }).then(({ data }) => setThreads(data.threads))
            }
          />
        )}
      </AnimatePresence>
    </main>
  );
}
