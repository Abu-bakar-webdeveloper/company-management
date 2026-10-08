import { Types } from 'mongoose'
import { AppError } from '../../utils/AppError.js'
import { User } from '../auth/user.model.js'

const MAX_MANAGER_CHAIN_DEPTH = 20

/**
 * Ensures managerId is a valid same-company user, not the user themselves,
 * and does not create a reporting cycle.
 */
export async function assertValidManagerAssignment(params: {
  managerId: string
  companyId: string
  userId?: string
}): Promise<void> {
  const { managerId, companyId, userId } = params

  if (userId && managerId === userId) {
    throw new AppError('A user cannot be their own manager', 400, 'INVALID_MANAGER')
  }

  if (!Types.ObjectId.isValid(managerId)) {
    throw new AppError('Invalid manager id', 400, 'INVALID_MANAGER')
  }

  const manager = await User.findById(managerId)
  if (!manager) {
    throw new AppError('Manager not found', 404, 'MANAGER_NOT_FOUND')
  }

  if (manager.companyId?.toString() !== companyId) {
    throw new AppError('Manager must belong to the same company', 400, 'INVALID_MANAGER')
  }

  if (manager.role !== 'manager') {
    throw new AppError('Assigned manager must have the manager role', 400, 'INVALID_MANAGER')
  }

  if (!userId) return

  // Walk the manager chain starting from the proposed manager; reject if we hit the user.
  let walkId: string | null = managerId
  for (let depth = 0; depth < MAX_MANAGER_CHAIN_DEPTH && walkId; depth += 1) {
    if (walkId === userId) {
      throw new AppError(
        'This assignment would create a reporting cycle',
        400,
        'MANAGER_CYCLE',
      )
    }

    const ancestor = await User.findById(walkId).select({ managerId: 1 }).exec()
    if (!ancestor?.managerId) {
      walkId = null
    } else {
      walkId = ancestor.managerId.toString()
    }
  }
}
