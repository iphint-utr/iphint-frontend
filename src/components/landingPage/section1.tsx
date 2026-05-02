// components/landing/Hero.tsx
import Image from "next/image";
import { Link } from "@/i18n/routing";

export default function Section1() {
  return (
    <section className="w-full py-16 md:py-24">
      <div className=" max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* LEFT CONTENT */}
        <div className="space-y-6">
          <h1 className="text-2xl md:text-3xl lg:text-3xl font-semibold text-black leading-tight">
            Protect your ideas and <br />
            brand growth with IpHint.
          </h1>

          <h2 className="text-lg md:text-xl font-semibold text-black">
            Never lose sight of your visual assets with our non-stop tracking system
          </h2>

          <p className="text-gray-600 max-w-xl">
            Raw data alone is meaningless. We prioritize precision detection on
            high-risk global sites, reporting only the essential information that
            directly impacts your rights.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 pt-4">
            <Link
              href="/signup"
              className="bg-black text-white px-6 py-3 rounded-xl font-medium hover:opacity-90 transition"
            >
              Get Started Now
            </Link>

            <button className="border border-gray-300 px-6 py-3 rounded-xl font-medium hover:bg-gray-100 transition">
              Start Now
            </button>
          </div>
        </div>

        {/* RIGHT SVG */}
        <div className="flex justify-center lg:justify-end">
          <Image
            src="/sec1_svg.svg"
            alt="Hero Illustration"
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