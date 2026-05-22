"use client";

import { useDispatch, useSelector } from "react-redux";
import { useTranslations } from "next-intl";
import { setBillingCycle, selectBillingCycle } from "@/lib/store/slices/pricingSlice";

const PLAN_DATA = [
  {
    id: "starter" as const,
    monthlyPrice: 6.62,
    yearlyPrice: 5.3,
    perUnitYearly: 0.53,
    discount: 20,
    subtextLink: true,
    highlight: false,
    hasFooterNote: false,
  },
  {
    id: "pro" as const,
    monthlyPrice: 19.39,
    yearlyPrice: 13.57,
    perUnitYearly: 0.27,
    discount: 30,
    subtextLink: false,
    highlight: true,
    hasFooterNote: false,
  },
  {
    id: "premium" as const,
    monthlyPrice: 32.77,
    yearlyPrice: 25.36,
    perUnitYearly: 0.2,
    discount: 40,
    subtextLink: false,
    highlight: false,
    hasFooterNote: true,
  },
];

export default function PricingCards() {
  const dispatch = useDispatch();
  const billingCycle = useSelector(selectBillingCycle);
  const isYearly = billingCycle === "yearly";
  const t = useTranslations("Pricing");

  return (
    <section className="w-full max-w-6xl mx-auto px-6 py-20">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold tracking-tight text-gray-950 mb-4">
          {t("heading")}
        </h1>
        <p className="text-base font-semibold text-gray-800">
          {t("subheading")}
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="flex justify-center mb-14">
        <div className="inline-flex items-center bg-gray-100 rounded-full p-1 gap-1">
          <button
            onClick={() => dispatch(setBillingCycle("monthly"))}
            className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
              !isYearly
                ? "bg-gray-950 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            {t("monthly")}
          </button>
          <button
            onClick={() => dispatch(setBillingCycle("yearly"))}
            className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
              isYearly
                ? "bg-gray-950 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            {t("yearly")}
            <span className="text-xs">🏷️</span>
            <span
              className={`text-xs font-semibold ${isYearly ? "text-green-400" : "text-green-600"}`}
            >
              {t("sale")}
            </span>
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {PLAN_DATA.map((plan) => {
          const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
          const features = t.raw(`${plan.id}.features`) as string[];
          const subtext = t(`${plan.id}.subtext`);
          const footerNote = plan.hasFooterNote ? t(`${plan.id}.footerNote`) : null;

          return (
            <div
              key={plan.id}
              className="group relative rounded-2xl p-8 flex flex-col transition-all duration-200 bg-gray-50 border-2 border-gray-200 hover:bg-white hover:border-gray-950 hover:shadow-lg cursor-pointer"
            >
              {/* Discount Badge */}
              <span className="absolute top-5 right-5 bg-gray-950 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                -{plan.discount}%
              </span>

              {/* Plan Name & Tagline */}
              <div className="mb-6">
                <h2 className="text-base font-bold tracking-widest text-gray-950 mb-1">
                  {t(`${plan.id}.name`)}
                </h2>
                <p className="text-sm text-gray-500">{t(`${plan.id}.tagline`)}</p>
              </div>

              {/* Price */}
              <div className="mb-1">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-gray-950">
                    ${price.toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-400 font-medium">
                    {t("perMonth")}
                  </span>
                </div>
              </div>

              {/* Per unit info */}
              <p className="text-xs text-gray-400 mb-6 pb-6 border-b border-gray-200">
                {isYearly ? (
                  <>
                    ${plan.perUnitYearly} {t("perUnit")} ·{" "}
                    {plan.subtextLink ? (
                      <a
                        href="#"
                        className="underline underline-offset-2 hover:text-gray-700 transition-colors"
                      >
                        {subtext}
                      </a>
                    ) : (
                      subtext
                    )}
                  </>
                ) : (
                  `${t("billedMonthly")} $${plan.monthlyPrice.toFixed(2)}`
                )}
              </p>

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-1">
                {features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2.5 text-sm text-gray-700"
                  >
                    <svg
                      className="w-4 h-4 mt-0.5 shrink-0 text-gray-950"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                className="w-full py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 bg-white text-gray-950 border border-gray-300 group-hover:bg-gray-950 group-hover:text-white group-hover:border-gray-950 active:scale-[0.98]"
              >
                {t("getStarted")}
              </button>

              {/* Footer note for Premium */}
              {footerNote && (
                <p className="text-center text-xs text-gray-400 mt-3">
                  {footerNote}{" "}
                  <a
                    href="#"
                    className="underline underline-offset-2 hover:text-gray-700 transition-colors"
                  >
                    {t("contact")}
                  </a>
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

