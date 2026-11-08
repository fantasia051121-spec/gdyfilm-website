import { setRequestLocale } from "next-intl/server";
import AboutSection from "@/components/AboutSection";
import AboutCompare from "@/components/AboutCompare";
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
      <AboutCompare />
      <CtaSection />
    </div>
  );
}
