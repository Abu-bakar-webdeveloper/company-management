import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useUpdateAttendanceDay } from '@/features/attendance/hooks/useAttendance'
import type { AttendanceDay, AttendanceDayStatus } from '@/features/attendance/model/types'
import { getErrorMessage } from '@/shared/api/errors'
import { Modal } from '@/shared/ui/Modal'
import { SelectField } from '@/shared/ui/SelectField'

const STATUSES: AttendanceDayStatus[] = [
  'present',
  'late',
  'absent',
  'on_leave',
  'half_day',
  'weekend',
  'holiday',
  'not_arrived',
]

function toLocalInputValue(iso: string | null | undefined): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

type CorrectAttendanceDayModalProps = {
  day: AttendanceDay | null
  onClose: () => void
}

export function CorrectAttendanceDayModal({ day, onClose }: CorrectAttendanceDayModalProps) {
  const update = useUpdateAttendanceDay()
  const [status, setStatus] = useState<AttendanceDayStatus>('present')
  const [clockIn, setClockIn] = useState('')
  const [clockOut, setClockOut] = useState('')
  const [workMinutes, setWorkMinutes] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (!day) return
    setStatus(day.status)
    setClockIn(toLocalInputValue(day.clockInAt))
    setClockOut(toLocalInputValue(day.clockOutAt))
    setWorkMinutes(String(day.totalWorkMinutes ?? 0))
    setNotes(day.notes ?? '')
  }, [day])

  if (!day) return null

  const onSave = async () => {
    try {
      await update.mutateAsync({
        id: day.id,
        payload: {
          status,
          clockInAt: clockIn ? new Date(clockIn).toISOString() : null,
          clockOutAt: clockOut ? new Date(clockOut).toISOString() : null,
          totalWorkMinutes: workMinutes === '' ? undefined : Number(workMinutes),
          notes,
        },
      })
      toast.success('Attendance day updated')
      onClose()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Unable to update attendance day'))
    }
  }

  return (
    <Modal
      open={Boolean(day)}
      onClose={onClose}
      title="Correct attendance"
      subtitle={day.date}
      footer={
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border-card px-4 py-2 text-sm font-semibold text-heading"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={update.isPending}
            onClick={() => void onSave()}
            className="rounded-lg bg-[#136DEC] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            Save
          </button>
        </div>
      }
    >
      <div className="space-y-4 p-1">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-heading">Status</span>
          <SelectField
            value={status}
            onChange={(e) => setStatus(e.target.value as AttendanceDayStatus)}
            className="!h-10 w-full rounded-lg text-sm"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace('_', ' ')}
              </option>
            ))}
          </SelectField>
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-heading">Clock in</span>
          <input
            type="datetime-local"
            value={clockIn}
            onChange={(e) => setClockIn(e.target.value)}
            className="w-full rounded-lg border border-border-card px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-heading">Clock out</span>
          <input
            type="datetime-local"
            value={clockOut}
            onChange={(e) => setClockOut(e.target.value)}
            className="w-full rounded-lg border border-border-card px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-heading">Work minutes</span>
          <input
            type="number"
            min={0}
            value={workMinutes}
            onChange={(e) => setWorkMinutes(e.target.value)}
            className="w-full rounded-lg border border-border-card px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-heading">Notes</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-border-card px-3 py-2"
          />
        </label>
      </div>
    </Modal>
  )
}
