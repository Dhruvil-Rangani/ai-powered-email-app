// src/app/login/page.tsx
'use client';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function Login() {
  const { register, handleSubmit } = useForm<{ email: string; password: string }>();
  const { login } = useAuth();
  const router = useRouter();

  async function onSubmit(values: any) {
    try {
      await login(values.email, values.password);
      router.push('/inbox');
    } catch (err) {
      alert('Login failed');
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-80">
        <h1 className="text-2xl font-bold text-center">Sign in</h1>
        <input
          type="email"
          placeholder="you@dhruvilrangani.com"
          {...register('email')}
          className="input input-bordered w-full"
        />
        <input
          type="password"
          placeholder="password"
          {...register('password')}
          className="input input-bordered w-full"
        />
        <button className="btn btn-primary w-full">Login</button>
      </form>
    </main>
  );
}
