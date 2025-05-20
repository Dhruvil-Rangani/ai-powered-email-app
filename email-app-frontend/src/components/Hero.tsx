'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 30]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0.8]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.98, 0.98]);

  return (
    <motion.section 
      ref={containerRef}
      style={{ 
        y,
        opacity,
        scale,
        transformStyle: "preserve-3d",
        backfaceVisibility: "hidden"
      }}
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden pt-32 text-center"
    >
      {/* Enhanced glassmorphism overlay with reduced blur */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/40 to-transparent backdrop-blur-[1px]" />

      <motion.div
        className="relative z-10 flex w-full flex-col items-center justify-center px-4 sm:px-6 lg:px-8"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.h1
          className="max-w-4xl text-4xl font-extrabold md:text-6xl lg:text-7xl"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="block"
          >
            Own&nbsp;your&nbsp;inbox.
          </motion.span>
          <motion.span
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-2 block text-indigo-400"
          >
            AI-powered email, 100% self-hosted.
          </motion.span>
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-2 block"
          >
            Send, receive &amp; automate on your domain.
          </motion.span>
        </motion.h1>

        <motion.div
          className="mx-auto mt-8 max-w-2xl text-center"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <p className="text-lg text-slate-300">
            A secure email workspace that runs on your VPS. Draft with AI, manage with threads, tags, filters, and smart replies.
          </p>
        </motion.div>

        <motion.div
          className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <Link
            href="#features"
            className="group relative overflow-hidden rounded-md bg-indigo-500 px-8 py-4 font-medium transition-all hover:bg-indigo-400"
          >
            <motion.span
              className="relative z-10"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              See Features
            </motion.span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-indigo-400 opacity-0 transition-opacity group-hover:opacity-100"
              initial={false}
              animate={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
            />
          </Link>
          <Link
            href="/login"
            className="group relative overflow-hidden rounded-md border border-slate-400 px-8 py-4 font-medium transition-all hover:bg-slate-800"
          >
            <motion.span
              className="relative z-10"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Try Demo
            </motion.span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-slate-700 to-slate-600 opacity-0 transition-opacity group-hover:opacity-100"
              initial={false}
              animate={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
            />
          </Link>
        </motion.div>

        {/* Enhanced hero image container with improved scroll behavior */}
        <motion.div
          className="pointer-events-none mt-20 select-none"
          initial={{ scale: 0.9, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut', delay: 1.2 }}
          style={{
            transformStyle: "preserve-3d",
            backfaceVisibility: "hidden",
            willChange: "transform"
          }}
        >
          {/* Image backdrop with reduced blur */}
          <div className="absolute -inset-4 rounded-2xl bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-slate-900/20 backdrop-blur-md" />
          
          {/* Glow effect with reduced intensity */}
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-indigo-500/20 blur-xl" />
          
          {/* Image container with enhanced shadow and border */}
          <motion.div
            className="relative mx-auto max-w-5xl"
            whileHover={{ scale: 1.02 }}
            transition={{ 
              duration: 0.3,
              type: "spring",
              stiffness: 300,
              damping: 20
            }}
            style={{
              transformStyle: "preserve-3d",
              backfaceVisibility: "hidden",
              willChange: "transform"
            }}
          >
            {/* Additional backdrop with reduced blur */}
            <div className="absolute inset-0 rounded-2xl bg-slate-900/40 backdrop-blur-sm" />
            
            {/* Image with enhanced styling and hardware acceleration */}
            <div className="relative overflow-hidden rounded-2xl shadow-2xl ring-1 ring-slate-800/50 transform-gpu">
              <Image
                src="/hero-inbox.png"
                alt="Inbox screenshot"
                width={1200}
                height={700}
                className="relative w-full transform-gpu object-cover"
                priority
                quality={100}
                style={{
                  transform: "translateZ(0)",
                  backfaceVisibility: "hidden"
                }}
              />
              
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/10 to-transparent" />
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Decorative elements with reduced opacity */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950/90 to-transparent" />
    </motion.section>
  );
}
