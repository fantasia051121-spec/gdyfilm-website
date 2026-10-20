// 公司专有信息（非文案数据）。文案翻译统一放在 src/messages/*.json。
// 公司/联系/社媒/微信数据已抽到 content/company.json，由后台可直接编辑并提交上线。
import companyData from "../../content/company.json";

export const site = companyData as {
  company: {
    name: string;
    nameZh: string;
    shortName: string;
    established: number;
    tagline: string;
  };
  contact: {
    email: string;
    phone: string;
    whatsapp: string;
    address: string;
    website: string;
  };
  social: {
    email: string;
    whatsapp: string;
    facebook: string;
    instagram: string;
    linkedin: string;
    youtube: string;
    tiktok: string;
    madeInChina: string;
    platform1688: string;
  };
  wechat: {
    id: string;
    qr: string;
  };
};

// 6 大行业配图（前 3 个有实拍图）
// ⚠️ 技术债：这里靠数组下标与 messages.*.cases.items 顺序硬配对，
//    一旦 cases.items 增/删或重排，图片就会错位。已改为可行范围外的遗留问题，
//    彻底修法是把图片字段写进 cases.items[i].img。
export const industryImages = [
  "/images/app-electronics.jpg",
  "/images/app-home.jpg",
  "/images/app-building.jpg",
  undefined,
  undefined,
  undefined,
];

// 6 大行业详情页 id，顺序与 messages.*.cases.items 及 industryImages 严格一一对应。
// 行业增删改序时三处必须同步调整（同 industryImages 的既有约定）。
export const industryIds = [
  "electronics",
  "appliances",
  "building",
  "automotive",
  "new-energy",
  "hardware",
] as const;
