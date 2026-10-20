import { setRequestLocale } from "next-intl/server";
import AboutSection from "@/components/AboutSection";
import CtaSection from "@/components/CtaSection";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="pt-16">
      <AboutSection />
      <CtaSection />
    </div>
  );
}
