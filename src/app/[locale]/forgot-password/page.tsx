'use client';

import { FormEvent, useState } from 'react';
import { Link } from '@/i18n/routing';
import { apiClient, getApiErrorMessage } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setSuccess(null);
    setError(null);

    try {
      const response = await apiClient.post('/auth/forgot-password', { email });
      setSuccess(response.data?.message || 'If your email exists, a reset link has been sent.');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not send reset link. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-white px-6 py-16 text-gray-900 sm:px-10 lg:px-16">
      <div className="mx-auto w-full max-w-xl">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gray-500">Account access</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">Forgot password</h1>
        <p className="mt-4 text-base leading-7 text-gray-600 sm:text-lg">
          Enter your account email and we will send you a secure reset link.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-black">Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email"
              className="input-field"
            />
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />
                <span>Sending...</span>
              </>
            ) : (
              'Send reset link'
            )}
          </button>

          {success && <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{success}</p>}
          {error && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}
        </form>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/login" className="rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800">
            Back to login
          </Link>
          <Link href="/signup" className="rounded-full border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50">
            Create an account
          </Link>
        </div>
      </div>
    </main>
  );
}
