"use client";

import Link from "next/link";

const privacySections = [
  {
    id: "scope",
    title: "1. Scope and Applicability",
    content: "This Privacy Policy describes how UTRBOX Inc. (“Company,” “we,” “us,” or “our”) collects, uses, discloses, and safeguards information in connection with the IPHINT service (the “Service”). This Policy applies to both personal information and other data processed in connection with the operation of the Service, including technical and analytical data generated through use of the Service.",
  },
  {
    id: "definitions",
    title: "2. Definitions",
    content: "“Personal Information” means information that identifies, relates to, describes, or can reasonably be linked to an identifiable individual. “Service Data” means any data uploaded by users or generated through use of the Service, including but not limited to images, analysis outputs, detection results (“Discovery”), logs, and related metadata. Service Data may or may not constitute Personal Information depending on context.",
  },
  {
    id: "information-collected",
    title: "3. Information We Collect",
    content: "We may collect the following categories of information:",
    subSections: [
      {
        subtitle: "(a) Account Information",
        text: "Email address, password (encrypted), name or username, contact information, and third-party authentication data."
      },
      {
        subtitle: "(b) Service Data",
        text: "Uploaded content (including images and videos), image fingerprints, analytical data, detection results (“Discovery”), usage records, and related metadata."
      },
      {
        subtitle: "(c) Transaction Information",
        text: "Billing details, payment records, and payout or settlement information."
      },
      {
        subtitle: "(d) Automatically Collected Information",
        text: "IP address, device identifiers, browser type, operating system, log data, cookies, and usage activity."
      }
    ]
  },
  {
    id: "how-we-use",
    title: "4. How We Use Information",
    content: "We process information for the following purposes:",
    list: [
      "To provide and operate the Service",
      "To analyze images and generate detection results",
      "To deliver notifications and user-facing outputs",
      "To improve and optimize Service performance",
      "To provide customer support",
      "To detect, prevent, and mitigate abuse or unauthorized use",
      "To process payments and transactions"
    ],
    footer: "We do not use Personal Information for purposes materially different from those described in this Policy without notice."
  },
  {
    id: "usage-data",
    title: "5. Usage Data and Communications",
    content: "We may collect and analyze user interaction data, including clicks, navigation patterns, and feature usage, to improve functionality and user experience. We may also track whether emails are opened and whether links are clicked for purposes of communication effectiveness and service improvement.",
  },
  {
    id: "cookies",
    title: "6. Cookies and Tracking Technologies",
    content: "We use cookies and similar technologies to recognize users, analyze usage patterns, and improve the Service. You may control cookie settings through your browser; however, disabling cookies may limit certain functionality. The Service does not currently respond to “Do Not Track” signals.",
  },
  {
    id: "third-party",
    title: "7. Third-Party Services and Links",
    content: "The Service may contain links to third-party websites or services. We are not responsible for the privacy practices or content of such third parties. Their respective privacy policies govern any information collected.",
  },
  {
    id: "de-identified",
    title: "8. De-Identified and Aggregated Data",
    content: "We may de-identify or aggregate information so that it cannot reasonably be used to identify an individual. Such data may be used for analytics, research, service improvement, and business purposes, and may be shared with third parties.",
  },
  {
    id: "disclosure",
    title: "9. Disclosure of Information",
    content: "We do not sell Personal Information. We may disclose information under the following circumstances:",
    list: [
      "With user consent",
      "To service providers performing functions on our behalf",
      "To comply with legal obligations",
      "To protect rights, safety, and security",
      "In connection with corporate transactions"
    ]
  },
  {
    id: "service-providers",
    title: "10. Service Providers and Contractors",
    content: "We may engage third-party service providers to process information on our behalf. These parties are contractually obligated to use the information only as necessary to provide services to us and in accordance with applicable law.",
  },
  {
    id: "business-transfers",
    title: "11. Business Transfers",
    content: "In the event of a merger, acquisition, reorganization, or sale of assets, information may be transferred as part of the transaction. We will take appropriate steps to ensure continued protection of such information.",
  },
  {
    id: "data-retention",
    title: "12. Data Retention",
    content: "We retain information for as long as necessary to fulfill the purposes outlined in this Policy, including:",
    list: [
      "Account data: retained until account deletion, then deleted within 30 days",
      "Uploaded content: up to 12 months",
      "Detection and usage data: up to 24 months",
      "Dispute-related data: up to 3 years",
      "Financial records: as required by applicable law"
    ],
    footer: "Certain data may be retained beyond these periods where necessary for legal, regulatory, or security purposes."
  },
  {
    id: "rights-choices",
    title: "13. Your Rights and Choices",
    content: "Depending on your jurisdiction, you may have the right to:",
    list: [
      "Access your Personal Information",
      "Request correction or deletion",
      "Restrict processing",
      "Request data portability"
    ],
    footer: "Requests may be submitted to: team.iphint@gmail.com. We may take reasonable steps to verify your identity before fulfilling requests."
  },
  {
    id: "california-rights",
    title: "14. California Privacy Rights",
    content: "Under the California Consumer Privacy Act, California residents have the right to:",
    list: [
      "Know what Personal Information is collected",
      "Request deletion",
      "Opt out of the sale of Personal Information (note: we do not sell Personal Information)"
    ],
    footer: "Authorized agents may submit requests on behalf of users, subject to verification."
  },
  {
    id: "no-legal",
    title: "15. No Legal Services and Limitation of Liability",
    content: "The Service is a technology-based analytical tool and does not constitute legal advice or legal services. The Company is not a law firm and does not provide legal representation, legal opinions, or legal determinations. All outputs, including detection results (“Discovery”), are generated through automated processes and are provided for informational purposes only. Such outputs do not constitute legal conclusions regarding intellectual property infringement or ownership. Users are solely responsible for any decisions or actions taken based on the Service. To the maximum extent permitted by law, the Company disclaims all liability for any damages arising from use of the Service. In no event shall the Company’s total liability exceed the amount paid by the user in the preceding twelve (12) months.",
  },
  {
    id: "security",
    title: "16. Security",
    content: "We implement reasonable technical and organizational safeguards to protect information. However, no system can be guaranteed to be completely secure.",
  },
  {
    id: "international-transfers",
    title: "17. International Data Transfers",
    content: "Information may be processed and stored in countries other than your own. We take appropriate measures to ensure compliance with applicable laws, including the General Data Protection Regulation where applicable.",
  },
  {
    id: "childrens-privacy",
    title: "18. Children’s Privacy",
    content: "The Service is not intended for individuals under the age of 13, and we do not knowingly collect Personal Information from children.",
  },
  {
    id: "changes",
    title: "20. Changes to This Policy",
    content: "We may update this Privacy Policy from time to time. Material changes will be notified through the Service or other appropriate means.",
  },
];

export default function PrivacyPolicy() {
  return (
    <section className="min-h-screen bg-slate-50 py-20 px-6 lg:px-12 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-12 items-start">
        
        {/* Desktop Sidebar Navigation */}
        <aside className="hidden lg:flex flex-col w-72 shrink-0 sticky top-24 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6">
            Contents
          </h3>
          <nav className="flex flex-col gap-3 overflow-y-auto max-h-[60vh] hide-scrollbar pr-2">
            {privacySections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="text-sm font-medium text-slate-600 hover:text-black transition-colors"
              >
                {section.title}
              </a>
            ))}
            <a href="#contact" className="text-sm font-medium text-slate-600 hover:text-black transition-colors mt-2 pt-2 border-t border-gray-100">
              19. Contact
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
              Privacy Policy
            </h1>
            <div className="flex flex-col gap-1 text-slate-500 font-medium">
              <p>IPHINT / UTRBOX Inc.</p>
              <p>Effective Date: April 5, 2026</p>
            </div>
          </div>

          {/* Clauses */}
          <div className="flex flex-col gap-12">
            {privacySections.map((section) => (
              <div key={section.id} id={section.id} className="scroll-mt-24">
                <h2 className="text-xl md:text-2xl font-bold mb-4">
                  {section.title}
                </h2>
                
                {section.content && (
                  <p className="text-slate-600 leading-relaxed">
                    {section.content}
                  </p>
                )}

                {/* Render sub-sections (like 3a, 3b, etc.) */}
                {section.subSections && (
                  <div className="mt-6 flex flex-col gap-6 pl-4 md:pl-6 border-l-2 border-slate-100">
                    {section.subSections.map((sub, idx) => (
                      <div key={idx}>
                        <h3 className="font-semibold text-slate-800 mb-1">{sub.subtitle}</h3>
                        <p className="text-slate-600 leading-relaxed">{sub.text}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Render bulleted lists */}
                {section.list && (
                  <ul className="mt-4 flex flex-col gap-2 pl-5">
                    {section.list.map((item, index) => (
                      <li key={index} className="text-slate-600 leading-relaxed relative before:content-['•'] before:absolute before:-left-5 before:text-slate-400">
                        {item}
                      </li>
                    ))}
                  </ul>
                )}

                {/* Render post-list footer text */}
                {section.footer && (
                  <p className="mt-4 text-slate-600 leading-relaxed">
                    {section.footer}
                  </p>
                )}
              </div>
            ))}

            {/* Contact Section (Moved to correct numerical order at the bottom) */}
            <div id="contact" className="scroll-mt-24 pt-10 border-t border-gray-100 mt-2">
              <h2 className="text-xl md:text-2xl font-bold mb-4">
                19. Contact
              </h2>
              <p className="text-slate-600 leading-relaxed mb-6">
                For questions regarding this Privacy Policy, contact:
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