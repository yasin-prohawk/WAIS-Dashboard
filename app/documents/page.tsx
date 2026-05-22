"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  Tooltip,
  Legend,
} from "recharts"
import DashboardNav from "@/components/dashboard-nav"
import { DashboardPage } from "@/components/dashboard-page"
import { ResponsiveTable } from "@/components/responsive-table"
import {
  Filter,
  TrendingUp,
  TrendingDown,
  FileText,
  FolderOpen,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Upload,
  Eye,
  RotateCcw,
  Lock,
} from "lucide-react"

// ── DATA ──────────────────────────────────────────────────────────────────────

const documentUploadTrendData = [
  { month: "Jan", uploaded: 320, reviewed: 290, approved: 265 },
  { month: "Feb", uploaded: 285, reviewed: 260, approved: 240 },
  { month: "Mar", uploaded: 340, reviewed: 315, approved: 295 },
  { month: "Apr", uploaded: 410, reviewed: 380, approved: 355 },
  { month: "May", uploaded: 375, reviewed: 340, approved: 318 },
  { month: "Jun", uploaded: 430, reviewed: 395, approved: 370 },
]

const documentStatusData = [
  { name: "Approved", value: 1843, color: "#22c55e" },
  { name: "Under Review", value: 412, color: "#3b82f6" },
  { name: "Draft", value: 298, color: "#eab308" },
  { name: "Pending Approval", value: 187, color: "#f97316" },
  { name: "Rejected", value: 64, color: "#ef4444" },
  { name: "Expired", value: 96, color: "#6b7280" },
]

const documentByCategoryData = [
  { category: "Maintenance", count: 842 },
  { category: "Compliance", count: 614 },
  { category: "Safety", count: 487 },
  { category: "Operations", count: 398 },
  { category: "Contracts", count: 312 },
  { category: "Finance", count: 210 },
  { category: "HR / Admin", count: 137 },
]

const documentByDepartmentData = [
  { dept: "Facility Mgmt", docs: 920, approved: 840, pending: 80 },
  { dept: "Engineering", docs: 745, approved: 680, pending: 65 },
  { dept: "Compliance", docs: 512, approved: 475, pending: 37 },
  { dept: "Operations", docs: 430, approved: 390, pending: 40 },
  { dept: "Finance", docs: 293, approved: 265, pending: 28 },
]

const expiryData = [
  { range: "Already Expired", count: 96, color: "#ef4444" },
  { range: "Expiring < 30 Days", count: 48, color: "#f97316" },
  { range: "Expiring 30-90 Days", count: 87, color: "#eab308" },
  { range: "Expiring 90-180 Days", count: 134, color: "#3b82f6" },
  { range: "Valid > 180 Days", count: 1535, color: "#22c55e" },
]

const reviewTurnaroundData = [
  { month: "Jan", avgDays: 4.2 },
  { month: "Feb", avgDays: 5.1 },
  { month: "Mar", avgDays: 3.8 },
  { month: "Apr", avgDays: 4.6 },
  { month: "May", avgDays: 3.4 },
  { month: "Jun", avgDays: 3.9 },
]

const documentVersionData = [
  { category: "Maintenance", v1: 420, v2: 280, v3Plus: 142 },
  { category: "Compliance", v1: 280, v2: 210, v3Plus: 124 },
  { category: "Safety", v1: 245, v2: 160, v3Plus: 82 },
  { category: "Operations", v1: 198, v2: 130, v3Plus: 70 },
  { category: "Contracts", v1: 175, v2: 95, v3Plus: 42 },
]

const storageUsageData = [
  { month: "Jan", used: 42 },
  { month: "Feb", used: 48 },
  { month: "Mar", used: 55 },
  { month: "Apr", used: 63 },
  { month: "May", used: 71 },
  { month: "Jun", used: 78 },
]

const topViewedDocuments = [
  { id: "DOC-0821", title: "Fire Safety Evacuation Plan 2025", category: "Safety", views: 412, lastViewed: "Today", status: "Approved" },
  { id: "DOC-0654", title: "HVAC Preventive Maintenance SOP", category: "Maintenance", views: 387, lastViewed: "Yesterday", status: "Approved" },
  { id: "DOC-0712", title: "Contractor Management Policy", category: "Compliance", views: 295, lastViewed: "2 days ago", status: "Approved" },
  { id: "DOC-0899", title: "Lift & Escalator Inspection Checklist", category: "Operations", views: 241, lastViewed: "Today", status: "Under Review" },
  { id: "DOC-0503", title: "Annual Audit Report FY2024", category: "Finance", views: 198, lastViewed: "3 days ago", status: "Approved" },
  { id: "DOC-0930", title: "Emergency Response Procedure", category: "Safety", views: 176, lastViewed: "Today", status: "Approved" },
]

const pendingApprovalDocuments = [
  { id: "DOC-1044", title: "Updated BMS Maintenance Schedule", category: "Maintenance", submittedBy: "Ahmad R.", submittedDate: "22 Jun 2025", daysWaiting: 2, reviewer: "En. Hafiz" },
  { id: "DOC-1041", title: "Q2 2025 Compliance Report", category: "Compliance", submittedBy: "Farah N.", submittedDate: "20 Jun 2025", daysWaiting: 4, reviewer: "Pn. Suraya" },
  { id: "DOC-1039", title: "Roof Waterproofing Work Method Statement", category: "Safety", submittedBy: "David C.", submittedDate: "19 Jun 2025", daysWaiting: 5, reviewer: "En. Hafiz" },
  { id: "DOC-1035", title: "Revised Pest Control SOW", category: "Operations", submittedBy: "Lim WK", submittedDate: "17 Jun 2025", daysWaiting: 7, reviewer: "Pn. Suraya" },
  { id: "DOC-1028", title: "Staff Induction Handbook v3", category: "HR / Admin", submittedBy: "Muthu S.", submittedDate: "14 Jun 2025", daysWaiting: 10, reviewer: "Hr. Lee" },
]

const recentDocuments = [
  { id: "DOC-1044", title: "Updated BMS Maintenance Schedule", category: "Maintenance", uploadedBy: "Ahmad R.", date: "22 Jun 2025", version: "v2.1", status: "Pending Approval" },
  { id: "DOC-1043", title: "Chiller Room Risk Assessment", category: "Safety", uploadedBy: "David C.", date: "22 Jun 2025", version: "v1.0", status: "Under Review" },
  { id: "DOC-1042", title: "Block A Electrical Panel Schedule", category: "Compliance", uploadedBy: "Lim WK", date: "21 Jun 2025", version: "v1.2", status: "Approved" },
  { id: "DOC-1041", title: "Q2 2025 Compliance Report", category: "Compliance", uploadedBy: "Farah N.", date: "20 Jun 2025", version: "v1.0", status: "Pending Approval" },
  { id: "DOC-1040", title: "CCTV Maintenance Log June 2025", category: "Operations", uploadedBy: "Muthu S.", date: "20 Jun 2025", version: "v1.0", status: "Approved" },
  { id: "DOC-1039", title: "Roof Waterproofing Work Method Statement", category: "Safety", uploadedBy: "David C.", date: "19 Jun 2025", version: "v3.0", status: "Pending Approval" },
]

const accessLevelData = [
  { name: "Public (All Staff)", value: 1240, color: "#22c55e" },
  { name: "Department Only", value: 980, color: "#3b82f6" },
  { name: "Management Only", value: 420, color: "#eab308" },
  { name: "Restricted", value: 260, color: "#ef4444" },
]

const COLORS = ["#3b82f6", "#f97316", "#22c55e", "#eab308", "#8b5cf6", "#ec4899", "#ef4444", "#6b7280"]

// ── HELPERS ───────────────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    Approved: "bg-green-500/20 text-green-400 border-green-500/30",
    "Under Review": "bg-blue-500/20 text-blue-400 border-blue-500/30",
    Draft: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    "Pending Approval": "bg-orange-500/20 text-orange-400 border-orange-500/30",
    Rejected: "bg-red-500/20 text-red-400 border-red-500/30",
    Expired: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${map[status] ?? ""}`}>
      {status}
    </span>
  )
}

const WaitingBadge = ({ days }: { days: number }) => {
  const color = days >= 7 ? "bg-red-500/20 text-red-400 border-red-500/30"
    : days >= 4 ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
    : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${color}`}>
      {days}d waiting
    </span>
  )
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────

export default function DocumentManagementPage() {
  const [selectedYear, setSelectedYear] = useState("2025")
  const [selectedMonth, setSelectedMonth] = useState("All")
  const [selectedDept, setSelectedDept] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState("all")

  return (
    <DashboardPage>
      <DashboardNav title="Document Management System" />

      <div className="container mx-auto max-w-[1600px] space-y-4 sm:space-y-6">

        {/* ── FILTERS ──────────────────────────────────────────────────────── */}
        <Card className="border-primary/20">
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-primary">SELECT DATE</Label>
                <div className="flex items-center gap-2">
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-[140px] bg-background"><SelectValue placeholder="Month" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Months</SelectItem>
                      <SelectItem value="January">January</SelectItem>
                      <SelectItem value="February">February</SelectItem>
                      <SelectItem value="March">March</SelectItem>
                      <SelectItem value="April">April</SelectItem>
                      <SelectItem value="May">May</SelectItem>
                      <SelectItem value="June">June</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-[110px] bg-background"><SelectValue placeholder="Year" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2025">2025</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-primary">DEPARTMENT</Label>
                <Select value={selectedDept} onValueChange={setSelectedDept}>
                  <SelectTrigger className="w-[160px] bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="facility">Facility Mgmt</SelectItem>
                    <SelectItem value="engineering">Engineering</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                    <SelectItem value="operations">Operations</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-primary">CATEGORY</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[150px] bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                    <SelectItem value="safety">Safety</SelectItem>
                    <SelectItem value="operations">Operations</SelectItem>
                    <SelectItem value="contracts">Contracts</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="hr">HR / Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="ml-auto pt-5">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Clear Filter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── KPI CARDS ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
            <CardHeader className="pb-2"><CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Total Documents</CardTitle></CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">2,900</div>
              <p className="text-xs text-muted-foreground mt-1">YTD {selectedYear}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
            <CardHeader className="pb-2"><CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Approved</CardTitle></CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">1,843</div>
              <p className="text-xs text-green-500 mt-1">63.6% of total</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
            <CardHeader className="pb-2"><CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Pending Approval</CardTitle></CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">187</div>
              <p className="text-xs text-orange-500 mt-1">Awaiting sign-off</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20">
            <CardHeader className="pb-2"><CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Expiring Soon</CardTitle></CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">144</div>
              <p className="text-xs text-red-500 mt-1">Within 90 days</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
            <CardHeader className="pb-2"><CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Avg Review Time</CardTitle></CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">4.2</div>
              <p className="text-xs text-muted-foreground mt-1">days avg</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20">
            <CardHeader className="pb-2"><CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Storage Used</CardTitle></CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">78%</div>
              <p className="text-xs text-yellow-500 mt-1">of 500 GB quota</p>
            </CardContent>
          </Card>
        </div>

        {/* ── ROW 1: Upload Trend + Status ─────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader><CardTitle className="text-sm font-semibold">Monthly Document Activity – Uploaded vs Reviewed vs Approved</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={documentUploadTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" fontSize={11} />
                  <YAxis stroke="#9ca3af" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Area type="monotone" dataKey="uploaded" name="Uploaded" stackId="1" fill="#3b82f6" stroke="#3b82f6" fillOpacity={0.5} />
                  <Area type="monotone" dataKey="reviewed" name="Reviewed" stackId="2" fill="#a78bfa" stroke="#a78bfa" fillOpacity={0.5} />
                  <Area type="monotone" dataKey="approved" name="Approved" stackId="3" fill="#22c55e" stroke="#22c55e" fillOpacity={0.5} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm font-semibold">Document Status Distribution</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={175}>
                <PieChart>
                  <Pie data={documentStatusData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={2} dataKey="value">
                    {documentStatusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1 mt-2">
                {documentStatusData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-muted-foreground">{item.name}</span>
                    </div>
                    <span className="font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── ROW 2: Category + Expiry + Review Turnaround ─────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-sm font-semibold">Documents by Category</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={documentByCategoryData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9ca3af" fontSize={11} />
                  <YAxis dataKey="category" type="category" stroke="#9ca3af" width={82} fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {documentByCategoryData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-400" />
                Document Expiry Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={155}>
                <BarChart data={expiryData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9ca3af" fontSize={11} />
                  <YAxis dataKey="range" type="category" stroke="#9ca3af" width={120} fontSize={9} />
                  <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {expiryData.map((entry) => <Cell key={entry.range} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-2 text-center">
                  <div className="text-xs text-muted-foreground">Expired</div>
                  <div className="text-lg font-bold text-red-400">96</div>
                </div>
                <div className="rounded-lg bg-orange-500/10 border border-orange-500/20 p-2 text-center">
                  <div className="text-xs text-muted-foreground">&lt; 30 Days</div>
                  <div className="text-lg font-bold text-orange-400">48</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm font-semibold">Avg Review Turnaround Time (Days)</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={reviewTurnaroundData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" fontSize={11} />
                  <YAxis stroke="#9ca3af" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} />
                  <Line type="monotone" dataKey="avgDays" name="Avg Days" stroke="#a78bfa" strokeWidth={2} dot={{ r: 4, fill: "#a78bfa" }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* ── ROW 3: By Department + Version Control + Access Level ────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <Card className="xl:col-span-2">
            <CardHeader><CardTitle className="text-sm font-semibold">Documents by Department – Approved vs Pending</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={documentByDepartmentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="dept" stroke="#9ca3af" fontSize={11} />
                  <YAxis stroke="#9ca3af" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="approved" name="Approved" fill="#22c55e" stackId="a" />
                  <Bar dataKey="pending" name="Pending" fill="#f97316" radius={[4, 4, 0, 0]} stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Lock className="h-4 w-4 text-yellow-400" />
                Access Level Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={155}>
                <PieChart>
                  <Pie data={accessLevelData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={2} dataKey="value">
                    {accessLevelData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1 mt-2">
                {accessLevelData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-muted-foreground">{item.name}</span>
                    </div>
                    <span className="font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── ROW 4: Version Control + Storage Growth ──────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <RotateCcw className="h-4 w-4 text-blue-400" />
                Version Control – Document Revisions by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={documentVersionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="category" stroke="#9ca3af" fontSize={11} />
                  <YAxis stroke="#9ca3af" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="v1" name="v1 (Original)" fill="#3b82f6" stackId="a" />
                  <Bar dataKey="v2" name="v2 (1st Revision)" fill="#a78bfa" stackId="a" />
                  <Bar dataKey="v3Plus" name="v3+ (Multi-revised)" fill="#f97316" radius={[4, 4, 0, 0]} stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Upload className="h-4 w-4 text-green-400" />
                Storage Usage Growth (%)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={storageUsageData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" fontSize={11} />
                  <YAxis stroke="#9ca3af" fontSize={11} unit="%" domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} formatter={(value: number) => [`${value}%`, "Used"]} />
                  <Area type="monotone" dataKey="used" name="Storage Used" fill="#eab308" stroke="#eab308" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* ── PENDING APPROVAL TABLE ───────────────────────────────────────── */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-400" />
              Documents Pending Approval
            </CardTitle>
            <span className="text-xs text-muted-foreground">{pendingApprovalDocuments.length} documents awaiting sign-off</span>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 text-muted-foreground font-semibold uppercase tracking-wide">Doc ID</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-semibold uppercase tracking-wide">Title</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-semibold uppercase tracking-wide">Category</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-semibold uppercase tracking-wide">Submitted By</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-semibold uppercase tracking-wide">Submitted</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-semibold uppercase tracking-wide">Reviewer</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-semibold uppercase tracking-wide">Waiting</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingApprovalDocuments.map((doc) => (
                    <tr key={doc.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-muted-foreground">{doc.id}</td>
                      <td className="py-2.5 px-3 font-medium max-w-[200px] truncate">{doc.title}</td>
                      <td className="py-2.5 px-3 text-muted-foreground">{doc.category}</td>
                      <td className="py-2.5 px-3">{doc.submittedBy}</td>
                      <td className="py-2.5 px-3 text-muted-foreground">{doc.submittedDate}</td>
                      <td className="py-2.5 px-3 text-muted-foreground">{doc.reviewer}</td>
                      <td className="py-2.5 px-3"><WaitingBadge days={doc.daysWaiting} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* ── RECENT DOCUMENTS TABLE ───────────────────────────────────────── */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-400" />
              Recently Uploaded Documents
            </CardTitle>
            <span className="text-xs text-muted-foreground">Showing latest 6 records</span>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 text-muted-foreground font-semibold uppercase tracking-wide">Doc ID</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-semibold uppercase tracking-wide">Title</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-semibold uppercase tracking-wide">Category</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-semibold uppercase tracking-wide">Uploaded By</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-semibold uppercase tracking-wide">Date</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-semibold uppercase tracking-wide">Version</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-semibold uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentDocuments.map((doc) => (
                    <tr key={doc.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-muted-foreground">{doc.id}</td>
                      <td className="py-2.5 px-3 font-medium max-w-[200px] truncate">{doc.title}</td>
                      <td className="py-2.5 px-3 text-muted-foreground">{doc.category}</td>
                      <td className="py-2.5 px-3">{doc.uploadedBy}</td>
                      <td className="py-2.5 px-3 text-muted-foreground">{doc.date}</td>
                      <td className="py-2.5 px-3 font-mono text-muted-foreground">{doc.version}</td>
                      <td className="py-2.5 px-3"><StatusBadge status={doc.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* ── TOP VIEWED DOCUMENTS TABLE ───────────────────────────────────── */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Eye className="h-4 w-4 text-purple-400" />
              Top Viewed Documents
            </CardTitle>
            <span className="text-xs text-muted-foreground">Most accessed YTD {selectedYear}</span>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 text-muted-foreground font-semibold uppercase tracking-wide">Doc ID</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-semibold uppercase tracking-wide">Title</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-semibold uppercase tracking-wide">Category</th>
                    <th className="text-right py-2 px-3 text-muted-foreground font-semibold uppercase tracking-wide">Views</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-semibold uppercase tracking-wide">Last Viewed</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-semibold uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {topViewedDocuments.map((doc) => (
                    <tr key={doc.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-muted-foreground">{doc.id}</td>
                      <td className="py-2.5 px-3 font-medium max-w-[200px] truncate">{doc.title}</td>
                      <td className="py-2.5 px-3 text-muted-foreground">{doc.category}</td>
                      <td className="py-2.5 px-3 text-right font-semibold">{doc.views}</td>
                      <td className="py-2.5 px-3 text-muted-foreground">{doc.lastViewed}</td>
                      <td className="py-2.5 px-3"><StatusBadge status={doc.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

      </div>
    </DashboardPage>
  )
}
