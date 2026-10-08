import type {
  GrowthPoint,
  LeaveBreakdownItem,
  RatingSlice,
  RecentReport,
  ReportDetail,
  ReportModule,
  ReportRecord,
  ReportsOverviewFilters,
  ReportsOverviewStats,
  TrendBar,
} from '@/features/reports/model/types'

export const reportsOverviewStats: ReportsOverviewStats = {
  employees: 120,
  projects: 45,
  leaves: 18,
  teams: 4,
}

export const employeeGrowthData: GrowthPoint[] = [
  { month: 'Jan', value: 80 },
  { month: 'Feb', value: 88 },
  { month: 'Mar', value: 96 },
  { month: 'Apr', value: 108 },
  { month: 'May', value: 120 },
]

export const expenseTrendData: TrendBar[] = [
  { month: 'Jan', value: 18 },
  { month: 'Feb', value: 32 },
  { month: 'Mar', value: 24 },
  { month: 'Apr', value: 48 },
  { month: 'May', value: 80 },
]

export const leavesBreakdown: LeaveBreakdownItem[] = [
  { label: 'Approved', count: 12, percent: 65, color: '#00B67A' },
  { label: 'Pending', count: 4, percent: 25, color: '#1877F2' },
  { label: 'Rejected', count: 2, percent: 10, color: '#DC2626' },
]

export const performanceDistribution: RatingSlice[] = [
  { name: 'Excellent', value: 70, color: '#00B67A' },
  { name: 'Good', value: 20, color: '#1877F2' },
  { name: 'Others', value: 10, color: '#CBD5E1' },
]

export const performanceAvgRating = 4.2

export const recentReports: RecentReport[] = [
  { id: 'rep-001', name: 'Expense Report', module: 'expenses', date: 'Apr 2024', status: 'failed', exportFormat: 'pdf' },
  { id: 'rep-002', name: 'Leave Report', module: 'leaves', date: 'Jun 2024', status: 'ready', exportFormat: 'excel' },
  { id: 'rep-003', name: 'Perf Report', module: 'performance', date: 'Jul 2024', status: 'ready', exportFormat: 'pdf' },
  { id: 'rep-004', name: 'Project Status', module: 'projects', date: 'Oct 2024', status: 'processing', exportFormat: 'excel' },
  { id: 'rep-005', name: 'Employee Audit', module: 'employees', date: 'Sep 2024', status: 'ready', exportFormat: 'pdf' },
]

export const moduleLabels: Record<ReportModule, string> = {
  employees: 'Employees',
  projects: 'Projects',
  leaves: 'Leaves',
  expenses: 'Expenses',
  performance: 'Performance',
}

export const departmentOptions = [
  'All Departments',
  'Engineering',
  'Design',
  'Marketing',
  'Sales',
  'HR',
]

export const employeeOptions = ['All Employee', 'John Doe', 'Sarah Khan', 'Naeem Ashraf', 'Ali Raza']

export const statusOptions = ['All Status', 'Approved', 'Pending', 'Rejected']

export const projectOptions = ['All Projects', 'BizFlow Mobile', 'CRM Revamp', 'Website Redesign']

export const ratingOptions = ['All Ratings', '4+ Stars', '3-4 Stars', 'Below 3']

export const groupByOptions = ['Department', 'Employee', 'Project', 'Month']

const leaveTrend: TrendBar[] = [
  { month: 'Jan', value: 8 },
  { month: 'Feb', value: 12 },
  { month: 'Mar', value: 10 },
  { month: 'Apr', value: 16 },
  { month: 'May', value: 14 },
  { month: 'Jun', value: 18 },
  { month: 'Jul', value: 11 },
]

const leaveCategories = [
  { name: 'Annual', percent: 45, color: '#7C3AED' },
  { name: 'Sick', percent: 30, color: '#1877F2' },
  { name: 'Casual', percent: 15, color: '#EA580C' },
  { name: 'Unpaid', percent: 10, color: '#00B67A' },
]

const leaveRecords: ReportRecord[] = [
  {
    id: 'rec-01',
    date: 'Jun 2024',
    category: 'Annual',
    employeeName: 'Naeem Ashraf',
    employeeAvatar: 'https://i.pravatar.cc/64?img=12',
    metric: 5,
    metricFormat: 'days',
    status: 'approved',
    detail: 'Family trip',
  },
  {
    id: 'rec-02',
    date: 'Jun 2024',
    category: 'Sick',
    employeeName: 'John Doe',
    employeeAvatar: 'https://i.pravatar.cc/64?img=11',
    metric: 2,
    metricFormat: 'days',
    status: 'approved',
    detail: 'Flu recovery',
  },
  {
    id: 'rec-03',
    date: 'Jul 2024',
    category: 'Casual',
    employeeName: 'Sarah Khan',
    employeeAvatar: 'https://i.pravatar.cc/64?img=5',
    metric: 1,
    metricFormat: 'days',
    status: 'pending',
    detail: 'Personal errand',
  },
  {
    id: 'rec-04',
    date: 'Jul 2024',
    category: 'Annual',
    employeeName: 'Ali Raza',
    employeeAvatar: 'https://i.pravatar.cc/64?img=15',
    metric: 3,
    metricFormat: 'days',
    status: 'rejected',
    detail: 'Overlap with sprint',
  },
  {
    id: 'rec-05',
    date: 'Aug 2024',
    category: 'Unpaid',
    employeeName: 'John Doe',
    employeeAvatar: 'https://i.pravatar.cc/64?img=11',
    metric: 4,
    metricFormat: 'days',
    status: 'approved',
    detail: 'Extended leave',
  },
  {
    id: 'rec-06',
    date: 'Aug 2024',
    category: 'Sick',
    employeeName: 'Sarah Khan',
    employeeAvatar: 'https://i.pravatar.cc/64?img=5',
    metric: 1,
    metricFormat: 'days',
    status: 'pending',
    detail: 'Medical appointment',
  },
]

const performanceRecords: ReportRecord[] = [
  {
    id: 'perf-01',
    date: 'Jul 2024',
    category: 'Engineering',
    employeeName: 'Naeem Ashraf',
    employeeAvatar: 'https://i.pravatar.cc/64?img=12',
    metric: 4.5,
    metricFormat: 'rating',
    status: 'completed',
    detail: 'Exceeded delivery goals',
  },
  {
    id: 'perf-02',
    date: 'Jul 2024',
    category: 'Design',
    employeeName: 'Sarah Khan',
    employeeAvatar: 'https://i.pravatar.cc/64?img=5',
    metric: 4.2,
    metricFormat: 'rating',
    status: 'completed',
    detail: 'Strong design system work',
  },
  {
    id: 'perf-03',
    date: 'Jul 2024',
    category: 'Engineering',
    employeeName: 'John Doe',
    employeeAvatar: 'https://i.pravatar.cc/64?img=11',
    metric: 3.8,
    metricFormat: 'rating',
    status: 'completed',
    detail: 'Solid sprint contribution',
  },
  {
    id: 'perf-04',
    date: 'Jun 2024',
    category: 'Marketing',
    employeeName: 'Ali Raza',
    employeeAvatar: 'https://i.pravatar.cc/64?img=15',
    metric: 4.0,
    metricFormat: 'rating',
    status: 'completed',
    detail: 'Campaign ownership',
  },
]

const projectRecords: ReportRecord[] = [
  {
    id: 'proj-01',
    date: 'Oct 2024',
    category: 'BizFlow Mobile',
    employeeName: 'Naeem Ashraf',
    employeeAvatar: 'https://i.pravatar.cc/64?img=12',
    metric: 72,
    metricFormat: 'percent',
    status: 'active',
    detail: 'Milestone 3 in progress',
  },
  {
    id: 'proj-02',
    date: 'Oct 2024',
    category: 'CRM Revamp',
    employeeName: 'Sarah Khan',
    employeeAvatar: 'https://i.pravatar.cc/64?img=5',
    metric: 100,
    metricFormat: 'percent',
    status: 'completed',
    detail: 'Shipped to production',
  },
  {
    id: 'proj-03',
    date: 'Sep 2024',
    category: 'Website Redesign',
    employeeName: 'John Doe',
    employeeAvatar: 'https://i.pravatar.cc/64?img=11',
    metric: 45,
    metricFormat: 'percent',
    status: 'active',
    detail: 'Design handoff pending',
  },
]

const employeeRecords: ReportRecord[] = [
  {
    id: 'emp-01',
    date: 'Sep 2024',
    category: 'Engineering',
    employeeName: 'Naeem Ashraf',
    employeeAvatar: 'https://i.pravatar.cc/64?img=12',
    metric: null,
    metricFormat: 'none',
    status: 'active',
    detail: 'Senior Developer',
  },
  {
    id: 'emp-02',
    date: 'Sep 2024',
    category: 'Design',
    employeeName: 'Sarah Khan',
    employeeAvatar: 'https://i.pravatar.cc/64?img=5',
    metric: null,
    metricFormat: 'none',
    status: 'active',
    detail: 'Product Designer',
  },
  {
    id: 'emp-03',
    date: 'Aug 2024',
    category: 'Marketing',
    employeeName: 'Ali Raza',
    employeeAvatar: 'https://i.pravatar.cc/64?img=15',
    metric: null,
    metricFormat: 'none',
    status: 'inactive',
    detail: 'On leave of absence',
  },
]

const expenseRecords: ReportRecord[] = [
  {
    id: 'exp-01',
    date: 'Apr 2024',
    category: 'Food',
    employeeName: 'Naeem Ashraf',
    employeeAvatar: 'https://i.pravatar.cc/64?img=12',
    metric: 200,
    metricFormat: 'currency',
    status: 'approved',
    detail: 'Team lunch',
  },
  {
    id: 'exp-02',
    date: 'Apr 2024',
    category: 'Travel',
    employeeName: 'John Doe',
    employeeAvatar: 'https://i.pravatar.cc/64?img=11',
    metric: 1200,
    metricFormat: 'currency',
    status: 'approved',
    detail: 'Client meeting',
  },
  {
    id: 'exp-03',
    date: 'Mar 2024',
    category: 'Office',
    employeeName: 'Sarah Khan',
    employeeAvatar: 'https://i.pravatar.cc/64?img=5',
    metric: 450,
    metricFormat: 'currency',
    status: 'pending',
    detail: 'Supplies',
  },
  {
    id: 'exp-04',
    date: 'Mar 2024',
    category: 'Software',
    employeeName: 'Ali Raza',
    employeeAvatar: 'https://i.pravatar.cc/64?img=15',
    metric: 300,
    metricFormat: 'currency',
    status: 'rejected',
    detail: 'Annual license',
  },
]

const reportDetails: Record<string, ReportDetail> = {
  'rep-001': {
    id: 'rep-001',
    title: 'Expense Report (Apr 2024)',
    period: 'Apr 2024',
    module: 'expenses',
    status: 'failed',
    exportFormat: 'pdf',
    stats: {
      totalRecords: 24,
      secondaryLabel: 'Total Amount',
      secondaryValue: 45000,
      secondaryFormat: 'currency',
      avgLabel: 'Avg Value',
      avgValue: 375,
      avgFormat: 'currency',
      status: 'Failed',
    },
    trend: expenseTrendData.map((p) => ({ month: p.month, value: p.value })),
    categories: [
      { name: 'Travel', percent: 45, color: '#7C3AED' },
      { name: 'Food', percent: 30, color: '#1877F2' },
      { name: 'Equipment', percent: 25, color: '#EA580C' },
    ],
    records: expenseRecords,
  },
  'rep-002': {
    id: 'rep-002',
    title: 'Leaves Report (Jun 2024)',
    period: 'Jun 2024',
    module: 'leaves',
    status: 'ready',
    exportFormat: 'excel',
    stats: {
      totalRecords: 18,
      secondaryLabel: 'Total Days',
      secondaryValue: 42,
      secondaryFormat: 'days',
      avgLabel: 'Avg Days',
      avgValue: 2.3,
      avgFormat: 'days',
      status: 'Completed',
    },
    trend: leaveTrend,
    categories: leaveCategories,
    records: leaveRecords,
  },
  'rep-003': {
    id: 'rep-003',
    title: 'Performance Report (Jul 2024)',
    period: 'Jul 2024',
    module: 'performance',
    status: 'ready',
    exportFormat: 'pdf',
    stats: {
      totalRecords: 32,
      secondaryLabel: 'Avg Rating',
      secondaryValue: 4.2,
      secondaryFormat: 'rating',
      avgLabel: 'Efficiency',
      avgValue: 86,
      avgFormat: 'percent',
      status: 'Completed',
    },
    trend: leaveTrend,
    categories: [
      { name: 'Excellent', percent: 70, color: '#00B67A' },
      { name: 'Good', percent: 20, color: '#1877F2' },
      { name: 'Others', percent: 10, color: '#CBD5E1' },
    ],
    records: performanceRecords,
  },
  'rep-004': {
    id: 'rep-004',
    title: 'Project Status (Oct 2024)',
    period: 'Oct 2024',
    module: 'projects',
    status: 'processing',
    exportFormat: 'excel',
    stats: {
      totalRecords: 12,
      secondaryLabel: 'Avg Progress',
      secondaryValue: 68,
      secondaryFormat: 'percent',
      avgLabel: 'Active Projects',
      avgValue: 8,
      avgFormat: 'number',
      status: 'Processing',
    },
    trend: leaveTrend,
    categories: [
      { name: 'Active', percent: 55, color: '#1877F2' },
      { name: 'Completed', percent: 35, color: '#00B67A' },
      { name: 'On Hold', percent: 10, color: '#EA580C' },
    ],
    records: projectRecords,
  },
  'rep-005': {
    id: 'rep-005',
    title: 'Employee Audit (Sep 2024)',
    period: 'Sep 2024',
    module: 'employees',
    status: 'ready',
    exportFormat: 'pdf',
    stats: {
      totalRecords: 120,
      secondaryLabel: 'Active',
      secondaryValue: 108,
      secondaryFormat: 'number',
      avgLabel: 'Departments',
      avgValue: 6,
      avgFormat: 'number',
      status: 'Completed',
    },
    trend: employeeGrowthData.map((p) => ({ month: p.month, value: p.value })),
    categories: [
      { name: 'Engineering', percent: 40, color: '#1877F2' },
      { name: 'Design', percent: 20, color: '#7C3AED' },
      { name: 'Marketing', percent: 25, color: '#EA580C' },
      { name: 'HR', percent: 15, color: '#00B67A' },
    ],
    records: employeeRecords,
  },
}

const fallbackDetail = (id: string): ReportDetail => {
  const report = recentReports.find((r) => r.id === id)
  const base = reportDetails['rep-002']
  return {
    ...base,
    id,
    title: report ? `${report.name} (${report.date})` : `Report (${id})`,
    period: report?.date ?? 'Oct 2024',
    module: report?.module ?? 'leaves',
    status: report?.status ?? 'ready',
    exportFormat: report?.exportFormat ?? 'pdf',
  }
}

export function getReportDetail(id: string): ReportDetail {
  return reportDetails[id] ?? fallbackDetail(id)
}

export function filterRecentReports(
  reports: RecentReport[],
  filters: ReportsOverviewFilters,
): RecentReport[] {
  return reports.filter((report) => {
    const matchesModule =
      filters.module === 'All Modules' || moduleLabels[report.module] === filters.module
    // Department / dateRange are stubs until backend exists — kept for filter plumbing.
    return matchesModule
  })
}
