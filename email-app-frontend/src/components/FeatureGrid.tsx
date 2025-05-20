'use client';
import { motion } from 'framer-motion';
import { SparklesIcon, FunnelIcon, InboxIcon, TagIcon, ShieldCheckIcon, ServerStackIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

const FEATURES = [
  { Icon: ServerStackIcon, title: 'Per-User IMAP', desc: 'Dynamic credentials, one inbox per user.' },
  { Icon: SparklesIcon, title: 'AI Drafting', desc: 'Polite replies & job-hunt boosters on tap.' },
  { Icon: ChatBubbleLeftRightIcon, title: 'Threaded View', desc: 'Messages grouped like Gmail - no clutter.' },
  { Icon: FunnelIcon, title: 'Tag & Filter', desc: 'Label emails and query by tag.' },
  { Icon: InboxIcon, title: 'Threaded Conversations', desc: 'Group emails just like Gmail.' },
  { Icon: TagIcon, title: 'Smart Tagging', desc: 'Organize with labels and filters.' },
  { Icon: SparklesIcon, title: 'GPT Drafting', desc: 'Write better emails, faster.' },
  { Icon: ShieldCheckIcon, title: '100% Self-Hosted', desc: 'Postfix, Dovecot, IMAP, and SMTP on your server.' },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function FeatureGrid() {
  return (
    <section id="features" className="relative mx-auto max-w-5xl px-6 py-24">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-slate-900/50 to-transparent" />

      <motion.h2
        className="mb-16 text-center text-4xl font-bold tracking-tight"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        Everything you expect from a{' '}
        <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          modern inbox
        </span>
      </motion.h2>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
      >
        {FEATURES.map(({ Icon, title, desc }) => (
          <motion.div
            key={title}
            variants={item}
            className="group relative"
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {/* Glassmorphism card */}
            <div className="relative overflow-hidden rounded-xl bg-slate-900/60 p-6 backdrop-blur-sm ring-1 ring-slate-800 transition-all duration-300 group-hover:ring-indigo-500/50">
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              {/* Content */}
              <div className="relative">
                <motion.div
                  className="mb-4 inline-block rounded-lg bg-indigo-500/10 p-2 ring-1 ring-indigo-500/20"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Icon className="h-6 w-6 text-indigo-400" />
                </motion.div>

                <h3 className="mb-2 text-lg font-semibold text-white group-hover:text-indigo-400 transition-colors">
                  {title}
                </h3>
                <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                  {desc}
                </p>
              </div>

              {/* Hover effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/0 via-indigo-500/10 to-purple-500/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
