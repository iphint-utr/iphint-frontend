"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { useTranslations, useLocale } from "next-intl";
import { Menu, X, ChevronDown } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logout, selectIsAuthenticated } from "@/lib/store/slices/userSlice";
import type { AppDispatch } from "@/lib/store/store";

const locales = [
  { code: "en", label: "English" },
  { code: "kr", label: "Korean" },
] as const;

export default function Header() {
  const t = useTranslations("header");
  const locale = useLocale();
  const activeLocale = locale === "kr" ? "kr" : "en";
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const langMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (!isLangMenuOpen) {
        return;
      }

      const target = event.target as Node | null;
      if (target && langMenuRef.current?.contains(target)) {
        return;
      }

      setIsLangMenuOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isLangMenuOpen]);

  const switchLocale = (nextLocale: (typeof locales)[number]["code"]) => {
    if (nextLocale === activeLocale) {
      return;
    }

    router.replace(pathname, { locale: nextLocale });
    setIsMobileMenuOpen(false);
    setIsLangMenuOpen(false);
  };

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { href: "/pricing", label: t("pricing") },
    { href: "/service", label: t("service") },
  ];

  const activeLocaleLabel = locales.find((loc) => loc.code === activeLocale)?.label ?? "English";
  const showAuthenticatedActions = isMounted && isAuthenticated;

  const isNavActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-[64px] max-w-[1440px] items-center justify-between px-6 lg:px-10">
        {/* ── Logo ── */}
        <Link
          href="/"
          className="inline-flex shrink-0 items-center"
          aria-label="IPHINT home"
        >
          <Image src="/logo_mo.svg" alt="IPHINT" width={102} height={28} priority className="block h-7 w-auto" />
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
              className={[
                "text-[15px] font-semibold transition-colors duration-150",
                isNavActive(link.href)
                  ? "text-black"
                  : "text-gray-900 hover:text-black",
              ].join(" ")}
            >
              <span className="relative inline-flex items-center">
                {link.label}
                {isNavActive(link.href) && (
                  <span className="absolute -bottom-1 left-0 h-[2px] w-full rounded-full bg-black" />
                )}
              </span>
            </Link>
          ))}
        </nav>

        {/* ── Desktop Right Actions ── */}
        <div className="hidden md:flex items-center gap-3 ml-auto">
          {showAuthenticatedActions ? (
            <>
              <Link
                href="/contact"
                className="inline-flex h-10 items-center rounded-full border border-gray-300 px-5 text-[14px] font-semibold text-gray-900 hover:border-gray-900 transition-colors duration-150"
              >
                {t("contactUs")}
              </Link>

              <div className="relative inline-block group">
                <Link
                  href="/user"
                  className="inline-flex h-10 items-center justify-center rounded-full bg-black px-5 text-[14px] font-semibold text-white transition-colors duration-150 hover:bg-gray-900"
                >
                  Dashboard
                </Link>

                <div className="invisible absolute left-0 top-full z-50 mt-1 w-full rounded-xl border border-gray-200 bg-white p-1 opacity-0 shadow-lg transition-all duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full rounded-lg px-3 py-2 text-left text-[13px] font-semibold text-gray-700 transition-colors hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/contact"
                className="inline-flex h-10 items-center rounded-full border border-gray-300 px-5 text-[14px] font-semibold text-gray-900 hover:border-gray-900 transition-colors duration-150"
              >
                {t("contactUs")}
              </Link>
              <Link
                href="/login"
                className="inline-flex h-10 items-center justify-center rounded-full bg-black px-5 text-[14px] font-semibold text-white transition-colors duration-150 hover:bg-gray-900"
              >
                Sign in
              </Link>
            </>
          )}

          <div ref={langMenuRef} className="relative inline-block">
            <button
              type="button"
              onClick={() => setIsLangMenuOpen((prev) => !prev)}
              className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-full border border-gray-200 pl-3 pr-2.5 text-[13px] font-semibold text-gray-900 transition-colors hover:border-gray-300"
              aria-haspopup="listbox"
              aria-expanded={isLangMenuOpen}
            >
              <span className="leading-none">{activeLocaleLabel}</span>
              <ChevronDown size={13} className={isLangMenuOpen ? "shrink-0 rotate-180 transition-transform" : "shrink-0 transition-transform"} />
            </button>

            {isLangMenuOpen && (
              <div className="absolute left-0 top-full z-50 mt-2 w-full rounded-xl border border-gray-200 bg-white p-1 shadow-lg">
                {locales.map((loc) => (
                  <button
                    key={loc.code}
                    type="button"
                    onClick={() => switchLocale(loc.code)}
                    className={[
                      "w-full rounded-lg px-3 py-2 text-left text-[13px] transition-colors",
                      activeLocale === loc.code
                        ? "font-semibold text-black"
                        : "text-gray-600 hover:text-black",
                    ].join(" ")}
                  >
                    {loc.label}
                  </button>
                ))}
              </div>
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
            {showAuthenticatedActions ? (
              <>
                <Link
                  href="/contact"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="inline-flex h-11 w-full items-center justify-center rounded-full border border-gray-300 text-[14px] font-semibold text-gray-900"
                >
                  {t("contactUs")}
                </Link>
                <Link
                  href="/user"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="inline-flex h-11 w-full items-center justify-center rounded-full bg-gray-950 text-[14px] font-semibold text-white"
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex h-11 w-full items-center justify-center rounded-full border border-gray-300 text-[14px] font-semibold text-gray-900"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/contact"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="inline-flex h-11 w-full items-center justify-center rounded-full border border-gray-300 text-[14px] font-semibold text-gray-900"
                >
                  {t("contactUs")}
                </Link>
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="inline-flex h-11 w-full items-center justify-center rounded-full bg-black text-[14px] font-semibold text-white transition-colors duration-150 hover:bg-gray-900"
                >
                  Sign in
                </Link>
              </>
            )}
          </div>

          {/* Mobile Language Buttons */}
          <div className="pt-4">
            <div className="grid grid-cols-2 gap-3">
              {locales.map((loc) => (
                <button
                  key={loc.code}
                  type="button"
                  onClick={() => switchLocale(loc.code)}
                  className={[
                    "inline-flex h-10 w-full items-center justify-center rounded-full border text-[13px] font-semibold transition-colors",
                    activeLocale === loc.code
                      ? "border-black bg-black text-white"
                      : "border-gray-300 bg-white text-gray-900 hover:border-gray-400",
                  ].join(" ")}
                >
                  {loc.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}