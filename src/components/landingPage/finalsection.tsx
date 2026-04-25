"use client";

import { useParams } from "next/navigation";

// ─── Translations ─────────────────────────────────────────────────────────────
const translations = {
  kr: {
    newsLabel: "뉴스",
    newsItems: [
      { title: "뉴욕타임즈", description: "강력한 보안 기능을 갖춘" },
      { title: "뉴욕타임즈", description: "강력한 보안 기능을 갖춘" },
      { title: "뉴욕타임즈", description: "강력한 보안 기능을 갖춘" },
    ],
    ctaBannerNormal: "365일 동안\u00a0",
    ctaBannerBold:   "무료로 시작하기",
    contactBtn:      "문의하기",
    startBtn:        "지금 시작하기 >",
  },
  en: {
    newsLabel: "News",
    newsItems: [
      { title: "New York Times", description: "Equipped with strong security features" },
      { title: "New York Times", description: "Equipped with strong security features" },
      { title: "New York Times", description: "Equipped with strong security features" },
    ],
    ctaBannerNormal: "365 days\u00a0",
    ctaBannerBold:   "Start for Free",
    contactBtn:      "Contact Us",
    startBtn:        "Start Now >",
  },
} as const;

type Locale = keyof typeof translations;

// ─── Component ────────────────────────────────────────────────────────────────
export default function FinalSection() {
  const params = useParams();
  const locale: Locale = (params?.locale as string) === "en" ? "en" : "kr";
  const t = translations[locale];

  return (
    <div className="w-full font-sans">
      {/* News Section */}
      <section className="bg-white px-2 py-12">
        <p className="text-lg text-gray-400 mb-8 tracking-wide">
          {t.newsLabel}
        </p>

        <div className="flex flex-col md:flex-row md:justify-between w-full">
          {t.newsItems.map((item, index) => (
            <div key={index} className="flex flex-col gap-4 pb-24">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                {item.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="bg-gray-100 px-4 md:px-16 py-10 flex items-center justify-between">
        <h2 className="mr-3 text-2xl md:text-4xl font-black text-gray-900 tracking-tight">
          <span className="font-normal">{t.ctaBannerNormal}</span>
          <span className="font-black">{t.ctaBannerBold}</span>
        </h2>

        <div className="flex flex-col md:flex-row items-center gap-4">
          <button className="text-sm text-gray-700 hover:text-gray-900 transition-colors px-2 py-1">
            {t.contactBtn}
          </button>
          <button className="bg-gray-900 text-white text-sm font-medium px-6 py-3 rounded-full hover:bg-black transition-colors whitespace-nowrap">
            {t.startBtn}
          </button>
        </div>
      </section>
    </div>
  );
}
