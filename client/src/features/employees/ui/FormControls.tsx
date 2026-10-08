import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type DragEvent,
  type InputHTMLAttributes,
  type MutableRefObject,
  type ReactNode,
  type Ref,
  type SelectHTMLAttributes,
} from 'react'
import { figmaInputClass } from '@/shared/ui/FormField'
import { CalendarIcon, UploadIcon } from '@/features/employees/ui/icons'
import { cn } from '@/shared/lib/cn'
import { ChevronSelect } from '@/shared/ui/ChevronSelect'

function mergeRefs<T>(...refs: Array<Ref<T> | undefined>) {
  return (value: T | null) => {
    for (const ref of refs) {
      if (!ref) continue
      if (typeof ref === 'function') ref(value)
      else (ref as MutableRefObject<T | null>).current = value
    }
  }
}

const iconSlotClass = 'pointer-events-none absolute top-1/2 z-10 -translate-y-1/2'
const leadingIconClass = cn(iconSlotClass, 'left-3')

type IconInputProps = InputHTMLAttributes<HTMLInputElement> & {
  icon: ReactNode
}

export function IconInput({ icon, className, ...props }: IconInputProps) {
  return (
    <div className="relative">
      <span className={leadingIconClass}>{icon}</span>
      <input className={cn(figmaInputClass, 'pl-10', className)} {...props} />
    </div>
  )
}

type IconSelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> & {
  icon?: ReactNode
}

export const IconSelect = forwardRef<HTMLSelectElement, IconSelectProps>(
  function IconSelect({ icon, children, className, ...props }, ref) {
    return (
      <ChevronSelect
        ref={ref}
        leadingIcon={icon}
        className={cn('!h-10 rounded-lg text-sm', className)}
        {...props}
      >
        {children}
      </ChevronSelect>
    )
  },
)

type DateInputProps = InputHTMLAttributes<HTMLInputElement>

const PHOTO_ACCEPT = 'image/png,image/jpeg,image/jpg,image/svg+xml,.png,.jpg,.jpeg,.svg'
const PHOTO_MIME_TYPES = new Set(['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'])
const PHOTO_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'svg'])
const MAX_PHOTO_BYTES = 2 * 1024 * 1024

function isAllowedPhoto(file: File): boolean {
  if (PHOTO_MIME_TYPES.has(file.type)) return true
  // Windows sometimes reports an empty or non-standard MIME type for JPEGs
  const ext = file.name.split('.').pop()?.toLowerCase()
  return Boolean(ext && PHOTO_EXTENSIONS.has(ext))
}

type PhotoUploadFieldProps = {
  value?: File
  previewUrl?: string
  onChange: (file: File | undefined) => void
  error?: string
}

export function PhotoUploadField({ value, previewUrl, onChange, error }: PhotoUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [localError, setLocalError] = useState<string | undefined>()
  const [localPreview, setLocalPreview] = useState<string | undefined>()

  useEffect(() => {
    if (!value) {
      setLocalPreview(undefined)
      return
    }
    const url = URL.createObjectURL(value)
    setLocalPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [value])

  const displayPreview = localPreview ?? previewUrl

  const handleFile = useCallback(
    (file: File | undefined) => {
      if (!file) {
        setLocalError(undefined)
        onChange(undefined)
        return
      }
      if (file.size > MAX_PHOTO_BYTES) {
        setLocalError('Photo must be 2MB or smaller')
        return
      }
      if (!isAllowedPhoto(file)) {
        setLocalError('Photo must be PNG, JPG, or SVG')
        return
      }
      setLocalError(undefined)
      onChange(file)
    },
    [onChange],
  )

  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      setDragActive(false)
      handleFile(event.dataTransfer.files[0])
    },
    [handleFile],
  )

  const displayError = localError ?? error

  return (
    <div className="flex flex-col gap-1.5">
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            inputRef.current?.click()
          }
        }}
        onDragOver={(event) => {
          event.preventDefault()
          setDragActive(true)
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={onDrop}
        className={cn(
          'flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors',
          dragActive
            ? 'border-primary/50 bg-[#eff6ff]'
            : 'border-[#d9e4ef] bg-[#f8fafc] hover:border-primary/40 hover:bg-[#f0f7ff]',
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={PHOTO_ACCEPT}
          className="hidden"
          onChange={(event) => {
            handleFile(event.target.files?.[0])
            // Allow selecting the same file again
            event.target.value = ''
          }}
        />
        {displayPreview ? (
          <img src={displayPreview} alt="" className="mb-3 size-16 rounded-xl object-cover" />
        ) : (
          <span className="mb-3 flex size-12 items-center justify-center rounded-full bg-[#eff6ff] text-primary">
            <UploadIcon />
          </span>
        )}
        <p className="text-sm font-semibold text-heading">
          {value ? value.name : 'Upload Photo'}
        </p>
        <p className="mt-1 text-sm text-text-muted">Click to upload or drag &amp; drop</p>
        <p className="mt-1 text-xs text-text-muted">PNG, JPG or SVG. Max size 2MB.</p>
      </div>
      {displayError && <p className="text-xs text-danger">{displayError}</p>}
    </div>
  )
}

export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(function DateInput(
  { className, onClick, ...props },
  ref,
) {
  const inputRef = useRef<HTMLInputElement>(null)

  const openPicker = useCallback(() => {
    const input = inputRef.current
    if (!input) return
    input.focus()
    if (typeof input.showPicker === 'function') {
      try {
        input.showPicker()
      } catch {
        // Some browsers block showPicker outside a direct user gesture.
      }
    }
  }, [])

  return (
    <div className="relative">
      <button
        type="button"
        tabIndex={-1}
        onClick={openPicker}
        className={cn(leadingIconClass, 'pointer-events-auto text-text-muted hover:text-heading')}
        aria-label="Open calendar"
      >
        <CalendarIcon />
      </button>
      <input
        ref={mergeRefs(ref, inputRef)}
        type="date"
        className={cn(
          figmaInputClass,
          'cursor-pointer pl-10',
          '[color-scheme:light]',
          '[&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0',
          className,
        )}
        onClick={(event) => {
          onClick?.(event)
          openPicker()
        }}
        {...props}
      />
    </div>
  )
})
