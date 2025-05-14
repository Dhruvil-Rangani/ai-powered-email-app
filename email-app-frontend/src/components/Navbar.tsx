'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Navbar() {
  return (
    <motion.nav
      className="fixed inset-x-0 top-0 z-30 flex items-center justify-between px-8 py-4 backdrop-blur-md"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <Link href="/" className="text-xl font-bold tracking-tight">
        <span className="text-indigo-400">Mail</span>Craft
      </Link>

      <div className="hidden gap-6 md:flex">
        <Link href="#features" className="hover:text-indigo-300">Features</Link>
        <Link href="#how" className="hover:text-indigo-300">How It Works</Link>
        <Link href="#pricing" className="hover:text-indigo-300">Pricing</Link>
      </div>

      <Link
        href="/login"
        className="rounded-md bg-indigo-500 px-4 py-2 text-sm font-medium hover:bg-indigo-400"
      >
        Login
      </Link>
    </motion.nav>
  );
}
