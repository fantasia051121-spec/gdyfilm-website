/** 输出 JSON-LD 结构化数据脚本（服务端渲染，供 Google / AI 搜索引擎读取） */
export default function JsonLd({ data }: { data: unknown }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
