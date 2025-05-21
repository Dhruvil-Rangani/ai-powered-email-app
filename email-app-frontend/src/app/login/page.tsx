'use client';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useState } from 'react';
import Image from 'next/image';

type LoginForm = { 
  email: string; 
  password: string;
  rememberMe: boolean;
};

export default function Login() {
  const { register: reg, handleSubmit } = useForm<LoginForm>({
    defaultValues: {
      rememberMe: true
    }
  });
  const { login } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  
  const onSubmit = async (v: LoginForm) => {
    try {
      await login(v.email, v.password);
      router.push('/inbox');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <>
    <Navbar />
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-slate-900 p-8 shadow-lg">
        <div className="text-center">
          <Image src="/logo.png" alt="Logo" width={48} height={48} className="mx-auto" />
          <h2 className="mt-6 text-3xl font-bold text-white">Sign in</h2>
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
            />
            <input
              type="password"
              placeholder="••••••••"
              {...reg('password', { required: true })}
              className="input input-bordered w-full bg-slate-800"
            />

            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                {...reg('rememberMe')}
                className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-indigo-500 focus:ring-indigo-500"
              />
              <label htmlFor="rememberMe" className="ml-2 text-sm text-slate-300">
                Remember me
              </label>
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="btn btn-primary w-full cursor-pointer"
            >
              Sign in
            </motion.button>

            <p className="text-center text-sm text-slate-400">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-indigo-400 hover:underline">
                Register
              </Link>
            </p>
          </div>
        </form>
      </div>
    </main>
    </>
  );
}
