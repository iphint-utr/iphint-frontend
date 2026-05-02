import { useTranslations } from "next-intl";

export default function Section8() {
  const t = useTranslations("Landing.section8");

  return (
    <section className="py-12 px-6">
      <div className=" flex flex-1 max-w-7xl mx-auto bg-slate-100 rounded-[40px] py-16 px-10 md:px-20 flex flex-col md:flex-row items-center justify-between gap-8">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center md:text-left">
          {t("titleBeforeBrand")}
          <span className="font-extrabold">{t("brand")}</span>
          {t("titleAfterBrand")}
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <button className="bg-black text-white px-10 py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all active:scale-95">
            {t("primaryCta")}
          </button>
          <button className="bg-white text-black border border-gray-200 px-10 py-4 rounded-2xl font-bold hover:bg-gray-50 transition-all active:scale-95">
            {t("secondaryCta")}
          </button>
        </div>
      </div>
    </section>
  );
}