import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/sections/HeroSection";
import { ServicesSection } from "@/sections/ServicesSection";
import { ContactSection } from "@/sections/ContactSection";
import { GallerySection } from "@/sections/GallerySection";
import { PricingSection } from "@/sections/PricingSection";
import { BookingDialog } from "@/features/inquiries/BookingDialog";
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
        <ContactSection />
      </main>
      <Footer />
      <BookingDialog />
    </InquiryIntentProvider>
  );
}
