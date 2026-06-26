import { FeatureCards } from "@/components/landing/FeatureCards";
import { Footer } from "@/components/landing/Footer";
import { Hero } from "@/components/landing/Hero";
import { Navbar } from "@/components/landing/Navbar";
import { OnboardingCard } from "@/components/landing/OnboardingCard";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0f1117]">
      <Navbar />
      <main>
        <Hero />
        <section
          id="onboarding"
          className="px-4 pb-20 sm:px-6 lg:px-8"
        >
          <FeatureCards />
          <OnboardingCard />
        </section>
      </main>
      <Footer />
    </div>
  );
}
