// components/landing/Section2.tsx
import Image from "next/image";
import { useTranslations } from "next-intl";

const features = [
  {
    key: "searchEngines",
    icon: "/sec2_searchEngines.svg",
  },
  {
    key: "socialMedia",
    icon: "/sec2_socialMedia.svg",
    iconWidth: 80,
    iconHeight: 80,
    iconClassName: "h-[80px] w-[80px] object-contain",
  },
  {
    key: "harmfulSites",
    icon: "/sec2_harmfulSites.svg",
  },
  {
    key: "streamingSites",
    icon: "/sec2_streamingSites.svg",
  },
  {
    key: "deepWeb",
    icon: "/sec2_deepWeb.svg",
  },
];

export default function Section2() {
  const t = useTranslations("Landing.section2");

  return (
    <section className="w-full py-16 md:py-24">
      <div className="max-w-full mx-auto px-4 sm:px-6">
        
        {/* Rounded Container */}
        <div className="bg-[#F8F8F8] rounded-[32px] px-6 md:px-12 py-12 md:py-16">
          
          {/* Heading */}
          <h2 className="text-center text-xl md:text-2xl lg:text-3xl font-semibold text-black mb-12">
            {t("title")}
          </h2>

          {/* Features Grid */}
          <div className="
            grid 
            grid-cols-2 
            sm:grid-cols-2 
            md:grid-cols-3 
            lg:grid-cols-5 
            gap-y-10 
            gap-x-6 
            text-center
          ">
            {features.map((item, i) => (
              <div key={i} className="flex flex-col items-center space-y-4">
                
                {/* Icon */}
                <div className="flex h-[120px] w-[120px] items-center justify-center">
                  <Image
                    src={item.icon}
                    alt={t(`features.${item.key}.title`)}
                    width={item.iconWidth ?? 120}
                    height={item.iconHeight ?? 120}
                    className={item.iconClassName ?? "h-[120px] w-[120px] object-contain"}
                  />
                </div>

                {/* Title */}
                <h3 className="font-semibold text-base md:text-lg">
                  {t(`features.${item.key}.title`)}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-600 max-w-[180px]">
                  {t(`features.${item.key}.description`)}
                </p>

              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}