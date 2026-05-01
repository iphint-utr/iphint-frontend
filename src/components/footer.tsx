"use client";

import { Link } from "@/i18n/routing";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const translations = {
  kr: {
    col1: {
      heading: "투스타",
      links: [
        { label: "연구",  href: "/research" },
        { label: "API",  href: "/api"      },
        { label: "소개",  href: "/about"    },
      ],
    },
    col2: {
      heading: "이용약관 및 정책",
      links: [
        { label: "개인정보 보호 정책", href: "/privacy_policy"   },
        { label: "서비스 이용약관",   href: "/terms_of_service" },
        { label: "이용 정책",        href: "/policies"  },
        { label: "환불 정책",        href: "/refund_policy"    },
      ],
    },
    copyright: "©2026 Toostar. All Rights Reserved.",
    langLabel:  "한국어",
  },
  en: {
    col1: {
      heading: "Toostar",
      links: [
        { label: "Research", href: "/research" },
        { label: "API",      href: "/api"      },
        { label: "About",    href: "/about"    },
      ],
    },
    col2: {
      heading: "Terms & Policies",
      links: [
        { label: "Privacy Policy",   href: "/privacy_policy"  },
        { label: "Terms of Service", href: "/terms_of_service" },
        { label: "Usage Policy",     href: "/policies" },
        { label: "Refund Policy",    href: "/refund_policy"   },
      ],
    },
    copyright: "©2026 Toostar. All Rights Reserved.",
    langLabel:  "English",
  },
} as const;

type Locale = keyof typeof translations;

const languages = [
  { label: "한국어", value: "kr" },
  { label: "English", value: "en" },
];

function FooterLangSwitcher({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (l: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const current = languages.find((l) => l.value === selected);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-2 px-4 py-[7px] rounded-full border border-gray-300 bg-gray-100 hover:bg-gray-200 transition-colors duration-150 text-[12px] font-semibold text-gray-700 tracking-wide"
      >
        {/* Globe */}
        <svg
          width="13" height="13" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="1.8"
          strokeLinecap="round" strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        <span className="uppercase">{current?.label}</span>
        {/* Triangle ▼ */}
        <svg
          width="9" height="9" viewBox="0 0 24 24" fill="currentColor"
          aria-hidden="true"
        >
          <path d="M7 10l5 5 5-5z" />
        </svg>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <ul
            role="listbox"
            aria-label="Select language"
            className="absolute bottom-full right-0 mb-2 w-36 bg-white border border-gray-200 rounded-xl shadow-lg shadow-black/5 py-1 z-40"
          >
            {languages.map((lang) => (
              <li key={lang.value} role="option" aria-selected={lang.value === selected}>
                <button
                  onClick={() => { onSelect(lang.value); setOpen(false); }}
                  className={`w-full text-left px-4 py-2 text-[13px] transition-colors duration-150 ${
                    lang.value === selected
                      ? "text-gray-950 font-semibold bg-gray-50"
                      : "text-gray-600 hover:text-gray-950 hover:bg-gray-50"
                  }`}
                >
                  {lang.label}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default function Footer() {
  const params   = useParams();
  const router   = useRouter();
  const pathname = usePathname();

  const locale: Locale = (params?.locale as string) === "en" ? "en" : "kr";
  const t = translations[locale];

  const [selectedLang, setSelectedLang] = useState<string>(locale);

  const changeLanguage = (newLocale: string) => {
    const segments = pathname.split("/");
    segments[1] = newLocale;
    router.push(segments.join("/"));
    setSelectedLang(newLocale);
  };

  return (
    <footer className="w-full bg-white border-t border-gray-100">

      {/* ── Top section ─────────────────────────────────────────────────────── */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-10 pt-10 sm:pt-12 pb-12 sm:pb-16">
        <div className="flex flex-col gap-10 md:flex-row md:items-start">

          {/* Logo — top-left, does not grow */}
          <div className="flex-shrink-0">
            <Link href="/" aria-label="Toostar home" className="block text-gray-950">
              <img src="/logo_footer.svg" alt="Toostar" />
            </Link>
          </div>

          {/* Columns — hugging the right edge, gap between them */}
          <div className="grid gap-8 sm:grid-cols-2 md:ml-auto md:flex md:items-start md:gap-20 lg:gap-28">

            {/* Column 1 */}
            <div className="flex flex-col gap-5">
              <p className="text-[13px] text-gray-400 font-normal">
                {t.col1.heading}
              </p>
              <ul className="flex flex-col gap-[15px]">
                {t.col1.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[17px] font-normal text-gray-900 hover:text-gray-400 transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 2 */}
            <div className="flex flex-col gap-5">
              <p className="text-[13px] text-gray-400 font-normal">
                {t.col2.heading}
              </p>
              <ul className="flex flex-col gap-[15px]">
                {t.col2.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[17px] font-normal text-gray-900 hover:text-gray-400 transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </div>

      {/* ── Bottom bar ──────────────────────────────────────────────────────── */}
      <div className="border-t border-gray-200">
        <div className="max-w-[1200px] mx-auto flex min-h-[56px] flex-col gap-3 px-4 py-4 sm:h-[56px] sm:flex-row sm:items-center sm:justify-between sm:px-10 sm:py-0">
          <span className="text-center text-[13px] text-gray-500 sm:text-left">
            {t.copyright}
          </span>
          <div className="self-center sm:self-auto">
            <FooterLangSwitcher
              selected={selectedLang}
              onSelect={changeLanguage}
            />
          </div>
        </div>
      </div>

    </footer>
  );
}