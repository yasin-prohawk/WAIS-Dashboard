import type { LucideIcon } from 'lucide-react'
import {
  Wrench,
  Heart,
  Sparkles,
  Shirt,
  Trash2,
  MessageSquare,
  FileText,
  Award,
  Hammer,
  PieChart,
  DollarSign,
  BarChart3,
  User,
  Users,
  Settings,
  Landmark,
  TrendingUp,
} from 'lucide-react'

/** Edit submenu items here — each module can have any number of child links. */
export type DashboardSubmenuItem = {
  label: string
  href: string
}

export type DashboardModule = {
  id: string
  label: string
  href: string
  icon: LucideIcon
  submenu: DashboardSubmenuItem[]
}

/**
 * Central navigation config for the WAIS dashboard.
 * Add, remove, or reorder modules and submenu items in this file only.
 */
export const DASHBOARD_MODULES: DashboardModule[] = [
  {
    id: 'facility-engineering',
    label: 'Facility Engineering Maintenance',
    href: '/facility-engineering',
    icon: Wrench,
    submenu: [
      { label: 'Overview', href: '/facility-engineering' },
      { label: 'Work Orders', href: '/facility-engineering#work-orders' },
      { label: 'KPI Dashboard', href: '/facility-engineering#kpi' },
    ],
  },
  {
    id: 'biomedical-engineering',
    label: 'Biomedical Engineering Maintenance',
    href: '/biomedical-engineering',
    icon: Heart,
    submenu: [
      { label: 'Overview', href: '/biomedical-engineering' },
      { label: 'Asset Registry', href: '/biomedical-engineering#assets' },
      { label: 'Uptime Reports', href: '/biomedical-engineering#uptime' },
    ],
  },
  {
    id: 'cleansing-services',
    label: 'Cleansing Services',
    href: '/cleansing-services',
    icon: Sparkles,
    submenu: [
      { label: 'JI Performance', href: '/cleansing-services' },
      { label: 'Service Requests', href: '/cleansing-services#sr' },
      { label: 'Deductions', href: '/cleansing-services#deduction' },
    ],
  },
  {
    id: 'linen-laundry',
    label: 'Linen and Laundry Services',
    href: '/linen-laundry',
    icon: Shirt,
    submenu: [
      { label: 'Overview', href: '/linen-laundry' },
      { label: 'Distribution', href: '/linen-laundry#distribution' },
      { label: 'Inventory', href: '/linen-laundry#inventory' },
    ],
  },
  {
    id: 'waste-management',
    label: 'Healthcare Waste Management',
    href: '/waste-management',
    icon: Trash2,
    submenu: [
      { label: 'Overview', href: '/waste-management' },
      { label: 'Collection Log', href: '/waste-management#collection' },
      { label: 'Compliance', href: '/waste-management#compliance' },
    ],
  },
  {
    id: 'complaints',
    label: 'Complaint Module',
    href: '/complaints',
    icon: MessageSquare,
    submenu: [
      { label: 'All Complaints', href: '/complaints' },
      { label: 'Open Cases', href: '/complaints#open' },
      { label: 'Resolved', href: '/complaints#resolved' },
    ],
  },
  {
    id: 'documents',
    label: 'Document Management System',
    href: '/documents',
    icon: FileText,
    submenu: [
      { label: 'Library', href: '/documents' },
      { label: 'Uploads', href: '/documents#uploads' },
      { label: 'Archives', href: '/documents#archives' },
    ],
  },
  {
    id: 'quality-assurance',
    label: 'Quality Assurance Program',
    href: '/quality-assurance',
    icon: Award,
    submenu: [
      { label: 'Program Overview', href: '/quality-assurance' },
      { label: 'Audits', href: '/quality-assurance#audits' },
      { label: 'Action Plans', href: '/quality-assurance#actions' },
    ],
  },
  {
    id: 'beyond-economic-repair',
    label: 'Beyond Economic Repair',
    href: '/beyond-economic-repair',
    icon: Hammer,
    submenu: [
      { label: 'BER Dashboard', href: '/beyond-economic-repair' },
      { label: 'Pending Assessment', href: '/beyond-economic-repair#pending' },
      { label: 'Disposal Queue', href: '/beyond-economic-repair#disposal' },
    ],
  },
  {
    id: 'variation-management',
    label: 'Variation Management',
    href: '/variation-management',
    icon: PieChart,
    submenu: [
      { label: 'Overview', href: '/variation-management' },
      { label: 'Pending Approval', href: '/variation-management#pending' },
      { label: 'History', href: '/variation-management#history' },
    ],
  },
  {
    id: 'deduction',
    label: 'Deduction',
    href: '/deduction',
    icon: DollarSign,
    submenu: [
      { label: 'Summary', href: '/deduction' },
      { label: 'By Indicator', href: '/deduction#indicators' },
      { label: 'Reports', href: '/deduction#reports' },
    ],
  },
  {
    id: 'additional-works',
    label: 'Additional Works',
    href: '/additional-works',
    icon: Settings,
    submenu: [
      { label: 'Overview', href: '/additional-works' },
      { label: 'New Request', href: '/additional-works#new' },
      { label: 'Approved Works', href: '/additional-works#approved' },
    ],
  },
  {
    id: 'reports',
    label: 'Reports',
    href: '/reports',
    icon: BarChart3,
    submenu: [
      { label: 'Standard Reports', href: '/reports' },
      { label: 'Custom Builder', href: '/reports#builder' },
      { label: 'Scheduled', href: '/reports#scheduled' },
    ],
  },
  {
    id: 'general-master',
    label: 'General Master',
    href: '/general-master',
    icon: User,
    submenu: [
      { label: 'Master Data', href: '/general-master' },
      { label: 'Locations', href: '/general-master#locations' },
      { label: 'Categories', href: '/general-master#categories' },
    ],
  },
  {
    id: 'user-management',
    label: 'User Management',
    href: '/user-management',
    icon: Users,
    submenu: [
      { label: 'Users', href: '/user-management' },
      { label: 'Roles', href: '/user-management#roles' },
      { label: 'Permissions', href: '/user-management#permissions' },
    ],
  },
  {
    id: 'finance',
    label: 'Finance',
    href: '/finance',
    icon: Landmark,
    submenu: [
      { label: 'Invoices', href: '/finance' },
      { label: 'Penalties', href: '/finance#penalties' },
      { label: 'Budget', href: '/finance#budget' },
    ],
  },
  {
    id: 'bis',
    label: 'BIS',
    href: '/bis',
    icon: TrendingUp,
    submenu: [
      { label: 'Dashboard', href: '/bis' },
      { label: 'Trends', href: '/bis#trends' },
      { label: 'Exports', href: '/bis#exports' },
    ],
  },
]
