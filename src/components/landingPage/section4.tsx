"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

const carouselData = [
  { key: "artist",    file: "/sec4_main.svg" },
  { key: "model",     file: "/sec4_model.svg" },
  { key: "creator",   file: "/sec4_creator.svg" },
  { key: "ecommerce", file: "/sec4_ecommerce.svg" },
];

const AUTO_SLIDE_INTERVAL = 4000;

export default function Section4() {
  const t = useTranslations("Landing.section4");
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const activeItem = carouselData[activeIndex];

  const goTo = useCallback((idx: number) => {
    setActiveIndex(idx);
    setPaused(true);
  }, []);

  // Auto-slide: resumes 8 s after last manual interaction
  useEffect(() => {
    if (paused) {
      const resumeTimer = setTimeout(() => setPaused(false), AUTO_SLIDE_INTERVAL * 2);
      return () => clearTimeout(resumeTimer);
    }
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % carouselData.length);
    }, AUTO_SLIDE_INTERVAL);
    return () => clearInterval(interval);
  }, [paused]);

  return (
    <section className="min-h-[500px] w-full bg-[#fafafa] py-20 font-sans text-slate-900">
      <div className="w-full px-6 lg:px-16 xl:px-24 flex flex-col gap-12">

        {/* Header */}
        <div className="text-center flex flex-col gap-4">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            {t("title")}
          </h2>
          <p className="text-sm md:text-base font-medium text-slate-700 max-w-3xl mx-auto leading-relaxed">
            {t("description")}
          </p>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-10 lg:gap-0 items-stretch">

          {/* Image column — dots fill full column height */}
          <div className="relative min-h-72 lg:min-h-0 rounded-2xl lg:rounded-none overflow-hidden lg:mr-10">
            <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_2px,transparent_2px)] [background-size:24px_24px] opacity-80" />
            <div className="relative z-10 h-full flex items-center justify-center p-8">
              <div className="relative w-full lg:w-[55%] aspect-square">
                <Image
                  key={activeItem.key}
                  src={activeItem.file}
                  alt={t(`items.${activeItem.key}.title`)}
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>

          {/* Text */}
          <div className="flex flex-col justify-center gap-5">
            <div className="flex gap-1 overflow-x-auto hide-scrollbar">
              {carouselData.map((item, idx) => (
                <button
                  key={item.key}
                  onClick={() => goTo(idx)}
                  className={`shrink-0 px-3 py-1.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors duration-200 ${
                    idx === activeIndex
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {t(`items.${item.key}.title`)}
                </button>
              ))}
            </div>
            <h3 className="text-2xl font-semibold leading-snug">
              {t(`items.${activeItem.key}.heading`)}
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              {t(`items.${activeItem.key}.description`)}
            </p>

            {/* Auto-slide progress bar */}
            <div className="mt-6 h-[3px] w-full bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-slate-900 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${((activeIndex + 1) / carouselData.length) * 100}%` }}
              />
            </div>
          </div>

        </div>

        {/* Pagination dots */}
        <div className="flex justify-center gap-2">
          {carouselData.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === activeIndex
                  ? "w-6 bg-slate-900"
                  : "w-2 bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}