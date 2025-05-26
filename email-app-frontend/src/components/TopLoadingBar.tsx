'use client';

import { motion } from 'framer-motion';

export default function TopLoadingBar() {
  return (
    <motion.div
      className="fixed top-0 left-0 h-1 bg-indigo-500 z-50"
      initial={{ width: '0%' }}
      animate={{ width: '100%' }}
      exit={{ opacity: 0 }}
      transition={{ duration: 2, ease: 'easeInOut' }}
    />
  );
}
