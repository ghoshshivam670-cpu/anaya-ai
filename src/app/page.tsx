import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/landing/HeroSection";
import { InteractiveWorkforce } from "@/components/landing/InteractiveWorkforce";
import { ArchitectureAndMcp } from "@/components/landing/ArchitectureAndMcp";
import { BenchmarksAndFaq } from "@/components/landing/BenchmarksAndFaq";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <InteractiveWorkforce />
        <ArchitectureAndMcp />
        <BenchmarksAndFaq />
      </main>
      <Footer />
    </div>
  );
}
