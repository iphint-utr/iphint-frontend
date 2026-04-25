"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";

// ─── Translations ─────────────────────────────────────────────────────────────
const translations = {
  kr: {
    subtitle: "디지털 콘텐츠 이미지 모니터링 도구를 신뢰하는 기업",
  },
  en: {
    subtitle: "Companies that trust our digital content image monitoring tool",
  },
} as const;

type Locale = keyof typeof translations;

// ─── SVG Logo Components ──────────────────────────────────────────────────────
const ZendeskLogo = () => (
  <svg viewBox="0 0 110 30" className="h-7 w-auto" fill="currentColor">
    <text
      x="0" y="24"
      fontSize="24"
      fontWeight="400"
      fontFamily="'Proxima Nova', 'Helvetica Neue', Arial, sans-serif"
      letterSpacing="-0.5"
    >
      zendesk
    </text>
  </svg>
);

const RiotGamesLogo = () => (
  <svg viewBox="0 0 110 44" className="h-10 w-auto" fill="currentColor">
    <path d="M2 2 L20 2 L26 8 L26 30 L14 38 L2 30 Z" />
    <path d="M5 5 L17 5 L22 10 L22 28 L14 34 L6 28 Z" fill="white" />
    <path d="M8 10 L16 10 L19 13 L19 26 L14 30 L9 26 Z" fill="currentColor" />
    <text x="32" y="20" fontSize="13" fontWeight="900" fontFamily="'Arial Black', sans-serif" letterSpacing="1.5">RIOT</text>
    <text x="32" y="34" fontSize="9"  fontWeight="700" fontFamily="'Arial Black', sans-serif" letterSpacing="2">GAMES</text>
  </svg>
);

const SyneosHealthLogo = () => (
  <svg viewBox="0 0 120 48" className="h-11 w-auto" fill="currentColor">
    <g transform="translate(80, 4)">
      <circle cx="10" cy="10" r="9" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <path d="M5 10 Q10 2 15 10" fill="currentColor" />
    </g>
    <text x="0" y="30" fontSize="22" fontWeight="600" fontFamily="'Trebuchet MS', 'Gill Sans', sans-serif" letterSpacing="-0.5">Syneos</text>
    <text x="22" y="43" fontSize="11" fontWeight="400" fontFamily="'Trebuchet MS', sans-serif" letterSpacing="0.5">Health</text>
  </svg>
);

const BlockLogo = () => (
  <svg viewBox="0 0 96 30" className="h-8 w-auto" fill="currentColor">
    <rect x="0"  y="1"  width="9" height="9" rx="0.5" />
    <rect x="11" y="1"  width="9" height="9" rx="0.5" />
    <rect x="0"  y="12" width="9" height="9" rx="0.5" />
    <rect x="11" y="12" width="9" height="9" rx="0.5" />
    <text x="26" y="21" fontSize="20" fontWeight="500" fontFamily="'Helvetica Neue', Arial, sans-serif" letterSpacing="-0.3">block</text>
  </svg>
);

const AsanaLogo = () => (
  <svg viewBox="0 0 100 30" className="h-8 w-auto" fill="currentColor">
    <circle cx="12" cy="18" r="6" />
    <circle cx="24" cy="11" r="6" />
    <circle cx="36" cy="18" r="6" />
    <text x="46" y="23" fontSize="19" fontWeight="500" fontFamily="'Helvetica Neue', Arial, sans-serif" letterSpacing="-0.3">asana</text>
  </svg>
);

const companies = [
  { name: "Zendesk",      Logo: ZendeskLogo      },
  { name: "Riot Games",   Logo: RiotGamesLogo    },
  { name: "Syneos Health", Logo: SyneosHealthLogo },
  { name: "Block",        Logo: BlockLogo        },
  { name: "Asana",        Logo: AsanaLogo        },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function TrustedCompanies() {
  const params = useParams();
  const locale: Locale = (params?.locale as string) === "en" ? "en" : "kr";
  const t = translations[locale];

  const [visible,    setVisible]    = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.25 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="w-full bg-white py-12 flex flex-col items-center p-2"
    >
      <p
        className="text-sm md:text-lg text-gray-500 font-semibold mb-12 tracking-wide transition-all duration-700"
        style={{
          fontFamily: "'Noto Sans KR', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif",
          opacity:   visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(10px)",
          transitionDelay: "0ms",
        }}
      >
        {t.subtitle}
      </p>

      <div className="flex w-full flex-wrap items-center justify-center md:justify-between gap-x-16 gap-y-8 ">
        {companies.map(({ name, Logo }, i) => (
          <div
            key={name}
            className="text-gray-800 hover:text-black transition-colors duration-200"
            style={{
              opacity:   visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(16px)",
              transition: `opacity 0.6s ease ${150 + i * 100}ms, transform 0.6s ease ${150 + i * 100}ms`,
            }}
            title={name}
          >
            <Logo />
          </div>
        ))}
      </div>
    </section>
  );
}
