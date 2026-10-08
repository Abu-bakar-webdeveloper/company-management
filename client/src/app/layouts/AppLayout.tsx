import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { AppHeader } from '@/app/shell/AppHeader'
import { AppSidebar } from '@/app/shell/AppSidebar'
import { useIdleLogout } from '@/features/settings/hooks/useIdleLogout'

export function AppLayout() {
  useIdleLogout()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const overlay = sidebarOpen ? (
    <button
      type="button"
      className="absolute inset-0 z-40 bg-black/50 lg:hidden"
      aria-label="Close menu"
      onClick={() => setSidebarOpen(false)}
    />
  ) : null

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-page">
      <AppHeader onMenuClick={() => setSidebarOpen(true)} />
      <div className="relative flex min-h-0 min-w-0 flex-1 overflow-hidden">
        {overlay}
        <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
