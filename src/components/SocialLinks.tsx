import { Mail, MessageCircle, Facebook, Instagram, Linkedin, Youtube } from "lucide-react";
import { site } from "@/lib/site";

// lucide-react 尚无 TikTok 图标，这里用内联 SVG 近似还原。
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M16.6 5.82a4.28 4.28 0 0 1-1.06-2.82h-3.2v13.4a2.59 2.59 0 0 1-2.58 2.58 2.58 2.58 0 0 1 0-5.16c.24 0 .47.03.69.09v-3.2a5.78 5.78 0 0 0-.69-.04 5.78 5.78 0 1 0 5.78 5.78V9.04a7.6 7.6 0 0 0 4.42 1.42V7.26a4.28 4.28 0 0 1-3.36-1.44z" />
    </svg>
  );
}

const base =
  "grid h-9 w-9 place-items-center rounded-lg glass text-ink/80 transition hover:text-brand";

export default function SocialLinks() {
  const s = site.social;
  return (
    <div className="flex flex-wrap gap-3">
      <a href={`mailto:${s.email}`} className={base} aria-label="Email">
        <Mail className="h-4 w-4" />
      </a>
      <a
        href={s.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className={base}
        aria-label="WhatsApp"
      >
        <MessageCircle className="h-4 w-4" />
      </a>
      <a
        href={s.facebook}
        target="_blank"
        rel="noopener noreferrer"
        className={base}
        aria-label="Facebook"
      >
        <Facebook className="h-4 w-4" />
      </a>
      <a
        href={s.instagram}
        target="_blank"
        rel="noopener noreferrer"
        className={base}
        aria-label="Instagram"
      >
        <Instagram className="h-4 w-4" />
      </a>
      <a
        href={s.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        className={base}
        aria-label="LinkedIn"
      >
        <Linkedin className="h-4 w-4" />
      </a>
      <a
        href={s.youtube}
        target="_blank"
        rel="noopener noreferrer"
        className={base}
        aria-label="YouTube"
      >
        <Youtube className="h-4 w-4" />
      </a>
      <a
        href={s.tiktok}
        target="_blank"
        rel="noopener noreferrer"
        className={base}
        aria-label="TikTok"
      >
        <TikTokIcon className="h-4 w-4" />
      </a>
      <a
        href={s.platform1688}
        target="_blank"
        rel="noopener noreferrer"
        className={`${base} text-xs font-bold`}
        aria-label="1688"
      >
        1688
      </a>
    </div>
  );
}
