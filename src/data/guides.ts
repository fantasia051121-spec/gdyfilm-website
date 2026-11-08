/**
 * 选型知识库数据（GEO 高价值页面）
 * zh = 中文，en = 英文；其余 5 个语种当前回退英文（后续可人工校对补齐）
 */

export type CompareRow = { dimension: string; pet: string; pe: string };

export const compareContent = {
  zh: {
    title: "PET vs PE 保护膜：8 个维度一次讲清",
    subtitle: "选错胶系与基材，是残胶、划伤、成本失控的头号原因",
    intro:
      "PET 与 PE 保护膜没有绝对好坏，只有是否匹配您的制程。下面 8 个维度来自光大远 20 年、72 个在产型号的实测数据与出货记录。",
    headers: ["对比维度", "PET 保护膜", "PE 保护膜"],
    rows: [
      { dimension: "基材特性", pet: "聚酯薄膜，高透、高强、尺寸稳定", pe: "聚乙烯薄膜，柔软、延伸率大、贴合曲面" },
      { dimension: "透明度", pet: "透光率可达 ≥92%，适合光学与外观件", pe: "多为半透明、乳白、蓝/黑白，遮蔽性强" },
      { dimension: "耐温性", pet: "可达 150–180°C，适配烘烤与高温制程", pe: "一般 ≤80°C，高温易变形" },
      { dimension: "胶系选择", pet: "硅胶 / 亚克力 / PU / 防静电，可低粘到高粘", pe: "压克力胶为主，也有无胶静电吸附型" },
      { dimension: "残胶风险", pet: "硅胶/PU 体系残胶极低，适合光学面", pe: "选型不当或长时间高温贴合易残胶" },
      { dimension: "典型工艺", pet: "盖板玻璃、ITO 菲林、偏光片、晶圆 UV 降粘", pe: "钣金、型材、家电外壳、建材运输保护" },
      { dimension: "成本", pet: "单价较高，但可省清洗与返工成本", pe: "单价低，适合大面积一次性保护" },
      { dimension: "怎么选", pet: "要透明、要耐高温、要无残胶 → PET", pe: "要包曲面、要便宜、要可印刷 → PE" },
    ] as CompareRow[],
    verdictTitle: "一句话结论",
    verdict:
      "电子/光学制程用 PET，金属/建材/家电运输保护用 PE；拿不准就把被贴材料、制程温度、贴合时长告诉我们，免费寄 3 个型号实测。",
    faq: [
      { q: "PET 保护膜和 PE 保护膜哪个更贵？", a: "PET 单价通常高于 PE，但PET耐高温、无残胶，能省下清洗与返工成本；大面积一次性运输保护选 PE 更经济。" },
      { q: "保护膜撕掉有残胶是膜的问题吗？", a: "多数是胶系与制程不匹配：高温或长时间贴合需选硅胶/PU 体系 PET 膜，或按贴合时长重新选择粘力档位。" },
      { q: "防静电保护膜表面电阻选 10⁶ 还是 10⁹？", a: "看器件敏感度与是否需要持久防静电：10⁶–10⁸ 属导电/静电耗散级，10⁹–10¹¹ 属防静电级；建议提供器件规格由工程师配样。" },
    ] as { q: string; a: string }[],
    cta: "拿不准？免费拿 3 个型号实测",
  },
  en: {
    title: "PET vs PE Protective Film: 8 Dimensions, One Clear Answer",
    subtitle: "Wrong substrate or adhesive is the #1 cause of residue, scratches and cost overruns",
    intro:
      "Neither film is universally better — the right choice depends on your process. These 8 dimensions come from 20 years of measured data across 72 active GDY models.",
    headers: ["Dimension", "PET Protective Film", "PE Protective Film"],
    rows: [
      { dimension: "Substrate", pet: "Polyester film: high clarity, high strength, dimensionally stable", pe: "Polyethylene film: soft, stretchable, conforms to curves" },
      { dimension: "Clarity", pet: "Light transmittance ≥92%, ideal for optical and cosmetic parts", pe: "Often translucent, milky, blue or black/white; strong masking" },
      { dimension: "Temperature", pet: "Up to 150–180°C, suits baking and high-temp processes", pe: "Typically ≤80°C; deforms at higher temperatures" },
      { dimension: "Adhesive systems", pet: "Silicone / acrylic / PU / anti-static, from ultra-low to high tack", pe: "Mostly acrylic; also adhesive-free electrostatic cling" },
      { dimension: "Residue risk", pet: "Silicone/PU systems leave virtually no residue on optical surfaces", pe: "Wrong grade or long high-temp lamination can leave residue" },
      { dimension: "Typical processes", pet: "Cover glass, ITO film, polarizer, wafer UV adhesion-relief", pe: "Sheet metal, profiles, appliance shells, building panels in transit" },
      { dimension: "Cost", pet: "Higher unit price, but saves cleaning and rework", pe: "Low unit price, ideal for large-area one-time protection" },
      { dimension: "How to choose", pet: "Need clarity, heat resistance, zero residue → PET", pe: "Need curved surfaces, low cost, printability → PE" },
    ] as CompareRow[],
    verdictTitle: "The short answer",
    verdict:
      "PET for electronics/optical processes; PE for metal, building and appliance transit protection. Unsure? Send us your substrate, process temperature and lamination time — we ship 3 free models to test.",
    faq: [
      { q: "Is PET protective film more expensive than PE?", a: "PET has a higher unit price but resists heat and leaves no residue, saving cleaning and rework costs. For large-area one-time transit protection, PE is more economical." },
      { q: "Is adhesive residue always a film defect?", a: "Usually it is a mismatch between adhesive chemistry and process conditions. High temperature or long lamination calls for silicone/PU PET systems or a different tack grade." },
      { q: "Should anti-static film be 10⁶ or 10⁹ ohm/sq?", a: "It depends on device sensitivity and whether permanent ESD protection is required: 10⁶–10⁸ is conductive/dissipative, 10⁹–10¹¹ is anti-static. Share your device spec and our engineers will match a sample." },
    ] as { q: string; a: string }[],
    cta: "Still unsure? Get 3 free models to test",
  },
};

export type GlossaryTerm = { term: string; definition: string };

export const glossaryContent = {
  zh: {
    title: "保护膜术语表：采购与工程师必懂的 30 个词",
    subtitle: "看懂 COA、规格书和报价单，不再被参数绕晕",
    intro: "按「粘力 → 基材 → 光学 → 制程 → 检测」五组整理，全部对应光大远产品页的真实字段。",
    groups: [
      { group: "粘力与胶系", terms: [
        { term: "剥离力 (gf/25mm)", definition: "把 25mm 宽膜条以 180° 撕下所需的力，是选型第一参数" },
        { term: "低粘 / 中粘 / 高粘", definition: "按被贴物表面能分档：光面玻璃用低粘，粗糙钣金用高粘" },
        { term: "压敏胶 PSA", definition: "无需加热溶剂，轻微加压即粘附的胶系" },
        { term: "硅胶 / 亚克力 / PU 胶", definition: "三大胶系：硅胶耐温无残胶，亚克力粘力范围宽，PU 胶高透抗静电" },
        { term: "UV 降粘膜", definition: "UV 照射前高粘、照射后粘力骤降，用于晶圆/玻璃切割制程" },
        { term: "初粘力 / 持粘力", definition: "贴合瞬间的粘附力 vs 长时间保持不翘边的能力" },
      ] as GlossaryTerm[] },
      { group: "基材与结构", terms: [
        { term: "PET 聚酯薄膜", definition: "高透高强尺寸稳定，厚度常见 25–188μm" },
        { term: "PE 聚乙烯膜", definition: "柔软、延伸率大，适合曲面与大面积保护" },
        { term: "离型膜 / 离型纸", definition: "保护胶层的可剥离衬材，撕开后才贴合" },
        { term: "三层共挤", definition: "三层不同配方一次挤出成型，兼顾粘力与挺度" },
        { term: "单/双面保护膜", definition: "偏光片等光学件出货时两面同时贴膜" },
        { term: "分条 / 复卷", definition: "按客户指定宽度与卷长裁切重卷" },
      ] as GlossaryTerm[] },
      { group: "光学与电性", terms: [
        { term: "透光率", definition: "透过膜的光通量占比，光学级 PET 需 ≥92%" },
        { term: "雾度 Haze", definition: "散射光造成的朦胧程度，光学胶要求 <1%" },
        { term: "表面电阻 (Ω/sq)", definition: "防静电等级指标，常见 10⁶–10¹¹" },
        { term: "ESD 静电释放", definition: "静电放电损伤元器件，电子制程必须管控" },
        { term: "OCA 光学胶", definition: "显示屏全贴合用双面胶膜，高透低雾" },
        { term: "UV 阻隔率", definition: "阻挡紫外线的比例，防爆膜常要求 >99%" },
      ] as GlossaryTerm[] },
      { group: "制程与缺陷", terms: [
        { term: "残胶", definition: "撕膜后胶层留在被贴物上，多因胶系/温度不匹配" },
        { term: "气泡 / 自排气", definition: "贴合时卷入空气；带排气微结构的膜可自动消泡" },
        { term: "翘边", definition: "边缘受应力回弹脱开，与持粘力和厚度相关" },
        { term: "晶点 / 异物", definition: "洁净度不良点，光学膜需在千级/万级洁净室生产" },
        { term: "OGS 二次强化", definition: "触控玻璃化学加工制程，需耐酸碱保护膜" },
        { term: "镭雕 / 丝印 / 转印", definition: "盖板玻璃常见加工工序，需制程保护膜" },
      ] as GlossaryTerm[] },
      { group: "检测与商务", terms: [
        { term: "COA 出货检验报告", definition: "每批次的实测数据单，含粘力/厚度/透光率" },
        { term: "CPK 制程能力指数", definition: "批次稳定性指标，越高波动越小" },
        { term: "ISO 9001 / 14001", definition: "质量管理体系与环境管理体系认证" },
        { term: "RoHS / REACH", definition: "欧盟有害物质与化学品合规要求" },
        { term: "MOQ 最小起订量", definition: "光大远样品无 MOQ，大货按规格议定" },
        { term: "洁净室等级", definition: "千级/万级表示单位体积尘埃粒子数上限" },
      ] as GlossaryTerm[] },
    ],
  },
  en: {
    title: "Protective Film Glossary: 30 Terms Every Buyer Should Know",
    subtitle: "Read COAs, spec sheets and quotations with confidence",
    intro: "Grouped into adhesion, substrate, optical, process and QC — mapped to the real fields on GDY product pages.",
    groups: [
      { group: "Adhesion & chemistry", terms: [
        { term: "Peel adhesion (gf/25mm)", definition: "Force to peel a 25mm strip at 180° — the first parameter to specify" },
        { term: "Low / medium / high tack", definition: "Grades matched to surface energy: low for smooth glass, high for rough metal" },
        { term: "PSA (pressure-sensitive adhesive)", definition: "Adhesive that bonds under light pressure without heat or solvent" },
        { term: "Silicone / acrylic / PU adhesive", definition: "Silicone: heat-stable and residue-free; acrylic: widest tack range; PU: clear and anti-static" },
        { term: "UV adhesion-relief film", definition: "High tack before UV, drops sharply after UV — for wafer/glass dicing" },
        { term: "Initial tack / holding power", definition: "Instant grab vs long-term resistance to edge lifting" },
      ] as GlossaryTerm[] },
      { group: "Substrate & structure", terms: [
        { term: "PET polyester film", definition: "Clear, strong, dimensionally stable; typically 25–188μm" },
        { term: "PE polyethylene film", definition: "Soft and stretchable, suits curved and large surfaces" },
        { term: "Release liner", definition: "Peelable carrier protecting the adhesive until lamination" },
        { term: "3-layer co-extrusion", definition: "Three formulations extruded together to balance tack and stiffness" },
        { term: "Single / double-sided protection", definition: "Polarizers and optical parts ship with film on both faces" },
        { term: "Slitting / rewinding", definition: "Cutting and rewinding to customer-specified width and roll length" },
      ] as GlossaryTerm[] },
      { group: "Optical & electrical", terms: [
        { term: "Light transmittance", definition: "Share of light passing through; optical-grade PET requires ≥92%" },
        { term: "Haze", definition: "Scattered-light cloudiness; optical adhesives require <1%" },
        { term: "Surface resistance (Ω/sq)", definition: "ESD grade indicator, commonly 10⁶–10¹¹" },
        { term: "ESD", definition: "Electrostatic discharge that damages components; must be controlled" },
        { term: "OCA optical adhesive", definition: "Double-sided clear adhesive film for display full lamination" },
        { term: "UV block rate", definition: "UV rejection; explosion-proof films typically require >99%" },
      ] as GlossaryTerm[] },
      { group: "Process & defects", terms: [
        { term: "Adhesive residue", definition: "Adhesive left after peeling, usually a chemistry/temperature mismatch" },
        { term: "Bubbles / self-venting", definition: "Air trapped during lamination; micro-vented films release it automatically" },
        { term: "Edge lifting", definition: "Edge peels back under stress; related to holding power and thickness" },
        { term: "Gel / particle contamination", definition: "Cleanliness defects; optical films require Class 1k/10k cleanrooms" },
        { term: "OGS secondary strengthening", definition: "Chemical process for touch glass requiring acid/alkali-proof film" },
        { term: "Laser engraving / silk print / transfer", definition: "Common cover-glass processes needing in-process protection film" },
      ] as GlossaryTerm[] },
      { group: "QC & commercial", terms: [
        { term: "COA", definition: "Certificate of Analysis with measured adhesion, thickness and transmittance per batch" },
        { term: "CPK", definition: "Process capability index; higher means less batch-to-batch variation" },
        { term: "ISO 9001 / 14001", definition: "Quality and environmental management system certifications" },
        { term: "RoHS / REACH", definition: "EU hazardous substances and chemical compliance" },
        { term: "MOQ", definition: "Minimum order quantity; GDY samples have no MOQ" },
        { term: "Cleanroom class", definition: "Class 1k / 10k define the maximum particle count per volume" },
      ] as GlossaryTerm[] },
    ],
  },
};

export function guideFor(locale: string) {
  const key = locale === "zh" ? "zh" : "en";
  return { key, compare: compareContent[key], glossary: glossaryContent[key] };
}
