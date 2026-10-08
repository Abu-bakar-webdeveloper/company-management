import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { useAuth } from '@/features/auth/model/AuthContext'
import type { ProjectFileItem } from '@/features/projects/api/projectsApi'
import {
  useCreateProjectFile,
  useDeleteProjectFile,
  useProjectFiles,
} from '@/features/projects/hooks/useProjects'
import { PlusCircleIcon } from '@/features/projects/ui/icons'
import { getErrorMessage } from '@/shared/api/errors'
import { uploadProjectFileToCloudinary } from '@/shared/lib/uploadAvatar'
import { cn } from '@/shared/lib/cn'
import { Card } from '@/shared/ui/Card'
import { Modal } from '@/shared/ui/Modal'
import { Skeleton } from '@/shared/ui/Skeleton'

const MAX_FILE_BYTES = 15 * 1024 * 1024

type ProjectFilesTabProps = {
  projectId: string
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatAddedDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function ProjectFilesTab({ projectId }: ProjectFilesTabProps) {
  const { can } = useAuth()
  const canWrite = can('projects:write')
  const { data, isLoading, isError } = useProjectFiles(projectId)
  const createFile = useCreateProjectFile(projectId)
  const deleteFile = useDeleteProjectFile(projectId)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [linkOpen, setLinkOpen] = useState(false)
  const [linkTitle, setLinkTitle] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const items = data?.files ?? []

  async function handleUpload(fileList: FileList | null) {
    const file = fileList?.[0]
    if (!file) return

    if (file.size > MAX_FILE_BYTES) {
      toast.error('File must be 15 MB or smaller')
      return
    }

    setUploading(true)
    try {
      const uploaded = await uploadProjectFileToCloudinary(file)
      await createFile.mutateAsync({
        kind: 'file',
        title: file.name,
        url: uploaded.url,
        publicId: uploaded.publicId,
        fileName: file.name,
        mimeType: file.type || 'application/octet-stream',
        sizeBytes: file.size,
      })
      toast.success('File uploaded')
    } catch (err) {
      toast.error(getErrorMessage(err, 'Unable to upload file'))
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleAddLink() {
    setFormError(null)
    const title = linkTitle.trim()
    const url = linkUrl.trim()
    if (!title) {
      setFormError('Title is required')
      return
    }
    if (!url) {
      setFormError('URL is required')
      return
    }
    if (!/^https?:\/\//i.test(url)) {
      setFormError('URL must start with http:// or https://')
      return
    }

    try {
      await createFile.mutateAsync({ kind: 'link', title, url })
      setLinkTitle('')
      setLinkUrl('')
      setLinkOpen(false)
      toast.success('Link added')
    } catch (err) {
      const message = getErrorMessage(err, 'Unable to add link')
      setFormError(message)
      toast.error(message)
    }
  }

  async function handleDelete(item: ProjectFileItem) {
    const label = item.kind === 'link' ? 'link' : 'file'
    if (!window.confirm(`Delete this ${label}?`)) return
    try {
      await deleteFile.mutateAsync(item.id)
      toast.success(`${label === 'link' ? 'Link' : 'File'} deleted`)
    } catch (err) {
      toast.error(getErrorMessage(err, 'Unable to delete'))
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-3 p-6" aria-busy aria-label="Loading files and links">
        {Array.from({ length: 3 }, (_, i) => (
          <Card key={i} className="p-4">
            <Skeleton className="mb-2 h-4 w-48" rounded="sm" />
            <Skeleton className="h-3 w-28" rounded="sm" />
          </Card>
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex min-h-[200px] items-center justify-center p-6">
        <p className="text-sm text-danger">Unable to load files and links</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-bold text-heading">Files & Links</h3>
          <p className="mt-1 text-sm text-text-muted">
            {canWrite
              ? 'Upload files or add links for the project team.'
              : 'Download files or open links shared on this project.'}
          </p>
        </div>
        {canWrite && (
          <div className="flex flex-wrap gap-2">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(e) => void handleUpload(e.target.files)}
            />
            <button
              type="button"
              disabled={uploading || createFile.isPending}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-surface px-4 text-sm font-semibold text-heading hover:bg-surface-muted disabled:opacity-70"
            >
              {uploading ? 'Uploading…' : 'Upload file'}
            </button>
            <button
              type="button"
              onClick={() => setLinkOpen(true)}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:opacity-95"
            >
              <PlusCircleIcon className="size-4" />
              Add link
            </button>
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border border-dashed border-border-card bg-[#f8fafc] p-8 text-center">
          <p className="text-lg font-semibold text-heading">No files or links yet</p>
          <p className="mt-2 max-w-sm text-sm text-text-muted">
            {canWrite
              ? 'Upload a document or add a useful URL for everyone on this project.'
              : 'Files and links added by admins or managers will appear here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card
              key={item.id}
              className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      'inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                      item.kind === 'link'
                        ? 'bg-[#eff6ff] text-[#1877f2]'
                        : 'bg-[#f1f5f9] text-[#475569]',
                    )}
                  >
                    {item.kind === 'link' ? 'Link' : 'File'}
                  </span>
                  <h4 className="truncate font-bold text-heading">{item.title}</h4>
                </div>
                <p className="mt-1 text-xs text-text-muted">
                  Added {formatAddedDate(item.createdAt)}
                  {item.kind === 'file' && item.sizeBytes != null
                    ? ` · ${formatBytes(item.sizeBytes)}`
                    : null}
                </p>
                {item.kind === 'link' ? (
                  <p className="mt-1 truncate text-xs text-text-muted">{item.url}</p>
                ) : null}
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                {item.kind === 'link' ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-9 items-center rounded-lg bg-primary px-3 text-sm font-semibold text-white hover:opacity-95"
                  >
                    Open
                  </a>
                ) : (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={item.fileName ?? item.title}
                    className="inline-flex h-9 items-center rounded-lg bg-primary px-3 text-sm font-semibold text-white hover:opacity-95"
                  >
                    Download
                  </a>
                )}
                {canWrite && (
                  <button
                    type="button"
                    onClick={() => void handleDelete(item)}
                    disabled={deleteFile.isPending}
                    className="inline-flex h-9 items-center rounded-lg border border-border px-3 text-sm font-semibold text-danger hover:bg-surface-muted disabled:opacity-50"
                  >
                    Delete
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={linkOpen}
        onClose={() => setLinkOpen(false)}
        title="Add link"
        subtitle="Share a URL with everyone on this project."
        footer={
          <>
            <button
              type="button"
              onClick={() => setLinkOpen(false)}
              className="inline-flex h-10 flex-1 items-center justify-center rounded-lg border border-border bg-surface px-5 text-sm font-semibold text-heading sm:flex-none"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={createFile.isPending}
              onClick={() => void handleAddLink()}
              className="inline-flex h-10 flex-1 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-white disabled:opacity-70 sm:flex-none"
            >
              {createFile.isPending ? 'Adding…' : 'Add link'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <p className="mb-1.5 text-sm font-semibold text-heading">Title</p>
            <input
              value={linkTitle}
              onChange={(e) => setLinkTitle(e.target.value)}
              placeholder="e.g. Design specs"
              className="h-11 w-full rounded-lg border border-[#e2e8f0] px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>
          <div>
            <p className="mb-1.5 text-sm font-semibold text-heading">URL</p>
            <input
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://"
              className="h-11 w-full rounded-lg border border-[#e2e8f0] px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>
          {formError && <p className="text-sm text-danger">{formError}</p>}
        </div>
      </Modal>
    </div>
  )
}
