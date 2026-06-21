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

/* ─── BER DATA ────────────────────────────── */
const MONTHS_6 = ["Dec '25", "Jan '26", "Feb '26", "Mar '26", "Apr '26", "May '26"];

const BER_SERVICES = [
  {
    id: "FEMS",
    accent: "#0EA5E9",
    totalAssets: 1,
    approvedCompleted: 0,
    completionRate: 0,
    trend: [0, 0, 0, 0, 0, 0],
    processStatus: [
      { label: "New", count: 1, color: "#22c55e" },
      { label: "In Progress", count: 0, color: "#f59e0b" },
      { label: "Approved", count: 0, color: "#0EA5E9" },
      { label: "Rejected", count: 0, color: "#ef4444" },
      { label: "Completed", count: 0, color: "#8B5CF6" },
    ],
    byAssetType: [
      { code: "MEC010701", description: "Medical Equipment", count: 1, percentage: 0, cost: 3000, maintenanceCost: 4733 },
    ],
    purchaseCost: 3000,
    maintenanceCost: 4733,
  },
  {
    id: "BEMS",
    accent: "#F59E0B",
    totalAssets: 8,
    approvedCompleted: 6,
    completionRate: 75,
    trend: [50, 60, 66.67, 70, 72, 75],
    processStatus: [
      { label: "New", count: 2, color: "#22c55e" },
      { label: "In Progress", count: 1, color: "#f59e0b" },
      { label: "Approved", count: 3, color: "#0EA5E9" },
      { label: "Rejected", count: 1, color: "#ef4444" },
      { label: "Completed", count: 1, color: "#8B5CF6" },
    ],
    byAssetType: [
      { code: "BIO010101", description: "Biomedical Device A", count: 4, percentage: 80, cost: 12000, maintenanceCost: 6800 },
      { code: "BIO020202", description: "Biomedical Device B", count: 2, percentage: 70, cost: 8500, maintenanceCost: 4200 },
      { code: "BIO030303", description: "Biomedical Device C", count: 2, percentage: 75, cost: 6200, maintenanceCost: 3200 },
    ],
    purchaseCost: 26700,
    maintenanceCost: 14200,
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
    gradientStart: "#0d1a27",
    gradientEnd: "#162233",
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
    gradientStart: "#e8edf5",
    gradientEnd: "#f0f4f8",
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

function mkLine(id: string, labels: string[], datasets: any[], T: Theme, extra?: any) {
  const yticks: any = { color: T.tickColor, font: { size: 11 } };
  if (extra?.scales?.y?.callback) yticks.callback = extra.scales.y.callback;
  const yscale: any = { grid: { color: T.gridColor }, border: { color: "transparent" }, ticks: yticks };
  const opts: any = {
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: T.gridColor }, ticks: { color: T.tickColor, font: { size: 11 } }, border: { color: "transparent" } },
      y: yscale
    }
  };
  if (extra?.plugins) opts.plugins = { ...opts.plugins, ...extra.plugins };
  drawChart(id, "line", { labels, datasets: datasets.map((d: any) => ({ ...d, borderWidth: d.borderWidth || 2, pointRadius: d.pointRadius || 3, tension: d.tension || 0.35, fill: false })) }, opts);
}

function mkBar(id: string, labels: string[], data: number[], colors: string[] | string, T: Theme, extra?: any) {
  const scales: any = {
    x: { grid: { color: T.gridColor }, ticks: { color: T.tickColor, font: { size: 12 } }, border: { color: "transparent" } },
    y: { grid: { color: T.gridColor }, ticks: { color: T.tickColor, font: { size: 12 } }, border: { color: "transparent" } }
  };
  if (extra?.indexAxis) { const tmp = scales.x; scales.x = scales.y; scales.y = tmp; }
  drawChart(id, "bar", { labels, datasets: [{ data, backgroundColor: colors, borderRadius: extra?.borderRadius || 8 }] }, { indexAxis: extra?.indexAxis, plugins: { legend: { display: false } }, scales });
}

/* ─── GAUGE ──────────────────────────────────────── */
function drawGauge(canvasId: string, value: number, T: Theme, accentColor: string) {
  const c = document.getElementById(canvasId) as HTMLCanvasElement | null;
  if (!c) return;
  const ctx = c.getContext("2d");
  if (!ctx) return;
  const W = c.width, H = c.height;
  ctx.clearRect(0, 0, W, H);
  const cx = W / 2, cy = H * 0.72, r = Math.min(W, H) * 0.38;

  // Track background
  ctx.beginPath();
  ctx.arc(cx, cy, r, Math.PI, 2 * Math.PI);
  ctx.strokeStyle = T.border;
  ctx.lineWidth = 14;
  ctx.lineCap = "round";
  ctx.stroke();

  // Value arc
  const gaugeColor = value >= 80 ? "#22c55e" : value >= 50 ? "#f59e0b" : value > 0 ? "#ef4444" : T.border;
  const pct = Math.min(value / 100, 1);
  ctx.beginPath();
  ctx.arc(cx, cy, r, Math.PI, Math.PI + pct * Math.PI);
  ctx.strokeStyle = gaugeColor;
  ctx.lineWidth = 14;
  ctx.lineCap = "round";
  ctx.stroke();

  // Value
  ctx.fillStyle = T.text;
  ctx.font = `bold 24px DM Sans, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(value.toFixed(1) + "%", cx, cy - 10);
  ctx.fillStyle = T.muted;
  ctx.font = `11px DM Sans, sans-serif`;
  ctx.fillText("Completion Rate", cx, cy + 26);
}

/* ─── EXPORT ─────────────────────────────────────── */
function exportExcelBER(service: typeof BER_SERVICES[0]) {
  if (!window.XLSX) return;
  const wb = window.XLSX.utils.book_new();
  const sheetData: any[][] = [
    ["BER Dashboard - Tapah (PRK350)", "May 2026"],
    [],
    ["Service", "Total Assets", "Approved & Completed", "Completion Rate %"]
  ];
  sheetData.push([service.label, service.totalAssets, service.approvedCompleted, service.completionRate.toFixed(2) + "%"]);
  sheetData.push([], ["Process Status"]);
  service.processStatus.forEach(s => sheetData.push([s.label, s.count]));
  sheetData.push([], ["Asset Type Breakdown"]);
  sheetData.push(["Code", "Description", "Count", "Percentage %", "Purchase Cost (RM)", "Maintenance Cost (RM)"]);
  service.byAssetType.forEach(a => {
    sheetData.push([a.code, a.description, a.count, a.percentage.toFixed(2) + "%", a.cost.toFixed(2), a.maintenanceCost.toFixed(2)]);
  });
  const ws = window.XLSX.utils.aoa_to_sheet(sheetData);
  window.XLSX.utils.book_append_sheet(wb, ws, "BER_Summary");
  window.XLSX.writeFile(wb, `BER_Dashboard_${service.id}_${new Date().toISOString().slice(0, 10)}.xlsx`);
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
export default function BERDashboard() {
  const { openSidebar } = useDashboardNav();
  const [themeName, setThemeName] = useState<"dark" | "light">("light");
  const [frequency, setFrequency] = useState("monthly");
  const [frequencyKey, setFrequencyKey] = useState("all");
  const [selectedYear, setSelectedYear] = useState("2026");
  const [activeService, setActiveService] = useState<string>("FEMS");
  const [highlightedService, setHighlightedService] = useState<string | null>(null);
  const T = THEMES[themeName];
  const scriptsReady = useRef(false);
  const baseChartsInited = useRef(false);
  const HDR = "#0f172a";
  const htc = getContrastText(HDR);

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const currentService = BER_SERVICES.find(s => s.id === activeService)!;

  const fmtRM = (n: number) => "RM " + n.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  useEffect(() => {
    if (scriptsReady.current) return;
    const load = (src: string, cb: () => void) => { const s = document.createElement("script"); s.src = src; s.onload = cb; document.head.appendChild(s); };
    load("https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js", () => {
      load("https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js", () => {
        scriptsReady.current = true;
        setTimeout(() => { initCharts(); baseChartsInited.current = true; }, 400);
      });
    });
  }, []);

  useEffect(() => {
    if (scriptsReady.current && baseChartsInited.current) setTimeout(initCharts, 200);
  }, [themeName, activeService, highlightedService]);

  const initCharts = () => {
    if (!window.Chart) { setTimeout(initCharts, 200); return; }

    ["berTrendChart", "berProcessChart", "berGaugeCanvas"].forEach(id => {
      const c = document.getElementById(id) as HTMLCanvasElement;
      if (c) { const ex = window.Chart.getChart(c); if (ex) ex.destroy(); }
    });

    const trendDatasets = BER_SERVICES.map(svc => {
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

    mkLine("berTrendChart", MONTHS_6, trendDatasets, T, {
      plugins: {
        legend: {
          display: true,
          position: "bottom",
          labels: {
            color: T.muted,
            font: { size: 10 },
            boxWidth: 12,
            padding: 10,
            usePointStyle: true,
            pointStyleWidth: 8,
          }
        }
      },
      scales: { y: { ticks: { callback: (v: number) => v.toFixed(2) + "%" } } }
    });

    mkBar("berProcessChart",
      currentService.processStatus.map(p => p.label),
      currentService.processStatus.map(p => p.count),
      currentService.processStatus.map(p => p.color),
      T, { borderRadius: 6 }
    );

    setTimeout(() => drawGauge("berGaugeCanvas", currentService.completionRate, T, currentService.accent), 60);
  };

  const card = (e?: React.CSSProperties): React.CSSProperties => ({ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, ...e });
  const cardAlt = (e?: React.CSSProperties): React.CSSProperties => ({ background: T.cardAlt, border: `1px solid ${T.border}`, borderRadius: 12, ...e });
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
        .glow-effect:hover { box-shadow: 0 8px 30px rgba(14,165,233,0.15) }
      `}</style>

      {/* TOP BAR */}
      <div className="no-print" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: HDR, borderBottom: `1px solid ${htc}15`, padding: "0 24px", height: 62, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button onClick={openSidebar} style={{ background: "transparent", border: "none", color: htc, cursor: "pointer", fontSize: 20, padding: "8px 11px", borderRadius: 10 }}><BIcon name="bi-list" size={22} color={htc} /></button>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 8, border: `1px solid ${htc}30`, color: htc, textDecoration: "none", fontSize: 13, fontWeight: 500 }}><BIcon name="bi-arrow-left" size={16} color={htc} /><span>Back</span></Link>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: htc }}>Beyond Economic Repair</div>
            <div style={{ fontSize: 11, color: htc, opacity: 0.6 }}>BER Performance Dashboard — Tapah (PRK350)</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => exportExcelBER(currentService)} title="Export" style={{ background: T.success + "12", border: `1px solid ${T.success}25`, color: T.success, width: 34, height: 34, borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><BIcon name="bi-download" size={15} color={T.success} /></button>
            <button onClick={printPage} title="Print" style={{ background: T.accent + "12", border: `1px solid ${T.accent}25`, color: T.accent, width: 34, height: 34, borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><BIcon name="bi-printer" size={15} color={T.accent} /></button>
          </div>
          <div style={{ width: 1, height: 28, background: htc, opacity: 0.12 }} />
          <button onClick={() => setThemeName(n => n === "dark" ? "light" : "dark")} style={{ background: "transparent", border: `1px solid ${htc}20`, color: htc, borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 14 }}><BIcon name={themeName === "dark" ? "bi-sun-fill" : "bi-moon-fill"} size={15} color={htc} /></button>
          <span style={{ fontSize: 13, color: htc, opacity: 0.7 }}>25 Feb 2026</span>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 12px 4px 4px", background: htc + "08", borderRadius: 24, border: `1px solid ${htc}20` }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg,#0EA5E9,#8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff" }}><BIcon name="bi-person-fill" size={13} color="#fff" /></div>
            <span style={{ fontSize: 13, fontWeight: 600, color: htc }}>Admin</span>
          </div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="no-print" style={{ display: "flex", alignItems: "center", background: HDR, borderBottom: `1px solid ${htc}15`, padding: "0 22px", height: 54, gap: 16, flexShrink: 0, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>Frequency</span>
          <select value={frequency} onChange={e => { setFrequency(e.target.value); setFrequencyKey("all"); }} style={{ background: "#fff", color: "#1a2636", padding: "6px 30px 6px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer" }}>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>Frequency Key</span>
          <select value={frequencyKey} onChange={e => setFrequencyKey(e.target.value)} style={{ background: "#fff", color: "#1a2636", padding: "6px 30px 6px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer" }}>
            <option value="all">All Months</option>
            {months.map(m => <option key={m} value={m.toLowerCase()}>{m}</option>)}
          </select>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>Year</span>
          <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} style={{ background: "#fff", color: "#1a2636", padding: "6px 30px 6px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer" }}>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>
        </div>
        <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.15)" }} />
        
        {/* Service Dropdown - No Icons */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>Service</span>
          <select 
            value={activeService} 
            onChange={e => { setActiveService(e.target.value); setHighlightedService(null); }}
            style={{ 
              background: "#fff", 
              color: "#1a2636", 
              padding: "6px 34px 6px 14px", 
              borderRadius: 8, 
              fontSize: 12, 
              cursor: "pointer",
              fontWeight: 600,
              border: "none",
              appearance: "none",
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%231a2636' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 10px center",
              backgroundSize: "10px",
            }}
          >
            {BER_SERVICES.map(svc => (
              <option key={svc.id} value={svc.id} style={{ fontWeight: 600 }}>
                {svc.id}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, paddingLeft: 16, borderLeft: "1px solid rgba(255,255,255,0.15)" }}>
          <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Reporting Period</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>May '26</span>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ flex: 1, overflow: "auto", padding: "20px 24px" }}>

        {/* ── HERO SUMMARY CARDS ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
          <div style={{ ...card({ padding: "18px 20px" }), borderLeft: `4px solid ${currentService.accent}`, background: `linear-gradient(135deg, ${currentService.accent}08, ${T.card})` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.3px" }}>Total Assets for BER</div>
                <div style={{ fontSize: 34, fontWeight: 800, color: T.text, marginTop: 4 }}>{currentService.totalAssets}</div>
              </div>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${currentService.accent}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <BIcon name="bi-box" size={20} color={currentService.accent} />
              </div>
            </div>
          </div>
          <div style={{ ...card({ padding: "18px 20px" }), borderLeft: `4px solid #F59E0B` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.3px" }}>BER Approved & Completed</div>
                <div style={{ fontSize: 34, fontWeight: 800, color: "#F59E0B", marginTop: 4 }}>{currentService.approvedCompleted}</div>
              </div>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "#F59E0B15", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <BIcon name="bi-check-circle" size={20} color="#F59E0B" />
              </div>
            </div>
          </div>
          <div style={{ ...card({ padding: "18px 20px" }), borderLeft: `4px solid ${currentService.completionRate >= 80 ? '#22c55e' : currentService.completionRate >= 50 ? '#f59e0b' : '#ef4444'}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.3px" }}>Completion Rate</div>
                <div style={{ fontSize: 34, fontWeight: 800, color: currentService.completionRate >= 80 ? '#22c55e' : currentService.completionRate >= 50 ? '#f59e0b' : '#ef4444', marginTop: 4 }}>{currentService.completionRate.toFixed(1)}%</div>
              </div>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${currentService.completionRate >= 80 ? '#22c55e' : currentService.completionRate >= 50 ? '#f59e0b' : '#ef4444'}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <BIcon name="bi-graph-up" size={20} color={currentService.completionRate >= 80 ? '#22c55e' : currentService.completionRate >= 50 ? '#f59e0b' : '#ef4444'} />
              </div>
            </div>
          </div>
          <div style={{ ...card({ padding: "18px 20px" }), borderLeft: `4px solid #8B5CF6` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.3px" }}>Pending Approval</div>
                <div style={{ fontSize: 34, fontWeight: 800, color: "#8B5CF6", marginTop: 4 }}>{currentService.totalAssets - currentService.approvedCompleted}</div>
              </div>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "#8B5CF615", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <BIcon name="bi-hourglass-split" size={20} color="#8B5CF6" />
              </div>
            </div>
          </div>
        </div>

        {/* ── SERVICE SELECTOR CARDS ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16, marginBottom: 24 }}>
          {BER_SERVICES.map(svc => {
            const isActive = activeService === svc.id;
            return (
              <div
                key={svc.id}
                onClick={() => setActiveService(svc.id)}
                style={{
                  ...card({ padding: "16px 20px", cursor: "pointer" }),
                  background: isActive ? `linear-gradient(135deg, ${svc.accent}15, ${T.card})` : T.card,
                  border: isActive ? `2px solid ${svc.accent}` : `1px solid ${T.border}`,
                  transition: "all 0.25s ease",
                  transform: isActive ? "scale(1.01)" : "scale(1)",
                  boxShadow: isActive ? `0 4px 20px ${svc.accent}25` : "none",
                }}
                onMouseEnter={() => setHighlightedService(svc.id)}
                onMouseLeave={() => setHighlightedService(null)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: `${svc.accent}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                    <span style={{ fontSize: 20, fontWeight: 800, color: svc.accent }}>{svc.id.charAt(0)}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: isActive ? svc.accent : T.text }}>{svc.id}</div>
                    <div style={{ fontSize: 11, color: T.muted }}>{svc.label}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: svc.accent }}>{svc.completionRate.toFixed(1)}%</div>
                    <div style={{ fontSize: 10, color: T.muted }}>{svc.approvedCompleted}/{svc.totalAssets} assets</div>
                  </div>
                  <div style={{ width: 6, height: 36, borderRadius: 3, background: isActive ? svc.accent : T.border }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* ── CHARTS ROW ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
          <div style={card({ padding: "18px" })}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div>
                <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>BER Approved & Completed Trend</span>
                <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>Previous 6 months performance</div>
              </div>
              {highlightedService && (
                <button onClick={() => setHighlightedService(null)} style={{ background: "transparent", border: "none", color: T.accent, cursor: "pointer", fontSize: 10, fontWeight: 600 }}>
                  Reset highlight
                </button>
              )}
            </div>
            <div style={{ position: "relative", height: 280 }}><canvas id="berTrendChart" /></div>
          </div>
          <div style={card({ padding: "18px" })}>
            <div>
              <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Process Status</span>
              <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>Current asset distribution</div>
            </div>
            <div style={{ position: "relative", height: 280, marginTop: 8 }}><canvas id="berProcessChart" /></div>
          </div>
          <div style={{ ...card({ padding: "18px" }), display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ textAlign: "center" }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Completion Gauge</span>
              <div style={{ fontSize: 10, color: T.muted }}>Overall BER completion rate</div>
            </div>
            <div style={{ position: "relative", width: "100%", height: 280, marginTop: 4 }}>
              <canvas id="berGaugeCanvas" width={240} height={220} style={{ width: "100%", height: "100%" }} />
            </div>
          </div>
        </div>

        {/* ── ASSET TYPE TABLE ── */}
        <div style={card({ padding: "18px" })}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div>
              <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Asset Type Breakdown</span>
              <span style={{ fontSize: 10, color: T.muted, marginLeft: 12 }}>Top asset types by BER approval</span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 6, padding: "4px 12px", fontSize: 11, color: T.muted, cursor: "pointer" }}>All</button>
              <button style={{ background: T.accent, border: "none", borderRadius: 6, padding: "4px 12px", fontSize: 11, color: "#fff", cursor: "pointer", fontWeight: 600 }}>Active</button>
            </div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr>
                  {["Asset Code", "Description", "Count", "Approved %", "Purchase Cost", "Maintenance Cost", "Status"].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentService.byAssetType.map((a) => (
                  <tr key={a.code} style={{ borderBottom: `1px solid ${T.border}`, transition: "background 0.15s" }} onMouseEnter={(e) => e.currentTarget.style.background = T.tableHeaderBg} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                    <td style={{ ...tdStyle, fontWeight: 600, color: T.accent }}>{a.code}</td>
                    <td style={tdStyle}>{a.description}</td>
                    <td style={{ ...tdStyle, fontWeight: 700 }}>{a.count}</td>
                    <td style={tdStyle}>
                      <span style={{ color: a.percentage >= 80 ? T.success : a.percentage >= 50 ? T.warn : T.danger, fontWeight: 600 }}>
                        {a.percentage.toFixed(1)}%
                      </span>
                    </td>
                    <td style={{ ...tdStyle, color: T.success, fontWeight: 600 }}>{fmtRM(a.cost)}</td>
                    <td style={{ ...tdStyle, color: T.warn, fontWeight: 600 }}>{fmtRM(a.maintenanceCost)}</td>
                    <td style={tdStyle}>
                      <Badge color={a.percentage >= 80 ? "green" : a.percentage >= 50 ? "warn" : "danger"} T={T}>
                        {a.percentage >= 80 ? "On Track" : a.percentage >= 50 ? "Monitor" : "Delayed"}
                      </Badge>
                    </td>
                  </tr>
                ))}
                <tr style={{ background: T.tableHeaderBg }}>
                  <td style={{ ...tdStyle, fontWeight: 800, color: T.text }}>TOTAL</td>
                  <td style={tdStyle}></td>
                  <td style={{ ...tdStyle, fontWeight: 800, color: T.text }}>{currentService.byAssetType.reduce((sum, a) => sum + a.count, 0)}</td>
                  <td style={tdStyle}></td>
                  <td style={{ ...tdStyle, fontWeight: 800, color: T.success }}>{fmtRM(currentService.byAssetType.reduce((sum, a) => sum + a.cost, 0))}</td>
                  <td style={{ ...tdStyle, fontWeight: 800, color: T.warn }}>{fmtRM(currentService.byAssetType.reduce((sum, a) => sum + a.maintenanceCost, 0))}</td>
                  <td style={tdStyle}></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div style={{ fontSize: 10, color: T.muted, marginTop: 10, textAlign: "right" }}>
            <BIcon name="bi-info-circle" size={10} style={{ marginRight: 4 }} />
            Showing active asset types with BER approval status
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div style={{ marginTop: 20, fontSize: 11, color: T.muted, textAlign: "center", padding: "12px 0", borderTop: `1px solid ${T.border}` }}>
          <BIcon name="bi-database" size={12} style={{ marginRight: 6 }} />
          Data based on BER assessment — Tapah (PRK350) · May 2026 cycle · ASIS QMS
          <span style={{ margin: "0 12px" }}>|</span>
          <BIcon name="bi-clock" size={12} style={{ marginRight: 4 }} />
          Last updated: 25 Feb 2026
        </div>
      </div>
    </div>
  );
}