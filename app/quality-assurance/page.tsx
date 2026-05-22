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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  Legend,
} from "recharts"
import DashboardNav from "@/components/dashboard-nav"
import { DashboardPage } from "@/components/dashboard-page"
import {
  Filter,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileCheck,
  ShieldCheck,
  ClipboardList,
  ThumbsUp,
  MapPin,
} from "lucide-react"

// ── DATA ──────────────────────────────────────────────────────────────────────

const auditTrendData = [
  { month: "Jan", scheduled: 15, completed: 12, passed: 10 },
  { month: "Feb", scheduled: 16, completed: 14, passed: 13 },
  { month: "Mar", scheduled: 15, completed: 15, passed: 14 },
  { month: "Apr", scheduled: 14, completed: 13, passed: 11 },
  { month: "May", scheduled: 18, completed: 16, passed: 15 },
  { month: "Jun", scheduled: 17, completed: 17, passed: 16 },
]

const complianceScoreData = [
  { dept: "Facility Mgmt", score: 94 },
  { dept: "Engineering", score: 88 },
  { dept: "Compliance", score: 96 },
  { dept: "Operations", score: 82 },
  { dept: "Finance", score: 91 },
  { dept: "HR / Admin", score: 87 },
]

const nonConformanceData = [
  { name: "Critical", value: 8, color: "#ef4444" },
  { name: "Major", value: 23, color: "#f97316" },
  { name: "Minor", value: 45, color: "#eab308" },
  { name: "Observation", value: 34, color: "#3b82f6" },
]

const correctiveActionsData = [
  { name: "Completed", value: 68, color: "#22c55e" },
  { name: "In Progress", value: 42, color: "#3b82f6" },
  { name: "Overdue", value: 15, color: "#ef4444" },
]

const riskLevelData = [
  { category: "Documentation", high: 5, medium: 12, low: 23 },
  { category: "Equipment", high: 8, medium: 15, low: 18 },
  { category: "Process", high: 3, medium: 10, low: 25 },
  { category: "Staff Training", high: 6, medium: 14, low: 20 },
  { category: "Safety", high: 4, medium: 9, low: 22 },
]

const ncTrendData = [
  { month: "Jan", critical: 3, major: 8, minor: 18 },
  { month: "Feb", critical: 5, major: 10, minor: 22 },
  { month: "Mar", critical: 2, major: 7, minor: 14 },
  { month: "Apr", critical: 4, major: 12, minor: 19 },
  { month: "May", critical: 6, major: 9, minor: 16 },
  { month: "Jun", critical: 3, major: 11, minor: 21 },
]

const auditScoreByAreaData = [
  { area: "Block A", score: 91 },
  { area: "Block B", score: 86 },
  { area: "Block C", score: 93 },
  { area: "Block D", score: 78 },
  { area: "Block E", score: 88 },
]

const caResolutionTimeData = [
  { month: "Jan", avgDays: 8.2 },
  { month: "Feb", avgDays: 10.4 },
  { month: "Mar", avgDays: 7.1 },
  { month: "Apr", avgDays: 9.3 },
  { month: "May", avgDays: 6.8 },
  { month: "Jun", avgDays: 7.5 },
]

const qualityRadarData = [
  { subject: "Documentation", score: 88, fullMark: 100 },
  { subject: "Process Adherence", score: 82, fullMark: 100 },
  { subject: "Staff Competency", score: 76, fullMark: 100 },
  { subject: "Equipment Upkeep", score: 91, fullMark: 100 },
  { subject: "Safety Compliance", score: 94, fullMark: 100 },
  { subject: "Audit Readiness", score: 79, fullMark: 100 },
]

const complianceTrendData = [
  { month: "Jan", target: 90, actual: 87.2 },
  { month: "Feb", target: 90, actual: 89.5 },
  { month: "Mar", target: 90, actual: 92.1 },
  { month: "Apr", target: 90, actual: 88.4 },
  { month: "May", target: 90, actual: 91.8 },
  { month: "Jun", target: 90, actual: 92.5 },
]

const openAudits = [
  { id: "AUD-0412", title: "Block A – Fire Safety Audit", dept: "Facility Mgmt", auditor: "En. Hafiz", dueDate: "28 Jun 2025", daysLeft: 5, status: "In Progress" },
  { id: "AUD-0411", title: "Electrical Systems Compliance", dept: "Engineering", auditor: "Lim WK", dueDate: "25 Jun 2025", daysLeft: 2, status: "In Progress" },
  { id: "AUD-0409", title: "Quarterly HR Policy Review", dept: "HR / Admin", auditor: "Pn. Suraya", dueDate: "30 Jun 2025", daysLeft: 7, status: "Scheduled" },
  { id: "AUD-0407", title: "HVAC Maintenance SOP Audit", dept: "Operations", auditor: "Ahmad R.", dueDate: "22 Jun 2025", daysLeft: -1, status: "Overdue" },
  { id: "AUD-0405", title: "Contractor Safety Induction Audit", dept: "Compliance", auditor: "En. Hafiz", dueDate: "20 Jun 2025", daysLeft: -3, status: "Overdue" },
]

const openNonConformances = [
  { id: "NC-0312", description: "Missing service records for Chiller Unit #3", area: "Block A – Plant Room", severity: "Critical", raisedBy: "En. Hafiz", age: "8 days", assignee: "Ahmad R." },
  { id: "NC-0310", description: "Expired fire extinguisher tags on Level 2", area: "Block B – Level 2", severity: "Major", raisedBy: "Lim WK", age: "5 days", assignee: "David C." },
  { id: "NC-0308", description: "Incomplete PPE checklist for rooftop works", area: "Block C – Roof", severity: "Major", raisedBy: "Pn. Suraya", age: "11 days", assignee: "Muthu S." },
  { id: "NC-0306", description: "Unrecorded corrective maintenance on AHU #7", area: "Block D – Level 4", severity: "Minor", raisedBy: "Ahmad R.", age: "3 days", assignee: "Lim WK" },
  { id: "NC-0304", description: "Staff lacking refresher training on LOTO", area: "Block E – Workshop", severity: "Major", raisedBy: "En. Hafiz", age: "14 days", assignee: "Farah N." },
]

const COLORS = ["#3b82f6", "#f97316", "#22c55e", "#eab308", "#8b5cf6", "#ec4899", "#ef4444", "#6b7280"]

// ── HELPERS ───────────────────────────────────────────────────────────────────

const SeverityBadge = ({ severity }: { severity: string }) => {
  const map: Record<string, string> = {
    Critical: "bg-red-500/20 text-red-400 border-red-500/30",
    Major: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    Minor: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    Observation: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${map[severity] ?? ""}`}>
      {severity}
    </span>
  )
}

const AuditStatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    Scheduled: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    "In Progress": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    Completed: "bg-green-500/20 text-green-400 border-green-500/30",
    Overdue: "bg-red-500/20 text-red-400 border-red-500/30",
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${map[status] ?? ""}`}>
      {status}
    </span>
  )
}

const DaysLeftBadge = ({ days }: { days: number }) => {
  const color = days < 0
    ? "bg-red-500/20 text-red-400 border-red-500/30"
    : days <= 3
    ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
    : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
  const label = days < 0 ? `${Math.abs(days)}d overdue` : `${days}d left`
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${color}`}>
      {label}
    </span>
  )
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────

export default function QualityAssurancePage() {
  const [selectedYear, setSelectedYear] = useState("2025")
  const [selectedMonth, setSelectedMonth] = useState("All")
  const [selectedDept, setSelectedDept] = useState("all")
  const [selectedQuarter, setSelectedQuarter] = useState("all")

  return (
    <DashboardPage>
      <DashboardNav title="Quality Assurance Program" />

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
                <Label className="text-xs font-semibold text-primary">QUARTER</Label>
                <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
                  <SelectTrigger className="w-[130px] bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Quarters</SelectItem>
                    <SelectItem value="q1">Q1</SelectItem>
                    <SelectItem value="q2">Q2</SelectItem>
                    <SelectItem value="q3">Q3</SelectItem>
                    <SelectItem value="q4">Q4</SelectItem>
                  </SelectContent>
                </Select>
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
          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
            <CardHeader className="pb-2"><CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Audits Completed</CardTitle></CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">87</div>
              <div className="flex items-center gap-1 mt-1 text-xs font-medium text-green-500">
                <TrendingUp className="h-3 w-3" />+12 from last period
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
            <CardHeader className="pb-2"><CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Compliance Score</CardTitle></CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">92.5%</div>
              <p className="text-xs text-green-500 mt-1">Above 90% target</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
            <CardHeader className="pb-2"><CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Pending Actions</CardTitle></CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">57</div>
              <p className="text-xs text-orange-500 mt-1">15 overdue</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20">
            <CardHeader className="pb-2"><CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Non-Conformances</CardTitle></CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">110</div>
              <p className="text-xs text-red-500 mt-1">8 critical issues</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
            <CardHeader className="pb-2"><CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Avg CA Resolution</CardTitle></CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">8.2</div>
              <p className="text-xs text-muted-foreground mt-1">days avg</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20">
            <CardHeader className="pb-2"><CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Audit Pass Rate</CardTitle></CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">89.7%</div>
              <div className="flex items-center gap-1 mt-1 text-xs font-medium text-red-500">
                <TrendingDown className="h-3 w-3" />-1.4% vs last period
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── ROW 1: Audit Trend + Compliance Trend ────────────────────────── */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader><CardTitle className="text-sm font-semibold">Audit Activity – Scheduled vs Completed vs Passed</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={auditTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" fontSize={11} />
                  <YAxis stroke="#9ca3af" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Area type="monotone" dataKey="scheduled" name="Scheduled" stackId="1" fill="#3b82f6" stroke="#3b82f6" fillOpacity={0.4} />
                  <Area type="monotone" dataKey="completed" name="Completed" stackId="2" fill="#a78bfa" stroke="#a78bfa" fillOpacity={0.4} />
                  <Area type="monotone" dataKey="passed" name="Passed" stackId="3" fill="#22c55e" stroke="#22c55e" fillOpacity={0.4} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm font-semibold">Compliance Score vs Target</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={complianceTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" fontSize={11} />
                  <YAxis stroke="#9ca3af" fontSize={11} domain={[80, 100]} unit="%" />
                  <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} formatter={(value: number) => [`${value}%`, ""]} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="target" name="Target (90%)" stroke="#eab308" strokeWidth={2} strokeDasharray="6 3" dot={false} />
                  <Line type="monotone" dataKey="actual" name="Actual" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4, fill: "#3b82f6" }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* ── ROW 2: NC Distribution + CA Status + NC Trend ────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-sm font-semibold">Non-Conformance by Severity</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={175}>
                <PieChart>
                  <Pie data={nonConformanceData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={2} dataKey="value">
                    {nonConformanceData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {nonConformanceData.map((item) => (
                  <div key={item.name} className="flex items-center gap-1.5 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground">{item.name}</span>
                    <span className="font-medium ml-auto">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm font-semibold">Corrective Actions Status</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={175}>
                <PieChart>
                  <Pie data={correctiveActionsData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={2} dataKey="value">
                    {correctiveActionsData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {correctiveActionsData.map((item) => (
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

          <Card>
            <CardHeader><CardTitle className="text-sm font-semibold">Non-Conformance Trend by Severity</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={ncTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" fontSize={11} />
                  <YAxis stroke="#9ca3af" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Area type="monotone" dataKey="minor" name="Minor" stackId="1" fill="#eab308" stroke="#eab308" fillOpacity={0.5} />
                  <Area type="monotone" dataKey="major" name="Major" stackId="1" fill="#f97316" stroke="#f97316" fillOpacity={0.5} />
                  <Area type="monotone" dataKey="critical" name="Critical" stackId="1" fill="#ef4444" stroke="#ef4444" fillOpacity={0.5} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* ── ROW 3: Compliance by Dept + Audit Score by Area + CA Resolution ─ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-sm font-semibold">Compliance Score by Department</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={complianceScoreData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9ca3af" fontSize={11} domain={[0, 100]} unit="%" />
                  <YAxis dataKey="dept" type="category" stroke="#9ca3af" width={88} fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} formatter={(value: number) => [`${value}%`, "Score"]} />
                  <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                    {complianceScoreData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.score >= 90 ? "#22c55e" : entry.score >= 85 ? "#eab308" : "#ef4444"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm font-semibold">Audit Score by Block / Area</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={auditScoreByAreaData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="area" stroke="#9ca3af" fontSize={11} />
                  <YAxis stroke="#9ca3af" fontSize={11} domain={[0, 100]} unit="%" />
                  <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} formatter={(value: number) => [`${value}%`, "Score"]} />
                  <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                    {auditScoreByAreaData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.score >= 90 ? "#22c55e" : entry.score >= 85 ? "#eab308" : "#ef4444"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm font-semibold">Corrective Action Avg Resolution Time (Days)</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={caResolutionTimeData}>
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

        {/* ── ROW 4: Risk Assessment + Quality Radar ───────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <Card className="xl:col-span-2">
            <CardHeader><CardTitle className="text-sm font-semibold">Risk Assessment by Category – High / Medium / Low</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={riskLevelData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="category" stroke="#9ca3af" fontSize={11} />
                  <YAxis stroke="#9ca3af" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="high" name="High" fill="#ef4444" stackId="a" />
                  <Bar dataKey="medium" name="Medium" fill="#eab308" stackId="a" />
                  <Bar dataKey="low" name="Low" fill="#22c55e" radius={[4, 4, 0, 0]} stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm font-semibold">Quality Health Index</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={qualityRadarData}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="subject" stroke="#9ca3af" fontSize={10} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#4b5563" fontSize={9} />
                  <Radar name="Score" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* ── OPEN AUDITS TABLE ─────────────────────────────────────────────── */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-blue-400" />
              Open Audits
            </CardTitle>
            <span className="text-xs text-muted-foreground">{openAudits.length} audits in progress or overdue</span>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 text-muted-foreground font-semibold uppercase tracking-wide">Audit ID</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-semibold uppercase tracking-wide">Title</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-semibold uppercase tracking-wide">Department</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-semibold uppercase tracking-wide">Auditor</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-semibold uppercase tracking-wide">Due Date</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-semibold uppercase tracking-wide">Timeline</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-semibold uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {openAudits.map((audit) => (
                    <tr key={audit.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-muted-foreground">{audit.id}</td>
                      <td className="py-2.5 px-3 font-medium max-w-[200px] truncate">{audit.title}</td>
                      <td className="py-2.5 px-3 text-muted-foreground">{audit.dept}</td>
                      <td className="py-2.5 px-3">{audit.auditor}</td>
                      <td className="py-2.5 px-3 text-muted-foreground">{audit.dueDate}</td>
                      <td className="py-2.5 px-3"><DaysLeftBadge days={audit.daysLeft} /></td>
                      <td className="py-2.5 px-3"><AuditStatusBadge status={audit.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* ── OPEN NON-CONFORMANCES TABLE ───────────────────────────────────── */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              Open Non-Conformances
            </CardTitle>
            <span className="text-xs text-muted-foreground">{openNonConformances.length} items requiring corrective action</span>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 text-muted-foreground font-semibold uppercase tracking-wide">NC ID</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-semibold uppercase tracking-wide">Description</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-semibold uppercase tracking-wide">Area</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-semibold uppercase tracking-wide">Severity</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-semibold uppercase tracking-wide">Raised By</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-semibold uppercase tracking-wide">Age</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-semibold uppercase tracking-wide">Assignee</th>
                  </tr>
                </thead>
                <tbody>
                  {openNonConformances.map((nc) => (
                    <tr key={nc.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-muted-foreground">{nc.id}</td>
                      <td className="py-2.5 px-3 font-medium max-w-[220px] truncate">{nc.description}</td>
                      <td className="py-2.5 px-3 text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3 flex-shrink-0" />{nc.area}</span>
                      </td>
                      <td className="py-2.5 px-3"><SeverityBadge severity={nc.severity} /></td>
                      <td className="py-2.5 px-3 text-muted-foreground">{nc.raisedBy}</td>
                      <td className="py-2.5 px-3 text-muted-foreground">{nc.age}</td>
                      <td className="py-2.5 px-3">{nc.assignee}</td>
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
