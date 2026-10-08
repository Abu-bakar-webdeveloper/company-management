import { useEffect, useRef, useState } from 'react'
import { useProjectMemberOptions } from '@/features/projects/hooks/useProjects'
import { projectFormInputClass } from '@/features/projects/ui/ProjectFormCard'
import { UserPlusIcon } from '@/features/projects/ui/icons'
import { UserAvatar } from '@/shared/ui/UserAvatar'
import { cn } from '@/shared/lib/cn'

type TeamMemberPickerProps = {
  value: string[]
  onChange: (ids: string[]) => void
  excludeIds?: string[]
}

export function TeamMemberPicker({ value = [], onChange, excludeIds = [] }: TeamMemberPickerProps) {
  const { data: members = [], isLoading } = useProjectMemberOptions()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selected = members.filter((m) => value.includes(m.id))

  const available = members.filter(
    (m) =>
      !value.includes(m.id) &&
      !excludeIds.includes(m.id) &&
      (query === '' ||
        m.fullName.toLowerCase().includes(query.toLowerCase()) ||
        m.email.toLowerCase().includes(query.toLowerCase())),
  )

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function addMember(id: string) {
    onChange([...value, id])
    setQuery('')
  }

  function removeMember(id: string) {
    onChange(value.filter((memberId) => memberId !== id))
  }

  return (
    <div ref={containerRef} className="relative">
      <div
        className={cn(
          projectFormInputClass,
          'flex min-h-11 flex-wrap items-center gap-1.5 py-1.5 pr-10',
          open && 'border-[#1877f2] ring-2 ring-[#1877f2]/15',
        )}
        onClick={() => setOpen(true)}
      >
        {selected.map((member) => (
          <span
            key={member.id}
            className="inline-flex items-center gap-1.5 rounded-md bg-[#eff6ff] px-2 py-1 text-xs font-medium text-heading"
          >
            <UserAvatar name={member.fullName} avatar={member.avatar} className="size-5 text-[9px]" />
            {member.fullName}
            <button
              type="button"
              className="ml-0.5 text-text-muted hover:text-heading"
              onClick={(e) => {
                e.stopPropagation()
                removeMember(member.id)
              }}
            >
              ×
            </button>
          </span>
        ))}
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          placeholder={selected.length === 0 ? 'Search company users…' : ''}
          className="min-w-[120px] flex-1 border-0 bg-transparent text-sm outline-none placeholder:text-placeholder"
        />
        <UserPlusIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" />
      </div>

      {open && (
        <div className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-[#e2e8f0] bg-white py-1 shadow-lg">
          {isLoading && (
            <p className="px-3 py-2 text-sm text-text-muted">Loading users…</p>
          )}
          {!isLoading && available.length === 0 && (
            <p className="px-3 py-2 text-sm text-text-muted">No matching users</p>
          )}
          {available.map((member) => (
            <button
              key={member.id}
              type="button"
              className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-[#f8fafc]"
              onClick={() => addMember(member.id)}
            >
              <UserAvatar name={member.fullName} avatar={member.avatar} size="sm" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-heading">{member.fullName}</p>
                <p className="truncate text-xs text-text-muted">{member.email}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
