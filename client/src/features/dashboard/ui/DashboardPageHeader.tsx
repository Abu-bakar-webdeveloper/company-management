type DashboardPageHeaderProps = {
  title: string
  subtitle: string
}

export function DashboardPageHeader({ title, subtitle }: DashboardPageHeaderProps) {
  return (
    <header className="mb-6">
      <h1 className="text-[24px] lg:text-[30px] font-bold leading-9 text-heading">{title}</h1>
      <p className="mt-1 text-xs lg:text-base leading-4 lg:leading-6 text-text-muted">{subtitle}</p>
    </header>
  )
}
