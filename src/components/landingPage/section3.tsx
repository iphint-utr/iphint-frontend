"use client";

import Image from "next/image";
import { useParams } from "next/navigation";

// ─── Translations ─────────────────────────────────────────────────────────────
const translations = {
  kr: {
    heading:     "콘텐츠 보호의 시작",
    subheading1: "개인정보 보호 및 보안이 기본적으로 포함된 ChatGPT가 제공하는 최고의 기능을 팀이 활용하도록 하세요.",
    subheading2: "간편하게 플랜 규모를 조정하고 옵션 크레딧을 추가할 수 있으며 언제든지 취소할 수 있습니다.",
    features: [
      {
        icon: "/icon1.svg",
        title: "딥웹 탐지",
        description: "일반 검색 엔진이 찾지 못하는 성인사이트, 불법 스트리밍 사이트까지 모두 검색합니다",
      },
      {
        icon: "/icon2.svg",
        title: "높은 정확도",
        description: "AI 기반 이미지 매칭 기술로 변형된 이미지도 정확하게 찾아냅니다",
      },
      {
        icon: "/icon3.svg",
        title: "알림 서비스",
        description: "새로운 일치 항목이 발견되면 즉시 알림을 받아 빠르게 대응할 수 있습니다",
      },
      {
        icon: "/icon4.svg",
        title: "안전한 보관",
        description: "업로드한 이미지는 암호화되어 안전하게 보관됩니다. 개인정보 보호를 최우선으로 합니다",
      },
    ],
    ctaText:  "에이전시, 엔터프라이즈 역할에 레지던시가 필요하신가요?",
    ctaLink:  "세일즈 문의",
  },
  en: {
    heading:     "The Start of Content Protection",
    subheading1: "Empower your team with the best features ChatGPT offers, with privacy protection and security included by default.",
    subheading2: "Easily scale your plan, add optional credits, and cancel anytime.",
    features: [
      {
        icon: "/icon1.svg",
        title: "Deep Web Detection",
        description: "Searches adult sites and illegal streaming platforms that regular search engines cannot find",
      },
      {
        icon: "/icon2.svg",
        title: "High Accuracy",
        description: "AI-powered image matching technology accurately identifies even modified images",
      },
      {
        icon: "/icon3.svg",
        title: "Alert Service",
        description: "Receive instant notifications when a new match is found so you can respond quickly",
      },
      {
        icon: "/icon4.svg",
        title: "Secure Storage",
        description: "Uploaded images are encrypted and stored securely. Privacy protection is our top priority",
      },
    ],
    ctaText:  "Need residency for agency or enterprise roles?",
    ctaLink:  "Contact Sales",
  },
} as const;

type Locale = keyof typeof translations;

// ─── Component ────────────────────────────────────────────────────────────────
export default function Section3() {
  const params = useParams();
  const locale: Locale = (params?.locale as string) === "en" ? "en" : "kr";
  const t = translations[locale];

  return (
    <section className="w-full bg-white py-16 px-2">
      {/* Header */}
      <div className="mb-10">
        <h2 className=" text-2xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
          {t.heading}
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          {t.subheading1}
          <br className="hidden sm:block" />
          {t.subheading2}
        </p>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {t.features.map((feature, index) => (
          <div
            key={index}
            className="bg-gray-100 rounded-xl p-6 flex flex-col gap-3"
          >
            <Image src={feature.icon} alt={feature.title} height={26} width={26} />
            <h3 className="text-base font-bold text-gray-900">{feature.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="text-center text-sm text-gray-500">
        {t.ctaText}{" "}
        <span className="font-semibold text-gray-900 cursor-pointer hover:underline">
          {t.ctaLink}
        </span>
      </div>
    </section>
  );
}
