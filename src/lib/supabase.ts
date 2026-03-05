import { createClient } from '@supabase/supabase-js'

const supabaseUrlRaw = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabaseUrlBRaw = process.env.NEXT_PUBLIC_SUPABASE_URL_B
const supabaseKeyB = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_B

if (!supabaseUrlRaw || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

if (!supabaseUrlBRaw || !supabaseKeyB) {
  throw new Error('Missing Supabase B environment variables')
}

const normalizeSupabaseUrl = (urlValue: string, envName: string): string => {
  const trimmed = urlValue.trim()
  const hasProtocol = /^https?:\/\//i.test(trimmed)
  const isLocalhost = /^(localhost|127\.0\.0\.1)/i.test(trimmed)
  const normalized = hasProtocol
    ? trimmed
    : `${isLocalhost ? 'http' : 'https'}://${trimmed}`

  try {
    return new URL(normalized).toString().replace(/\/$/, '')
  } catch {
    throw new Error(`Invalid URL format in ${envName}: "${urlValue}"`)
  }
}

const supabaseUrl = normalizeSupabaseUrl(
  supabaseUrlRaw,
  'NEXT_PUBLIC_SUPABASE_URL'
)
const supabaseUrlB = normalizeSupabaseUrl(
  supabaseUrlBRaw,
  'NEXT_PUBLIC_SUPABASE_URL_B'
)

export const supabase = createClient(supabaseUrl, supabaseKey)
export const supabaseB = createClient(supabaseUrlB, supabaseKeyB)