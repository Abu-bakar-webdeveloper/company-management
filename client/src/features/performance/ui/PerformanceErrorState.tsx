type PerformanceErrorStateProps = {
  message: string
  onRetry?: () => void
}

export function PerformanceErrorState({ message, onRetry }: PerformanceErrorStateProps) {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-border-card bg-surface p-8 text-center">
      <p className="text-lg font-semibold text-heading">Unable to load performance data</p>
      <p className="mt-2 max-w-md text-sm text-text-muted">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 h-10 rounded-lg bg-primary px-5 text-sm font-semibold text-white hover:opacity-95"
        >
          Try again
        </button>
      )}
    </div>
  )
}
