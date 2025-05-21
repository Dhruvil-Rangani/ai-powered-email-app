'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import Logo from './Logo';

export default function Navbar() {
    const pathname = usePathname();
    
    const isLoginPage = pathname === '/login';
    const isRegisterPage = pathname === '/register';
    const isLandingPage = pathname === '/';

  return (
    <motion.nav
      className="fixed inset-x-0 top-0 z-30 flex items-center justify-between px-8 py-4 backdrop-blur-md"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <Link href="/" className="flex item-center space-x-2 text-xl font-bold tracking-tight">
        <Logo />
        <span className="text-indigo-400">Dice</span>Mail
      </Link>

      <div className="hidden gap-6 md:flex">
        <Link href="/#features" className="hover:text-indigo-300">Features</Link>
        <Link href="/#how" className="hover:text-indigo-300">How It Works</Link>
        <Link href="/#pricing" className="hover:text-indigo-300">Pricing</Link>
      </div>

      {isLoginPage ? (
        <Link
          href="/register"
          className="rounded-md bg-indigo-500 px-4 py-2 text-sm font-medium hover:bg-indigo-400"
        >
          Register
        </Link>
      ) : isRegisterPage || isLandingPage ? (
        <Link
          href="/login"
          className="rounded-md bg-indigo-500 px-4 py-2 text-sm font-medium hover:bg-indigo-400"
        >
          Login
        </Link>
      ) : null}
    </motion.nav>
  );
}
