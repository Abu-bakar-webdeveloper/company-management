export function AuthDivider() {
  return (
    <div className="flex items-center gap-6 py-1">
      <div className="h-px flex-1 border-t border-divider" />
      <span className="text-xs font-normal uppercase tracking-[1.2px] text-text-muted">
        or continue with
      </span>
      <div className="h-px flex-1 border-t border-divider" />
    </div>
  )
}
