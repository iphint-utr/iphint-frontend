"use client";

import { Link } from "@/i18n/routing";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";

// ─── Translations ─────────────────────────────────────────────────────────────
const translations = {
  kr: {
    navItems: [
      { label: "소개",     href: "/about"    },
      { label: "기능",     href: "/features" },
      { label: "가격",     href: "/pricing"  },
      { label: "비즈니스", href: "/business" },
    ],
    ctaSecondary: { label: "문의하기",      href: "/contact" },
    ctaPrimary:   { label: "무료로 시작 >", href: "/register"  },
  },
  en: {
    navItems: [
      { label: "About",    href: "/about"    },
      { label: "Features", href: "/features" },
      { label: "Pricing",  href: "/pricing"  },
      { label: "Business", href: "/business" },
    ],
    ctaSecondary: { label: "Contact Us",       href: "/contact" },
    ctaPrimary:   { label: "Start for Free >", href: "/register"  },
  },
} as const;

type Locale = keyof typeof translations;

// ─── Zod v4 schemas ───────────────────────────────────────────────────────────
const NavItemSchema = z.object({
  label: z.string().min(1),
  href:  z.union([z.string().url(), z.string().startsWith("/")]),
});

const NavConfigSchema = z.object({
  languages:       z.array(z.string().min(1)).min(1),
  defaultLanguage: z.string().min(1),
});

type NavItem   = z.infer<typeof NavItemSchema>;
type NavConfig = z.infer<typeof NavConfigSchema>;

const config: NavConfig = NavConfigSchema.parse({
  languages:       ["한국어", "English"],
  defaultLanguage: "한국어",
});

// ─── StarIcon — exported so footer can import ─────────────────────────────────
export function StarIcon({
  size = 22,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={Math.round((size * 42) / 38)}
      viewBox="0 0 38 42"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M19 0 C21 14,24 18,38 21 C24 24,21 28,19 42 C17 28,14 24,0 21 C14 18,17 14,19 0 Z"
        fill="currentColor"
      />
    </svg>
  );
}

// ─── Logo ─────────────────────────────────────────────────────────────────────
function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 flex-shrink-0 group text-gray-950">
      <img src="/logo.svg" alt="logo" />
    </Link>
  );
}

// ─── Desktop Nav ──────────────────────────────────────────────────────────────
function DesktopNav({ items }: { items:readonly NavItem[] }) {
  return (
    <nav aria-label="Primary navigation" className="hidden font-semibold md:flex items-center gap-8">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="text-[14px] text-gray-500 hover:text-gray-900 transition-colors duration-200 font-medium"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

// ─── Language Switcher ────────────────────────────────────────────────────────
function LanguageSwitcher({
  languages, selected, onSelect, dropUp = false,
}: {
  languages: string[];
  selected:  string;
  onSelect:  (l: string) => void;
  dropUp?:   boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative flex">
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
        {selected}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} aria-hidden="true" />
          <ul
            role="listbox"
            aria-label="Select language"
            className={`absolute ${dropUp ? "bottom-full mb-2" : "top-full mt-2"} right-0 w-32 bg-white border border-gray-200 rounded-xl shadow-lg shadow-black/5 py-1 z-40`}
          >
            {languages.map((lang, i) => (
              <li key={i} role="option" aria-selected={lang === selected}>
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

// ─── CTA Buttons ─────────────────────────────────────────────────────────────
function CTAButtons({
  secondary, primary,
}: {
  secondary: { label: string; href: string };
  primary:   { label: string; href: string };
}) {
  return (
    <div className="hidden md:flex items-center gap-2">
      <Link
        href={secondary.href}
        className="px-4 py-[7px] text-[13px] font-medium text-gray-700 border border-gray-300 rounded-full hover:border-gray-500 hover:text-gray-950 transition-all duration-200"
      >
        {secondary.label}
      </Link>
      <Link
        href={primary.href}
        className="px-4 py-[7px] text-[13px] font-medium text-white bg-gray-950 rounded-full hover:bg-black transition-colors duration-200 whitespace-nowrap"
      >
        {primary.label}
      </Link>
    </div>
  );
}

// ─── Mobile Menu ──────────────────────────────────────────────────────────────
function MobileMenu({
  items, secondary, primary, languages, selectedLang, onSelectLang, open, onClose,
}: {
  items:        readonly NavItem[];
  secondary:    { label: string; href: string };
  primary:      { label: string; href: string };
  languages:    string[];
  selectedLang: string;
  onSelectLang: (l: string) => void;
  open:         boolean;
  onClose:      () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-100 shadow-lg shadow-black/5 z-40"
      role="dialog" aria-modal="true" aria-label="Mobile navigation"
    >
      <div className="flex flex-col px-5 py-4 gap-1">
        {items.map((item) => (
          <Link
            key={item.href} href={item.href} onClick={onClose}
            className="py-2.5 text-[15px] text-gray-700 hover:text-gray-950 font-medium transition-colors border-b border-gray-100 last:border-0"
          >
            {item.label}
          </Link>
        ))}

        <div className="mt-3 pt-4 border-t border-gray-100 flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            {languages.map((lang) => (
              <button
                key={lang}
                onClick={() => onSelectLang(lang === "English" ? "en" : "kr")}
                className={`px-3 py-1.5 text-[12px] rounded-full border transition-all duration-150 ${
                  lang === selectedLang
                    ? "border-gray-900 text-gray-950 font-semibold bg-gray-50"
                    : "border-gray-300 text-gray-600 hover:border-gray-500"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          <Link
            href={secondary.href} onClick={onClose}
            className="w-full text-center px-4 py-2.5 text-[14px] font-medium text-gray-700 border border-gray-300 rounded-full hover:border-gray-500 transition-all duration-200"
          >
            {secondary.label}
          </Link>
          <Link
            href={primary.href} onClick={onClose}
            className="w-full text-center px-4 py-2.5 text-[14px] font-medium text-white bg-gray-950 rounded-full hover:bg-black transition-colors duration-200"
          >
            {primary.label}
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
export default function Navbar() {
  const params   = useParams();
  const router   = useRouter();
  const pathname = usePathname();

  const locale: Locale = (params?.locale as string) === "en" ? "en" : "kr";
  const t = translations[locale];

  const [selectedLang, setSelectedLang] = useState<string>(
    locale === "en" ? "English" : "한국어"
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  const changeLanguage = (newLocale: string) => {
    const segments = pathname.split("/");
    segments[1] = newLocale;
    router.push(segments.join("/"));
    setSelectedLang(newLocale === "en" ? "English" : "한국어");
  };

  return (
    <header className="relative w-full bg-white py-6">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 h-[60px] flex items-center justify-between gap-8">

        <Logo />
        <DesktopNav items={t.navItems} />

        <div className="flex items-center gap-3">
          <div className="hidden md:flex">
            <LanguageSwitcher
              languages={config.languages}
              selected={selectedLang}
              onSelect={changeLanguage}
            />
          </div>
          <CTAButtons secondary={t.ctaSecondary} primary={t.ctaPrimary} />

          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-[5px]"
          >
            <span className={`block w-5 h-[1.5px] bg-gray-800 transition-all duration-300 origin-center ${mobileOpen ? "rotate-45 translate-y-[6.5px]" : ""}`} />
            <span className={`block w-5 h-[1.5px] bg-gray-800 transition-all duration-300 ${mobileOpen ? "opacity-0 scale-x-0" : ""}`} />
            <span className={`block w-5 h-[1.5px] bg-gray-800 transition-all duration-300 origin-center ${mobileOpen ? "-rotate-45 -translate-y-[6.5px]" : ""}`} />
          </button>
        </div>
      </div>

      <MobileMenu
        items={t.navItems}
        secondary={t.ctaSecondary}
        primary={t.ctaPrimary}
        languages={config.languages}
        selectedLang={selectedLang}
        onSelectLang={changeLanguage}
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
    </header>
  );
}
