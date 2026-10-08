import { Link } from 'react-router-dom'
import {
  Area,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { PerformanceDetail } from '@/features/performance/model/types'
import { statusLabel } from '@/features/performance/lib/performance-utils'
import {
  AvatarCircle,
  BuildingIcon,
  StarIcon,
  TrendUpIcon,
} from '@/features/performance/ui/icons'
import { StarRating } from '@/features/performance/ui/StarRating'
import { Card } from '@/shared/ui/Card'
import { UserAvatar } from '@/shared/ui/UserAvatar'
import { cn } from '@/shared/lib/cn'

function formatOutputTrend(trend: number): string {
  if (trend === 0) return '0% vs last month'
  return `${trend > 0 ? '+' : ''}${trend}% vs last month`
}

function EmployeeProfileAvatar({
  name,
  avatar,
  rating,
}: {
  name: string
  avatar?: string
  rating: number
}) {
  return (
    <div className="relative shrink-0">
      <UserAvatar
        name={name}
        avatar={avatar}
        size="xl"
        rounded="xl"
        className="sm:size-[72px] sm:text-lg"
      />
      <span className="absolute -bottom-1 -right-1 inline-flex items-center gap-0.5 rounded-full border border-[#E4EDF6] bg-white px-1.5 py-0.5 text-[10px] font-bold text-heading shadow-[0_1px_4px_rgba(0,0,0,0.08)] sm:-bottom-1.5 sm:-right-1.5 sm:text-xs">
        <StarIcon className="size-2.5 sm:size-3" />
        {rating}
      </span>
    </div>
  )
}

export function EmployeeOverviewCard({ detail }: { detail: PerformanceDetail }) {
  return (
    <Card className="overflow-hidden p-4 sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:gap-8">
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
          <EmployeeProfileAvatar
            name={detail.employeeName}
            avatar={detail.employeeAvatar}
            rating={detail.rating ?? 0}
          />
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-xl font-bold leading-tight text-heading sm:text-2xl">
              {detail.employeeName}
            </h2>
            <p className="mt-0.5 truncate text-sm font-medium text-primary">{detail.role}</p>
            <p className="mt-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-text-muted sm:text-[11px]">
              <BuildingIcon className="shrink-0 text-text-muted" />
              <span className="truncate">{detail.department}</span>
            </p>
          </div>
        </div>

        <div className="hidden w-px shrink-0 self-stretch bg-border-card lg:block" />
        <div className="h-px bg-border-card lg:hidden" />

        <div className="grid flex-1 grid-cols-2 gap-x-4 gap-y-5 sm:gap-6 lg:grid-cols-3 lg:gap-8 lg:px-2">
          <div className="col-span-2 border-b border-border-card pb-5 lg:col-span-1 lg:border-0 lg:pb-0">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted sm:text-[11px]">
              {detail.subjectRole === 'manager' ? 'Projects Completed' : 'Tasks Completed'}
            </p>
            <p className="mt-1 text-2xl font-bold leading-none text-heading sm:text-3xl">
              {detail.subjectRole === 'manager'
                ? `${detail.projectsCompleted ?? 0}/${detail.projectsTotal ?? 0}`
                : detail.tasksCompleted}
            </p>
            {detail.subjectRole !== 'manager' ? (
              <p
                className={cn(
                  'mt-2 flex flex-wrap items-center gap-1 text-xs font-semibold',
                  detail.trend >= 0 ? 'text-[#10B981]' : 'text-[#DC2626]',
                )}
              >
                <TrendUpIcon
                  className={cn('shrink-0', detail.trend < 0 && 'rotate-180')}
                />
                {formatOutputTrend(detail.trend)}
              </p>
            ) : null}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted sm:text-[11px]">
              Deadlines Met
            </p>
            <p className="mt-1 text-2xl font-bold leading-none text-heading sm:text-3xl">
              {detail.deadlinesMet}%
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#E2E8F0] sm:mt-3">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${detail.deadlinesMet}%` }}
              />
            </div>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted sm:text-[11px]">
              Efficiency
            </p>
            <p className="mt-1 text-2xl font-bold leading-none text-heading sm:text-3xl">
              {detail.efficiency}%
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#E2E8F0] sm:mt-3">
              <div
                className="h-full rounded-full bg-[#10B981]"
                style={{ width: `${detail.efficiency}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

export function QuickStatsRow({ detail }: { detail: PerformanceDetail }) {
  const stats = [
    { label: 'Tasks Completed', value: String(detail.tasksCompleted) },
    { label: 'Tasks Pending', value: String(detail.tasksPending).padStart(2, '0') },
    { label: 'Deadlines Met', value: `${detail.deadlinesMet}%` },
    { label: 'Efficiency', value: `${detail.efficiency}%` },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="min-w-0 p-3 text-center sm:p-5">
          <p className="text-[11px] leading-tight text-text-muted sm:text-sm">{stat.label}</p>
          <p className="mt-1 text-lg font-bold text-heading sm:mt-2 sm:text-2xl">{stat.value}</p>
        </Card>
      ))}
    </div>
  )
}

export function PerformanceTrendLineChart({ detail }: { detail: PerformanceDetail }) {
  return (
    <Card className="flex min-h-0 flex-col overflow-hidden p-4 sm:min-h-[340px] sm:p-[25px]">
      <div className="mb-3 flex flex-col gap-2 sm:mb-4 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <h3 className="text-base font-bold text-heading sm:text-lg">Performance Trend</h3>
        <div className="flex flex-wrap gap-3 text-xs text-text-muted sm:gap-4">
          <span className="flex items-center gap-1.5">
            <span className="size-2 shrink-0 rounded-full bg-primary" />
            Current
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 shrink-0 rounded-full bg-[#CBD5E1]" />
            Goal
          </span>
        </div>
      </div>
      <div className="h-[200px] w-full min-w-0 sm:h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={detail.trendData}
            margin={{ top: 8, right: 4, left: -12, bottom: 0 }}
          >
            <CartesianGrid stroke="#F1F5F9" vertical={false} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
              tick={{ fill: '#94A3B8', fontSize: 10 }}
            />
            <YAxis hide domain={[0, 100]} />
            <Tooltip />
            <Area type="monotone" dataKey="current" stroke="none" fill="url(#perfGradient)" />
            <Line type="monotone" dataKey="current" stroke="#1877F2" strokeWidth={2.5} dot={false} />
            <Line type="monotone" dataKey="goal" stroke="#CBD5E1" strokeWidth={2} strokeDasharray="4 4" dot={false} />
            <defs>
              <linearGradient id="perfGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1877F2" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#1877F2" stopOpacity={0} />
              </linearGradient>
            </defs>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

export function ManagerRatingCard({
  detail,
  employeeId,
  periodStart,
}: {
  detail: PerformanceDetail
  employeeId: string
  periodStart: string
}) {
  const review = detail.managerReview
  const canReview = Boolean(detail.canReview)
  const title =
    detail.subjectRole === 'manager'
      ? 'Admin Rating'
      : review?.reviewerRole?.toLowerCase().includes('admin')
        ? 'Admin Rating'
        : 'Manager Rating'
  const reviewPath = `/performance/${employeeId}/reviews/new?periodStart=${periodStart}`

  if (!review) {
    return (
      <Card className="p-4 sm:p-5">
        <h3 className="mb-4 text-xs font-bold uppercase tracking-wide text-text-muted">{title}</h3>
        <p className="text-sm text-text-muted">No review submitted for this period.</p>
        {canReview ? (
          <Link
            to={reviewPath}
            className="mt-4 flex h-10 w-full items-center justify-center rounded-lg bg-primary text-sm font-semibold text-white hover:opacity-95"
          >
            Add Review
          </Link>
        ) : null}
      </Card>
    )
  }

  return (
    <Card className="p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-xs font-bold uppercase tracking-wide text-text-muted">{title}</h3>
        {detail.status && (
          <span className="shrink-0 rounded-full bg-[#ECFDF5] px-2.5 py-1 text-[10px] font-bold text-[#00B67A]">
            {statusLabel(detail.status)}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-heading sm:text-3xl">
        {review.finalAdjustedScore != null ? (
          <>
            {review.finalAdjustedScore}{' '}
            <span className="text-base font-normal text-text-muted sm:text-lg">/ 100</span>
          </>
        ) : (
          <>
            {review.rating}{' '}
            <span className="text-base font-normal text-text-muted sm:text-lg">/ 5</span>
          </>
        )}
      </p>
      <div className="mt-2 overflow-x-auto">
        <StarRating rating={review.rating} />
      </div>
      {(review.categoryScores?.length ?? 0) > 0 && (
        <ul className="mt-3 space-y-1.5">
          {review.categoryScores!.map((cat) => (
            <li key={cat.name} className="flex justify-between text-xs text-text-muted">
              <span className="truncate pr-2">{cat.name}</span>
              <span className="font-semibold text-heading">
                {cat.obtained}/{cat.maxMarks}
              </span>
            </li>
          ))}
        </ul>
      )}
      {(review.bonus || review.penalty) ? (
        <p className="mt-2 text-xs text-text-muted">
          Bonus +{review.bonus ?? 0} / Penalty −{review.penalty ?? 0}
          {review.bonusPenaltyNote ? ` — ${review.bonusPenaltyNote}` : ''}
        </p>
      ) : null}
      <p className="mt-3 text-xs text-text-muted sm:text-sm">
        Last Review Date: {review.period}
      </p>
      <blockquote className="mt-4 rounded-xl bg-[#F8FAFC] p-3 text-xs italic text-text-muted sm:p-4 sm:text-sm">
        &ldquo;{review.feedback}&rdquo;
      </blockquote>
      {canReview ? (
        <Link
          to={reviewPath}
          className="mt-4 flex h-10 w-full items-center justify-center rounded-lg bg-primary text-sm font-semibold text-white hover:opacity-95"
        >
          Update Review
        </Link>
      ) : null}
    </Card>
  )
}

export function ValueDeliveredCard({ detail }: { detail: PerformanceDetail }) {
  const roi = detail.roi
  if (!roi) return null
  return (
    <Card className="flex h-full flex-col p-4 sm:p-5">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-text-muted">
        Value Delivered
      </h3>
      <p className="text-2xl font-bold text-heading">{roi.roiIndex}</p>
      <p className="mt-1 text-xs text-text-muted">
        Output {roi.outputValue} / Effort {roi.effortInput}
      </p>
      {roi.financialRoi != null && (
        <p className="mt-2 text-sm font-semibold text-primary">
          Financial ROI: {(roi.financialRoi * 100).toFixed(1)}%
        </p>
      )}
      {roi.cost != null && (
        <p className="mt-1 text-xs text-text-muted">Cost context: {roi.cost}</p>
      )}
    </Card>
  )
}

export function CategoryBreakdownCard({ detail }: { detail: PerformanceDetail }) {
  const scores = detail.categoryScores ?? detail.managerReview?.categoryScores ?? []
  if (scores.length === 0) return null
  return (
    <Card className="flex h-full flex-col p-4 sm:p-5">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-text-muted">
        Category Breakdown
      </h3>
      <ul className="space-y-2">
        {scores.map((cat) => {
          const pct = cat.maxMarks > 0 ? Math.round((cat.obtained / cat.maxMarks) * 100) : 0
          return (
            <li key={cat.name}>
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-heading">{cat.name}</span>
                <span className="text-text-muted">
                  {cat.obtained}/{cat.maxMarks}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[#E2E8F0]">
                <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
              </div>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}

export function AuditTrailCard({ detail }: { detail: PerformanceDetail }) {
  const trail = detail.auditTrail ?? []
  if (trail.length === 0) return null
  return (
    <Card className="p-4 sm:p-5">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-text-muted">
        Bonus / Penalty Audit
      </h3>
      <ul className="space-y-2">
        {trail.map((entry) => (
          <li key={entry.id} className="rounded-lg bg-[#F8FAFC] p-2 text-xs">
            <div className="flex justify-between gap-2 font-semibold text-heading">
              <span className="capitalize">{entry.type.replace('_', ' ')}</span>
              <span>{entry.amount > 0 ? `+${entry.amount}` : entry.amount}</span>
            </div>
            <p className="mt-1 text-text-muted">{entry.note || '—'}</p>
            <p className="mt-0.5 text-[10px] text-text-muted">
              {entry.actorName ?? 'Actor'} · {new Date(entry.createdAt).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </Card>
  )
}

export function RecentReviewsCard({ detail }: { detail: PerformanceDetail }) {
  return (
    <Card className="p-4 sm:p-5">
      <h3 className="mb-4 text-xs font-bold uppercase tracking-wide text-text-muted">
        Recent Reviews
      </h3>
      <ul className="flex flex-col gap-4">
        {detail.recentReviews.map((review) => (
          <li key={review.id} className="border-b border-border-card pb-4 last:border-0 last:pb-0">
            <div className="flex items-start gap-2.5 sm:gap-3">
              <AvatarCircle
                name={review.reviewerName}
                avatar={review.reviewerAvatar}
                className="size-9 shrink-0 sm:size-10"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                  <p className="truncate font-semibold text-sm text-heading sm:text-base">
                    {review.reviewerName}
                  </p>
                  <StarRating rating={review.rating} size="sm" />
                </div>
                <p className="mt-0.5 truncate text-[11px] text-text-muted sm:text-xs">
                  {review.reviewerRole} • {review.period}
                </p>
                <p className="mt-2 text-xs text-text-muted line-clamp-2 sm:text-sm">{review.feedback}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="mt-4 flex h-10 w-full items-center justify-center rounded-lg border border-primary text-sm font-semibold text-primary hover:bg-[#EFF6FF]"
      >
        View All Reviews
      </button>
    </Card>
  )
}
