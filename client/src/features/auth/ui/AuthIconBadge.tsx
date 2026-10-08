import type { ReactNode } from 'react'

type AuthIconBadgeProps = {
  children: ReactNode
}

export function AuthIconBadge({ children }: AuthIconBadgeProps) {
  return (
    <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-primary-muted">
      {children}
    </div>
  )
}
