"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useDashboardNav } from "@/components/dashboard-nav-provider";

declare global { interface Window { Chart: any; XLSX: any; } }

/* ─── HWMS DATA ─────────────────────────────────── */
const M6    = ["Sep '25","Oct '25","Nov '25","Dec '25","Jan '26","Feb '26"];
const MONTHS_12 = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MONTHS_10 = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct"];

const TOTAL_USER_AREA = 52;

/* ─── SR TYPES ───────────────────────────────────── */
const SR_TYPES = [
  "Additional Work (AW)",
  "Incident",
  "Non-Conformance",
  "User Request",
  "User Training",
];

const SR_TOTAL_HWMS = 2087;
const SR_BY_TYPE_HWMS = [
  { type: "Additional Work (AW)", count: 312, pct: 14.9, color: "#6F42C1" },
  { type: "Incident", count: 245, pct: 11.7, color: "#ef4444" },
  { type: "Non-Conformance", count: 262, pct: 12.6, color: "#f97316" },
  { type: "User Request", count: 1058, pct: 50.7, color: "#007BFF" },
  { type: "User Training", count: 210, pct: 10.1, color: "#22c55e" },
];

/* ─── MOCK SR DATA FOR TABLE ─────────────────────── */
const SR_MOCK_DATA = [
  { id: "SR-HTA-001", type: "Additional Work (AW)", date: "2026-01-05", status: "Completed", department: "ICU", description: "Additional waste bin installation" },
  { id: "SR-HTA-002", type: "Incident", date: "2026-01-12", status: "In Progress", department: "Emergency Dept", description: "Chemical spill containment" },
  { id: "SR-HTA-003", type: "Non-Conformance", date: "2026-01-18", status: "Open", department: "Laboratory", description: "Improper waste segregation" },
  { id: "SR-HTA-004", type: "User Request", date: "2026-01-25", status: "Completed", department: "General Ward", description: "Sharps container replacement" },
  { id: "SR-HTA-005", type: "User Training", date: "2026-02-02", status: "Completed", department: "Pharmacy", description: "Waste handling refresher" },
  { id: "SR-HTA-006", type: "Additional Work (AW)", date: "2026-02-08", status: "In Progress", department: "Operating Theatre", description: "Medical gas line check" },
  { id: "SR-HTA-007", type: "Incident", date: "2026-02-14", status: "Open", department: "Radiology", description: "Waste container damage" },
  { id: "SR-HTA-008", type: "Non-Conformance", date: "2026-02-20", status: "Completed", department: "Outpatient Clinic", description: "Late waste collection" },
  { id: "SR-HTA-009", type: "User Request", date: "2026-02-25", status: "In Progress", department: "Emergency Dept", description: "Biohazard bag supply" },
  { id: "SR-HTA-010", type: "User Training", date: "2026-03-01", status: "Scheduled", department: "ICU", description: "New staff orientation" },
  { id: "SR-HTA-011", type: "Additional Work (AW)", date: "2026-03-05", status: "Completed", department: "General Ward", description: "Waste audit preparation" },
  { id: "SR-HTA-012", type: "User Request", date: "2026-03-12", status: "Open", department: "Laboratory", description: "Autoclave maintenance request" },
  { id: "SR-HTA-013", type: "Incident", date: "2026-03-18", status: "In Progress", department: "Pharmacy", description: "Expired medication disposal" },
  { id: "SR-HTA-014", type: "Non-Conformance", date: "2026-03-22", status: "Open", department: "Operating Theatre", description: "PPE non-compliance" },
  { id: "SR-HTA-015", type: "User Training", date: "2026-03-28", status: "Scheduled", department: "Radiology", description: "Radiation safety training" },
  { id: "SR-HTA-016", type: "Additional Work (AW)", date: "2026-04-03", status: "Completed", department: "Outpatient Clinic", description: "Waste station setup" },
  { id: "SR-HTA-017", type: "User Request", date: "2026-04-10", status: "Completed", department: "Emergency Dept", description: "Container labeling system" },
  { id: "SR-HTA-018", type: "Incident", date: "2026-04-16", status: "Open", department: "ICU", description: "Infectious waste mixing" },
  { id: "SR-HTA-019", type: "Non-Conformance", date: "2026-04-22", status: "In Progress", department: "General Ward", description: "Storage temperature deviation" },
  { id: "SR-HTA-020", type: "User Training", date: "2026-04-28", status: "Scheduled", department: "Laboratory", description: "Hazard communication" },
];

const SR_NORMAL = 2061;
const SR_CRITICAL = 0;
const SR_OUTSTANDING = 16;
const SR_DONE = 10;
const SR_TOTAL = SR_NORMAL + SR_OUTSTANDING + SR_DONE;

/* ─── NCR TYPES ──────────────────────────────────── */
const NCR_TYPES = [
  "Documentation",
  "Process Deviation",
  "Safety Violation",
  "Equipment Failure",
  "Training Gap",
];

const NCR_TOTAL = 78;
const NCR_OPEN = 58;
const NCR_CLOSED = 20;
const NCR_CLOSURE_RATE = 25.6;
const NCR_BY_MONTH = [
  { month: "Sep '25", total: 35, open: 28, closed: 7, rate: "20.0%" },
  { month: "Oct '25", total: 42, open: 32, closed: 10, rate: "23.8%" },
  { month: "Nov '25", total: 28, open: 20, closed: 8, rate: "28.6%" },
  { month: "Dec '25", total: 51, open: 40, closed: 11, rate: "21.6%" },
  { month: "Jan '26", total: 45, open: 35, closed: 10, rate: "22.2%" },
  { month: "Feb '26", total: 78, open: 58, closed: 20, rate: "25.6%" },
];

const NCR_BY_TYPE_HWMS = [
  { type: "Documentation", count: 22, pct: 28.2, color: "#6F42C1" },
  { type: "Process Deviation", count: 18, pct: 23.1, color: "#f97316" },
  { type: "Safety Violation", count: 14, pct: 17.9, color: "#ef4444" },
  { type: "Equipment Failure", count: 16, pct: 20.5, color: "#007BFF" },
  { type: "Training Gap", count: 8, pct: 10.3, color: "#22c55e" },
];

const NCR_MOCK_DATA = [
  { id: "NCR-HTA-001", type: "Documentation", date: "2026-01-04", status: "Open", department: "ICU", description: "Missing waste log entries" },
  { id: "NCR-HTA-002", type: "Process Deviation", date: "2026-01-10", status: "Closed", department: "Laboratory", description: "Incorrect segregation procedure" },
  { id: "NCR-HTA-003", type: "Safety Violation", date: "2026-01-16", status: "Open", department: "Emergency Dept", description: "PPE not worn during handling" },
  { id: "NCR-HTA-004", type: "Equipment Failure", date: "2026-01-22", status: "Closed", department: "Operating Theatre", description: "Autoclave calibration overdue" },
  { id: "NCR-HTA-005", type: "Training Gap", date: "2026-01-28", status: "Open", department: "Pharmacy", description: "Staff not certified on handling" },
  { id: "NCR-HTA-006", type: "Documentation", date: "2026-02-03", status: "Open", department: "General Ward", description: "Incomplete manifest records" },
  { id: "NCR-HTA-007", type: "Process Deviation", date: "2026-02-09", status: "Closed", department: "Radiology", description: "Storage temperature deviation" },
  { id: "NCR-HTA-008", type: "Safety Violation", date: "2026-02-15", status: "Open", department: "Outpatient Clinic", description: "Sharps container overfilled" },
  { id: "NCR-HTA-009", type: "Equipment Failure", date: "2026-02-20", status: "Open", department: "ICU", description: "Incinerator temperature fault" },
  { id: "NCR-HTA-010", type: "Training Gap", date: "2026-02-25", status: "Closed", department: "Laboratory", description: "Refresher training overdue" },
];

const OVERALL_DEDUCTION = 0.03;
const DEDUCTION_BY_MONTH = [0.03, 0.03, 0.02, 0.02, 0.01, 0.02, 0.06, 0.03, 0.02, 0.02];

const HC_LABELS = ["% HC1","% HC2","% HC3","% HC4","% HC5"];
const HC_VALUES = [25.64, 35.90, 6.64, 31.86, 0.0];
const HC_COLORS = ["#007BFF","#6F42C1","#00CCCC","#17A2B8","#0DCAF0"];

const LICENSE_EXPIRY = [
  { license: "Environmental License", expiry: "15 Dec 2026", status: "Active", daysLeft: 232 },
  { license: "Waste Transport License", expiry: "30 Mar 2027", status: "Active", daysLeft: 337 },
  { license: "Treatment Facility Permit", expiry: "01 Aug 2026", status: "Active", daysLeft: 96 },
  { license: "Hazardous Waste Permit", expiry: "10 Jan 2027", status: "Active", daysLeft: 258 },
  { license: "Incinerator Operating License", expiry: "05 Jun 2026", status: "Warning", daysLeft: 39 },
];

const HTA_COLLECTION = { scheduled: 5340, collected: 5328, missed: 12, pct: 99.78 };

const WASTE_GEN_BY_CATEGORY = [
  { category: "Clinical Waste (Yellow)", jan: 0.085, feb: 0.082, mar: 0.088, apr: 0.079, may: 0.081, jun: 0.084, total: 0.499, color: "#FFB703" },
  { category: "Pharmaceutical Waste (Brown)", jan: 0.025, feb: 0.023, mar: 0.026, apr: 0.022, may: 0.024, jun: 0.025, total: 0.145, color: "#8B4513" },
  { category: "Chemical Waste", jan: 0.018, feb: 0.016, mar: 0.019, apr: 0.015, may: 0.017, jun: 0.018, total: 0.103, color: "#6F42C1" },
  { category: "General Waste (Black)", jan: 0.195, feb: 0.188, mar: 0.192, apr: 0.185, may: 0.190, jun: 0.187, total: 1.137, color: "#1a1a1a" },
  { category: "Sharps Waste", jan: 0.042, feb: 0.040, mar: 0.044, apr: 0.038, may: 0.041, jun: 0.043, total: 0.248, color: "#ef4444" },
  { category: "Infectious Waste", jan: 0.055, feb: 0.052, mar: 0.057, apr: 0.050, may: 0.054, jun: 0.056, total: 0.324, color: "#f97316" },
  { category: "Pathological Waste", jan: 0.012, feb: 0.011, mar: 0.013, apr: 0.010, may: 0.012, jun: 0.013, total: 0.071, color: "#dc2626" },
  { category: "Radioactive Waste", jan: 0.003, feb: 0.002, mar: 0.004, apr: 0.002, may: 0.003, jun: 0.003, total: 0.017, color: "#FFD700" },
];

/* Overall waste generation per month (sum across all categories) */
const WASTE_GEN_OVERALL_BY_MONTH = (() => {
  const keys: ("jan"|"feb"|"mar"|"apr"|"may"|"jun")[] = ["jan","feb","mar","apr","may","jun"];
  return keys.map(k => +WASTE_GEN_BY_CATEGORY.reduce((sum, c) => sum + (c as any)[k], 0).toFixed(3));
})();
const WASTE_GEN_OVERALL_TOTAL = +WASTE_GEN_BY_CATEGORY.reduce((a, b) => a + b.total, 0).toFixed(3);

/* ─── THEMES ────────────────────────────────────── */
const THEMES = {
  dark: {
    bg:"#0d1520", panel:"#111d2b", card:"#162233", border:"#1e3248",
    text:"#e0e7ff", muted:"#8a9cb8", accent:"#5a9fd4",
    success:"#22c55e", warn:"#f59e0b", danger:"#ef4444",
    gridColor:"rgba(255,255,255,0.07)",
    tickColor:"#6b8099",
    scrollThumb:"#2a3f55",
    inputBg:"#162233", selectBg:"#162233",
    tableHeaderBg:"rgba(90,159,212,0.08)",
  },
  light: {
    bg:"#f0f4f8", panel:"#ffffff", card:"#ffffff", border:"#dde3ed",
    text:"#1a2636", muted:"#6b7fa3", accent:"#1a6bb5",
    success:"#16a34a", warn:"#d97706", danger:"#dc2626",
    gridColor:"rgba(0,0,0,0.06)",
    tickColor:"#8a9cb8",
    scrollThumb:"#c5cfe0",
    inputBg:"#f8fafc", selectBg:"#f8fafc",
    tableHeaderBg:"rgba(26,107,181,0.06)",
  },
};
type Theme = typeof THEMES.dark;

const C = {
  primary1: "#6F42C1",
  primary2: "#007BFF",
  support1: "#00CCCC",
  support2: "#17A2B8",
  support3: "#0DCAF0",
};

/* ─── NAV PAGES ────────────────────────────────── */
const NAV_PAGES = [
  { key:"fem",       label:"Facility Engineering Maintenance", icon:"bi-tools",        href:"/facility-engineering" },
  { key:"bem",       label:"Biomedical Engineering Maintenance", icon:"bi-heart-pulse", href:"/biomedical-engineering" },
  { key:"cls",       label:"Cleansing Services",                icon:"bi-droplet",      href:"/cleansing-services" },
  { key:"lls",       label:"Linen and Laundry Services",        icon:"bi-box-seam",     href:"/linen-laundry" },
  { key:"hwm",       label:"Healthcare Waste Management",       icon:"bi-recycle",      href:"/waste-management" },
  { key:"complaint", label:"Complaint Module",                  icon:"bi-chat-dots",    href:"/complaints" },
  { key:"docs",      label:"Document Management System",        icon:"bi-folder2",      href:"/documents" },
  { key:"qa",        label:"Quality Assurance Program",         icon:"bi-patch-check",  href:"/quality-assurance" },
  { key:"ber",       label:"Beyond Economic Repair",            icon:"bi-gear",         href:"/beyond-economic-repair" },
  { key:"variation", label:"Variation Management",              icon:"bi-bar-chart",    href:"/variation-management" },
  { key:"deduction", label:"Deduction",                         icon:"bi-cash-stack",   href:"/deduction" },
  { key:"reports",   label:"Reports",                          icon:"bi-file-earmark-bar-graph", href:"/reports" },
  { key:"master",    label:"General Master",                    icon:"bi-person",       href:"/general-master" },
  { key:"users",     label:"User Management",                   icon:"bi-people",       href:"/user-management" },
  { key:"additional",label:"Additional Works",                  icon:"bi-plus-circle",  href:"/additional-works" },
  { key:"finance",   label:"Finance",                          icon:"bi-credit-card",  href:"/finance" },
  { key:"bis",       label:"BIS",                              icon:"bi-graph-up",     href:"/bis" },
];

/* ─── HWMS PERFORMANCE TABS ─────────────────────── */
const HWMS_TABS = [
  { key:"licenses",      label:"Licenses" },
  { key:"wastecoll",     label:"Waste Collection" },
  { key:"wastegen",      label:"Waste Generation" },
  { key:"testparam",     label:"Test Parameter" },
];

/* ─── MONTHS LIST ───────────────────────────────── */
const MONTHS_LIST = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const YEARS_LIST = ["2024", "2025", "2026", "2027"];

const TEST_PARAMS = [
  { parameter: "Temperature (°C)", standard: "850-1100", jan: 980, feb: 995, mar: 972, apr: 988, may: 1002, jun: 990, status: "Pass" },
  { parameter: "Residence Time (sec)", standard: "≥2.0", jan: 2.4, feb: 2.3, mar: 2.5, apr: 2.2, may: 2.4, jun: 2.3, status: "Pass" },
  { parameter: "CO Emission (mg/Nm³)", standard: "<50", jan: 32, feb: 28, mar: 35, apr: 30, may: 27, jun: 29, status: "Pass" },
  { parameter: "Particulate (mg/Nm³)", standard: "<10", jan: 6.2, feb: 5.8, mar: 6.5, apr: 5.9, may: 5.5, jun: 6.0, status: "Pass" },
  { parameter: "HCl Removal (%)", standard: ">99", jan: 99.5, feb: 99.6, mar: 99.4, apr: 99.6, may: 99.5, jun: 99.7, status: "Pass" },
  { parameter: "Heavy Metals (mg/Nm³)", standard: "<0.5", jan: 0.12, feb: 0.10, mar: 0.14, apr: 0.11, may: 0.09, jun: 0.10, status: "Pass" },
];

/* ─── CHART HELPERS ─────────────────────────────── */
function drawChart(id:string,type:string,data:any,options:any){
  const c=document.getElementById(id) as HTMLCanvasElement|null;
  if(!c)return;if(!window.Chart){setTimeout(()=>drawChart(id,type,data,options),150);return;}
  const ctx=c.getContext("2d");if(!ctx)return;const ex=window.Chart.getChart(c);if(ex)ex.destroy();
  try{new window.Chart(ctx,{type:type as any,data,options:{...options,animation:false,responsive:true,maintainAspectRatio:false}});}catch(e){}
}

function mkBar(id:string,labels:string[],data:number[],colors:string[]|string,T:Theme,extra?:any){
  const scales:any={x:{grid:{color:T.gridColor},ticks:{color:T.tickColor,font:{size:12}},border:{color:"transparent"}},y:{grid:{color:T.gridColor},ticks:{color:T.tickColor,font:{size:12}},border:{color:"transparent"}}};
  if(extra?.indexAxis){const tmp=scales.x;scales.x=scales.y;scales.y=tmp;}
  drawChart(id,"bar",{labels,datasets:[{data,backgroundColor:colors,borderRadius:8}]},{indexAxis:extra?.indexAxis,plugins:{legend:{display:false}},scales});
}

function mkLine(id:string,labels:string[],datasets:any[],T:Theme,extra?:any){
  const yticks:any={color:T.tickColor,font:{size:12}};
  if(extra?.scales?.y?.callback)yticks.callback=extra.scales.y.callback;
  const yscale:any={grid:{color:T.gridColor},border:{color:"transparent"},ticks:yticks};
  const opts:any={plugins:{legend:{display:false}},scales:{x:{grid:{color:T.gridColor},ticks:{color:T.tickColor,font:{size:12}},border:{color:"transparent"}},y:yscale}};
  if(extra?.plugins)opts.plugins={...opts.plugins,...extra.plugins};
  drawChart(id,"line",{labels,datasets:datasets.map((d:any)=>({...d,borderWidth:d.borderWidth||2.5,pointRadius:d.pointRadius||4,tension:0.3}))},opts);
}

function mkPie(id:string,labels:string[],data:number[],colors:string[],T:Theme,cutout="65%"){
  drawChart(id,"doughnut",{labels,datasets:[{data,backgroundColor:colors,borderWidth:0}]},{cutout,plugins:{legend:{display:false}}});
}

function mkStackedBar(id:string,labels:string[],datasets:any[],T:Theme){
  const c=document.getElementById(id) as HTMLCanvasElement|null;
  if(!c)return;if(!window.Chart){setTimeout(()=>mkStackedBar(id,labels,datasets,T),150);return;}
  const ctx=c.getContext("2d");if(!ctx)return;const ex=window.Chart.getChart(c);if(ex)ex.destroy();
  const TK={color:T.tickColor,font:{size:12}};
  try{new window.Chart(ctx,{type:"bar",data:{labels,datasets},options:{responsive:true,maintainAspectRatio:false,animation:false,plugins:{legend:{display:true,labels:{color:T.muted,font:{size:11},boxWidth:12,padding:12}}},scales:{x:{stacked:true,grid:{color:T.gridColor},ticks:TK,border:{color:"transparent"}},y:{stacked:true,grid:{color:T.gridColor},ticks:TK,border:{color:"transparent"}}}}});}catch(e){}
}

/* ─── EXPORT ─────────────────────────────────────── */
function exportExcelAll(){
  if(!window.XLSX)return;
  const wb=window.XLSX.utils.book_new();
  [{name:"Summary",data:[["HWMS Dashboard - HTA"],["Metric","Value"],["Total SR",SR_TOTAL],["Total NCR",NCR_TOTAL]]}].forEach(s=>{
    const ws=window.XLSX.utils.aoa_to_sheet(s.data);
    window.XLSX.utils.book_append_sheet(wb,ws,s.name);
  });
  window.XLSX.writeFile(wb,"HWMS_HTA_Dashboard_Export.xlsx");
}

function exportModalExcel(title:string, data:any[][]){
  if(!window.XLSX)return;
  const wb=window.XLSX.utils.book_new();
  const ws=window.XLSX.utils.aoa_to_sheet(data);
  window.XLSX.utils.book_append_sheet(wb,ws,"Data");
  window.XLSX.writeFile(wb,`HWMS_HTA_${title.replace(/[^a-zA-Z0-9]/g,'_')}_Export.xlsx`);
}

function printPage(){
  const s=document.createElement('style');
  s.id='ps';
  s.textContent='@page{size:A4 landscape;margin:10mm}@media print{body{-webkit-print-color-adjust:exact!important}.no-print{display:none!important}}';
  document.head.appendChild(s);
  window.print();
  setTimeout(()=>{const e=document.getElementById('ps');if(e)e.remove();},1000);
}

/* ─── DATE FILTER ROW ────────────────────────────── */
function DateFilterRow({ T, startDate, endDate, onStartChange, onEndChange }:{ T:Theme; startDate:string; endDate:string; onStartChange:(v:string)=>void; onEndChange:(v:string)=>void; }){
  const inputStyle:React.CSSProperties={
    background:"#fff",color:"#1a2636",padding:"5px 10px",borderRadius:8,fontSize:12,
    border:"1px solid rgba(255,255,255,0.15)",cursor:"pointer",height:32,
  };
  return(
    <div style={{display:"flex",alignItems:"center",gap:6}}>
      <span style={{fontSize:12,fontWeight:600,color:"#fff"}}>Start Date</span>
      <input type="date" value={startDate} onChange={e=>onStartChange(e.target.value)} style={inputStyle} />
      <span style={{fontSize:12,fontWeight:600,color:"rgba(255,255,255,0.6)"}}>—</span>
      <span style={{fontSize:12,fontWeight:600,color:"#fff"}}>End Date</span>
      <input type="date" value={endDate} onChange={e=>onEndChange(e.target.value)} style={inputStyle} />
    </div>
  );
}

/* ─── MODAL DATE FILTER ───────────────────────────── */
function ModalDateFilter({ T, startDate, endDate, onStartChange, onEndChange, selectedYear, selectedMonth, onYearChange, onMonthChange }:{ T:Theme; startDate:string; endDate:string; onStartChange:(v:string)=>void; onEndChange:(v:string)=>void; selectedYear:string; selectedMonth:string; onYearChange:(v:string)=>void; onMonthChange:(v:string)=>void; }){
  const selectStyle:React.CSSProperties={
    background:T.inputBg,color:T.text,padding:"6px 30px 6px 10px",borderRadius:8,fontSize:12,
    border:`1px solid ${T.border}`,cursor:"pointer",height:34,minWidth:110,
  };
  const inputStyle:React.CSSProperties={
    background:T.inputBg,color:T.text,padding:"6px 10px",borderRadius:8,fontSize:12,
    border:`1px solid ${T.border}`,cursor:"pointer",height:34,
  };
  return(
    <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 16px",background:T.bg,borderRadius:10,border:`1px solid ${T.border}`,marginBottom:16,flexWrap:"wrap"}}>
      <BIcon name="bi-calendar3" size={14} color={T.muted} />
      <span style={{fontSize:12,fontWeight:600,color:T.muted}}>Filters:</span>
      
      {/* Year Filter */}
      <span style={{fontSize:12,color:T.muted}}>Year</span>
      <select value={selectedYear} onChange={e=>onYearChange(e.target.value)} style={selectStyle}>
        <option value="">All Years</option>
        {YEARS_LIST.map(y=><option key={y} value={y}>{y}</option>)}
      </select>

      {/* Month Filter */}
      <span style={{fontSize:12,color:T.muted}}>Month</span>
      <select value={selectedMonth} onChange={e=>onMonthChange(e.target.value)} style={selectStyle}>
        <option value="">All Months</option>
        {MONTHS_LIST.map((m,i)=><option key={m} value={String(i+1).padStart(2,'0')}>{m}</option>)}
      </select>

      <div style={{width:1,height:24,background:T.border,margin:"0 4px"}} />
      
      <span style={{fontSize:12,color:T.muted}}>Start</span>
      <input type="date" value={startDate} onChange={e=>onStartChange(e.target.value)} style={inputStyle} />
      <span style={{fontSize:12,color:T.muted}}>—</span>
      <span style={{fontSize:12,color:T.muted}}>End</span>
      <input type="date" value={endDate} onChange={e=>onEndChange(e.target.value)} style={inputStyle} />
    </div>
  );
}

/* ─── COMPONENTS ────────────────────────────────── */
function BIcon({name,size=16,color}:{name:string;size?:number;color?:string}){
  return <i className={`bi ${name}`} style={{fontSize:size,color:color||"inherit",lineHeight:1}} />;
}

function Badge({children,color="green",T}:{children:string;color?:string;T:Theme}){
  const m:Record<string,string>={green:"rgba(16,185,129,.12)",warn:"rgba(217,119,6,.12)",danger:"rgba(220,38,38,.12)",blue:"rgba(26,107,181,.12)"};
  const tc:Record<string,string>={green:T.success,warn:T.warn,danger:T.danger,blue:T.accent};
  return <span style={{background:m[color],color:tc[color],padding:"4px 12px",borderRadius:24,fontSize:11,fontWeight:700}}>{children}</span>;
}

function ProgressBar({value,max,color,T}:{value:number;max:number;color:string;T:Theme}){
  return <div style={{height:6,background:T.border,borderRadius:4,overflow:"hidden"}}><div style={{height:"100%",width:`${Math.min(100,(value/max)*100)}%`,background:color,borderRadius:4}} /></div>;
}

function getContrastText(h:string){
  const r=parseInt(h.slice(1,3),16),g=parseInt(h.slice(3,5),16),b=parseInt(h.slice(5,7),16);
  return(r*299+g*587+b*114)/1000>128?"#ffffff":"#ffffff";
}

function Modal({title,onClose,children,T,onPrint,onExport,startDate,endDate,onStartChange,onEndChange,selectedYear,selectedMonth,onYearChange,onMonthChange,showSRFilter,srTypeFilter,onSRTypeChange,showNCRFilter,ncrTypeFilter,onNCRTypeChange}:{
  title:string;onClose:()=>void;children:React.ReactNode;T:Theme;onPrint?:()=>void;onExport?:()=>void;
  startDate:string;endDate:string;onStartChange:(v:string)=>void;onEndChange:(v:string)=>void;
  selectedYear:string;selectedMonth:string;onYearChange:(v:string)=>void;onMonthChange:(v:string)=>void;
  showSRFilter?:boolean;srTypeFilter?:string;onSRTypeChange?:(v:string)=>void;
  showNCRFilter?:boolean;ncrTypeFilter?:string;onNCRTypeChange?:(v:string)=>void;
}){
  const selectStyle:React.CSSProperties={
    background:T.inputBg,color:T.text,padding:"6px 30px 6px 10px",borderRadius:8,fontSize:12,
    border:`1px solid ${T.border}`,cursor:"pointer",height:34,minWidth:160,
  };
  return(
    <div onClick={e=>{if((e.target as HTMLElement).dataset.overlay)onClose();}} data-overlay="1" style={{position:"fixed",inset:0,background:"rgba(0,0,0,.45)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(4px)"}}>
      <div style={{background:T.panel,border:`1px solid ${T.border}`,borderRadius:20,padding:28,width:1100,maxHeight:"88vh",overflowY:"auto",boxShadow:"0 24px 60px rgba(0,0,0,.18)"}}>
        <style>{`::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:${T.scrollThumb};border-radius:99px}`}</style>
        <div className="no-print" style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <h2 style={{fontSize:20,fontWeight:700,color:T.text,margin:0}}>{title}</h2>
          <div style={{display:"flex",gap:8}}>
            {/* SR Type Filter for SR Modal */}
            {showSRFilter && onSRTypeChange && (
              <select value={srTypeFilter||""} onChange={e=>onSRTypeChange(e.target.value)} style={selectStyle}>
                <option value="">All SR Types</option>
                {SR_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
              </select>
            )}
            {/* NCR Type Filter for NCR Modal */}
            {showNCRFilter && onNCRTypeChange && (
              <select value={ncrTypeFilter||""} onChange={e=>onNCRTypeChange(e.target.value)} style={selectStyle}>
                <option value="">All NCR Types</option>
                {NCR_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
              </select>
            )}
            <button onClick={onExport} title="Export to Excel" style={{background:T.success+"12",border:`1px solid ${T.success}25`,color:T.success,width:36,height:36,borderRadius:8,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><BIcon name="bi-file-earmark-excel" size={16} color={T.success} /></button>
            <button onClick={onPrint} title="Print" style={{background:T.accent+"12",border:`1px solid ${T.accent}25`,color:T.accent,width:36,height:36,borderRadius:8,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><BIcon name="bi-printer" size={16} color={T.accent} /></button>
            <button onClick={onClose} title="Close" style={{background:T.card,border:`1px solid ${T.border}`,color:T.muted,width:36,height:36,borderRadius:8,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><BIcon name="bi-x-lg" size={16} color={T.muted} /></button>
          </div>
        </div>
        {/* Enhanced Date filter inside modal with Year/Month */}
        <ModalDateFilter T={T} startDate={startDate} endDate={endDate} onStartChange={onStartChange} onEndChange={onEndChange} selectedYear={selectedYear} selectedMonth={selectedMonth} onYearChange={onYearChange} onMonthChange={onMonthChange} />
        {children}
      </div>
    </div>
  );
}

function PlaceholderPage({page,T}:{page:typeof NAV_PAGES[0];T:Theme}){
  return(
    <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column" as const,gap:20,color:T.muted}}>
      <BIcon name={page.icon} size={56} color={T.muted} />
      <div style={{fontSize:24,fontWeight:700,color:T.text}}>{page.label}</div>
    </div>
  );
}

/* ─── MAIN ──────────────────────────────────────── */
export default function HWMSDashboard(){
  const { openSidebar } = useDashboardNav();
  const [activePage,setActivePage]=useState("hwm");
  const [activeTab,setActiveTab]=useState("licenses");
  const [modal,setModal]=useState<string|null>(null);
  const [themeName,setThemeName]=useState<"dark"|"light">("light");
  const [frequency,setFrequency]=useState("monthly");
  const [frequencyKey,setFrequencyKey]=useState("all");
  const [selectedYear,setSelectedYear]=useState("2026");

  // Main filter dates
  const [startDate,setStartDate]=useState("2026-01-01");
  const [endDate,setEndDate]=useState("2026-02-28");

  // Modal-specific dates (initialised same as main filter)
  const [modalStartDate,setModalStartDate]=useState("2026-01-01");
  const [modalEndDate,setModalEndDate]=useState("2026-02-28");

  // Modal Year/Month filters
  const [modalYear,setModalYear]=useState("2026");
  const [modalMonth,setModalMonth]=useState("");

  // SR Type filter for SR modal
  const [srTypeFilter,setSRTypeFilter]=useState("");

  // NCR Type filter for NCR modal
  const [ncrTypeFilter,setNCRTypeFilter]=useState("");

  const T=THEMES[themeName];
  const scriptsReady=useRef(false);
  const baseChartsInited=useRef(false);
  const currentPage=NAV_PAGES.find(p=>p.key===activePage)||NAV_PAGES[0];
  const HDR="#1a1a2e";
  const htc=getContrastText(HDR);

  useEffect(()=>{
    if(scriptsReady.current)return;
    const load=(src:string,cb:()=>void)=>{const s=document.createElement("script");s.src=src;s.onload=cb;document.head.appendChild(s);};
    load("https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js",()=>{
      load("https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js",()=>{
        scriptsReady.current=true;
        setTimeout(()=>{initTab(activeTab);baseChartsInited.current=true;},400);
      });
    });
  },[]);

  useEffect(()=>{
    if(scriptsReady.current&&baseChartsInited.current)setTimeout(()=>initTab(activeTab),200);
  },[themeName,activeTab]);

  const initTab=(tab:string)=>{
    if(!window.Chart){setTimeout(()=>initTab(tab),200);return;}
    ["licensesChart","wasteCollChart","wasteGenOverallChart","testParamChart","deductIndicatorPie"].forEach(id=>{
      const c=document.getElementById(id) as HTMLCanvasElement;
      if(c){const ex=window.Chart.getChart(c);if(ex)ex.destroy();}
    });

    if(tab==="licenses") mkBar("licensesChart",LICENSE_EXPIRY.map(l=>l.license.split(" ")[0]),LICENSE_EXPIRY.map(l=>l.daysLeft),LICENSE_EXPIRY.map(l=>l.status==="Warning"?"#f97316":"#22c55e"),T,{indexAxis:"y"});
    if(tab==="wastecoll") mkBar("wasteCollChart",["HTA"],[HTA_COLLECTION.pct],["#6F42C1"],T);
    if(tab==="wastegen") mkLine("wasteGenOverallChart",["Jan","Feb","Mar","Apr","May","Jun"],[{data:WASTE_GEN_OVERALL_BY_MONTH,borderColor:C.primary2,backgroundColor:C.primary2+"22",fill:true,pointRadius:5,borderWidth:3}],T,{scales:{y:{ticks:{callback:(v:number)=>v.toFixed(3)}}}});
    mkPie("deductIndicatorPie",HC_LABELS,HC_VALUES,HC_COLORS,T,"50%");
  };

  // Filter SR data by type
  const getFilteredSRData = () => {
    if (!srTypeFilter) return SR_MOCK_DATA;
    return SR_MOCK_DATA.filter(sr => sr.type === srTypeFilter);
  };

  // Filter SR type stats
  const getFilteredSRTypes = () => {
    if (!srTypeFilter) return SR_BY_TYPE_HWMS;
    return SR_BY_TYPE_HWMS.filter(sr => sr.type === srTypeFilter);
  };

  // Filter NCR data by type
  const getFilteredNCRData = () => {
    if (!ncrTypeFilter) return NCR_MOCK_DATA;
    return NCR_MOCK_DATA.filter(n => n.type === ncrTypeFilter);
  };

  // Filter NCR type stats
  const getFilteredNCRTypes = () => {
    if (!ncrTypeFilter) return NCR_BY_TYPE_HWMS;
    return NCR_BY_TYPE_HWMS.filter(n => n.type === ncrTypeFilter);
  };

  const openModal=(id:string)=>{
    // Sync modal dates with main filter dates when opening
    setModalStartDate(startDate);
    setModalEndDate(endDate);
    setModalYear(selectedYear);
    setModalMonth("");
    setSRTypeFilter("");
    setNCRTypeFilter("");
    setModal(id);
    setTimeout(()=>{
      ["m-srBar","m-srPie","m-ncrBar","m-ncrPie","m-lBar","m-deductLine"].forEach(i=>{
        const c=document.getElementById(i) as HTMLCanvasElement;
        if(c){const ex=window.Chart.getChart(c);if(ex)ex.destroy();}
      });
      if(id==="sr"){
        const filteredTypes = getFilteredSRTypes();
        mkBar("m-srBar",["Total","Normal","Outstanding","Done","Critical"],[SR_TOTAL,SR_NORMAL,SR_OUTSTANDING,SR_DONE,SR_CRITICAL],[T.accent,T.success,T.warn,T.success,T.danger],T);
        mkPie("m-srPie",filteredTypes.map(s=>s.type),filteredTypes.map(s=>s.count),filteredTypes.map(s=>s.color),T,"50%");
      }
      if(id==="ncr"){
        const filteredTypes = getFilteredNCRTypes();
        mkBar("m-ncrBar",M6,NCR_BY_MONTH.map(n=>n.total),Array(6).fill(T.warn),T);
        mkPie("m-ncrPie",filteredTypes.map(n=>n.type),filteredTypes.map(n=>n.count),filteredTypes.map(n=>n.color),T,"50%");
      }
      if(id==="deduct"){
        mkBar("m-lBar",HC_LABELS,HC_VALUES,HC_COLORS,T,{indexAxis:"y"});
        mkLine("m-deductLine",MONTHS_10,[{data:DEDUCTION_BY_MONTH,borderColor:C.primary1,backgroundColor:C.primary1+"22",fill:true,pointRadius:5,borderWidth:3}],T,{scales:{y:{ticks:{callback:(v:number)=>v.toFixed(2)+"%"}}}});
      }
    },200);
  };

  const handleSRTypeChange = (type:string) => {
    setSRTypeFilter(type);
    setTimeout(()=>{
      const filteredTypes = type ? SR_BY_TYPE_HWMS.filter(sr => sr.type === type) : SR_BY_TYPE_HWMS;
      const c=document.getElementById("m-srPie") as HTMLCanvasElement;
      if(c){const ex=window.Chart.getChart(c);if(ex)ex.destroy();}
      mkPie("m-srPie",filteredTypes.map(s=>s.type),filteredTypes.map(s=>s.count),filteredTypes.map(s=>s.color),T,"50%");
    },100);
  };

  const handleNCRTypeChange = (type:string) => {
    setNCRTypeFilter(type);
    setTimeout(()=>{
      const filteredTypes = type ? NCR_BY_TYPE_HWMS.filter(n => n.type === type) : NCR_BY_TYPE_HWMS;
      const c=document.getElementById("m-ncrPie") as HTMLCanvasElement;
      if(c){const ex=window.Chart.getChart(c);if(ex)ex.destroy();}
      mkPie("m-ncrPie",filteredTypes.map(n=>n.type),filteredTypes.map(n=>n.count),filteredTypes.map(n=>n.color),T,"50%");
    },100);
  };

  const card=(e?:React.CSSProperties):React.CSSProperties=>({background:T.card,border:`1px solid ${T.border}`,borderRadius:16,...e});
  const panel=(e?:React.CSSProperties):React.CSSProperties=>({background:T.panel,border:`1px solid ${T.border}`,borderRadius:12,...e});
  const thStyle:React.CSSProperties={background:T.tableHeaderBg,color:T.accent,padding:"10px 14px",textAlign:"left",fontWeight:700,fontSize:12,borderBottom:`2px solid ${T.border}`};
  const tdStyle:React.CSSProperties={padding:"10px 14px",borderBottom:`1px solid ${T.border}`,color:T.text};

  // Shared modal props
  const modalDateProps={
    startDate:modalStartDate,endDate:modalEndDate,
    onStartChange:setModalStartDate,onEndChange:setModalEndDate,
    selectedYear:modalYear,selectedMonth:modalMonth,
    onYearChange:setModalYear,onMonthChange:setModalMonth,
  };

  // Export functions for modals
  const exportSRModal = () => {
    const filtered = getFilteredSRData();
    const data = [["ID","Type","Date","Status","Department","Description"]];
    filtered.forEach(sr => data.push([sr.id,sr.type,sr.date,sr.status,sr.department,sr.description]));
    exportModalExcel("Service_Request",data);
  };

  const exportNCRModal = () => {
    const data = [["Month","Total NCR","Open","Closed","Closure Rate"]];
    NCR_BY_MONTH.forEach(n => data.push([n.month,String(n.total),String(n.open),String(n.closed),n.rate]));
    const filtered = getFilteredNCRData();
    data.push([]);
    data.push(["ID","Type","Date","Status","Department","Description"]);
    filtered.forEach(n => data.push([n.id,n.type,n.date,n.status,n.department,n.description]));
    exportModalExcel("NCR",data);
  };

  const exportDeductModal = () => {
    const data = [["Indicator","% Weight","Deduction (RM)"]];
    HC_LABELS.forEach((label,i) => data.push([label,HC_VALUES[i].toFixed(2)+"%","RM 0.00"]));
    exportModalExcel("Deduction",data);
  };

  return(
    <div className="dashboard-module-page" style={{fontFamily:"'DM Sans',system-ui,sans-serif",background:T.bg,color:T.text,fontSize:15,height:"100vh",display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');*,::-webkit-scrollbar{scrollbar-width:thin;scrollbar-color:${T.scrollThumb} transparent}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${T.scrollThumb};border-radius:99px}@page{size:A4 landscape;margin:10mm}@media print{body{-webkit-print-color-adjust:exact!important}.no-print{display:none!important}}input[type="date"]::-webkit-calendar-picker-indicator{opacity:0.6;cursor:pointer}`}</style>

      {/* TOP BAR */}
      <div className="no-print dashboard-top-bar" style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:HDR,borderBottom:`1px solid ${htc}15`,padding:"0 24px",height:62,flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:16}}>
          <button onClick={openSidebar} style={{background:"transparent",border:"none",color:htc,cursor:"pointer",fontSize:20,padding:"8px 11px",borderRadius:10}}><BIcon name="bi-list" size={22} color={htc} /></button>
          <Link href="/" style={{display:"flex",alignItems:"center",gap:6,padding:"6px 14px",borderRadius:8,border:`1px solid ${htc}30`,color:htc,textDecoration:"none",fontSize:13,fontWeight:500}}><BIcon name="bi-arrow-left" size={16} color={htc} /><span>Back</span></Link>
          <div><div style={{fontSize:17,fontWeight:700,color:htc}}>{currentPage.label} <span style={{fontSize:12,opacity:0.7}}>- HTA</span></div><div style={{fontSize:11,color:htc,opacity:0.6}}>HWMS Performance Dashboard</div></div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          {activePage==="hwm"&&<div style={{display:"flex",gap:8}}><button onClick={exportExcelAll} title="Export" style={{background:T.success+"12",border:`1px solid ${T.success}25`,color:T.success,width:34,height:34,borderRadius:8,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><BIcon name="bi-download" size={15} color={T.success} /></button><button onClick={printPage} title="Print" style={{background:T.accent+"12",border:`1px solid ${T.accent}25`,color:T.accent,width:34,height:34,borderRadius:8,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><BIcon name="bi-printer" size={15} color={T.accent} /></button></div>}
          <div style={{width:1,height:28,background:htc,opacity:0.12}} />
          <button onClick={()=>setThemeName(n=>n==="dark"?"light":"dark")} style={{background:"transparent",border:`1px solid ${htc}20`,color:htc,borderRadius:8,padding:"6px 12px",cursor:"pointer",fontSize:14}}><BIcon name={themeName==="dark"?"bi-sun-fill":"bi-moon-fill"} size={15} color={htc} /></button>
          <span style={{fontSize:13,color:htc,opacity:0.7}}>25 Feb 2026</span>
          <div style={{display:"flex",alignItems:"center",gap:10,padding:"4px 12px 4px 4px",background:htc+"08",borderRadius:24,border:`1px solid ${htc}20`}}><div style={{width:30,height:30,borderRadius:"50%",background:`linear-gradient(135deg,${C.primary1},${C.primary2})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"#fff"}}><BIcon name="bi-person-fill" size={13} color="#fff" /></div><span style={{fontSize:13,fontWeight:600,color:htc}}>Admin</span></div>
        </div>
      </div>

      {/* SIDEBAR */}
      {activePage!=="hwm"&&(<div style={{flex:1}}><PlaceholderPage page={currentPage} T={T} /></div>)}

      {activePage==="hwm"&&(<>
        {/* FILTER BAR */}
        <div className="no-print dashboard-filter-bar" style={{display:"flex",alignItems:"center",background:HDR,borderBottom:`1px solid ${htc}15`,padding:"0 22px",height:54,gap:16,flexShrink:0,flexWrap:"wrap"}}>
          <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:12,fontWeight:600,color:"#fff"}}>Frequency</span><select value={frequency} onChange={e=>{setFrequency(e.target.value);setFrequencyKey("all");}} style={{background:"#fff",color:"#1a2636",padding:"6px 30px 6px 12px",borderRadius:8,fontSize:12,cursor:"pointer"}}><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option><option value="yearly">Yearly</option></select></div>
          <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:12,fontWeight:600,color:"#fff"}}>Frequency Key</span><select value={frequencyKey} onChange={e=>setFrequencyKey(e.target.value)} style={{background:"#fff",color:"#1a2636",padding:"6px 30px 6px 12px",borderRadius:8,fontSize:12,cursor:"pointer"}}><option value="all">All Months</option>{MONTHS_LIST.map(m=><option key={m} value={m.toLowerCase()}>{m}</option>)}</select></div>
          <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:12,fontWeight:600,color:"#fff"}}>Year</span><select value={selectedYear} onChange={e=>setSelectedYear(e.target.value)} style={{background:"#fff",color:"#1a2636",padding:"6px 30px 6px 12px",borderRadius:8,fontSize:12,cursor:"pointer"}}><option value="2026">2026</option><option value="2025">2025</option><option value="2024">2024</option></select></div>
          {/* START / END DATE */}
          <div style={{width:1,height:28,background:"rgba(255,255,255,0.15)"}} />
          <DateFilterRow T={T} startDate={startDate} endDate={endDate} onStartChange={setStartDate} onEndChange={setEndDate} />
          <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:8,paddingLeft:16,borderLeft:"1px solid rgba(255,255,255,0.2)"}}><span style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.55)",textTransform:"uppercase"}}>Location</span><span style={{fontSize:14,fontWeight:700,color:"#fff"}}>HTA</span></div>
        </div>

        <div className="dashboard-main-columns" style={{flex:1,display:"flex",overflow:"hidden",padding:"16px",gap:16}}>
          {/* LEFT COLUMN */}
          <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",gap:14}}>
            {/* SR + NCR CARDS */}
            <div style={{display:"flex",gap:14,flexShrink:0}}>
              <div style={{...card({flex:1,padding:"18px 20px"}),position:"relative"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:14,paddingRight:40}}><span style={{fontSize:14,fontWeight:700,color:T.text}}>Service Request</span><Badge color="blue" T={T}>Feb'26</Badge></div>
                <div style={{display:"flex",gap:16,alignItems:"flex-start"}}><div style={{textAlign:"center"}}><div style={{fontSize:42,fontWeight:800,color:T.text}}>{SR_TOTAL.toLocaleString()}</div><div style={{fontSize:10,color:T.muted,marginTop:3}}>Total SR</div></div><div style={{flex:1,display:"flex",flexDirection:"column",gap:8,paddingTop:4}}>
                  <div><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:11,color:T.muted}}>Normal</span><span style={{fontSize:12,fontWeight:700,color:T.success}}>{SR_NORMAL}</span></div><ProgressBar value={SR_NORMAL} max={SR_TOTAL} color={T.success} T={T} /></div>
                  <div><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:11,color:T.muted}}>Outstanding</span><span style={{fontSize:12,fontWeight:700,color:T.warn}}>{SR_OUTSTANDING}</span></div><ProgressBar value={SR_OUTSTANDING} max={SR_TOTAL} color={T.warn} T={T} /></div>
                  <div><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:11,color:T.muted}}>Critical</span><span style={{fontSize:12,fontWeight:700,color:T.danger}}>{SR_CRITICAL}</span></div><ProgressBar value={SR_CRITICAL} max={SR_TOTAL} color={T.danger} T={T} /></div>
                </div></div>
                <button className="no-print" onClick={()=>openModal("sr")} style={{position:"absolute",top:16,right:18,background:T.panel,border:`1px solid ${T.border}`,color:T.muted,width:30,height:30,borderRadius:8,cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center"}}><BIcon name="bi-arrows-angle-expand" size={14} color={T.muted} /></button>
              </div>
              <div style={{...card({flex:1,padding:"18px 20px"}),position:"relative"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:14,paddingRight:40}}><span style={{fontSize:14,fontWeight:700,color:T.text}}>NCR</span><Badge color="warn" T={T}>Feb'26</Badge></div>
                <div style={{display:"flex",gap:16,alignItems:"flex-start"}}><div style={{textAlign:"center"}}><div style={{fontSize:42,fontWeight:800,color:T.text}}>{NCR_TOTAL}</div><div style={{fontSize:10,color:T.muted,marginTop:3}}>Total NCR</div></div><div style={{flex:1,display:"flex",flexDirection:"column",gap:8,paddingTop:4}}>
                  <div><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:11,color:T.muted}}>Open</span><span style={{fontSize:12,fontWeight:700,color:T.danger}}>{NCR_OPEN} ({((NCR_OPEN/NCR_TOTAL)*100).toFixed(1)}%)</span></div><ProgressBar value={NCR_OPEN} max={NCR_TOTAL} color={T.danger} T={T} /></div>
                  <div><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:11,color:T.muted}}>Closed</span><span style={{fontSize:12,fontWeight:700,color:T.success}}>{NCR_CLOSED} ({((NCR_CLOSED/NCR_TOTAL)*100).toFixed(1)}%)</span></div><ProgressBar value={NCR_CLOSED} max={NCR_TOTAL} color={T.success} T={T} /></div>
                  <div style={{paddingTop:4,borderTop:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between"}}><span style={{fontSize:11,color:T.muted}}>Closure Rate</span><span style={{fontSize:13,fontWeight:700,color:C.primary1}}>{NCR_CLOSURE_RATE}%</span></div>
                </div></div>
                <button className="no-print" onClick={()=>openModal("ncr")} style={{position:"absolute",top:16,right:18,background:T.panel,border:`1px solid ${T.border}`,color:T.muted,width:30,height:30,borderRadius:8,cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center"}}><BIcon name="bi-arrows-angle-expand" size={14} color={T.muted} /></button>
              </div>
            </div>

            {/* PERFORMANCE CARD */}
            <div style={{...card({overflow:"hidden",display:"flex",flexDirection:"column"}),flex:1,minHeight:0}}>
              <div style={{padding:"14px 18px",borderBottom:`1px solid ${T.border}`,flexShrink:0}}><span style={{fontSize:15,fontWeight:700,color:T.text}}>Overall HWMS Performance <span style={{fontSize:12,color:T.muted}}>— {HWMS_TABS.find(t=>t.key===activeTab)?.label}</span></span></div>
              <div style={{flex:1,display:"flex",overflow:"hidden",minHeight:0}}>
                <div className="no-print" style={{width:180,flexShrink:0,borderRight:`1px solid ${T.border}`,display:"flex",flexDirection:"column",padding:"10px 7px",gap:4,overflowY:"auto",background:themeName==="light"?"#f8fafc":T.panel}}>{HWMS_TABS.map(t=>{const a=activeTab===t.key;return(<button key={t.key} onClick={()=>setActiveTab(t.key)} style={{width:"100%",padding:"11px 12px",borderRadius:9,fontSize:11,fontWeight:a?600:400,border:`1px solid ${a?T.accent:T.border}`,background:a?T.accent+"12":"transparent",color:a?T.accent:T.muted,cursor:"pointer",textAlign:"left",borderLeft:`3px solid ${a?T.accent:"transparent"}`}}>{t.label}</button>);})}</div>
                <div style={{flex:1,overflow:"auto",padding:"14px"}}>
                  {/* LICENSES TAB */}
                  {activeTab==="licenses"&&(<div style={{display:"flex",flexDirection:"column",gap:12,height:"100%"}}>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10}}>
                      <div style={{...panel({padding:"12px",textAlign:"center"})}}><div style={{fontSize:9,color:T.muted,textTransform:"uppercase",marginBottom:4}}>Total Licenses</div><div style={{fontSize:22,fontWeight:800,color:T.accent}}>{LICENSE_EXPIRY.length}</div></div>
                      <div style={{...panel({padding:"12px",textAlign:"center"})}}><div style={{fontSize:9,color:T.muted,textTransform:"uppercase",marginBottom:4}}>Active</div><div style={{fontSize:22,fontWeight:800,color:T.success}}>{LICENSE_EXPIRY.filter(l=>l.status==="Active").length}</div></div>
                      <div style={{...panel({padding:"12px",textAlign:"center"})}}><div style={{fontSize:9,color:T.muted,textTransform:"uppercase",marginBottom:4}}>Warning</div><div style={{fontSize:22,fontWeight:800,color:T.warn}}>{LICENSE_EXPIRY.filter(l=>l.status==="Warning").length}</div></div>
                      <div style={{...panel({padding:"12px",textAlign:"center"})}}><div style={{fontSize:9,color:T.muted,textTransform:"uppercase",marginBottom:4}}>Expiring &lt;60d</div><div style={{fontSize:22,fontWeight:800,color:T.danger}}>1</div></div>
                      <div style={{...panel({padding:"12px",textAlign:"center"})}}><div style={{fontSize:9,color:T.muted,textTransform:"uppercase",marginBottom:4}}>Avg Days Left</div><div style={{fontSize:22,fontWeight:800,color:C.primary1}}>{Math.round(LICENSE_EXPIRY.reduce((a,b)=>a+b.daysLeft,0)/LICENSE_EXPIRY.length)}</div></div>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,flex:1}}>
                      <div style={{...panel({padding:"12px"})}}><div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:8}}>Days Until Expiry by License</div><div style={{position:"relative",height:280}}><canvas id="licensesChart" /></div></div>
                      <div style={{...panel({padding:"12px"})}}><div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:8}}>License Details</div><div style={{display:"flex",flexDirection:"column",gap:6}}>{LICENSE_EXPIRY.map((l,i)=>(<div key={i} style={{padding:"12px",background:T.card,borderRadius:10,border:`1px solid ${T.border}`}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}><span style={{fontSize:13,fontWeight:600,color:T.text}}>{l.license}</span><Badge color={l.status==="Warning"?"warn":"green"} T={T}>{l.status}</Badge></div><div style={{display:"flex",gap:16,fontSize:11,color:T.muted}}><span>Expires: {l.expiry}</span><span style={{color:l.daysLeft<60?T.danger:T.success,fontWeight:600}}>{l.daysLeft} days left</span></div></div>))}</div></div>
                    </div>
                  </div>)}

                  {/* WASTE COLLECTION TAB */}
                  {activeTab==="wastecoll"&&(<div style={{display:"flex",flexDirection:"column",gap:12,height:"100%"}}>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
                      <div style={{...panel({padding:"12px",textAlign:"center"})}}><div style={{fontSize:9,color:T.muted,textTransform:"uppercase",marginBottom:4}}>Scheduled</div><div style={{fontSize:22,fontWeight:800,color:T.accent}}>{HTA_COLLECTION.scheduled.toLocaleString()}</div></div>
                      <div style={{...panel({padding:"12px",textAlign:"center"})}}><div style={{fontSize:9,color:T.muted,textTransform:"uppercase",marginBottom:4}}>Collected</div><div style={{fontSize:22,fontWeight:800,color:T.success}}>{HTA_COLLECTION.collected.toLocaleString()}</div></div>
                      <div style={{...panel({padding:"12px",textAlign:"center"})}}><div style={{fontSize:9,color:T.muted,textTransform:"uppercase",marginBottom:4}}>Missed</div><div style={{fontSize:22,fontWeight:800,color:T.danger}}>{HTA_COLLECTION.missed}</div></div>
                      <div style={{...panel({padding:"12px",textAlign:"center"})}}><div style={{fontSize:9,color:T.muted,textTransform:"uppercase",marginBottom:4}}>Collection %</div><div style={{fontSize:22,fontWeight:800,color:C.primary1}}>{HTA_COLLECTION.pct}%</div></div>
                    </div>
                    <div style={{...panel({padding:"12px",flex:1})}}><div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:8}}>Collection Performance - HTA</div><div style={{position:"relative",height:280}}><canvas id="wasteCollChart" /></div></div>
                  </div>)}

                  {/* WASTE GENERATION TAB — Overall only */}
                  {activeTab==="wastegen"&&(<div style={{display:"flex",flexDirection:"column",gap:12,height:"100%"}}>
                    <div style={{fontSize:12,fontWeight:700,color:T.text}}>Waste Generation Data - HTA (Overall)</div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
                      <div style={{...panel({padding:"12px",textAlign:"center"})}}><div style={{fontSize:9,color:T.muted,textTransform:"uppercase",marginBottom:4}}>Total (juta Kg)</div><div style={{fontSize:18,fontWeight:800,color:C.primary2}}>{WASTE_GEN_OVERALL_TOTAL.toFixed(3)}</div></div>
                      <div style={{...panel({padding:"12px",textAlign:"center"})}}><div style={{fontSize:9,color:T.muted,textTransform:"uppercase",marginBottom:4}}>General Waste</div><div style={{fontSize:18,fontWeight:800,color:"#1a1a1a"}}>{WASTE_GEN_BY_CATEGORY[3].total.toFixed(3)}</div></div>
                      <div style={{...panel({padding:"12px",textAlign:"center"})}}><div style={{fontSize:9,color:T.muted,textTransform:"uppercase",marginBottom:4}}>Clinical Waste</div><div style={{fontSize:18,fontWeight:800,color:"#FFB703"}}>{WASTE_GEN_BY_CATEGORY[0].total.toFixed(3)}</div></div>
                      <div style={{...panel({padding:"12px",textAlign:"center"})}}><div style={{fontSize:9,color:T.muted,textTransform:"uppercase",marginBottom:4}}>Infectious Waste</div><div style={{fontSize:18,fontWeight:800,color:"#f97316"}}>{WASTE_GEN_BY_CATEGORY[5].total.toFixed(3)}</div></div>
                    </div>
                    <div style={{...panel({padding:"12px",flex:1})}}><div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:8}}>Overall Waste Generation (Jan–Jun)</div><div style={{position:"relative",height:280}}><canvas id="wasteGenOverallChart" /></div></div>
                  </div>)}

                  {/* TEST PARAMETER TAB — Latest Reading chart removed, details table only */}
                  {activeTab==="testparam"&&(<div style={{display:"flex",flexDirection:"column",gap:12,height:"100%"}}>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
                      <div style={{...panel({padding:"12px",textAlign:"center"})}}><div style={{fontSize:9,color:T.muted,textTransform:"uppercase",marginBottom:4}}>Total Parameters</div><div style={{fontSize:22,fontWeight:800,color:T.accent}}>{TEST_PARAMS.length}</div></div>
                      <div style={{...panel({padding:"12px",textAlign:"center"})}}><div style={{fontSize:9,color:T.muted,textTransform:"uppercase",marginBottom:4}}>Pass Rate</div><div style={{fontSize:22,fontWeight:800,color:T.success}}>100%</div></div>
                      <div style={{...panel({padding:"12px",textAlign:"center"})}}><div style={{fontSize:9,color:T.muted,textTransform:"uppercase",marginBottom:4}}>Avg CO Emission</div><div style={{fontSize:22,fontWeight:800,color:C.primary2}}>30.2 mg/Nm³</div></div>
                    </div>
                    <div style={{...panel({padding:"12px",flex:1})}}><div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:8}}>Parameter Details</div><table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}><thead><tr>{["Parameter","Std","Latest","Status"].map(h=><th key={h} style={thStyle}>{h}</th>)}</tr></thead><tbody>{TEST_PARAMS.map((p,i)=>(<tr key={i}><td style={tdStyle}>{p.parameter.split(" (")[0]}</td><td style={tdStyle}>{p.standard}</td><td style={tdStyle}>{String(p.jun)}</td><td style={tdStyle}><Badge color="green" T={T}>{p.status}</Badge></td></tr>))}</tbody></table></div>
                  </div>)}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN — Deduction by Indicator only (Finance removed) */}
          <div style={{width:300,flexShrink:0,display:"flex",flexDirection:"column",gap:14,overflow:"hidden"}}>

            {/* DEDUCTION BY INDICATOR — fills the whole right column now */}
            <div style={{...card({display:"flex",flexDirection:"column",overflow:"hidden"}),flex:1,position:"relative",minHeight:0}}>
              <div style={{padding:"14px 16px",borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",flexShrink:0}}>
                <div>
                  <div style={{fontSize:14,fontWeight:700,color:T.text}}>Deduction by Indicator</div>
                  <div style={{fontSize:10,color:T.muted}}>Jan'26 to Jan'26</div>
                </div>
                <button className="no-print" onClick={()=>openModal("deduct")} style={{background:T.panel,border:`1px solid ${T.border}`,color:T.muted,width:28,height:28,borderRadius:7,cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center"}}><BIcon name="bi-arrows-angle-expand" size={13} color={T.muted} /></button>
              </div>
              {/* Summary row */}
              <div style={{padding:"10px 14px",borderBottom:`1px solid ${T.border}`,display:"flex",gap:16,flexShrink:0}}>
                <div style={{textAlign:"center",flex:1}}><div style={{fontSize:10,color:T.muted}}>% Deduction</div><div style={{fontSize:18,fontWeight:800,color:C.primary1}}>{OVERALL_DEDUCTION}%</div></div>
                <div style={{width:1,background:T.border}} />
                <div style={{textAlign:"center",flex:1}}><div style={{fontSize:10,color:T.muted}}>Total</div><div style={{fontSize:18,fontWeight:800,color:T.success}}>RM 0.00</div></div>
              </div>
              {/* Pie chart — now takes remaining space with no HC label rows below */}
              <div style={{flex:1,padding:"12px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:0}}>
                <div style={{position:"relative",width:"100%",flex:1,minHeight:0}}>
                  <canvas id="deductIndicatorPie" style={{position:"absolute",inset:0,width:"100%",height:"100%"}} />
                </div>
                {/* Compact legend — dot + label only, no rows */}
                <div style={{display:"flex",flexWrap:"wrap",gap:"6px 14px",justifyContent:"center",paddingTop:10,flexShrink:0}}>
                  {HC_LABELS.map((l,i)=>(
                    <div key={l} style={{display:"flex",alignItems:"center",gap:5}}>
                      <div style={{width:8,height:8,borderRadius:"50%",background:HC_COLORS[i],flexShrink:0}} />
                      <span style={{fontSize:10,color:T.muted,fontWeight:600}}>{l}</span>
                      <span style={{fontSize:10,color:T.text,fontWeight:700}}>{HC_VALUES[i]}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MODALS */}
        {modal==="sr"&&(<Modal title="Service Request — HTA" onClose={()=>setModal(null)} T={T} onPrint={printPage} onExport={exportSRModal} {...modalDateProps} showSRFilter={true} srTypeFilter={srTypeFilter} onSRTypeChange={handleSRTypeChange}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
            {[{v:String(SR_TOTAL),l:"Total SR",c:T.accent},{v:String(SR_NORMAL),l:"Normal",c:T.success},{v:String(SR_CRITICAL),l:"Critical",c:T.danger},{v:String(SR_OUTSTANDING),l:"Outstanding",c:T.warn},{v:String(SR_DONE),l:"Done",c:T.success},{v:((SR_DONE/SR_TOTAL)*100).toFixed(1)+"%",l:"Completion",c:C.primary1}].map((s,i)=>(<div key={i} style={{background:T.card,borderRadius:12,padding:"14px",textAlign:"center",border:`1px solid ${T.border}`}}><div style={{fontSize:26,fontWeight:800,color:s.c}}>{s.v}</div><div style={{fontSize:12,color:T.muted,marginTop:4}}>{s.l}</div></div>))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <div><div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:12}}>SR Status Breakdown</div><div style={{position:"relative",height:220}}><canvas id="m-srBar" /></div></div>
            <div><div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:12}}>SR by Type of Request</div><div style={{display:"flex",alignItems:"center",gap:16}}><div style={{position:"relative",width:160,height:160}}><canvas id="m-srPie" /></div><div style={{flex:1}}>{SR_BY_TYPE_HWMS.map((it,i)=>(<div key={it.type} style={{marginBottom:8}}><div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:7,height:7,borderRadius:"50%",background:it.color}} /><span style={{fontSize:10,color:T.muted}}>{it.type}</span></div><div style={{fontSize:14,fontWeight:700,color:T.text}}>{it.count.toLocaleString()} <span style={{fontSize:9,color:T.muted}}>({it.pct}%)</span></div></div>))}</div></div></div>
          </div>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13,marginTop:18}}><thead><tr>{["ID","Type","Date","Status","Department","Description"].map(h=><th key={h} style={thStyle}>{h}</th>)}</tr></thead><tbody>{getFilteredSRData().map((sr,i)=><tr key={i}>{[sr.id,sr.type,sr.date,<Badge key="status" color={sr.status==="Completed"?"green":sr.status==="In Progress"?"blue":sr.status==="Open"?"warn":"danger"} T={T}>{sr.status}</Badge>,sr.department,sr.description].map((cell,j)=><td key={j} style={tdStyle}>{cell}</td>)}</tr>)}</tbody></table>
        </Modal>)}

        {modal==="ncr"&&(<Modal title="NCR — HTA" onClose={()=>setModal(null)} T={T} onPrint={printPage} onExport={exportNCRModal} {...modalDateProps} showNCRFilter={true} ncrTypeFilter={ncrTypeFilter} onNCRTypeChange={handleNCRTypeChange}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
            {[{v:String(NCR_TOTAL),l:"Total NCR",c:T.warn},{v:String(NCR_OPEN),l:"Open",c:T.danger},{v:String(NCR_CLOSED),l:"Closed",c:T.success},{v:NCR_CLOSURE_RATE+"%",l:"Closure Rate",c:C.primary1}].map((s,i)=>(<div key={i} style={{background:T.card,borderRadius:12,padding:"14px",textAlign:"center",border:`1px solid ${T.border}`}}><div style={{fontSize:26,fontWeight:800,color:s.c}}>{s.v}</div><div style={{fontSize:12,color:T.muted,marginTop:4}}>{s.l}</div></div>))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <div><div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:12}}>NCR Trend — Previous 6 Months</div><div style={{position:"relative",height:220}}><canvas id="m-ncrBar" /></div></div>
            <div><div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:12}}>NCR by Type</div><div style={{display:"flex",alignItems:"center",gap:16}}><div style={{position:"relative",width:160,height:160}}><canvas id="m-ncrPie" /></div><div style={{flex:1}}>{NCR_BY_TYPE_HWMS.map((it,i)=>(<div key={it.type} style={{marginBottom:8}}><div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:7,height:7,borderRadius:"50%",background:it.color}} /><span style={{fontSize:10,color:T.muted}}>{it.type}</span></div><div style={{fontSize:14,fontWeight:700,color:T.text}}>{it.count.toLocaleString()} <span style={{fontSize:9,color:T.muted}}>({it.pct}%)</span></div></div>))}</div></div></div>
          </div>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13,marginTop:18}}><thead><tr>{["ID","Type","Date","Status","Department","Description"].map(h=><th key={h} style={thStyle}>{h}</th>)}</tr></thead><tbody>{getFilteredNCRData().map((n,i)=><tr key={i}>{[n.id,n.type,n.date,<Badge key="status" color={n.status==="Closed"?"green":"danger"} T={T}>{n.status}</Badge>,n.department,n.description].map((cell,j)=><td key={j} style={tdStyle}>{cell}</td>)}</tr>)}</tbody></table>
        </Modal>)}

        {modal==="deduct"&&(<Modal title="Deduction by Indicator — HTA" onClose={()=>setModal(null)} T={T} onPrint={printPage} onExport={exportDeductModal} {...modalDateProps}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:20}}><div style={{background:`linear-gradient(135deg,${C.primary1}15,${C.primary1}05)`,borderRadius:14,padding:"18px",textAlign:"center",border:`1px solid ${C.primary1}25`}}><div style={{fontSize:11,color:C.primary1,textTransform:"uppercase",marginBottom:8}}>% Deduction Overall</div><div style={{fontSize:34,fontWeight:800,color:C.primary1}}>{OVERALL_DEDUCTION}%</div></div><div style={{background:T.card,borderRadius:14,padding:"18px",textAlign:"center",border:`1px solid ${T.border}`}}><div style={{fontSize:11,color:T.muted,textTransform:"uppercase",marginBottom:8}}>Total User Area</div><div style={{fontSize:34,fontWeight:800,color:C.primary2}}>{TOTAL_USER_AREA}</div></div><div style={{background:T.card,borderRadius:14,padding:"18px",textAlign:"center",border:`1px solid ${T.border}`}}><div style={{fontSize:11,color:T.muted,textTransform:"uppercase",marginBottom:8}}>Total Deduction</div><div style={{fontSize:28,fontWeight:800,color:T.success}}>RM 0.00</div></div></div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12,marginBottom:20}}>{HC_LABELS.map((label,i)=>(<div key={label} style={{background:T.card,borderRadius:12,padding:"14px",textAlign:"center",border:`1px solid ${T.border}`}}><div style={{width:11,height:11,borderRadius:"50%",background:HC_COLORS[i],display:"inline-block",marginBottom:8}} /><div style={{fontSize:18,fontWeight:800,color:HC_COLORS[i]}}>RM 0.00</div><div style={{fontSize:12,color:T.muted,marginTop:4}}>{label} — {HC_VALUES[i]}%</div></div>))}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}><div><div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:12}}>% HC1–HC5 Distribution</div><div style={{position:"relative",height:220}}><canvas id="m-lBar" /></div></div><div><div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:12}}>% Deduction Trend (Jan–Oct)</div><div style={{position:"relative",height:220}}><canvas id="m-deductLine" /></div></div></div>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13,marginTop:18}}><thead><tr>{["Indicator","% Weight","Deduction (RM)"].map(h=><th key={h} style={thStyle}>{h}</th>)}</tr></thead><tbody>{HC_LABELS.map((label,i)=><tr key={label}>{[label,HC_VALUES[i].toFixed(2)+"%","RM 0.00"].map((cell,j)=><td key={j} style={tdStyle}>{String(cell)}</td>)}</tr>)}</tbody></table>
        </Modal>)}
      </>)}
    </div>
  );
}