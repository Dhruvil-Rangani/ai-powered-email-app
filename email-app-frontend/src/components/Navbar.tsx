'use client';
import Link from 'next/link';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import Logo from './Logo';

export default function Navbar() {
  /* ───────── routing helpers ───────── */
  const pathname       = usePathname();
  const isLoginPage    = pathname === '/login';
  const isRegisterPage = pathname === '/register';
  const isLandingPage  = pathname === '/';

  /* ───────── scroll / hover state ───────── */
  const { scrollY } = useScroll();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isHovered,  setIsHovered]  = useState(false);

  /* ───────── run-once animation flag ───────── */
  const didIntroAnim = useRef(false);

  /* collapse on scroll (unless hovering) */
  useMotionValueEvent(scrollY, 'change', (y) => {
    if (!isHovered) setIsExpanded(y < 50);
  });

  /* expand while hovering */
  useEffect(() => {
    if (isHovered) setIsExpanded(true);
  }, [isHovered]);

  return (
    <motion.nav
      className="fixed left-1/2 top-4 z-30 -translate-x-1/2"
      /* slide-in only the very first time this file is mounted */
      initial={didIntroAnim.current ? false : { y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      onAnimationComplete={() => { didIntroAnim.current = true; }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        className="relative flex items-center justify-between rounded-full bg-slate-900/80 backdrop-blur-sm shadow-lg ring-1 ring-slate-800/50"
        /* explicit start width kills the flash */
        initial={{ width: '90vw', maxWidth: '1200px' }}
        animate={{
          width:    isExpanded ? '90vw'  : '300px',
          maxWidth: isExpanded ? '1200px': '300px',
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* logo + title */}
        <div className="flex items-center px-6 py-3">
          <Link href="/" className="flex items-center space-x-2 text-xl font-bold tracking-tight">
            <Logo />
            <motion.span
              animate={{ opacity: isExpanded ? 1 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-indigo-400"
            >
              Dice
            </motion.span>
            <motion.span
              animate={{ opacity: isExpanded ? 1 : 0 }}
              transition={{ duration: 0.2 }}
            >
              Mail
            </motion.span>
          </Link>
        </div>

        {/* center links (hide when collapsed) */}
        <motion.div
          className="hidden md:flex items-center gap-6 px-6"
          animate={{
            opacity: isExpanded ? 1 : 0,
            display: isExpanded ? 'flex' : 'none',
          }}
          transition={{ duration: 0.2 }}
        >
          <Link href="/#features" className="text-slate-300 hover:text-indigo-300 transition-colors">
            Features
          </Link>
          <Link href="/#how" className="text-slate-300 hover:text-indigo-300 transition-colors">
            How It Works
          </Link>
          <Link href="/#pricing" className="text-slate-300 hover:text-indigo-300 transition-colors">
            Pricing
          </Link>
        </motion.div>

        {/* right-side CTA */}
        <div className="px-6 py-3">
          {isLoginPage ? (
            <Link
              href="/register"
              className="rounded-full bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-400 transition-colors"
            >
              Register
            </Link>
          ) : (isRegisterPage || isLandingPage) && (
            <Link
              href="/login"
              className="rounded-full bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-400 transition-colors"
            >
              Login
            </Link>
          )}
        </div>
      </motion.div>
    </motion.nav>
  );
}

