import { notFound } from 'next/navigation'
import { PageParamsSchema, TranslationsSchema } from './pricing'
import type { Locale } from './pricing'
import PricingClient from './PricingClient'

// ─── Load translations ──────────────────────────────────────────────────────
async function getTranslations(locale: Locale) {
  // Dynamic import keeps bundles lean — only the active locale is loaded
  const raw = await import(`./${locale}.json`)
  return TranslationsSchema.parse(raw.default ?? raw)
}

// ─── Metadata ───────────────────────────────────────────────────────────────
/*export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const parsed = PageParamsSchema.safeParse({ locale })
  if (!parsed.success) return {}

  const t = await getTranslations(parsed.data.locale)
  return {
    title: t.heading,
    description: t.subheading,
  }
}*/

// ─── Static locale params ───────────────────────────────────────────────────
export async function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'kr' }]
}

// ─── Page ───────────────────────────────────────────────────────────────────
// In Next.js 15+, `params` is a Promise — must be awaited before use.
export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  // 1. Await and validate the locale param with Zod
  const rawParams = await params
  const parsed = PageParamsSchema.safeParse({ locale: rawParams.locale })

  if (!parsed.success) {
    // Invalid locale → 404
    notFound()
  }

  // 2. Load validated translations on the server
  const translations = await getTranslations(parsed.data.locale)

  // 3. Render the client component with server-fetched data
  return (
    <PricingClient
      translations={translations}
      locale={parsed.data.locale}
    />
  )
}
