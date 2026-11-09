import { useTranslation } from "react-i18next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ServiceCard } from "@/components/services/ServiceCard";
import { getEnabledServices } from "@/config";
import type { Service } from "@/config/schema";

type Props = { services?: Service[] };

export function ServicesSection({ services = getEnabledServices() }: Props) {
  const { t } = useTranslation();
  if (services.length === 0) return null;

  return (
    <section id="services" aria-labelledby="services-title" className="bg-bg py-20 sm:py-28">
      <Container>
        <SectionHeading
          id="services-title"
          eyebrow={t("services.eyebrow")}
          title={t("services.title")}
          subtitle={t("services.subtitle")}
        />
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:gap-8">
          {services.map((service, index) => (
            <ServiceCard key={service.id} service={service} index={index} />
          ))}
        </div>
      </Container>
    </section>
  );
}
