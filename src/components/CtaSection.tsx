import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Reveal from "./ui/Reveal";
import { ArrowRight } from "lucide-react";

export default async function CtaSection() {
  const t = await getTranslations("cta");

  return (
    <section className="py-16 sm:py-24">
      <div className="container-x">
        <Reveal>
          <div className="glass relative overflow-hidden rounded-3xl p-10 text-center sm:p-16">
            <div className="pointer-events-none absolute -top-16 start-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-brand/30 blur-[100px]" />
            <h2 className="relative text-3xl font-bold text-ink sm:text-4xl">
              {t("title")}
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-muted">
              {t("subtitle")}
            </p>
            <Link href="/contact" className="btn-primary relative mt-8">
              {t("button")} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
