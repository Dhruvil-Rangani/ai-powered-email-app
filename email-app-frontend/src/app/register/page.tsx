'use client';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type RegisterForm = { email: string; password: string };

export default function Register() {
  const { register: reg, handleSubmit } = useForm<RegisterForm>();
  const auth = useAuth();
  const router = useRouter();

  async function onSubmit(v: RegisterForm) {
    try {
      await auth.register(v.email, v.password);
      router.push('/inbox');
    } catch {
      alert('Registration failed');
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950">
      <motion.form
        onSubmit={handleSubmit(onSubmit)}
        className="w-96 space-y-6 rounded-lg bg-slate-900/70 p-10 shadow-lg ring-1 ring-slate-800"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <h1 className="text-center text-2xl font-bold">Create account</h1>

        <input
          type="email"
          placeholder="you@your-domain.com"
          {...reg('email', { required: true })}
          className="input input-bordered w-full bg-slate-800"
        />
        <input
          type="password"
          placeholder="Choose a password"
          {...reg('password', { required: true })}
          className="input input-bordered w-full bg-slate-800"
        />

        <motion.button
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
      </motion.form>
    </main>
  );
}
