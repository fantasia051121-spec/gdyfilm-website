import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import Hero from "@/components/Hero";
import TrustStrip from "@/components/TrustStrip";
import ServicesSection from "@/components/ServicesSection";
import AdvantagesSection from "@/components/AdvantagesSection";
import CasesSection from "@/components/CasesSection";
import NewsTeaser from "@/components/NewsTeaser";
import CtaSection from "@/components/CtaSection";
import { getModelCount } from "@/lib/products";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero modelCount={getModelCount()} />
      <TrustStrip />
      <ServicesSection locale={locale as Locale} />
      <AdvantagesSection />
      <CasesSection />
      <NewsTeaser locale={locale as Locale} />
      <CtaSection />
    </>
  );
}
