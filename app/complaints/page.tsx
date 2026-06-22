"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useDashboardNav } from "@/components/dashboard-nav-provider";

declare global {
  interface Window {
    Chart: any;
    XLSX: any;
  }
}

/* ─── COMPLAINT DATA ────────────────────────────── */
const MONTHS_12 = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const COMPLAINT_SERVICES = [
  {
    id: "FEMS",
    accent: "#0EA5E9",
    icon: "bi-tools",
    totalComplaints: 156,
    resolved: 142,
    pending: 14,
    resolutionRate: 91.03,
    trend: [12, 15, 10, 14, 13, 16, 11, 9, 15, 13, 14, 14],
    categories: [
      { label: "Building Structure", count: 34, color: "#0EA5E9" },
      { label: "Electrical Systems", count: 28, color: "#06B6D4" },
      { label: "Plumbing", count: 25, color: "#3B82F6" },
      { label: "HVAC", count: 22, color: "#6366F1" },
      { label: "Fire Safety", count: 18, color: "#8B5CF6" },
      { label: "Other", count: 29, color: "#A78BFA" },
    ],
    priority: [
      { label: "Critical", count: 18, color: "#EF4444" },
      { label: "High", count: 35, color: "#F97316" },
      { label: "Medium", count: 52, color: "#F59E0B" },
      { label: "Low", count: 51, color: "#10B981" },
    ],
    status: [
      { label: "Open", count: 14, color: "#EF4444" },
      { label: "In Progress", count: 28, color: "#F59E0B" },
      { label: "Resolved", count: 114, color: "#10B981" },
    ],
    avgResolutionTime: 3.2,
  },
  {
    id: "BEMS",
    accent: "#F59E0B",
    icon: "bi-heart-pulse",
    totalComplaints: 89,
    resolved: 76,
    pending: 13,
    resolutionRate: 85.39,
    trend: [8, 6, 9, 7, 8, 10, 6, 5, 9, 8, 7, 6],
    categories: [
      { label: "Equipment Malfunction", count: 24, color: "#F59E0B" },
      { label: "Calibration Issues", count: 18, color: "#F97316" },
      { label: "Software Errors", count: 15, color: "#EF4444" },
      { label: "User Training", count: 12, color: "#FB923C" },
      { label: "Parts Replacement", count: 10, color: "#FCD34D" },
      { label: "Other", count: 10, color: "#FDE68A" },
    ],
    priority: [
      { label: "Critical", count: 12, color: "#EF4444" },
      { label: "High", count: 22, color: "#F97316" },
      { label: "Medium", count: 28, color: "#F59E0B" },
      { label: "Low", count: 27, color: "#10B981" },
    ],
    status: [
      { label: "Open", count: 13, color: "#EF4444" },
      { label: "In Progress", count: 18, color: "#F59E0B" },
      { label: "Resolved", count: 58, color: "#10B981" },
    ],
    avgResolutionTime: 4.5,
  },
  {
    id: "CLS",
    accent: "#10B981",
    icon: "bi-droplet",
    totalComplaints: 67,
    resolved: 62,
    pending: 5,
    resolutionRate: 92.54,
    trend: [6, 5, 4, 7, 6, 5, 8, 4, 6, 5, 6, 5],
    categories: [
      { label: "Cleaning Quality", count: 20, color: "#10B981" },
      { label: "Waste Disposal", count: 15, color: "#34D399" },
      { label: "Sanitation", count: 12, color: "#6EE7B7" },
      { label: "Pest Control", count: 10, color: "#A7F3D0" },
      { label: "Staff Behavior", count: 5, color: "#D1FAE5" },
      { label: "Other", count: 5, color: "#ECFDF5" },
    ],
    priority: [
      { label: "Critical", count: 8, color: "#EF4444" },
      { label: "High", count: 15, color: "#F97316" },
      { label: "Medium", count: 22, color: "#F59E0B" },
      { label: "Low", count: 22, color: "#10B981" },
    ],
    status: [
      { label: "Open", count: 5, color: "#EF4444" },
      { label: "In Progress", count: 12, color: "#F59E0B" },
      { label: "Resolved", count: 50, color: "#10B981" },
    ],
    avgResolutionTime: 2.8,
  },
  {
    id: "LLS",
    accent: "#8B5CF6",
    icon: "bi-box-seam",
    totalComplaints: 53,
    resolved: 48,
    pending: 5,
    resolutionRate: 90.57,
    trend: [5, 4, 6, 3, 5, 4, 5, 6, 4, 5, 3, 3],
    categories: [
      { label: "Linen Quality", count: 15, color: "#8B5CF6" },
      { label: "Delivery Delay", count: 12, color: "#A78BFA" },
      { label: "Incorrect Items", count: 10, color: "#C4B5FD" },
      { label: "Stains/Damage", count: 8, color: "#DDD6FE" },
      { label: "Quantity Issues", count: 5, color: "#EDE9FE" },
      { label: "Other", count: 3, color: "#F5F3FF" },
    ],
    priority: [
      { label: "Critical", count: 5, color: "#EF4444" },
      { label: "High", count: 12, color: "#F97316" },
      { label: "Medium", count: 18, color: "#F59E0B" },
      { label: "Low", count: 18, color: "#10B981" },
    ],
    status: [
      { label: "Open", count: 5, color: "#EF4444" },
      { label: "In Progress", count: 10, color: "#F59E0B" },
      { label: "Resolved", count: 38, color: "#10B981" },
    ],
    avgResolutionTime: 3.5,
  },
  {
    id: "HWMS",
    accent: "#6F42C1",
    icon: "bi-recycle",
    totalComplaints: 41,
    resolved: 38,
    pending: 3,
    resolutionRate: 92.68,
    trend: [4, 3, 5, 2, 4, 3, 4, 5, 3, 3, 3, 2],
    categories: [
      { label: "Waste Segregation", count: 12, color: "#6F42C1" },
      { label: "Collection Schedule", count: 10, color: "#7C3AED" },
      { label: "Container Issues", count: 8, color: "#8B5CF6" },
      { label: "Staff Compliance", count: 6, color: "#A78BFA" },
      { label: "Documentation", count: 3, color: "#C4B5FD" },
      { label: "Other", count: 2, color: "#DDD6FE" },
    ],
    priority: [
      { label: "Critical", count: 4, color: "#EF4444" },
      { label: "High", count: 9, color: "#F97316" },
      { label: "Medium", count: 14, color: "#F59E0B" },
      { label: "Low", count: 14, color: "#10B981" },
    ],
    status: [
      { label: "Open", count: 3, color: "#EF4444" },
      { label: "In Progress", count: 8, color: "#F59E0B" },
      { label: "Resolved", count: 30, color: "#10B981" },
    ],
    avgResolutionTime: 2.5,
  },
];

/* ─── THEMES ────────────────────────────────────── */
const THEMES = {
  dark: {
    bg: "#0d1520",
    card: "#162233",
    cardAlt: "#1a2a3f",
    border: "#1e3248",
    text: "#e0e7ff",
    muted: "#8a9cb8",
    accent: "#5a9fd4",
    success: "#22c55e",
    warn: "#f59e0b",
    danger: "#ef4444",
    gridColor: "rgba(255,255,255,0.07)",
    tickColor: "#6b8099",
    scrollThumb: "#2a3f55",
    tableHeaderBg: "rgba(90,159,212,0.08)",
  },
  light: {
    bg: "#f0f4f8",
    card: "#ffffff",
    cardAlt: "#f8fafc",
    border: "#dde3ed",
    text: "#1a2636",
    muted: "#6b7fa3",
    accent: "#1a6bb5",
    success: "#16a34a",
    warn: "#d97706",
    danger: "#dc2626",
    gridColor: "rgba(0,0,0,0.06)",
    tickColor: "#8a9cb8",
    scrollThumb: "#c5cfe0",
    tableHeaderBg: "rgba(26,107,181,0.06)",
  },
};

type Theme = typeof THEMES.dark;

/* ─── CHART HELPERS ─────────────────────────────── */
function drawChart(id: string, type: string, data: any, options: any) {
  const c = document.getElementById(id) as HTMLCanvasElement | null;
  if (!c) return;
  if (!window.Chart) { setTimeout(() => drawChart(id, type, data, options), 150); return; }
  const ctx = c.getContext("2d");
  if (!ctx) return;
  const ex = window.Chart.getChart(c);
  if (ex) ex.destroy();
  try {
    new window.Chart(ctx, { type: type as any, data, options: { ...options, animation: false, responsive: true, maintainAspectRatio: false } });
  } catch (e) { }
}

function mkBar(id: string, labels: string[], datasets: any[], T: Theme, extra?: any) {
  const scales: any = {
    x: { grid: { color: T.gridColor }, ticks: { color: T.tickColor, font: { size: 10 } }, border: { color: "transparent" } },
    y: { grid: { color: T.gridColor }, ticks: { color: T.tickColor, font: { size: 10 } }, border: { color: "transparent" } }
  };
  drawChart(id, "bar", { labels, datasets }, {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "bottom" as const,
        labels: {
          color: T.muted,
          font: { size: 9 },
          boxWidth: 10,
          padding: 8,
          usePointStyle: true
        }
      }
    },
    scales,
    ...extra
  });
}

function mkLine(id: string, labels: string[], datasets: any[], T: Theme, extra?: any) {
  const yticks: any = { color: T.tickColor, font: { size: 10 } };
  const opts: any = {
    plugins: {
      legend: {
        display: true,
        position: "bottom" as const,
        labels: {
          color: T.muted,
          font: { size: 9 },
          boxWidth: 10,
          padding: 8,
          usePointStyle: true
        }
      }
    },
    scales: {
      x: { grid: { color: T.gridColor }, ticks: { color: T.tickColor, font: { size: 10 } }, border: { color: "transparent" } },
      y: { grid: { color: T.gridColor }, ticks: { color: T.tickColor, font: { size: 10 } }, border: { color: "transparent" } }
    }
  };
  if (extra?.scales?.y?.callback) yticks.callback = extra.scales.y.callback;
  opts.scales.y.ticks = yticks;
  drawChart(id, "line", { labels, datasets: datasets.map((d: any) => ({ ...d, borderWidth: d.borderWidth || 2, pointRadius: d.pointRadius || 3, tension: d.tension || 0.35, fill: false })) }, opts);
}

function mkDoughnut(id: string, labels: string[], data: number[], colors: string[], T: Theme) {
  drawChart(id, "doughnut", { labels, datasets: [{ data, backgroundColor: colors, borderWidth: 2, borderColor: T.card }] }, {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "60%",
    plugins: {
      legend: {
        display: true,
        position: "bottom" as const,
        labels: {
          color: T.muted,
          font: { size: 9 },
          boxWidth: 10,
          padding: 8,
          usePointStyle: true
        }
      }
    }
  });
}

/* ─── EXPORT ─────────────────────────────────────── */
function exportExcelComplaint(service: typeof COMPLAINT_SERVICES[0], period: string) {
  if (!window.XLSX) return;
  const wb = window.XLSX.utils.book_new();
  const sheetData: any[][] = [
    ["Complaint Module Dashboard", period],
    [],
    ["Service", service.id],
    ["Total Complaints", service.totalComplaints],
    ["Resolved", service.resolved],
    ["Pending", service.pending],
    ["Resolution Rate", service.resolutionRate + "%"],
    ["Average Resolution Time", service.avgResolutionTime + " days"],
    [],
    ["Category Breakdown"],
    ["Category", "Count"],
  ];
  service.categories.forEach((c: any) => sheetData.push([c.label, c.count]));
  sheetData.push([], ["Priority Breakdown"]);
  sheetData.push(["Priority", "Count"]);
  service.priority.forEach((p: any) => sheetData.push([p.label, p.count]));
  sheetData.push([], ["Status Breakdown"]);
  sheetData.push(["Status", "Count"]);
  service.status.forEach((s: any) => sheetData.push([s.label, s.count]));
  const ws = window.XLSX.utils.aoa_to_sheet(sheetData);
  window.XLSX.utils.book_append_sheet(wb, ws, "Complaint_Summary");
  window.XLSX.writeFile(wb, `Complaint_${service.id}_${period}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

function printPage() {
  const s = document.createElement('style');
  s.id = 'ps';
  s.textContent = '@page{size:A4 landscape;margin:10mm}@media print{body{-webkit-print-color-adjust:exact!important}.no-print{display:none!important}}';
  document.head.appendChild(s);
  window.print();
  setTimeout(() => { const e = document.getElementById('ps'); if (e) e.remove(); }, 1000);
}

/* ─── COMPONENTS ────────────────────────────────── */
function BIcon({ name, size = 16, color }: { name: string; size?: number; color?: string }) {
  return <i className={`bi ${name}`} style={{ fontSize: size, color: color || "inherit", lineHeight: 1 }} />;
}

function Badge({ children, color = "green", T }: { children: string; color?: string; T: Theme }) {
  const m: Record<string, string> = { green: "rgba(16,185,129,.12)", warn: "rgba(217,119,6,.12)", danger: "rgba(220,38,38,.12)", blue: "rgba(26,107,181,.12)" };
  const tc: Record<string, string> = { green: T.success, warn: T.warn, danger: T.danger, blue: T.accent };
  return <span style={{ background: m[color], color: tc[color], padding: "4px 12px", borderRadius: 24, fontSize: 11, fontWeight: 700 }}>{children}</span>;
}

function getContrastText(h: string) {
  const r = parseInt(h.slice(1, 3), 16), g = parseInt(h.slice(3, 5), 16), b = parseInt(h.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128 ? "#ffffff" : "#ffffff";
}

/* ─── MAIN ──────────────────────────────────────── */
export default function ComplaintDashboard() {
  const { openSidebar } = useDashboardNav();
  const [themeName, setThemeName] = useState<"dark" | "light">("light");
  const [frequency, setFrequency] = useState("monthly");
  const [frequencyKey, setFrequencyKey] = useState("all");
  const [selectedYear, setSelectedYear] = useState("2026");
  const [activeService, setActiveService] = useState<string>("FEMS");
  const [highlightedService, setHighlightedService] = useState<string | null>(null);
  const T = THEMES[themeName];
  const scriptsReady = useRef(false);
  const chartsInited = useRef(false);
  const HDR = "#0f172a";
  const htc = getContrastText(HDR);

  const years = ["2026", "2025", "2024", "2023", "2022"];
  const frequencyKeys = frequency === "monthly" 
    ? MONTHS_12.map(m => ({ value: m.toLowerCase(), label: m }))
    : frequency === "halfYearly" 
      ? [{ value: "H1", label: "H1 (Jan - Jun)" }, { value: "H2", label: "H2 (Jul - Dec)" }]
      : [{ value: "all", label: "Full Year" }];

  const currentService = COMPLAINT_SERVICES.find(s => s.id === activeService)!;
  const periodLabel = frequencyKey === "all" ? `Full Year ${selectedYear}` : `${frequencyKey.toUpperCase()} - ${selectedYear}`;

  useEffect(() => {
    if (scriptsReady.current) return;
    const load = (src: string, cb: () => void) => { const s = document.createElement("script"); s.src = src; s.onload = cb; document.head.appendChild(s); };
    load("https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js", () => {
      load("https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js", () => {
        scriptsReady.current = true;
        setTimeout(() => { initCharts(); chartsInited.current = true; }, 400);
      });
    });
  }, []);

  useEffect(() => {
    if (scriptsReady.current && chartsInited.current) setTimeout(initCharts, 200);
  }, [themeName, activeService, highlightedService, frequency, frequencyKey]);

  const initCharts = () => {
    if (!window.Chart) { setTimeout(initCharts, 200); return; }

    ["complaintTrendChart", "complaintCategoryChart", "complaintPriorityChart", "complaintStatusChart"].forEach(id => {
      const c = document.getElementById(id) as HTMLCanvasElement;
      if (c) { const ex = window.Chart.getChart(c); if (ex) ex.destroy(); }
    });

    // Trend Chart - All Services
    const trendDatasets = COMPLAINT_SERVICES.map(svc => {
      const isHighlighted = highlightedService === svc.id;
      const isDimmed = highlightedService && highlightedService !== svc.id;
      return {
        data: svc.trend,
        borderColor: svc.accent,
        backgroundColor: svc.accent + "22",
        fill: true,
        pointRadius: isHighlighted ? 5 : 3,
        borderWidth: isHighlighted ? 3 : (isDimmed ? 1 : 2),
        pointBackgroundColor: svc.accent,
        pointBorderColor: "#fff",
        pointBorderWidth: isHighlighted ? 2 : 1,
        label: svc.id,
        tension: 0.35,
        borderDash: isDimmed ? [5, 5] : [],
        opacity: isDimmed ? 0.3 : 1,
      };
    });

    mkLine("complaintTrendChart", MONTHS_12, trendDatasets, T, {
      plugins: {
        legend: {
          display: true,
          position: "bottom",
          labels: {
            color: T.muted,
            font: { size: 9 },
            boxWidth: 10,
            padding: 8,
            usePointStyle: true,
            pointStyleWidth: 8,
          }
        }
      },
      scales: { y: { ticks: { callback: (v: number) => v } } }
    });

    // Category Chart
    mkBar("complaintCategoryChart",
      currentService.categories.map(c => c.label),
      currentService.categories.map(c => c.count),
      currentService.categories.map(c => c.color),
      T,
      { indexAxis: "y" as const, borderRadius: 6 }
    );

    // Priority Doughnut
    mkDoughnut("complaintPriorityChart",
      currentService.priority.map(p => p.label),
      currentService.priority.map(p => p.count),
      currentService.priority.map(p => p.color),
      T
    );

    // Status Doughnut
    mkDoughnut("complaintStatusChart",
      currentService.status.map(s => s.label),
      currentService.status.map(s => s.count),
      currentService.status.map(s => s.color),
      T
    );
  };

  const card = (e?: React.CSSProperties): React.CSSProperties => ({ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, ...e });
  const thStyle: React.CSSProperties = { background: T.tableHeaderBg, color: T.accent, padding: "10px 14px", textAlign: "left", fontWeight: 700, fontSize: 12, borderBottom: `2px solid ${T.border}` };
  const tdStyle: React.CSSProperties = { padding: "10px 14px", borderBottom: `1px solid ${T.border}`, color: T.text };

  return (
    <div className="dashboard-module-page" style={{ fontFamily: "'DM Sans',system-ui,sans-serif", background: T.bg, color: T.text, fontSize: 15, height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        *, ::-webkit-scrollbar { scrollbar-width: thin; scrollbar-color: ${T.scrollThumb} transparent }
        ::-webkit-scrollbar { width: 5px }
        ::-webkit-scrollbar-track { background: transparent }
        ::-webkit-scrollbar-thumb { background: ${T.scrollThumb}; border-radius: 99px }
        @page { size: A4 landscape; margin: 10mm }
        @media print { body { -webkit-print-color-adjust: exact !important } .no-print { display: none !important } }
      `}</style>

      {/* TOP BAR */}
      <div className="no-print" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: HDR, borderBottom: `1px solid ${htc}15`, padding: "0 24px", height: 62, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button onClick={openSidebar} style={{ background: "transparent", border: "none", color: htc, cursor: "pointer", fontSize: 20, padding: "8px 11px", borderRadius: 10 }}><BIcon name="bi-list" size={22} color={htc} /></button>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 8, border: `1px solid ${htc}30`, color: htc, textDecoration: "none", fontSize: 13, fontWeight: 500 }}><BIcon name="bi-arrow-left" size={16} color={htc} /><span>Back</span></Link>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: htc }}>Complaint Module</div>
            <div style={{ fontSize: 11, color: htc, opacity: 0.6 }}>{currentService.id} · {periodLabel}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => exportExcelComplaint(currentService, periodLabel)} title="Export" style={{ background: T.success + "12", border: `1px solid ${T.success}25`, color: T.success, width: 34, height: 34, borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><BIcon name="bi-download" size={15} color={T.success} /></button>
            <button onClick={printPage} title="Print" style={{ background: T.accent + "12", border: `1px solid ${T.accent}25`, color: T.accent, width: 34, height: 34, borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><BIcon name="bi-printer" size={15} color={T.accent} /></button>
          </div>
          <div style={{ width: 1, height: 28, background: htc, opacity: 0.12 }} />
          <button onClick={() => setThemeName(n => n === "dark" ? "light" : "dark")} style={{ background: "transparent", border: `1px solid ${htc}20`, color: htc, borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 14 }}><BIcon name={themeName === "dark" ? "bi-sun-fill" : "bi-moon-fill"} size={15} color={htc} /></button>
          <span style={{ fontSize: 13, color: htc, opacity: 0.7 }}>18 May 2026</span>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 12px 4px 4px", background: htc + "08", borderRadius: 24, border: `1px solid ${htc}20` }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg,#0EA5E9,#8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff" }}><BIcon name="bi-person-fill" size={13} color="#fff" /></div>
            <span style={{ fontSize: 13, fontWeight: 600, color: htc }}>Admin</span>
          </div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="no-print" style={{ display: "flex", alignItems: "center", background: HDR, borderBottom: `1px solid ${htc}15`, padding: "0 22px", height: 54, gap: 16, flexShrink: 0, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>Level</span>
          <select style={{ background: "#fff", color: "#1a2636", padding: "6px 30px 6px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer" }}>
            <option>All Levels</option>
            <option>Critical</option>
            <option>Non-Critical</option>
          </select>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>Frequency</span>
          <select value={frequency} onChange={e => { setFrequency(e.target.value); setFrequencyKey("all"); }} style={{ background: "#fff", color: "#1a2636", padding: "6px 30px 6px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer" }}>
            <option value="monthly">Monthly</option>
            <option value="halfYearly">Half Yearly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>Frequency Key</span>
          <select value={frequencyKey} onChange={e => setFrequencyKey(e.target.value)} style={{ background: "#fff", color: "#1a2636", padding: "6px 30px 6px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer" }}>
            {frequencyKeys.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>Year</span>
          <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} style={{ background: "#fff", color: "#1a2636", padding: "6px 30px 6px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer" }}>
            {years.map(year => <option key={year} value={year}>{year}</option>)}
          </select>
        </div>
        <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.15)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>Service</span>
          <select 
            value={activeService} 
            onChange={e => { setActiveService(e.target.value); setHighlightedService(null); }}
            style={{ background: "#fff", color: "#1a2636", padding: "6px 34px 6px 14px", borderRadius: 8, fontSize: 12, cursor: "pointer", fontWeight: 600, appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%231a2636' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center", backgroundSize: "10px" }}
          >
            {COMPLAINT_SERVICES.map(svc => (
              <option key={svc.id} value={svc.id}>{svc.id}</option>
            ))}
          </select>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, paddingLeft: 16, borderLeft: "1px solid rgba(255,255,255,0.15)" }}>
          <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Period</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{periodLabel}</span>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ flex: 1, overflow: "auto", padding: "20px 24px" }}>

        {/* ── KPI CARDS ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
          <div style={{ ...card({ padding: "18px 20px" }), borderLeft: `4px solid ${currentService.accent}`, background: `linear-gradient(135deg, ${currentService.accent}08, ${T.card})` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.3px" }}>Total Complaints</div>
                <div style={{ fontSize: 34, fontWeight: 800, color: currentService.accent, marginTop: 4 }}>{currentService.totalComplaints}</div>
              </div>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${currentService.accent}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <BIcon name="bi-chat-dots" size={20} color={currentService.accent} />
              </div>
            </div>
          </div>
          <div style={{ ...card({ padding: "18px 20px" }), borderLeft: `4px solid #10B981` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.3px" }}>Resolved</div>
                <div style={{ fontSize: 34, fontWeight: 800, color: "#10B981", marginTop: 4 }}>{currentService.resolved}</div>
              </div>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "#10B98115", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <BIcon name="bi-check-circle" size={20} color="#10B981" />
              </div>
            </div>
          </div>
          <div style={{ ...card({ padding: "18px 20px" }), borderLeft: `4px solid #F59E0B` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.3px" }}>Pending</div>
                <div style={{ fontSize: 34, fontWeight: 800, color: "#F59E0B", marginTop: 4 }}>{currentService.pending}</div>
              </div>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "#F59E0B15", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <BIcon name="bi-clock" size={20} color="#F59E0B" />
              </div>
            </div>
          </div>
          <div style={{ ...card({ padding: "18px 20px" }), borderLeft: `4px solid ${currentService.resolutionRate >= 90 ? '#10B981' : currentService.resolutionRate >= 80 ? '#F59E0B' : '#EF4444'}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.3px" }}>Resolution Rate</div>
                <div style={{ fontSize: 34, fontWeight: 800, color: currentService.resolutionRate >= 90 ? '#10B981' : currentService.resolutionRate >= 80 ? '#F59E0B' : '#EF4444', marginTop: 4 }}>{currentService.resolutionRate.toFixed(1)}%</div>
              </div>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${currentService.resolutionRate >= 90 ? '#10B981' : currentService.resolutionRate >= 80 ? '#F59E0B' : '#EF4444'}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <BIcon name="bi-graph-up" size={20} color={currentService.resolutionRate >= 90 ? '#10B981' : currentService.resolutionRate >= 80 ? '#F59E0B' : '#EF4444'} />
              </div>
            </div>
          </div>
        </div>

        {/* ── SERVICE CARDS ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12, marginBottom: 24 }}>
          {COMPLAINT_SERVICES.map(svc => {
            const isActive = activeService === svc.id;
            const isHighlighted = highlightedService === svc.id;
            return (
              <div
                key={svc.id}
                onClick={() => setActiveService(svc.id)}
                onMouseEnter={() => setHighlightedService(svc.id)}
                onMouseLeave={() => setHighlightedService(null)}
                style={{
                  ...card({ padding: "14px", textAlign: "center", cursor: "pointer" }),
                  background: isActive ? `linear-gradient(135deg, ${svc.accent}15, ${T.card})` : T.card,
                  border: isActive ? `2px solid ${svc.accent}` : `1px solid ${T.border}`,
                  transform: isActive || isHighlighted ? "scale(1.03)" : "scale(1)",
                  transition: "all 0.25s ease",
                  boxShadow: isActive ? `0 4px 20px ${svc.accent}25` : "none",
                  opacity: highlightedService && highlightedService !== svc.id ? 0.5 : 1,
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 4 }}>
                  <BIcon name={svc.icon} size={24} color={svc.accent} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: isActive ? svc.accent : T.text }}>{svc.id}</div>
                <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>{svc.totalComplaints} complaints</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: svc.resolutionRate >= 90 ? '#10B981' : svc.resolutionRate >= 80 ? '#F59E0B' : '#EF4444', marginTop: 6 }}>{svc.resolutionRate.toFixed(1)}%</div>
                <div style={{ fontSize: 9, color: T.muted }}>Resolution Rate</div>
              </div>
            );
          })}
        </div>

        {/* ── CHARTS ROW ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16, marginBottom: 24 }}>
          <div style={card({ padding: "18px" })}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div>
                <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Complaint Trend</span>
                <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>Monthly complaint volume</div>
              </div>
              {highlightedService && (
                <button onClick={() => setHighlightedService(null)} style={{ background: "transparent", border: "none", color: T.accent, cursor: "pointer", fontSize: 10, fontWeight: 600 }}>
                  Reset highlight
                </button>
              )}
            </div>
            <div style={{ position: "relative", height: 300 }}><canvas id="complaintTrendChart" /></div>
          </div>
          <div style={card({ padding: "18px" })}>
            <div>
              <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Category Breakdown</span>
              <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>{currentService.id}</div>
            </div>
            <div style={{ position: "relative", height: 280, marginTop: 8 }}><canvas id="complaintCategoryChart" /></div>
          </div>
        </div>

        {/* ── PRIORITY & STATUS CHARTS ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
          <div style={card({ padding: "18px" })}>
            <div>
              <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Priority Distribution</span>
              <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>{currentService.id}</div>
            </div>
            <div style={{ position: "relative", height: 260, marginTop: 8 }}><canvas id="complaintPriorityChart" /></div>
          </div>
          <div style={card({ padding: "18px" })}>
            <div>
              <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Status Distribution</span>
              <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>{currentService.id}</div>
            </div>
            <div style={{ position: "relative", height: 260, marginTop: 8 }}><canvas id="complaintStatusChart" /></div>
          </div>
        </div>

        {/* ── DETAIL TABLE ── */}
        <div style={card({ padding: "18px" })}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div>
              <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Complaint Breakdown</span>
              <span style={{ fontSize: 10, color: T.muted, marginLeft: 12 }}>{currentService.id} · {periodLabel}</span>
            </div>
            <Badge color="blue" T={T}>Total: {currentService.totalComplaints} Complaints</Badge>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr>
                  {["Category", "Count", "% of Total", "Priority Level", "Status", "Resolution Time"].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentService.categories.map((c) => {
                  const priority = currentService.priority.find(p => p.label === "Medium") || { label: "Medium", color: "#F59E0B" };
                  const status = currentService.status.find(s => s.label === "Resolved") || { label: "Resolved", color: "#10B981" };
                  const pct = ((c.count / currentService.totalComplaints) * 100);
                  return (
                    <tr key={c.label} style={{ borderBottom: `1px solid ${T.border}`, transition: "background 0.15s" }} onMouseEnter={(e) => e.currentTarget.style.background = T.tableHeaderBg} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                      <td style={{ ...tdStyle, fontWeight: 600 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 10, height: 10, borderRadius: "50%", background: c.color }} />
                          {c.label}
                        </div>
                      </td>
                      <td style={{ ...tdStyle, fontWeight: 700 }}>{c.count}</td>
                      <td style={tdStyle}>{pct.toFixed(1)}%</td>
                      <td style={tdStyle}>
                        <Badge color={c.count > 20 ? "danger" : c.count > 10 ? "warn" : "green"} T={T}>
                          {c.count > 20 ? "High" : c.count > 10 ? "Medium" : "Low"}
                        </Badge>
                      </td>
                      <td style={tdStyle}>
                        <Badge color={currentService.resolutionRate >= 90 ? "green" : "warn"} T={T}>
                          {currentService.resolutionRate >= 90 ? "Resolved" : "In Progress"}
                        </Badge>
                      </td>
                      <td style={tdStyle}>{currentService.avgResolutionTime} days</td>
                    </tr>
                  );
                })}
                <tr style={{ background: T.tableHeaderBg }}>
                  <td style={{ ...tdStyle, fontWeight: 800, color: T.text }}>TOTAL</td>
                  <td style={{ ...tdStyle, fontWeight: 800, color: T.accent }}>{currentService.totalComplaints}</td>
                  <td style={{ ...tdStyle, fontWeight: 800 }}>100%</td>
                  <td style={tdStyle}></td>
                  <td style={tdStyle}></td>
                  <td style={tdStyle}></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div style={{ marginTop: 20, fontSize: 11, color: T.muted, textAlign: "center", padding: "12px 0", borderTop: `1px solid ${T.border}` }}>
          <BIcon name="bi-database" size={12} style={{ marginRight: 6 }} />
          Complaint data based on reported issues · {currentService.id} · {periodLabel} · ASIS QMS
          <span style={{ margin: "0 12px" }}>|</span>
          <BIcon name="bi-clock" size={12} style={{ marginRight: 4 }} />
          Last updated: 18 May 2026
        </div>
      </div>
    </div>
  );
}