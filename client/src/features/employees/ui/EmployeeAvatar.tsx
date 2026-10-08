import { UserAvatar, type UserAvatarProps } from '@/shared/ui/UserAvatar'

type EmployeeAvatarProps = Pick<UserAvatarProps, 'name' | 'avatar' | 'className'> & {
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap = {
  sm: 'sm',
  md: 'lg',
  lg: 'xl',
} as const satisfies Record<NonNullable<EmployeeAvatarProps['size']>, UserAvatarProps['size']>

export function EmployeeAvatar({ name, avatar, size = 'sm', className }: EmployeeAvatarProps) {
  return <UserAvatar name={name} avatar={avatar} size={sizeMap[size]} className={className} />
}
