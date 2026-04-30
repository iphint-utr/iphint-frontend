"use client";

import Link from "next/link";

const termsSections = [
  {
    id: "acceptance",
    title: "1. Acceptance of Terms",
    content: "These Terms of Service (“Terms”) govern your access to and use of the IPHINT service (the “Service”) operated by UTRBOX Inc. (“Company,” “we,” “us,” or “our”). By accessing or using the Service, you agree to be bound by these Terms. If you do not agree, you may not use the Service.",
  },
  {
    id: "eligibility",
    title: "2. Eligibility",
    content: "You must be at least 18 years old, or the age of majority in your jurisdiction, to use the Service. By using the Service, you represent and warrant that you meet these requirements.",
  },
  {
    id: "description",
    title: "3. Description of Service",
    content: "The Service provides automated tools for monitoring, analyzing, and identifying potential matches of uploaded content across digital environments. The Service may generate detection results (“Discovery”) based on algorithmic analysis.",
  },
  {
    id: "no-legal",
    title: "4. No Legal Services",
    content: "The Service is a technology platform and does not provide legal advice or legal services. The Company is not a law firm and does not provide legal representation or legal determinations. All outputs are informational only and should not be relied upon as legal conclusions.",
  },
  {
    id: "user-content",
    title: "5. User Content",
    content: "You retain ownership of content you upload (“User Content”). By uploading content, you grant the Company a worldwide, non-exclusive, royalty-free license to use, process, analyze, and store such content solely for purposes of operating and improving the Service. You represent and warrant that you have all necessary rights to upload and use such content.",
  },
  {
    id: "prohibited",
    title: "6. Prohibited Conduct",
    content: "You agree not to:",
    list: [
      "Upload content you do not have rights to",
      "Use the Service for unlawful purposes",
      "Attempt to interfere with or disrupt the Service",
      "Reverse engineer or attempt to extract underlying algorithms",
      "Submit false or misleading infringement claims",
    ],
  },
  {
    id: "intellectual-property",
    title: "7. Intellectual Property",
    content: "All rights, title, and interest in and to the Service (excluding User Content) are owned by the Company. No rights are granted except as expressly stated in these Terms.",
  },
  {
    id: "dmca",
    title: "8. DMCA and Copyright Policy",
    content: "The Company complies with the Digital Millennium Copyright Act and responds to valid infringement notices. Users may submit claims in accordance with our DMCA Policy.",
  },
  {
    id: "fees",
    title: "9. Fees and Payments",
    content: "Certain features of the Service may require payment. You agree to pay all applicable fees and authorize the Company or its payment processor to charge your selected payment method. All fees are non-refundable except as required by law.",
  },
  {
    id: "suspension",
    title: "10. Suspension and Termination",
    content: "We may suspend or terminate your access at any time, with or without notice, if you violate these Terms or if required for legal or operational reasons. You may terminate your account at any time.",
  },
  {
    id: "disclaimer",
    title: "11. Disclaimer of Warranties",
    content: "THE SERVICE IS PROVIDED “AS IS” AND “AS AVAILABLE.” TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE COMPANY DISCLAIMS ALL WARRANTIES, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. THE COMPANY DOES NOT GUARANTEE THE ACCURACY, COMPLETENESS, OR RELIABILITY OF ANY RESULTS.",
  },
  {
    id: "liability",
    title: "12. Limitation of Liability",
    content: "TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE COMPANY SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES. IN NO EVENT SHALL THE COMPANY’S TOTAL LIABILITY EXCEED THE AMOUNT PAID BY YOU IN THE PRECEDING TWELVE (12) MONTHS.",
  },
  {
    id: "indemnification",
    title: "13. Indemnification",
    content: "You agree to indemnify and hold harmless the Company from any claims, damages, liabilities, and expenses arising out of:",
    list: [
      "Your use of the Service",
      "Your User Content",
      "Your violation of these Terms",
    ],
  },
  {
    id: "third-party",
    title: "14. Third-Party Services",
    content: "The Service may integrate with or link to third-party services. We are not responsible for the content, policies, or practices of such third parties.",
  },
  {
    id: "modifications",
    title: "15. Modifications to the Service",
    content: "We may modify, suspend, or discontinue the Service at any time without liability.",
  },
  {
    id: "governing-law",
    title: "16. Governing Law",
    content: "These Terms shall be governed by and construed in accordance with the laws of the State of California, without regard to conflict of law principles.",
  },
  {
    id: "dispute",
    title: "17. Dispute Resolution",
    content: "Any dispute arising out of or relating to these Terms shall be resolved exclusively in the courts located in California, unless otherwise required by law.",
  },
  {
    id: "changes",
    title: "18. Changes to Terms",
    content: "We may update these Terms from time to time. Continued use of the Service constitutes acceptance of the updated Terms.",
  },
];

export default function TermsOfService() {
  return (
    <section className="min-h-screen bg-slate-50 py-20 px-6 lg:px-12 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-12 items-start">
        
        {/* Desktop Sidebar Navigation */}
        <aside className="hidden lg:flex flex-col w-72 shrink-0 sticky top-24 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6">
            Contents
          </h3>
          <nav className="flex flex-col gap-3 overflow-y-auto max-h-[60vh] hide-scrollbar pr-2">
            {termsSections.map((section) => (
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
              Terms of Service
            </h1>
            <p className="text-slate-500 font-medium">
              Effective Date: April 5, 2026
            </p>
          </div>

          {/* Clauses */}
          <div className="flex flex-col gap-10">
            {termsSections.map((section) => (
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
              </div>
            ))}

            {/* Contact Section */}
            <div id="contact" className="scroll-mt-24 pt-10 border-t border-gray-100 mt-6">
              <h2 className="text-xl md:text-2xl font-bold mb-4">
                19. Contact
              </h2>
              <p className="text-slate-600 leading-relaxed mb-6">
                For questions regarding these Terms, contact:
              </p>
              
              <div className="bg-slate-50 p-6 rounded-2xl border border-gray-100 flex flex-col gap-2 text-sm md:text-base text-slate-700">
                <p><strong className="text-slate-900">Email:</strong> <a href="mailto:team.iphint@gmail.com" className="text-blue-600 hover:underline">team.iphint@gmail.com</a></p>
                <p><strong className="text-slate-900">Customer Center:</strong> 02-1644-0395</p>
                <p><strong className="text-slate-900">Address:</strong> UTRBOX 20, Solmae-ro 7ga-gil, Gangbuk-gu, Seoul (1F), Postal Code: 01207, Republic of Korea (South Korea)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}