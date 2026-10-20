import type { LocalizedSpecRow } from "@/lib/products";

/**
 * 参数表。label 已按当前语言解析好，value / unit 是数字与国际单位，保持原样不翻译。
 * 用 grid 而非 table：窄屏下 2 行式换行更自然，RTL 也不需要额外处理。
 */
export default function SpecTable({
  rows,
  title,
}: {
  rows: LocalizedSpecRow[];
  title?: string;
}) {
  if (!rows.length) return null;

  return (
    <div className="mt-4">
      {title && (
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand-2">
          {title}
        </div>
      )}
      <dl className="grid gap-x-4 gap-y-1.5 sm:grid-cols-2">
        {rows.map((r) => (
          <div
            key={r.id}
            className="flex items-baseline justify-between gap-2 border-b border-ink/5 pb-1 text-sm"
          >
            <dt className="shrink-0 text-muted">{r.label}</dt>
            <dd className="text-end font-semibold text-ink">
              {r.value}
              {r.unit ? <span className="ms-0.5 font-normal text-muted">{r.unit}</span> : null}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
