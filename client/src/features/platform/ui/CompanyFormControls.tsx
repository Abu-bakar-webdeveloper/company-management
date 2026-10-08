import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type DragEvent,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
} from 'react'
import { companyInputClass, companySelectClass } from '@/features/platform/ui/CompanyFormField'
import { cn } from '@/shared/lib/cn'
import { ChevronSelect } from '@/shared/ui/ChevronSelect'

type CompanySelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> & {
  error?: boolean
}

export const CompanySelect = forwardRef<HTMLSelectElement, CompanySelectProps>(
  function CompanySelect({ className, children, ...props }, ref) {
    return (
      <ChevronSelect ref={ref} className={cn(companySelectClass, '!h-10', className)} {...props}>
        {children}
      </ChevronSelect>
    )
  },
)

type CompanyIconInputProps = InputHTMLAttributes<HTMLInputElement> & {
  icon: ReactNode
}

export function CompanyIconInput({ icon, className, ...props }: CompanyIconInputProps) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
        {icon}
      </span>
      <input className={cn(companyInputClass, 'pl-10', className)} {...props} />
    </div>
  )
}

type ColorFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
}

function toColorPickerValue(value: string | undefined): string {
  const raw = (value ?? '').trim()
  const withHash = raw.startsWith('#') ? raw.slice(1) : raw

  if (/^[0-9a-fA-F]{6}$/.test(withHash)) {
    return `#${withHash.toLowerCase()}`
  }

  if (/^[0-9a-fA-F]{3}$/.test(withHash)) {
    const [r, g, b] = withHash
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase()
  }

  return '#000000'
}

export function ColorField({ label, value, onChange, error }: ColorFieldProps) {
  const textValue = value ?? ''

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-wide text-heading">{label}</label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={toColorPickerValue(textValue)}
          onChange={(event) => onChange(event.target.value)}
          className="size-11 shrink-0 cursor-pointer rounded-lg border border-border bg-white p-1"
          aria-label={label}
        />
        <input
          type="text"
          value={textValue}
          onChange={(event) => onChange(event.target.value)}
          onBlur={() => onChange(toColorPickerValue(textValue))}
          placeholder="#00284F"
          className={companyInputClass}
        />
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  )
}

const LOGO_ACCEPT = 'image/png,image/jpeg,image/jpg,image/svg+xml,.png,.jpg,.jpeg,.svg'
const LOGO_MIME_TYPES = new Set(['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'])
const LOGO_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'svg'])
const MAX_LOGO_BYTES = 2 * 1024 * 1024

function isAllowedLogo(file: File): boolean {
  if (LOGO_MIME_TYPES.has(file.type)) return true
  const ext = file.name.split('.').pop()?.toLowerCase()
  return Boolean(ext && LOGO_EXTENSIONS.has(ext))
}

type LogoUploadFieldProps = {
  value?: File
  previewUrl?: string
  onChange: (file: File | undefined) => void
  error?: string
}

export function LogoUploadField({ value, previewUrl, onChange, error }: LogoUploadFieldProps) {
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
      if (file.size > MAX_LOGO_BYTES) {
        setLocalError('Logo must be 2MB or smaller')
        return
      }
      if (!isAllowedLogo(file)) {
        setLocalError('Logo must be PNG, JPG, or SVG')
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
      <label className="text-xs font-semibold uppercase tracking-wide text-heading">Company Logo</label>
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
          'flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors',
          dragActive
            ? 'border-primary/50 bg-[#eff6ff]'
            : 'border-[#d9e4ef] bg-[#f8fafc] hover:border-primary/40 hover:bg-[#eff6ff]/40',
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={LOGO_ACCEPT}
          className="hidden"
          onChange={(event) => {
            handleFile(event.target.files?.[0])
            event.target.value = ''
          }}
        />
        {displayPreview ? (
          <img src={displayPreview} alt="" className="mb-3 size-16 rounded-xl object-cover" />
        ) : (
          <span className="mb-3 flex size-12 items-center justify-center rounded-full bg-[#eff6ff] text-primary">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden
            >
              <path d="M12 16V4M12 4L8 8M12 4l4 4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" strokeLinecap="round" />
            </svg>
          </span>
        )}
        <p className="text-sm font-semibold text-heading">
          {value ? value.name : 'Upload Logo'}
        </p>
        <p className="mt-1 text-sm text-text-muted">Click to upload or drag &amp; drop</p>
        <p className="mt-1 text-xs text-text-muted">PNG, JPG or SVG. Max size 2MB.</p>
      </div>
      {displayError && <p className="text-xs text-danger">{displayError}</p>}
    </div>
  )
}
