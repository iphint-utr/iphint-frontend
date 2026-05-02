"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

// Ensure these filenames exactly match the files in your /public directory
const carouselData = [
  {
    key: "artist",
    file: "/sec4_main.svg",
  },
  {
    key: "model",
    file: "/sec4_model.svg",
  },
  {
    key: "creator",
    file: "/sec4_creator.svg",
  },
  {
    key: "ecommerce",
    file: "/sec4_ecommerce.svg",
  },
];

export default function Section4() {
  const t = useTranslations("Landing.section4");
  const [activeIndex, setActiveIndex] = useState(0);
  const activeItem = carouselData[activeIndex];

  // Filters out the active item so the right side acts as a queue
  const queueItems = carouselData.filter((_, idx) => idx !== activeIndex);

  return (
    <section className="min-h-[500px] bg-[#fafafa] py-20 px-6 lg:px-12 font-sans text-slate-900">
      <div className="max-w-full mx-auto flex flex-col gap-16">
        
        {/* Header Section */}
        <div className="text-center flex flex-col gap-4">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            {t("title")}
          </h2>
          <p className="text-sm md:text-base font-medium text-slate-700 max-w-3xl mx-auto leading-relaxed">
            {t("description")}
          </p>
        </div>

        {/* Main Content Carousel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center justify-center ">
          
          {/* 1. Left: Active Featured Card */}
          <div className="col-span-1 lg:col-span-5 flex justify-center ">
            <div className="relative w-full max-w-md aspect-square rounded-2xl flex items-center justify-center transition-all duration-500">
              {/* Dotted Background Pattern */}
              <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_2px,transparent_2px)] [background-size:24px_24px] opacity-70 rounded-2xl"></div>
              
              <div className="relative z-10 w-full h-full flex items-center justify-center animate-fade-in">
                <Image
                  src={activeItem.file}
                  alt={t(`items.${activeItem.key}.title`)}
                  fill
                  className="object-contain drop-shadow-sm"
                  priority
                />
              </div>
            </div>
          </div>

          {/* 2. Middle: Active Text Info & Progress */}
          <div className="col-span-1 lg:col-span-4 flex flex-col justify-center gap-5">
            <div>
              <span className="inline-block bg-slate-900 text-white px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide">
                {t(`items.${activeItem.key}.title`)}
              </span>
            </div>
            <h3 className="text-2xl font-semibold leading-snug">
              {t(`items.${activeItem.key}.heading`)}
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              {t(`items.${activeItem.key}.description`)}
            </p>

            {/* Progress Bar attached to text block */}
            <div className="mt-8 h-[3px] w-full bg-gray-200 overflow-hidden relative rounded-full">
              <div
                className="absolute top-0 left-0 h-full bg-slate-900 transition-all duration-500 ease-out rounded-full"
                style={{ width: `${((activeIndex + 1) / carouselData.length) * 100}%` }}
              />
            </div>
          </div>

          {/* 3. Right: Scrollable Thumbnails Queue */}
          <div className="col-span-1 lg:col-span-3 flex overflow-x-auto pb-4 lg:pb-0 gap-6 snap-x snap-mandatory hide-scrollbar">
            {queueItems.map((item) => {
              const originalIndex = carouselData.findIndex((i) => i.key === item.key);
              
              return (
                <button 
                  key={item.key} 
                  className="flex flex-col items-center gap-4 shrink-0 snap-start group outline-none"
                  onClick={() => setActiveIndex(originalIndex)}
                  aria-label={t("viewSlide", { title: t(`items.${item.key}.title`) })}
                >
                  <div className="relative w-28 md:w-32 aspect-square bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm group-hover:border-gray-300 group-hover:shadow-md transition-all">
                    {/* Smaller Dotted Background */}
                    <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1.5px,transparent_1.5px)] [background-size:16px_16px] opacity-60"></div>
                    
                    <div className="relative w-full h-full p-5">
                      <Image
                        src={item.file}
                        alt={t(`items.${item.key}.title`)}
                        fill
                        className="object-contain opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                      />
                    </div>
                  </div>
                  
                  {/* Bottom Pill Badge */}
                  <span className="bg-slate-100/80 text-slate-700 px-4 py-1 rounded-full text-xs font-semibold group-hover:bg-slate-200 transition-colors">
                    {t(`items.${item.key}.title`)}
                  </span>
                </button>
              );
            })}
          </div>

        </div>

        {/* Global Pagination Dots */}
        <div className="flex justify-center gap-2.5 mt-8">
          {carouselData.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`h-2.5 rounded-full transition-all duration-300 border ${
                idx === activeIndex 
                  ? "bg-slate-900 w-2.5 border-slate-900" 
                  : "bg-white w-2.5 border-gray-300 hover:border-gray-500"
              }`}
              aria-label={t("goToSlide", { index: idx + 1 })}
            />
          ))}
        </div>

      </div>
    </section>
  );
}