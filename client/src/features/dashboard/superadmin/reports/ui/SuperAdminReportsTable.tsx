import { Link } from 'react-router-dom'
import { ComingSoonState } from '@/features/dashboard/ui/ComingSoonState'
import { reportDetailPath } from '@/features/dashboard/superadmin/reports/lib/report-month'
import type { PlatformReport } from '@/features/dashboard/superadmin/reports/model/types'
import { DownloadIcon, FileTextIcon } from '@/features/platform/ui/icons'
import { Card } from '@/shared/ui/Card'

function ReportNameCell({ report, month }: { report: PlatformReport; month: string }) {
  return (
    <Link to={reportDetailPath(report.id, month)} className="group flex min-w-0 items-center gap-2.5">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#1877F2]">
        <FileTextIcon />
      </span>
      <span className="truncate font-semibold text-heading group-hover:text-primary">
        {report.name}
      </span>
    </Link>
  )
}

function DownloadButton({
  report,
  downloading,
  onDownload,
}: {
  report: PlatformReport
  downloading: boolean
  onDownload: (report: PlatformReport) => void
}) {
  return (
    <button
      type="button"
      disabled={downloading}
      onClick={() => onDownload(report)}
      className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#BFDBFE] bg-[#EFF6FF] px-3.5 text-xs font-semibold text-[#1877F2] hover:opacity-90 disabled:opacity-50"
    >
      <DownloadIcon />
      {downloading ? 'Downloading…' : 'Download'}
    </button>
  )
}

type SuperAdminReportsTableProps = {
  reports: PlatformReport[]
  month: string
  downloadingId?: string | null
  onDownload: (report: PlatformReport) => void
  isFiltered?: boolean
}

export function SuperAdminReportsTable({
  reports,
  month,
  downloadingId,
  onDownload,
  isFiltered = false,
}: SuperAdminReportsTableProps) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between gap-2 border-b border-border-card px-4 py-4 sm:px-6">
        <h3 className="text-base font-bold text-heading sm:text-lg">Recent Reports</h3>
        <Link to="/reports" className="shrink-0 text-sm font-semibold text-primary hover:opacity-90">
          View All Reports
        </Link>
      </div>

      {reports.length === 0 ? (
        <div className="p-4 sm:p-6">
          <ComingSoonState
            title={isFiltered ? 'No reports found' : 'No reports yet'}
            description={
              isFiltered
                ? 'Try adjusting your search or filters.'
                : 'Platform reports will appear here once generated.'
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
                <ReportNameCell report={report} month={month} />
                <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-border-card pt-3">
                  <div>
                    <dt className="text-[11px] font-medium uppercase tracking-wide text-text-muted">
                      Category
                    </dt>
                    <dd className="mt-1 truncate text-sm font-medium text-heading">
                      {report.category}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-medium uppercase tracking-wide text-text-muted">
                      Generated On
                    </dt>
                    <dd className="mt-1 truncate text-sm font-medium text-heading">
                      {report.generatedOn}
                    </dd>
                  </div>
                </dl>
                <div className="mt-4 flex justify-end border-t border-border-card pt-3">
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
            <table className="w-full table-fixed text-left text-sm">
              <colgroup>
                <col className="w-[36%]" />
                <col className="w-[20%]" />
                <col className="w-[24%]" />
                <col className="w-[20%]" />
              </colgroup>
              <thead>
                <tr className="bg-table-header text-xs font-semibold uppercase tracking-wide text-heading">
                  <th className="px-6 py-3.5">Report Name</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Generated On</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id} className="border-t border-border-card">
                    <td className="px-6 py-4">
                      <ReportNameCell report={report} month={month} />
                    </td>
                    <td className="truncate px-6 py-4 text-heading">{report.category}</td>
                    <td className="truncate px-6 py-4 text-heading">{report.generatedOn}</td>
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
