import { ClosingCta } from "@/components/landing/ClosingCta";
import { Features } from "@/components/landing/Features";
import { ForDoctors } from "@/components/landing/ForDoctors";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Security } from "@/components/landing/Security";
import { Stats } from "@/components/landing/Stats";
import { Testimonials } from "@/components/landing/Testimonials";

export default function LandingPage() {
  return (
    <main id="main" className="flex flex-1 flex-col">
      <Hero />
      <Stats />
      <Features />
      <HowItWorks />
      <Security />
      <Testimonials />
      <ForDoctors />
      <ClosingCta />
    </main>
  );
}
