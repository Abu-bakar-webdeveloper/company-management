import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { attendanceApi } from '@/features/attendance/api/attendanceApi'
import type {
  AttendanceDay,
  AttendanceDayStatus,
  AttendancePunchType,
  AttendanceSettings,
  ListAttendanceParams,
  PunchClientLocation,
} from '@/features/attendance/model/types'
import { queryKeys } from '@/shared/api/queryKeys'

export function useTodaySession(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.attendance.today(),
    queryFn: () => attendanceApi.getToday(),
    enabled: options?.enabled !== false,
    refetchInterval: 60_000,
  })
}

export function useMyAttendance(
  params?: ListAttendanceParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: queryKeys.attendance.mine(params),
    queryFn: () => attendanceApi.listMine(params),
    enabled: options?.enabled !== false,
    placeholderData: keepPreviousData,
  })
}

export function useEmployeeAttendance(
  employeeId: string | undefined,
  params?: ListAttendanceParams,
) {
  return useQuery({
    queryKey: queryKeys.attendance.employee(employeeId ?? '', params),
    queryFn: () => attendanceApi.listEmployee(employeeId!, params),
    enabled: Boolean(employeeId),
    placeholderData: keepPreviousData,
  })
}

export function useAttendanceDashboard(params?: {
  date?: string
  scope?: 'mine' | 'team' | 'company'
  department?: string
  weekFrom?: string
}) {
  return useQuery({
    queryKey: queryKeys.attendance.dashboard(params),
    queryFn: () => attendanceApi.getDashboard(params),
    placeholderData: keepPreviousData,
  })
}

export function useAttendanceSettings(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.attendance.settings(),
    queryFn: () => attendanceApi.getSettings(),
    enabled: options?.enabled !== false,
  })
}

export function usePunch() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: { type: AttendancePunchType; location?: PunchClientLocation }) =>
      attendanceApi.punch(input.type, input.location),
    onSuccess: (session) => {
      queryClient.setQueryData(queryKeys.attendance.today(), session)
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance.all })
    },
  })
}

export function useUpdateAttendanceSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: Partial<AttendanceSettings>) => attendanceApi.updateSettings(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance.all })
    },
  })
}

export function useUpdateAttendanceDay() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: {
      id: string
      payload: {
        status?: AttendanceDayStatus
        clockInAt?: string | null
        clockOutAt?: string | null
        notes?: string
        totalWorkMinutes?: number
      }
    }) => attendanceApi.updateDay(input.id, input.payload),
    onSuccess: (_day: AttendanceDay) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance.all })
    },
  })
}
