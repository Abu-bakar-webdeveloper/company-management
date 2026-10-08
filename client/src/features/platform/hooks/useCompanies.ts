import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  companiesApi,
  type CreateCompanyResult,
  type ListCompaniesParams,
  type UpdateCompanyPayload,
} from '@/features/platform/api/companiesApi'
import type { CompanyFormValues } from '@/features/platform/model/schemas'
import { mapApiCompanyToDetail } from '@/features/platform/lib/company-utils'
import { queryKeys } from '@/shared/api/queryKeys'

export function useCreateCompany() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (values: CompanyFormValues) => companiesApi.create(values),
    onSuccess: (result: CreateCompanyResult) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.all })
      if (import.meta.env.DEV && result.devInviteToken) {
        console.info('[dev] Admin invite token:', result.devInviteToken)
      }
    },
  })
}

export function useResendCompanyInvite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (companyId: string) => companiesApi.resendInvite(companyId),
    onSuccess: (_result, companyId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.detail(companyId) })
    },
  })
}

export function useCompaniesList(params: ListCompaniesParams) {
  return useQuery({
    queryKey: queryKeys.companies.list(params),
    queryFn: () => companiesApi.list(params),
  })
}

export function useCompanyStats() {
  return useQuery({
    queryKey: queryKeys.companies.stats(),
    queryFn: () => companiesApi.getStats(),
  })
}

export function useCompanyGrowth(months = 6) {
  return useQuery({
    queryKey: queryKeys.companies.growth(months),
    queryFn: () => companiesApi.getGrowth(months),
  })
}

export function useCompany(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.companies.detail(id ?? ''),
    queryFn: () => companiesApi.getById(id!),
    enabled: Boolean(id),
    select: (company) => mapApiCompanyToDetail(company),
  })
}

export function useCompanyApi(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.companies.detail(id ?? ''),
    queryFn: () => companiesApi.getById(id!),
    enabled: Boolean(id),
  })
}

export function useUpdateCompany() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCompanyPayload }) =>
      companiesApi.update(id, payload),
    onSuccess: (_company, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.detail(id) })
    },
  })
}

export function useUpdateCompanyStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'trial' | 'inactive' }) =>
      companiesApi.update(id, { status }),
    onSuccess: (_company, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.detail(id) })
    },
  })
}

export function useDeleteCompany() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => companiesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.all })
    },
  })
}

export function useResetCompanyAccess() {
  return useMutation({
    mutationFn: (id: string) => companiesApi.resetAccess(id),
  })
}
