"use client";

import { Link } from "@/i18n/routing";
import { useParams } from "next/navigation";

// ─── Translations ─────────────────────────────────────────────────────────────
const translations = {
  kr: {
    heading:   "역추적 검색엔진은\n쉬지않고 당신의 이미지를\n발견합니다",
    body:      "회사 도구와 연결하고 데이터 보안을 유지하고 팀이 진행하는 모든 프로젝트를 개선하세요. 여러분이 아는 챗피티기가 업무용으로 설계 되었습니다.",
    secondary: { label: "문의하기",      href: "/contact" },
    primary:   { label: "무료로 시작 >", href: "/register"  },
  },
  en: {
    heading:   "The reverse-search engine\nnever stops finding\nyour images",
    body:      "Connect your work tools, maintain data security, and improve every project your team works on. The ChatGPT you know, designed for business.",
    secondary: { label: "Contact Us",       href: "/contact" },
    primary:   { label: "Start for Free >", href: "/register"  },
  },
} as const;

type Locale = keyof typeof translations;

// ─── Component ────────────────────────────────────────────────────────────────
export default function Section1() {
  const params = useParams();
  const locale: Locale = (params?.locale as string) === "en" ? "en" : "kr";
  const t = translations[locale];

  return (
    <div className="flex flex-col-reverse p-2 md:flex-row md:my-10 w-full md:gap-12">
      <div className="flex flex-col w-full md:w-[55%] md:h-[350px]">
        <h1 className="font-semibold text-2xl md:text-4xl my-14 whitespace-pre-line">
          {t.heading}
        </h1>
        <p className="">{t.body}</p>

        <div className="w-full md:w-[55%] my-10 fc gap-2">
          <Link
            href={t.secondary.href}
            className="px-4 py-[7px] text-[13px] font-medium text-gray-700 border border-gray-300 rounded-full hover:border-gray-500 hover:text-gray-950 transition-all duration-200"
          >
            {t.secondary.label}
          </Link>
          <Link
            href={t.primary.href}
            className="px-4 py-[7px] text-[13px] font-medium text-white bg-gray-950 rounded-full hover:bg-black transition-colors duration-200 whitespace-nowrap"
          >
            {t.primary.label}
          </Link>
        </div>
      </div>

      <div className=" w-full md:w-[45%] md:min-h-[350px]">
        <img className="md:my-14" src="i1.svg" alt="image sample" />
      </div>
    </div>
  );
}