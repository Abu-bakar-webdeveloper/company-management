import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

type TipState = {
  lines: string[]
  x: number
  y: number
  place: 'above' | 'below'
}

export function useAttendanceHoverTip() {
  const [tip, setTip] = useState<TipState | null>(null)

  const show = useCallback((el: HTMLElement, lines: string[]) => {
    const rect = el.getBoundingClientRect()
    const place: 'above' | 'below' = rect.top < 120 ? 'below' : 'above'
    setTip({
      lines,
      x: rect.left + rect.width / 2,
      y: place === 'above' ? rect.top - 8 : rect.bottom + 8,
      place,
    })
  }, [])

  const hide = useCallback(() => setTip(null), [])

  useEffect(() => {
    if (!tip) return
    const onScroll = () => setTip(null)
    window.addEventListener('scroll', onScroll, true)
    return () => window.removeEventListener('scroll', onScroll, true)
  }, [tip])

  const node: ReactNode =
    tip &&
    createPortal(
      <div
        role="tooltip"
        className="pointer-events-none fixed z-[100] w-max max-w-[240px] -translate-x-1/2 rounded-md bg-[#0F172A] px-2.5 py-1.5 text-left text-[11px] leading-4 text-white shadow-lg"
        style={{
          left: tip.x,
          top: tip.y,
          transform:
            tip.place === 'above'
              ? 'translate(-50%, -100%)'
              : 'translate(-50%, 0)',
        }}
      >
        {tip.lines.map((line) => (
          <div key={line}>{line}</div>
        ))}
      </div>,
      document.body,
    )

  return { show, hide, node }
}
