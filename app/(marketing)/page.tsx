import { Hero } from "@/components/landing/Hero";
import { Stats } from "@/components/landing/Stats";
import { PinnedFeaturesSection } from "@/components/landing/PinnedFeaturesSection";
import { EditorialDoctorDiscovery } from "@/components/landing/EditorialDoctorDiscovery";
import { EditorialIntakeFlow } from "@/components/landing/EditorialIntakeFlow";
import { ClinicalSecurityDeepDive } from "@/components/landing/ClinicalSecurityDeepDive";
import { EditorialForClinicians } from "@/components/landing/EditorialForClinicians";
import { EditorialClosingCta } from "@/components/landing/EditorialClosingCta";

export default function LandingPage() {
  return (
    <main id="main" className="flex flex-1 flex-col bg-[#0A0F0D]">
      {/* 1. Asymmetric Editorial Hero with GSAP text reveal & parallax */}
      <Hero />

      {/* 2. GSAP ScrollTrigger Animated Count-Up Counters */}
      <Stats />

      {/* 3. Horizontal-Pinned GSAP Scroll Section: 4 Core AI/Clinical Capabilities */}
      <PinnedFeaturesSection />

      {/* 4. Warm Off-White Editorial Doctor Discovery with GSAP Card Stagger */}
      <EditorialDoctorDiscovery />

      {/* 5. Interactive Clinical Intake Telemetry & Dossier Protocol */}
      <EditorialIntakeFlow />

      {/* 6. Technical Security & Sovereign Data Architecture Matrix */}
      <ClinicalSecurityDeepDive />

      {/* 7. Warm Off-White Practitioner Network & Practice Invariants */}
      <EditorialForClinicians />

      {/* 8. Editorial Closing Call to Action */}
      <EditorialClosingCta />
    </main>
  );
}
