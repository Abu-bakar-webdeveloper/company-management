import { ROLE_PERMISSIONS } from '@/features/auth/model/permissions'
import type {
  ActiveSession,
  CompanySettings,
  ManagedUser,
  NotificationSettings,
  Role,
  SecurityLog,
  SecuritySettings,
  SystemActivity,
  SystemPreferences,
  UserActivity,
} from '@/features/settings/model/types'

export const roles: Role[] = [
  {
    id: 'admin',
    name: 'Admin',
    description: 'Full system access',
    userCount: 1,
    badge: 'Active Role',
    permissions: [...ROLE_PERMISSIONS.admin],
  },
  {
    id: 'manager',
    name: 'Manager',
    description: 'Team & Project oversight',
    userCount: 2,
    badge: 'Default Role',
    permissions: [...ROLE_PERMISSIONS.manager],
  },
  {
    id: 'employee',
    name: 'Employee',
    description: 'Standard workspace access',
    userCount: 48,
    permissions: [...ROLE_PERMISSIONS.employee],
  },
  {
    id: 'hr-specialist',
    name: 'HR Specialist',
    description: 'Personnel & Payroll data',
    userCount: 3,
    permissions: [...ROLE_PERMISSIONS.hr],
  },
]

export const recentActivities: SystemActivity[] = [
  {
    id: 'act-001',
    activity: 'Password Policy Updated',
    icon: 'policy',
    administrator: 'Naeem Ashraf',
    dateTime: 'Apr 2024 - 14:32 PM',
    status: 'success',
  },
  {
    id: 'act-002',
    activity: 'Leave Report',
    icon: 'report',
    administrator: 'Sarah Khan',
    dateTime: 'Jun 2024 - 09:15 AM',
    status: 'success',
  },
  {
    id: 'act-003',
    activity: 'Failed Login Attempt',
    icon: 'alert',
    administrator: 'John Doe',
    dateTime: 'Oct 2024 - 22:04 PM',
    status: 'warning',
  },
]

export const companySettings: CompanySettings = {
  companyName: 'Amazigh Innovations',
  email: 'info@company.com',
  phone: '+92 300 1234567',
  country: 'pakistan',
  city: 'Lahore',
  addressLine: '',
  postalCode: '00000',
  primaryColor: '#002B4F',
  secondaryColor: '#136DEC',
  timezone: 'gmt+5',
  currency: 'pkr',
  dateFormat: 'DD/MM/YYYY',
}

export const notificationSettings: NotificationSettings = {
  email: {
    newUser: true,
    leaveRequest: true,
    leaveDecision: true,
    expenseSubmitted: false,
    expenseApproved: true,
  },
  system: {
    taskAssigned: true,
    projectUpdated: true,
    performanceReview: true,
  },
  reminders: {
    leaveExpiry: '2 Days',
    reviewDeadline: '3 Days',
    projectDeadline: '1 Day',
  },
  channels: {
    email: true,
    inApp: true,
    push: false,
    sms: false,
  },
}

export const systemPreferences: SystemPreferences = {
  language: 'English',
  timezone: 'GMT+5',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '12h',
  theme: 'light',
  primaryColor: '#136DEC',
  sidebarStyle: 'Expanded',
  defaultDashboard: 'Admin',
  defaultLandingPage: 'Dashboard',
  showQuickStats: true,
  enableCharts: true,
  autoLogoutTime: '15 mins',
  sessionTimeout: '30 mins',
  enableAutoSave: true,
  enableNotifications: true,
  autoBackup: true,
  backupFrequency: 'Daily',
}

export const securitySettings: SecuritySettings = {
  minPasswordLength: '8 Characters',
  passwordExpiry: '30 Days',
  requireUppercase: true,
  requireNumbers: true,
  requireSymbols: true,
  enable2fa: true,
  twoFactorMethod: 'email',
  maxLoginAttempts: '5 Attempts',
  accountLockTime: '15 Minutes',
  rememberDevices: true,
  sessionTimeout: '30 Minutes',
  autoLogout: false,
}

export const activeSessions: ActiveSession[] = [
  {
    id: 'sess-1',
    device: 'Chrome on MacOS',
    detail: '192.168.1.45',
    location: 'Lahore, PK',
    lastActive: '2 mins ago',
    lastActiveTone: 'success',
  },
  {
    id: 'sess-2',
    device: 'Mobile App (iOS)',
    detail: 'iPhone 14 Pro',
    location: 'Karachi, PK',
    lastActive: '1 hour ago',
    lastActiveTone: 'info',
  },
]

export const securityLogs: SecurityLog[] = [
  { id: 'log-1', actor: 'Admin', action: 'Login Success', date: 'Oct 24, 2024' },
  { id: 'log-2', actor: 'Manager', action: 'Updated Settings', date: 'Oct 23, 2024' },
  { id: 'log-3', actor: 'Employee', action: 'Password Changed', date: 'Oct 22, 2024' },
]

export const managedUsers: ManagedUser[] = [
  {
    id: 'usr-1',
    name: 'Naeem Ashraf',
    email: 'naeemashaf@gmail.com',
    role: 'Manager',
    roleKey: 'manager',
    department: 'Engineering',
    status: 'active',
    avatar: 'https://i.pravatar.cc/64?img=12',
    phone: '+92 300 1234567',
    location: 'Lahore, Pakistan',
    jobTitle: 'Senior Developer',
    joinDate: '1/15/2024',
    lastActive: '2 hours ago',
  },
  {
    id: 'usr-2',
    name: 'Sarah Khan',
    email: 'sarah.khan@company.com',
    role: 'HR',
    roleKey: 'hr',
    department: 'HR',
    status: 'active',
    avatar: 'https://i.pravatar.cc/64?img=5',
    phone: '+92 301 9876543',
    location: 'Karachi, Pakistan',
    jobTitle: 'HR Specialist',
    joinDate: '3/10/2024',
    lastActive: 'Today, 09:12 AM',
  },
  {
    id: 'usr-3',
    name: 'John Doe',
    email: 'john.doe@company.com',
    role: 'Admin',
    roleKey: 'manager',
    department: 'Management',
    status: 'active',
    avatar: 'https://i.pravatar.cc/64?img=11',
    phone: '+92 302 5551234',
    location: 'Lahore, Pakistan',
    jobTitle: 'System Admin',
    joinDate: '1/1/2024',
    lastActive: '2 mins ago',
  },
  {
    id: 'usr-4',
    name: 'Ali Raza',
    email: 'ali.raza@company.com',
    role: 'Employee',
    roleKey: 'employee',
    department: 'Design',
    status: 'active',
    avatar: 'https://i.pravatar.cc/64?img=15',
    phone: '+92 303 4445678',
    location: 'Islamabad, Pakistan',
    jobTitle: 'UI Designer',
    joinDate: '6/20/2024',
    lastActive: 'Yesterday',
  },
  {
    id: 'usr-5',
    name: 'Fatima Noor',
    email: 'fatima.noor@company.com',
    role: 'Employee',
    roleKey: 'employee',
    department: 'Marketing',
    status: 'pending',
    avatar: 'https://i.pravatar.cc/64?img=9',
    phone: '+92 304 3339876',
    location: 'Lahore, Pakistan',
    jobTitle: 'Marketing Associate',
    joinDate: '8/5/2024',
    lastActive: '2 weeks ago',
  },
]

export const userActivities: Record<string, UserActivity[]> = {
  'usr-1': [
    {
      id: 'ua-1',
      title: 'Status Updated',
      description: "Changed from 'Away' to 'Active'",
      timestamp: '2 HOURS AGO',
    },
    {
      id: 'ua-2',
      title: 'System Access',
      description: 'Logged in from Chrome (Windows 11)',
      timestamp: 'TODAY, 09:12 AM',
    },
    {
      id: 'ua-3',
      title: 'Profile Updated',
      description: "Updated department to 'Engineering'",
      timestamp: 'YESTERDAY',
    },
  ],
}

export const roleOptions = ['Manager', 'HR', 'Employee'] as const
export const departmentOptions = [
  'All Departments',
  'engineering',
  'design',
  'marketing',
  'hr',
  'finance',
  'operations',
]
export const statusOptions = ['All Status', 'Active', 'Pending']
