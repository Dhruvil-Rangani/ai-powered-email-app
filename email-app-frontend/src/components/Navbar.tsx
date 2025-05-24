'use client';
import Link from 'next/link';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import Logo from './Logo';

function useMediaQuery(q: string) {
  const [matches, set] = useState(false);
  useEffect(() => {
    const m = window.matchMedia(q);
    const onChange = () => set(m.matches);
    onChange();
    m.addEventListener('change', onChange);
    return () => m.removeEventListener('change', onChange);
  }, [q]);
  return matches;
}

export default function Navbar() {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';
  const isRegisterPage = pathname === '/register';
  const isLandingPage = pathname === '/';
  const isInboxPage = pathname === '/inbox';

  const { scrollY } = useScroll();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const didIntroAnim = useRef(false);

  const isDesktop = useMediaQuery('(min-width: 768px)');

  useMotionValueEvent(scrollY, 'change', (y) => {
    if (isDesktop && !isHovered) setIsExpanded(y < 50);
  });

  useEffect(() => {
    if (isDesktop && isHovered) setIsExpanded(true);
  }, [isHovered, isDesktop]);

  if (isInboxPage) return null;

  const width = isDesktop
    ? isExpanded ? '90vw' : '300px'
    : '100%';

  const maxW = isDesktop
    ? isExpanded ? '1200px' : '300px'
    : '100%';

  return (
    <motion.nav
      className="fixed top-0 left-0 z-30 w-full px-4 py-3 md:top-4 md:left-1/2 md:-translate-x-1/2 md:w-auto md:px-0 md:py-0"
      initial={didIntroAnim.current ? false : { y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      onAnimationComplete={() => { didIntroAnim.current = true; }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        className={`
          relative flex items-center justify-between
          bg-slate-900/80 backdrop-blur-sm shadow-lg ring-1 ring-slate-800/50
          ${isDesktop ? 'mx-auto rounded-full' : 'rounded-full w-full'}
        `}
        initial={{ width: '100%', maxWidth: '100%' }}
        animate={{ width, maxWidth: maxW }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* logo + title */}
        <div className="flex items-center px-4 sm:px-6 py-2 sm:py-3">
          <Link
            href="/"
            className="flex items-center space-x-2 text-lg sm:text-xl font-bold tracking-tight"
          >
            <Logo />
            <motion.span
              animate={{ opacity: isExpanded ? 1 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-indigo-400"
            >
              Dice<span className="text-white">Mail</span>
            </motion.span>
          </Link>
        </div>

        {/* centre links – desktop only */}
        {isDesktop && (
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
        )}

        {/* right-side CTA */}
        <div className="px-4 sm:px-6 py-2 sm:py-3">
          {isLoginPage ? (
            <Link
              href="/register"
              className="rounded-full bg-indigo-500 px-3 sm:px-4 py-1.5 sm:py-2 text-sm font-medium text-white hover:bg-indigo-400 transition-colors"
            >
              Register
            </Link>
          ) : (isRegisterPage || isLandingPage) && (
            <Link
              href="/login"
              className="rounded-full bg-indigo-500 px-3 sm:px-4 py-1.5 sm:py-2 text-sm font-medium text-white hover:bg-indigo-400 transition-colors"
            >
              Login
            </Link>
          )}
        </div>
      </motion.div>
    </motion.nav>
  );
}
