import type { ReactNode } from 'react'
import type { CompanyDetail, SubscriptionDetail } from '@/features/platform/model/types'
import { planLabels } from '@/features/platform/model/companiesData'
import { COMPANY_HUB_LABELS, resolveEnabledHubs } from '@/features/auth/model/companyHubs'
import {
  CalendarIcon,
  IdCardIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  SubscriptionIcon,
} from '@/features/platform/ui/icons'
import { Card } from '@/shared/ui/Card'
import { UserAvatar } from '@/shared/ui/UserAvatar'
import { cn } from '@/shared/lib/cn'

type OverviewItem = {
  id: string
  label: string
  value: ReactNode
  icon?: ReactNode
  avatar?: string
  avatarName?: string
}

function OverviewCard({ item }: { item: OverviewItem }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border-card bg-surface p-5 shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
      {item.avatarName ? (
        <UserAvatar
          name={item.avatarName}
          avatar={item.avatar}
          size="lg"
          className="size-11"
        />
      ) : item.icon ? (
        <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#1877F2]">
          {item.icon}
        </span>
      ) : null}
      <div className="min-w-0">
        <p className="text-xs font-medium text-text-muted">{item.label}</p>
        <div className="mt-1 text-base font-bold text-heading">{item.value}</div>
      </div>
    </div>
  )
}

function EmployeesCard({ count, avatars }: { count: number; avatars: string[] }) {
  const visibleAvatars = avatars.slice(0, 3)
  const overflow = count - visibleAvatars.length

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border-card bg-surface p-5 shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
      <div className="min-w-0">
        <p className="text-xs font-medium text-text-muted">Employees</p>
        <p className="mt-1 text-base font-bold text-heading">{count}</p>
      </div>
      {visibleAvatars.length > 0 ? (
        <div className="flex shrink-0 items-center">
          {visibleAvatars.map((src, i) => (
            <img
              key={`${src}-${i}`}
              src={src}
              alt=""
              className={cn(
                'size-9 rounded-full border-2 border-surface object-cover',
                i > 0 && '-ml-2.5',
              )}
            />
          ))}
          {overflow > 0 && (
            <span className="-ml-2.5 flex size-9 items-center justify-center rounded-full border-2 border-surface bg-[#EFF6FF] text-xs font-bold text-[#1877F2]">
              +{overflow}
            </span>
          )}
        </div>
      ) : null}
    </div>
  )
}

export function DetailOverviewGrid({
  data,
  subscriptionMode = false,
}: {
  data: CompanyDetail | SubscriptionDetail
  subscriptionMode?: boolean
}) {
  const subscriptionDetail = subscriptionMode && 'adminUsers' in data ? data : null

  const adminItem: OverviewItem = {
    id: 'admin',
    label: 'Admin',
    value: (
      <span className="inline-flex flex-wrap items-center gap-2">
        {data.adminName}
        {'adminStatus' in data && data.adminStatus === 'pending' && (
          <span className="rounded-full bg-warning-muted px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-warning">
            Pending
          </span>
        )}
      </span>
    ),
    avatarName: data.adminName,
    avatar: data.adminAvatar,
  }

  const items: OverviewItem[] = subscriptionDetail
    ? [
        {
          id: 'adminUsers',
          label: 'Admin Users',
          value: subscriptionDetail.adminLimit,
          icon: <IdCardIcon />,
        },
        {
          id: 'joiningDate',
          label: 'Joining Date',
          value: data.joiningDate,
          icon: <CalendarIcon className="size-5" />,
        },
        {
          id: 'workLocation',
          label: 'Work Location',
          value: data.workLocation,
          icon: <MapPinIcon />,
        },
        {
          id: 'subscription',
          label: 'Subscription Status',
          value: planLabels[data.plan],
          icon: <SubscriptionIcon />,
        },
        adminItem,
      ]
    : [
        {
          id: 'adminId',
          label: 'Admin ID',
          value: data.adminId,
          icon: <IdCardIcon />,
        },
        {
          id: 'joiningDate',
          label: 'Joining Date',
          value: data.joiningDate,
          icon: <CalendarIcon className="size-5" />,
        },
        {
          id: 'workLocation',
          label: 'Work Location',
          value: data.workLocation,
          icon: <MapPinIcon />,
        },
        {
          id: 'subscription',
          label: 'Subscription',
          value: planLabels[data.plan],
          icon: <SubscriptionIcon />,
        },
        {
          id: 'productAccess',
          label: 'Product access',
          value: resolveEnabledHubs(data.enabledHubs)
            .map((hub) => COMPANY_HUB_LABELS[hub])
            .join(', '),
          icon: <IdCardIcon />,
        },
        adminItem,
      ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <OverviewCard key={item.id} item={item} />
      ))}
      <EmployeesCard count={data.employees} avatars={data.employeeAvatars} />
    </div>
  )
}

type CompanyProfileHeaderProps = {
  data: CompanyDetail | SubscriptionDetail
  showExpiry?: boolean
  embedded?: boolean
}

function CompanyProfileMeta({
  data,
  showExpiry,
}: {
  data: CompanyDetail | SubscriptionDetail
  showExpiry: boolean
}) {
  return (
    <div className="flex shrink-0 flex-wrap items-start gap-8 sm:gap-10">
      <div>
        <p className="text-xs text-text-muted">Join Date</p>
        <p className="mt-1 text-sm font-bold text-primary">{data.joinDate}</p>
      </div>
      {showExpiry && 'expiryDate' in data && (
        <div>
          <p className="text-xs text-text-muted">Expiry Date</p>
          <p className="mt-1 text-sm font-bold text-primary">{data.expiryDate}</p>
        </div>
      )}
      <div>
        <p className="text-xs text-text-muted">Status</p>
        <span className="mt-1 inline-block rounded-full bg-success-muted px-3.5 py-1 text-[11px] font-bold tracking-wide text-success">
          ACTIVE
        </span>
      </div>
    </div>
  )
}

export function CompanyProfileCard({
  data,
  showExpiry = false,
  embedded = false,
  withTabs = false,
}: CompanyProfileHeaderProps & { withTabs?: boolean }) {
  const profileBody = (
    <div className="relative">
      <div className="h-[88px] bg-[#F0F7FF] sm:h-[96px]" />

      <div className="relative -mt-[52px] px-4 sm:-mt-[56px] sm:px-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-4 sm:gap-5">
            <UserAvatar
              name={data.name}
              avatar={data.logoUrl}
              size="2xl"
              rounded="xl"
              alt={`${data.name} logo`}
              className="size-[72px] border border-border-card shadow-[0_4px_14px_rgba(0,0,0,0.08)] sm:size-20"
            />
            <div className="min-w-0 pt-1 sm:pt-2">
              <h2 className="text-xl font-bold leading-tight text-heading sm:text-[22px]">{data.name}</h2>
              <p className="mt-1 text-sm font-medium text-[#136DEC]">{data.industry}</p>
              <div className="mt-2.5 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <MailIcon className="text-text-muted" />
                  {data.email}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <PhoneIcon className="text-text-muted" />
                  {data.phone}
                </span>
              </div>
            </div>
          </div>

          <CompanyProfileMeta data={data} showExpiry={showExpiry} />
        </div>
      </div>

      {withTabs && (
        <div className="mt-6 border-t border-border-card px-4 pt-4 sm:px-6">
          <div>
            <h2 className="inline-block border-b-2 border-primary px-0.5 pb-2.5 text-sm font-bold text-[#136DEC]">
              Overview
            </h2>
          </div>
        </div>
      )}
    </div>
  )

  if (embedded) {
    return profileBody
  }

  return <Card className="overflow-hidden">{profileBody}</Card>
}

export function SubscriptionDetailSection({ data }: { data: SubscriptionDetail }) {
  return (
    <Card className="overflow-hidden">
      <CompanyProfileCard data={data} embedded showExpiry />

      <div className="border-t border-border-card px-4 sm:px-6">
        <div className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="inline-block border-b-2 border-primary pb-2.5 text-sm font-bold text-[#136DEC]">
            Overview
          </h2>
          <div className="flex flex-wrap gap-4 text-xs sm:gap-8">
            <p className="text-text-muted">
              <span className="font-semibold uppercase tracking-wide">Admin Users</span>{' '}
              <span className="font-bold text-[#136DEC]">
                {data.adminUsers} / {data.adminLimit}
              </span>
            </p>
            <p className="text-text-muted">
              <span className="font-semibold uppercase tracking-wide">Customers</span>{' '}
              <span className="font-bold text-[#136DEC]">
                {data.customers} / {data.customerLimit}
              </span>{' '}
              Used
            </p>
            <p className="text-text-muted">
              <span className="font-semibold uppercase tracking-wide">Storage</span>{' '}
              <span className="font-bold text-[#136DEC]">
                {data.storageUsed} / {data.storageLimit}
              </span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-6 pb-4 sm:pb-6 xl:grid-cols-[1fr_300px]">
          <DetailOverviewGrid data={data} subscriptionMode />
          <BillingHistoryCard data={data} />
        </div>
      </div>
    </Card>
  )
}

export function BillingHistoryCard({ data }: { data: SubscriptionDetail }) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-[#C5DBF5] bg-[#F0F7FF] p-5 shadow-[0_2px_8px_rgba(24,119,242,0.06)]">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#136DEC]">
        <svg className="size-4 shrink-0 text-[#1877F2]" viewBox="0 0 20 16" fill="currentColor" aria-hidden>
          <path d="M0 16V0H20V16H0ZM2 14H18V6H2V14ZM2 4H18V2H2V4ZM4 10H8V8H4V10Z" />
        </svg>
        Billing History
      </div>
      <div className="mt-5 flex flex-1 gap-4 border-l-4 border-[#1877F2] pl-4">
        <dl className="space-y-4 text-sm">
          <div>
            <dt className="text-[11px] font-bold uppercase tracking-wide text-text-muted">Invoice</dt>
            <dd className="mt-1 text-base font-bold text-heading">{data.billingInvoice}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-bold uppercase tracking-wide text-text-muted">Date</dt>
            <dd className="mt-1 text-base font-bold text-heading">{data.billingDate}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-bold uppercase tracking-wide text-text-muted">Status</dt>
            <dd className="mt-1.5">
              <span className="inline-block rounded-full bg-[#00B67A] px-3.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                ACTIVE
              </span>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
