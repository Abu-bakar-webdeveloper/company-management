import { Link } from 'react-router-dom'
import { ComingSoonState } from '@/features/dashboard/ui/ComingSoonState'
import { moduleLabels } from '@/features/reports/model/reportsData'
import type { RecentReport } from '@/features/reports/model/types'
import { DownloadIcon, FileTextIcon } from '@/features/reports/ui/icons'
import { ReportStatusBadge } from '@/features/reports/ui/ReportStatusBadge'
import { Card } from '@/shared/ui/Card'

type RecentReportsTableProps = {
  reports: RecentReport[]
  downloadingId?: string | null
  onDownload: (report: RecentReport) => void
  isFiltered?: boolean
}

function DownloadButton({
  report,
  downloading,
  onDownload,
}: {
  report: RecentReport
  downloading: boolean
  onDownload: (report: RecentReport) => void
}) {
  return (
    <button
      type="button"
      disabled={report.status !== 'ready' || downloading}
      onClick={() => onDownload(report)}
      className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#bfdbfe] bg-[#eff6ff] px-3.5 text-xs font-semibold text-[#1877f2] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      aria-label={`Download ${report.name}`}
    >
      <DownloadIcon />
      {downloading ? 'Downloading…' : 'Download'}
    </button>
  )
}

function ReportNameCell({ report }: { report: RecentReport }) {
  return (
    <Link to={`/reports/${report.id}`} className="group flex min-w-0 items-center gap-2.5">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#eff6ff] text-[#1877f2]">
        <FileTextIcon />
      </span>
      <span className="truncate font-semibold text-heading group-hover:text-primary">
        {report.name}
      </span>
    </Link>
  )
}

export function RecentReportsTable({
  reports,
  downloadingId,
  onDownload,
  isFiltered = false,
}: RecentReportsTableProps) {
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-2 border-b border-border-card px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <h3 className="text-base font-bold text-heading sm:text-lg">Recent Reports</h3>
        {reports.length > 0 ? (
          <Link to="/reports" className="w-fit text-sm font-semibold text-primary hover:opacity-90">
            View All Reports
          </Link>
        ) : null}
      </div>

      {reports.length === 0 ? (
        <div className="p-4 sm:p-6">
          <ComingSoonState
            title={isFiltered ? 'No reports found' : 'No reports yet'}
            description={
              isFiltered
                ? 'Try adjusting your search or filters.'
                : 'Generated reports will appear here.'
            }
            minHeight="min-h-[280px]"
          />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2 xl:hidden sm:p-6">
            {reports.map((report) => (
              <div
                key={report.id}
                className="rounded-xl border border-border-card bg-surface p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <ReportNameCell report={report} />
                  <ReportStatusBadge status={report.status} />
                </div>
                <dl className="mt-3 space-y-2 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-text-muted">Module</dt>
                    <dd className="text-heading">{moduleLabels[report.module]}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-text-muted">Date</dt>
                    <dd className="text-heading">{report.date}</dd>
                  </div>
                </dl>
                <div className="mt-3 flex justify-end">
                  <DownloadButton
                    report={report}
                    downloading={downloadingId === report.id}
                    onDownload={onDownload}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto xl:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-table-header text-xs font-semibold uppercase tracking-wide text-heading">
                  <th className="px-6 py-3.5">Report Name</th>
                  <th className="px-6 py-3.5">Module</th>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id} className="border-t border-border-card">
                    <td className="px-6 py-4">
                      <ReportNameCell report={report} />
                    </td>
                    <td className="px-6 py-4 text-heading">{moduleLabels[report.module]}</td>
                    <td className="px-6 py-4 text-heading">{report.date}</td>
                    <td className="px-6 py-4">
                      <ReportStatusBadge status={report.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end">
                        <DownloadButton
                          report={report}
                          downloading={downloadingId === report.id}
                          onDownload={onDownload}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Card>
  )
}
