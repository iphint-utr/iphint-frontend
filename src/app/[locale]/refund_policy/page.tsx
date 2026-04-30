"use client";

import Link from "next/link";

const refundSections = [
  {
    id: "general",
    title: "1. General Policy",
    content: "All payments made for the IPHINT service (the “Service”) are non-refundable, except as expressly stated in this Policy or as required by applicable law. By purchasing or subscribing to the Service, you acknowledge and agree to this refund policy.",
  },
  {
    id: "subscription",
    title: "2. Subscription Fees",
    content: "If you purchase a subscription:",
    list: [
      "Fees are billed in advance on a recurring basis (monthly or annually)",
      "Payments are non-refundable once charged",
      "You may cancel your subscription at any time, but cancellation will only take effect at the end of the current billing cycle",
      "No refunds or credits will be provided for partial periods, unused features, or inactivity"
    ],
  },
  {
    id: "one-time",
    title: "3. One-Time Purchases",
    content: "All one-time purchases, including credits, add-ons, or premium features, are final and non-refundable once the transaction is completed.",
  },
  {
    id: "free-trials",
    title: "4. Free Trials",
    content: "If a free trial is offered:",
    list: [
      "You must cancel before the trial period ends to avoid being charged",
      "Once a paid subscription begins, it is non-refundable",
      "Failure to cancel before billing constitutes authorization of the charge"
    ],
  },
  {
    id: "billing-errors",
    title: "5. Billing Errors",
    content: "If you believe you have been charged in error, you must contact us within 7 days of the charge. If we determine that an error occurred, we may issue a refund or credit at our sole discretion.",
  },
  {
    id: "exceptional",
    title: "6. Exceptional Circumstances",
    content: "We may, at our sole discretion, provide refunds in exceptional cases, including:",
    list: [
      "Duplicate payments",
      "Technical failures that prevent access to the Service",
      "Other circumstances deemed appropriate by the Company"
    ],
    footer: "Such refunds are not guaranteed and are handled case-by-case."
  },
  {
    id: "chargebacks",
    title: "7. Chargebacks and Disputes",
    content: "If you initiate a chargeback or payment dispute:",
    list: [
      "We reserve the right to suspend or terminate your account immediately",
      "You remain responsible for any outstanding amounts",
      "We may dispute the chargeback with supporting evidence",
      "Abusive or repeated chargebacks may result in permanent account restriction"
    ],
  },
  {
    id: "availability",
    title: "8. Service Availability",
    content: "Refunds will not be issued for:",
    list: [
      "Temporary service interruptions",
      "Performance issues that do not materially prevent use",
      "Changes to features or functionality"
    ],
    footer: "The Service is provided on an “as available” basis."
  },
  {
    id: "legal",
    title: "9. Legal Compliance",
    content: "Nothing in this Policy limits your rights under applicable consumer protection laws, including the California Consumer Privacy Act where applicable. Where required by law, refunds will be provided in accordance with statutory obligations.",
  },
  {
    id: "modifications",
    title: "10. Modifications",
    content: "We reserve the right to modify this Refund Policy at any time. Changes will apply to purchases made after the updated policy becomes effective.",
  },
];

export default function RefundPolicy() {
  return (
    <section className="min-h-screen bg-slate-50 py-20 px-6 lg:px-12 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-12 items-start">
        
        {/* Desktop Sidebar Navigation */}
        <aside className="hidden lg:flex flex-col w-72 shrink-0 sticky top-24 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6">
            Contents
          </h3>
          <nav className="flex flex-col gap-3 overflow-y-auto max-h-[60vh] hide-scrollbar pr-2">
            {refundSections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="text-sm font-medium text-slate-600 hover:text-black transition-colors"
              >
                {section.title}
              </a>
            ))}
            <a href="#contact" className="text-sm font-medium text-slate-600 hover:text-black transition-colors mt-2 pt-2 border-t border-gray-100">
              Customer Support
            </a>
          </nav>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 w-full bg-white p-8 md:p-12 rounded-3xl border border-gray-100 shadow-sm">
          {/* Header */}
          <div className="mb-12 border-b border-gray-100 pb-8">
            <Link 
              href="/" 
              className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-black transition-colors mb-8"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Main
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Refund Policy
            </h1>
            <p className="text-slate-500 font-medium">
              Effective Date: April 5, 2026
            </p>
          </div>

          {/* Clauses */}
          <div className="flex flex-col gap-12">
            {refundSections.map((section) => (
              <div key={section.id} id={section.id} className="scroll-mt-24">
                <h2 className="text-xl md:text-2xl font-bold mb-4">
                  {section.title}
                </h2>
                
                <p className="text-slate-600 leading-relaxed">
                  {section.content}
                </p>

                {section.list && (
                  <ul className="mt-4 flex flex-col gap-2 pl-5">
                    {section.list.map((item, index) => (
                      <li key={index} className="text-slate-600 leading-relaxed relative before:content-['•'] before:absolute before:-left-5 before:text-slate-400">
                        {item}
                      </li>
                    ))}
                  </ul>
                )}

                {section.footer && (
                  <p className="mt-4 text-slate-600 leading-relaxed">
                    {section.footer}
                  </p>
                )}
              </div>
            ))}

            {/* Contact Section */}
            <div id="contact" className="scroll-mt-24 pt-10 border-t border-gray-100 mt-2">
              <h2 className="text-xl md:text-2xl font-bold mb-4">
                Customer Support & Inquiries
              </h2>
              <p className="text-slate-600 leading-relaxed mb-6">
                If you have questions regarding this Refund Policy or billing, please reach out:
              </p>
              
              <div className="bg-slate-50 p-6 rounded-2xl border border-gray-100 flex flex-col gap-3 text-sm md:text-base text-slate-700">
                <p><strong className="text-slate-900 block mb-1">Email:</strong> <a href="mailto:team.iphint@gmail.com" className="text-blue-600 hover:underline">team.iphint@gmail.com</a></p>
                <p><strong className="text-slate-900 block mb-1">Customer Center:</strong> 02-1644-0395</p>
                <p><strong className="text-slate-900 block mb-1">Address:</strong> UTRBOX 20, Solmae-ro 7ga-gil, Gangbuk-gu, Seoul (1F), Postal Code: 01207, Republic of Korea (South Korea)</p>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </section>
  );
}