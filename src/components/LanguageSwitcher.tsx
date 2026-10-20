"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { routing, localeLabels, type Locale } from "@/i18n/routing";
import { Globe, ChevronDown, Check } from "lucide-react";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="btn-ghost px-3 py-2 text-sm"
        aria-label="Language"
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">
          {localeLabels[locale as Locale]}
        </span>
        <ChevronDown className="h-4 w-4" />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute end-0 z-50 mt-2 w-44 rounded-xl glass p-1.5 shadow-2xl">
            {routing.locales.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => {
                  setOpen(false);
                  router.replace(pathname, { locale: l });
                }}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-ink/85 transition hover:bg-ink/5"
              >
                <span>{localeLabels[l]}</span>
                {l === locale && <Check className="h-4 w-4 text-brand-2" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
