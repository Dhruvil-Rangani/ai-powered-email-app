'use client';
import { motion } from 'framer-motion';

const STEPS = [
  { n: 1, t: 'Point DNS → your VPS (Postfix / Dovecot)' },
  { n: 2, t: 'Sign up with your domain email' },
  { n: 3, t: 'Login & import existing mail' },
  { n: 4, t: 'Draft with AI, tag, automate!' },
];

export default function Stepper() {
  return (
    <section id="how" className="mx-auto max-w-3xl px-6 py-24">
      <h2 className="mb-14 text-center text-3xl font-bold">How it works</h2>

      <ol className="relative border-s border-slate-700 ps-12">
        {STEPS.map((s, i) => (
          <motion.li
            key={s.n}
            className="mb-10 relative"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.15 }}
          >
            {/* Number circle */}
            <span className="absolute -left-6 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500 text-sm font-bold text-white ring-4 ring-slate-950">
              {s.n}
            </span>

            {/* Step Text */}
            <h3 className="text-base font-medium text-slate-100 leading-relaxed ml-2">
              {s.t}
            </h3>
          </motion.li>
        ))}
      </ol>
    </section>
  );
}
