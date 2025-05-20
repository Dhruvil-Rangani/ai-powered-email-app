'use client';
import { motion } from 'framer-motion';
import { UserIcon, ServerStackIcon, LockClosedIcon } from '@heroicons/react/24/outline';

const AUDIENCES = [
  {
    Icon: UserIcon,
    title: 'Freelancers & Job Seekers',
    desc: 'Use your own domain, send polished replies with AI, and stand out in job applications.',
  },
  {
    Icon: ServerStackIcon,
    title: 'Developers & Tinkerers',
    desc: 'Control your entire stack – from SMTP to UI. Build extensions, integrate APIs, and automate.',
  },
  {
    Icon: LockClosedIcon,
    title: 'Privacy‑Conscious Users',
    desc: 'No third-party snooping. Self-hosted inbox and encryption options to protect your data.',
  },
];

export default function BuiltFor() {
  return (
    <section id="built-for" className="mx-auto max-w-6xl px-6 py-24">
      <motion.h2
        className="mb-12 text-center text-3xl font-bold tracking-tight"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        Built For
      </motion.h2>

      <div className="grid gap-10 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {AUDIENCES.map(({ Icon, title, desc }, i) => (
          <motion.div
            key={title}
            className="rounded-lg bg-slate-900/60 p-6 ring-1 ring-slate-800"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <Icon className="h-8 w-8 text-indigo-400" />
            <h3 className="mt-4 text-lg font-semibold">{title}</h3>
            <p className="mt-2 text-sm text-slate-400">{desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
