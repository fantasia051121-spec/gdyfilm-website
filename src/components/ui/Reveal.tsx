import type { CSSProperties, ReactNode } from "react";

// 纯 CSS 入场动画（不依赖 JS hydration，SSG/SEO 更稳健）
export default function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const style: CSSProperties = delay
    ? { animationDelay: `${delay}s` }
    : {};
  return (
    <div className={`anim-fade-up ${className ?? ""}`} style={style}>
      {children}
    </div>
  );
}
