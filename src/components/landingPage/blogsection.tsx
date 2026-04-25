"use client";

import { useParams } from "next/navigation";

// ─── Translations ─────────────────────────────────────────────────────────────
const translations = {
  kr: {
    sectionTitle: "블로그",
    posts: [
      {
        category: "콘텐츠의 미래",
        title: "투스타를 이용해 소규모 팀이 안전하게 콘텐츠 관리하는 방법",
        cta: "더 자세히 >",
        href: "#",
      },
      {
        category: "콘텐츠의 미래",
        title: "투스타를 이용해 소규모 팀이 안전하게 콘텐츠 관리하는 방법",
        cta: "더 자세히 >",
        href: "#",
      },
      {
        category: "콘텐츠의 미래",
        title: "투스타를 이용해 소규모 팀이 안전하게 콘텐츠 관리하는 방법",
        cta: "더 자세히 >",
        href: "#",
      },
    ],
  },
  en: {
    sectionTitle: "Blog",
    posts: [
      {
        category: "The Future of Content",
        title: "How small teams can safely manage content using Toosta",
        cta: "Learn More >",
        href: "#",
      },
      {
        category: "The Future of Content",
        title: "How small teams can safely manage content using Toosta",
        cta: "Learn More >",
        href: "#",
      },
      {
        category: "The Future of Content",
        title: "How small teams can safely manage content using Toosta",
        cta: "Learn More >",
        href: "#",
      },
    ],
  },
} as const;

type Locale = keyof typeof translations;

// ─── Component ────────────────────────────────────────────────────────────────
export default function BlogSection() {
  const params = useParams();
  const locale: Locale = (params?.locale as string) === "en" ? "en" : "kr";
  const t = translations[locale];

  return (
    <section className="w-full max-w-[1280px] mx-auto px-6 py-16">
      <h2 className=" text-2xl md:text-4xlfont-extrabold tracking-tight text-gray-900 mb-10">
        {t.sectionTitle}
      </h2>

      <ul className="divide-y divide-gray-200">
        {t.posts.map((post, id) => (
          <li key={id} className="group">
            <a
              href={post.href}
              className="flex items-center justify-between gap-8 py-8 -mx-4 px-4 rounded-sm transition-colors hover:bg-gray-50"
            >
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-bold text-gray-900">
                  {post.category}
                </span>
                <span className="text-sm text-gray-600 leading-relaxed">
                  {post.title}
                </span>
              </div>

              <span className="shrink-0 text-sm text-gray-400 group-hover:text-gray-900 transition-colors whitespace-nowrap">
                {post.cta}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
