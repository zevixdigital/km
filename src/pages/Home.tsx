import HeroSection from '@/sections/HeroSection';
import TournamentSection from '@/sections/TournamentSection';
import SportsShowcase from '@/sections/SportsShowcase';
import ImpactCounter from '@/sections/ImpactCounter';
import GallerySection from '@/sections/GallerySection';

export default function Home() {
  return (
    <main>
      <HeroSection />
      <TournamentSection />
      <SportsShowcase />
      <ImpactCounter />
      <GallerySection />
    </main>
  );
}
