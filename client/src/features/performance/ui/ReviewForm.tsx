import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { performanceApi } from '@/features/performance/api/performanceApi'
import type {
  EmployeeMetricsResponse,
  KpiTemplate,
  PerformanceOptions,
  PerformanceReview,
  ReviewFormValues,
} from '@/features/performance/model/contracts'
import {
  clampBonusPenalty,
  computeLiveKpiSummary,
} from '@/features/performance/lib/kpi-scoring'
import {
  findReviewForPeriod,
  isSameReviewPeriod,
  statusLabel,
} from '@/features/performance/lib/performance-utils'
import { EfficiencyTrendCard } from '@/features/performance/ui/EfficiencyTrendCard'
import {
  CheckIcon,
  LightbulbIcon,
  ReviewProfileAvatar,
  StarIcon,
  TrendUpIcon,
} from '@/features/performance/ui/icons'
import { StarRating } from '@/features/performance/ui/StarRating'
import { Card } from '@/shared/ui/Card'
import { SelectField } from '@/shared/ui/SelectField'
import { cn } from '@/shared/lib/cn'

type ReviewFormProps = {
  initialValues?: Partial<ReviewFormValues>
  employeeId: string
  employeeName?: string
  employeeRole?: string
  employeeDepartment?: string
  employeeAvatar?: string
  subjectRole?: 'employee' | 'manager' | string
  mode?: 'create' | 'edit'
  /** When true, period stays selectable even in edit/update mode (create-page upsert). */
  allowPeriodChange?: boolean
  periods?: PerformanceOptions['periods']
  previousReviews?: PerformanceReview[]
  onCancel: () => void
  onSubmit: (values: ReviewFormValues) => void | Promise<void>
}

type TabId = 'metrics' | 'kpi' | 'rating'

const actionButtonClass =
  'h-11 w-full min-w-0 rounded-lg px-5 text-sm font-semibold sm:w-auto sm:min-w-[120px] sm:px-6'

function MetricsReadOnlyCard({
  label,
  value,
  suffix,
  hint,
  hintClass,
}: {
  label: string
  value: number
  suffix?: string
  hint?: ReactNode
  hintClass?: string
}) {
  return (
    <div className="min-w-0 rounded-xl border border-border-card bg-[#F8FAFC] p-3 sm:p-4">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted sm:text-[11px]">
        {label}
      </p>
      <p className="mt-1 text-xl font-bold text-heading sm:text-2xl">
        {value}
        {suffix}
      </p>
      {hint && <div className={cn('mt-1 text-[11px] font-semibold sm:text-xs', hintClass)}>{hint}</div>}
    </div>
  )
}

function PreviousFeedbackCard({ reviews }: { reviews: PerformanceReview[] }) {
  if (reviews.length === 0) {
    return (
      <Card className="p-4 sm:p-5">
        <h3 className="mb-2 text-sm font-bold text-heading">Previous Feedback</h3>
        <p className="text-sm text-text-muted">No prior reviews for this person yet.</p>
      </Card>
    )
  }

  return (
    <Card className="p-4 sm:p-5">
      <h3 className="mb-4 text-sm font-bold text-heading">Previous Feedback</h3>
      <ul className="flex max-h-[420px] flex-col gap-4 overflow-y-auto pr-1">
        {reviews.map((review) => (
          <li
            key={review.id}
            className="rounded-xl border border-border-card bg-[#F8FAFC] p-3 last:mb-0"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-heading">{review.periodLabel}</p>
                <p className="mt-0.5 truncate text-[11px] text-text-muted">
                  {review.reviewerName} · {review.reviewerRole}
                </p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-2 py-0.5 text-xs font-bold text-heading shadow-sm">
                {review.finalAdjustedScore != null
                  ? `${review.finalAdjustedScore}`
                  : (
                      <>
                        <StarIcon className="size-3 text-[#FBBF24]" />
                        {review.rating}
                      </>
                    )}
              </span>
            </div>
            <p className="mt-2 text-xs leading-5 text-text-muted sm:text-sm">
              {review.feedback?.trim() ? review.feedback : 'No written feedback.'}
            </p>
          </li>
        ))}
      </ul>
    </Card>
  )
}

export function ReviewForm({
  initialValues,
  employeeId,
  employeeName = 'Employee',
  employeeRole = '',
  employeeDepartment = '',
  employeeAvatar,
  subjectRole = 'employee',
  mode = 'create',
  allowPeriodChange = false,
  periods = [],
  previousReviews = [],
  onCancel,
  onSubmit,
}: ReviewFormProps) {
  const templateRole = subjectRole === 'manager' ? 'manager' : 'employee'
  const [tab, setTab] = useState<TabId>('kpi')
  const [template, setTemplate] = useState<KpiTemplate | null>(null)
  const [templateError, setTemplateError] = useState<string | null>(null)
  const [values, setValues] = useState<ReviewFormValues>({
    employeeId,
    periodStart: initialValues?.periodStart ?? periods[0]?.periodStart ?? '',
    periodLabel: initialValues?.periodLabel ?? periods[0]?.periodLabel ?? '',
    rating: initialValues?.rating ?? 4,
    feedback: initialValues?.feedback ?? '',
    status: initialValues?.status ?? 'submitted',
    kpiScores: initialValues?.kpiScores ?? [],
    bonus: initialValues?.bonus ?? 0,
    penalty: initialValues?.penalty ?? 0,
    bonusPenaltyNote: initialValues?.bonusPenaltyNote ?? '',
  })
  const [metrics, setMetrics] = useState<EmployeeMetricsResponse | null>(null)
  const [metricsLoading, setMetricsLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [hydratedPeriodStart, setHydratedPeriodStart] = useState(initialValues?.periodStart ?? '')

  const existingForPeriod = useMemo(
    () =>
      findReviewForPeriod(previousReviews, {
        periodStart: values.periodStart,
        periodLabel: values.periodLabel,
      }),
    [previousReviews, values.periodStart, values.periodLabel],
  )
  const isUpdate = Boolean(existingForPeriod) || (mode === 'edit' && !allowPeriodChange)

  // When the selected calendar month changes, load that month's review or reset the form.
  useEffect(() => {
    if (!values.periodStart || values.periodStart === hydratedPeriodStart) return
    setHydratedPeriodStart(values.periodStart)

    if (existingForPeriod) {
      setValues((prev) => ({
        ...prev,
        rating: existingForPeriod.rating,
        feedback: existingForPeriod.feedback,
        status: existingForPeriod.status,
        kpiScores: existingForPeriod.kpiScores ?? [],
        bonus: existingForPeriod.bonus ?? 0,
        penalty: existingForPeriod.penalty ?? 0,
        bonusPenaltyNote: existingForPeriod.bonusPenaltyNote ?? '',
      }))
      return
    }

    if (mode === 'edit' && !allowPeriodChange) return

    const blankScores =
      template?.categories.flatMap((cat) =>
        cat.subKpis.map((sub) => ({
          subKpiId: sub.id,
          marksObtained: 0,
          remarks: '',
        })),
      ) ?? []

    setValues((prev) => ({
      ...prev,
      rating: 4,
      feedback: '',
      kpiScores: blankScores,
      bonus: 0,
      penalty: 0,
      bonusPenaltyNote: '',
    }))
  }, [
    allowPeriodChange,
    existingForPeriod,
    hydratedPeriodStart,
    mode,
    template,
    values.periodStart,
  ])

  useEffect(() => {
    void performanceApi
      .getActiveKpiTemplate(templateRole)
      .then((tpl) => {
        setTemplate(tpl)
        setValues((prev) => {
          if (prev.kpiScores.length > 0) return prev
          const scores = tpl.categories.flatMap((cat) =>
            cat.subKpis.map((sub) => ({
              subKpiId: sub.id,
              marksObtained: 0,
              remarks: '',
            })),
          )
          return { ...prev, kpiScores: scores }
        })
      })
      .catch((err) => {
        setTemplateError(err instanceof Error ? err.message : 'Failed to load KPI template')
      })
  }, [templateRole])

  const loadMetrics = useCallback(async () => {
    if (!values.periodStart) return
    setMetricsLoading(true)
    try {
      const data = await performanceApi.getMetrics(employeeId, values.periodStart)
      setMetrics(data)
      setValues((prev) => ({ ...prev, periodLabel: data.periodLabel }))
    } finally {
      setMetricsLoading(false)
    }
  }, [employeeId, values.periodStart])

  useEffect(() => {
    void loadMetrics()
  }, [loadMetrics])

  const summary = useMemo(() => {
    if (!template) return null
    return computeLiveKpiSummary(
      template.categories,
      values.kpiScores,
      values.bonus,
      values.penalty,
    )
  }, [template, values.kpiScores, values.bonus, values.penalty])

  // Keep bonus/penalty inside 0–100 final-score bounds when KPI marks change.
  useEffect(() => {
    if (!summary) return
    const next = clampBonusPenalty(summary.totalScore, values.bonus, values.penalty)
    if (next.bonus === values.bonus && next.penalty === values.penalty) return
    setValues((prev) => ({ ...prev, bonus: next.bonus, penalty: next.penalty }))
  }, [summary, values.bonus, values.penalty])

  const setMark = (subKpiId: string, marksObtained: number, maxMarks: number) => {
    const clamped = Math.max(0, Math.min(maxMarks, marksObtained))
    setValues((prev) => {
      const existing = prev.kpiScores.find((s) => s.subKpiId === subKpiId)
      const kpiScores = existing
        ? prev.kpiScores.map((s) =>
            s.subKpiId === subKpiId ? { ...s, marksObtained: clamped } : s,
          )
        : [...prev.kpiScores, { subKpiId, marksObtained: clamped, remarks: '' }]
      return { ...prev, kpiScores }
    })
  }

  const setBonus = (raw: number) => {
    const total = summary?.totalScore ?? 0
    const next = clampBonusPenalty(total, raw, values.penalty)
    setValues((prev) => ({ ...prev, bonus: next.bonus, penalty: next.penalty }))
  }

  const setPenalty = (raw: number) => {
    const total = summary?.totalScore ?? 0
    const next = clampBonusPenalty(total, values.bonus, raw)
    setValues((prev) => ({ ...prev, bonus: next.bonus, penalty: next.penalty }))
  }

  const handleSubmit = async () => {
    if ((values.bonus !== 0 || values.penalty !== 0) && !values.bonusPenaltyNote.trim()) {
      setTab('kpi')
      return
    }
    setSubmitting(true)
    try {
      await onSubmit({ ...values, status: 'submitted' })
    } finally {
      setSubmitting(false)
    }
  }

  const profileSubtitle = [employeeRole, employeeDepartment].filter(Boolean).join(' • ')
  const historyReviews = previousReviews.filter(
    (review) =>
      !isSameReviewPeriod(review, {
        periodStart: values.periodStart,
        periodLabel: values.periodLabel,
      }),
  )

  const tabs: { id: TabId; label: string }[] = [
    { id: 'metrics', label: 'Auto Metrics' },
    { id: 'kpi', label: 'KPI Scorecard' },
    { id: 'rating', label: 'Rating & Feedback' },
  ]

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        void handleSubmit()
      }}
      className="min-w-0 pb-24 sm:pb-0"
    >
      <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start xl:gap-8">
        <div className="min-w-0">
          <Card className="overflow-hidden p-3 sm:p-5 xl:p-7">
            <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:items-center sm:gap-5 sm:text-left">
              <ReviewProfileAvatar name={employeeName} avatar={employeeAvatar} />
              <div className="min-w-0 w-full sm:w-auto">
                <h2 className="truncate text-base font-bold text-heading sm:text-lg xl:text-xl">
                  {employeeName}
                </h2>
                {profileSubtitle && (
                  <p className="mt-0.5 line-clamp-2 text-xs text-text-muted sm:text-sm">
                    {profileSubtitle}
                  </p>
                )}
                {summary && (
                  <p className="mt-2 flex flex-wrap items-center justify-center gap-1.5 text-xs sm:justify-start sm:text-sm">
                    <span className="font-bold text-primary">
                      {summary.finalAdjustedScore.toFixed(0)}
                    </span>
                    <span className="font-bold uppercase text-[#00B67A]">
                      {statusLabel(summary.performanceLevel)}
                    </span>
                  </p>
                )}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:mt-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-text-muted">
                  Review Period
                </label>
                <SelectField
                  value={values.periodStart}
                  onChange={(e) => {
                    const selected = periods.find((p) => p.periodStart === e.target.value)
                    setValues({
                      ...values,
                      periodStart: e.target.value,
                      periodLabel: selected?.periodLabel ?? values.periodLabel,
                    })
                  }}
                  className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm font-medium text-heading"
                  disabled={mode === 'edit' && !allowPeriodChange}
                >
                  {periods.map((p) => (
                    <option key={p.periodStart} value={p.periodStart}>
                      {p.periodLabel}
                    </option>
                  ))}
                </SelectField>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2 border-b border-border-card pb-3">
              {tabs.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={cn(
                    'rounded-lg px-3 py-2 text-sm font-semibold transition-colors',
                    tab === item.id
                      ? 'bg-primary text-white'
                      : 'bg-surface-muted text-text-muted hover:text-heading',
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {tab === 'metrics' && (
              <div className="mt-5">
                {metricsLoading ? (
                  <p className="text-sm text-text-muted">Loading auto-computed metrics…</p>
                ) : metrics ? (
                  <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:gap-4 xl:grid-cols-4">
                    {metrics.metricType === 'manager' ? (
                      <>
                        <MetricsReadOnlyCard
                          label="Projects Done"
                          value={metrics.projectsCompleted ?? 0}
                          hint={`of ${metrics.projectsTotal ?? 0} total`}
                          hintClass="text-[#10B981]"
                        />
                        <MetricsReadOnlyCard
                          label="Avg Progress"
                          value={metrics.avgProjectProgress ?? 0}
                          suffix="%"
                          hint="Managed projects"
                          hintClass="text-primary"
                        />
                        <MetricsReadOnlyCard
                          label="Milestones"
                          value={metrics.milestoneCompletion ?? 0}
                          suffix="%"
                          hint="Completion rate"
                          hintClass="text-[#FF9F43]"
                        />
                        <MetricsReadOnlyCard
                          label="Efficiency"
                          value={metrics.efficiency}
                          suffix="%"
                          hint={
                            <span className="inline-flex items-center gap-1">
                              <TrendUpIcon className="shrink-0" />
                              Project composite
                            </span>
                          }
                          hintClass="text-text-muted"
                        />
                      </>
                    ) : (
                      <>
                        <MetricsReadOnlyCard
                          label="Completed"
                          value={metrics.tasksCompleted}
                          hint="Auto-computed from tasks"
                          hintClass="text-[#10B981]"
                        />
                        <MetricsReadOnlyCard
                          label="Pending"
                          value={metrics.tasksPending}
                          hint="Open tasks in period"
                          hintClass="text-[#DC2626]"
                        />
                        <MetricsReadOnlyCard
                          label="Deadlines Met"
                          value={metrics.deadlinesMet}
                          suffix="%"
                          hint="On-time completions"
                          hintClass="text-text-muted"
                        />
                        <MetricsReadOnlyCard
                          label="Efficiency"
                          value={metrics.efficiency}
                          suffix="%"
                          hint={
                            <span className="inline-flex items-center gap-1">
                              <TrendUpIcon className="shrink-0" />
                              Tasks & deadlines
                            </span>
                          }
                          hintClass="text-text-muted"
                        />
                      </>
                    )}
                  </div>
                ) : null}
              </div>
            )}

            {tab === 'kpi' && (
              <div className="mt-5 space-y-5">
                {templateError && (
                  <p className="rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-sm text-[#DC2626]">
                    {templateError}
                  </p>
                )}
                {!template && !templateError && (
                  <p className="text-sm text-text-muted">Loading KPI template…</p>
                )}
                {template?.categories.map((category) => (
                  <div
                    key={category.name}
                    className="rounded-xl border border-border-card bg-[#F8FAFC] p-4"
                  >
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <h3 className="text-sm font-bold text-heading">{category.name}</h3>
                      <span className="text-xs font-semibold text-text-muted">
                        Max {category.maxMarks}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {category.subKpis.map((sub) => {
                        const score = values.kpiScores.find((s) => s.subKpiId === sub.id)
                        return (
                          <div
                            key={sub.id}
                            className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_100px] sm:items-center"
                          >
                            <label className="text-sm text-heading">{sub.label}</label>
                            <input
                              type="number"
                              min={0}
                              max={sub.maxMarks}
                              step={0.5}
                              value={score?.marksObtained ?? 0}
                              onChange={(e) =>
                                setMark(sub.id, Number(e.target.value), sub.maxMarks)
                              }
                              className="h-10 rounded-lg border border-border bg-surface px-3 text-sm font-medium text-heading"
                            />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase text-text-muted">
                      Bonus
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={summary?.maxBonus ?? 100}
                      step={0.5}
                      value={values.bonus}
                      onChange={(e) => setBonus(Number(e.target.value) || 0)}
                      className="h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm"
                    />
                    <p className="mt-1 text-[11px] text-text-muted">
                      Max +{summary?.maxBonus ?? 0} (final ≤ 100)
                    </p>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase text-text-muted">
                      Penalty
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={summary?.maxPenalty ?? 100}
                      step={0.5}
                      value={values.penalty}
                      onChange={(e) => setPenalty(Number(e.target.value) || 0)}
                      className="h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm"
                    />
                    <p className="mt-1 text-[11px] text-text-muted">
                      Max −{summary?.maxPenalty ?? 0} (final ≥ 0)
                    </p>
                  </div>
                  <div className="sm:col-span-3">
                    <label className="mb-1 block text-xs font-bold uppercase text-text-muted">
                      Bonus / Penalty Note
                      {(values.bonus !== 0 || values.penalty !== 0) && (
                        <span className="ml-1 text-[#DC2626]">(required)</span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={values.bonusPenaltyNote}
                      onChange={(e) =>
                        setValues({ ...values, bonusPenaltyNote: e.target.value })
                      }
                      className="h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm"
                      placeholder="Required when bonus or penalty is non-zero"
                    />
                  </div>
                </div>
              </div>
            )}

            {tab === 'rating' && (
              <div className="mt-5 space-y-5">
                <div>
                  <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-text-muted">
                    Qualitative Rating (1–5)
                  </label>
                  <div className="flex min-h-11 items-center justify-between gap-3 rounded-lg border border-border bg-surface px-3 py-2">
                    <span className="text-sm font-semibold text-heading">
                      {values.rating} Stars
                    </span>
                    <StarRating
                      rating={values.rating}
                      size="md"
                      aria-label="Overall rating"
                      onChange={(rating) => setValues({ ...values, rating })}
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-heading">
                    Detailed Feedback
                  </label>
                  <textarea
                    value={values.feedback}
                    onChange={(e) => setValues({ ...values, feedback: e.target.value })}
                    rows={6}
                    required
                    className="min-h-[140px] w-full resize-y rounded-xl border border-[#DBEAFE] bg-[#EFF6FF]/60 p-3 text-sm leading-relaxed text-heading outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            )}

            <div className="mt-5 xl:hidden">
              <PreviousFeedbackCard reviews={historyReviews} />
            </div>
          </Card>
        </div>

        <aside className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-4 xl:grid-cols-1 xl:gap-5 xl:sticky xl:top-6">
          <Card className="p-4 sm:p-5">
            <h3 className="mb-3 text-sm font-bold text-heading">Section Summary</h3>
            {summary ? (
              <div className="space-y-2">
                {summary.categoryScores.map((cat) => (
                  <div key={cat.name} className="flex items-center justify-between gap-2 text-xs">
                    <span className="truncate text-text-muted">{cat.name}</span>
                    <span className="font-semibold text-heading">
                      {cat.obtained}/{cat.maxMarks}
                    </span>
                  </div>
                ))}
                <div className="mt-3 border-t border-border-card pt-3 text-sm">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{summary.totalScore}</span>
                  </div>
                  <div className="mt-1 flex justify-between text-text-muted">
                    <span>Bonus / Penalty</span>
                    <span>
                      +{values.bonus} / −{values.penalty}
                    </span>
                  </div>
                  <div className="mt-2 flex justify-between text-base font-bold text-heading">
                    <span>Final</span>
                    <span>{summary.finalAdjustedScore}</span>
                  </div>
                  <p className="mt-1 text-xs font-bold uppercase text-[#00B67A]">
                    {statusLabel(summary.performanceLevel)}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-text-muted">Enter KPI marks to see live totals.</p>
            )}
          </Card>

          <div className="hidden xl:block">
            <PreviousFeedbackCard reviews={historyReviews} />
          </div>

          <Card className="h-full p-4 sm:p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-heading">
              <LightbulbIcon className="text-primary" />
              Review Tips
            </h3>
            <ul className="flex flex-col gap-3 text-sm text-text-muted">
              {[
                'Score each sub-KPI against evidence from the period',
                'Use bonus/penalty only with a clear note',
                'Keep the 1–5 rating as a qualitative gut check',
              ].map((tip) => (
                <li key={tip} className="flex items-start gap-2.5">
                  <CheckIcon className="mt-0.5 shrink-0 text-primary" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </Card>

          {metrics && <EfficiencyTrendCard value={metrics.efficiency} className="h-full" />}
        </aside>
      </div>

      <div className="mt-4 flex w-full flex-col-reverse gap-3 max-sm:sticky max-sm:bottom-0 max-sm:-mx-4 max-sm:border-t max-sm:border-border-card max-sm:bg-surface max-sm:px-4 max-sm:py-4 sm:mt-6 sm:flex-row sm:items-center sm:justify-end sm:gap-4">
        <button
          type="button"
          onClick={onCancel}
          className={cn(
            actionButtonClass,
            'border border-border bg-surface text-heading hover:bg-surface-muted',
          )}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting || !template}
          className={cn(
            actionButtonClass,
            'bg-primary text-white shadow-[0_4px_12px_rgba(15,82,186,0.25)] hover:opacity-95 disabled:opacity-60',
          )}
        >
          {isUpdate ? 'Update Review' : 'Submit Review'}
        </button>
      </div>
    </form>
  )
}
