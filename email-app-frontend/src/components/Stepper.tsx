'use client';
import { motion } from 'framer-motion';

const STEPS = [
  { n: 1, t: 'Sign up with your domain email' },
  { n: 2, t: 'Point DNS → your VPS (Postfix / Dovecot)' },
  { n: 3, t: 'Login & import existing mail' },
  { n: 4, t: 'Draft with AI, tag, automate!' },
];

export default function Stepper() {
  return (
    <section id="how" className="mx-auto max-w-3xl px-6 py-24">
      <h2 className="mb-14 text-center text-3xl font-bold">How it works</h2>

      <ol className="relative border-s border-slate-700">
        {STEPS.map((s, i) => (
          <motion.li
            key={s.n}
            className="mb-10 ms-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.15 }}
          >
            <span className="absolute -left-3 flex size-6 items-center justify-center rounded-full bg-indigo-500 ring-4 ring-slate-950">
              {s.n}
            </span>
            <h3 className="font-medium">{s.t}</h3>
          </motion.li>
        ))}
      </ol>
    </section>
  );
}
