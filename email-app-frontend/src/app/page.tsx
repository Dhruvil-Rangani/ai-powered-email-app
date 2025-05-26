'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import FeatureGrid from '../components/FeatureGrid';
import BuiltFor from '../components/BuiltFor';
import Stepper from '../components/Stepper';
import Footer from '../components/Footer';
import AnimatedBackground from '../components/AnimatedBackground';

export default function Landing() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.push('/inbox');
    }
  }, [loading, user, router]);

  if (loading) {
    return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 text-white">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-400 border-opacity-70" />
    </div>
  );
  }

  // Only render landing page if user is not authenticated
  if (!user) {
    return (
      <>
        <Navbar />
        <div className="relative min-h-screen bg-slate-950 text-white">
          <AnimatedBackground />
          <div className="relative">
            <main className="relative">
              <Hero />
              <div className="relative z-10">
                <FeatureGrid />
                <BuiltFor />
                <Stepper />
              </div>
            </main>
            <Footer />
          </div>
        </div>
      </>
    );
  }

  return null;
}
