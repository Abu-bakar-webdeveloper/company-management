import { User } from '../auth/user.model.js'

export async function resolveActorFullName(userId: string): Promise<string> {
  const user = await User.findById(userId).select('fullName')
  return user?.fullName ?? 'User'
}
