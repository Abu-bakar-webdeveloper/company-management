import { apiClient } from '@/shared/api/axios'
import type {
  ExportFormat,
  GenerateReportResult,
  GenerateReportValues,
  RecentReport,
  ReportDetail,
  ReportOptions,
  ReportsOverviewCharts,
  ReportsOverviewFilters,
  ReportsOverviewStats,
} from '@/features/reports/model/types'

function toListParams(filters?: ReportsOverviewFilters): Record<string, string> | undefined {
  if (!filters) return undefined
  return {
    module: filters.module,
    department: filters.department,
    dateRange: filters.dateRange,
  }
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

async function downloadBlob(
  url: string,
  format: ExportFormat,
  fallbackName: string,
): Promise<void> {
  const response = await apiClient.get<Blob>(url, {
    params: { format },
    responseType: 'blob',
  })

  const contentType = String(response.headers['content-type'] ?? '')
  if (contentType.includes('application/json')) {
    const text = await response.data.text()
    let message = 'Download failed'
    try {
      const parsed = JSON.parse(text) as { error?: { message?: string } }
      message = parsed.error?.message ?? message
    } catch {
      // ignore parse errors
    }
    throw new Error(message)
  }

  const filename = filenameFromDisposition(
    response.headers['content-disposition'] as string | undefined,
    fallbackName,
  )
  triggerBlobDownload(response.data, filename)
}

export const reportsApi = {
  async getOverviewStats(filters?: ReportsOverviewFilters): Promise<ReportsOverviewStats> {
    const { data } = await apiClient.get<{ stats: ReportsOverviewStats }>('/reports/overview', {
      params: toListParams(filters),
    })
    return data.stats
  },

  async getOverviewCharts(filters?: ReportsOverviewFilters): Promise<ReportsOverviewCharts> {
    const { data } = await apiClient.get<{ charts: ReportsOverviewCharts }>(
      '/reports/overview/charts',
      { params: toListParams(filters) },
    )
    return data.charts
  },

  async getOptions(): Promise<ReportOptions> {
    const { data } = await apiClient.get<{ options: ReportOptions }>('/reports/options')
    return data.options
  },

  async getRecentReports(filters?: ReportsOverviewFilters): Promise<RecentReport[]> {
    const { data } = await apiClient.get<{ reports: RecentReport[] }>('/reports', {
      params: toListParams(filters),
    })
    return data.reports
  },

  async getById(id: string): Promise<ReportDetail> {
    const { data } = await apiClient.get<{ report: ReportDetail }>(`/reports/${id}`)
    return data.report
  },

  async generate(values: GenerateReportValues): Promise<GenerateReportResult> {
    const { data } = await apiClient.post<GenerateReportResult>('/reports', values)
    return data
  },

  async download(id: string, format: ExportFormat): Promise<void> {
    const ext = format === 'excel' ? 'xlsx' : format
    await downloadBlob(`/reports/${id}/download`, format, `report-${id}.${ext}`)
  },
}
