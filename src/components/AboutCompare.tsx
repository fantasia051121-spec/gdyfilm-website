import { getTranslations } from "next-intl/server";
import Reveal from "./ui/Reveal";

/** 「为什么东南亚工厂选我们」对照表：信任前置，采购方五问逐条回答 */
export default async function AboutCompare() {
  const t = await getTranslations("aboutCompare");
  const headers = t.raw("headers") as string[];
  const rows = t.raw("rows") as { concern: string; local: string; gdy: string }[];

  return (
    <section className="pb-16 sm:pb-24">
      <div className="container-x">
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold text-ink sm:text-3xl">{t("title")}</h2>
            <p className="mt-3 text-muted">{t("subtitle")}</p>
          </div>
        </Reveal>

        <Reveal delay={0.05}>
          <div className="mt-10 overflow-x-auto rounded-2xl border border-ink/10 bg-white/70 shadow-sm backdrop-blur">
            <table className="w-full min-w-[620px] border-collapse text-start text-sm">
              <thead>
                <tr className="border-b border-ink/10 bg-brand/5">
                  {headers.map((h, i) => (
                    <th
                      key={h}
                      className={`px-5 py-4 font-semibold ${i === 2 ? "text-brand-2" : "text-ink"}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-b border-ink/5 last:border-0">
                    <td className="px-5 py-4 font-medium text-ink">{r.concern}</td>
                    <td className="px-5 py-4 text-muted">{r.local}</td>
                    <td className="px-5 py-4 font-medium text-ink/90">{r.gdy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
