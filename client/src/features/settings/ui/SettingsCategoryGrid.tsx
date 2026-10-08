import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/model/AuthContext'
import type { Permission } from '@/features/auth/model/permissions'
import { isCompanyHubEnabled } from '@/features/auth/model/companyHubs'
import {
  BellIcon,
  CompanyIcon,
  GearIcon,
  ShieldCheckIcon,
  ShieldUserIcon,
  UserPlusIcon,
} from '@/features/settings/ui/icons'
import { Card } from '@/shared/ui/Card'
import { cn } from '@/shared/lib/cn'

type Category = {
  title: string
  subtitle: string
  icon: (props: { className?: string }) => ReactNode
  iconClass: string
  to: string
  permission: Permission
  /** Company-scoped settings — hidden from platform superadmin */
  companyOnly?: boolean
}

const categories: Category[] = [
  {
    title: 'Roles & Permissions',
    subtitle: 'Control access & permissions',
    icon: ShieldUserIcon,
    iconClass: 'bg-[#EFF6FF] text-[#1877F2]',
    to: '/settings/roles',
    permission: 'settings:admin',
    companyOnly: true,
  },
  {
    title: 'Company Settings',
    subtitle: 'Manage company info, logo & details',
    icon: CompanyIcon,
    iconClass: 'bg-[#F5F3FF] text-[#9333EA]',
    to: '/settings/company',
    permission: 'settings:admin',
    companyOnly: true,
  },
  {
    title: 'User Management',
    subtitle: 'Add & manage users',
    icon: UserPlusIcon,
    iconClass: 'bg-[#ECFDF5] text-[#00B67A]',
    to: '/settings/users',
    permission: 'settings:admin',
    companyOnly: true,
  },
  {
    title: 'Notifications',
    subtitle: 'Email & system alerts',
    icon: BellIcon,
    iconClass: 'bg-[#FFF7ED] text-[#EA580C]',
    to: '/settings/notifications',
    permission: 'settings:read',
  },
  {
    title: 'System Preferences',
    subtitle: 'App configurations',
    icon: GearIcon,
    iconClass: 'bg-[#EFF6FF] text-[#1877F2]',
    to: '/settings/preferences',
    permission: 'settings:read',
  },
  {
    title: 'Security',
    subtitle: 'Two-factor authentication & audit logs',
    icon: ShieldCheckIcon,
    iconClass: 'bg-[#FEF2F2] text-[#DC2626]',
    to: '/settings/security',
    permission: 'settings:admin',
  },
]

function CategoryContent({ category }: { category: Category }) {
  const Icon = category.icon
  return (
    <div className="flex items-center gap-4 p-5 sm:p-6">
      <span
        className={cn(
          'flex size-12 shrink-0 items-center justify-center rounded-xl',
          category.iconClass,
        )}
      >
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="truncate font-bold text-heading">{category.title}</p>
        <p className="mt-0.5 truncate text-xs text-text-muted">{category.subtitle}</p>
      </div>
    </div>
  )
}

export function SettingsCategoryGrid() {
  const { can, user } = useAuth()
  const isSuperadmin = user?.role === 'superadmin'
  const visible = categories.filter((category) => {
    if (isSuperadmin && category.companyOnly) return false
    if (category.to === '/settings/users' && !isCompanyHubEnabled(user?.enabledHubs, 'people')) {
      return false
    }
    return can(category.permission)
  })

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
      {visible.map((category) => (
        <Card
          key={category.title}
          className="transition-shadow hover:shadow-[var(--shadow-card)]"
        >
          <Link to={category.to} className="block">
            <CategoryContent category={category} />
          </Link>
        </Card>
      ))}
    </div>
  )
}
