import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import {
  useAttendanceSettings,
  useUpdateAttendanceSettings,
} from '@/features/attendance/hooks/useAttendance'
import { capturePunchLocation } from '@/features/attendance/lib/punch-location'
import type { AttendanceOfficeSite, AttendanceSettings } from '@/features/attendance/model/types'
import { getErrorMessage } from '@/shared/api/errors'

const WEEKDAY_OPTIONS = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
]

const emptySite = (): AttendanceOfficeSite => ({
  name: '',
  lat: 0,
  lng: 0,
  radiusMeters: 200,
})

export function AttendanceSettingsPage() {
  const { data, isLoading } = useAttendanceSettings()
  const update = useUpdateAttendanceSettings()
  const [form, setForm] = useState<AttendanceSettings | null>(null)
  const [locatingIndex, setLocatingIndex] = useState<number | null>(null)

  useEffect(() => {
    if (data) {
      setForm({
        ...data,
        officeSites: data.officeSites ?? [],
      })
    }
  }, [data])

  const onSave = async () => {
    if (!form) return
    const sites = form.officeSites.filter((s) => s.name.trim())
    for (const site of sites) {
      if (site.lat < -90 || site.lat > 90 || site.lng < -180 || site.lng > 180) {
        toast.error('Office site coordinates are invalid')
        return
      }
    }
    try {
      await update.mutateAsync({
        timezone: form.timezone,
        workDays: form.workDays,
        defaultShift: form.defaultShift,
        halfDayHours: form.halfDayHours,
        fullDayHours: form.fullDayHours,
        officeSites: sites.map((s) => ({
          name: s.name.trim(),
          lat: s.lat,
          lng: s.lng,
          radiusMeters: s.radiusMeters || 200,
        })),
      })
      toast.success('Attendance settings saved')
    } catch (err) {
      toast.error(getErrorMessage(err, 'Unable to save settings'))
    }
  }

  const toggleWorkDay = (day: number) => {
    if (!form) return
    const has = form.workDays.includes(day)
    setForm({
      ...form,
      workDays: has
        ? form.workDays.filter((d) => d !== day)
        : [...form.workDays, day].sort((a, b) => a - b),
    })
  }

  const updateSite = (index: number, patch: Partial<AttendanceOfficeSite>) => {
    if (!form) return
    setForm({
      ...form,
      officeSites: form.officeSites.map((s, i) => (i === index ? { ...s, ...patch } : s)),
    })
  }

  const addSite = () => {
    if (!form) return
    setForm({ ...form, officeSites: [...form.officeSites, emptySite()] })
  }

  const removeSite = (index: number) => {
    if (!form) return
    setForm({
      ...form,
      officeSites: form.officeSites.filter((_, i) => i !== index),
    })
  }

  const useCurrentLocation = async (index: number) => {
    setLocatingIndex(index)
    try {
      const captured = await capturePunchLocation()
      if (!captured.location) {
        toast.error('Unable to read current location')
        return
      }
      updateSite(index, {
        lat: captured.location.lat,
        lng: captured.location.lng,
        ...(captured.location.label && !form?.officeSites[index]?.name
          ? { name: captured.location.label }
          : {}),
      })
      toast.success('Location filled from GPS')
    } finally {
      setLocatingIndex(null)
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-bold leading-9 text-[#1E293B]">Attendance Settings</h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Configure company shift, timezone, grace period, and office sites for soft location checks.
          </p>
        </div>
        <Link to="/attendance" className="text-sm font-medium text-[#136DEC] hover:underline">
          Back to Attendance
        </Link>
      </header>

      {isLoading && <p className="text-sm text-text-muted">Loading…</p>}

      {form && (
        <div className="max-w-2xl space-y-5 rounded-xl border border-border-card bg-surface p-6">
          <label className="block text-sm">
            <span className="mb-1 block text-text-muted">Timezone</span>
            <input
              value={form.timezone}
              onChange={(e) => setForm({ ...form, timezone: e.target.value })}
              className="w-full rounded-lg border border-border-card px-3 py-2"
              placeholder="Asia/Karachi"
            />
          </label>

          <div>
            <p className="mb-2 text-sm text-text-muted">Work days</p>
            <div className="flex flex-wrap gap-2">
              {WEEKDAY_OPTIONS.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => toggleWorkDay(d.value)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                    form.workDays.includes(d.value)
                      ? 'bg-[#136DEC] text-white'
                      : 'border border-border-card text-text-muted'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block text-text-muted">Shift start</span>
              <input
                type="time"
                value={form.defaultShift.start}
                onChange={(e) =>
                  setForm({
                    ...form,
                    defaultShift: { ...form.defaultShift, start: e.target.value },
                  })
                }
                className="w-full rounded-lg border border-border-card px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-text-muted">Shift end</span>
              <input
                type="time"
                value={form.defaultShift.end}
                onChange={(e) =>
                  setForm({
                    ...form,
                    defaultShift: { ...form.defaultShift, end: e.target.value },
                  })
                }
                className="w-full rounded-lg border border-border-card px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-text-muted">Break minutes</span>
              <input
                type="number"
                min={0}
                value={form.defaultShift.breakMinutes}
                onChange={(e) =>
                  setForm({
                    ...form,
                    defaultShift: {
                      ...form.defaultShift,
                      breakMinutes: Number(e.target.value),
                    },
                  })
                }
                className="w-full rounded-lg border border-border-card px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-text-muted">Grace minutes</span>
              <input
                type="number"
                min={0}
                value={form.defaultShift.graceMinutes}
                onChange={(e) =>
                  setForm({
                    ...form,
                    defaultShift: {
                      ...form.defaultShift,
                      graceMinutes: Number(e.target.value),
                    },
                  })
                }
                className="w-full rounded-lg border border-border-card px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-text-muted">Half-day hours</span>
              <input
                type="number"
                min={0}
                step={0.5}
                value={form.halfDayHours}
                onChange={(e) => setForm({ ...form, halfDayHours: Number(e.target.value) })}
                className="w-full rounded-lg border border-border-card px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-text-muted">Full-day hours</span>
              <input
                type="number"
                min={0}
                step={0.5}
                value={form.fullDayHours}
                onChange={(e) => setForm({ ...form, fullDayHours: Number(e.target.value) })}
                className="w-full rounded-lg border border-border-card px-3 py-2"
              />
            </label>
          </div>

          <div className="border-t border-border-card pt-5">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-heading">Office sites</h2>
                <p className="mt-0.5 text-xs text-text-muted">
                  Optional. When set, punches outside these radii are flagged as remote (still
                  allowed). Empty = capture GPS/IP only.
                </p>
              </div>
              <button
                type="button"
                onClick={addSite}
                className="shrink-0 rounded-lg border border-border-card px-3 py-1.5 text-sm font-medium text-heading hover:bg-[#F8FAFC]"
              >
                Add site
              </button>
            </div>

            {form.officeSites.length === 0 ? (
              <p className="text-sm text-text-muted">No office sites configured.</p>
            ) : (
              <ul className="space-y-4">
                {form.officeSites.map((site, index) => (
                  <li
                    key={index}
                    className="rounded-lg border border-border-card bg-[#F8FAFC] p-4"
                  >
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <label className="block text-sm sm:col-span-2">
                        <span className="mb-1 block text-text-muted">Name</span>
                        <input
                          value={site.name}
                          onChange={(e) => updateSite(index, { name: e.target.value })}
                          className="w-full rounded-lg border border-border-card bg-white px-3 py-2"
                          placeholder="Head office"
                        />
                      </label>
                      <label className="block text-sm">
                        <span className="mb-1 block text-text-muted">Latitude</span>
                        <input
                          type="number"
                          step="any"
                          value={site.lat}
                          onChange={(e) => updateSite(index, { lat: Number(e.target.value) })}
                          className="w-full rounded-lg border border-border-card bg-white px-3 py-2"
                        />
                      </label>
                      <label className="block text-sm">
                        <span className="mb-1 block text-text-muted">Longitude</span>
                        <input
                          type="number"
                          step="any"
                          value={site.lng}
                          onChange={(e) => updateSite(index, { lng: Number(e.target.value) })}
                          className="w-full rounded-lg border border-border-card bg-white px-3 py-2"
                        />
                      </label>
                      <label className="block text-sm">
                        <span className="mb-1 block text-text-muted">Radius (meters)</span>
                        <input
                          type="number"
                          min={50}
                          max={5000}
                          value={site.radiusMeters}
                          onChange={(e) =>
                            updateSite(index, { radiusMeters: Number(e.target.value) })
                          }
                          className="w-full rounded-lg border border-border-card bg-white px-3 py-2"
                        />
                      </label>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => useCurrentLocation(index)}
                        disabled={locatingIndex === index}
                        className="rounded-lg bg-[#136DEC] px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                      >
                        {locatingIndex === index ? 'Locating…' : 'Use my current location'}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeSite(index)}
                        className="rounded-lg border border-border-card px-3 py-1.5 text-sm font-medium text-[#DC2626] hover:bg-white"
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {form.workDays.length === 0 && (
            <p className="text-sm text-[#DC2626]">Select at least one work day.</p>
          )}
          <button
            type="button"
            onClick={onSave}
            disabled={update.isPending || form.workDays.length === 0}
            className="rounded-lg bg-[#136DEC] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {update.isPending ? 'Saving…' : 'Save settings'}
          </button>
        </div>
      )}
    </div>
  )
}
