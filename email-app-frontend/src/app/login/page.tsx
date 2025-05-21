'use client';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

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
  const auth = useAuth();
  const router = useRouter();
  
  
  async function onSubmit(v: LoginForm) {
    try {
      await auth.login(v.email, v.password, v.rememberMe);
      router.push('/inbox');
    } catch {
      alert('Login failed');
    }
  }

  return (
    <>
    <Navbar />
    <main className="flex min-h-screen items-center justify-center bg-slate-950">
      <motion.form
        onSubmit={handleSubmit(onSubmit)}
        className="w-96 space-y-6 rounded-lg bg-slate-900/70 p-10 shadow-lg ring-1 ring-slate-800"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <h1 className="text-center text-2xl font-bold tracking-tight">Welcome back 👋</h1>

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
      </motion.form>
    </main>
    </>
  );
}
