"use client";

import { Link } from "@/i18n/routing";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { StarIcon } from "@/components/navbar";

// ─── Translations ─────────────────────────────────────────────────────────────
const translations = {
  kr: {
    columns: [
      {
        heading: "투스타",
        links: [
          { label: "소개",  href: "/about"    },
          { label: "가격",  href: "/pricing"  },
          { label: "연구",  href: "/research" },
          { label: "API",  href: "/api"      },
          { label: "뉴스",  href: "/news"     },
          { label: "블로그", href: "/blog"     },
        ],
      },
      {
        heading: "이용약관 및 정책",
        links: [
          { label: "개인정보 보호 정책", href: "/privacy"  },
          { label: "기타 정책",        href: "/policies" },
        ],
      },
    ],
    copyright:   "toostar@2026",
    cookieLabel: "쿠키 관리",
    cookieHref:  "/cookies",
  },
  en: {
    columns: [
      {
        heading: "Toostar",
        links: [
          { label: "About",    href: "/about"    },
          { label: "Pricing",  href: "/pricing"  },
          { label: "Research", href: "/research" },
          { label: "API",      href: "/api"      },
          { label: "News",     href: "/news"     },
          { label: "Blog",     href: "/blog"     },
        ],
      },
      {
        heading: "Terms & Policies",
        links: [
          { label: "Privacy Policy",    href: "/privacy"  },
          { label: "Other Policies",    href: "/policies" },
        ],
      },
    ],
    copyright:   "toostar@2026",
    cookieLabel: "Cookie Settings",
    cookieHref:  "/cookies",
  },
} as const;

type Locale = keyof typeof translations;

// ─── Zod v4 schemas ───────────────────────────────────────────────────────────
const SocialIconEnum = z.enum(["x", "youtube", "linkedin", "github", "instagram", "tiktok"]);

const SocialLinkSchema = z.object({
  name: z.string().min(1),
  href: z.string().min(1),
  icon: SocialIconEnum,
});

type SocialLink = z.infer<typeof SocialLinkSchema>;

// ─── Static config (language-agnostic) ───────────────────────────────────────
const socialLinks: SocialLink[] = [
  { name: "X (Twitter)", href: "https://x.com",         icon: "x"         },
  { name: "YouTube",     href: "https://youtube.com",   icon: "youtube"   },
  { name: "LinkedIn",    href: "https://linkedin.com",  icon: "linkedin"  },
  { name: "GitHub",      href: "https://github.com",    icon: "github"    },
  { name: "Instagram",   href: "https://instagram.com", icon: "instagram" },
  { name: "TikTok",      href: "https://tiktok.com",    icon: "tiktok"    },
];

const languages = ["한국어", "English"];

// ─── Social Icons ─────────────────────────────────────────────────────────────
function SocialIcon({ type }: { type: SocialLink["icon"] }) {
  switch (type) {
    case "x":
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case "youtube":
      return (
        <svg width="17" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      );
    case "linkedin":
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      );
    case "github":
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
        </svg>
      );
    case "instagram":
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
        </svg>
      );
    case "tiktok":
      return (
        <svg width="14" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" />
        </svg>
      );
  }
}

// ─── Language Switcher ────────────────────────────────────────────────────────
function FooterLangSwitcher({
  languages, selected, onSelect,
}: {
  languages: string[];
  selected:  string;
  onSelect:  (l: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative flex items-center">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-1.5 text-[13px] text-gray-700 hover:text-gray-950 transition-colors duration-200 font-medium"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="1.8"
          strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        <p className="hidden md:block">{selected}</p>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} aria-hidden="true" />
          <ul
            role="listbox"
            aria-label="Select language"
            className="absolute bottom-full right-0 mb-2 w-32 bg-white border border-gray-200 rounded-xl shadow-lg shadow-black/5 py-1 z-40"
          >
            {languages.map((lang) => (
              <li key={lang} role="option" aria-selected={lang === selected}>
                <button
                  onClick={() => { onSelect(lang === "English" ? "en" : "kr"); setOpen(false); }}
                  className={`w-full text-left px-4 py-2 text-[13px] transition-colors duration-150 ${
                    lang === selected
                      ? "text-gray-950 font-semibold bg-gray-50"
                      : "text-gray-600 hover:text-gray-950 hover:bg-gray-50"
                  }`}
                >
                  {lang}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
export default function Footer() {
  const params   = useParams();
  const router   = useRouter();
  const pathname = usePathname();

  const locale: Locale = (params?.locale as string) === "en" ? "en" : "kr";
  const t = translations[locale];

  const [selectedLang, setSelectedLang] = useState<string>(
    locale === "en" ? "English" : "한국어"
  );

  const changeLanguage = (newLocale: string) => {
    const segments = pathname.split("/");
    segments[1] = newLocale;
    router.push(segments.join("/"));
    setSelectedLang(newLocale === "en" ? "English" : "한국어");
  };

  return (
    <footer className="w-full bg-white border-t border-gray-100">

      {/* ── Top section ─────────────────────────────────────────────────────── */}
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 pt-14 pb-16">
        <div className="flex flex-row md:justify-between gap-12 md:gap-8">

          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" aria-label="Toostar home" className="text-gray-950 block">
              <img src="/logo2.svg" alt="logo2" />
            </Link>
          </div>

          {/* Link columns */}
          <div className="flex flex-row gap-10 sm:gap-20 md:gap-28 lg:gap-36">
            {t.columns.map((col) => (
              <div key={col.heading} className="flex flex-col gap-5">
                <p className="text-[13px] font-semibold text-gray-500 tracking-wide">
                  {col.heading}
                </p>
                <ul className="flex flex-col gap-[14px]">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-[14px] text-gray-600 hover:text-gray-950 transition-colors duration-200"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* ── Bottom bar ──────────────────────────────────────────────────────── */}
      <div className="border-t border-gray-200">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 h-[56px] flex items-center justify-between gap-4">

          {/* Left: copyright + cookie */}
          <div className="flex flex-col md:flex-row items-center gap-1 md:gap-3 text-[12px] text-gray-500">
            <span>{t.copyright}</span>
            <Link
              href={t.cookieHref}
              className="hover:text-gray-800 transition-colors duration-200"
            >
              {t.cookieLabel}
            </Link>
          </div>

          {/* Right: social icons + divider + language */}
          <div className="flex items-center gap-3 sm:gap-4">

            <div className="flex items-center gap-3 sm:gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className="text-gray-700 hover:text-gray-950 transition-colors duration-200 flex items-center justify-center"
                >
                  <SocialIcon type={social.icon} />
                </a>
              ))}
            </div>

            <div className="w-px h-4 bg-gray-300" aria-hidden="true" />

            <FooterLangSwitcher
              languages={languages}
              selected={selectedLang}
              onSelect={changeLanguage}
            />

          </div>
        </div>
      </div>

    </footer>
  );
}
