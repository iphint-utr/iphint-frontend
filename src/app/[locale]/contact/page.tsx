'use client';

import { FormEvent, useState } from 'react';

type ContactFormState = {
  fullName: string;
  companyName: string;
  workEmail: string;
  phoneNumber: string;
  inquiryMessage: string;
  consentEmail: boolean;
  consentSms: boolean;
  consentServiceUpdates: boolean;
  consentEventsPromotions: boolean;
};

const INITIAL_FORM_STATE: ContactFormState = {
  fullName: '',
  companyName: '',
  workEmail: '',
  phoneNumber: '',
  inquiryMessage: '',
  consentEmail: false,
  consentSms: false,
  consentServiceUpdates: false,
  consentEventsPromotions: false,
};

const INQUIRY_LIMIT = 5000;

export default function ContactPage() {
  const [formData, setFormData] = useState<ContactFormState>(INITIAL_FORM_STATE);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
        <div className="grid grid-cols-1 gap-8 lg:min-h-[68vh] lg:grid-cols-12 lg:items-center lg:gap-16">
          <section className="lg:col-span-4 lg:self-start lg:pt-8">
            <h1 className="text-3xl font-bold text-black sm:text-4xl">Contact</h1>
            <p className="mt-3 max-w-md text-sm text-gray-600 sm:text-base">
              We will prepare a customized plan and get back to you shortly!
            </p>
          </section>

          <section className="lg:col-span-8 lg:pl-4">
            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-7">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
              <div>
                <label htmlFor="fullName" className="mb-2 block text-sm font-semibold text-black">
                  Full Name
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Example: John Doe"
                  className="input-field"
                  value={formData.fullName}
                  onChange={(event) => setFormData((prev) => ({ ...prev, fullName: event.target.value }))}
                />
              </div>

              <div>
                <label htmlFor="companyName" className="mb-2 block text-sm font-semibold text-black">
                  Company Name
                </label>
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  placeholder="Example: UTRBOX Inc."
                  className="input-field"
                  value={formData.companyName}
                  onChange={(event) => setFormData((prev) => ({ ...prev, companyName: event.target.value }))}
                />
              </div>

              <div>
                <label htmlFor="workEmail" className="mb-2 block text-sm font-semibold text-black">
                  Work Email
                </label>
                <input
                  id="workEmail"
                  name="workEmail"
                  type="email"
                  placeholder="Example: john@company.com"
                  className="input-field"
                  value={formData.workEmail}
                  onChange={(event) => setFormData((prev) => ({ ...prev, workEmail: event.target.value }))}
                />
              </div>

              <div>
                <label htmlFor="phoneNumber" className="mb-2 block text-sm font-semibold text-black">
                  Phone Number
                </label>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  placeholder="Example: +82 10-1234-5678"
                  className="input-field"
                  value={formData.phoneNumber}
                  onChange={(event) => setFormData((prev) => ({ ...prev, phoneNumber: event.target.value }))}
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label htmlFor="inquiryMessage" className="block text-sm font-semibold text-black">
                  Inquiry Message
                </label>
                <span className="text-xs text-gray-500">Max 5000 characters</span>
              </div>
              <textarea
                id="inquiryMessage"
                name="inquiryMessage"
                maxLength={INQUIRY_LIMIT}
                placeholder="Example: We need a customized monitoring plan for 50+ assets and monthly compliance reports."
                className="min-h-32 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:ring-2 focus:ring-black sm:min-h-36"
                value={formData.inquiryMessage}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    inquiryMessage: event.target.value,
                  }))
                }
              />
              <p className="mt-2 text-right text-xs text-gray-500">
                {formData.inquiryMessage.length}/{INQUIRY_LIMIT}
              </p>
            </div>

            <section className="rounded-2xl border border-gray-200 bg-gray-50 p-4 sm:p-5">
              <h2 className="text-sm font-semibold text-black">Marketing Consent (Optional)</h2>
              <div className="mt-3 h-px w-full bg-gray-200" />

              <ul className="mt-4 space-y-3">
                <li>
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-white px-4 py-3 text-sm text-gray-700 ring-1 ring-gray-200 transition-colors hover:bg-gray-100">
                    <input
                      type="checkbox"
                      checked={formData.consentEmail}
                      onChange={(event) => setFormData((prev) => ({ ...prev, consentEmail: event.target.checked }))}
                      className="mt-0.5 h-5 w-5 rounded border-gray-400 accent-black"
                    />
                    I agree to receive marketing emails.
                  </label>
                </li>

                <li>
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-white px-4 py-3 text-sm text-gray-700 ring-1 ring-gray-200 transition-colors hover:bg-gray-100">
                    <input
                      type="checkbox"
                      checked={formData.consentSms}
                      onChange={(event) => setFormData((prev) => ({ ...prev, consentSms: event.target.checked }))}
                      className="mt-0.5 h-5 w-5 rounded border-gray-400 accent-black"
                    />
                    I agree to receive SMS/text notifications.
                  </label>
                </li>

                <li>
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-white px-4 py-3 text-sm text-gray-700 ring-1 ring-gray-200 transition-colors hover:bg-gray-100">
                    <input
                      type="checkbox"
                      checked={formData.consentServiceUpdates}
                      onChange={(event) =>
                        setFormData((prev) => ({
                          ...prev,
                          consentServiceUpdates: event.target.checked,
                        }))
                      }
                      className="mt-0.5 h-5 w-5 rounded border-gray-400 accent-black"
                    />
                    I agree to receive service update notifications.
                  </label>
                </li>

                <li>
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-white px-4 py-3 text-sm text-gray-700 ring-1 ring-gray-200 transition-colors hover:bg-gray-100">
                    <input
                      type="checkbox"
                      checked={formData.consentEventsPromotions}
                      onChange={(event) =>
                        setFormData((prev) => ({
                          ...prev,
                          consentEventsPromotions: event.target.checked,
                        }))
                      }
                      className="mt-0.5 h-5 w-5 rounded border-gray-400 accent-black"
                    />
                    I agree to receive event and promotion notifications.
                  </label>
                </li>
              </ul>

              <p className="mt-4 text-xs text-gray-500">
                Consent is optional and can be withdrawn at any time.
              </p>
            </section>

            <div className="flex justify-center pt-1">
              <button type="submit" className="btn-primary h-12 w-full text-sm sm:w-auto sm:min-w-52 sm:px-8">
                Send Inquiry
              </button>
            </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
