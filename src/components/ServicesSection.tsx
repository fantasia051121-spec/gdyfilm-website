import { getTranslations } from "next-intl/server";
import ServiceCard from "./ServiceCard";
import Reveal from "./ui/Reveal";
import { getProductSeries } from "@/lib/products";

/**
 * 首页产品系列概览（5 个系列卡片）。
 * 数据来自 content/products.json（后台可维护），不再依赖 messages 里的固定数组，
 * 因此语种之间不存在「数组长度必须一致」的隐性约束。
 */
export default async function ServicesSection({ locale = "en" }: { locale?: string }) {
  const t = await getTranslations("services");
  const series = getProductSeries(locale);

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
          {series.map((s, i) => (
            <ServiceCard
              key={s.id}
              title={s.name}
              desc={s.intro}
              img={s.cover}
              delay={Math.min(i, 5) * 0.05}
              href={`/services#${s.id}`}
              badge={`${s.count} ${t("modelsBadge")}`}
              cta={t("viewSeries")}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
