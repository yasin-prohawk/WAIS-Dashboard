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

type BerStatus =
  | "Acknowledged"
  | "Saved by JOHN"
  | "Clarification Sought by JOHN"
  | "Rejected by JOHN"
  | "Clarified by KPSB"
  | "Recommended"
  | "Approved";

const STATUS_ORDER: BerStatus[] = [
  "Acknowledged",
  "Saved by JOHN",
  "Clarification Sought by JOHN",
  "Rejected by JOHN",
  "Clarified by KPSB",
  "Recommended",
  "Approved",
];
const STATUS_COLORS: Record<BerStatus, string> = {
  "Acknowledged": "#06b6d4",
  "Saved by JOHN": "#a855f7",
  "Clarification Sought by JOHN": "#f59e0b",
  "Rejected by JOHN": "#ef4444",
  "Clarified by KPSB": "#0EA5E9",
  "Recommended": "#14b8a6",
  "Approved": "#22c55e",
};
// Statuses that count towards "Pending" — anything not yet approved or rejected (those have their own cards)
const PENDING_STATUSES: BerStatus[] = ["Acknowledged", "Saved by JOHN", "Clarification Sought by JOHN", "Clarified by KPSB", "Recommended"];

interface BERRecord {
  berNo: string;
  assetNo: string;
  assetName: string;
  requestDate: string;
  status: BerStatus;
  info: string;
}

interface BERService {
  id: string;
  label: string;
  accent: string;
  records: BERRecord[];
}

const BER_SERVICES: BERService[] = [
  {
    id: "FEMS",
    label: "Facility Engineering Maintenance",
    accent: "#0EA5E9",
    records: [
      { berNo: "BER-FEMS-0001", assetNo: "MEC010701", assetName: "Chiller Unit 1", requestDate: "2026-02-18", status: "Acknowledged", info: "Compressor failure — assessment pending" },
    ],
  },
  {
    id: "BEMS",
    label: "Biomedical Engineering Maintenance",
    accent: "#F59E0B",
    records: [
      { berNo: "BER-BEMS-0001", assetNo: "BIO010101", assetName: "Patient Monitor", requestDate: "2025-12-02", status: "Approved", info: "Approved for write-off" },
      { berNo: "BER-BEMS-0002", assetNo: "BIO010102", assetName: "Infusion Pump", requestDate: "2025-12-10", status: "Approved", info: "Approved for write-off" },
      { berNo: "BER-BEMS-0003", assetNo: "BIO020201", assetName: "ECG Machine", requestDate: "2026-01-05", status: "Approved", info: "Approved for write-off" },
      { berNo: "BER-BEMS-0004", assetNo: "BIO020202", assetName: "Defibrillator", requestDate: "2026-01-08", status: "Recommended", info: "Recommended by technical committee" },
      { berNo: "BER-BEMS-0005", assetNo: "BIO020203", assetName: "Ultrasound Machine", requestDate: "2026-01-20", status: "Clarified by KPSB", info: "Clarification received from KPSB" },
      { berNo: "BER-BEMS-0006", assetNo: "BIO030301", assetName: "Ventilator", requestDate: "2026-02-02", status: "Rejected by JOHN", info: "Rejected — repair still viable" },
      { berNo: "BER-BEMS-0007", assetNo: "BIO030302", assetName: "Anesthesia Machine", requestDate: "2026-02-10", status: "Clarification Sought by JOHN", info: "Awaiting clarification from JOHN" },
      { berNo: "BER-BEMS-0008", assetNo: "BIO030303", assetName: "Dialysis Machine", requestDate: "2026-02-14", status: "Saved by JOHN", info: "Saved for further review by JOHN" },
    ],
  },
];

const SERVICE_OPTIONS: BERService[] = BER_SERVICES;

function computeStats(records: BERRecord[]) {
  const totalApplied = records.length;
  const totalApproved = records.filter(r => r.status === "Approved").length;
  const totalRejected = records.filter(r => r.status === "Rejected by JOHN").length;
  const totalPending = records.filter(r => PENDING_STATUSES.includes(r.status)).length;
  const processStatus = STATUS_ORDER.map(label => ({
    label,
    count: records.filter(r => r.status === label).length,
    color: STATUS_COLORS[label],
  }));
  return { totalApplied, totalApproved, totalRejected, totalPending, processStatus };
}

function fmtDate(d: string) {
  const dt = new Date(d + "T00:00:00");
  if (isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

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

function mkBar(id: string, labels: string[], data: number[], colors: string[] | string, T: Theme, extra?: any) {
  const scales: any = {
    x: { grid: { color: T.gridColor }, ticks: { color: T.tickColor, font: { size: 11 } }, border: { color: "transparent" } },
    y: { grid: { color: T.gridColor }, ticks: { color: T.tickColor, font: { size: 12 } }, border: { color: "transparent" } }
  };
  if (extra?.indexAxis) { const tmp = scales.x; scales.x = scales.y; scales.y = tmp; }
  drawChart(id, "bar", { labels, datasets: [{ data, backgroundColor: colors, borderRadius: extra?.borderRadius || 8 }] }, { indexAxis: extra?.indexAxis, plugins: { legend: { display: false } }, scales });
}

/* ─── EXPORT ─────────────────────────────────────── */
function exportExcelBER(service: BERService, stats: ReturnType<typeof computeStats>) {
  if (!window.XLSX) return;
  const wb = window.XLSX.utils.book_new();
  const sheetData: any[][] = [
    ["BER Dashboard", "May 2026"],
    [],
    ["Service", service.label],
    ["Total BER Applied", stats.totalApplied],
    ["Total BER Approved", stats.totalApproved],
    ["Total BER Rejected", stats.totalRejected],
    ["Total Pending", stats.totalPending],
    [], ["Process Status"]
  ];
  stats.processStatus.forEach(s => sheetData.push([s.label, s.count]));
  sheetData.push([], ["Services", "BER No", "Asset No", "Asset Name", "BER Request Date", "BER Status", "BER Info"]);
  service.records.forEach(r => sheetData.push([service.id, r.berNo, r.assetNo, r.assetName, fmtDate(r.requestDate), r.status, r.info]));
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
  const m: Record<string, string> = { green: "rgba(16,185,129,.12)", warn: "rgba(217,119,6,.12)", danger: "rgba(220,38,38,.12)", blue: "rgba(26,107,181,.12)", purple: "rgba(139,92,246,.12)", cyan: "rgba(6,182,212,.12)", teal: "rgba(20,184,166,.12)", sky: "rgba(14,165,233,.12)" };
  const tc: Record<string, string> = { green: T.success, warn: T.warn, danger: T.danger, blue: T.accent, purple: "#8B5CF6", cyan: "#06b6d4", teal: "#14b8a6", sky: "#0EA5E9" };
  return <span style={{ background: m[color], color: tc[color], padding: "4px 12px", borderRadius: 24, fontSize: 11, fontWeight: 700 }}>{children}</span>;
}

function getContrastText(h: string) {
  const r = parseInt(h.slice(1, 3), 16), g = parseInt(h.slice(3, 5), 16), b = parseInt(h.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128 ? "#ffffff" : "#ffffff";
}

// Maps a BER status to a badge color key
function statusBadgeColor(status: BerStatus): string {
  switch (status) {
    case "Acknowledged": return "cyan";
    case "Saved by JOHN": return "purple";
    case "Clarification Sought by JOHN": return "warn";
    case "Rejected by JOHN": return "danger";
    case "Clarified by KPSB": return "sky";
    case "Recommended": return "teal";
    case "Approved": return "green";
    default: return "blue";
  }
}

/* ─── FILTER OPTIONS ─────────────────────────────── */
const MONTHS_LIST = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const QUARTERS_LIST = ["Q1","Q2","Q3","Q4"];
const YEARS_LIST = ["2026","2025","2024"];
const CATEGORY_OPTIONS: Record<string, { value: string; label: string }[]> = {
  moh: [{ value: "moh", label: "MOH" }],
  cc: [{ value: "cc-arp", label: "CC-ARP" }, { value: "cc-inventory", label: "CC-Inventory" }],
};

/* ─── MAIN ──────────────────────────────────────── */
export default function BERDashboard() {
  const { openSidebar } = useDashboardNav();
  const [themeName, setThemeName] = useState<"dark" | "light">("light");
  const [ownership, setOwnership] = useState("moh");
  const [category, setCategory] = useState(CATEGORY_OPTIONS.moh[0].value);
  const [year, setYear] = useState(YEARS_LIST[0]);
  const [frequency, setFrequency] = useState("monthly");
  const [period, setPeriod] = useState(MONTHS_LIST[0].toLowerCase());
  const [activeService, setActiveService] = useState<string>("FEMS");
  const T = THEMES[themeName];
  const scriptsReady = useRef(false);
  const baseChartsInited = useRef(false);
  const HDR = "#0f172a";
  const htc = getContrastText(HDR);

  const currentService = SERVICE_OPTIONS.find(s => s.id === activeService)!;
  const currentStats = computeStats(currentService.records);

  const handleOwnershipChange = (v: string) => {
    setOwnership(v);
    setCategory(CATEGORY_OPTIONS[v][0].value);
  };

  const handleFrequencyChange = (v: string) => {
    setFrequency(v);
    if (v === "monthly") setPeriod(MONTHS_LIST[0].toLowerCase());
    else if (v === "quarterly") setPeriod(QUARTERS_LIST[0].toLowerCase());
    else setPeriod("");
  };

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
  }, [themeName, activeService]);

  const initCharts = () => {
    if (!window.Chart) { setTimeout(initCharts, 200); return; }

    const c = document.getElementById("berProcessChart") as HTMLCanvasElement;
    if (c) { const ex = window.Chart.getChart(c); if (ex) ex.destroy(); }

    mkBar("berProcessChart",
      currentStats.processStatus.map(p => p.label),
      currentStats.processStatus.map(p => p.count),
      currentStats.processStatus.map(p => p.color),
      T, { borderRadius: 6, indexAxis: "y" }
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
        .glow-effect:hover { box-shadow: 0 8px 30px rgba(14,165,233,0.15) }
      `}</style>

      {/* TOP BAR */}
      <div className="no-print" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: HDR, borderBottom: `1px solid ${htc}15`, padding: "0 24px", height: 62, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button onClick={openSidebar} style={{ background: "transparent", border: "none", color: htc, cursor: "pointer", fontSize: 20, padding: "8px 11px", borderRadius: 10 }}><BIcon name="bi-list" size={22} color={htc} /></button>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 8, border: `1px solid ${htc}30`, color: htc, textDecoration: "none", fontSize: 13, fontWeight: 500 }}><BIcon name="bi-arrow-left" size={16} color={htc} /><span>Back</span></Link>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: htc }}>Beyond Economic Repair</div>
            <div style={{ fontSize: 11, color: htc, opacity: 0.6 }}>BER Performance Dashboard</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => exportExcelBER(currentService, currentStats)} title="Export" style={{ background: T.success + "12", border: `1px solid ${T.success}25`, color: T.success, width: 34, height: 34, borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><BIcon name="bi-download" size={15} color={T.success} /></button>
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

      {/* FILTER BAR — Ownership, Service, Asset Category, Date Frequency, Period */}
      <div className="no-print" style={{ display: "flex", alignItems: "center", background: HDR, borderBottom: `1px solid ${htc}15`, padding: "0 22px", height: 54, gap: 16, flexShrink: 0, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>Ownership</span>
          <select value={ownership} onChange={e => handleOwnershipChange(e.target.value)} style={{ background: "#fff", color: "#1a2636", padding: "6px 30px 6px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer" }}>
            <option value="moh">MOH</option>
            <option value="cc">CC</option>
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>Service</span>
          <select
            value={activeService}
            onChange={e => setActiveService(e.target.value)}
            style={{ background: "#fff", color: "#1a2636", padding: "6px 30px 6px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer", fontWeight: 600 }}
          >
            {SERVICE_OPTIONS.map(svc => (
              <option key={svc.id} value={svc.id}>{svc.id}</option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>Asset Category</span>
          <select value={category} onChange={e => setCategory(e.target.value)} style={{ background: "#fff", color: "#1a2636", padding: "6px 30px 6px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer" }}>
            {CATEGORY_OPTIONS[ownership].map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>Year</span>
          <select value={year} onChange={e => setYear(e.target.value)} style={{ background: "#fff", color: "#1a2636", padding: "6px 30px 6px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer" }}>
            {YEARS_LIST.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>Date Frequency</span>
          <select value={frequency} onChange={e => handleFrequencyChange(e.target.value)} style={{ background: "#fff", color: "#1a2636", padding: "6px 30px 6px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer" }}>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>

        {frequency === "monthly" && (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>Month</span>
            <select value={period} onChange={e => setPeriod(e.target.value)} style={{ background: "#fff", color: "#1a2636", padding: "6px 30px 6px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer" }}>
              {MONTHS_LIST.map(m => <option key={m} value={m.toLowerCase()}>{m}</option>)}
            </select>
          </div>
        )}

        {frequency === "quarterly" && (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>Quarter</span>
            <select value={period} onChange={e => setPeriod(e.target.value)} style={{ background: "#fff", color: "#1a2636", padding: "6px 30px 6px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer" }}>
              {QUARTERS_LIST.map(q => <option key={q} value={q.toLowerCase()}>{q}</option>)}
            </select>
          </div>
        )}

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
                <div style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.3px" }}>Total BER Applied</div>
                <div style={{ fontSize: 34, fontWeight: 800, color: T.text, marginTop: 4 }}>{currentStats.totalApplied}</div>
              </div>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${currentService.accent}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <BIcon name="bi-file-earmark-text" size={20} color={currentService.accent} />
              </div>
            </div>
          </div>
          <div style={{ ...card({ padding: "18px 20px" }), borderLeft: `4px solid #22c55e` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.3px" }}>Total BER Approved</div>
                <div style={{ fontSize: 34, fontWeight: 800, color: "#22c55e", marginTop: 4 }}>{currentStats.totalApproved}</div>
              </div>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "#22c55e15", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <BIcon name="bi-check-circle" size={20} color="#22c55e" />
              </div>
            </div>
          </div>
          <div style={{ ...card({ padding: "18px 20px" }), borderLeft: `4px solid #ef4444` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.3px" }}>Total BER Rejected</div>
                <div style={{ fontSize: 34, fontWeight: 800, color: "#ef4444", marginTop: 4 }}>{currentStats.totalRejected}</div>
              </div>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "#ef444415", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <BIcon name="bi-x-circle" size={20} color="#ef4444" />
              </div>
            </div>
          </div>
          <div style={{ ...card({ padding: "18px 20px" }), borderLeft: `4px solid #f59e0b` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.3px" }}>Total Pending</div>
                <div style={{ fontSize: 34, fontWeight: 800, color: "#f59e0b", marginTop: 4 }}>{currentStats.totalPending}</div>
                <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>All status not yet approved</div>
              </div>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "#f59e0b15", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <BIcon name="bi-hourglass-split" size={20} color="#f59e0b" />
              </div>
            </div>
          </div>
        </div>

        {/* ── PROCESS STATUS CHART ── */}
        <div style={{ marginBottom: 24 }}>
          <div style={card({ padding: "18px" })}>
            <div>
              <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Process Status</span>
              <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>Current asset distribution — {currentService.id}</div>
            </div>
            <div style={{ position: "relative", height: 320, marginTop: 8 }}><canvas id="berProcessChart" /></div>
          </div>
        </div>

        {/* ── BER APPLICATIONS TABLE ── */}
        <div style={card({ padding: "18px" })}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div>
              <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>BER Applications</span>
              <span style={{ fontSize: 10, color: T.muted, marginLeft: 12 }}>{currentService.id} — {currentStats.totalApplied} record{currentStats.totalApplied !== 1 ? "s" : ""}</span>
            </div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr>
                  {["Services", "BER No", "Asset No", "Asset Name", "BER Request Date", "BER Status", "BER Info"].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentService.records.map((r) => (
                  <tr key={r.berNo} style={{ borderBottom: `1px solid ${T.border}`, transition: "background 0.15s" }} onMouseEnter={(e) => e.currentTarget.style.background = T.tableHeaderBg} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                    <td style={tdStyle}>{currentService.id}</td>
                    <td style={{ ...tdStyle, fontWeight: 600, color: T.accent }}>{r.berNo}</td>
                    <td style={tdStyle}>{r.assetNo}</td>
                    <td style={tdStyle}>{r.assetName}</td>
                    <td style={tdStyle}>{fmtDate(r.requestDate)}</td>
                    <td style={tdStyle}>
                      <Badge color={statusBadgeColor(r.status)} T={T}>{r.status}</Badge>
                    </td>
                    <td style={tdStyle}>{r.info}</td>
                  </tr>
                ))}
                {currentService.records.length === 0 && (
                  <tr><td colSpan={7} style={{ ...tdStyle, textAlign: "center", color: T.muted, padding: "24px" }}>No BER applications recorded.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div style={{ fontSize: 10, color: T.muted, marginTop: 10, textAlign: "right" }}>
            <BIcon name="bi-info-circle" size={10} style={{ marginRight: 4 }} />
            Showing BER applications for {currentService.id}
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div style={{ marginTop: 20, fontSize: 11, color: T.muted, textAlign: "center", padding: "12px 0", borderTop: `1px solid ${T.border}` }}>
          <BIcon name="bi-database" size={12} style={{ marginRight: 6 }} />
          Data based on BER assessment · May 2026 cycle · ASIS QMS
          <span style={{ margin: "0 12px" }}>|</span>
          <BIcon name="bi-clock" size={12} style={{ marginRight: 4 }} />
          Last updated: 25 Feb 2026
        </div>
      </div>
    </div>
  );
}