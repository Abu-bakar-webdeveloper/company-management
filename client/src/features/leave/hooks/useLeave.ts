import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/model/AuthContext'
import { userHasAnyPermission } from '@/features/auth/model/permissions'
import {
  leaveApi,
  type CreateLeaveRequestPayload,
  type ListLeaveRequestsParams,
} from '@/features/leave/api/leaveApi'
import type { LeaveTypeFormValues } from '@/features/leave/model/schemas'
import { queryKeys } from '@/shared/api/queryKeys'

export function useLeaveTypes() {
  return useQuery({
    queryKey: queryKeys.leaves.types(),
    queryFn: () => leaveApi.listTypes(),
  })
}

export function useLeaveType(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.leaves.type(id ?? ''),
    queryFn: () => leaveApi.getTypeById(id!),
    enabled: Boolean(id),
  })
}

export function useLeaveRequests(
  params?: ListLeaveRequestsParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: queryKeys.leaves.requests(params),
    queryFn: () => leaveApi.listRequests(params),
    enabled: options?.enabled !== false,
  })
}

export function useLeaveRequestsPaginated(params?: ListLeaveRequestsParams) {
  return useQuery({
    queryKey: queryKeys.leaves.requestsPaginated(params),
    queryFn: () => leaveApi.listRequestsPaginated(params),
  })
}

export function useLeaveStats(scope?: 'mine' | 'team' | 'company') {
  const { user } = useAuth()
  const canRead = Boolean(
    user && userHasAnyPermission(user, ['leave:manage', 'leave:approve', 'leave:request']),
  )

  return useQuery({
    queryKey: queryKeys.leaves.stats(scope),
    queryFn: () => leaveApi.getRequestStats(scope),
    enabled: canRead,
  })
}

export function useLeaveRequest(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.leaves.detail(id ?? ''),
    queryFn: () => leaveApi.getRequestById(id!),
    enabled: Boolean(id),
  })
}

export function useEmployeeLeaveSummary(userId: string | undefined) {
  const { user } = useAuth()
  const canRead = Boolean(
    user && userHasAnyPermission(user, ['leave:manage', 'leave:approve', 'leave:request']),
  )

  return useQuery({
    queryKey: queryKeys.leaves.employeeSummary(userId ?? ''),
    queryFn: () => leaveApi.getEmployeeSummary(userId!),
    enabled: Boolean(userId) && canRead,
  })
}

export function useCreateLeaveRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateLeaveRequestPayload) => leaveApi.createRequest(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leaves.all })
    },
  })
}

export function useUpdateLeaveRequestStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      status,
      adminComment,
      excessDisposition,
    }: {
      id: string
      status: 'approved' | 'rejected'
      adminComment?: string
      excessDisposition?: 'waived' | 'unpaid_deduct' | 'none'
    }) => leaveApi.updateRequestStatus(id, status, adminComment, excessDisposition),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leaves.all })
    },
  })
}

export function useRunLeaveEncashment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: { year: number; targetMonth?: number; targetYear?: number }) =>
      leaveApi.runEncashment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leaves.all })
    },
  })
}

export function useCreateLeaveType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (values: LeaveTypeFormValues) => leaveApi.createType(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leaves.all })
    },
  })
}

export function useUpdateLeaveType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: LeaveTypeFormValues }) =>
      leaveApi.updateType(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leaves.all })
    },
  })
}

export function useDeleteLeaveType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => leaveApi.removeType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leaves.all })
    },
  })
}
