// components/landing/Hero.tsx
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

type Section1Props = {
  locale: "en" | "kr";
};

export default function Section1({ locale }: Section1Props) {
  const t = useTranslations("Landing.section1");
  const heroImageSrc = locale === "kr" ? "/sec1_svg_kr.svg" : "/sec1_svg_en.svg";

  return (
    <section className="w-full py-16 md:py-24">
      <div className="max-w-7xl mx-auto grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1fr)_520px] lg:gap-6 xl:gap-8">
        
        {/* LEFT CONTENT */}
        <div className="space-y-6 lg:pr-4">
          <h1 className="typo-t1 whitespace-pre-line text-black">
            {t("title")}
          </h1>

          <h2 className="typo-t4 text-black">
            {t("subtitle")}
          </h2>

          <p className="typo-t6-r max-w-xl text-gray-600">
            {t("description")}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 pt-4">
            <Link
              href="/signup"
              className="btn-primary btn-lg"
            >
              {t("primaryCta")}
            </Link>

            <Link href="/contact" className="btn-secondary btn-lg">
              {t("secondaryCta")}
            </Link>
          </div>
        </div>

        {/* RIGHT SVG */}
        <div className="flex justify-center lg:justify-end">
          <div className="relative flex w-full max-w-[520px] items-center justify-center overflow-hidden rounded-[32px]">
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#d7dbe0_2px,_transparent_2px)] [background-size:22px_22px]"
            />
            <Image
              src={heroImageSrc}
              alt={t("imageAlt")}
              width={520}
              height={520}
              priority
              className="relative z-10 h-auto w-full max-w-[520px] object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}