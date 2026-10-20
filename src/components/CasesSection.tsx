import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import CaseCard from "./CaseCard";
import Reveal from "./ui/Reveal";
import { industryIds } from "@/lib/site";

export default async function CasesSection() {
  const t = await getTranslations("cases");
  const items = t.raw("items") as {
    title: string;
    desc: string;
    sector: string;
  }[];

  return (
    <section className="py-16 sm:py-24">
      <div className="container-x">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-ink sm:text-4xl">
              {t("title")}
            </h2>
            <p className="mt-3 text-muted">{t("subtitle")}</p>
          </div>
        </Reveal>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it, i) => (
            <CaseCard
              key={i}
              title={it.title}
              desc={it.desc}
              sector={it.sector}
              index={i}
              href={`/cases/${industryIds[i] ?? ""}`}
            />
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link href="/services" className="btn-ghost">
            {t("viewAll")}
          </Link>
        </div>
      </div>
    </section>
  );
}
