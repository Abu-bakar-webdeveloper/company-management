import type { ReactNode } from 'react'

type HubPageHeaderProps = {
  title: string
  subtitle: string
  actions?: ReactNode
}

export function HubPageHeader({ title, subtitle, actions }: HubPageHeaderProps) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold leading-8 text-heading sm:text-[30px] sm:leading-9">
          {title}
        </h1>
        <p className="mt-1 text-sm leading-6 text-text-muted sm:text-base">{subtitle}</p>
      </div>
      {actions ? (
        <div className="flex w-full shrink-0 flex-wrap items-center gap-3 sm:w-auto">
          {actions}
        </div>
      ) : null}
    </header>
  )
}
