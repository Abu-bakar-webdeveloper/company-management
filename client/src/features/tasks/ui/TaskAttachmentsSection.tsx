import {
  useCallback,
  useRef,
  useState,
  type DragEvent,
} from 'react'
import { CloseIcon, UploadIcon } from '@/features/tasks/ui/boardIcons'
import type { BoardAttachment } from '@/features/tasks/model/types'
import { cn } from '@/shared/lib/cn'

const ACCEPT = 'image/png,image/jpeg,image/jpg,image/webp,image/gif,.png,.jpg,.jpeg,.webp,.gif'
const MIME_TYPES = new Set(['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'])
const EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'webp', 'gif'])
export const MAX_TASK_IMAGE_BYTES = 5 * 1024 * 1024
export const MAX_TASK_IMAGES = 10

function isAllowedImage(file: File): boolean {
  if (MIME_TYPES.has(file.type)) return true
  const ext = file.name.split('.').pop()?.toLowerCase()
  return Boolean(ext && EXTENSIONS.has(ext))
}

type TaskAttachmentsSectionProps = {
  items: BoardAttachment[]
  canEdit: boolean
  isUploading?: boolean
  error?: string | null
  onUploadFiles: (files: File[]) => void
  onRemove: (attachmentId: string) => void
}

export function TaskAttachmentsSection({
  items,
  canEdit,
  isUploading,
  error,
  onUploadFiles,
  onRemove,
}: TaskAttachmentsSectionProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [localError, setLocalError] = useState<string | undefined>()
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)

  const remaining = MAX_TASK_IMAGES - items.length

  const handleFiles = useCallback(
    (list: FileList | File[] | null) => {
      if (!list || !canEdit) return
      const files = Array.from(list)
      if (files.length === 0) return

      if (remaining <= 0) {
        setLocalError(`Maximum ${MAX_TASK_IMAGES} images per task`)
        return
      }

      const accepted: File[] = []
      for (const file of files.slice(0, remaining)) {
        if (file.size > MAX_TASK_IMAGE_BYTES) {
          setLocalError('Each image must be 5MB or smaller')
          continue
        }
        if (!isAllowedImage(file)) {
          setLocalError('Images must be PNG, JPG, WebP, or GIF')
          continue
        }
        accepted.push(file)
      }

      if (accepted.length > 0) {
        setLocalError(undefined)
        onUploadFiles(accepted)
      }
    },
    [canEdit, onUploadFiles, remaining],
  )

  const displayError = localError ?? error

  return (
    <div className="mb-5">
      <p className="mb-2 text-[12.5px] font-bold uppercase tracking-wide text-text-muted">
        Screenshots
        {items.length > 0 && ` (${items.length})`}
      </p>

      {items.length > 0 && (
        <div className="mb-3 grid grid-cols-3 gap-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="group relative overflow-hidden rounded-lg border border-border-card bg-surface-muted"
            >
              <button
                type="button"
                className="block aspect-square w-full"
                onClick={() => setLightboxUrl(item.url)}
                aria-label={`View ${item.fileName}`}
              >
                <img
                  src={item.url}
                  alt={item.fileName}
                  className="size-full object-cover"
                />
              </button>
              {canEdit && (
                <button
                  type="button"
                  onClick={() => onRemove(item.id)}
                  className="absolute right-1 top-1 rounded-md bg-[#0a1628]/65 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label={`Remove ${item.fileName}`}
                >
                  <CloseIcon className="size-3.5" />
                </button>
              )}
              <p className="truncate px-1.5 py-1 text-[10px] text-placeholder-alt">
                {item.fileName}
              </p>
            </div>
          ))}
        </div>
      )}

      {items.length === 0 && !canEdit && (
        <p className="text-[12.5px] text-placeholder-alt">No screenshots yet.</p>
      )}

      {canEdit && remaining > 0 && (
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              inputRef.current?.click()
            }
          }}
          onDragOver={(e) => {
            e.preventDefault()
            setDragActive(true)
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e: DragEvent<HTMLDivElement>) => {
            e.preventDefault()
            setDragActive(false)
            handleFiles(e.dataTransfer.files)
          }}
          className={cn(
            'flex min-h-[96px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-5 text-center transition-colors',
            dragActive
              ? 'border-primary/50 bg-primary-muted'
              : 'border-border bg-surface-muted hover:border-primary/40',
            isUploading && 'pointer-events-none opacity-60',
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            multiple
            className="hidden"
            onChange={(e) => {
              handleFiles(e.target.files)
              e.target.value = ''
            }}
          />
          <span className="mb-2 flex size-9 items-center justify-center rounded-full bg-primary-muted text-primary">
            <UploadIcon className="size-4" />
          </span>
          <p className="text-[12.5px] font-semibold text-heading">
            {isUploading ? 'Uploading…' : 'Drop screenshot or click to upload'}
          </p>
          <p className="mt-1 text-[11px] text-text-muted">
            PNG, JPG, WebP, GIF · max 5MB · {remaining} left
          </p>
        </div>
      )}

      {displayError && <p className="mt-2 text-xs text-danger">{displayError}</p>}

      {lightboxUrl && (
        <>
          <button
            type="button"
            aria-label="Close preview"
            className="fixed inset-0 z-[60] bg-[#0a1628]/70"
            onClick={() => setLightboxUrl(null)}
          />
          <div className="fixed inset-4 z-[70] flex items-center justify-center sm:inset-10">
            <img
              src={lightboxUrl}
              alt=""
              className="max-h-full max-w-full rounded-xl object-contain shadow-[var(--shadow-card)]"
            />
            <button
              type="button"
              onClick={() => setLightboxUrl(null)}
              className="absolute right-2 top-2 rounded-lg bg-surface p-2 text-heading shadow"
              aria-label="Close"
            >
              <CloseIcon />
            </button>
          </div>
        </>
      )}
    </div>
  )
}

type PendingImageFilesFieldProps = {
  files: File[]
  onChange: (files: File[]) => void
  error?: string | null
}

/** Multi-file picker for create-task modal (uploads happen after create). */
export function PendingImageFilesField({
  files,
  onChange,
  error,
}: PendingImageFilesFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [localError, setLocalError] = useState<string | undefined>()

  const remaining = MAX_TASK_IMAGES - files.length

  const handleFiles = (list: FileList | null) => {
    if (!list) return
    const incoming = Array.from(list)
    const accepted: File[] = []
    for (const file of incoming.slice(0, Math.max(0, remaining))) {
      if (file.size > MAX_TASK_IMAGE_BYTES) {
        setLocalError('Each image must be 5MB or smaller')
        continue
      }
      if (!isAllowedImage(file)) {
        setLocalError('Images must be PNG, JPG, WebP, or GIF')
        continue
      }
      accepted.push(file)
    }
    if (accepted.length > 0) {
      setLocalError(undefined)
      onChange([...files, ...accepted].slice(0, MAX_TASK_IMAGES))
    }
  }

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-label">Screenshots</p>
      {files.length > 0 && (
        <ul className="mb-2 space-y-1">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="flex items-center justify-between rounded-lg border border-border-card px-2.5 py-1.5 text-sm text-heading"
            >
              <span className="truncate">{file.name}</span>
              <button
                type="button"
                className="ml-2 text-danger hover:underline"
                onClick={() => onChange(files.filter((_, i) => i !== index))}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
      {remaining > 0 && (
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              inputRef.current?.click()
            }
          }}
          onDragOver={(e) => {
            e.preventDefault()
            setDragActive(true)
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragActive(false)
            handleFiles(e.dataTransfer.files)
          }}
          className={cn(
            'flex min-h-[88px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-4 text-center transition-colors',
            dragActive
              ? 'border-primary/50 bg-primary-muted'
              : 'border-border bg-surface-muted hover:border-primary/40',
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            multiple
            className="hidden"
            onChange={(e) => {
              handleFiles(e.target.files)
              e.target.value = ''
            }}
          />
          <p className="text-[12.5px] font-semibold text-heading">
            Drop screenshots or click to attach
          </p>
          <p className="mt-1 text-[11px] text-text-muted">
            Uploaded after the task is created · {remaining} left
          </p>
        </div>
      )}
      {(localError ?? error) && (
        <p className="mt-2 text-xs text-danger">{localError ?? error}</p>
      )}
    </div>
  )
}
