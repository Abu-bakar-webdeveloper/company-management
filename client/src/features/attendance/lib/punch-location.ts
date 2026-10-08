import type { PunchClientLocation, PunchLocationSummary } from '@/features/attendance/model/types'

export type CapturePunchLocationResult = {
  location?: PunchClientLocation
  /** True when GPS was unavailable, denied, or timed out */
  missing: boolean
}

function getCurrentPosition(options: PositionOptions): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation unsupported'))
      return
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, options)
  })
}

async function reverseGeocodeLabel(lat: number, lng: number): Promise<string | undefined> {
  try {
    const url = new URL('https://nominatim.openstreetmap.org/reverse')
    url.searchParams.set('format', 'jsonv2')
    url.searchParams.set('lat', String(lat))
    url.searchParams.set('lon', String(lng))
    url.searchParams.set('zoom', '16')
    const res = await fetch(url.toString(), {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(4_000),
    })
    if (!res.ok) return undefined
    const data = (await res.json()) as {
      name?: string
      display_name?: string
      address?: { suburb?: string; neighbourhood?: string; city?: string; town?: string }
    }
    const short =
      data.name ||
      data.address?.neighbourhood ||
      data.address?.suburb ||
      data.address?.city ||
      data.address?.town
    if (short) return short.slice(0, 200)
    if (data.display_name) return data.display_name.slice(0, 200)
    return undefined
  } catch {
    return undefined
  }
}

/** Capture GPS (+ optional place label). Never throws — punch always proceeds. */
export async function capturePunchLocation(): Promise<CapturePunchLocationResult> {
  try {
    const pos = await getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 8_000,
      maximumAge: 30_000,
    })
    const lat = pos.coords.latitude
    const lng = pos.coords.longitude
    const accuracyMeters =
      typeof pos.coords.accuracy === 'number' ? pos.coords.accuracy : undefined
    const label = await reverseGeocodeLabel(lat, lng)
    return {
      missing: false,
      location: {
        lat,
        lng,
        ...(accuracyMeters != null ? { accuracyMeters } : {}),
        ...(label ? { label } : {}),
      },
    }
  } catch {
    return { missing: true }
  }
}

export function mapsLink(lat?: number, lng?: number): string | null {
  if (lat == null || lng == null) return null
  return `https://maps.google.com/?q=${lat},${lng}`
}

export function locationDisplayLabel(loc?: PunchLocationSummary | null): string {
  if (!loc) return '—'
  if (loc.label) return loc.label
  if (loc.lat != null && loc.lng != null) {
    return `${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`
  }
  if (loc.ip) return `IP ${loc.ip}`
  return 'Location unknown'
}
