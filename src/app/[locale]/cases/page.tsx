import { setRequestLocale } from "next-intl/server";
import CasesSection from "@/components/CasesSection";
import CtaSection from "@/components/CtaSection";

export default async function CasesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="pt-16">
      <CasesSection />
      <CtaSection />
    </div>
  );
}
