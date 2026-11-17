import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { PartnerMarquee } from "@/components/landing/PartnerMarquee";
import { ValueProposition } from "@/components/landing/ValueProposition";
import { DoctorSpotlight } from "@/components/landing/DoctorSpotlight";
import { SpecialtiesPricing } from "@/components/landing/SpecialtiesPricing";
import { HealthRecordsPreview } from "@/components/landing/HealthRecordsPreview";
import { HowItWorksFlow } from "@/components/landing/HowItWorksFlow";
import { DoctorRecruitmentBanner } from "@/components/landing/DoctorRecruitmentBanner";
import { PricingAndTestimonials } from "@/components/landing/PricingAndTestimonials";
import { AppDownloadSection } from "@/components/landing/AppDownloadSection";
import { Security } from "@/components/landing/Security";

export const metadata = {
  title: "CuraLink — India's #1 Rated Telehealth Platform · Consult for ₹199",
  description:
    "Consult top board-certified doctors in under 2 minutes. Instant video consults from ₹199, digitally-signed prescriptions, AI symptom triage, and 15-minute medicine delivery.",
};

export default function LandingPage() {
  return (
    <main id="main" className="flex flex-1 flex-col bg-background text-foreground">
      {/* 1. Floating Modern Glassmorphism Navbar */}
      <Navbar />

      {/* 2. Editorial Hero with ₹199 Badge, Live Countdown & WebRTC Stage */}
      <Hero />

      {/* 3. Live Trust & Insurance Partner Continuous Marquee */}
      <PartnerMarquee />

      {/* 4. Core Value Proposition Advantages */}
      <ValueProposition />

      {/* 5. Verified Specialists Spotlight (AIIMS, Apollo, Fortis) */}
      <DoctorSpotlight />

      {/* 6. Specialty Advertising Cards with ₹199-₹499 Pricing & Wait Times */}
      <SpecialtiesPricing />

      {/* 7. Interactive Digital E-Prescription & Records Vault Preview */}
      <HealthRecordsPreview />

      {/* 8. 3-Step "How It Works" Visual Journey */}
      <HowItWorksFlow />

      {/* 9. Doctor Recruitment Advertising Banner (0% Fee Promotion) */}
      <DoctorRecruitmentBanner />

      {/* 10. Transparent Pricing Plans & Patient Testimonial Carousel */}
      <PricingAndTestimonials />

      {/* 11. High-Converting Mobile App Download Section */}
      <AppDownloadSection />

      {/* 12. Security, DPDP 2023 & Indian Compliance */}
      <Security />
    </main>
  );
}
