import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  REFRESH_TOKEN_COOKIE_NAME: z.string().default('refreshToken'),
  COOKIE_SECURE: z
    .string()
    .default('false')
    .transform((v) => v === 'true'),
  COOKIE_SAME_SITE: z.enum(['strict', 'lax', 'none']).default('lax'),
  CORS_ORIGIN: z.string().url().default('http://localhost:5173'),
  APP_URL: z.string().url().default('http://localhost:5173'),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  MAIL_FROM: z.string().email().optional(),
  INVITE_TOKEN_EXPIRES_HOURS: z.coerce.number().int().positive().default(72),
  RESET_TOKEN_EXPIRES_HOURS: z.coerce.number().int().positive().default(24),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  CLOUDINARY_UPLOAD_FOLDER: z.string().default('bizflow/avatars'),
  CLOUDINARY_TASKS_FOLDER: z.string().default('bizflow/tasks'),
  CLOUDINARY_LOGOS_FOLDER: z.string().default('bizflow/logos'),
  CLOUDINARY_PROJECTS_FOLDER: z.string().default('bizflow/projects'),
  CLOUDINARY_EXPENSES_FOLDER: z.string().default('bizflow/expenses'),
  /** Web Push VAPID keys — optional; generate with `npx web-push generate-vapid-keys` */
  VAPID_PUBLIC_KEY: z.string().optional(),
  VAPID_PRIVATE_KEY: z.string().optional(),
  VAPID_SUBJECT: z.string().default('mailto:noreply@bizflow.com'),
})

export type Env = z.infer<typeof envSchema>

function loadEnv(): Env {
  const result = envSchema.safeParse(process.env)

  if (!result.success) {
    const formatted = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n')
    console.error(`Invalid environment variables:\n${formatted}`)
    process.exit(1)
  }

  return result.data
}

export const env = loadEnv()

export function isMailConfigured(): boolean {
  return Boolean(env.SMTP_HOST && env.SMTP_PORT && env.MAIL_FROM)
}

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET,
  )
}

export function isPushConfigured(): boolean {
  return Boolean(env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY)
}
