import 'dotenv/config'
import { connectDB, disconnectDB } from '../db/connect.js'
import { User } from '../features/auth/user.model.js'

const SEED_USERS = [
  {
    email: 'superadmin@bizflow.com',
    password: 'SuperAdmin123!',
    fullName: 'Platform Superadmin',
    role: 'superadmin' as const,
    status: 'active' as const,
    companyId: null,
  },
]

async function seed() {
  await connectDB()

  for (const seedUser of SEED_USERS) {
    const exists = await User.findOne({ email: seedUser.email })
    if (exists) {
      console.log(`Skipped (exists): ${seedUser.email}`)
      continue
    }

    await User.create(seedUser)
    console.log(`Created: ${seedUser.email}`)
  }

  await disconnectDB()
  console.log('Seed complete')
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
