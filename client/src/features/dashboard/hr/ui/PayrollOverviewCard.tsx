import { ComingSoonState } from '@/features/dashboard/ui/ComingSoonState'

export function PayrollOverviewCard() {
  return (
    <div className="flex min-h-[280px] flex-col rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:min-h-[300px] sm:p-6">
      <h3 className="mb-6 text-xl font-semibold leading-6 text-[#1E293B] sm:text-2xl">
        Payroll Overview
      </h3>
      <ComingSoonState
        className="flex-1"
        title="No payroll yet"
        description="Payroll overview will show up here once payroll data is available."
        minHeight="min-h-0"
      />
    </div>
  )
}
