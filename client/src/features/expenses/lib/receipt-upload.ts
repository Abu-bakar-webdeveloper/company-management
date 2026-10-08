import { uploadExpenseReceiptToCloudinary } from '@/shared/lib/uploadAvatar'
import type { ExpenseReceiptPayload } from '@/features/expenses/api/expensesApi'

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export async function uploadExpenseReceipt(file: File): Promise<ExpenseReceiptPayload> {
  const uploaded = await uploadExpenseReceiptToCloudinary(file)
  return {
    url: uploaded.url,
    ...(uploaded.publicId ? { publicId: uploaded.publicId } : {}),
    filename: file.name,
    size: formatBytes(file.size),
    mimeType: file.type || 'application/octet-stream',
  }
}
