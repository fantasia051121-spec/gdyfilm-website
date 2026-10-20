"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Send } from "lucide-react";

export default function ContactForm() {
  const t = useTranslations("contact.form");
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    // TODO: 对接真实提交接口（邮件服务 / 表单后端）
    setSent(true);
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
      <button type="submit" className="btn-primary w-full">
        {t("submit")}
      </button>
    </form>
  );
}
