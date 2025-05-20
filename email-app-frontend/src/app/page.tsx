import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import FeatureGrid from '../components/FeatureGrid';
import BuiltFor from '../components/BuiltFor';
import Stepper from '../components/Stepper';
import Footer from '../components/Footer';
import AnimatedBackground from '../components/AnimatedBackground';

export default function Landing() {
  return (
    <div className="relative min-h-screen bg-slate-950 text-white">
      <AnimatedBackground />
      <div className="relative">
        <Navbar />
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
  );
}
