"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Globe, ChevronDown, Menu, X } from "lucide-react";

const locales = [
  { code: "en", label: "ENGLISH" },
  { code: "ko", label: "KOREAN" },
];

export default function Header() {
  const t = useTranslations("header");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const currentLocaleLabel =
    locales.find((l) => l.code === locale)?.label ?? "ENGLISH";

  const switchLocale = (nextLocale: string) => {
    // Replace the locale segment in the pathname
    const segments = pathname.split("/");
    segments[1] = nextLocale;
    router.push(segments.join("/"));
    setIsLangOpen(false);
  };

  const navLinks = [
    { href: `/${locale}/pricing`, label: t("pricing") },
    { href: `/${locale}/service`, label: t("service") },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-[64px] max-w-[1440px] items-center justify-between px-6 lg:px-10">
        {/* ── Logo ── */}
        <Link
          href={`/${locale}`}
          className="flex items-center gap-1.5 shrink-0"
          aria-label="IpHint home"
        >
          {/* Bookmark icon mark */}
          <svg
            width="22"
            height="26"
            viewBox="0 0 22 26"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M0 0H22V26L11 19.5L0 26V0Z"
              fill="#111111"
            />
            <path
              d="M6 8H16"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <span className="text-[22px] font-extrabold tracking-tight text-gray-950 leading-none">
            Ip<span className="font-extrabold">H</span>int
          </span>
        </Link>

        {/* ── Desktop Nav ── */}
        <nav
          className="hidden md:flex items-center gap-8 ml-10"
          aria-label="Main navigation"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[15px] font-semibold text-gray-900 hover:text-black transition-colors duration-150"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* ── Desktop Right Actions ── */}
        <div className="hidden md:flex items-center gap-3 ml-auto">
          {/* Contact Us */}
          <Link
            href={`/${locale}/contact`}
            className="inline-flex h-10 items-center rounded-full border border-gray-300 px-5 text-[14px] font-semibold text-gray-900 hover:border-gray-900 transition-colors duration-150"
          >
            {t("contactUs")}
          </Link>

          {/* Get Started Now */}
          <Link
            href={`/${locale}/get-started`}
            className="inline-flex h-10 items-center rounded-full bg-gray-950 px-5 text-[14px] font-semibold text-white hover:bg-black transition-colors duration-150"
          >
            {t("getStarted")}
          </Link>

          {/* Divider */}
          <div className="h-6 w-px bg-gray-200 mx-1" aria-hidden="true" />

          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setIsLangOpen((prev) => !prev)}
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-gray-200 px-3.5 text-[13px] font-medium text-gray-700 hover:border-gray-400 transition-colors duration-150"
              aria-haspopup="listbox"
              aria-expanded={isLangOpen}
            >
              <Globe size={14} strokeWidth={1.8} />
              {currentLocaleLabel}
              <ChevronDown
                size={13}
                strokeWidth={2}
                className={`transition-transform duration-200 ${isLangOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isLangOpen && (
              <>
                {/* Overlay to close */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsLangOpen(false)}
                />
                <ul
                  role="listbox"
                  className="absolute right-0 top-11 z-50 w-36 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg"
                >
                  {locales.map((loc) => (
                    <li key={loc.code}>
                      <button
                        role="option"
                        aria-selected={locale === loc.code}
                        onClick={() => switchLocale(loc.code)}
                        className={`flex w-full items-center px-4 py-2.5 text-[13px] font-medium transition-colors hover:bg-gray-50 ${
                          locale === loc.code
                            ? "text-gray-950 font-semibold"
                            : "text-gray-600"
                        }`}
                      >
                        {loc.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>

        {/* ── Mobile Hamburger ── */}
        <button
          className="md:hidden ml-auto p-2 rounded-lg hover:bg-gray-100 transition-colors"
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? (
            <X size={22} strokeWidth={2} />
          ) : (
            <Menu size={22} strokeWidth={2} />
          )}
        </button>
      </div>

      {/* ── Mobile Menu ── */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-6 pb-6 pt-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-3 text-[15px] font-semibold text-gray-900 border-b border-gray-100 last:border-0"
            >
              {link.label}
            </Link>
          ))}

          <div className="pt-4 flex flex-col gap-3">
            <Link
              href={`/${locale}/contact`}
              onClick={() => setIsMobileMenuOpen(false)}
              className="inline-flex h-11 w-full items-center justify-center rounded-full border border-gray-300 text-[14px] font-semibold text-gray-900"
            >
              {t("contactUs")}
            </Link>
            <Link
              href={`/${locale}/get-started`}
              onClick={() => setIsMobileMenuOpen(false)}
              className="inline-flex h-11 w-full items-center justify-center rounded-full bg-gray-950 text-[14px] font-semibold text-white"
            >
              {t("getStarted")}
            </Link>
          </div>

          {/* Mobile Language Toggle */}
          <div className="pt-4 flex gap-2">
            {locales.map((loc) => (
              <button
                key={loc.code}
                onClick={() => {
                  switchLocale(loc.code);
                  setIsMobileMenuOpen(false);
                }}
                className={`flex-1 h-9 rounded-full border text-[12px] font-semibold transition-colors ${
                  locale === loc.code
                    ? "border-gray-950 bg-gray-950 text-white"
                    : "border-gray-200 text-gray-600 hover:border-gray-400"
                }`}
              >
                {loc.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}