'use client'

import { DashboardNavProvider } from '@/components/dashboard-nav-provider'
import { DashboardHeader } from '@/components/dashboard-header'
import { DashboardSidebar } from '@/components/dashboard-sidebar'

/** Wraps the app with global navigation drawer state and sidebar. */
export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <DashboardNavProvider>
      <DashboardSidebar />
      <DashboardHeader />
      {children}
    </DashboardNavProvider>
  )
}
