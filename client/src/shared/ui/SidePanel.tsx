import { useEffect, type ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

type SidePanelProps = {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
}

export function SidePanel({ open, onClose, title, children, footer }: SidePanelProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  return (
    <>
      <button
        type="button"
        aria-label="Close panel"
        onClick={onClose}
        className={cn(
          'fixed inset-0 z-40 bg-[#0a1628]/40 backdrop-blur-[2px] transition-opacity',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="panel-title"
        className={cn(
          'fixed inset-y-0 right-0 z-50 flex w-full max-w-[400px] flex-col border-l border-border-card bg-surface shadow-[var(--shadow-card)] transition-transform duration-300',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="flex items-center justify-between border-b border-border-card px-4 py-4 sm:px-6">
          <h2 id="panel-title" className="text-lg font-bold text-heading">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg text-text-muted hover:bg-surface-muted hover:text-heading"
            aria-label="Close"
          >
            <svg className="size-4" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
              <path d="m2 2 10 10M12 2 2 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">{children}</div>
        {footer && <div className="border-t border-border-card p-4 sm:p-6">{footer}</div>}
      </aside>
    </>
  )
}
