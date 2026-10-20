"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import Reveal from "./ui/Reveal";
import SpecTable from "./SpecTable";
import type { LocalizedModel } from "@/lib/products";
import { asset } from "@/lib/asset";
import { ArrowRight, Check, Layers } from "lucide-react";

/**
 * 单个型号卡。GDY 编号作为最醒目的标识 —— B2B 客户询价时用的是编号而不是产品名，
 * 所以编号必须始终可见，并且带进询价链接。
 */
export default function ModelCard({
  model,
  index,
  labels,
}: {
  model: LocalizedModel;
  index: number;
  labels: {
    specs: string;
    structure: string;
    applications: string;
    requestSample: string;
    viewDetails: string;
  };
}) {
  const [open, setOpen] = useState(false);
  const hasDetail = model.specs.length > 0 || model.applications.length > 0;

  return (
    <Reveal delay={Math.min(index, 6) * 0.04}>
      <article className="glass glass-hover flex h-full flex-col overflow-hidden rounded-2xl">
        <div className="relative h-40 w-full overflow-hidden bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset(model.image)}
            alt={model.name}
            loading="lazy"
            className="h-full w-full object-contain transition duration-500 hover:scale-105"
          />
          {model.code && (
            <span className="absolute start-3 top-3 rounded-md bg-ink/85 px-2 py-1 font-mono text-xs font-bold tracking-wider text-white">
              {model.code}
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-5">
          <h3 className="text-base font-semibold leading-snug text-ink">{model.name}</h3>
          {model.tagline && (
            <p className="mt-2 text-sm leading-relaxed text-muted">{model.tagline}</p>
          )}

          {model.highlights.length > 0 && (
            <ul className="mt-3 space-y-1">
              {model.highlights.map((h) => (
                <li key={h} className="flex gap-2 text-xs leading-relaxed text-ink/80">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-2" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          )}

          {hasDetail && (
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              className="mt-4 self-start text-xs font-semibold text-brand-2 underline-offset-4 hover:underline"
            >
              {open ? "−" : "+"} {labels.specs}
            </button>
          )}

          {open && (
            <div className="mt-3">
              <SpecTable rows={model.specs} />
              {model.structure.length > 0 && (
                <div className="mt-3">
                  <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand-2">
                    <Layers className="h-3.5 w-3.5" />
                    {labels.structure}
                  </div>
                  <ol className="space-y-1">
                    {model.structure.map((s, i) => (
                      <li key={s} className="flex gap-2 text-xs text-ink/80">
                        <span className="font-mono text-muted">{i + 1}</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
              {model.applications.length > 0 && (
                <div className="mt-3">
                  <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-brand-2">
                    {labels.applications}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {model.applications.map((a) => (
                      <span
                        key={a}
                        className="rounded-full bg-ink/5 px-2.5 py-1 text-xs text-ink/75"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-5 flex-1" />
          <div className="mt-2 flex gap-2">
            {model.code && (
              <Link
                href={`/products/${model.code}`}
                className="btn-primary flex-1 justify-center text-sm"
              >
                {labels.viewDetails}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
            )}
            <Link
              href={`/contact?model=${encodeURIComponent(model.code || model.id)}`}
              className="btn-ghost flex-1 justify-center text-sm"
            >
              {labels.requestSample}
            </Link>
          </div>
        </div>
      </article>
    </Reveal>
  );
}
