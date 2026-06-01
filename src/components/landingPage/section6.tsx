import { useTranslations } from "next-intl";

const blogPosts = [
  { id: 1 },
  { id: 2 },
  { id: 3 },
  { id: 4 },
];

export default function Section6() {
  const t = useTranslations("Landing.section6");

  return (
    <section className="w-full py-20 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">{t("title")}</h2>
        <div className="border-t border-gray-100">
          {blogPosts.map((post) => (
            <a
              key={post.id}
              href="#"
              className="group flex items-center justify-between py-8 border-b border-gray-100 hover:bg-slate-50 transition-colors px-4"
            >
              <h3 className="text-lg font-semibold text-slate-900 pr-8 leading-snug">
                {t(`posts.${post.id}.title`)}
              </h3>

              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>

            </a>
          ))}
        </div>
      </div>
    </section>
  );
}