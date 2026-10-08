type PlaceholderPageProps = {
  title: string
}

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center p-8">
      <h1 className="text-2xl font-bold text-heading">{title}</h1>
      <p className="mt-2 text-text-muted">This section is coming soon.</p>
    </div>
  )
}

