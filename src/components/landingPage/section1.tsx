// components/landing/Hero.tsx
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export default function Section1() {
  const t = useTranslations("Landing.section1");

  return (
    <section className="w-full py-16 md:py-24">
      <div className=" max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* LEFT CONTENT */}
        <div className="space-y-6">
          <h1 className="whitespace-pre-line text-2xl md:text-3xl lg:text-3xl font-semibold text-black leading-tight">
            {t("title")}
          </h1>

          <h2 className="text-lg md:text-xl font-semibold text-black">
            {t("subtitle")}
          </h2>

          <p className="text-gray-600 max-w-xl">
            {t("description")}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 pt-4">
            <Link
              href="/signup"
              className="btn-primary"
            >
              {t("primaryCta")}
            </Link>

            <button className="btn-secondary">
              {t("secondaryCta")}
            </button>
          </div>
        </div>

        {/* RIGHT SVG */}
        <div className="flex justify-center lg:justify-end">
          <Image
            src="/sec1_svg.svg"
            alt={t("imageAlt")}
            width={500}
            height={500}
            priority
            className="w-[80%] md:w-[70%] lg:w-full h-auto"
          />
        </div>
      </div>
    </section>
  );
}