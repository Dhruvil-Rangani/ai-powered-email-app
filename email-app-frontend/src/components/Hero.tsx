'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative flex flex-col items-center justify-center overflow-hidden pt-32 text-center">
      <motion.h1
        className="max-w-4xl text-4xl font-extrabold md:text-6xl"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        Own&nbsp;your&nbsp;inbox.<br className="hidden md:block" />
        <span className="text-indigo-400">Send, receive &amp; automate</span> on your domain.
      </motion.h1>

      <motion.p
        className="mt-6 max-w-2xl text-lg text-slate-300"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        A privacy-first email service with AI drafting, tagging and job-hunt tools - running entirely on your own server.
      </motion.p>

      <motion.div
        className="mt-10 flex flex-col gap-4 sm:flex-row"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <Link
          href="#features"
          className="rounded-md bg-indigo-500 px-6 py-3 font-medium hover:bg-indigo-400"
        >
          See Features
        </Link>
        <Link
          href="/login"
          className="rounded-md border border-slate-400 px-6 py-3 font-medium hover:bg-slate-800"
        >
          Try Demo
        </Link>
      </motion.div>

      {/* Decorative hero image */}
      <motion.div
        className="pointer-events-none mt-20 select-none"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: 'easeOut', delay: 0.6 }}
      >
        <Image
          src="/hero-inbox.png" // put a screenshot in public/
          alt="Inbox screenshot"
          width={1200}
          height={700}
          className="rounded-lg shadow-2xl ring-1 ring-slate-800"
        />
      </motion.div>
    </section>
  );
}
