import { Header } from './components/ui/Header';
import { Hero } from './components/sections/Hero';
import { Features } from './components/sections/Features';
import { Installation } from './components/sections/Installation';
import { Community } from './components/sections/Community';

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Features />
        <Installation />
        <Community />
      </main>
    </>
  );
}
