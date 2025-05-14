import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import FeatureGrid from '../components/FeatureGrid';
import Stepper from '../components/Stepper';
import Footer from '../components/Footer';

export default function Landing() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <FeatureGrid />
        <Stepper />
      </main>
      <Footer />
    </>
  );
}
