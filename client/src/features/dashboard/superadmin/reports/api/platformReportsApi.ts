import { apiClient } from '@/shared/api/axios'
import type {
  PlatformReport,
  PlatformReportCompany,
  SuperAdminReportDetail,
  SuperAdminReportMetric,
} from '@/features/dashboard/superadmin/reports/model/types'
import type { ExportFormat } from '@/features/reports/model/types'
import type { PlatformStatCardData } from '@/features/platform/model/companiesData'

export type PlatformCharts = {
  revenueTrend: { month: string; value: number }[]
  subscriptionBreakdown: { label: string; percent: number; color: string; dot: string }[]
}

export type PlatformReportDetailResponse = SuperAdminReportDetail & {
  charts: PlatformCharts
}

function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function filenameFromDisposition(header: string | undefined, fallback: string): string {
  if (!header) return fallback
  const match = /filename="?([^"]+)"?/i.exec(header)
  return match?.[1] ?? fallback
}

type MonthParam = { month?: string }

export const platformReportsApi = {
  async getOverviewStats(month?: string): Promise<PlatformStatCardData[]> {
    const { data } = await apiClient.get<{ stats: PlatformStatCardData[] }>(
      '/reports/platform/overview',
      { params: month ? { month } : undefined },
    )
    return data.stats
  },

  async list(month?: string): Promise<PlatformReport[]> {
    const { data } = await apiClient.get<{ reports: PlatformReport[] }>('/reports/platform', {
      params: month ? { month } : undefined,
    })
    return data.reports
  },

  async getById(id: string, month?: string): Promise<PlatformReportDetailResponse> {
    const { data } = await apiClient.get<{ report: PlatformReportDetailResponse }>(
      `/reports/platform/${id}`,
      { params: month ? { month } : undefined },
    )
    return data.report
  },

  async download(id: string, format: ExportFormat, month?: string): Promise<void> {
    const response = await apiClient.get<Blob>(`/reports/platform/${id}/download`, {
      params: { format, ...(month ? { month } : {}) } satisfies MonthParam & { format: ExportFormat },
      responseType: 'blob',
    })

    const contentType = String(response.headers['content-type'] ?? '')
    if (contentType.includes('application/json')) {
      const text = await response.data.text()
      const parsed = JSON.parse(text) as { error?: { message?: string } }
      throw new Error(parsed.error?.message ?? 'Download failed')
    }

    const ext = format === 'excel' ? 'xlsx' : format
    const filename = filenameFromDisposition(
      response.headers['content-disposition'] as string | undefined,
      `platform-${id}.${ext}`,
    )
    triggerBlobDownload(response.data, filename)
  },
}

export type { PlatformReportCompany, SuperAdminReportMetric }
