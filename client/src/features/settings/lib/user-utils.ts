import type { ManagedUser, UserListFilters } from '@/features/settings/model/types'

export function filterUsers(users: ManagedUser[], filters: UserListFilters): ManagedUser[] {
  const q = filters.search.trim().toLowerCase()

  return users.filter((user) => {
    const matchesSearch =
      !q ||
      user.name.toLowerCase().includes(q) ||
      user.email.toLowerCase().includes(q)

    const matchesRole =
      filters.role === 'All Roles' || user.role.toLowerCase() === filters.role.toLowerCase()
    const matchesStatus =
      filters.status === 'All Status' ||
      user.status === filters.status.toLowerCase()
    const matchesDepartment =
      filters.department === 'All Departments' || user.department === filters.department

    return matchesSearch && matchesRole && matchesStatus && matchesDepartment
  })
}
