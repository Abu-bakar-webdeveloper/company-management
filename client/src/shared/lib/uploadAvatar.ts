import { apiClient } from '@/shared/api/axios'
import { ApiError } from '@/shared/api/errors'

export type CloudinaryUploadPurpose = 'avatar' | 'task' | 'logo' | 'project' | 'expense'

export type CloudinarySignResult = {
  cloudName: string
  apiKey: string
  timestamp: number
  signature: string
  folder: string
  purpose?: CloudinaryUploadPurpose
}

type CloudinaryUploadResponse = {
  secure_url?: string
  public_id?: string
  error?: { message?: string }
}

export type CloudinaryUploadResult = {
  url: string
  publicId: string | null
}

export async function requestCloudinarySign(
  purpose: CloudinaryUploadPurpose = 'avatar',
): Promise<CloudinarySignResult> {
  const { data } = await apiClient.post<CloudinarySignResult>('/uploads/cloudinary-sign', {
    purpose,
  })
  return data
}

async function uploadFileToCloudinary(
  file: File,
  purpose: CloudinaryUploadPurpose,
  resourceType: 'image' | 'auto' = 'image',
): Promise<CloudinaryUploadResult> {
  const sign = await requestCloudinarySign(purpose)

  const formData = new FormData()
  formData.append('file', file)
  formData.append('api_key', sign.apiKey)
  formData.append('timestamp', String(sign.timestamp))
  formData.append('signature', sign.signature)
  formData.append('folder', sign.folder)

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${sign.cloudName}/${resourceType}/upload`,
    {
      method: 'POST',
      body: formData,
    },
  )

  const payload = (await response.json()) as CloudinaryUploadResponse

  if (!response.ok || !payload.secure_url) {
    throw new ApiError(
      payload.error?.message ?? 'Unable to upload photo. Please try again.',
      response.status || 502,
      'CLOUDINARY_UPLOAD_FAILED',
    )
  }

  return {
    url: payload.secure_url,
    publicId: payload.public_id ?? null,
  }
}

/**
 * Signed browser upload for employee avatars.
 * Returns the HTTPS `secure_url` to store on the user.
 */
export async function uploadAvatarToCloudinary(file: File): Promise<string> {
  const result = await uploadFileToCloudinary(file, 'avatar')
  return result.url
}

/** Signed browser upload for company logos. */
export async function uploadLogoToCloudinary(file: File): Promise<string> {
  const result = await uploadFileToCloudinary(file, 'logo')
  return result.url
}

/** Signed browser upload for task screenshots / attachments. */
export async function uploadTaskImageToCloudinary(
  file: File,
): Promise<CloudinaryUploadResult> {
  return uploadFileToCloudinary(file, 'task')
}

/** Signed browser upload for project files (docs, images, PDFs). */
export async function uploadProjectFileToCloudinary(
  file: File,
): Promise<CloudinaryUploadResult> {
  return uploadFileToCloudinary(file, 'project', 'auto')
}

/** Signed browser upload for expense receipts (docs, images, PDFs). */
export async function uploadExpenseReceiptToCloudinary(
  file: File,
): Promise<CloudinaryUploadResult> {
  return uploadFileToCloudinary(file, 'expense', 'auto')
}
