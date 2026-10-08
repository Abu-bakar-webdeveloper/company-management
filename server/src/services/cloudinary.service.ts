import { createHash } from 'node:crypto'
import { env, isCloudinaryConfigured } from '../config/env.js'
import { AppError } from '../utils/AppError.js'

export type CloudinaryUploadPurpose = 'avatar' | 'task' | 'logo' | 'project' | 'expense'

export type CloudinarySignParams = {
  cloudName: string
  apiKey: string
  timestamp: number
  signature: string
  folder: string
  purpose: CloudinaryUploadPurpose
}

function assertCloudinaryConfigured(): void {
  if (!isCloudinaryConfigured()) {
    throw new AppError(
      'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.',
      503,
      'CLOUDINARY_NOT_CONFIGURED',
    )
  }
}

/** Cloudinary signed-upload signature (SHA-1 of sorted params + API secret). */
export function signCloudinaryParams(params: Record<string, string | number>): string {
  assertCloudinaryConfigured()

  const toSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&')

  return createHash('sha1')
    .update(toSign + env.CLOUDINARY_API_SECRET!)
    .digest('hex')
}

function createUploadSignature(
  folder: string,
  purpose: CloudinaryUploadPurpose,
): CloudinarySignParams {
  assertCloudinaryConfigured()

  const timestamp = Math.round(Date.now() / 1000)
  const signature = signCloudinaryParams({ folder, timestamp })

  return {
    cloudName: env.CLOUDINARY_CLOUD_NAME!,
    apiKey: env.CLOUDINARY_API_KEY!,
    timestamp,
    signature,
    folder,
    purpose,
  }
}

export function createAvatarUploadSignature(): CloudinarySignParams {
  return createUploadSignature(env.CLOUDINARY_UPLOAD_FOLDER, 'avatar')
}

export function createTaskUploadSignature(): CloudinarySignParams {
  return createUploadSignature(env.CLOUDINARY_TASKS_FOLDER, 'task')
}

export function createLogoUploadSignature(): CloudinarySignParams {
  return createUploadSignature(env.CLOUDINARY_LOGOS_FOLDER, 'logo')
}

export function createProjectUploadSignature(): CloudinarySignParams {
  return createUploadSignature(env.CLOUDINARY_PROJECTS_FOLDER, 'project')
}

export function createExpenseUploadSignature(): CloudinarySignParams {
  return createUploadSignature(env.CLOUDINARY_EXPENSES_FOLDER, 'expense')
}

export function createUploadSignatureForPurpose(
  purpose: CloudinaryUploadPurpose,
): CloudinarySignParams {
  if (purpose === 'task') return createTaskUploadSignature()
  if (purpose === 'logo') return createLogoUploadSignature()
  if (purpose === 'project') return createProjectUploadSignature()
  if (purpose === 'expense') return createExpenseUploadSignature()
  return createAvatarUploadSignature()
}

export function isValidCloudinaryUrl(url: string): boolean {
  if (!env.CLOUDINARY_CLOUD_NAME) return false
  const prefix = `https://res.cloudinary.com/${env.CLOUDINARY_CLOUD_NAME}/`
  return url.startsWith(prefix) && url.length <= 2048
}

export function isValidCloudinaryAvatarUrl(url: string): boolean {
  return isValidCloudinaryUrl(url)
}

export function isValidCloudinaryTaskUrl(url: string): boolean {
  return isValidCloudinaryUrl(url)
}
