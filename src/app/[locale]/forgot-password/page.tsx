import { Link } from '@/i18n/routing';

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-16 text-gray-900 sm:px-10 lg:px-16">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gray-500">Account access</p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">Forgot password</h1>
        <p className="max-w-xl text-base leading-7 text-gray-600 sm:text-lg">
          Password reset is not wired up yet in this deployment. Use the login page to sign in, or contact support if you need help recovering access.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <Link href="/login2" className="rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800">
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