import { ComingSoonState } from '@/features/dashboard/ui/ComingSoonState'
import { MoreIcon } from '@/features/performance/ui/icons'
import { Card } from '@/shared/ui/Card'

type DepartmentPerformanceCardProps = {
  data: { name: string; score: number; color: string }[]
}

export function DepartmentPerformanceCard({ data }: DepartmentPerformanceCardProps) {
  return (
    <Card className="flex min-h-[280px] flex-col p-4 sm:min-h-[320px] sm:p-[25px]">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h3 className="text-lg font-bold text-heading">Department Performance</h3>
        {data.length > 0 ? (
          <button
            type="button"
            className="text-text-muted hover:text-heading"
            aria-label="More options"
          >
            <MoreIcon />
          </button>
        ) : null}
      </div>
      {data.length === 0 ? (
        <ComingSoonState
          className="flex-1"
          title="No departments yet"
          description="Department performance will show up here once reviews are available."
          minHeight="min-h-0"
        />
      ) : (
        <ul className="flex flex-col gap-5">
          {data.map((dept) => (
            <li key={dept.name}>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-heading">{dept.name}</span>
                <span className="font-semibold text-heading">{dept.score}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#E2E8F0]">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${dept.score}%`, backgroundColor: dept.color }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
