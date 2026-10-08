export function SessionLoadingScreen() {
  return (
    <div
      className="relative flex min-h-dvh flex-col items-center justify-center bg-page"
      role="status"
      aria-live="polite"
      aria-label="Loading BizFlow"
    >
      <div className="flex flex-1 flex-col items-center justify-center px-6">
        <img
          src="/logo.svg"
          alt="BizFlow"
          width={200}
          height={48}
          className="h-12 w-auto sm:h-14 dark:brightness-110"
        />
      </div>

      <div className="flex flex-col items-center gap-3 pb-10 sm:pb-12">
        <div
          className="size-8 animate-spin rounded-full border-[3px] border-border border-t-primary"
          aria-hidden
        />
        <p className="text-xs font-medium tracking-wide text-text-muted">Loading…</p>
      </div>
    </div>
  )
}
