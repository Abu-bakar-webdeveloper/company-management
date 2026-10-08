import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import type { ReactNode } from 'react'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/features/auth/model/AuthContext'
import { SystemPreferencesProvider } from '@/features/settings/model/SystemPreferencesContext'
import { CompanyPrefsProvider } from '@/shared/company-prefs/CompanyPrefsProvider'
import { queryClient } from '@/shared/api/queryClient'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SystemPreferencesProvider>
          <CompanyPrefsProvider>{children}</CompanyPrefsProvider>
        </SystemPreferencesProvider>
      </AuthProvider>
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          classNames: {
            toast: 'border border-border-card bg-surface text-heading shadow-[var(--shadow-card)]',
            title: 'text-heading',
            description: 'text-text-muted',
          },
        }}
      />
      {import.meta.env.DEV ? <ReactQueryDevtools initialIsOpen={false} /> : null}
    </QueryClientProvider>
  )
}
