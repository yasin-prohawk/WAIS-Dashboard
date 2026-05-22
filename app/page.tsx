"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import {
  Wrench, Heart, Sparkles, Shirt, Trash2, MessageSquare,
  FileText, Award, Hammer, PieChart, DollarSign, BarChart3,
  User, Users, Settings, Landmark, TrendingUp,
  Bell, ChevronDown, Moon, Sun, Search,
} from "lucide-react"
import { DashboardMenuButton } from "@/components/dashboard-menu-button"
import { useTheme } from "@/components/theme-provider"

/* ─────────────────────────────────────────
   Module definitions
───────────────────────────────────────── */
const modules = [
  { name: "Facility Engineering Maintenance Services",   icon: Wrench,        href: "/facility-engineering"   },
  { name: "Biomedical Engineering Maintenance Services", icon: Heart,         href: "/biomedical-engineering"  },
  { name: "Cleansing Services",                          icon: Sparkles,      href: "/cleansing-services"      },
  { name: "Linen and Laundry Services",                  icon: Shirt,         href: "/linen-laundry"           },
  { name: "Healthcare Waste Management Services",        icon: Trash2,        href: "/waste-management"        },
  { name: "Complaint Module",                            icon: MessageSquare, href: "/complaints"              },
  { name: "Document Management System",                  icon: FileText,      href: "/documents"               },
  { name: "Quality Assurance Program",                   icon: Award,         href: "/quality-assurance"       },
  { name: "Beyond Economic Repair",                      icon: Hammer,        href: "/beyond-economic-repair"  },
  { name: "Variation Management",                        icon: PieChart,      href: "/variation-management"    },
  { name: "Deduction",                                   icon: DollarSign,    href: "/deduction"               },
  { name: "Reports",                                     icon: BarChart3,     href: "/reports"                 },
  { name: "General Master",                              icon: User,          href: "/general-master"          },
  { name: "User Management",                             icon: Users,         href: "/user-management"         },
  { name: "Additional Works",                            icon: Settings,      href: "/additional-works"        },
  { name: "Finance",                                     icon: Landmark,      href: "/finance"                 },
  { name: "BIS",                                         icon: TrendingUp,    href: "/bis"                     },
]

/* ─────────────────────────────────────────
   Card glass styles - Only cards get blur
───────────────────────────────────────── */
function cardBase(dark: boolean) {
  return {
    backdropFilter: "blur(8px) saturate(1.2)",
    WebkitBackdropFilter: "blur(8px) saturate(1.2)",
    background: dark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.75)",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  } as React.CSSProperties
}

function cardHover(dark: boolean) {
  return {
    backdropFilter: "blur(12px) saturate(1.4)",
    WebkitBackdropFilter: "blur(12px) saturate(1.4)",
    background: "rgba(59,130,246,0.60)",
    boxShadow: "0 4px 12px rgba(59,130,246,0.25)",
  } as React.CSSProperties
}

/* ─────────────────────────────────────────
   Main component
───────────────────────────────────────── */
export default function HomePage() {
  const { theme, setTheme } = useTheme()
  const dark = theme === "dark"
  const [search, setSearch] = useState("")
  const [time, setTime]     = useState("")
  const [date, setDate]     = useState("")
  const [hovered, setHovered] = useState<number | null>(null)

  /* clock */
  useEffect(() => {
    const tick = () => {
      const n    = new Date()
      const hh   = n.getHours()
      const mm   = n.getMinutes().toString().padStart(2, "0")
      const h12  = ((hh % 12) || 12).toString()
      setTime(`${h12}:${mm} ${hh >= 12 ? "PM" : "AM"}`)
      const dd   = n.getDate().toString().padStart(2, "0")
      const mo   = (n.getMonth() + 1).toString().padStart(2, "0")
      setDate(`${dd}/${mo}/${n.getFullYear()}`)
    }
    tick()
    const id = setInterval(tick, 15_000)
    return () => clearInterval(id)
  }, [])

  return (
    <div
      className="relative flex flex-col min-h-screen overflow-hidden"
      style={{
        backgroundImage: "url('/hospital-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center top",
        backgroundAttachment: "fixed",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}
    >

      {/* ── Overlay - Just colors, NO blur ── */}
      <div
        className="fixed inset-0 z-0 pointer-events-none transition-colors duration-500"
        style={{
          backgroundColor: dark ? "rgba(15,23,42,0.50)" : "rgba(241,245,249,0.30)",
          // NO backdropFilter here - this keeps background sharp
        }}
      />

      {/* ════════════════════════════════
          HEADER - Solid background, NO blur
      ════════════════════════════════ */}
      <header
        className="relative z-20 flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 border-b transition-all duration-300 sm:px-5"
        style={{
          backgroundColor: dark ? "rgba(30,41,59,0.85)" : "rgba(255,255,255,0.85)",
          // NO backdropFilter
          borderColor: dark ? "rgba(255,255,255,0.08)" : "rgba(203,213,225,0.40)",
        }}
      >
        {/* ── left: logos ── */}
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <DashboardMenuButton
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0 text-slate-200 hover:bg-white/10 hover:text-white"
          />

          {/* ProHAWK */}
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-md flex items-center justify-center text-[15px]"
              style={{ background: dark ? "rgba(255,255,255,0.10)" : "rgba(20,50,120,0.10)" }}
            >
              🦅
            </div>
            <span
              className="text-[11px] font-extrabold tracking-widest uppercase select-none"
              style={{ color: dark ? "rgba(226,232,240,0.95)" : "#1e293b" }}
            >
              proHAWK
            </span>
          </div>

          {/* separator */}
          <div className="w-px h-7" style={{ background: dark ? "rgba(255,255,255,0.14)" : "rgba(15,45,110,0.18)" }} />

          {/* WAIS */}
          <span
            className="text-[20px] font-black tracking-[.18em] select-none"
            style={{ color: dark ? "rgba(241,245,249,0.96)" : "#0f172a" }}
          >
            WAIS
          </span>

          {/* separator */}
          <div className="w-px h-7" style={{ background: dark ? "rgba(255,255,255,0.14)" : "rgba(15,45,110,0.18)" }} />

          {/* system name */}
          <div className="hidden min-[520px]:block">
            <p className="text-[11.5px] font-semibold leading-tight"
               style={{ color: dark ? "rgba(226,232,240,0.95)" : "#1e293b" }}>
              WACH Asset Information System
            </p>
            <p className="text-[10.5px] leading-tight"
               style={{ color: dark ? "rgba(148,163,184,0.85)" : "#475569" }}>
              Hospital Tunku Azizah
            </p>
          </div>
        </div>

        {/* ── right: controls ── */}
        <div className="flex items-center gap-3.5">

          {/* toggle */}
          <button
            onClick={() => setTheme(dark ? "light" : "dark")}
            aria-label="Toggle theme"
            className="relative flex items-center p-0.5 w-[50px] h-6 rounded-full border cursor-pointer transition-colors duration-300"
            style={{
              background: dark ? "#475569" : "#94a3b8",
              borderColor: "rgba(255,255,255,0.18)",
            }}
          >
            <span
              className="w-[19px] h-[19px] rounded-full bg-white flex items-center justify-center shadow transition-transform duration-300"
              style={{ transform: dark ? "translateX(26px)" : "translateX(0)" }}
            >
              {dark
                ? <Moon className="w-2.5 h-2.5 text-gray-700" />
                : <Sun  className="w-2.5 h-2.5 text-yellow-500" />}
            </span>
          </button>

          {/* bell */}
          <div className="relative cursor-pointer">
            <Bell
              className="w-[18px] h-[18px]"
              style={{ color: dark ? "rgba(226,232,240,0.90)" : "#334155" }}
            />
            <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[8px] flex items-center justify-center font-bold">
              3
            </span>
          </div>

          {/* user */}
          <div
            className="flex items-center gap-1.5 cursor-pointer"
            style={{ color: dark ? "rgba(226,232,240,0.90)" : "#334155" }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: dark ? "rgba(255,255,255,0.13)" : "rgba(14,40,112,0.10)" }}
            >
              <User className="w-3.5 h-3.5" />
            </div>
            <span className="hidden text-[12.5px] font-medium sm:inline">User</span>
            <ChevronDown className="hidden w-3 h-3 opacity-60 sm:block" />
          </div>
        </div>
      </header>

      {/* ════════════════════════════════
          SEARCH BAR - Solid background, NO blur
      ════════════════════════════════ */}
      <div className="relative z-20 flex justify-center px-4 pt-6 pb-2.5">
        <div className="relative w-full max-w-[510px]">
          <input
            type="text"
            placeholder="Asset No/Asset Description"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-4 pr-[46px] py-2.5 rounded-lg text-[13px] outline-none"
            style={{
              backgroundColor: dark ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.85)",
              // NO backdropFilter
              border: `1px solid ${dark ? "rgba(255,255,255,0.15)" : "rgba(203,213,225,0.60)"}`,
              color: dark ? "#e2e8f0" : "#0f172a",
            }}
          />
          <button
            className="absolute right-0 top-0 h-full w-[46px] rounded-r-lg flex items-center justify-center hover:opacity-85 transition-opacity duration-200"
            style={{ background: "#475569" }}
            aria-label="Search"
          >
            <Search className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* ════════════════════════════════
          MODULE GRID - Cards WITH blur/glass effect
      ════════════════════════════════ */}
      <main className="relative z-20 flex-1 px-3.5 pb-3 pt-0.5">
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {modules.map((mod, idx) => {
            const Icon      = mod.icon
            const isHovered = idx === hovered

            return (
              <Link
                key={mod.name}
                href={mod.href}
                onMouseEnter={() => setHovered(idx)}
                onMouseLeave={() => setHovered(null)}
                className="relative flex flex-col items-center justify-center text-center gap-2.5 px-2.5 py-4 rounded-[10px] overflow-hidden min-h-[122px] no-underline"
                style={{
                  border: dark
                    ? "1px solid rgba(255,255,255,0.10)"
                    : "1px solid rgba(203,213,225,0.50)",
                  boxShadow: isHovered
                    ? "0 6px 20px rgba(59,130,246,0.30)"
                    : "0 1px 2px rgba(0,0,0,0.05)",
                  transform: isHovered ? "translateY(-2px)" : "translateY(0)",
                  transition: "transform 0.2s, box-shadow 0.2s, border-color 0.2s",
                  borderColor: isHovered
                    ? "rgba(59,130,246,0.50)"
                    : undefined,
                }}
              >
                {/* ── CARD glass layer with blur ── */}
                <div
                  className="absolute inset-0 z-0 rounded-[10px]"
                  style={cardBase(dark)}
                />

                {/* ── CARD hover layer with blue tint and blur ── */}
                <div
                  className="absolute inset-0 z-0 rounded-[10px] transition-opacity duration-200"
                  style={{
                    ...cardHover(dark),
                    opacity: isHovered ? 1 : 0,
                  }}
                />

                {/* ── Icon ── */}
                <Icon
                  className="relative z-10 transition-all duration-200"
                  strokeWidth={1.5}
                  style={{
                    width: 28,
                    height: 28,
                    color: isHovered
                      ? "rgba(255,255,255,0.95)"
                      : dark
                      ? "rgba(226,232,240,0.85)"
                      : "rgba(30,41,59,0.80)",
                    transform: isHovered ? "scale(1.08)" : "scale(1)",
                  }}
                />

                {/* ── Label ── */}
                <span
                  className="relative z-10 font-normal leading-[1.38] transition-colors duration-200"
                  style={{
                    fontSize: "10.5px",
                    color: isHovered
                      ? "rgba(255,255,255,0.95)"
                      : dark
                      ? "rgba(203,213,225,0.85)"
                      : "rgba(30,41,59,0.85)",
                  }}
                >
                  {mod.name}
                </span>
              </Link>
            )
          })}
        </div>
      </main>

      {/* ════════════════════════════════
          FOOTER - Solid background, NO blur
      ════════════════════════════════ */}
      <footer
        className="relative z-20 flex items-center justify-between px-5 py-2.5 border-t"
        style={{
          backgroundColor: dark ? "rgba(30,41,59,0.90)" : "rgba(255,255,255,0.90)",
          // NO backdropFilter
          borderColor: dark ? "rgba(255,255,255,0.08)" : "rgba(203,213,225,0.40)",
        }}
      >
        <Link
          href="/support"
          className="flex items-center gap-1.5 text-[12.5px] font-medium no-underline transition-colors duration-200"
          style={{ color: dark ? "rgba(226,232,240,0.85)" : "#475569" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#60a5fa")}
          onMouseLeave={(e) => (e.currentTarget.style.color = dark ? "rgba(226,232,240,0.85)" : "#475569")}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          WAIS Support
        </Link>

        <div className="flex items-center gap-3 text-[11px]" style={{ color: dark ? "rgba(255,255,255,0.45)" : "#64748b" }}>
          <span>ENG US</span>
          <span>{time}</span>
          <span>{date}</span>
        </div>
      </footer>
    </div>
  )
}