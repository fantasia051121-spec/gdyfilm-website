"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Menu, X } from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";
import { asset } from "@/lib/asset";

const items = [
  { key: "home", href: "/" },
  { key: "about", href: "/about" },
  { key: "services", href: "/services" },
  { key: "cases", href: "/cases" },
  { key: "quality", href: "/quality" },
  { key: "news", href: "/news" },
  { key: "faq", href: "/faq" },
  { key: "contact", href: "/contact" },
];

export default function Navbar() {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "glass shadow-lg" : "bg-transparent"
      }`}
    >
      <nav className="container-x flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset("/images/logo-blue.png")}
            alt="GDY"
            className="h-9 w-9 object-contain"
          />
          <span className="text-base font-semibold text-ink">
            Guangdayuan
          </span>
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {items.map((it) => (
            <Link
              key={it.key}
              href={it.href}
              className="text-sm text-ink/80 transition hover:text-brand"
            >
              {t(it.key)}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <button
            type="button"
            className="rounded-lg p-2 text-ink md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="glass border-t border-ink/10 md:hidden">
          <div className="container-x flex flex-col gap-1 py-3">
            {items.map((it) => (
              <Link
                key={it.key}
                href={it.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm text-ink/85 transition hover:bg-ink/5"
              >
                {t(it.key)}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
