import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { PartnerMarquee } from "@/components/landing/PartnerMarquee";
import { ValueProposition } from "@/components/landing/ValueProposition";
import { ThreeMedicalShowcase } from "@/components/landing/ThreeMedicalShowcase";
import { DoctorSpotlight } from "@/components/landing/DoctorSpotlight";
import { SpecialtiesPricing } from "@/components/landing/SpecialtiesPricing";
import { HealthRecordsPreview } from "@/components/landing/HealthRecordsPreview";
import { HowItWorksFlow } from "@/components/landing/HowItWorksFlow";
import { DoctorRecruitmentBanner } from "@/components/landing/DoctorRecruitmentBanner";
import { PricingAndTestimonials } from "@/components/landing/PricingAndTestimonials";
import { AppDownloadSection } from "@/components/landing/AppDownloadSection";
import { Security } from "@/components/landing/Security";
import { GsapLandingOrchestrator } from "@/components/landing/GsapLandingOrchestrator";

export const metadata = {
  title: "CuraLink — India's #1 Rated Telehealth Platform · Consult for ₹199",
  description:
    "Consult top board-certified doctors in under 2 minutes. Instant video consults from ₹199, digitally-signed prescriptions, AI symptom triage, and 15-minute medicine delivery.",
};

export default function LandingPage() {
  return (
    <main id="main" className="flex flex-1 flex-col bg-background text-foreground">
      <GsapLandingOrchestrator>
        {/* 1. Floating Modern Glassmorphism Navbar */}
        <Navbar />

        {/* 2. Editorial Hero with Three.js 3D WebGL DNA Scene, Framer Motion & GSAP 3D Scrub Stage */}
        <Hero />

        {/* 3. Live Trust & Insurance Partner Continuous Marquee */}
        <PartnerMarquee />

        {/* 4. Core Value Proposition Advantages */}
        <div data-gsap-reveal>
          <ValueProposition />
        </div>

        {/* 5. Interactive Three.js 3D WebGL Clinical Core + Framer Motion Module Showcase */}
        <ThreeMedicalShowcase />

        {/* 6. Verified Specialists Spotlight (AIIMS, Apollo, Fortis) */}
        <div data-gsap-reveal>
          <DoctorSpotlight />
        </div>

        {/* 7. Specialty Advertising Cards with ₹199-₹499 Pricing & Wait Times */}
        <div data-gsap-reveal>
          <SpecialtiesPricing />
        </div>

        {/* 8. Interactive Digital E-Prescription & Records Vault Preview */}
        <div data-gsap-reveal>
          <HealthRecordsPreview />
        </div>

        {/* 9. 3-Step "How It Works" Visual Journey */}
        <div data-gsap-reveal>
          <HowItWorksFlow />
        </div>

        {/* 10. Doctor Recruitment Advertising Banner (0% Fee Promotion) */}
        <div data-gsap-reveal>
          <DoctorRecruitmentBanner />
        </div>

        {/* 11. Transparent Pricing Plans & Patient Testimonial Carousel */}
        <div data-gsap-reveal>
          <PricingAndTestimonials />
        </div>

        {/* 12. High-Converting Mobile App Download Section */}
        <div data-gsap-reveal>
          <AppDownloadSection />
        </div>

        {/* 13. Security, DPDP 2023 & Indian Compliance */}
        <div data-gsap-reveal>
          <Security />
        </div>
      </GsapLandingOrchestrator>
    </main>
  );
}
