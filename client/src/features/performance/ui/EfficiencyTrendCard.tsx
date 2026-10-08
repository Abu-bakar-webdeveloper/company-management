import { LightningBoltIcon } from '@/features/performance/ui/icons'
import { cn } from '@/shared/lib/cn'

const BAR_HEIGHTS = [40, 60, 45, 75, 100]
const BAR_OPACITIES = [0.35, 0.5, 0.55, 0.8, 1]
const MAX_BAR_HEIGHT = 44

type EfficiencyTrendCardProps = {
  value: number
  className?: string
}

export function EfficiencyTrendCard({ value, className }: EfficiencyTrendCardProps) {
  return (
    <div
      className={cn(
        'relative flex min-h-[168px] flex-col overflow-hidden rounded-2xl bg-[#1877F2] p-4 shadow-[0_6px_20px_rgba(24,119,242,0.32)] sm:min-h-0 sm:p-5 lg:p-6',
        className,
      )}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wider text-white/90 sm:text-xs">
        Efficiency Trend
      </p>
      <p className="mt-1.5 text-[28px] font-bold leading-none text-white sm:mt-2 sm:text-[32px] lg:text-[36px]">
        {value.toFixed(1)}%
      </p>

      <div className="relative z-10 mt-auto flex items-end gap-1.5 pt-5 sm:mt-6 sm:pt-0 lg:mt-7">
        {BAR_HEIGHTS.map((height, index) => (
          <div
            key={index}
            className="w-2.5 rounded-t-[3px] bg-white sm:w-3"
            style={{
              height: `${(height / 100) * MAX_BAR_HEIGHT}px`,
              opacity: BAR_OPACITIES[index],
            }}
          />
        ))}
      </div>

      <LightningBoltIcon className="pointer-events-none absolute -bottom-3 -right-2 size-[72px] text-[#5aa3f5]/35 sm:-bottom-4 sm:-right-3 sm:size-[92px] lg:-bottom-5 lg:-right-4 lg:size-[108px]" />
    </div>
  )
}
