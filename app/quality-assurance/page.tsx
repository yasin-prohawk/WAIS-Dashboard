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

/* ─── QAP DATA ────────────────────────────── */
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May"];

/* Flat list of ALL indicators (mirrors the left sidebar in the reference image) */
const ALL_INDICATORS = [
  { key: "FEMS_PPM",         service: "FEMS", label: "FEMS PPM Completion",          value: 86.84,  target: 100,  scheduled: 76, completed: 66, notDone: 10, color: "#0EA5E9" },
  { key: "FEMS_AVAIL",       service: "FEMS", label: "FEMS Service Availability",    value: 98.20,  target: 98,   scheduled: 50, completed: 49, notDone: 1,  color: "#06B6D4" },
  { key: "BEMS_PPM",         service: "BEMS", label: "BEMS PPM Completion",          value: 100,    target: 100,  scheduled: 40, completed: 40, notDone: 0,  color: "#F59E0B" },
  { key: "BEMS_AVAIL",       service: "BEMS", label: "BEMS Service Availability",    value: 100,    target: 98,   scheduled: 30, completed: 30, notDone: 0,  color: "#FBBF24" },
  { key: "CLS_QUALITY",      service: "CLS",  label: "CLS Cleansing Quality",        value: 99.19,  target: 98,   scheduled: 52, completed: 51, notDone: 1,  color: "#10B981" },
  { key: "CLS_WASTE",        service: "CLS",  label: "CLS General Waste Collection", value: 100,    target: 100,  scheduled: 52, completed: 52, notDone: 0,  color: "#34D399" },
  { key: "LLS_ACCEPTANCE",   service: "LLS",  label: "LLS Linen Acceptance",         value: 100,    target: 98,   scheduled: 20, completed: 20, notDone: 0,  color: "#8B5CF6" },
  { key: "LLS_SUPPLY",       service: "LLS",  label: "LLS Linen Supply",             value: 100,    target: 98,   scheduled: 20, completed: 20, notDone: 0,  color: "#A78BFA" },
  { key: "LLS_TIMELY",       service: "LLS",  label: "LLS Linen Timely Delivery",    value: 100,    target: 98,   scheduled: 20, completed: 20, notDone: 0,  color: "#7C3AED" },
  { key: "HWMS_CLINICAL",    service: "HWMS", label: "HWMS Clinical Waste Collection",value: 100,   target: 100,  scheduled: 12, completed: 12, notDone: 0,  color: "#6F42C1" },
  { key: "HWMS_CLINICAL2",   service: "HWMS", label: "HWMS Clinical Waste Manifests",value: 100,    target: 100,  scheduled: 12, completed: 12, notDone: 0,  color: "#007BFF" },
];

const QAP_SERVICES = [
  {
    id: "FEMS", label: "Facility & Engineering Management Services", accent: "#0EA5E9",
    completion: 86.84, trend: [82, 84, 85, 86, 86.84],
    indicators: [
      { label: "PPM Completion Rate",  value: 86.84, color: "#0EA5E9", target: 100 },
      { label: "Service Availability", value: 98.2,  color: "#06B6D4", target: 98  },
    ],
    totalUserArea: 52,
  },
  {
    id: "BEMS", label: "Bio-Medical Engineering Management Services", accent: "#F59E0B",
    completion: 100, trend: [98, 99, 99.5, 100, 100],
    indicators: [
      { label: "Biomedical PPM",        value: 100, color: "#F59E0B", target: 100 },
      { label: "Service Availability",  value: 100, color: "#FBBF24", target: 98  },
    ],
    totalUserArea: 52,
  },
  {
    id: "CLS", label: "Cleaning Services", accent: "#10B981",
    completion: 99.19, trend: [98.2, 98.9, 99.0, 99.1, 99.19],
    indicators: [
      { label: "Cleansing Quality Score",  value: 99.19, color: "#10B981", target: 98  },
      { label: "General Waste Collection", value: 100,   color: "#34D399", target: 100 },
    ],
    totalUserArea: 52,
  },
  {
    id: "LLS", label: "Linen & Laundry Services", accent: "#8B5CF6",
    completion: 100, trend: [99.7, 100, 100, 100, 100],
    indicators: [
      { label: "Linen Acceptance",   value: 100, color: "#8B5CF6", target: 98 },
      { label: "Linen Supply",       value: 100, color: "#A78BFA", target: 98 },
      { label: "Timely Delivery",    value: 100, color: "#7C3AED", target: 98 },
    ],
    totalUserArea: 52,
  },
  {
    id: "HWMS", label: "Healthcare Waste Management Services", accent: "#6F42C1",
    completion: 100, trend: [98.5, 99, 100, 100, 100],
    indicators: [
      { label: "Clinical Waste Collection", value: 100, color: "#6F42C1", target: 100 },
      { label: "Clinical Waste Manifests",  value: 100, color: "#007BFF", target: 100 },
    ],
    totalUserArea: 52,
  },
];

/* ─── THEMES ────────────────────────────────────── */
const THEMES = {
  dark: {
    bg: "#0d1520", panel: "#111d2b", card: "#162233", border: "#1e3248",
    text: "#e0e7ff", muted: "#8a9cb8", accent: "#5a9fd4",
    success: "#22c55e", warn: "#f59e0b", danger: "#ef4444",
    gridColor: "rgba(255,255,255,0.07)", tickColor: "#6b8099",
    scrollThumb: "#2a3f55", inputBg: "#162233", selectBg: "#162233",
    tableHeaderBg: "rgba(90,159,212,0.08)",
    sidebarBg: "#0d1a27", sidebarActiveBg: "#1a3a5c",
  },
  light: {
    bg: "#f0f4f8", panel: "#ffffff", card: "#ffffff", border: "#dde3ed",
    text: "#1a2636", muted: "#6b7fa3", accent: "#1a6bb5",
    success: "#16a34a", warn: "#d97706", danger: "#dc2626",
    gridColor: "rgba(0,0,0,0.06)", tickColor: "#8a9cb8",
    scrollThumb: "#c5cfe0", inputBg: "#f8fafc", selectBg: "#f8fafc",
    tableHeaderBg: "rgba(26,107,181,0.06)",
    sidebarBg: "#e8edf5", sidebarActiveBg: "#d0e4f7",
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
  try { new window.Chart(ctx, { type: type as any, data, options: { ...options, animation: false, responsive: true, maintainAspectRatio: false } }); } catch (e) { }
}

function mkLine(id: string, labels: string[], datasets: any[], T: Theme, extra?: any) {
  const yticks: any = { color: T.tickColor, font: { size: 11 } };
  if (extra?.scales?.y?.callback) yticks.callback = extra.scales.y.callback;
  const opts: any = {
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: T.gridColor }, ticks: { color: T.tickColor, font: { size: 11 } }, border: { color: "transparent" } },
      y: { grid: { color: T.gridColor }, border: { color: "transparent" }, ticks: yticks, min: 0, max: 120 },
    }
  };
  if (extra?.plugins) opts.plugins = { ...opts.plugins, ...extra.plugins };
  drawChart(id, "line", { labels, datasets: datasets.map((d: any) => ({ ...d, borderWidth: d.borderWidth || 2, pointRadius: d.pointRadius || 3, tension: d.tension || 0.35, fill: false })) }, opts);
}

function mkBar(id: string, labels: string[], data: number[], colors: string[] | string, T: Theme, extra?: any) {
  const scales: any = {
    x: { grid: { color: T.gridColor }, ticks: { color: T.tickColor, font: { size: 11 } }, border: { color: "transparent" } },
    y: { grid: { color: T.gridColor }, ticks: { color: T.tickColor, font: { size: 11 }, callback: (v: number) => v + "%" }, border: { color: "transparent" }, min: 0, max: 120 },
  };
  drawChart(id, "bar", { labels, datasets: [{ data, backgroundColor: colors, borderRadius: 6 }] }, { plugins: { legend: { display: false } }, scales });
}

function mkPie(id: string, labels: string[], data: number[], colors: string[], T: Theme, cutout = "60%") {
  drawChart(id, "doughnut", { labels, datasets: [{ data, backgroundColor: colors, borderWidth: 0 }] }, { cutout, plugins: { legend: { display: false } } });
}

/* ─── GAUGE DRAW ─────────────────────────────── */
function drawGauge(canvasId: string, value: number, target: number, accent: string, T: Theme) {
  const c = document.getElementById(canvasId) as HTMLCanvasElement | null;
  if (!c) return;
  const ctx = c.getContext("2d");
  if (!ctx) return;

  const W = c.width, H = c.height;
  ctx.clearRect(0, 0, W, H);
  const cx = W / 2, cy = H * 0.72, r = Math.min(W, H) * 0.38;

  // Background arc
  ctx.beginPath();
  ctx.arc(cx, cy, r, Math.PI, 2 * Math.PI);
  ctx.strokeStyle = T.border;
  ctx.lineWidth = 18;
  ctx.lineCap = "round";
  ctx.stroke();

  // Value arc
  const pct = Math.min(value / 100, 1);
  ctx.beginPath();
  ctx.arc(cx, cy, r, Math.PI, Math.PI + pct * Math.PI);
  ctx.strokeStyle = value >= target ? "#22c55e" : value >= target * 0.9 ? "#f59e0b" : "#ef4444";
  ctx.lineWidth = 18;
  ctx.lineCap = "round";
  ctx.stroke();

  // Tick marks
  for (let i = 0; i <= 10; i++) {
    const angle = Math.PI + (i / 10) * Math.PI;
    const inner = r - 24, outer = r - 12;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * inner, cy + Math.sin(angle) * inner);
    ctx.lineTo(cx + Math.cos(angle) * outer, cy + Math.sin(angle) * outer);
    ctx.strokeStyle = T.muted;
    ctx.lineWidth = i % 5 === 0 ? 2 : 1;
    ctx.stroke();
    // Labels at 50, 60, 70, 80, 90, 100
    if (i % 5 === 0) {
      const lv = i * 10;
      const lx = cx + Math.cos(angle) * (inner - 14);
      const ly = cy + Math.sin(angle) * (inner - 14);
      ctx.fillStyle = T.muted;
      ctx.font = `bold 10px DM Sans, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(lv), lx, ly);
    }
  }

  // Needle
  const needleAngle = Math.PI + pct * Math.PI;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(needleAngle) * (r - 26), cy + Math.sin(needleAngle) * (r - 26));
  ctx.strokeStyle = "#ef4444";
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, 5, 0, 2 * Math.PI);
  ctx.fillStyle = "#ef4444";
  ctx.fill();

  // Value text
  ctx.fillStyle = value >= target ? "#22c55e" : "#ef4444";
  ctx.font = `bold 18px DM Sans, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(value.toFixed(2) + " %", cx, cy + 22);

  // Target label
  ctx.fillStyle = T.muted;
  ctx.font = `11px DM Sans, sans-serif`;
  ctx.fillText("TARGET : " + target.toFixed(2) + "%", cx, cy + 40);
}

/* ─── EXPORT ─────────────────────────────────────── */
function exportExcelQAP() {
  if (!window.XLSX) return;
  const wb = window.XLSX.utils.book_new();
  const sheetData: any[][] = [
    ["Quality Assurance Program - Tapah (PRK350)", "May 2026"], [],
    ["Service", "Compliance %", "Indicator", "Status"]
  ];
  QAP_SERVICES.forEach(s => sheetData.push([s.label, s.completion + "%", s.indicators.map(i => i.label).join(", "), s.completion >= 95 ? "OK" : "Review"]));
  const ws = window.XLSX.utils.aoa_to_sheet(sheetData);
  window.XLSX.utils.book_append_sheet(wb, ws, "QAP_Summary");
  window.XLSX.writeFile(wb, `QAP_Dashboard_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

function exportServiceExcel(svc: typeof QAP_SERVICES[0]) {
  if (!window.XLSX) return;
  const wb = window.XLSX.utils.book_new();
  const detailData: any[][] = [[`${svc.id} - ${svc.label}`], [""], ["Indicator", "Compliance %", "Target %"]];
  svc.indicators.forEach(ind => detailData.push([ind.label, ind.value + "%", ind.target + "%"]));
  detailData.push(["Overall Compliance", svc.completion + "%", ""]);
  const ws = window.XLSX.utils.aoa_to_sheet(detailData);
  window.XLSX.utils.book_append_sheet(wb, ws, svc.id);
  window.XLSX.writeFile(wb, `QAP_${svc.id}_Export.xlsx`);
}

function printPage() {
  const s = document.createElement("style");
  s.id = "ps";
  s.textContent = "@page{size:A4 landscape;margin:10mm}@media print{body{-webkit-print-color-adjust:exact!important}.no-print{display:none!important}}";
  document.head.appendChild(s);
  window.print();
  setTimeout(() => { const e = document.getElementById("ps"); if (e) e.remove(); }, 1000);
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

function StatusDot({ value, target }: { value: number; target: number }) {
  const color = value >= target ? "#22c55e" : value >= target * 0.9 ? "#f59e0b" : "#ef4444";
  return <span style={{ width: 10, height: 10, borderRadius: "50%", background: color, display: "inline-block", flexShrink: 0 }} />;
}

function getContrastText(h: string) {
  const r = parseInt(h.slice(1, 3), 16), g = parseInt(h.slice(3, 5), 16), b = parseInt(h.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128 ? "#ffffff" : "#ffffff";
}

/* ─── MAIN ──────────────────────────────────────── */
export default function QAPDashboard() {
  const { openSidebar } = useDashboardNav();
  const [themeName, setThemeName] = useState<"dark" | "light">("light");
  const [frequency, setFrequency] = useState("monthly");
  const [frequencyKey, setFrequencyKey] = useState("may");
  const [selectedYear, setSelectedYear] = useState("2026");
  const [activeService, setActiveService] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"summary" | "pi" | "pareto">("summary");
  const [selectedIndicator, setSelectedIndicator] = useState<string>(ALL_INDICATORS[0].key);
  const [highlightedService, setHighlightedService] = useState<string | null>(null);

  const T = THEMES[themeName];
  const scriptsReady = useRef(false);
  const chartsInited = useRef(false);
  const HDR = "#0f172a";
  const htc = getContrastText(HDR);

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  /* ── Aggregates ── */
  const overallTotalCompletion = QAP_SERVICES.reduce((sum, s) => sum + s.completion, 0);
  const totalIndicators = QAP_SERVICES.reduce((sum, s) => sum + s.indicators.length, 0);
  const currentService = activeService === "all" ? null : QAP_SERVICES.find(s => s.id === activeService);
  const activeInd = ALL_INDICATORS.find(i => i.key === selectedIndicator) || ALL_INDICATORS[0];

  /* ── Pareto: sort indicators by gap from target ── */
  const paretoData = [...ALL_INDICATORS]
    .map(i => ({ ...i, gap: Math.max(0, i.target - i.value) }))
    .sort((a, b) => b.gap - a.gap);

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
  }, [themeName, activeService, activeTab, selectedIndicator, highlightedService]);

  const initCharts = () => {
    if (!window.Chart) { setTimeout(initCharts, 200); return; }

    const destroyAll = (ids: string[]) => ids.forEach(id => {
      const c = document.getElementById(id) as HTMLCanvasElement;
      if (c) { const ex = window.Chart.getChart(c); if (ex) ex.destroy(); }
    });

    /* ── ALL OVERVIEW charts ── */
    if (activeService === "all") {
      destroyAll(["overviewLine", "overviewBar", "overviewPie"]);
      const lineDatasets = QAP_SERVICES.map(svc => {
        const isHL = highlightedService === svc.id;
        const isDim = highlightedService && highlightedService !== svc.id;
        return {
          data: svc.trend, borderColor: svc.accent, backgroundColor: svc.accent, fill: false,
          pointRadius: isHL ? 5 : 3, borderWidth: isHL ? 3 : (isDim ? 1 : 2),
          pointBackgroundColor: svc.accent, pointBorderColor: "#fff", pointBorderWidth: isHL ? 2 : 1,
          label: svc.id, tension: 0.35, borderDash: isDim ? [5, 5] : [],
        };
      });
      mkLine("overviewLine", MONTHS, lineDatasets, T, {
        plugins: {
          legend: { display: true, position: "bottom", labels: { color: T.muted, font: { size: 10 }, boxWidth: 12, padding: 10, usePointStyle: true, pointStyleWidth: 8 } }
        },
        scales: { y: { callback: (v: number) => v.toFixed(0) + "%" } }
      });
      mkBar("overviewBar", QAP_SERVICES.map(s => s.id), QAP_SERVICES.map(s => s.completion), QAP_SERVICES.map(s => s.accent), T);
      mkPie("overviewPie", QAP_SERVICES.map(s => s.id), QAP_SERVICES.map(s => s.completion), QAP_SERVICES.map(s => s.accent), T, "55%");
    }

    /* ── INDICATOR SUMMARY view charts ── */
    if (activeService === "indicator") {
      destroyAll(["indBarChart", "indParetoChart"]);

      if (activeTab === "summary") {
        drawGauge("gaugeCanvas", activeInd.value, activeInd.target, activeInd.color, T);
        // Bar chart: monthly trend (simulated from ALL_INDICATORS trend direction)
        const trendData = MONTHS.map((_, i) => {
          const base = activeInd.value - (4 - i) * 0.5;
          return Math.min(100, Math.max(60, parseFloat(base.toFixed(2))));
        });
        mkBar("indBarChart", MONTHS.map(m => `${m} '26`), trendData, activeInd.color, T);
      }

      if (activeTab === "pareto") {
        const relevantSvcIndicators = currentService
          ? currentService.indicators.map(i => ({ label: i.label, value: i.value, target: i.target, gap: Math.max(0, i.target - i.value), color: i.color }))
          : paretoData.slice(0, 8).map(i => ({ label: i.label.replace("FEMS ", "").replace("BEMS ", "").replace("CLS ", "").replace("LLS ", "").replace("HWMS ", ""), value: i.value, target: i.target, gap: i.gap, color: i.color }));

        mkBar("indParetoChart",
          relevantSvcIndicators.map(i => i.label),
          relevantSvcIndicators.map(i => i.gap),
          relevantSvcIndicators.map(i => i.gap > 0 ? "#ef4444" : "#22c55e"),
          T
        );
      }
    }

    /* ── SINGLE SERVICE charts ── */
    if (activeService !== "all" && activeService !== "indicator" && currentService) {
      destroyAll(["serviceLine", "servicePie", "serviceBar"]);
      mkLine("serviceLine", MONTHS, [{
        data: currentService.trend, borderColor: currentService.accent,
        backgroundColor: currentService.accent + "22", fill: true,
        pointRadius: 5, borderWidth: 3,
        pointBackgroundColor: currentService.accent, pointBorderColor: "#fff", pointBorderWidth: 2, tension: 0.4,
      }], T, { scales: { y: { callback: (v: number) => v.toFixed(2) + "%" } } });
      mkPie("servicePie", currentService.indicators.map(i => i.label), currentService.indicators.map(i => i.value), currentService.indicators.map(i => i.color), T, "55%");
      mkBar("serviceBar", currentService.indicators.map(i => i.label), currentService.indicators.map(i => i.value), currentService.indicators.map(i => i.color), T);
    }
  };

  /* ── Gauge re-draw on indicator change ── */
  useEffect(() => {
    if (activeService === "indicator" && activeTab === "summary") {
      setTimeout(() => drawGauge("gaugeCanvas", activeInd.value, activeInd.target, activeInd.color, T), 50);
    }
  }, [selectedIndicator, themeName, activeTab, activeService]);

  const card = (e?: React.CSSProperties): React.CSSProperties => ({ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, ...e });
  const thStyle: React.CSSProperties = { background: T.tableHeaderBg, color: T.accent, padding: "10px 14px", textAlign: "left", fontWeight: 700, fontSize: 12, borderBottom: `2px solid ${T.border}` };
  const tdStyle: React.CSSProperties = { padding: "10px 14px", borderBottom: `1px solid ${T.border}`, color: T.text };

  /* ─── RENDER ─────────────────────────────────── */
  return (
    <div
      className="dashboard-module-page"
      style={{ fontFamily: "'DM Sans',system-ui,sans-serif", background: T.bg, color: T.text, fontSize: 15, height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}
    >
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        *,::-webkit-scrollbar{scrollbar-width:thin;scrollbar-color:${T.scrollThumb} transparent}
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:${T.scrollThumb};border-radius:99px}
        @page{size:A4 landscape;margin:10mm}
        @media print{body{-webkit-print-color-adjust:exact!important}.no-print{display:none!important}}
      `}</style>

      {/* ══ TOP BAR — identical structure to Deduction page ══ */}
      <div
        className="no-print dashboard-top-bar"
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: HDR, borderBottom: `1px solid ${htc}15`, padding: "0 24px", height: 62, flexShrink: 0 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button onClick={openSidebar} style={{ background: "transparent", border: "none", color: htc, cursor: "pointer", padding: "8px 11px", borderRadius: 10 }}>
            <BIcon name="bi-list" size={22} color={htc} />
          </button>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 8, border: `1px solid ${htc}30`, color: htc, textDecoration: "none", fontSize: 13, fontWeight: 500 }}>
            <BIcon name="bi-arrow-left" size={16} color={htc} /><span>Back</span>
          </Link>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: htc }}>Quality Assurance Program</div>
            <div style={{ fontSize: 11, color: htc, opacity: 0.6 }}>
              QAP KPI — {activeService === "all" ? "All Services Overview" : activeService === "indicator" ? "Indicator Summary" : (currentService?.id + " Details")}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => {
                if (activeService === "all") exportExcelQAP();
                else if (currentService) exportServiceExcel(currentService);
              }}
              title="Export"
              style={{ background: T.success + "12", border: `1px solid ${T.success}25`, color: T.success, width: 34, height: 34, borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <BIcon name="bi-download" size={15} color={T.success} />
            </button>
            <button onClick={printPage} title="Print" style={{ background: T.accent + "12", border: `1px solid ${T.accent}25`, color: T.accent, width: 34, height: 34, borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <BIcon name="bi-printer" size={15} color={T.accent} />
            </button>
          </div>
          <div style={{ width: 1, height: 28, background: htc, opacity: 0.12 }} />
          <button onClick={() => setThemeName(n => n === "dark" ? "light" : "dark")} style={{ background: "transparent", border: `1px solid ${htc}20`, color: htc, borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 14 }}>
            <BIcon name={themeName === "dark" ? "bi-sun-fill" : "bi-moon-fill"} size={15} color={htc} />
          </button>
          <span style={{ fontSize: 13, color: htc, opacity: 0.7 }}>18 May 2026</span>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 12px 4px 4px", background: htc + "08", borderRadius: 24, border: `1px solid ${htc}20` }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg,#0EA5E9,#8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <BIcon name="bi-person-fill" size={13} color="#fff" />
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: htc }}>Admin</span>
          </div>
        </div>
      </div>

      {/* ══ FILTER BAR — identical structure to Deduction page ══ */}
      <div
        className="no-print dashboard-filter-bar"
        style={{ display: "flex", alignItems: "center", background: HDR, borderBottom: `1px solid ${htc}15`, padding: "0 22px", height: 54, gap: 16, flexShrink: 0, flexWrap: "wrap" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>Frequency</span>
          <select value={frequency} onChange={e => { setFrequency(e.target.value); setFrequencyKey("all"); }} style={{ background: "#fff", color: "#1a2636", padding: "6px 30px 6px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer" }}>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>Frequency Key</span>
          <select value={frequencyKey} onChange={e => setFrequencyKey(e.target.value)} style={{ background: "#fff", color: "#1a2636", padding: "6px 30px 6px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer" }}>
            <option value="all">All Months</option>
            {months.map(m => <option key={m} value={m.toLowerCase()}>{m}</option>)}
          </select>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>Year</span>
          <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} style={{ background: "#fff", color: "#1a2636", padding: "6px 30px 6px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer" }}>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>
        </div>
        <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.15)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>Service</span>
          <select
            value={activeService}
            onChange={e => { setActiveService(e.target.value); setHighlightedService(null); setActiveTab("summary"); }}
            style={{ background: "#fff", color: "#1a2636", padding: "6px 30px 6px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer", fontWeight: 600 }}
          >
            <option value="all">All Services</option>
            <option value="indicator">Indicator Summary View</option>
            {QAP_SERVICES.map(svc => <option key={svc.id} value={svc.id}>{svc.id}</option>)}
          </select>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, paddingLeft: 16, borderLeft: "1px solid rgba(255,255,255,0.2)" }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.55)", textTransform: "uppercase" }}>As of</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>18 May 2026</span>
        </div>
      </div>

      {/* ══ CONTENT AREA ══ */}
      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>

        {/* ════════════════════════════════════════════
            VIEW 1 — ALL SERVICES OVERVIEW
        ════════════════════════════════════════════ */}
        {activeService === "all" && (
          <div style={{ flex: 1, overflow: "auto", padding: 20 }}>

            {/* KPI summary row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 16 }}>
              <div style={{ ...card({ padding: "16px", textAlign: "center" }), background: "linear-gradient(135deg,#0EA5E912,#8B5CF608)" }}>
                <div style={{ fontSize: 10, color: T.muted, textTransform: "uppercase", marginBottom: 6 }}>Total Services</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: T.text }}>{QAP_SERVICES.length}</div>
              </div>
              <div style={{ ...card({ padding: "16px", textAlign: "center" }), background: "linear-gradient(135deg,#F59E0B12,#F59E0B08)" }}>
                <div style={{ fontSize: 10, color: T.muted, textTransform: "uppercase", marginBottom: 6 }}>Total Indicators</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: "#F59E0B" }}>{totalIndicators}</div>
              </div>
              <div style={{ ...card({ padding: "16px", textAlign: "center" }), background: "linear-gradient(135deg,#10B98112,#10B98108)" }}>
                <div style={{ fontSize: 10, color: T.muted, textTransform: "uppercase", marginBottom: 6 }}>Overall Compliance</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: T.success }}>{(overallTotalCompletion / QAP_SERVICES.length).toFixed(2)}<span style={{ fontSize: 14, fontWeight: 600 }}>%</span></div>
                <div style={{ fontSize: 9, color: T.muted, marginTop: 4 }}>All services combined</div>
              </div>
              <div style={{ ...card({ padding: "16px", textAlign: "center" }), background: "linear-gradient(135deg,#EF444412,#EF444408)" }}>
                <div style={{ fontSize: 10, color: T.muted, textTransform: "uppercase", marginBottom: 6 }}>Services On Target</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: T.success }}>{QAP_SERVICES.filter(s => s.completion >= 95).length}/{QAP_SERVICES.length}</div>
                <div style={{ fontSize: 9, color: T.muted, marginTop: 4 }}>≥95% compliance</div>
              </div>
            </div>

            {/* Service summary cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 14, marginBottom: 16 }}>
              {QAP_SERVICES.map(svc => {
                const isHL = highlightedService === svc.id;
                const isDim = highlightedService && highlightedService !== svc.id;
                return (
                  <div
                    key={svc.id}
                    style={{
                      ...card({ padding: "16px", textAlign: "center", border: `2px solid ${isHL ? svc.accent : svc.accent + "30"}`, cursor: "pointer", position: "relative" }),
                      background: `linear-gradient(135deg,${svc.accent}18,${svc.accent}08)`,
                      opacity: isDim ? 0.5 : 1,
                      transform: isHL ? "scale(1.03)" : "scale(1)",
                      transition: "all 0.25s ease",
                      boxShadow: isHL ? `0 4px 20px ${svc.accent}30` : "none",
                    }}
                    onClick={() => setActiveService(svc.id)}
                    onMouseEnter={() => setHighlightedService(svc.id)}
                    onMouseLeave={() => setHighlightedService(null)}
                  >
                    {svc.completion === Math.max(...QAP_SERVICES.map(s => s.completion)) && <div style={{ position: "absolute", top: 8, right: 8, fontSize: 9, color: T.success, fontWeight: 700 }}>✓ Highest</div>}
                    {svc.completion === Math.min(...QAP_SERVICES.map(s => s.completion)) && svc.completion < 95 && <div style={{ position: "absolute", top: 8, right: 8, fontSize: 9, color: T.warn, fontWeight: 700 }}>Review</div>}
                    <div style={{ fontSize: 14, fontWeight: 700, color: svc.accent, marginBottom: 4 }}>{svc.id}</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: svc.accent, lineHeight: 1, marginTop: 8 }}>{svc.completion.toFixed(2)}<span style={{ fontSize: 12 }}>%</span></div>
                    <div style={{ fontSize: 9, color: T.muted, marginTop: 4 }}>Compliance</div>
                    <div style={{ marginTop: 8, display: "flex", justifyContent: "center" }}>
                      <StatusDot value={svc.completion} target={95} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Charts row */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 14, marginBottom: 16 }}>
              <div style={card({ padding: "16px" })}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>Compliance Trend — All Services (Jan–May {selectedYear})</span>
                  {highlightedService && <button onClick={() => setHighlightedService(null)} style={{ background: "transparent", border: "none", color: T.accent, cursor: "pointer", fontSize: 11, fontWeight: 600 }}>Reset</button>}
                </div>
                <div style={{ position: "relative", height: 260 }}><canvas id="overviewLine" /></div>
              </div>
              <div style={card({ padding: "16px" })}>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 12 }}>Compliance by Service</div>
                <div style={{ position: "relative", height: 260 }}><canvas id="overviewBar" /></div>
              </div>
              <div style={card({ padding: "16px" })}>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 12 }}>Distribution</div>
                <div style={{ position: "relative", height: 260, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <canvas id="overviewPie" style={{ maxWidth: 220, maxHeight: 220 }} />
                </div>
              </div>
            </div>

            {/* Summary table */}
            <div style={card({ padding: "16px" })}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 12 }}>Overall Performance Indicator Summary (May '{selectedYear.slice(2)} to May '{selectedYear.slice(2)})</div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr>{["Service", "Compliance %", "Indicators", "Trend", "Status"].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {QAP_SERVICES.map(svc => (
                    <tr
                      key={svc.id}
                      style={{ cursor: "pointer", background: highlightedService === svc.id ? svc.accent + "08" : "transparent", transition: "background 0.2s" }}
                      onClick={() => setActiveService(svc.id)}
                      onMouseEnter={() => setHighlightedService(svc.id)}
                      onMouseLeave={() => setHighlightedService(null)}
                    >
                      <td style={{ ...tdStyle, fontWeight: 600, color: svc.accent }}>{svc.id}</td>
                      <td style={tdStyle}>{svc.completion.toFixed(2)}%</td>
                      <td style={tdStyle}>{svc.indicators.length}</td>
                      <td style={tdStyle}>
                        <Badge color={svc.completion < 90 ? "danger" : svc.completion < 95 ? "warn" : "green"} T={T}>
                          {svc.completion < 90 ? "Critical" : svc.completion < 95 ? "Needs Review" : "On Target"}
                        </Badge>
                      </td>
                      <td style={tdStyle}>
                        <Badge color={svc.completion >= 95 ? "green" : "warn"} T={T}>
                          {svc.completion >= 95 ? "Compliant" : "Review"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  <tr style={{ background: T.tableHeaderBg }}>
                    <td style={{ ...tdStyle, fontWeight: 800 }}>AVERAGE</td>
                    <td style={{ ...tdStyle, fontWeight: 800, color: T.accent }}>{(overallTotalCompletion / QAP_SERVICES.length).toFixed(2)}%</td>
                    <td style={{ ...tdStyle, fontWeight: 800 }}>{totalIndicators}</td>
                    <td style={tdStyle} /><td style={tdStyle} />
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════
            VIEW 2 — INDICATOR SUMMARY VIEW
            (mirrors the reference image layout: left sidebar + right detail panel)
        ════════════════════════════════════════════ */}
        {activeService === "indicator" && (
          <div style={{ flex: 1, overflow: "hidden", display: "flex" }}>

            {/* LEFT SIDEBAR — scrollable indicator list */}
            <div style={{ width: 260, flexShrink: 0, background: T.sidebarBg, borderRight: `1px solid ${T.border}`, overflowY: "auto", padding: "12px 0" }}>
              <div style={{ padding: "8px 14px 10px", fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Overall Performance Indicator Summary
              </div>
              {ALL_INDICATORS.map(ind => {
                const isActive = selectedIndicator === ind.key;
                return (
                  <div
                    key={ind.key}
                    onClick={() => { setSelectedIndicator(ind.key); setActiveTab("summary"); }}
                    style={{
                      padding: "10px 14px",
                      cursor: "pointer",
                      background: isActive ? T.sidebarActiveBg : "transparent",
                      borderLeft: isActive ? `3px solid ${ind.color}` : "3px solid transparent",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div style={{ fontSize: 11, fontWeight: 700, color: isActive ? ind.color : T.muted, textTransform: "uppercase", marginBottom: 3 }}>
                      {ind.label}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 16, fontWeight: 800, color: isActive ? ind.color : T.text }}>{ind.value.toFixed(2)}%</span>
                      <StatusDot value={ind.value} target={ind.target} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* RIGHT DETAIL PANEL */}
            <div style={{ flex: 1, overflow: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>

              {/* Panel header + tabs */}
              <div style={card({ padding: "14px 18px" })}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{activeInd.label}</span>
                  <div style={{ display: "flex", gap: 6 }}>
                    {(["summary", "pi", "pareto"] as const).map(tab => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                          padding: "5px 14px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer",
                          background: activeTab === tab ? activeInd.color : "transparent",
                          color: activeTab === tab ? "#fff" : T.muted,
                          border: `1px solid ${activeTab === tab ? activeInd.color : T.border}`,
                          transition: "all 0.15s",
                        }}
                      >
                        {tab === "summary" ? "Indicator Summary" : tab === "pi" ? "PI Analysis" : "Pareto Analysis"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── INDICATOR SUMMARY TAB ── */}
              {activeTab === "summary" && (
                <>
                  {/* 3 stat boxes */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
                    {[
                      { label: "PPM Scheduled",  value: activeInd.scheduled, color: T.accent },
                      { label: "PPM Completed",  value: activeInd.completed, color: T.success },
                      { label: "PPM Not Done",   value: activeInd.notDone,   color: activeInd.notDone > 0 ? T.danger : T.success },
                    ].map(stat => (
                      <div key={stat.label} style={card({ padding: "20px", textAlign: "center" })}>
                        <div style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", marginBottom: 6 }}>{stat.label}</div>
                        <div style={{ fontSize: 36, fontWeight: 800, color: stat.color }}>{stat.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Gauge + Bar chart — side by side */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 14 }}>

                    {/* Gauge card */}
                    <div style={{ ...card({ padding: "16px" }), display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 8, alignSelf: "flex-start" }}>{activeInd.label}</div>
                      <div style={{ fontSize: 11, color: T.muted, marginBottom: 12, alignSelf: "flex-start" }}>Hospital: Tapah (PRK350)</div>
                      <canvas id="gaugeCanvas" width={220} height={160} style={{ display: "block" }} />
                    </div>

                    {/* Bar chart — monthly trend */}
                    <div style={card({ padding: "16px" })}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 4 }}>{activeInd.label}</div>
                      <div style={{ fontSize: 11, color: T.muted, marginBottom: 10 }}>Tapah (PRK350) by Month</div>
                      <div style={{ position: "relative", height: 220 }}><canvas id="indBarChart" /></div>
                      <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 10, fontSize: 11, color: T.muted }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 10, background: activeInd.color, borderRadius: 2, display: "inline-block" }} />Completion (%)</span>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 10, background: "#6b7fa3", borderRadius: 2, display: "inline-block" }} />Target</span>
                      </div>
                    </div>
                  </div>

                  {/* Indicator detail row */}
                  <div style={card({ padding: "16px" })}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 12 }}>Indicator Detail</div>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                      <thead>
                        <tr>{["Indicator", "Value", "Target", "Gap", "Status"].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td style={{ ...tdStyle, fontWeight: 600 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <div style={{ width: 8, height: 8, borderRadius: "50%", background: activeInd.color }} />
                              {activeInd.label}
                            </div>
                          </td>
                          <td style={tdStyle}>{activeInd.value.toFixed(2)}%</td>
                          <td style={tdStyle}>{activeInd.target.toFixed(2)}%</td>
                          <td style={{ ...tdStyle, color: activeInd.value >= activeInd.target ? T.success : T.danger, fontWeight: 700 }}>
                            {activeInd.value >= activeInd.target ? "0.00%" : (activeInd.target - activeInd.value).toFixed(2) + "%"}
                          </td>
                          <td style={tdStyle}>
                            <Badge color={activeInd.value >= activeInd.target ? "green" : activeInd.value >= activeInd.target * 0.9 ? "warn" : "danger"} T={T}>
                              {activeInd.value >= activeInd.target ? "On Target" : activeInd.value >= activeInd.target * 0.9 ? "Near Target" : "Below Target"}
                            </Badge>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* ── PI ANALYSIS TAB ── */}
              {activeTab === "pi" && (
                <div style={card({ padding: "20px" })}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 16 }}>PI Analysis — {activeInd.label}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
                    {[
                      { label: "Current Value",     value: activeInd.value.toFixed(2) + "%", color: activeInd.color },
                      { label: "Target",            value: activeInd.target.toFixed(2) + "%", color: T.muted },
                      { label: "Gap to Target",     value: Math.max(0, activeInd.target - activeInd.value).toFixed(2) + "%", color: activeInd.value >= activeInd.target ? T.success : T.danger },
                      { label: "Scheduled",         value: String(activeInd.scheduled), color: T.accent },
                      { label: "Completed",         value: String(activeInd.completed), color: T.success },
                      { label: "Not Done",          value: String(activeInd.notDone),   color: activeInd.notDone > 0 ? T.danger : T.success },
                    ].map(stat => (
                      <div key={stat.label} style={card({ padding: "16px", textAlign: "center" })}>
                        <div style={{ fontSize: 10, color: T.muted, textTransform: "uppercase", marginBottom: 6 }}>{stat.label}</div>
                        <div style={{ fontSize: 26, fontWeight: 800, color: stat.color }}>{stat.value}</div>
                      </div>
                    ))}
                  </div>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <thead><tr>{["Month", "Scheduled", "Completed", "Not Done", "Compliance %", "Status"].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
                    <tbody>
                      {MONTHS.map((m, i) => {
                        const base = activeInd.value - (4 - i) * 0.5;
                        const v = Math.min(100, Math.max(60, parseFloat(base.toFixed(2))));
                        const done = Math.round((v / 100) * activeInd.scheduled);
                        const nd = activeInd.scheduled - done;
                        return (
                          <tr key={m}>
                            <td style={{ ...tdStyle, fontWeight: 600 }}>{m} {selectedYear}</td>
                            <td style={tdStyle}>{activeInd.scheduled}</td>
                            <td style={{ ...tdStyle, color: T.success, fontWeight: 600 }}>{done}</td>
                            <td style={{ ...tdStyle, color: nd > 0 ? T.danger : T.text }}>{nd}</td>
                            <td style={tdStyle}>{v.toFixed(2)}%</td>
                            <td style={tdStyle}><Badge color={v >= activeInd.target ? "green" : "warn"} T={T}>{v >= activeInd.target ? "On Target" : "Below"}</Badge></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* ── PARETO ANALYSIS TAB ── */}
              {activeTab === "pareto" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={card({ padding: "16px" })}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 4 }}>Pareto Analysis — Gap from Target</div>
                    <div style={{ fontSize: 11, color: T.muted, marginBottom: 14 }}>Indicators sorted by gap to target (largest gap first) — helps prioritize improvement areas</div>
                    <div style={{ position: "relative", height: 260 }}><canvas id="indParetoChart" /></div>
                  </div>
                  <div style={card({ padding: "16px" })}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                      <thead><tr>{["Rank", "Indicator", "Value", "Target", "Gap", "Priority"].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
                      <tbody>
                        {paretoData.map((ind, i) => (
                          <tr
                            key={ind.key}
                            style={{ background: selectedIndicator === ind.key ? ind.color + "08" : "transparent", cursor: "pointer" }}
                            onClick={() => { setSelectedIndicator(ind.key); setActiveTab("summary"); }}
                          >
                            <td style={{ ...tdStyle, fontWeight: 700, color: T.muted }}>#{i + 1}</td>
                            <td style={{ ...tdStyle, fontWeight: 600, color: ind.color }}>{ind.label}</td>
                            <td style={tdStyle}>{ind.value.toFixed(2)}%</td>
                            <td style={tdStyle}>{ind.target}%</td>
                            <td style={{ ...tdStyle, fontWeight: 700, color: ind.gap > 0 ? T.danger : T.success }}>{ind.gap > 0 ? ind.gap.toFixed(2) + "%" : "—"}</td>
                            <td style={tdStyle}>
                              <Badge color={ind.gap === 0 ? "green" : ind.gap < 5 ? "warn" : "danger"} T={T}>
                                {ind.gap === 0 ? "Achieved" : ind.gap < 5 ? "Monitor" : "Action Required"}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════
            VIEW 3 — SINGLE SERVICE DETAIL
        ════════════════════════════════════════════ */}
        {activeService !== "all" && activeService !== "indicator" && currentService && (
          <div style={{ flex: 1, overflow: "auto", padding: 20 }}>
            <div style={{ marginBottom: 14 }}>
              <button onClick={() => setActiveService("all")} style={{ background: T.card, border: `1px solid ${T.border}`, color: T.accent, padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                <BIcon name="bi-arrow-left" size={14} color={T.accent} /> Back to All Services Overview
              </button>
            </div>

            {/* Service header */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, padding: "16px", ...card({}), background: `linear-gradient(135deg,${currentService.accent}15,${currentService.accent}05)`, border: `1px solid ${currentService.accent}30` }}>
              <div style={{ width: 50, height: 50, borderRadius: 14, background: currentService.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800, color: "#fff" }}>{currentService.id.slice(0, 1)}</div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: currentService.accent }}>{currentService.id}</div>
                <div style={{ fontSize: 12, color: T.muted }}>{currentService.label}</div>
              </div>
            </div>

            {/* KPI cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 16 }}>
              <div style={{ background: `linear-gradient(135deg,${currentService.accent}15,${currentService.accent}05)`, borderRadius: 14, padding: "18px", textAlign: "center", border: `1px solid ${currentService.accent}25` }}>
                <div style={{ fontSize: 11, color: currentService.accent, textTransform: "uppercase", marginBottom: 8 }}>Overall Compliance</div>
                <div style={{ fontSize: 34, fontWeight: 800, color: currentService.accent }}>{currentService.completion.toFixed(2)}%</div>
              </div>
              <div style={card({ padding: "18px", textAlign: "center" })}>
                <div style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", marginBottom: 8 }}>Total Indicators</div>
                <div style={{ fontSize: 34, fontWeight: 800, color: T.text }}>{currentService.indicators.length}</div>
              </div>
              <div style={card({ padding: "18px", textAlign: "center" })}>
                <div style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", marginBottom: 8 }}>User Areas</div>
                <div style={{ fontSize: 34, fontWeight: 800, color: T.text }}>{currentService.totalUserArea}</div>
              </div>
              <div style={card({ padding: "18px", textAlign: "center" })}>
                <div style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", marginBottom: 8 }}>Status</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: currentService.completion >= 95 ? T.success : T.warn }}>
                  {currentService.completion >= 95 ? "✓ Compliant" : "⚠ Review"}
                </div>
              </div>
            </div>

            {/* Indicator cards */}
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${currentService.indicators.length},1fr)`, gap: 12, marginBottom: 16 }}>
              {currentService.indicators.map(ind => (
                <div key={ind.label} style={{ ...card({ padding: "14px", textAlign: "center", border: `1px solid ${ind.color}30` }), background: `linear-gradient(135deg,${ind.color}12,${ind.color}04)` }}>
                  <StatusDot value={ind.value} target={ind.target} />
                  <div style={{ fontSize: 22, fontWeight: 800, color: ind.color, marginTop: 6 }}>{ind.value}%</div>
                  <div style={{ fontSize: 12, color: T.muted, marginTop: 4 }}>{ind.label}</div>
                  <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>Target: {ind.target}%</div>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 16 }}>
              <div style={card({ padding: "16px" })}>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 12 }}>Compliance Trend (Jan–May {selectedYear})</div>
                <div style={{ position: "relative", height: 250 }}><canvas id="serviceLine" /></div>
              </div>
              <div style={card({ padding: "16px" })}>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 12 }}>Indicator Performance</div>
                <div style={{ position: "relative", height: 250 }}><canvas id="serviceBar" /></div>
              </div>
              <div style={{ ...card({ padding: "16px" }), display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 12 }}>Indicator Distribution</div>
                <div style={{ position: "relative", flex: 1, minHeight: 0 }}>
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <canvas id="servicePie" style={{ maxWidth: "100%", maxHeight: "100%" }} />
                  </div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px", marginTop: 8 }}>
                  {currentService.indicators.map(ind => (
                    <div key={ind.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: ind.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 9, color: T.muted }}>{ind.label}: {ind.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Indicator details table */}
            <div style={card({ padding: "16px" })}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 12 }}>Indicator Details</div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead><tr>{["Indicator", "Compliance %", "Target %", "Gap", "Status"].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
                <tbody>
                  {currentService.indicators.map(ind => {
                    const gap = Math.max(0, ind.target - ind.value);
                    return (
                      <tr key={ind.label}>
                        <td style={{ ...tdStyle, fontWeight: 600 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: ind.color }} />
                            {ind.label}
                          </div>
                        </td>
                        <td style={tdStyle}>{ind.value.toFixed(2)}%</td>
                        <td style={tdStyle}>{ind.target}%</td>
                        <td style={{ ...tdStyle, color: gap > 0 ? T.danger : T.success, fontWeight: 700 }}>{gap > 0 ? gap.toFixed(2) + "%" : "—"}</td>
                        <td style={tdStyle}><Badge color={ind.value >= ind.target ? "green" : "warn"} T={T}>{ind.value >= ind.target ? "On Target" : "Needs Review"}</Badge></td>
                      </tr>
                    );
                  })}
                  <tr style={{ background: T.tableHeaderBg }}>
                    <td style={{ ...tdStyle, fontWeight: 800 }}>Overall</td>
                    <td style={{ ...tdStyle, fontWeight: 800, color: currentService.accent }}>{currentService.completion.toFixed(2)}%</td>
                    <td style={tdStyle} /><td style={tdStyle} /><td style={tdStyle} />
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}