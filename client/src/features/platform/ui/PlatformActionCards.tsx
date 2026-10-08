import type { ReactNode } from 'react'
import { DeleteIcon, KeyIcon, SuspendIcon } from '@/features/platform/ui/icons'
import { Card } from '@/shared/ui/Card'
import { cn } from '@/shared/lib/cn'

type ActionCard = {
  id: 'reset' | 'suspend' | 'delete'
  title: string
  description: string
  iconBg: string
  iconColor: string
  buttonLabel: string
  buttonClass: string
}

type PlatformActionCardsProps = {
  variant: 'company' | 'subscription'
  disabled?: boolean
  onReset?: () => void
  onSuspend?: () => void
  onDelete?: () => void
}

const companyActions: ActionCard[] = [
  {
    id: 'reset',
    title: 'Reset Access',
    description: 'Reset The company Access to Features',
    iconBg: 'bg-[#EFF6FF]',
    iconColor: 'text-[#1877F2]',
    buttonLabel: 'Reset',
    buttonClass: 'border-[#1877F2] text-[#1877F2] hover:bg-[#EFF6FF]',
  },
  {
    id: 'suspend',
    title: 'Suspend Access',
    description: 'Temporarily disable account access for security.',
    iconBg: 'bg-[#FFF7ED]',
    iconColor: 'text-[#EA580C]',
    buttonLabel: 'Suspend',
    buttonClass: 'border-[#EA580C] text-[#EA580C] hover:bg-[#FFF7ED]',
  },
  {
    id: 'delete',
    title: 'Delete Company',
    description: 'Permanently removes users, projects, tasks, and leaves.',
    iconBg: 'bg-[#FEF2F2]',
    iconColor: 'text-[#DC2626]',
    buttonLabel: 'Delete',
    buttonClass: 'border-[#DC2626] text-[#DC2626] hover:bg-[#FEF2F2]',
  },
]

const subscriptionActions: ActionCard[] = [
  {
    id: 'reset',
    title: 'Reset Subscription',
    description: 'Reset The company Access to Features',
    iconBg: 'bg-[#EFF6FF]',
    iconColor: 'text-[#1877F2]',
    buttonLabel: 'Reset',
    buttonClass: 'border-[#1877F2] text-[#1877F2] hover:bg-[#EFF6FF]',
  },
  {
    id: 'suspend',
    title: 'Suspend Subscription',
    description: 'Temporarily disable account access for security.',
    iconBg: 'bg-[#FFF7ED]',
    iconColor: 'text-[#EA580C]',
    buttonLabel: 'Suspend',
    buttonClass: 'border-[#EA580C] text-[#EA580C] hover:bg-[#FFF7ED]',
  },
  {
    id: 'delete',
    title: 'Delete Company',
    description: 'Permanently removes users, projects, tasks, and leaves.',
    iconBg: 'bg-[#FEF2F2]',
    iconColor: 'text-[#DC2626]',
    buttonLabel: 'Delete',
    buttonClass: 'border-[#DC2626] text-[#DC2626] hover:bg-[#FEF2F2]',
  },
]

const actionIcons: Record<ActionCard['id'], (props: { className?: string }) => ReactNode> = {
  reset: KeyIcon,
  suspend: SuspendIcon,
  delete: DeleteIcon,
}

const actionHandlers: Record<ActionCard['id'], keyof Pick<PlatformActionCardsProps, 'onReset' | 'onSuspend' | 'onDelete'>> = {
  reset: 'onReset',
  suspend: 'onSuspend',
  delete: 'onDelete',
}

export function PlatformActionCards({
  variant,
  disabled = false,
  onReset,
  onSuspend,
  onDelete,
}: PlatformActionCardsProps) {
  const actions = variant === 'company' ? companyActions : subscriptionActions
  const handlers = { onReset, onSuspend, onDelete }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {actions.map((action) => {
        const Icon = actionIcons[action.id]
        const handlerKey = actionHandlers[action.id]
        const onClick = handlers[handlerKey]

        return (
          <Card key={action.id} className="flex flex-col items-center p-6 text-center">
            <span
              className={cn(
                'flex size-14 items-center justify-center rounded-xl',
                action.iconBg,
                action.iconColor,
              )}
            >
              <Icon />
            </span>
            <h3 className="mt-4 text-base font-bold text-heading">{action.title}</h3>
            <p className="mt-2 text-sm text-text-muted">{action.description}</p>
            <button
              type="button"
              disabled={disabled || !onClick}
              onClick={onClick}
              className={cn(
                'mt-5 inline-flex h-10 items-center justify-center rounded-lg border px-6 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50',
                action.buttonClass,
              )}
            >
              {action.buttonLabel}
            </button>
          </Card>
        )
      })}
    </div>
  )
}
