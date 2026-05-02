import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

const pressArticles = [
  {
    id: 1,
    href: "#",
  },
  {
    id: 2,
    href: "#",
  },
  {
    id: 3,
    href: "#",
  },
] as const;

export default function PressSection() {
  const t = useTranslations("Landing.section7");

  return (
    <section className="py-20 bg-white px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-16">{t("title")}</h2>
        <div className="flex flex-col md:flex-row gap-6 overflow-x-auto pb-4 hide-scrollbar">
          {pressArticles.map((article) => (
            <Link
              key={article.id}
              href={article.href}
              className="group min-w-[300px] flex-1 rounded-3xl border border-gray-200 bg-white p-8 transition-all hover:border-gray-300 hover:bg-slate-50"
            >
              <h3 className="text-xl font-bold mb-6 leading-tight text-slate-950">
                {t(`articles.${article.id}.title`)}
              </h3>
              <div className="inline-flex items-center gap-2 text-sm font-medium text-slate-600">
                <span>{t(`articles.${article.id}.source`)}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="h-5 w-5 transition-transform group-hover:translate-x-1"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}