import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { PartnerMarquee } from "@/components/landing/PartnerMarquee";
import { ValueProposition } from "@/components/landing/ValueProposition";
import { SpecialtiesPricing } from "@/components/landing/SpecialtiesPricing";
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
      {/* 1. Two-Tier Header Navigation */}
      <Navbar />

      {/* 2. Advertising Hero with ₹199 Badge, Live Countdown & WebRTC Stage */}
      <Hero />

      {/* 3. Live Trust & Insurance Partner Continuous Marquee */}
      <PartnerMarquee />

      {/* 4. 4 Core Value Proposition Advantages */}
      <ValueProposition />

      {/* 5. Specialty Advertising Cards with ₹199-₹499 Pricing & Wait Times */}
      <SpecialtiesPricing />

      {/* 6. 3-Step "How It Works" Visual Journey */}
      <HowItWorksFlow />

      {/* 7. Doctor Recruitment Advertising Banner (0% Fee Promotion) */}
      <DoctorRecruitmentBanner />

      {/* 8. Transparent Pricing Plans & Patient Testimonial Carousel */}
      <PricingAndTestimonials />

      {/* 9. High-Converting Mobile App Download Section */}
      <AppDownloadSection />

      {/* 10. Security, DPDP 2023 & Indian Compliance */}
      <Security />
    </main>
  );
}
