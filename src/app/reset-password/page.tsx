import { redirect } from 'next/navigation';

type ResetPasswordRedirectPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ResetPasswordRedirectPage({
  searchParams,
}: ResetPasswordRedirectPageProps) {
  const params = await searchParams;
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === 'string') {
          query.append(key, item);
        }
      }
      continue;
    }

    if (typeof value === 'string') {
      query.set(key, value);
    }
  }

  const suffix = query.toString();
  redirect(suffix ? `/en/reset-password?${suffix}` : '/en/reset-password');
}