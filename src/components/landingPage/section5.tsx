"use client";

import { useRef } from "react";
import Image from "next/image";

const testimonials = [
  {
    quote: "Reduced monitoring from 12 hours to 30 mins.",
    content: "It was nearly impossible to manually find all the accounts that stole my drawings and posted them as their own. This service gives me true peace of mind.",
    author: "Artist (Webtoon)",
    subtext: "Over 30 serialized works",
    avatar: "/sec4_artist_avatar.jpg", // Replace with your actual image paths
  },
  {
    quote: "4 hours of daily monitoring, now automated.",
    content: "I found shops selling my products just by changing the packaging. I was also worried about the increasing number of scam sites stealing my model photos and detail pages.",
    author: "CEO, Apparel Online Store",
    subtext: "Annual Sales: $11M",
    avatar: "/sec4_ceo_avatar.jpg",
  },
  {
    quote: "No more 30-hour monthly search struggles.",
    content: "I used to drain so much energy tracking my photos being used in illegal ads or ghost accounts. I'm so grateful to have solved this with such an affordable subscription.",
    author: "Influencer & Model",
    subtext: "300K Followers",
    avatar: "/sec4_model_avatar.jpg",
  },
  {
    quote: "Reduced monitoring from 12 hours to 30 mins.",
    content: "It was nearly impossible to manually find all the accounts that stole my drawings and posted them as their own. This service gives me true peace of mind.",
    author: "Artist (Webtoon)",
    subtext: "Over 30 serialized works",
    avatar: "/sec4_artist_avatar.jpg",
  },
];

export default function Section5() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === "left" 
        ? scrollLeft - clientWidth / 2 
        : scrollLeft + clientWidth / 2;
      
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  return (
    <section className="bg-slate-50 py-20 overflow-hidden">
      <div className="max-w-full mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why they trust us</h2>
          <p className="text-sm font-semibold text-slate-600">5.5 hours saved in imposter tracking.</p>
        </div>

        {/* Slider Container */}
        <div className="relative">
          <div 
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-8 scroll-smooth"
          >
            {testimonials.map((item, idx) => (
              <div 
                key={idx}
                className="min-w-[300px] md:min-w-[380px] snap-center bg-white border border-gray-100 rounded-3xl p-8 md:p-10 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="mb-6">
                    <svg width="24" height="20" viewBox="0 0 24 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5.5 0C2.46243 0 0 2.46243 0 5.5V11H7V5.5C7 4.67157 6.32843 4 5.5 4H4V0H5.5ZM19.5 0C16.4624 0 14 2.46243 14 5.5V11H21V5.5C21 4.67157 20.3284 4 19.5 4H18V0H19.5Z" fill="black"/>
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold mb-4 leading-tight">{item.quote}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-10">{item.content}</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                    {/* Fallback to initials or icon if image doesn't exist */}
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-400">
                      IMG
                    </div>
                    {/* Replace with <Image /> when you have the local files */}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{item.author}</p>
                    <p className="text-xs text-slate-500">{item.subtext}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Controls (Visible on Tablet/Desktop) */}
          <div className="hidden md:flex justify-center items-center gap-4 mt-8">
            <button 
              onClick={() => scroll("left")}
              className="p-3 rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition-colors shadow-sm"
              aria-label="Scroll left"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <button 
              onClick={() => scroll("right")}
              className="p-3 rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition-colors shadow-sm"
              aria-label="Scroll right"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>

          {/* Mobile Dots */}
          <div className="flex md:hidden justify-center gap-2 mt-4">
            {testimonials.map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-300" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}