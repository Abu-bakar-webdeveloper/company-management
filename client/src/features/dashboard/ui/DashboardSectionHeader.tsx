import { Link } from 'react-router-dom'

type DashboardSectionHeaderProps = {
  title: string
  actionLabel?: string
  onAction?: () => void
  to?: string
}

export function DashboardSectionHeader({
  title,
  actionLabel = 'View All',
  onAction,
  to,
}: DashboardSectionHeaderProps) {
  const showAction = Boolean(to || onAction)
  const actionClassName = 'text-xs lg:text-sm font-bold text-primary hover:opacity-90'

  return (
    <div className="flex items-center justify-between px-6 py-5">
      <h3 className="text-[18px] lg:text-[24px] font-semibold leading-6 text-heading">{title}</h3>
      {showAction ? (
        to ? (
          <Link to={to} className={actionClassName}>
            {actionLabel}
          </Link>
        ) : (
          <button type="button" onClick={onAction} className={actionClassName}>
            {actionLabel}
          </button>
        )
      ) : null}
    </div>
  )
}
