"use client";

import { useState, type FormEvent } from "react";
import { useTranslations, useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import { Send, AlertCircle } from "lucide-react";
import { trackLead } from "@/lib/gtag";

export default function ContactForm({
  source = "contact_form",
  defaultMessage = "",
  hint = "",
  submitLabel,
}: {
  source?: string;
  defaultMessage?: string;
  hint?: string;
  submitLabel?: string;
}) {
  const t = useTranslations("contact.form");
  const locale = useLocale();
  const pathname = usePathname();
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", message: defaultMessage });

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    // GA4 转化事件：表单提交意向（按来源区分普通询盘 / 样品申请）
    trackLead(source, { form_location: pathname, language: locale });
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          message: form.message,
          page: pathname,
          lang: locale,
          source,
          referrer: document.referrer,
          ua: navigator.userAgent,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "提交失败");
      }
      setSent(true);
    } catch {
      setError(t("error"));
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-brand/20 text-brand-2">
          <Send className="h-6 w-6" />
        </div>
        <p className="text-ink">{t("success")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="glass space-y-5 rounded-2xl p-8">
      <div>
        <label className="mb-2 block text-sm text-ink/85">{t("name")}</label>
        <input
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder={t("namePlaceholder")}
          className="w-full rounded-xl border border-ink/10 bg-white px-4 py-3 text-ink outline-none transition focus:border-brand"
        />
      </div>
      <div>
        <label className="mb-2 block text-sm text-ink/85">{t("email")}</label>
        <input
          required
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder={t("emailPlaceholder")}
          className="w-full rounded-xl border border-ink/10 bg-white px-4 py-3 text-ink outline-none transition focus:border-brand"
        />
      </div>
      {hint && (
        <p className="rounded-xl bg-brand/10 px-4 py-3 text-sm text-ink/80">{hint}</p>
      )}
      <div>
        <label className="mb-2 block text-sm text-ink/85">
          {t("message")}
        </label>
        <textarea
          required
          rows={4}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder={t("messagePlaceholder")}
          className="w-full rounded-xl border border-ink/10 bg-white px-4 py-3 text-ink outline-none transition focus:border-brand"
        />
      </div>
      {error && (
        <p className="flex items-center gap-2 text-sm text-red-500">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={busy}
        className="btn-primary w-full disabled:opacity-60"
      >
        {busy ? t("sending") : submitLabel || t("submit")}
      </button>
    </form>
  );
}
