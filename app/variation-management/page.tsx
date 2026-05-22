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
  AlertTriangle,
  ClipboardList,
  CircleDollarSign,
  MapPin,
  Clock,
  FileCheck,
  ArrowUpDown,
  BadgeCheck,
} from "lucide-react"

// ── DATA ──────────────────────────────────────────────────────────────────────

const variationTrendData = [
  { month: "Jan", submitted: 18, approved: 12, rejected: 3, pending: 3 },
  { month: "Feb", submitted: 22, approved: 15, rejected: 4, pending: 3 },
  { month: "Mar", submitted: 16, approved: 13, rejected: 2, pending: 1 },
  { month: "Apr", submitted: 27, approved: 18, rejected: 5, pending: 4 },
  { month: "May", submitted: 24, approved: 17, rejected: 3, pending: 4 },
  { month: "Jun", submitted: 31, approved: 22, rejected: 4, pending: 5 },
]

const variationStatusData = [
  { name: "Approved", value: 97, color: "#22c55e" },
  { name: "Pending Review", value: 31, color: "#eab308" },
  { name: "Under Negotiation", value: 18, color: "#3b82f6" },
  { name: "Rejected", value: 21, color: "#ef4444" },
  { name: "Withdrawn", value: 9, color: "#6b7280" },
]

const variationByTypeData = [
  { type: "Scope Addition", count: 52, value: 485000 },
  { type: "Scope Reduction", count: 18, value: -142000 },
  { type: "Design Change", count: 34, value: 298000 },
  { type: "Site Condition", count: 21, value: 176000 },
  { type: "Regulatory / Compliance", count: 15, value: 134000 },
  { type: "Client Instruction", count: 28, value: 241000 },
  { type: "Time Extension", count: 8, value: 62000 },
]

const variationByContractData = [
  { contract: "FM Contract A", submitted: 38, approved: 27, value: 412000 },
  { contract: "FM Contract B", submitted: 31, approved: 21, value: 328000 },
  { contract: "Civil Works", submitted: 24, approved: 18, value: 265000 },
  { contract: "M&E Contract", submitted: 29, approved: 20, value: 310000 },
  { contract: "Cleaning SVC", submitted: 16, approved: 11, value: 98000 },
]

const valueTrendData = [
  { month: "Jan", approved: 185000, rejected: 42000, pending: 38000 },
  { month: "Feb", approved: 224000, rejected: 58000, pending: 51000 },
  { month: "Mar", approved: 196000, rejected: 31000, pending: 22000 },
  { month: "Apr", approved: 278000, rejected: 74000, pending: 62000 },
  { month: "May", approved: 251000, rejected: 48000, pending: 55000 },
  { month: "Jun", approved: 319000, rejected: 61000, pending: 71000 },
]

const approvalTurnaroundData = [
  { month: "Jan", avgDays: 12 },
  { month: "Feb", avgDays: 18 },
  { month: "Mar", avgDays: 9 },
  { month: "Apr", avgDays: 15 },
  { month: "May", avgDays: 11 },
  { month: "Jun", avgDays: 13 },
]

const variationByLocationData = [
  { location: "Block A", count: 42, value: 388000 },
  { location: "Block B", count: 35, value: 312000 },
  { location: "Block C", count: 28, value: 241000 },
  { location: "Block D", count: 22, value: 198000 },
  { location: "Block E", count: 30, value: 275000 },
]

const contractBudgetImpactData = [
  { contract: "FM Contract A", original: 2400000, approved: 2812000, pending: 2900000 },
  { contract: "FM Contract B", original: 1800000, approved: 2128000, pending: 2210000 },
  { contract: "Civil Works", original: 1200000, approved: 1465000, pending: 1520000 },
  { contract: "M&E Contract", original: 1500000, approved: 1810000, pending: 1880000 },
]

const agingBucketData = [
  { range: "0–7 Days", count: 14, color: "#22c55e" },
  { range: "8–14 Days", count: 9, color: "#eab308" },
  { range: "15–30 Days", count: 12, color: "#f97316" },
  { range: "> 30 Days", count: 6, color: "#ef4444" },
]

const approvalRateByTypeData = [
  { type: "Scope Addition", rate: 82 },
  { type: "Design Change", rate: 76 },
  { type: "Site Condition", rate: 91 },
  { type: "Client Instruction", rate: 96 },
  { type: "Regulatory", rate: 88 },
  { type: "Scope Reduction", rate: 72 },
]

const variationRegister = [
  {
    id: "VO-0412",
    description: "Additional waterproofing works – Block A roof",
    type: "Scope Addition",
    contract: "Civil Works",
    location: "Block A – Rooftop",
    submittedBy: "Ahmad R.",
    submittedDate: "20 Jun 2025",
    value: "RM 48,500",
    status: "Pending Review",
    daysOpen: 3,
  },
  {
    id: "VO-0410",
    description: "Replacement of corroded chilled water pipes",
    type: "Site Condition",
    contract: "M&E Contract",
    location: "Block B – Basement",
    submittedBy: "Lim WK",
    submittedDate: "18 Jun 2025",
    value: "RM 62,000",
    status: "Under Negotiation",
    daysOpen: 5,
  },
  {
    id: "VO-0408",
    description: "Revised electrical layout – Level 3 office fit-out",
    type: "Design Change",
    contract: "FM Contract A",
    location: "Block C – Level 3",
    submittedBy: "David C.",
    submittedDate: "15 Jun 2025",
    value: "RM 31,200",
    status: "Approved",
    daysOpen: 8,
  },
  {
    id: "VO-0405",
    description: "CCTV system extension – additional 12 cameras",
    type: "Client Instruction",
    contract: "FM Contract B",
    location: "Block D – All Levels",
    submittedBy: "Farah N.",
    submittedDate: "12 Jun 2025",
    value: "RM 24,800",
    status: "Approved",
    daysOpen: 11,
  },
  {
    id: "VO-0401",
    description: "Fire detection system upgrade – BOMBA compliance",
    type: "Regulatory / Compliance",
    contract: "FM Contract A",
    location: "Block E – All Levels",
    submittedBy: "Muthu S.",
    submittedDate: "8 Jun 2025",
    value: "RM 55,000",
    status: "Pending Review",
    daysOpen: 15,
  },
  {
    id: "VO-0397",
    description: "Omit landscaping scope – Block D external",
    type: "Scope Reduction",
    contract: "Civil Works",
    location: "Block D – External",
    submittedBy: "Ahmad R.",
    submittedDate: "3 Jun 2025",
    value: "-RM 18,000",
    status: "Approved",
    daysOpen: 20,
  },
  {
    id: "VO-0392",
    description: "Additional drain clearing after flood event",
    type: "Site Condition",
    contract: "Cleaning SVC",
    location: "Block A – Basement",
    submittedBy: "Lim WK",
    submittedDate: "28 May 2025",
    value: "RM 8,400",
    status: "Rejected",
    daysOpen: 0,
  },
]

const COLORS = ["#3b82f6", "#f97316", "#22c55e", "#eab308", "#8b5cf6", "#ec4899", "#ef4444", "#6b7280"]

// ── HELPERS ───────────────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    Approved: "bg-green-500/20 text-green-400 border-green-500/30",
    "Pending Review": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    "Under Negotiation": "bg-blue-500/20 text-blue-400 border-blue-500/30",
    Rejected: "bg-red-500/20 text-red-400 border-red-500/30",
    Withdrawn: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${map[status] ?? ""}`}>
      {status}
    </span>
  )
}

const TypeBadge = ({ type }: { type: string }) => {
  const map: Record<string, string> = {
    "Scope Addition": "bg-purple-500/20 text-purple-400 border-purple-500/30",
    "Scope Reduction": "bg-gray-500/20 text-gray-400 border-gray-500/30",
    "Design Change": "bg-blue-500/20 text-blue-400 border-blue-500/30",
    "Site Condition": "bg-orange-500/20 text-orange-400 border-orange-500/30",
    "Regulatory / Compliance": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    "Client Instruction": "bg-green-500/20 text-green-400 border-green-500/30",
    "Time Extension": "bg-pink-500/20 text-pink-400 border-pink-500/30",
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${map[type] ?? ""}`}>
      {type}
    </span>
  )
}

const AgeBadge = ({ days }: { days: number }) => {
  if (days === 0) return null
  const color = days > 30
    ? "bg-red-500/20 text-red-400 border-red-500/30"
    : days > 14
    ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
    : days > 7
    ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
    : "bg-green-500/20 text-green-400 border-green-500/30"
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${color}`}>
      {days}d open
    </span>
  )
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────

export default function VariationManagementPage() {
  const [selectedYear, setSelectedYear] = useState("2025")
  const [selectedMonth, setSelectedMonth] = useState("All")
  const [selectedContract, setSelectedContract] = useState("all")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")

  return (
    <DashboardPage>
      <DashboardNav title="Variation Management" />

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
                <Label className="text-xs font-semibold text-primary">CONTRACT</Label>
                <Select value={selectedContract} onValueChange={setSelectedContract}>
                  <SelectTrigger className="w-[160px] bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Contracts</SelectItem>
                    <SelectItem value="fma">FM Contract A</SelectItem>
                    <SelectItem value="fmb">FM Contract B</SelectItem>
                    <SelectItem value="civil">Civil Works</SelectItem>
                    <SelectItem value="me">M&E Contract</SelectItem>
                    <SelectItem value="cleaning">Cleaning SVC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-primary">VARIATION TYPE</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-[180px] bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="scope-add">Scope Addition</SelectItem>
                    <SelectItem value="scope-red">Scope Reduction</SelectItem>
                    <SelectItem value="design">Design Change</SelectItem>
                    <SelectItem value="site">Site Condition</SelectItem>
                    <SelectItem value="regulatory">Regulatory / Compliance</SelectItem>
                    <SelectItem value="client">Client Instruction</SelectItem>
                    <SelectItem value="time">Time Extension</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-primary">STATUS</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-[170px] bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="pending">Pending Review</SelectItem>
                    <SelectItem value="negotiation">Under Negotiation</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="withdrawn">Withdrawn</SelectItem>
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
            <CardHeader className="pb-2"><CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Total Variations</CardTitle></CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">176</div>
              <div className="flex items-center gap-1 mt-1 text-xs font-medium text-blue-500">
                <TrendingUp className="h-3 w-3" />YTD {selectedYear}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
            <CardHeader className="pb-2"><CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Approved</CardTitle></CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">97</div>
              <p className="text-xs text-green-500 mt-1">55.1% approval rate</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20">
            <CardHeader className="pb-2"><CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Pending / Review</CardTitle></CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">49</div>
              <p className="text-xs text-yellow-500 mt-1">Awaiting decision</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20">
            <CardHeader className="pb-2"><CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Rejected</CardTitle></CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">21</div>
              <div className="flex items-center gap-1 mt-1 text-xs font-medium text-red-500">
                <TrendingUp className="h-3 w-3" />+4 vs last period
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
            <CardHeader className="pb-2"><CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Total VO Value</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">RM 1.45M</div>
              <p className="text-xs text-muted-foreground mt-1">Approved YTD</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
            <CardHeader className="pb-2"><CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Avg Approval Time</CardTitle></CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">13</div>
              <p className="text-xs text-muted-foreground mt-1">days avg</p>
            </CardContent>
          </Card>
        </div>

        {/* ── ROW 1: Volume Trend + Status Distribution ─────────────────────── */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader><CardTitle className="text-sm font-semibold">Monthly Variation Activity – Submitted vs Approved vs Rejected</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={variationTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" fontSize={11} />
                  <YAxis stroke="#9ca3af" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Area type="monotone" dataKey="submitted" name="Submitted" stackId="1" fill="#3b82f6" stroke="#3b82f6" fillOpacity={0.4} />
                  <Area type="monotone" dataKey="approved" name="Approved" stackId="2" fill="#22c55e" stroke="#22c55e" fillOpacity={0.4} />
                  <Area type="monotone" dataKey="rejected" name="Rejected" stackId="3" fill="#ef4444" stroke="#ef4444" fillOpacity={0.4} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm font-semibold">Variation Status Distribution</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={175}>
                <PieChart>
                  <Pie data={variationStatusData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={2} dataKey="value">
                    {variationStatusData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1 mt-2">
                {variationStatusData.map((item) => (
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

        {/* ── ROW 2: Value Trend + Aging Bucket + Approval Turnaround ─────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <CircleDollarSign className="h-4 w-4 text-green-400" />
                Monthly Variation Value – Approved vs Rejected vs Pending (RM)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={valueTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" fontSize={11} />
                  <YAxis stroke="#9ca3af" fontSize={11} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                  <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} formatter={(value: number) => [`RM ${(value / 1000).toFixed(0)}K`, ""]} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="approved" name="Approved" fill="#22c55e" stackId="a" />
                  <Bar dataKey="pending" name="Pending" fill="#eab308" stackId="a" />
                  <Bar dataKey="rejected" name="Rejected" fill="#ef4444" radius={[4, 4, 0, 0]} stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-400" />
                Open Variations by Ageing Bucket
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={agingBucketData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9ca3af" fontSize={11} />
                  <YAxis dataKey="range" type="category" stroke="#9ca3af" width={76} fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {agingBucketData.map((entry) => <Cell key={entry.range} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-2 text-center">
                  <div className="text-xs text-muted-foreground">Over 30 Days</div>
                  <div className="text-lg font-bold text-red-400">6</div>
                </div>
                <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-2 text-center">
                  <div className="text-xs text-muted-foreground">15–30 Days</div>
                  <div className="text-lg font-bold text-orange-400">12</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── ROW 3: By Type + Approval Rate by Type + Turnaround ──────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4 text-purple-400" />
                Variation Count by Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={variationByTypeData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9ca3af" fontSize={11} />
                  <YAxis dataKey="type" type="category" stroke="#9ca3af" width={120} fontSize={9} />
                  <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {variationByTypeData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-green-400" />
                Approval Rate by Variation Type (%)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={approvalRateByTypeData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9ca3af" fontSize={11} domain={[0, 100]} unit="%" />
                  <YAxis dataKey="type" type="category" stroke="#9ca3af" width={110} fontSize={9} />
                  <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} formatter={(value: number) => [`${value}%`, "Approval Rate"]} />
                  <Bar dataKey="rate" radius={[0, 4, 4, 0]}>
                    {approvalRateByTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.rate >= 90 ? "#22c55e" : entry.rate >= 80 ? "#eab308" : "#f97316"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm font-semibold">Avg Approval Turnaround Time (Days)</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={approvalTurnaroundData}>
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

        {/* ── ROW 4: By Contract + By Location + Contract Budget Impact ────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-sm font-semibold">Variations by Contract – Submitted vs Approved</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={variationByContractData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9ca3af" fontSize={11} />
                  <YAxis dataKey="contract" type="category" stroke="#9ca3af" width={98} fontSize={9} />
                  <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="submitted" name="Submitted" fill="#3b82f6" stackId="a" />
                  <Bar dataKey="approved" name="Approved" fill="#22c55e" radius={[0, 4, 4, 0]} stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm font-semibold">Variation Count & Value by Block</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={variationByLocationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="location" stroke="#9ca3af" fontSize={11} />
                  <YAxis stroke="#9ca3af" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} />
                  <Bar dataKey="count" name="No. of VOs" radius={[4, 4, 0, 0]}>
                    {variationByLocationData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-blue-400" />
                Contract Budget Impact Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-1.5 text-muted-foreground font-semibold uppercase tracking-wide">Contract</th>
                    <th className="text-right py-1.5 text-muted-foreground font-semibold uppercase tracking-wide">Original</th>
                    <th className="text-right py-1.5 text-muted-foreground font-semibold uppercase tracking-wide">Approved</th>
                    <th className="text-right py-1.5 text-muted-foreground font-semibold uppercase tracking-wide">+/-</th>
                  </tr>
                </thead>
                <tbody>
                  {contractBudgetImpactData.map((row) => {
                    const diff = row.approved - row.original
                    const pct = ((diff / row.original) * 100).toFixed(1)
                    return (
                      <tr key={row.contract} className="border-b border-border/50">
                        <td className="py-2 font-medium">{row.contract}</td>
                        <td className="py-2 text-right text-muted-foreground">RM {(row.original / 1000).toFixed(0)}K</td>
                        <td className="py-2 text-right text-blue-400 font-medium">RM {(row.approved / 1000).toFixed(0)}K</td>
                        <td className={`py-2 text-right font-semibold ${diff > 0 ? "text-orange-400" : "text-green-400"}`}>
                          +{pct}%
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              <div className="mt-3 rounded-lg bg-orange-500/10 border border-orange-500/20 p-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-semibold uppercase">Total Contract Uplift (Approved VOs)</span>
                  <span className="font-bold text-orange-400 text-sm">+ RM 1.45M</span>
                </div>
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="text-muted-foreground">Pending uplift (if all approved)</span>
                  <span className="font-semibold text-yellow-400">+ RM 1.67M</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── VARIATION REGISTER TABLE ─────────────────────────────────────── */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-blue-400" />
              Variation Order Register
            </CardTitle>
            <span className="text-xs text-muted-foreground">Showing latest 7 records</span>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 text-muted-foreground font-semibold uppercase tracking-wide">VO ID</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-semibold uppercase tracking-wide">Description</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-semibold uppercase tracking-wide">Type</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-semibold uppercase tracking-wide">Contract</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-semibold uppercase tracking-wide">Location</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-semibold uppercase tracking-wide">Submitted By</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-semibold uppercase tracking-wide">Date</th>
                    <th className="text-right py-2 px-3 text-muted-foreground font-semibold uppercase tracking-wide">Value</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-semibold uppercase tracking-wide">Age</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-semibold uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {variationRegister.map((vo) => (
                    <tr key={vo.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-muted-foreground">{vo.id}</td>
                      <td className="py-2.5 px-3 font-medium max-w-[200px] truncate">{vo.description}</td>
                      <td className="py-2.5 px-3"><TypeBadge type={vo.type} /></td>
                      <td className="py-2.5 px-3 text-muted-foreground">{vo.contract}</td>
                      <td className="py-2.5 px-3 text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3 flex-shrink-0" />{vo.location}</span>
                      </td>
                      <td className="py-2.5 px-3">{vo.submittedBy}</td>
                      <td className="py-2.5 px-3 text-muted-foreground">{vo.submittedDate}</td>
                      <td className={`py-2.5 px-3 text-right font-semibold ${vo.value.startsWith("-") ? "text-green-400" : "text-blue-400"}`}>
                        {vo.value}
                      </td>
                      <td className="py-2.5 px-3"><AgeBadge days={vo.daysOpen} /></td>
                      <td className="py-2.5 px-3"><StatusBadge status={vo.status} /></td>
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
