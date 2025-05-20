'use client';
import { motion } from 'framer-motion';
import { SparklesIcon, FunnelIcon , InboxIcon, TagIcon, ShieldCheckIcon, ServerStackIcon, ChatBubbleLeftRightIcon} from '@heroicons/react/24/outline';

const FEATURES = [
  { Icon: ServerStackIcon, title: 'Per-User IMAP', desc: 'Dynamic credentials, one inbox per user.' },
  { Icon: SparklesIcon, title: 'AI Drafting', desc: 'Polite replies & job-hunt boosters on tap.' },
  { Icon: ChatBubbleLeftRightIcon, title: 'Threaded View', desc: 'Messages grouped like Gmail - no clutter.' },
  { Icon: FunnelIcon , title: 'Tag & Filter', desc: 'Label emails and query by tag.' },
  { Icon: InboxIcon, title: 'Threaded Conversations', desc: 'Group emails just like Gmail.' },
  { Icon: TagIcon, title: 'Smart Tagging', desc: 'Organize with labels and filters.' },
  { Icon: SparklesIcon, title: 'GPT Drafting', desc: 'Write better emails, faster.' },
  { Icon: ShieldCheckIcon, title: '100% Self-Hosted', desc: 'Postfix, Dovecot, IMAP, and SMTP on your server.' },


];

export default function FeatureGrid() {
  return (
    <section id="features" className="mx-auto max-w-5xl px-6 py-24">
      <h2 className="mb-12 text-center text-3xl font-bold">
        Everything you expect from a modern inbox
      </h2>

      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map(({ Icon, title, desc }, i) => (
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
