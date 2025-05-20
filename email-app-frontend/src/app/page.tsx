import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import FeatureGrid from '../components/FeatureGrid';
import BuiltFor from '../components/BuiltFor';
import Stepper from '../components/Stepper';
import Footer from '../components/Footer';


export default function Landing() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <FeatureGrid />
        <BuiltFor />
        <Stepper />
      </main>
      <Footer />
    </>
  );
}
