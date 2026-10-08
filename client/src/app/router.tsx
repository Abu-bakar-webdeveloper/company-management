import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { AppLayout } from '@/app/layouts/AppLayout'
import {
  ActiveAccountRoute,
  ForgotPasswordPage,
  GuestRoute,
  LoginPage,
  PendingApprovalPage,
  AcceptInvitePage,
  ProtectedRoute,
  RegisterPage,
  ResetPasswordPage,
  RoleGuard,
  PermissionGuard,
  VerifyEmailPage,
} from '@/features/auth'
import { DashboardPage } from '@/features/dashboard'
import {
  FINANCE_HUB_PERMISSIONS,
  PEOPLE_HUB_PERMISSIONS,
  WORK_HUB_PERMISSIONS,
} from '@/app/shell/navigation'
import { FinanceHubPage, PeopleHubPage, WorkHubPage } from '@/features/hubs'
import {
  AddCompanyPage,
  AddSubscriptionPage,
  // AdminsPage,
  CompaniesPage,
  CompanyDetailPage,
  EditCompanyPage,
  EditSubscriptionPage,
  SubscriptionsPage,
  SubscriptionDetailPage,
} from '@/features/platform'
import {
  EmployeeCreatePage,
  EmployeeDetailPage,
  EmployeeEditPage,
  EmployeesListPage,
} from '@/features/employees'
import {
  AddLeaveTypePage,
  EditLeaveTypePage,
  LeaveManagementPage,
  LeaveRequestDetailPage,
  NewLeaveRequestPage,
} from '@/features/leave'
import {
  AttendanceDashboardPage,
  AttendanceDetailPage,
  AttendanceSettingsPage,
  MyAttendancePage,
} from '@/features/attendance'
import {
  ExpenseCreatePage,
  ExpenseDetailPage,
  ExpenseEditPage,
  ExpensesListPage,
} from '@/features/expenses'
import {
  MySalaryPage,
  PayrollSettingsPage,
  SalariesListPage,
  SalaryCreatePage,
  SalaryDetailPage,
  SalaryEditPage,
} from '@/features/salaries'
import {
  PerformanceCalibrationPage,
  PerformanceCyclesPage,
  PerformanceDetailPage,
  PerformanceGoalsPage,
  PerformanceHomePage,
  PerformanceReviewCreatePage,
  PerformanceReviewEditPage,
  PerformanceTeamPage,
  KpiTemplatesPage,
} from '@/features/performance'
import {
  ProjectCreatePage,
  ProjectDetailPage,
  ProjectEditPage,
  ProjectsListPage,
} from '@/features/projects'
import {
  ClientCreatePage,
  ClientDetailPage,
  ClientEditPage,
  ClientsListPage,
} from '@/features/clients'
import {
  GenerateReportPage,
  ReportDetailPage,
  ReportsOverviewPage,
} from '@/features/reports'
import {
  CompanySettingsPage,
  NotificationSettingsPage,
  RolesPermissionsPage,
  SecuritySettingsPage,
  SettingsPage,
  SystemPreferencesPage,
  UserManagementPage,
} from '@/features/settings'
import { TeamListPage, TeamMemberDetailPage } from '@/features/team'
import { MyTasksPage, ProjectTaskBoardPage, TaskDetailPage } from '@/features/tasks'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    element: (
      <GuestRoute>
        <Outlet />
      </GuestRoute>
    ),
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
      { path: '/accept-invite', element: <AcceptInvitePage /> },
      { path: '/reset-password', element: <ResetPasswordPage /> },
      { path: '/verify-email', element: <VerifyEmailPage /> },
    ],
  },
  {
    path: '/pending-approval',
    element: (
      <ProtectedRoute>
        <PendingApprovalPage />
      </ProtectedRoute>
    ),
  },
  {
    element: (
      <ProtectedRoute>
        <ActiveAccountRoute>
          <AppLayout />
        </ActiveAccountRoute>
      </ProtectedRoute>
    ),
    children: [
      { path: '/dashboard', element: <DashboardPage /> },
      {
        path: '/people',
        element: (
          <PermissionGuard anyOf={[...PEOPLE_HUB_PERMISSIONS]}>
            <PeopleHubPage />
          </PermissionGuard>
        ),
      },
      {
        path: '/finance',
        element: (
          <PermissionGuard anyOf={[...FINANCE_HUB_PERMISSIONS]}>
            <FinanceHubPage />
          </PermissionGuard>
        ),
      },
      {
        path: '/work',
        element: (
          <PermissionGuard anyOf={[...WORK_HUB_PERMISSIONS]}>
            <WorkHubPage />
          </PermissionGuard>
        ),
      },
      {
        path: '/tasks',
        element: (
          <PermissionGuard permission="tasks:read">
            <MyTasksPage />
          </PermissionGuard>
        ),
      },
      {
        path: '/tasks/:id',
        element: (
          <PermissionGuard permission="tasks:read">
            <TaskDetailPage />
          </PermissionGuard>
        ),
      },
      {
        path: '/companies/new',
        element: (
          <RoleGuard allowedRoles={['superadmin']}>
            <AddCompanyPage />
          </RoleGuard>
        ),
      },
      {
        path: '/companies/:id',
        element: (
          <RoleGuard allowedRoles={['superadmin']}>
            <CompanyDetailPage />
          </RoleGuard>
        ),
      },
      {
        path: '/companies/:id/edit',
        element: (
          <RoleGuard allowedRoles={['superadmin']}>
            <EditCompanyPage />
          </RoleGuard>
        ),
      },
      {
        path: '/companies',
        element: (
          <RoleGuard allowedRoles={['superadmin']}>
            <CompaniesPage />
          </RoleGuard>
        ),
      },
      // {
      //   path: '/admins',
      //   element: (
      //     <RoleGuard allowedRoles={['superadmin']}>
      //       <AdminsPage />
      //     </RoleGuard>
      //   ),
      // },
      {
        path: '/subscriptions/new',
        element: (
          <RoleGuard allowedRoles={['superadmin']}>
            <AddSubscriptionPage />
          </RoleGuard>
        ),
      },
      {
        path: '/subscriptions/:id/edit',
        element: (
          <RoleGuard allowedRoles={['superadmin']}>
            <EditSubscriptionPage />
          </RoleGuard>
        ),
      },
      {
        path: '/subscriptions/:id',
        element: (
          <RoleGuard allowedRoles={['superadmin']}>
            <SubscriptionDetailPage />
          </RoleGuard>
        ),
      },
      {
        path: '/subscriptions',
        element: (
          <RoleGuard allowedRoles={['superadmin']}>
            <SubscriptionsPage />
          </RoleGuard>
        ),
      },
      {
        path: '/employees',
        element: (
          <PermissionGuard permission="employees:read">
            <EmployeesListPage />
          </PermissionGuard>
        ),
      },
      {
        path: '/employees/new',
        element: (
          <PermissionGuard permission="employees:write">
            <EmployeeCreatePage />
          </PermissionGuard>
        ),
      },
      {
        path: '/employees/:id',
        element: (
          <PermissionGuard permission="employees:read">
            <EmployeeDetailPage />
          </PermissionGuard>
        ),
      },
      {
        path: '/employees/:id/edit',
        element: (
          <PermissionGuard permission="employees:write">
            <EmployeeEditPage />
          </PermissionGuard>
        ),
      },
      {
        path: '/team',
        element: (
          <PermissionGuard permission="team:read">
            <TeamListPage />
          </PermissionGuard>
        ),
      },
      {
        path: '/team/:id',
        element: (
          <PermissionGuard permission="team:read">
            <TeamMemberDetailPage />
          </PermissionGuard>
        ),
      },
      {
        path: '/projects',
        element: (
          <PermissionGuard permission="projects:read">
            <ProjectsListPage />
          </PermissionGuard>
        ),
      },
      {
        path: '/projects/new',
        element: (
          <PermissionGuard permission="projects:write">
            <ProjectCreatePage />
          </PermissionGuard>
        ),
      },
      {
        path: '/projects/:id',
        element: (
          <PermissionGuard permission="projects:read">
            <ProjectDetailPage />
          </PermissionGuard>
        ),
      },
      {
        path: '/projects/:id/board',
        element: (
          <PermissionGuard permission="projects:read">
            <ProjectTaskBoardPage />
          </PermissionGuard>
        ),
      },
      {
        path: '/projects/:id/edit',
        element: (
          <PermissionGuard permission="projects:write">
            <ProjectEditPage />
          </PermissionGuard>
        ),
      },
      {
        path: '/clients',
        element: (
          <PermissionGuard permission="clients:read">
            <ClientsListPage />
          </PermissionGuard>
        ),
      },
      {
        path: '/clients/new',
        element: (
          <PermissionGuard permission="clients:write">
            <ClientCreatePage />
          </PermissionGuard>
        ),
      },
      {
        path: '/clients/:id',
        element: (
          <PermissionGuard permission="clients:read">
            <ClientDetailPage />
          </PermissionGuard>
        ),
      },
      {
        path: '/clients/:id/edit',
        element: (
          <PermissionGuard permission="clients:write">
            <ClientEditPage />
          </PermissionGuard>
        ),
      },
      {
        path: '/leave',
        element: (
          <PermissionGuard anyOf={['leave:manage', 'leave:approve', 'leave:request']}>
            <LeaveManagementPage />
          </PermissionGuard>
        ),
      },
      {
        path: '/leave/new',
        element: (
          <PermissionGuard permission="leave:request">
            <NewLeaveRequestPage />
          </PermissionGuard>
        ),
      },
      {
        path: '/leave/types/new',
        element: (
          <PermissionGuard permission="leave:manage">
            <AddLeaveTypePage />
          </PermissionGuard>
        ),
      },
      {
        path: '/leave/types/:id/edit',
        element: (
          <PermissionGuard permission="leave:manage">
            <EditLeaveTypePage />
          </PermissionGuard>
        ),
      },
      {
        path: '/leave/requests/:id',
        element: (
          <PermissionGuard anyOf={['leave:manage', 'leave:approve', 'leave:request']}>
            <LeaveRequestDetailPage />
          </PermissionGuard>
        ),
      },
      {
        path: '/attendance',
        element: (
          <PermissionGuard anyOf={['attendance:manage', 'attendance:team']}>
            <AttendanceDashboardPage />
          </PermissionGuard>
        ),
      },
      {
        path: '/attendance/settings',
        element: (
          <PermissionGuard permission="attendance:settings">
            <AttendanceSettingsPage />
          </PermissionGuard>
        ),
      },
      {
        path: '/my-attendance',
        element: (
          <PermissionGuard permission="attendance:self">
            <MyAttendancePage />
          </PermissionGuard>
        ),
      },
      {
        path: '/attendance/:employeeId',
        element: (
          <PermissionGuard anyOf={['attendance:self', 'attendance:manage', 'attendance:team']}>
            <AttendanceDetailPage />
          </PermissionGuard>
        ),
      },
      {
        path: '/salaries',
        element: (
          <PermissionGuard permission="salaries:read">
            <SalariesListPage />
          </PermissionGuard>
        ),
      },
      {
        path: '/my-salary',
        element: (
          <PermissionGuard anyOf={['salaries:self', 'salaries:read']}>
            <MySalaryPage />
          </PermissionGuard>
        ),
      },
      {
        path: '/salaries/settings',
        element: (
          <PermissionGuard permission="salaries:write">
            <PayrollSettingsPage />
          </PermissionGuard>
        ),
      },
      {
        path: '/salaries/new',
        element: (
          <PermissionGuard permission="salaries:write">
            <SalaryCreatePage />
          </PermissionGuard>
        ),
      },
      {
        path: '/salaries/:id/edit',
        element: (
          <PermissionGuard permission="salaries:write">
            <SalaryEditPage />
          </PermissionGuard>
        ),
      },
      {
        path: '/salaries/:id',
        element: (
          <PermissionGuard anyOf={['salaries:read', 'salaries:self']}>
            <SalaryDetailPage />
          </PermissionGuard>
        ),
      },
      {
        path: '/expenses',
        element: (
          <PermissionGuard permission="expenses:read">
            <ExpensesListPage />
          </PermissionGuard>
        ),
      },
      {
        path: '/expenses/new',
        element: (
          <PermissionGuard permission="expenses:write">
            <ExpenseCreatePage />
          </PermissionGuard>
        ),
      },
      {
        path: '/expenses/:id',
        element: (
          <PermissionGuard permission="expenses:read">
            <ExpenseDetailPage />
          </PermissionGuard>
        ),
      },
      {
        path: '/expenses/:id/edit',
        element: (
          <PermissionGuard permission="expenses:write">
            <ExpenseEditPage />
          </PermissionGuard>
        ),
      },
      {
        path: '/performance',
        element: (
          <PermissionGuard permission="performance:read">
            <PerformanceHomePage />
          </PermissionGuard>
        ),
      },
      {
        path: '/performance/team',
        element: (
          <PermissionGuard permission="performance:read">
            <PerformanceTeamPage />
          </PermissionGuard>
        ),
      },
      {
        path: '/performance/list',
        element: <Navigate to="/performance" replace />,
      },
      {
        path: '/performance/analytics',
        element: <Navigate to="/performance" replace />,
      },
      {
        path: '/performance/kpi-templates',
        element: (
          <PermissionGuard permission="performance:kpi-setup">
            <KpiTemplatesPage />
          </PermissionGuard>
        ),
      },
      {
        path: '/performance/cycles',
        element: (
          <PermissionGuard permission="performance:read">
            <PerformanceCyclesPage />
          </PermissionGuard>
        ),
      },
      {
        path: '/performance/goals',
        element: (
          <PermissionGuard permission="performance:read">
            <PerformanceGoalsPage />
          </PermissionGuard>
        ),
      },
      {
        path: '/performance/calibration',
        element: (
          <PermissionGuard permission="performance:read">
            <PerformanceCalibrationPage />
          </PermissionGuard>
        ),
      },
      {
        path: '/performance/:id',
        element: (
          <PermissionGuard permission="performance:read">
            <PerformanceDetailPage />
          </PermissionGuard>
        ),
      },
      {
        path: '/performance/:id/reviews/new',
        element: (
          <PermissionGuard permission="performance:write">
            <PerformanceReviewCreatePage />
          </PermissionGuard>
        ),
      },
      {
        path: '/performance/:id/reviews/:reviewId/edit',
        element: (
          <PermissionGuard permission="performance:write">
            <PerformanceReviewEditPage />
          </PermissionGuard>
        ),
      },
      {
        path: '/reports',
        element: (
          <PermissionGuard permission="reports:read">
            <ReportsOverviewPage />
          </PermissionGuard>
        ),
      },
      {
        path: '/reports/generate',
        element: (
          <PermissionGuard permission="reports:read">
            <GenerateReportPage />
          </PermissionGuard>
        ),
      },
      {
        path: '/reports/:id',
        element: (
          <PermissionGuard permission="reports:read">
            <ReportDetailPage />
          </PermissionGuard>
        ),
      },
      {
        path: '/settings',
        element: (
          <PermissionGuard permission="settings:read">
            <SettingsPage />
          </PermissionGuard>
        ),
      },
      {
        path: '/settings/roles',
        element: (
          <RoleGuard allowedRoles={['admin']}>
            <RolesPermissionsPage />
          </RoleGuard>
        ),
      },
      {
        path: '/settings/company',
        element: (
          <RoleGuard allowedRoles={['admin']}>
            <CompanySettingsPage />
          </RoleGuard>
        ),
      },
      {
        path: '/settings/users',
        element: (
          <RoleGuard allowedRoles={['admin']}>
            <PermissionGuard permission="employees:read">
              <UserManagementPage />
            </PermissionGuard>
          </RoleGuard>
        ),
      },
      {
        path: '/settings/notifications',
        element: (
          <PermissionGuard permission="settings:read">
            <NotificationSettingsPage />
          </PermissionGuard>
        ),
      },
      {
        path: '/settings/preferences',
        element: (
          <PermissionGuard permission="settings:read">
            <SystemPreferencesPage />
          </PermissionGuard>
        ),
      },
      {
        path: '/settings/security',
        element: (
          <PermissionGuard permission="settings:admin">
            <SecuritySettingsPage />
          </PermissionGuard>
        ),
      },
    ],
  },
])
