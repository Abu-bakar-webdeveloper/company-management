import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useAuth } from '@/features/auth/model/AuthContext'
import { isCompanyHubEnabled, REPORT_TYPE_HUB } from '@/features/auth/model/companyHubs'
import { reportsApi } from '@/features/reports/api/reportsApi'
import { moduleLabels } from '@/features/reports/model/reportsData'
import type {
  GenerateReportValues,
  GeneratableReportModule,
  ReportOptions,
} from '@/features/reports/model/types'
import {
  CalendarIcon,
  DollarIcon,
  ExcelIcon,
  FolderIcon,
  LeaveIcon,
  PdfIcon,
  TrendIcon,
  UsersIcon,
} from '@/features/reports/ui/icons'
import { Card } from '@/shared/ui/Card'
import { SelectField } from '@/shared/ui/SelectField'
import { cn } from '@/shared/lib/cn'

const reportTypes: {
  id: GeneratableReportModule
  icon: (props: { className?: string }) => ReactNode
}[] = [
  { id: 'employees', icon: UsersIcon },
  { id: 'projects', icon: FolderIcon },
  { id: 'leaves', icon: LeaveIcon },
  { id: 'performance', icon: TrendIcon },
  { id: 'expenses', icon: DollarIcon },
]

const fallbackOptions: ReportOptions = {
  departments: ['All Departments'],
  employees: [{ id: 'all', label: 'All Employee' }],
  projects: [{ id: 'all', label: 'All Projects' }],
  statuses: ['All Status', 'Approved', 'Pending', 'Rejected', 'Active', 'Completed'],
  ratings: ['All Ratings', '4+ Stars', '3-4 Stars', 'Below 3'],
  groupBy: ['Department', 'Employee', 'Project', 'Month'],
}

function buildDefaultValues(reportType: GeneratableReportModule = 'employees'): GenerateReportValues {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const toInput = (d: Date) => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  return {
    cycle: 'monthly',
    reportType,
    startDate: toInput(start),
    endDate: toInput(end),
    department: 'All Departments',
    employee: 'all',
    status: 'All Status',
    project: 'all',
    rating: 'All Ratings',
    exportFormat: 'pdf',
    includeCharts: true,
    includeSummary: true,
    groupBy: 'Department',
  }
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-3 text-xs font-bold uppercase tracking-wide text-text-muted">{children}</p>
  )
}

function FieldLabel({ children }: { children: ReactNode }) {
  return <p className="mb-1.5 text-sm font-medium text-heading">{children}</p>
}

function FilterSelect({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  ariaLabel: string
}) {
  return (
    <SelectField
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={ariaLabel}
      className="!h-11 rounded-lg border-[#e2e8f0] px-3 text-sm"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </SelectField>
  )
}

function ToggleSwitch({
  checked,
  onChange,
  ariaLabel,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  ariaLabel: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-6 w-11 shrink-0 rounded-full transition-colors',
        checked ? 'bg-primary' : 'bg-[#CBD5E1]',
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 size-5 rounded-full bg-white shadow transition-all',
          checked ? 'left-[22px]' : 'left-0.5',
        )}
      />
    </button>
  )
}

function ToggleRow({
  title,
  subtitle,
  checked,
  onChange,
}: {
  title: string
  subtitle: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border-card py-4">
      <div>
        <p className="text-sm font-semibold text-heading">{title}</p>
        <p className="mt-0.5 text-xs text-text-muted">{subtitle}</p>
      </div>
      <ToggleSwitch checked={checked} onChange={onChange} ariaLabel={title} />
    </div>
  )
}

type GenerateReportFormProps = {
  id?: string
  initialReportType?: GeneratableReportModule
  onSubmit: (values: GenerateReportValues) => Promise<void> | void
  onCancel: () => void
  submitting: boolean
}

function normalizeForApi(values: GenerateReportValues): GenerateReportValues {
  return {
    ...values,
    employee: values.employee === 'all' ? 'All Employee' : values.employee,
    project: values.project === 'all' ? 'All Projects' : values.project,
  }
}

export function GenerateReportForm({
  id,
  initialReportType,
  onSubmit,
  onCancel,
  submitting,
}: GenerateReportFormProps) {
  const { user } = useAuth()
  const availableTypes = useMemo(
    () =>
      reportTypes.filter(({ id: typeId }) =>
        isCompanyHubEnabled(user?.enabledHubs, REPORT_TYPE_HUB[typeId]),
      ),
    [user?.enabledHubs],
  )
  const defaultType = availableTypes[0]?.id ?? 'employees'
  const [values, setValues] = useState<GenerateReportValues>(() =>
    buildDefaultValues(initialReportType ?? defaultType),
  )
  const [options, setOptions] = useState<ReportOptions>(fallbackOptions)

  useEffect(() => {
    void reportsApi.getOptions().then(setOptions).catch(() => setOptions(fallbackOptions))
  }, [])

  useEffect(() => {
    if (!availableTypes.some((type) => type.id === values.reportType) && availableTypes[0]) {
      setValues((prev) => ({ ...prev, reportType: availableTypes[0].id }))
    }
  }, [availableTypes, values.reportType])

  const set = <K extends keyof GenerateReportValues>(key: K, value: GenerateReportValues[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }))

  return (
    <form
      id={id}
      onSubmit={(e) => {
        e.preventDefault()
        void onSubmit(normalizeForApi(values))
      }}
    >
      <div className="mb-6 flex gap-6 border-b border-border-card">
        {(['monthly', 'weekly'] as const).map((cycle) => (
          <button
            key={cycle}
            type="button"
            onClick={() => set('cycle', cycle)}
            className={cn(
              '-mb-px border-b-2 pb-3 text-sm font-semibold capitalize transition-colors',
              values.cycle === cycle
                ? 'border-primary text-primary'
                : 'border-transparent text-text-muted hover:text-heading',
            )}
          >
            {cycle} Report
          </button>
        ))}
      </div>

      <Card className="p-4 sm:p-6">
        <SectionLabel>Report Type</SectionLabel>
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
          {availableTypes.map(({ id: typeId, icon: Icon }) => {
            const selected = values.reportType === typeId
            return (
              <button
                key={typeId}
                type="button"
                onClick={() => set('reportType', typeId)}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-xl border px-3 py-4 text-[11px] font-bold uppercase tracking-wide transition-colors',
                  selected
                    ? 'border-primary bg-[#EFF6FF] text-primary'
                    : 'border-border text-text-muted hover:border-primary/40 hover:text-heading',
                )}
              >
                <Icon className="size-5" />
                {moduleLabels[typeId]}
              </button>
            )
          })}
        </div>

        <SectionLabel>Date Range</SectionLabel>
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {(['startDate', 'endDate'] as const).map((key) => (
            <div key={key} className="relative">
              <input
                type="date"
                value={values[key]}
                onChange={(e) => set(key, e.target.value)}
                aria-label={key === 'startDate' ? 'Start date' : 'End date'}
                className="h-11 w-full rounded-lg border border-[#e2e8f0] bg-surface px-3 pr-10 text-sm text-heading outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <CalendarIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" />
            </div>
          ))}
        </div>

        <SectionLabel>Advanced Filters</SectionLabel>
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel>Department</FieldLabel>
            <FilterSelect
              value={values.department}
              onChange={(v) => set('department', v)}
              options={options.departments.map((d) => ({ value: d, label: d }))}
              ariaLabel="Department"
            />
          </div>
          <div>
            <FieldLabel>Employee</FieldLabel>
            <FilterSelect
              value={values.employee}
              onChange={(v) => set('employee', v)}
              options={options.employees.map((e) => ({ value: e.id, label: e.label }))}
              ariaLabel="Employee"
            />
          </div>
          <div>
            <FieldLabel>Status</FieldLabel>
            <FilterSelect
              value={values.status}
              onChange={(v) => set('status', v)}
              options={options.statuses.map((s) => ({ value: s, label: s }))}
              ariaLabel="Status"
            />
          </div>
          <div>
            <FieldLabel>Project</FieldLabel>
            <FilterSelect
              value={values.project}
              onChange={(v) => set('project', v)}
              options={options.projects.map((p) => ({ value: p.id, label: p.label }))}
              ariaLabel="Project"
            />
          </div>
          <div className="sm:col-span-2">
            <FieldLabel>Rating</FieldLabel>
            <FilterSelect
              value={values.rating}
              onChange={(v) => set('rating', v)}
              options={options.ratings.map((r) => ({ value: r, label: r }))}
              ariaLabel="Rating"
            />
          </div>
        </div>

        <FieldLabel>Export Format</FieldLabel>
        <div className="mb-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {(
            [
              { id: 'pdf', label: 'PDF Document', icon: PdfIcon },
              { id: 'excel', label: 'Excel Sheet', icon: ExcelIcon },
            ] as const
          ).map(({ id: formatId, label, icon: Icon }) => {
            const selected = values.exportFormat === formatId
            return (
              <button
                key={formatId}
                type="button"
                onClick={() => set('exportFormat', formatId)}
                className={cn(
                  'flex h-12 items-center justify-center gap-2 rounded-xl border text-xs font-bold uppercase tracking-wide transition-colors',
                  selected
                    ? 'border-primary bg-[#EFF6FF] text-primary'
                    : 'border-transparent bg-surface-muted text-text-muted hover:text-heading',
                )}
              >
                <Icon />
                {label}
              </button>
            )
          })}
        </div>

        <ToggleRow
          title="Include Charts"
          subtitle="Add visual data representations"
          checked={values.includeCharts}
          onChange={(v) => set('includeCharts', v)}
        />
        <ToggleRow
          title="Include Summary"
          subtitle="Generate a high-level executive overview"
          checked={values.includeSummary}
          onChange={(v) => set('includeSummary', v)}
        />

        <div className="mt-4">
          <FieldLabel>Group By</FieldLabel>
          <FilterSelect
            value={values.groupBy}
            onChange={(v) => set('groupBy', v)}
            options={options.groupBy.map((g) => ({ value: g, label: g }))}
            ariaLabel="Group by"
          />
        </div>
      </Card>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-border bg-surface px-5 text-sm font-semibold text-heading hover:bg-surface-muted sm:w-auto"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(24,119,242,0.25)] hover:opacity-95 disabled:opacity-70 sm:w-auto"
        >
          {submitting ? 'Generating…' : 'Generate Report'}
        </button>
      </div>
    </form>
  )
}
