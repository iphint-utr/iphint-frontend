import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export default function Section8() {
  const t = useTranslations("Landing.section8");

  return (
    <section className="w-full py-12 px-6">
      <div className="flex flex-1 max-w-7xl mx-auto bg-slate-100 rounded-[40px] py-16 px-10 flex-col md:flex-row items-center justify-between gap-8">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center md:text-left">
          {t("titleBeforeBrand")}
          <span className="font-extrabold">{t("brand")}</span>
          {t("titleAfterBrand")}
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <button className="btn-primary">
            {t("primaryCta")}
          </button>
          <Link href="/contact" className="btn-secondary">
            {t("secondaryCta")}
          </Link>
        </div>
      </div>
    </section>
  );
}