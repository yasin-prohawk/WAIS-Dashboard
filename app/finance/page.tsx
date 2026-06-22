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

/* ─── FINANCE DATA ────────────────────────────── */
const MONTHS_12 = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Pre-VCM Data
const PRE_VCM_DATA = {
  totalBudget: 12500000,
  actualSpent: 11250000,
  variance: -1250000,
  variancePercentage: -10,
  categories: [
    { label: "Facility Maintenance", budget: 3200000, actual: 2980000, variance: -220000, color: "#0EA5E9" },
    { label: "Biomedical Equipment", budget: 2800000, actual: 2650000, variance: -150000, color: "#F59E0B" },
    { label: "Cleaning Services", budget: 1800000, actual: 1720000, variance: -80000, color: "#10B981" },
    { label: "Linen & Laundry", budget: 1200000, actual: 1150000, variance: -50000, color: "#8B5CF6" },
    { label: "Waste Management", budget: 950000, actual: 920000, variance: -30000, color: "#6F42C1" },
    { label: "Security Services", budget: 850000, actual: 820000, variance: -30000, color: "#EF4444" },
    { label: "Administrative", budget: 700000, actual: 680000, variance: -20000, color: "#EC4899" },
    { label: "Utilities", budget: 1200000, actual: 1150000, variance: -50000, color: "#06B6D4" },
  ],
  monthlyTrend: {
    "Jan": { budget: 1041666.67, actual: 950000 },
    "Feb": { budget: 1041666.67, actual: 980000 },
    "Mar": { budget: 1041666.67, actual: 1020000 },
    "Apr": { budget: 1041666.67, actual: 980000 },
    "May": { budget: 1041666.67, actual: 950000 },
    "Jun": { budget: 1041666.67, actual: 920000 },
    "Jul": { budget: 1041666.67, actual: 900000 },
    "Aug": { budget: 1041666.67, actual: 930000 },
    "Sep": { budget: 1041666.67, actual: 960000 },
    "Oct": { budget: 1041666.67, actual: 940000 },
    "Nov": { budget: 1041666.67, actual: 920000 },
    "Dec": { budget: 1041666.67, actual: 910000 },
  },
  summary: {
    totalVariation: -1250000,
    percentVariation: -10,
    categoriesWithVariance: 8,
    categoriesWithPositiveVariance: 0,
    categoriesWithNegativeVariance: 8,
  }
};

// Post-VCM Data
const POST_VCM_DATA = {
  totalBudget: 12500000,
  actualSpent: 10250000,
  variance: -2250000,
  variancePercentage: -18,
  categories: [
    { label: "Facility Maintenance", budget: 3200000, actual: 2750000, variance: -450000, color: "#0EA5E9" },
    { label: "Biomedical Equipment", budget: 2800000, actual: 2450000, variance: -350000, color: "#F59E0B" },
    { label: "Cleaning Services", budget: 1800000, actual: 1600000, variance: -200000, color: "#10B981" },
    { label: "Linen & Laundry", budget: 1200000, actual: 1080000, variance: -120000, color: "#8B5CF6" },
    { label: "Waste Management", budget: 950000, actual: 870000, variance: -80000, color: "#6F42C1" },
    { label: "Security Services", budget: 850000, actual: 780000, variance: -70000, color: "#EF4444" },
    { label: "Administrative", budget: 700000, actual: 640000, variance: -60000, color: "#EC4899" },
    { label: "Utilities", budget: 1200000, actual: 1080000, variance: -120000, color: "#06B6D4" },
  ],
  monthlyTrend: {
    "Jan": { budget: 1041666.67, actual: 920000 },
    "Feb": { budget: 1041666.67, actual: 890000 },
    "Mar": { budget: 1041666.67, actual: 850000 },
    "Apr": { budget: 1041666.67, actual: 880000 },
    "May": { budget: 1041666.67, actual: 860000 },
    "Jun": { budget: 1041666.67, actual: 830000 },
    "Jul": { budget: 1041666.67, actual: 850000 },
    "Aug": { budget: 1041666.67, actual: 870000 },
    "Sep": { budget: 1041666.67, actual: 840000 },
    "Oct": { budget: 1041666.67, actual: 820000 },
    "Nov": { budget: 1041666.67, actual: 800000 },
    "Dec": { budget: 1041666.67, actual: 790000 },
  },
  summary: {
    totalVariation: -2250000,
    percentVariation: -18,
    categoriesWithVariance: 8,
    categoriesWithPositiveVariance: 0,
    categoriesWithNegativeVariance: 8,
  }
};

// Comparison Data (Pre vs Post VCM)
const COMPARISON_DATA = {
  preVCMTotal: 12500000,
  postVCMTotal: 12500000,
  preVCMActual: 11250000,
  postVCMActual: 10250000,
  preVCMVariance: -1250000,
  postVCMVariance: -2250000,
  categories: [
    { 
      label: "Facility Maintenance", 
      preBudget: 3200000, postBudget: 3200000,
      preActual: 2980000, postActual: 2750000,
      preVariance: -220000, postVariance: -450000,
      color: "#0EA5E9" 
    },
    { 
      label: "Biomedical Equipment", 
      preBudget: 2800000, postBudget: 2800000,
      preActual: 2650000, postActual: 2450000,
      preVariance: -150000, postVariance: -350000,
      color: "#F59E0B" 
    },
    { 
      label: "Cleaning Services", 
      preBudget: 1800000, postBudget: 1800000,
      preActual: 1720000, postActual: 1600000,
      preVariance: -80000, postVariance: -200000,
      color: "#10B981" 
    },
    { 
      label: "Linen & Laundry", 
      preBudget: 1200000, postBudget: 1200000,
      preActual: 1150000, postActual: 1080000,
      preVariance: -50000, postVariance: -120000,
      color: "#8B5CF6" 
    },
    { 
      label: "Waste Management", 
      preBudget: 950000, postBudget: 950000,
      preActual: 920000, postActual: 870000,
      preVariance: -30000, postVariance: -80000,
      color: "#6F42C1" 
    },
    { 
      label: "Security Services", 
      preBudget: 850000, postBudget: 850000,
      preActual: 820000, postActual: 780000,
      preVariance: -30000, postVariance: -70000,
      color: "#EF4444" 
    },
    { 
      label: "Administrative", 
      preBudget: 700000, postBudget: 700000,
      preActual: 680000, postActual: 640000,
      preVariance: -20000, postVariance: -60000,
      color: "#EC4899" 
    },
    { 
      label: "Utilities", 
      preBudget: 1200000, postBudget: 1200000,
      preActual: 1150000, postActual: 1080000,
      preVariance: -50000, postVariance: -120000,
      color: "#06B6D4" 
    },
  ]
};

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

/* ─── EXPORT ─────────────────────────────────────── */
function exportExcelFinance(data: any, period: string, type: string) {
  if (!window.XLSX) return;
  const wb = window.XLSX.utils.book_new();
  const sheetData: any[][] = [
    [`Finance Dashboard - ${type}`, period],
    [],
    ["Total Budget", "RM " + data.totalBudget.toLocaleString()],
    ["Actual Spent", "RM " + data.actualSpent.toLocaleString()],
    ["Variance", "RM " + data.variance.toLocaleString()],
    ["Variance %", data.variancePercentage + "%"],
    [],
    ["Category Breakdown"],
    ["Category", "Budget (RM)", "Actual (RM)", "Variance (RM)", "Variance %"]
  ];
  data.categories.forEach((c: any) => {
    sheetData.push([c.label, c.budget.toLocaleString(), c.actual.toLocaleString(), c.variance.toLocaleString(), ((c.variance / c.budget) * 100).toFixed(1) + "%"]);
  });
  const ws = window.XLSX.utils.aoa_to_sheet(sheetData);
  window.XLSX.utils.book_append_sheet(wb, ws, "Finance_Summary");
  window.XLSX.writeFile(wb, `Finance_${type}_${period}_${new Date().toISOString().slice(0, 10)}.xlsx`);
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
export default function FinanceDashboard() {
  const { openSidebar } = useDashboardNav();
  const [themeName, setThemeName] = useState<"dark" | "light">("light");
  const [frequency, setFrequency] = useState("monthly");
  const [frequencyKey, setFrequencyKey] = useState("all");
  const [selectedYear, setSelectedYear] = useState("2026");
  const [viewType, setViewType] = useState<"pre" | "post" | "comparison">("pre");
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

  const getData = () => {
    if (viewType === "pre") return PRE_VCM_DATA;
    if (viewType === "post") return POST_VCM_DATA;
    return COMPARISON_DATA;
  };

  const currentData = getData();
  const fmtRM = (n: number) => "RM " + n.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

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
  }, [themeName, viewType, frequency, frequencyKey, currentData]);

  const initCharts = () => {
    if (!window.Chart) { setTimeout(initCharts, 200); return; }

    ["financeBudgetChart", "financeTrendChart", "financeVarianceChart", "financeComparisonChart"].forEach(id => {
      const c = document.getElementById(id) as HTMLCanvasElement;
      if (c) { const ex = window.Chart.getChart(c); if (ex) ex.destroy(); }
    });

    if (viewType === "comparison") {
      // Comparison View - Pre vs Post VCM
      const compData = currentData as typeof COMPARISON_DATA;
      const labels = compData.categories.map(c => c.label);
      
      mkBar("financeBudgetChart",
        labels,
        [
          {
            label: "Pre-VCM Actual",
            data: compData.categories.map(c => c.preActual),
            backgroundColor: "#0EA5E9",
            borderRadius: 4,
          },
          {
            label: "Post-VCM Actual",
            data: compData.categories.map(c => c.postActual),
            backgroundColor: "#EF4444",
            borderRadius: 4,
          }
        ],
        T,
        { stacked: false }
      );

      // Comparison Variance Chart
      mkBar("financeVarianceChart",
        labels,
        [
          {
            label: "Pre-VCM Variance",
            data: compData.categories.map(c => c.preVariance),
            backgroundColor: "#0EA5E9",
            borderRadius: 4,
          },
          {
            label: "Post-VCM Variance",
            data: compData.categories.map(c => c.postVariance),
            backgroundColor: "#EF4444",
            borderRadius: 4,
          }
        ],
        T,
        { stacked: false }
      );

    } else {
      // Pre-VCM or Post-VCM View
      const data = currentData as typeof PRE_VCM_DATA;
      const labels = data.categories.map(c => c.label);

      // Budget vs Actual Chart
      mkBar("financeBudgetChart",
        labels,
        [
          {
            label: "Budget",
            data: data.categories.map(c => c.budget),
            backgroundColor: "#0EA5E9",
            borderRadius: 4,
          },
          {
            label: "Actual",
            data: data.categories.map(c => c.actual),
            backgroundColor: "#F59E0B",
            borderRadius: 4,
          }
        ],
        T,
        { stacked: false }
      );

      // Variance Chart
      mkBar("financeVarianceChart",
        labels,
        [
          {
            label: "Variance",
            data: data.categories.map(c => c.variance),
            backgroundColor: data.categories.map(c => c.variance < 0 ? "#EF4444" : "#10B981"),
            borderRadius: 4,
          }
        ],
        T,
        { stacked: false }
      );

      // Monthly Trend Chart
      const months = Object.keys(data.monthlyTrend);
      mkLine("financeTrendChart",
        months,
        [
          {
            label: "Budget",
            data: months.map(m => data.monthlyTrend[m as keyof typeof data.monthlyTrend].budget),
            borderColor: "#0EA5E9",
            backgroundColor: "#0EA5E9",
            pointBackgroundColor: "#0EA5E9",
          },
          {
            label: "Actual",
            data: months.map(m => data.monthlyTrend[m as keyof typeof data.monthlyTrend].actual),
            borderColor: "#F59E0B",
            backgroundColor: "#F59E0B",
            pointBackgroundColor: "#F59E0B",
          }
        ],
        T,
        {
          scales: {
            y: {
              ticks: {
                callback: (v: number) => "RM " + (v / 1000).toFixed(0) + "K"
              }
            }
          }
        }
      );
    }
  };

  const card = (e?: React.CSSProperties): React.CSSProperties => ({ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, ...e });
  const thStyle: React.CSSProperties = { background: T.tableHeaderBg, color: T.accent, padding: "10px 14px", textAlign: "left", fontWeight: 700, fontSize: 12, borderBottom: `2px solid ${T.border}` };
  const tdStyle: React.CSSProperties = { padding: "10px 14px", borderBottom: `1px solid ${T.border}`, color: T.text };

  const viewLabel = viewType === "pre" ? "Pre-VCM" : viewType === "post" ? "Post-VCM" : "Pre vs Post VCM Comparison";
  const periodLabel = frequencyKey === "all" ? `Full Year ${selectedYear}` : `${frequencyKey.toUpperCase()} - ${selectedYear}`;

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
            <div style={{ fontSize: 17, fontWeight: 700, color: htc }}>Finance Dashboard</div>
            <div style={{ fontSize: 11, color: htc, opacity: 0.6 }}>{viewLabel} · {periodLabel}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => exportExcelFinance(currentData, periodLabel, viewLabel)} title="Export" style={{ background: T.success + "12", border: `1px solid ${T.success}25`, color: T.success, width: 34, height: 34, borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><BIcon name="bi-download" size={15} color={T.success} /></button>
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
          <span style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>View</span>
          <div style={{ display: "flex", gap: 4 }}>
            <button onClick={() => setViewType("pre")} style={{ padding: "4px 14px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", background: viewType === "pre" ? "#0EA5E9" : "rgba(255,255,255,0.08)", color: viewType === "pre" ? "#fff" : "rgba(255,255,255,0.7)", border: viewType === "pre" ? "1px solid #0EA5E9" : "1px solid rgba(255,255,255,0.15)" }}>Pre-VCM</button>
            <button onClick={() => setViewType("post")} style={{ padding: "4px 14px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", background: viewType === "post" ? "#EF4444" : "rgba(255,255,255,0.08)", color: viewType === "post" ? "#fff" : "rgba(255,255,255,0.7)", border: viewType === "post" ? "1px solid #EF4444" : "1px solid rgba(255,255,255,0.15)" }}>Post-VCM</button>
            <button onClick={() => setViewType("comparison")} style={{ padding: "4px 14px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", background: viewType === "comparison" ? "#8B5CF6" : "rgba(255,255,255,0.08)", color: viewType === "comparison" ? "#fff" : "rgba(255,255,255,0.7)", border: viewType === "comparison" ? "1px solid #8B5CF6" : "1px solid rgba(255,255,255,0.15)" }}>Comparison</button>
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, paddingLeft: 16, borderLeft: "1px solid rgba(255,255,255,0.15)" }}>
          <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Period</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{periodLabel}</span>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ flex: 1, overflow: "auto", padding: "20px 24px" }}>

        {/* ── KPI CARDS ── */}
        {viewType !== "comparison" ? (
          // Pre-VCM or Post-VCM KPI Cards
          (() => {
            const data = currentData as typeof PRE_VCM_DATA;
            return (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
                <div style={{ ...card({ padding: "18px 20px" }), borderLeft: `4px solid #0EA5E9`, background: `linear-gradient(135deg, #0EA5E908, ${T.card})` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.3px" }}>Total Budget</div>
                      <div style={{ fontSize: 28, fontWeight: 800, color: "#0EA5E9", marginTop: 4 }}>{fmtRM(data.totalBudget)}</div>
                    </div>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: "#0EA5E915", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <BIcon name="bi-wallet2" size={20} color="#0EA5E9" />
                    </div>
                  </div>
                </div>
                <div style={{ ...card({ padding: "18px 20px" }), borderLeft: `4px solid #F59E0B` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.3px" }}>Actual Spent</div>
                      <div style={{ fontSize: 28, fontWeight: 800, color: "#F59E0B", marginTop: 4 }}>{fmtRM(data.actualSpent)}</div>
                    </div>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: "#F59E0B15", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <BIcon name="bi-credit-card" size={20} color="#F59E0B" />
                    </div>
                  </div>
                </div>
                <div style={{ ...card({ padding: "18px 20px" }), borderLeft: `4px solid ${data.variance < 0 ? '#EF4444' : '#10B981'}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.3px" }}>Variance</div>
                      <div style={{ fontSize: 28, fontWeight: 800, color: data.variance < 0 ? '#EF4444' : '#10B981', marginTop: 4 }}>{fmtRM(data.variance)}</div>
                    </div>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: `${data.variance < 0 ? '#EF4444' : '#10B981'}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <BIcon name={data.variance < 0 ? "bi-arrow-down" : "bi-arrow-up"} size={20} color={data.variance < 0 ? '#EF4444' : '#10B981'} />
                    </div>
                  </div>
                </div>
                <div style={{ ...card({ padding: "18px 20px" }), borderLeft: `4px solid ${Math.abs(data.variancePercentage) > 15 ? '#EF4444' : '#F59E0B'}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.3px" }}>Variance %</div>
                      <div style={{ fontSize: 28, fontWeight: 800, color: Math.abs(data.variancePercentage) > 15 ? '#EF4444' : '#F59E0B', marginTop: 4 }}>{data.variancePercentage}%</div>
                    </div>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: `${Math.abs(data.variancePercentage) > 15 ? '#EF4444' : '#F59E0B'}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <BIcon name="bi-percent" size={20} color={Math.abs(data.variancePercentage) > 15 ? '#EF4444' : '#F59E0B'} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })()
        ) : (
          // Comparison KPI Cards
          (() => {
            const data = currentData as typeof COMPARISON_DATA;
            return (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
                <div style={{ ...card({ padding: "18px 20px" }), borderLeft: `4px solid #0EA5E9`, background: `linear-gradient(135deg, #0EA5E908, ${T.card})` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.3px" }}>Pre-VCM Actual</div>
                      <div style={{ fontSize: 28, fontWeight: 800, color: "#0EA5E9", marginTop: 4 }}>{fmtRM(data.preVCMActual)}</div>
                    </div>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: "#0EA5E915", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <BIcon name="bi-clock-history" size={20} color="#0EA5E9" />
                    </div>
                  </div>
                </div>
                <div style={{ ...card({ padding: "18px 20px" }), borderLeft: `4px solid #EF4444` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.3px" }}>Post-VCM Actual</div>
                      <div style={{ fontSize: 28, fontWeight: 800, color: "#EF4444", marginTop: 4 }}>{fmtRM(data.postVCMActual)}</div>
                    </div>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: "#EF444415", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <BIcon name="bi-clock" size={20} color="#EF4444" />
                    </div>
                  </div>
                </div>
                <div style={{ ...card({ padding: "18px 20px" }), borderLeft: `4px solid #F59E0B` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.3px" }}>Pre-VCM Variance</div>
                      <div style={{ fontSize: 28, fontWeight: 800, color: "#F59E0B", marginTop: 4 }}>{fmtRM(data.preVCMVariance)}</div>
                    </div>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: "#F59E0B15", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <BIcon name="bi-arrow-down-circle" size={20} color="#F59E0B" />
                    </div>
                  </div>
                </div>
                <div style={{ ...card({ padding: "18px 20px" }), borderLeft: `4px solid #8B5CF6` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.3px" }}>Post-VCM Variance</div>
                      <div style={{ fontSize: 28, fontWeight: 800, color: "#8B5CF6", marginTop: 4 }}>{fmtRM(data.postVCMVariance)}</div>
                    </div>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: "#8B5CF615", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <BIcon name="bi-arrow-down-circle" size={20} color="#8B5CF6" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })()
        )}

        {/* ── CHARTS ── */}
        {viewType !== "comparison" ? (
          // Pre-VCM or Post-VCM Charts
          (() => {
            const data = currentData as typeof PRE_VCM_DATA;
            return (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
                  <div style={card({ padding: "18px" })}>
                    <div>
                      <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Budget vs Actual by Category</span>
                      <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>{viewLabel} · {periodLabel}</div>
                    </div>
                    <div style={{ position: "relative", height: 320, marginTop: 8 }}><canvas id="financeBudgetChart" /></div>
                  </div>
                  <div style={card({ padding: "18px" })}>
                    <div>
                      <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Variance by Category</span>
                      <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>{viewLabel} · {periodLabel}</div>
                    </div>
                    <div style={{ position: "relative", height: 320, marginTop: 8 }}><canvas id="financeVarianceChart" /></div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16, marginBottom: 24 }}>
                  <div style={card({ padding: "18px" })}>
                    <div>
                      <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Monthly Budget vs Actual Trend</span>
                      <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>{viewLabel} · {periodLabel}</div>
                    </div>
                    <div style={{ position: "relative", height: 280, marginTop: 8 }}><canvas id="financeTrendChart" /></div>
                  </div>
                </div>
              </>
            );
          })()
        ) : (
          // Comparison Charts
          (() => {
            return (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
                <div style={card({ padding: "18px" })}>
                  <div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Pre vs Post VCM - Actual Spending</span>
                    <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>Comparison by Category</div>
                  </div>
                  <div style={{ position: "relative", height: 340, marginTop: 8 }}><canvas id="financeBudgetChart" /></div>
                </div>
                <div style={card({ padding: "18px" })}>
                  <div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Pre vs Post VCM - Variance</span>
                    <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>Comparison by Category</div>
                  </div>
                  <div style={{ position: "relative", height: 340, marginTop: 8 }}><canvas id="financeVarianceChart" /></div>
                </div>
              </div>
            );
          })()
        )}

        {/* ── DETAIL TABLE ── */}
        <div style={card({ padding: "18px" })}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div>
              <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Financial Breakdown</span>
              <span style={{ fontSize: 10, color: T.muted, marginLeft: 12 }}>{viewLabel} · {periodLabel}</span>
            </div>
            <Badge color="blue" T={T}>Total Categories: {viewType !== "comparison" ? (currentData as typeof PRE_VCM_DATA).categories.length : (currentData as typeof COMPARISON_DATA).categories.length}</Badge>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr>
                  {viewType !== "comparison" ? (
                    ["Category", "Budget (RM)", "Actual (RM)", "Variance (RM)", "Variance %", "Status"].map(h => (
                      <th key={h} style={thStyle}>{h}</th>
                    ))
                  ) : (
                    ["Category", "Pre-VCM Budget", "Pre-VCM Actual", "Pre-VCM Variance", "Post-VCM Budget", "Post-VCM Actual", "Post-VCM Variance", "Status"].map(h => (
                      <th key={h} style={thStyle}>{h}</th>
                    ))
                  )}
                </tr>
              </thead>
              <tbody>
                {viewType !== "comparison" ? (
                  (() => {
                    const data = currentData as typeof PRE_VCM_DATA;
                    return data.categories.map((c) => {
                      const variancePct = (c.variance / c.budget) * 100;
                      const isNegative = c.variance < 0;
                      return (
                        <tr key={c.label} style={{ borderBottom: `1px solid ${T.border}`, transition: "background 0.15s" }} onMouseEnter={(e) => e.currentTarget.style.background = T.tableHeaderBg} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                          <td style={{ ...tdStyle, fontWeight: 600 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{ width: 10, height: 10, borderRadius: "50%", background: c.color }} />
                              {c.label}
                            </div>
                          </td>
                          <td style={tdStyle}>{fmtRM(c.budget)}</td>
                          <td style={tdStyle}>{fmtRM(c.actual)}</td>
                          <td style={{ ...tdStyle, fontWeight: 600, color: isNegative ? T.danger : T.success }}>{fmtRM(c.variance)}</td>
                          <td style={{ ...tdStyle, color: Math.abs(variancePct) > 15 ? T.danger : T.warn }}>{variancePct.toFixed(1)}%</td>
                          <td style={tdStyle}>
                            <Badge color={Math.abs(variancePct) < 5 ? "green" : Math.abs(variancePct) < 15 ? "warn" : "danger"} T={T}>
                              {Math.abs(variancePct) < 5 ? "On Track" : Math.abs(variancePct) < 15 ? "Monitor" : "Alert"}
                            </Badge>
                          </td>
                        </tr>
                      );
                    });
                  })()
                ) : (
                  (() => {
                    const data = currentData as typeof COMPARISON_DATA;
                    return data.categories.map((c) => {
                      const preVariancePct = (c.preVariance / c.preBudget) * 100;
                      const postVariancePct = (c.postVariance / c.postBudget) * 100;
                      const isNegative = c.postVariance < 0;
                      return (
                        <tr key={c.label} style={{ borderBottom: `1px solid ${T.border}`, transition: "background 0.15s" }} onMouseEnter={(e) => e.currentTarget.style.background = T.tableHeaderBg} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                          <td style={{ ...tdStyle, fontWeight: 600 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{ width: 10, height: 10, borderRadius: "50%", background: c.color }} />
                              {c.label}
                            </div>
                          </td>
                          <td style={tdStyle}>{fmtRM(c.preBudget)}</td>
                          <td style={tdStyle}>{fmtRM(c.preActual)}</td>
                          <td style={{ ...tdStyle, fontWeight: 600, color: c.preVariance < 0 ? T.danger : T.success }}>{fmtRM(c.preVariance)}</td>
                          <td style={tdStyle}>{fmtRM(c.postBudget)}</td>
                          <td style={tdStyle}>{fmtRM(c.postActual)}</td>
                          <td style={{ ...tdStyle, fontWeight: 600, color: isNegative ? T.danger : T.success }}>{fmtRM(c.postVariance)}</td>
                          <td style={tdStyle}>
                            <Badge color={Math.abs(postVariancePct) < 5 ? "green" : Math.abs(postVariancePct) < 15 ? "warn" : "danger"} T={T}>
                              {Math.abs(postVariancePct) < 5 ? "On Track" : Math.abs(postVariancePct) < 15 ? "Monitor" : "Alert"}
                            </Badge>
                          </td>
                        </tr>
                      );
                    });
                  })()
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div style={{ marginTop: 20, fontSize: 11, color: T.muted, textAlign: "center", padding: "12px 0", borderTop: `1px solid ${T.border}` }}>
          <BIcon name="bi-database" size={12} style={{ marginRight: 6 }} />
          Financial data based on actual spending · {viewLabel} · {periodLabel} · ASIS QMS
          <span style={{ margin: "0 12px" }}>|</span>
          <BIcon name="bi-clock" size={12} style={{ marginRight: 4 }} />
          Last updated: 18 May 2026
        </div>
      </div>
    </div>
  );
}