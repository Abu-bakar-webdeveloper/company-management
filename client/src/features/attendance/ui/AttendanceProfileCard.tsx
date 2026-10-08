import { Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/model/AuthContext'
import { userHasPermission } from '@/features/auth/model/permissions'
import type { AttendanceEmployeeProfile } from '@/features/attendance/model/types'
import { formatDateLabel } from '@/features/attendance/lib/attendance-utils'

export function AttendanceProfileCard({ profile }: { profile: AttendanceEmployeeProfile }) {
  const { user } = useAuth()
  const canEdit = !!user && userHasPermission(user, 'employees:write')
  const joinLabel = profile.joinDate
    ? formatDateLabel(profile.joinDate.slice(0, 10))
    : '—'

  return (
    <div className="mb-6 rounded-xl border border-border-card bg-surface p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#E2E8F0] text-lg font-bold text-heading">
            {profile.avatar ? (
              <img src={profile.avatar} alt="" className="size-full object-cover" />
            ) : (
              profile.fullName.slice(0, 2).toUpperCase()
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-heading">{profile.fullName}</h2>
            <p className="text-sm text-text-muted">
              {profile.jobTitle ?? 'Employee'}
              {profile.department ? ` · ${profile.department}` : ''}
            </p>
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-text-muted">
              <span>{profile.email}</span>
              {profile.phone && <span>{profile.phone}</span>}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-start gap-2 lg:items-end">
          <div className="text-sm text-text-muted">
            Join Date: <span className="font-medium text-heading">{joinLabel}</span>
          </div>
          <span className="rounded-full bg-[#ECFDF5] px-2.5 py-1 text-xs font-semibold uppercase text-[#00B67A]">
            {profile.status}
          </span>
          {canEdit && (
            <Link
              to={`/employees/${profile.id}/edit`}
              className="inline-flex items-center gap-2 rounded-lg bg-[#136DEC] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              Edit Employee
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
