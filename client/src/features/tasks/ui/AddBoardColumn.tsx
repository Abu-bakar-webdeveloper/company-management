import { useState } from 'react'
import { PlusIcon } from '@/features/projects/ui/icons'
import { CloseIcon } from '@/features/tasks/ui/boardIcons'

type AddBoardColumnProps = {
  onAdd: (name: string) => void
}

export function AddBoardColumn({ onAdd }: AddBoardColumnProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')

  const submit = () => {
    if (!name.trim()) return
    onAdd(name.trim())
    setName('')
    setOpen(false)
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-11 w-[260px] shrink-0 items-center justify-center gap-1.5 rounded-2xl border-[1.5px] border-dashed border-border bg-transparent text-[13px] font-semibold text-text-muted hover:border-primary hover:bg-primary-muted hover:text-primary"
      >
        <PlusIcon className="size-3.5" /> Add column
      </button>
    )
  }

  return (
    <div className="w-[260px] shrink-0 rounded-2xl bg-surface-muted p-2.5">
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Column name…"
        onKeyDown={(e) => {
          if (e.key === 'Enter') submit()
          if (e.key === 'Escape') setOpen(false)
        }}
        className="mb-2 w-full rounded-lg border border-border bg-surface px-2.5 py-2 text-[13px] text-heading outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={submit}
          className="rounded-md bg-primary px-3 py-1.5 text-[12.5px] font-semibold text-white hover:opacity-95"
        >
          Add column
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md p-1.5 text-text-muted hover:bg-surface"
          aria-label="Cancel"
        >
          <CloseIcon className="size-3.5" />
        </button>
      </div>
    </div>
  )
}
