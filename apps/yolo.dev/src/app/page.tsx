import { Header } from './components/ui/Header';
import { Hero } from './components/sections/Hero';
import { Features } from './components/sections/Features';
import { Installation } from './components/sections/Installation';
import { Community } from './components/sections/Community';
import { Why } from './components/sections/WhyYOLO';
import { Ecosystem } from './components/sections/Ecosystem';
import { Methodology } from './components/sections/Methodology';

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Why />
        <Methodology />
        <Ecosystem />
        <Features />
        <Installation />
        <Community />
      </main>
    </>
  );
}
