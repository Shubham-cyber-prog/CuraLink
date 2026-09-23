import { Hero } from "@/components/landing/Hero";
import { Stats } from "@/components/landing/Stats";
import { DoctorDiscoveryPreview } from "@/components/landing/DoctorDiscoveryPreview";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Features } from "@/components/landing/Features";
import { SymptomAssessmentPreview } from "@/components/landing/SymptomAssessmentPreview";
import { AppointmentExperiencePreview } from "@/components/landing/AppointmentExperiencePreview";
import { HealthRecordsPreview } from "@/components/landing/HealthRecordsPreview";
import { Security } from "@/components/landing/Security";
import { Testimonials } from "@/components/landing/Testimonials";
import { ForDoctors } from "@/components/landing/ForDoctors";
import { ClosingCta } from "@/components/landing/ClosingCta";

export default function LandingPage() {
  return (
    <main id="main" className="flex flex-1 flex-col">
      {/* 1. Hero with Trust Indicators */}
      <Hero />
      <Stats />

      {/* 2. Doctor discovery preview */}
      <DoctorDiscoveryPreview />

      {/* 3. How CuraLink works */}
      <HowItWorks />

      {/* 4. Healthcare specialties */}
      <Features />

      {/* 5. Clinical symptom assessment */}
      <SymptomAssessmentPreview />

      {/* 6. Appointment experience */}
      <AppointmentExperiencePreview />

      {/* 7. Health records & privacy */}
      <HealthRecordsPreview />

      {/* 8. Security & trust */}
      <Security />

      {/* Patient trust & Practitioner network */}
      <Testimonials />
      <ForDoctors />

      {/* 9. Final CTA */}
      <ClosingCta />
    </main>
  );
}
