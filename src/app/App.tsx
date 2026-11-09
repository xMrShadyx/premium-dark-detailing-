import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/sections/HeroSection";
import { ServicesSection } from "@/sections/ServicesSection";
import { PricingSection } from "@/sections/PricingSection";
import { ContactSection } from "@/sections/ContactSection";
import { GallerySection } from "@/sections/GallerySection";
import { InquiryIntentProvider } from "@/features/inquiries/InquiryIntentContext";

export function App() {
  return (
    <InquiryIntentProvider>
      <Header />
      <main id="main" tabIndex={-1} className="outline-none">
        <HeroSection />
        <ServicesSection />
        <PricingSection />
        <GallerySection />
        {/* Sprint 2: <AboutSection /> */}
        <ContactSection />
      </main>
      <Footer />
    </InquiryIntentProvider>
  );
}
