import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

export type HubStatCard = {
  id: string
  label: string
  value: string
  hint?: string
  hintClass?: string
  icon: ReactNode
  iconBg: string
  border: string
}

export function HubStatCardView({ card }: { card: HubStatCard }) {
  return (
    <div className={cn('rounded-xl border bg-surface p-4 sm:p-5', card.border)}>
      <div
        className={cn(
          'flex size-9 items-center justify-center rounded-lg sm:size-10',
          card.iconBg,
        )}
      >
        {card.icon}
      </div>
      <p className="mt-3 text-sm text-text-muted sm:mt-4">{card.label}</p>
      <p className="mt-1 truncate text-xl font-bold leading-7 text-heading sm:text-[24px] sm:leading-8">
        {card.value}
      </p>
      {card.hint ? (
        <p className={cn('mt-1 text-xs font-semibold', card.hintClass ?? 'text-text-muted')}>
          {card.hint}
        </p>
      ) : null}
    </div>
  )
}

export function HubStatsRow({
  cards,
  columnsClass = 'sm:grid-cols-2 xl:grid-cols-4',
}: {
  cards: HubStatCard[]
  columnsClass?: string
}) {
  if (cards.length === 0) return null

  return (
    <div className={cn('mb-6 grid grid-cols-1 gap-3 sm:gap-4', columnsClass)}>
      {cards.map((card) => (
        <HubStatCardView key={card.id} card={card} />
      ))}
    </div>
  )
}
