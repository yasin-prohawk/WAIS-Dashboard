'use client'

import * as React from 'react'

type DashboardNavContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
  openSidebar: () => void
  closeSidebar: () => void
  toggleSidebar: () => void
}

const DashboardNavContext = React.createContext<DashboardNavContextValue | null>(null)

export function DashboardNavProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)

  const openSidebar = React.useCallback(() => setOpen(true), [])
  const closeSidebar = React.useCallback(() => setOpen(false), [])
  const toggleSidebar = React.useCallback(() => setOpen((prev) => !prev), [])

  const value = React.useMemo(
    () => ({ open, setOpen, openSidebar, closeSidebar, toggleSidebar }),
    [open, openSidebar, closeSidebar, toggleSidebar],
  )

  return (
    <DashboardNavContext.Provider value={value}>
      {children}
    </DashboardNavContext.Provider>
  )
}

export function useDashboardNav() {
  const ctx = React.useContext(DashboardNavContext)
  if (!ctx) {
    throw new Error('useDashboardNav must be used within DashboardNavProvider')
  }
  return ctx
}
