'use client';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Image from 'next/image';
import { useState, useEffect } from 'react';

type RegisterForm = { email: string; password: string };

export default function Register() {
  const { register: reg, handleSubmit } = useForm<RegisterForm>();
  const auth = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Only render form after client-side hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  async function onSubmit(v: RegisterForm) {
    try {
      await auth.register(v.email, v.password);
      router.push('/inbox');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
  }

  // Show loading state during SSR
  if (!isMounted) {
    return (
      <>
        <Navbar />
        <main className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
          <div className="w-full max-w-md space-y-8 rounded-lg bg-slate-900 p-8 shadow-lg">
            <div className="text-center">
              <Image src="/logo.png" alt="Logo" width={48} height={48} className="mx-auto" />
              <h2 className="mt-6 text-3xl font-bold text-white">Create account</h2>
            </div>
            <div className="animate-pulse space-y-4">
              <div className="h-10 rounded bg-slate-800"></div>
              <div className="h-10 rounded bg-slate-800"></div>
              <div className="h-10 rounded bg-slate-800"></div>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
        <div className="w-full max-w-md space-y-8 rounded-lg bg-slate-900 p-8 shadow-lg">
          <div className="text-center">
            <Image src="/logo.png" alt="Logo" width={48} height={48} className="mx-auto" />
            <h2 className="mt-6 text-3xl font-bold text-white">Create account</h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
            {error && (
              <div className="rounded-md bg-red-500/10 p-3 text-sm text-red-400">
                {error}
              </div>
            )}
            <div className="space-y-4 rounded-md shadow-sm">
              <input
                type="email"
                placeholder="you@dhruvilrangani.com"
                {...reg('email', { required: true })}
                className="input input-bordered w-full bg-slate-800"
                autoComplete="email"
              />
              <input
                type="password"
                placeholder="Choose a password"
                {...reg('password', { required: true })}
                className="input input-bordered w-full bg-slate-800"
                autoComplete="new-password"
              />

              <motion.button
                type="submit"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="btn btn-primary w-full cursor-pointer"
              >
                Register
              </motion.button>

              <p className="text-center text-sm text-slate-400">
                Already have an account?{' '}
                <Link href="/login" className="text-indigo-400 hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
