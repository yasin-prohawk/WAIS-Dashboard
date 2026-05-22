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
  CheckCircle2,
  MapPin,
  User,
  MessageSquareWarning,
} from "lucide-react"

// ── DATA ──────────────────────────────────────────────────────────────────────

const complaintTrendData = [
  { month: "Jan", received: 142, resolved: 130, overdue: 12 },
  { month: "Feb", received: 158, resolved: 140, overdue: 18 },
  { month: "Mar", received: 135, resolved: 128, overdue: 7 },
  { month: "Apr", received: 172, resolved: 155, overdue: 17 },
  { month: "May", received: 189, resolved: 164, overdue: 25 },
  { month: "Jun", received: 161, resolved: 150, overdue: 11 },
]

const complaintStatusData = [
  { name: "Resolved", value: 867, color: "#22c55e" },
  { name: "In Progress", value: 213, color: "#3b82f6" },
  { name: "Open / New", value: 98, color: "#f97316" },
  { name: "Overdue", value: 90, color: "#ef4444" },
  { name: "Closed (No Action)", value: 45, color: "#6b7280" },
]

const complaintCategoryData = [
  { category: "HVAC / Air-Cond", count: 312 },
  { category: "Plumbing", count: 248 },
  { category: "Electrical", count: 201 },
  { category: "Cleanliness", count: 178 },
  { category: "Lift / Elevator", count: 134 },
  { category: "Structural", count: 89 },
  { category: "Pest Control", count: 67 },
  { category: "Others", count: 54 },
]

const complaintByLocationData = [
  { location: "Block A", open: 28, inProgress: 45, resolved: 210 },
  { location: "Block B", open: 22, inProgress: 52, resolved: 195 },
  { location: "Block C", open: 18, inProgress: 38, resolved: 162 },
  { location: "Block D", open: 14, inProgress: 30, resolved: 140 },
  { location: "Block E", open: 16, inProgress: 48, resolved: 160 },
]

const slaComplianceData = [
  { month: "Jan", target: 95, actual: 91.5 },
  { month: "Feb", target: 95, actual: 88.6 },
  { month: "Mar", target: 95, actual: 94.8 },
  { month: "Apr", target: 95, actual: 90.1 },
  { month: "May", target: 95, actual: 86.8 },
  { month: "Jun", target: 95, actual: 93.2 },
]

const resolutionTimeData = [
  { month: "Jan", avgDays: 2.8 },
  { month: "Feb", avgDays: 3.4 },
  { month: "Mar", avgDays: 2.5 },
  { month: "Apr", avgDays: 3.1 },
  { month: "May", avgDays: 3.8 },
  { month: "Jun", avgDays: 2.9 },
]

const ageingBucketData = [
  { range: "0-1 Day", count: 38, color: "#22c55e" },
  { range: "2-3 Days", count: 52, color: "#3b82f6" },
  { range: "4-7 Days", count: 34, color: "#eab308" },
  { range: "8-14 Days", count: 21, color: "#f97316" },
  { range: ">14 Days", count: 18, color: "#ef4444" },
]

const technicianWorkloadData = [
  { name: "Ahmad R.", assigned: 24, resolved: 21, overdue: 3 },
  { name: "Lim WK", assigned: 19, resolved: 18, overdue: 1 },
  { name: "Muthu S.", assigned: 22, resolved: 17, overdue: 5 },
  { name: "Farah N.", assigned: 16, resolved: 15, overdue: 1 },
  { name: "David C.", assigned: 21, resolved: 19, overdue: 2 },
]

const repeatComplaintData = [
  { category: "HVAC / Air-Cond", firstTime: 260, repeat: 52 },
  { category: "Plumbing", firstTime: 210, repeat: 38 },
  { category: "Electrical", firstTime: 180, repeat: 21 },
  { category: "Cleanliness", firstTime: 158, repeat: 20 },
  { category: "Lift / Elevator", firstTime: 120, repeat: 14 },
]

const recentComplaints = [
  { id: "CMP-1042", subject: "Water leaking from ceiling", category: "Plumbing", location: "Block A – Level 3, Unit 3-12", priority: "High", status: "In Progress", age: "2 days", assignee: "Ahmad R." },
  { id: "CMP-1041", subject: "Air-cond not cooling", category: "HVAC / Air-Cond", location: "Block B – Level 5, Unit 5-08", priority: "Medium", status: "Open", age: "3 days", assignee: "Unassigned" },
  { id: "CMP-1039", subject: "Elevator stuck on floor 2", category: "Lift / Elevator", location: "Block C – Main Lobby", priority: "Critical", status: "In Progress", age: "1 day", assignee: "David C." },
  { id: "CMP-1037", subject: "Flickering lights in corridor", category: "Electrical", location: "Block D – Level 2 Corridor", priority: "Low", status: "Resolved", age: "5 days", assignee: "Lim WK" },
  { id: "CMP-1035", subject: "Clogged drain in restroom", category: "Plumbing", location: "Block E – Level 1, Male Restroom", priority: "High", status: "Overdue", age: "9 days", assignee: "Muthu S." },
  { id: "CMP-1033", subject: "Pest sighting (cockroach)", category: "Pest Control", location: "Block A – Level 1 Pantry", priority: "Medium", status: "Resolved", age: "4 days", assignee: "Farah N." },
]

const slaBreachData = [
  { category: "HVAC / Air-Cond", breaches: 22, total: 312, rate: 7.1 },
  { category: "Plumbing", breaches: 18, total: 248, rate: 7.3 },
  { category: "Electrical", breaches: 12, total: 201, rate: 6.0 },
  { category: "Lift / Elevator", breaches: 15, total: 134, rate: 11.2 },
  { category: "Structural", breaches: 11, total: 89, rate: 12.4 },
]

const COLORS = ["#3b82f6", "#f97316", "#22c55e", "#eab308", "#8b5cf6", "#ec4899", "#ef4444", "#6b7280"]

// ── HELPERS ───────────────────────────────────────────────────────────────────

const PriorityBadge = ({ priority }: { priority: string }) => {
  const map: Record<string, string> = {
    Critical: "bg-red-500/20 text-red-400 border-red-500/30",
    High: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    Medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    Low: "bg-green-500/20 text-green-400 border-green-500/30",
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${map[priority] ?? ""}`}>
      {priority}
    </span>
  )
}

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    Resolved: "bg-green-500/20 text-green-400 border-green-500/30",
    "In Progress": "bg-blue-500/20 text-blue-400 border-blue-500/30",
    Open: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    Overdue: "bg-red-500/20 text-red-400 border-red-500/30",
    "Closed (No Action)": "bg-gray-500/20 text-gray-400 border-gray-500/30",
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${map[status] ?? ""}`}>
      {status}
    </span>
  )
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────

export default function ComplaintModulePage() {
  const [selectedYear, setSelectedYear] = useState("2025")
  const [selectedMonth, setSelectedMonth] = useState("All")
  const [selectedBlock, setSelectedBlock] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState("all")

  return (
    <DashboardPage>
      <DashboardNav title="Complaint Management Module" />

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
                <Label className="text-xs font-semibold text-primary">SELECT FACILITY</Label>
                <Select value={selectedBlock} onValueChange={setSelectedBlock}>
                  <SelectTrigger className="w-[140px] bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Blocks</SelectItem>
                    <SelectItem value="a">Block A</SelectItem>
                    <SelectItem value="b">Block B</SelectItem>
                    <SelectItem value="c">Block C</SelectItem>
                    <SelectItem value="d">Block D</SelectItem>
                    <SelectItem value="e">Block E</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-primary">CATEGORY</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[160px] bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="hvac">HVAC / Air-Cond</SelectItem>
                    <SelectItem value="plumbing">Plumbing</SelectItem>
                    <SelectItem value="electrical">Electrical</SelectItem>
                    <SelectItem value="cleanliness">Cleanliness</SelectItem>
                    <SelectItem value="lift">Lift / Elevator</SelectItem>
                    <SelectItem value="structural">Structural</SelectItem>
                    <SelectItem value="pest">Pest Control</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-primary">SELECT USER</Label>
                <Select defaultValue="all">
                  <SelectTrigger className="w-[140px] bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="ahmad">Ahmad R.</SelectItem>
                    <SelectItem value="lim">Lim WK</SelectItem>
                    <SelectItem value="muthu">Muthu S.</SelectItem>
                    <SelectItem value="farah">Farah N.</SelectItem>
                    <SelectItem value="david">David C.</SelectItem>
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
            <CardHeader className="pb-2"><CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Total Complaints</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold">1,313</div><p className="text-xs text-muted-foreground mt-1">YTD {selectedYear}</p></CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
            <CardHeader className="pb-2"><CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Open / New</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold">98</div><p className="text-xs text-orange-500 mt-1">Awaiting assignment</p></CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
            <CardHeader className="pb-2"><CardTitle className="text-xs font-semibold text-muted-foreground uppercase">In Progress</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold">213</div><p className="text-xs text-muted-foreground mt-1">Being attended</p></CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
            <CardHeader className="pb-2"><CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Resolved</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold">867</div><p className="text-xs text-green-500 mt-1">66.0% resolution rate</p></CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20">
            <CardHeader className="pb-2"><CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Overdue</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold">90</div><p className="text-xs text-red-500 mt-1">SLA breached</p></CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
            <CardHeader className="pb-2"><CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Avg Resolution</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold">3.1</div><p className="text-xs text-muted-foreground mt-1">days avg</p></CardContent>
          </Card>
        </div>

        {/* ── ROW 1: Trend + Status ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader><CardTitle className="text-sm font-semibold">Monthly Complaint Volume – Received vs Resolved vs Overdue</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={complaintTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" fontSize={11} />
                  <YAxis stroke="#9ca3af" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Area type="monotone" dataKey="received" name="Received" stackId="1" fill="#3b82f6" stroke="#3b82f6" fillOpacity={0.5} />
                  <Area type="monotone" dataKey="resolved" name="Resolved" stackId="2" fill="#22c55e" stroke="#22c55e" fillOpacity={0.5} />
                  <Area type="monotone" dataKey="overdue" name="Overdue" stackId="3" fill="#ef4444" stroke="#ef4444" fillOpacity={0.5} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm font-semibold">Complaint Status Distribution</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={175}>
                <PieChart>
                  <Pie data={complaintStatusData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={2} dataKey="value">
                    {complaintStatusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1 mt-2">
                {complaintStatusData.map((item) => (
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

        {/* ── ROW 2: Category + Ageing + Resolution Time ───────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-sm font-semibold">Complaint Count by Category</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={complaintCategoryData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9ca3af" fontSize={11} />
                  <YAxis dataKey="category" type="category" stroke="#9ca3af" width={100} fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {complaintCategoryData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm font-semibold">Open Complaints by Ageing Bucket</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={ageingBucketData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9ca3af" fontSize={11} />
                  <YAxis dataKey="range" type="category" stroke="#9ca3af" width={72} fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {ageingBucketData.map((entry) => <Cell key={entry.range} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm font-semibold">Avg Resolution Time (Days)</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={resolutionTimeData}>
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

        {/* ── ROW 3: Location + Repeat Complaints ──────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <Card className="xl:col-span-2">
            <CardHeader><CardTitle className="text-sm font-semibold">Complaint Count by Block – Open vs In Progress vs Resolved</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={complaintByLocationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="location" stroke="#9ca3af" fontSize={11} />
                  <YAxis stroke="#9ca3af" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="resolved" name="Resolved" fill="#22c55e" stackId="a" />
                  <Bar dataKey="inProgress" name="In Progress" fill="#3b82f6" stackId="a" />
                  <Bar dataKey="open" name="Open" fill="#f97316" radius={[4, 4, 0, 0]} stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm font-semibold">First-Time vs Repeat Complaints</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={repeatComplaintData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9ca3af" fontSize={11} />
                  <YAxis dataKey="category" type="category" stroke="#9ca3af" width={100} fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="firstTime" name="First-Time" fill="#3b82f6" stackId="a" />
                  <Bar dataKey="repeat" name="Repeat" fill="#f97316" radius={[0, 4, 4, 0]} stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* ── ROW 4: SLA + Technician ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                SLA Performance Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-3">
                  <div className="text-xs text-muted-foreground font-semibold uppercase">SLA Rate</div>
                  <div className="text-2xl font-bold mt-1">90.8%</div>
                  <div className="flex items-center gap-1 text-xs text-red-400 mt-0.5"><TrendingDown className="h-3 w-3" />-2.1%</div>
                </div>
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3">
                  <div className="text-xs text-muted-foreground font-semibold uppercase">Breaches</div>
                  <div className="text-2xl font-bold mt-1">90</div>
                  <div className="flex items-center gap-1 text-xs text-red-400 mt-0.5"><TrendingUp className="h-3 w-3" />+8 cases</div>
                </div>
                <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-3">
                  <div className="text-xs text-muted-foreground font-semibold uppercase">Target</div>
                  <div className="text-2xl font-bold mt-1">95%</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Contractual</div>
                </div>
                <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-3">
                  <div className="text-xs text-muted-foreground font-semibold uppercase">On-Target</div>
                  <div className="text-2xl font-bold mt-1">2/6</div>
                  <div className="text-xs text-orange-400 mt-0.5">Months met</div>
                </div>
              </div>
              <table className="w-full text-xs mt-1">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-1 text-muted-foreground font-semibold uppercase tracking-wide">Category</th>
                    <th className="text-right py-1 text-muted-foreground font-semibold uppercase tracking-wide">Breach Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {slaBreachData.map((row) => (
                    <tr key={row.category} className="border-b border-border/50">
                      <td className="py-1.5">{row.category}</td>
                      <td className={`py-1.5 text-right font-semibold ${row.rate > 10 ? "text-red-400" : row.rate > 7 ? "text-orange-400" : "text-green-400"}`}>{row.rate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm font-semibold">SLA Compliance Rate vs Target</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={slaComplianceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" fontSize={11} />
                  <YAxis stroke="#9ca3af" fontSize={11} domain={[80, 100]} unit="%" />
                  <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} formatter={(value: number) => [`${value}%`, ""]} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="target" name="Target (95%)" stroke="#eab308" strokeWidth={2} strokeDasharray="6 3" dot={false} />
                  <Line type="monotone" dataKey="actual" name="Actual" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4, fill: "#3b82f6" }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <User className="h-4 w-4 text-blue-400" />
                Technician Workload
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={technicianWorkloadData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} />
                  <YAxis stroke="#9ca3af" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="resolved" name="Resolved" fill="#22c55e" stackId="a" />
                  <Bar dataKey="overdue" name="Overdue" fill="#ef4444" radius={[4, 4, 0, 0]} stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* ── RECENT COMPLAINTS TABLE ───────────────────────────────────────── */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <MessageSquareWarning className="h-4 w-4 text-orange-400" />
              Recent Complaints
            </CardTitle>
            <span className="text-xs text-muted-foreground">Showing latest 6 records</span>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 text-muted-foreground font-semibold uppercase tracking-wide">ID</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-semibold uppercase tracking-wide">Subject</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-semibold uppercase tracking-wide">Category</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-semibold uppercase tracking-wide">Location</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-semibold uppercase tracking-wide">Priority</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-semibold uppercase tracking-wide">Status</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-semibold uppercase tracking-wide">Age</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-semibold uppercase tracking-wide">Assignee</th>
                  </tr>
                </thead>
                <tbody>
                  {recentComplaints.map((c) => (
                    <tr key={c.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-muted-foreground">{c.id}</td>
                      <td className="py-2.5 px-3 font-medium max-w-[180px] truncate">{c.subject}</td>
                      <td className="py-2.5 px-3 text-muted-foreground">{c.category}</td>
                      <td className="py-2.5 px-3 text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3 flex-shrink-0" />{c.location}</span>
                      </td>
                      <td className="py-2.5 px-3"><PriorityBadge priority={c.priority} /></td>
                      <td className="py-2.5 px-3"><StatusBadge status={c.status} /></td>
                      <td className="py-2.5 px-3 text-muted-foreground">{c.age}</td>
                      <td className="py-2.5 px-3">{c.assignee}</td>
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
