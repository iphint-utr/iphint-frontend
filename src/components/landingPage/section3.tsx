// components/landing/Section3.tsx
import Image from "next/image";

const features = [
  {
    title: "Deep Web Detection",
    desc: "Scans everything from adult sites and harmful sites to streaming sites that general search engines cannot find.",
    icon: "/sec3_deepWebDetection.svg",
  },
  {
    title: "High Accuracy",
    desc: "Our AI-based image matching technology accurately identifies modified images and prevents the display of similar content.",
    icon: "/sec3_highAccuracy.svg",
  },
  {
    title: "Alert Service",
    desc: "No more hassle of searching manually. Get notified when new matches are found so you can respond quickly.",
    icon: "/sec3_alertService.svg",
  },
  {
    title: "Secure Storage",
    desc: "Uploaded images are encrypted and stored securely, with personal information protection as our top priority.",
    icon: "/sec3_secureStorage.svg",
  },
];

export default function Section3() {
  return (
    <section className="w-full py-16 md:py-24">
      
      {/* Content wrapper (full width feel with padding) */}
      <div className="w-full px-4 sm:px-6 md:px-10 lg:px-16">
        
        {/* Heading */}
        <div className="text-center mb-14">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-black">
            Try Monitoring
          </h2>
          <p className="mt-4 text-gray-700 text-sm md:text-base">
            Check for leaks across the web and take appropriate action based on the results!
          </p>
        </div>

        {/* Cards */}
        <div className="
          grid 
          grid-cols-1 
          sm:grid-cols-2 
          lg:grid-cols-4 
          gap-6
        ">
          {features.map((item, i) => (
            <div
              key={i}
              className="
                bg-[#e9e9e9] 
                rounded-2xl 
                p-6 md:p-8 
                flex flex-col 
                gap-4 
                h-full
              "
            >
              
              {/* Icon */}
              <Image
                src={item.icon}
                alt={item.title}
                width={40}
                height={40}
                className="w-8 h-8 md:w-10 md:h-10"
              />

              {/* Title */}
              <h3 className="text-lg md:text-xl font-semibold text-black">
                {item.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-700 leading-relaxed">
                {item.desc}
              </p>

            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="mt-16 bg-black text-white text-center py-4 text-sm">
        Do you need enterprise-grade data residency?{" "}
        <span className="underline cursor-pointer">Contact Sales</span>
      </div>

    </section>
  );
}