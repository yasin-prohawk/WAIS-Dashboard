'use client'

import { ArrowLeft, Menu, Moon, Sun } from 'lucide-react'
import Link from 'next/link'
import { useTheme } from '@/components/theme-provider'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

const menuItems = [
  { name: 'Facility Engineering Maintenance', href: '/facility-engineering' },
  { name: 'Biomedical Engineering Maintenance', href: '/biomedical-engineering' },
  { name: 'Cleansing Services', href: '/cleansing-services' },
  { name: 'Linen and Laundry Services', href: '/linen-laundry' },
  { name: 'Healthcare Waste Management', href: '/waste-management' },
  { name: 'Complaint Module', href: '/complaint-module' },
  { name: 'Document Management System', href: '/document-management' },
  { name: 'Quality Assurance Program', href: '/quality-assurance' },
  { name: 'Beyond Economic Repair', href: '/beyond-economic-repair' },
  { name: 'Variation Management', href: '/variation-management' },
  { name: 'Deduction', href: '/deduction' },
  { name: 'Additional Works', href: '/additional-works' },
  { name: 'Finance', href: '/finance' },
  { name: 'Reports', href: '/reports' },
]

interface DashboardNavProps {
  title: string
  description?: string
}

export function DashboardNav({ title, description }: DashboardNavProps) {
  const { theme, setTheme } = useTheme()

  return (
    <div className="mb-6 flex items-center justify-between gap-4 bg-primary text-primary-foreground px-4 py-3 rounded-lg">
      <div className="flex items-center gap-3">
        <Link href="/">
          <Button variant="secondary" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="secondary" size="icon" className="h-8 w-8">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>Dashboard Menu</SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-2">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-lg px-4 py-3 text-sm hover:bg-muted transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </SheetContent>
        </Sheet>

        <div>
          <h1 className="text-xl font-bold tracking-tight">{title}</h1>
          {description && <p className="text-sm opacity-80">{description}</p>}
        </div>
      </div>

      <Button
        variant="secondary"
        size="icon"
        className="h-8 w-8"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      >
        {theme === 'dark'
          ? <Sun className="h-4 w-4" />
          : <Moon className="h-4 w-4" />
        }
        <span className="sr-only">Toggle theme</span>
      </Button>
    </div>
  )
}

export default DashboardNav
