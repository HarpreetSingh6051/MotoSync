import { getAppUrl } from '@/lib/supabase'

const isLocalBase = (base: string) =>
  /localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\]/.test(base)

const baseUrl = () => getAppUrl().replace(/\/$/, '')

/**
 * Production share links use clean paths (`/r/:id`, `/live/:id`) with SPA
 * rewrites. Local dev keeps the hash router so `vite` does not 404.
 */
export const rideShareUrl = (id: string) => {
  const base = baseUrl()
  return isLocalBase(base) ? `${base}/#/ride/${id}` : `${base}/r/${id}`
}

export const liveShareUrl = (id: string, family = false) => {
  const base = baseUrl()
  const query = family ? '?family=1' : ''
  return isLocalBase(base)
    ? `${base}/#/ride/${id}/live${query}`
    : `${base}/live/${id}${query}`
}

export const profileShareUrl = () => `${baseUrl()}/#/garage`

export const appShareUrl = () => baseUrl()
