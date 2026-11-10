export type CurrencyCode = 'INR' | 'USD'
export type DistanceUnit = 'km' | 'mi'
export type SpeedUnit = 'km/h' | 'mph'

export interface LocaleConfig {
  region: 'India' | 'Global'
  currency: CurrencyCode
  currencySymbol: string
  distanceUnit: DistanceUnit
  speedUnit: SpeedUnit
  fuelUnit: 'L' | 'gal'
}

export const defaultLocale: LocaleConfig = {
  region: 'India',
  currency: 'INR',
  currencySymbol: '₹',
  distanceUnit: 'km',
  speedUnit: 'km/h',
  fuelUnit: 'L',
}

let activeLocale: LocaleConfig = { ...defaultLocale }

export const getLocale = (): LocaleConfig => activeLocale

export const setLocale = (config: Partial<LocaleConfig>) => {
  activeLocale = { ...activeLocale, ...config }
}

/**
 * Format currency with Indian Lakhs or Western style
 */
export const formatCurrency = (amount: number, locale = activeLocale): string => {
  if (locale.currency === 'INR') {
    // Format Indian number system (e.g. 1,50,000)
    const formatted = new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0,
    }).format(Math.round(amount))
    return `₹${formatted}`
  }
  return `$${amount.toFixed(0)}`
}

/**
 * Format distance with unit
 */
export const formatDistance = (distanceKm: number, locale = activeLocale): string => {
  if (locale.distanceUnit === 'mi') {
    const miles = distanceKm * 0.621371
    return `${miles.toFixed(1)} mi`
  }
  return `${distanceKm.toFixed(0)} km`
}

/**
 * Format speed with unit
 */
export const formatSpeed = (speedKmh: number, locale = activeLocale): string => {
  if (locale.speedUnit === 'mph') {
    const mph = speedKmh * 0.621371
    return `${Math.round(mph)} mph`
  }
  return `${Math.round(speedKmh)} km/h`
}

/**
 * Indian city coordinates & landmarks
 */
export const INDIAN_CITIES = {
  DELHI: { name: 'Delhi NCR', lat: 28.6139, lng: 77.209 },
  MUMBAI: { name: 'Mumbai', lat: 19.076, lng: 72.8777 },
  BANGALORE: { name: 'Bangalore', lat: 12.9716, lng: 77.5946 },
  PUNE: { name: 'Pune', lat: 18.5204, lng: 73.8567 },
  GOA: { name: 'Goa', lat: 15.2993, lng: 74.124 },
  CHANDIGARH: { name: 'Chandigarh', lat: 30.7333, lng: 76.7794 },
}
