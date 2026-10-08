import {
  Children,
  forwardRef,
  isValidElement,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type FocusEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
  type SelectHTMLAttributes,
} from 'react'
import { createPortal } from 'react-dom'
import { ChevronDownIcon } from '@/app/shell/icons'
import { cn } from '@/shared/lib/cn'

const PANEL_TRANSITION_MS = 180

type OptionItem = {
  value: string
  label: string
  disabled?: boolean
  group?: string
}

type ChevronSelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> & {
  error?: boolean
  leadingIcon?: ReactNode
  children?: ReactNode
}

function readOption(
  child: ReactElement<{
    value?: string | number
    disabled?: boolean
    children?: ReactNode
  }>,
  group?: string,
): OptionItem {
  return {
    value: String(child.props.value ?? ''),
    label: String(child.props.children ?? ''),
    disabled: Boolean(child.props.disabled),
    group,
  }
}

function extractOptions(children: ReactNode): OptionItem[] {
  const options: OptionItem[] = []

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return

    if (child.type === 'optgroup') {
      const groupProps = (
        child as ReactElement<{ label?: string; children?: ReactNode }>
      ).props
      const groupLabel = groupProps.label
      Children.forEach(groupProps.children, (optionChild) => {
        if (!isValidElement(optionChild) || optionChild.type !== 'option') return
        options.push(
          readOption(
            optionChild as ReactElement<{
              value?: string | number
              disabled?: boolean
              children?: ReactNode
            }>,
            groupLabel,
          ),
        )
      })
      return
    }

    if (child.type !== 'option') return
    options.push(
      readOption(
        child as ReactElement<{
          value?: string | number
          disabled?: boolean
          children?: ReactNode
        }>,
      ),
    )
  })

  return options
}

function mergeRefs<T>(...refs: Array<Ref<T> | undefined>) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (!ref) continue
      if (typeof ref === 'function') ref(node)
      else ref.current = node
    }
  }
}

export const ChevronSelect = forwardRef<HTMLSelectElement, ChevronSelectProps>(
  function ChevronSelect(
    {
      className,
      children,
      value,
      defaultValue,
      onChange,
      onBlur,
      name,
      disabled,
      id,
      'aria-label': ariaLabel,
      error,
      leadingIcon,
      ...rest
    },
    forwardedRef,
  ) {
    const listboxId = useId()
    const options = useMemo(() => extractOptions(children), [children])
    const isControlled = value !== undefined
    const [uncontrolledValue, setUncontrolledValue] = useState(() =>
      String(defaultValue ?? options[0]?.value ?? ''),
    )
    const currentValue = isControlled ? String(value ?? '') : uncontrolledValue
    const selected = options.find((opt) => opt.value === currentValue)
    const placeholderOption = options.find((opt) => opt.value === '')
    const displayLabel = selected?.label ?? placeholderOption?.label ?? 'Select…'
    const isPlaceholder = !currentValue

    const [isOpen, setIsOpen] = useState(false)
    const [isRendered, setIsRendered] = useState(false)
    const [isVisible, setIsVisible] = useState(false)
    const [panelPos, setPanelPos] = useState({ top: 0, left: 0, width: 0 })
    const containerRef = useRef<HTMLDivElement>(null)
    const triggerRef = useRef<HTMLButtonElement>(null)
    const selectRef = useRef<HTMLSelectElement>(null)
    const panelRef = useRef<HTMLDivElement>(null)

    const updatePanelPos = () => {
      const rect = triggerRef.current?.getBoundingClientRect()
      if (!rect) return

      const viewportPadding = 8
      const estimatedHeight = Math.min(240, Math.max(options.length, 1) * 40 + 16)
      let top = rect.bottom + 6
      if (top + estimatedHeight > window.innerHeight - viewportPadding) {
        top = Math.max(viewportPadding, rect.top - estimatedHeight - 6)
      }

      const width = Math.max(rect.width, 140)
      let left = rect.left
      left = Math.max(viewportPadding, Math.min(left, window.innerWidth - width - viewportPadding))

      setPanelPos({ top, left, width })
    }

    const openPanel = () => {
      if (disabled) return
      updatePanelPos()
      setIsRendered(true)
      setIsOpen(true)
    }

    const closePanel = () => setIsOpen(false)

    useEffect(() => {
      if (!isRendered) return

      if (isOpen) {
        // Double rAF so the closed styles paint before animating open.
        let outer = 0
        let inner = 0
        outer = requestAnimationFrame(() => {
          inner = requestAnimationFrame(() => setIsVisible(true))
        })
        return () => {
          cancelAnimationFrame(outer)
          cancelAnimationFrame(inner)
        }
      }

      setIsVisible(false)
      const timeout = window.setTimeout(() => setIsRendered(false), PANEL_TRANSITION_MS)
      return () => window.clearTimeout(timeout)
    }, [isOpen, isRendered])

    const emitChange = (nextValue: string) => {
      if (!isControlled) setUncontrolledValue(nextValue)
      if (selectRef.current) selectRef.current.value = nextValue

      const target = {
        value: nextValue,
        name: name ?? '',
      }

      onChange?.({
        target,
        currentTarget: target,
      } as ChangeEvent<HTMLSelectElement>)
    }

    const handleSelect = (nextValue: string) => {
      emitChange(nextValue)
      closePanel()
      triggerRef.current?.focus()
    }

    const handleBlur = (event: FocusEvent<HTMLButtonElement>) => {
      onBlur?.({
        ...event,
        target: selectRef.current ?? (event.target as unknown as HTMLSelectElement),
        currentTarget: selectRef.current ?? (event.currentTarget as unknown as HTMLSelectElement),
      } as FocusEvent<HTMLSelectElement>)
    }

    useEffect(() => {
      if (!isOpen) return

      const handlePointerDown = (event: MouseEvent) => {
        const target = event.target as Node
        if (containerRef.current?.contains(target)) return
        if (panelRef.current?.contains(target)) return
        closePanel()
      }

      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          closePanel()
          triggerRef.current?.focus()
        }
      }

      const handleReposition = () => updatePanelPos()

      document.addEventListener('mousedown', handlePointerDown)
      document.addEventListener('keydown', handleEscape)
      window.addEventListener('resize', handleReposition)
      window.addEventListener('scroll', handleReposition, true)

      return () => {
        document.removeEventListener('mousedown', handlePointerDown)
        document.removeEventListener('keydown', handleEscape)
        window.removeEventListener('resize', handleReposition)
        window.removeEventListener('scroll', handleReposition, true)
      }
    }, [isOpen, options.length])

    const panelStyle: CSSProperties = {
      position: 'fixed',
      top: panelPos.top,
      left: panelPos.left,
      width: panelPos.width,
      maxHeight: 240,
      zIndex: 80,
      transitionProperty: 'opacity, transform',
      transitionDuration: `${PANEL_TRANSITION_MS}ms`,
      transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(-6px) scale(0.98)',
      transformOrigin: 'top center',
      pointerEvents: isVisible ? 'auto' : 'none',
    }

    const groupedOptions = useMemo(() => {
      const groups: Array<{ label?: string; items: OptionItem[] }> = []
      for (const option of options) {
        const last = groups[groups.length - 1]
        if (last && last.label === option.group) {
          last.items.push(option)
        } else {
          groups.push({ label: option.group, items: [option] })
        }
      }
      return groups
    }, [options])

    const panel =
      isRendered && typeof document !== 'undefined'
        ? createPortal(
            <div
              ref={panelRef}
              id={listboxId}
              role="listbox"
              aria-label={ariaLabel}
              style={panelStyle}
              className="overflow-y-auto rounded-xl border border-border-card bg-surface p-1.5 shadow-[0_12px_32px_rgba(15,23,42,0.14)]"
            >
              {groupedOptions.length === 0 ? (
                <p className="px-3 py-2 text-sm text-text-muted">No options</p>
              ) : (
                groupedOptions.map((group, groupIndex) => (
                  <div key={group.label ?? `group-${groupIndex}`} className="min-w-0">
                    {group.label && (
                      <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                        {group.label}
                      </p>
                    )}
                    {group.items.map((option, optionIndex) => {
                      const isSelected = option.value === currentValue
                      return (
                        <button
                          key={`${option.value}-${option.label}`}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          disabled={option.disabled}
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => handleSelect(option.value)}
                          style={{
                            transitionDelay: isVisible
                              ? `${Math.min(optionIndex, 6) * 18}ms`
                              : '0ms',
                          }}
                          className={cn(
                            'flex w-full items-center rounded-lg px-3 py-2 text-left text-sm transition-[background-color,color,transform,opacity] duration-150',
                            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0',
                            isSelected
                              ? 'bg-primary text-white'
                              : 'text-heading hover:bg-surface-muted',
                            option.disabled && 'cursor-not-allowed opacity-50',
                            !option.value && !isSelected && 'text-placeholder-alt',
                          )}
                        >
                          <span className="truncate">{option.label}</span>
                        </button>
                      )
                    })}
                  </div>
                ))
              )}
            </div>,
            document.body,
          )
        : null

    return (
      <div ref={containerRef} className="relative min-w-0">
        <select
          {...rest}
          ref={mergeRefs(selectRef, forwardedRef)}
          id={id}
          name={name}
          value={currentValue}
          disabled={disabled}
          tabIndex={-1}
          aria-hidden
          className="pointer-events-none absolute h-0 w-0 opacity-0"
          onChange={(event) => {
            if (!isControlled) setUncontrolledValue(event.target.value)
            onChange?.(event)
          }}
        >
          {children}
        </select>

        <button
          ref={triggerRef}
          type="button"
          id={id ? `${id}-trigger` : undefined}
          disabled={disabled}
          aria-label={ariaLabel}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          onClick={() => (isOpen ? closePanel() : openPanel())}
          onBlur={handleBlur}
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              if (!isOpen) openPanel()
            }
          }}
          className={cn(
            'relative flex h-11 w-full items-center rounded-xl border bg-surface px-4 pr-10 text-left text-base text-heading outline-none transition-[border-color,box-shadow,background-color,opacity] duration-200',
            'focus:border-primary focus:ring-2 focus:ring-primary/20',
            'disabled:cursor-not-allowed disabled:bg-[#f8fafc] disabled:opacity-70',
            error ? 'border-danger' : 'border-border',
            isOpen && !error && 'border-primary ring-2 ring-primary/20',
            leadingIcon ? 'pl-9' : undefined,
            className,
          )}
        >
          {leadingIcon ? (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
              {leadingIcon}
            </span>
          ) : null}
          <span
            className={cn(
              'min-w-0 flex-1 truncate transition-colors duration-150',
              isPlaceholder && 'text-placeholder-alt',
            )}
          >
            {displayLabel}
          </span>
          <ChevronDownIcon
            className={cn(
              'pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-text-muted transition-transform duration-200 ease-out',
              isOpen && 'rotate-180',
            )}
          />
        </button>

        {panel}
      </div>
    )
  },
)
