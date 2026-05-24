import { Link } from '@/i18n/routing';

export default function ApiPage() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.trim() || 'http://localhost:5000/api/v1';

  return (
    <main className="min-h-screen bg-white px-6 py-16 text-gray-900 sm:px-10 lg:px-16">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gray-500">API</p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">Developer API</h1>
        <p className="max-w-2xl text-base leading-7 text-gray-600 sm:text-lg">
          The public backend for this app is served from the configured base URL below.
        </p>

        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <p className="text-sm font-medium text-gray-500">Base URL</p>
          <p className="mt-2 break-all text-base font-semibold text-gray-900">{baseUrl}</p>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <Link href="/login2" className="rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800">
            Back to sign in
          </Link>
          <Link href="/contact" className="rounded-full border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50">
            Contact support
          </Link>
        </div>
      </div>
    </main>
  );
}