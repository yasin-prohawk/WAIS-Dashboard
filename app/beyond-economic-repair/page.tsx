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
import {
  Filter,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Wrench,
  BadgeDollarSign,
  PackageX,
  ClipboardList,
  MapPin,
  ArrowRightLeft,
  CircleDollarSign,
} from "lucide-react"

// ── DATA ──────────────────────────────────────────────────────────────────────

const berTrendData = [
  { month: "Jan", raised: 8, approved: 5, disposed: 3 },
  { month: "Feb", raised: 11, approved: 7, disposed: 5 },
  { month: "Mar", raised: 7, approved: 6, disposed: 6 },
  { month: "Apr", raised: 14, approved: 9, disposed: 7 },
  { month: "May", raised: 10, approved: 8, disposed: 8 },
  { month: "Jun", raised: 13, approved: 10, disposed: 9 },
]

const berStatusData = [
  { name: "Pending Assessment", value: 18, color: "#eab308" },
  { name: "Approved for Disposal", value: 34, color: "#ef4444" },
  { name: "Awaiting Replacement", value: 22, color: "#f97316" },
  { name: "Replaced", value: 61, color: "#22c55e" },
  { name: "Pending Approval", value: 14, color: "#3b82f6" },
]

const berByCategoryData = [
  { category: "HVAC / Chiller", count: 28 },
  { category: "Electrical", count: 22 },
  { category: "Plumbing", count: 16 },
  { category: "Lift / Elevator", count: 12 },
  { category: "Fire System", count: 10 },
  { category: "BMS / Controls", count: 8 },
  { category: "Structural", count: 7 },
  { category: "Others", count: 6 },
]

const berByLocationData = [
  { location: "Block A", ber: 32, replaced: 22 },
  { location: "Block B", ber: 27, replaced: 18 },
  { location: "Block C", ber: 21, replaced: 15 },
  { location: "Block D", ber: 18, replaced: 10 },
  { location: "Block E", ber: 24, replaced: 16 },
]

const replacementCostData = [
  { month: "Jan", budgeted: 180000, actual: 152000 },
  { month: "Feb", budgeted: 220000, actual: 241000 },
  { month: "Mar", budgeted: 195000, actual: 188000 },
  { month: "Apr", budgeted: 260000, actual: 278000 },
  { month: "May", budgeted: 240000, actual: 225000 },
  { month: "Jun", budgeted: 280000, actual: 263000 },
]

const assetAgeAtBerData = [
  { range: "< 5 Years", count: 12, color: "#ef4444" },
  { range: "5–10 Years", count: 28, color: "#f97316" },
  { range: "10–15 Years", count: 45, color: "#eab308" },
  { range: "15–20 Years", count: 38, color: "#3b82f6" },
  { range: "> 20 Years", count: 26, color: "#6b7280" },
]

const repairVsReplaceData = [
  { category: "HVAC / Chiller", repairCost: 85000, replaceCost: 62000 },
  { category: "Electrical", repairCost: 48000, replaceCost: 31000 },
  { category: "Plumbing", repairCost: 22000, replaceCost: 15000 },
  { category: "Lift / Elevator", repairCost: 120000, replaceCost: 95000 },
  { category: "Fire System", repairCost: 35000, replaceCost: 28000 },
]

const disposalMethodData = [
  { name: "Scrapped", value: 42, color: "#6b7280" },
  { name: "Sold / Auctioned", value: 18, color: "#22c55e" },
  { name: "Donated", value: 8, color: "#3b82f6" },
  { name: "Returned to Vendor", value: 11, color: "#a78bfa" },
  { name: "Pending Disposal", value: 21, color: "#eab308" },
]

const replacementLeadTimeData = [
  { month: "Jan", avgDays: 22 },
  { month: "Feb", avgDays: 31 },
  { month: "Mar", avgDays: 18 },
  { month: "Apr", avgDays: 27 },
  { month: "May", avgDays: 24 },
  { month: "Jun", avgDays: 20 },
]

const costSavingsData = [
  { month: "Jan", savings: 28000 },
  { month: "Feb", savings: -21000 },
  { month: "Mar", savings: 7000 },
  { month: "Apr", savings: -18000 },
  { month: "May", savings: 15000 },
  { month: "Jun", savings: 17000 },
]

const berAssetList = [
  {
    id: "BER-0412",
    assetId: "AST-1182",
    name: "Chiller Unit #2",
    category: "HVAC / Chiller",
    location: "Block A – Plant Room",
    age: "18 yrs",
    repairCost: "RM 92,000",
    replaceCost: "RM 68,000",
    status: "Approved for Disposal",
    raisedBy: "Ahmad R.",
    raisedDate: "18 Jun 2025",
  },
  {
    id: "BER-0410",
    assetId: "AST-0874",
    name: "Main Switchboard Panel",
    category: "Electrical",
    location: "Block B – Basement",
    age: "22 yrs",
    repairCost: "RM 55,000",
    replaceCost: "RM 38,000",
    status: "Awaiting Replacement",
    raisedBy: "Lim WK",
    raisedDate: "15 Jun 2025",
  },
  {
    id: "BER-0408",
    assetId: "AST-0631",
    name: "Elevator #4 Control Unit",
    category: "Lift / Elevator",
    location: "Block C – Tower",
    age: "16 yrs",
    repairCost: "RM 130,000",
    replaceCost: "RM 98,000",
    status: "Pending Assessment",
    raisedBy: "David C.",
    raisedDate: "12 Jun 2025",
  },
  {
    id: "BER-0405",
    assetId: "AST-1047",
    name: "AHU Unit #9",
    category: "HVAC / Chiller",
    location: "Block D – Level 5",
    age: "14 yrs",
    repairCost: "RM 41,000",
    replaceCost: "RM 29,500",
    status: "Pending Approval",
    raisedBy: "Muthu S.",
    raisedDate: "10 Jun 2025",
  },
  {
    id: "BER-0401",
    assetId: "AST-0512",
    name: "Fire Suppression Pump",
    category: "Fire System",
    location: "Block E – Basement",
    age: "19 yrs",
    repairCost: "RM 48,000",
    replaceCost: "RM 33,000",
    status: "Approved for Disposal",
    raisedBy: "Farah N.",
    raisedDate: "6 Jun 2025",
  },
  {
    id: "BER-0398",
    assetId: "AST-0388",
    name: "BMS Controller Node #3",
    category: "BMS / Controls",
    location: "Block A – Server Room",
    age: "11 yrs",
    repairCost: "RM 28,000",
    replaceCost: "RM 19,000",
    status: "Replaced",
    raisedBy: "Ahmad R.",
    raisedDate: "1 Jun 2025",
  },
]

const COLORS = ["#3b82f6", "#f97316", "#22c55e", "#eab308", "#8b5cf6", "#ec4899", "#ef4444", "#6b7280"]

// ── HELPERS ───────────────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    "Pending Assessment": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    "Approved for Disposal": "bg-red-500/20 text-red-400 border-red-500/30",
    "Awaiting Replacement": "bg-orange-500/20 text-orange-400 border-orange-500/30",
    Replaced: "bg-green-500/20 text-green-400 border-green-500/30",
    "Pending Approval": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${map[status] ?? ""}`}>
      {status}
    </span>
  )
}

const CostCompare = ({ repair, replace }: { repair: string; replace: string }) => {
  const r = parseInt(repair.replace(/\D/g, ""))
  const p = parseInt(replace.replace(/\D/g, ""))
  const saving = r - p
  return (
    <span className="text-xs font-semibold text-green-400">
      Save RM {saving.toLocaleString()}
    </span>
  )
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────

export default function BeyondEconomicRepairPage() {
  const [selectedYear, setSelectedYear] = useState("2025")
  const [selectedMonth, setSelectedMonth] = useState("All")
  const [selectedBlock, setSelectedBlock] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav title="Beyond Economic Repair (BER)" />

      <div className="container mx-auto p-6 space-y-6">

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
                <Label className="text-xs font-semibold text-primary">ASSET CATEGORY</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[160px] bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="hvac">HVAC / Chiller</SelectItem>
                    <SelectItem value="electrical">Electrical</SelectItem>
                    <SelectItem value="plumbing">Plumbing</SelectItem>
                    <SelectItem value="lift">Lift / Elevator</SelectItem>
                    <SelectItem value="fire">Fire System</SelectItem>
                    <SelectItem value="bms">BMS / Controls</SelectItem>
                    <SelectItem value="structural">Structural</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-primary">STATUS</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-[180px] bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending-assessment">Pending Assessment</SelectItem>
                    <SelectItem value="approved">Approved for Disposal</SelectItem>
                    <SelectItem value="awaiting">Awaiting Replacement</SelectItem>
                    <SelectItem value="replaced">Replaced</SelectItem>
                    <SelectItem value="pending-approval">Pending Approval</SelectItem>
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20">
            <CardHeader className="pb-2"><CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Total BER Assets</CardTitle></CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">149</div>
              <div className="flex items-center gap-1 mt-1 text-xs font-medium text-red-500">
                <TrendingUp className="h-3 w-3" />+14 vs last period
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
            <CardHeader className="pb-2"><CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Pending Assessment</CardTitle></CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">18</div>
              <p className="text-xs text-orange-500 mt-1">Awaiting evaluation</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20">
            <CardHeader className="pb-2"><CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Approved for Disposal</CardTitle></CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">34</div>
              <p className="text-xs text-yellow-500 mt-1">Awaiting write-off</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
            <CardHeader className="pb-2"><CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Replaced YTD</CardTitle></CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">61</div>
              <p className="text-xs text-green-500 mt-1">Successfully replaced</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
            <CardHeader className="pb-2"><CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Total Replacement Cost</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">RM 1.35M</div>
              <p className="text-xs text-muted-foreground mt-1">YTD {selectedYear}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
            <CardHeader className="pb-2"><CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Avg Lead Time</CardTitle></CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">24</div>
              <p className="text-xs text-muted-foreground mt-1">days avg replacement</p>
            </CardContent>
          </Card>
        </div>

        {/* ── ROW 1: BER Trend + Status ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <Card className="xl:col-span-2">
            <CardHeader><CardTitle className="text-sm font-semibold">Monthly BER Activity – Raised vs Approved vs Disposed</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={berTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" fontSize={11} />
                  <YAxis stroke="#9ca3af" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Area type="monotone" dataKey="raised" name="Raised" stackId="1" fill="#ef4444" stroke="#ef4444" fillOpacity={0.4} />
                  <Area type="monotone" dataKey="approved" name="Approved" stackId="2" fill="#f97316" stroke="#f97316" fillOpacity={0.4} />
                  <Area type="monotone" dataKey="disposed" name="Disposed / Replaced" stackId="3" fill="#22c55e" stroke="#22c55e" fillOpacity={0.4} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm font-semibold">BER Status Distribution</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={175}>
                <PieChart>
                  <Pie data={berStatusData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={2} dataKey="value">
                    {berStatusData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1 mt-2">
                {berStatusData.map((item) => (
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

        {/* ── ROW 2: By Category + Asset Age at BER + Disposal Method ─────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-sm font-semibold">BER Assets by Category</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={berByCategoryData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9ca3af" fontSize={11} />
                  <YAxis dataKey="category" type="category" stroke="#9ca3af" width={100} fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {berByCategoryData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <PackageX className="h-4 w-4 text-orange-400" />
                Asset Age at Time of BER
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={175}>
                <PieChart>
                  <Pie data={assetAgeAtBerData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={2} dataKey="count">
                    {assetAgeAtBerData.map((entry) => <Cell key={entry.range} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1 mt-2">
                {assetAgeAtBerData.map((item) => (
                  <div key={item.range} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-muted-foreground">{item.range}</span>
                    </div>
                    <span className="font-medium">{item.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <ArrowRightLeft className="h-4 w-4 text-purple-400" />
                Disposal Method Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={175}>
                <PieChart>
                  <Pie data={disposalMethodData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={2} dataKey="value">
                    {disposalMethodData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1 mt-2">
                {disposalMethodData.map((item) => (
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

        {/* ── ROW 3: Replacement Cost + Repair vs Replace + Lead Time ─────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <Card className="xl:col-span-2">
            <CardHeader><CardTitle className="text-sm font-semibold">Monthly Replacement Cost – Budgeted vs Actual (RM)</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={replacementCostData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" fontSize={11} />
                  <YAxis stroke="#9ca3af" fontSize={11} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                  <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} formatter={(value: number) => [`RM ${(value / 1000).toFixed(0)}K`, ""]} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="budgeted" name="Budgeted" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="actual" name="Actual" fill="#f97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm font-semibold">Avg Replacement Lead Time (Days)</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={replacementLeadTimeData}>
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

        {/* ── ROW 4: Repair vs Replace Cost + By Location + Budget Variance ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Wrench className="h-4 w-4 text-orange-400" />
                Repair Cost vs Replacement Cost by Category (RM)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={repairVsReplaceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="category" stroke="#9ca3af" fontSize={10} angle={-10} textAnchor="end" height={40} />
                  <YAxis stroke="#9ca3af" fontSize={11} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                  <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} formatter={(value: number) => [`RM ${(value / 1000).toFixed(0)}K`, ""]} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="repairCost" name="Repair Cost" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="replaceCost" name="Replace Cost" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm font-semibold">BER Count by Block</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={berByLocationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="location" stroke="#9ca3af" fontSize={11} />
                  <YAxis stroke="#9ca3af" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="ber" name="BER Raised" fill="#ef4444" stackId="a" />
                  <Bar dataKey="replaced" name="Replaced" fill="#22c55e" radius={[4, 4, 0, 0]} stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* ── COST SAVINGS SUMMARY ──────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <CircleDollarSign className="h-4 w-4 text-green-400" />
              Budget Variance – Replace vs Budget (RM)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={costSavingsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" fontSize={11} />
                <YAxis stroke="#9ca3af" fontSize={11} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} formatter={(value: number) => [`RM ${(value / 1000).toFixed(0)}K`, "Variance"]} />
                <Bar dataKey="savings" name="Variance" radius={[4, 4, 0, 0]}>
                  {costSavingsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.savings >= 0 ? "#22c55e" : "#ef4444"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-3 text-center">
                <div className="text-xs text-muted-foreground font-semibold uppercase">Total Saved</div>
                <div className="text-xl font-bold text-green-400 mt-1">RM 67K</div>
                <div className="text-xs text-muted-foreground mt-0.5">Months under budget</div>
              </div>
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-center">
                <div className="text-xs text-muted-foreground font-semibold uppercase">Total Overspend</div>
                <div className="text-xl font-bold text-red-400 mt-1">RM 39K</div>
                <div className="text-xs text-muted-foreground mt-0.5">Months over budget</div>
              </div>
              <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-3 text-center">
                <div className="text-xs text-muted-foreground font-semibold uppercase">Net Variance</div>
                <div className="text-xl font-bold text-blue-400 mt-1">RM 28K</div>
                <div className="text-xs text-green-500 mt-0.5">Under budget YTD</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── BER ASSET REGISTER TABLE ─────────────────────────────────────── */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-red-400" />
              BER Asset Register
            </CardTitle>
            <span className="text-xs text-muted-foreground">Showing latest 6 records</span>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 text-muted-foreground font-semibold uppercase tracking-wide">BER ID</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-semibold uppercase tracking-wide">Asset</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-semibold uppercase tracking-wide">Category</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-semibold uppercase tracking-wide">Location</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-semibold uppercase tracking-wide">Age</th>
                    <th className="text-right py-2 px-3 text-muted-foreground font-semibold uppercase tracking-wide">Repair Cost</th>
                    <th className="text-right py-2 px-3 text-muted-foreground font-semibold uppercase tracking-wide">Replace Cost</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-semibold uppercase tracking-wide">Saving</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-semibold uppercase tracking-wide">Raised By</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-semibold uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {berAssetList.map((asset) => (
                    <tr key={asset.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-muted-foreground">{asset.id}</td>
                      <td className="py-2.5 px-3">
                        <div className="font-medium">{asset.name}</div>
                        <div className="text-muted-foreground font-mono text-[10px]">{asset.assetId}</div>
                      </td>
                      <td className="py-2.5 px-3 text-muted-foreground">{asset.category}</td>
                      <td className="py-2.5 px-3 text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3 flex-shrink-0" />{asset.location}</span>
                      </td>
                      <td className="py-2.5 px-3 text-muted-foreground">{asset.age}</td>
                      <td className="py-2.5 px-3 text-right text-red-400 font-medium">{asset.repairCost}</td>
                      <td className="py-2.5 px-3 text-right text-green-400 font-medium">{asset.replaceCost}</td>
                      <td className="py-2.5 px-3"><CostCompare repair={asset.repairCost} replace={asset.replaceCost} /></td>
                      <td className="py-2.5 px-3 text-muted-foreground">{asset.raisedBy}</td>
                      <td className="py-2.5 px-3"><StatusBadge status={asset.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
