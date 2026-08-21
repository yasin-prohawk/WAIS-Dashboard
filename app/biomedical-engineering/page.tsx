"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import Link from "next/link";
import { useDashboardNav } from "@/components/dashboard-nav-provider";

declare global { interface Window { Chart: any; XLSX: any; } }

/* ─── BEMS DATA ─────────────────────────────────── */
const MONTHS_12 = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const SR_TOTAL = 606;
const SR_NORMAL = 606;
const SR_CRITICAL = 0;
const SR_OUTSTANDING = 78;
const SR_DONE = 528;

const SR_BY_TYPE = [
  { label: "Additional Work (AW)", count: 86, percentage: 14.2, color: "#007BFF" },
  { label: "Advisory Services (TA)", count: 64, percentage: 10.6, color: "#22c55e" },
  { label: "Incident (IR)", count: 57, percentage: 9.4, color: "#ef4444" },
  { label: "BER", count: 33, percentage: 5.5, color: "#eab308" },
  { label: "Non-conformance (NCR)", count: 53, percentage: 8.8, color: "#86efac" },
  { label: "T&C", count: 78, percentage: 12.9, color: "#15803d" },
  { label: "Unschedule Maintenance", count: 100, percentage: 16.5, color: "#60a5fa" },
  { label: "User Request", count: 125, percentage: 20.6, color: "#1e40af" },
  { label: "User Training", count: 42, percentage: 6.9, color: "#b91c1c" },
];

const SR_STATUS = [
  { label: "Closed", count: 528, color: "#22c55e" },
  { label: "Open", count: 78, color: "#ef4444" },
];

const NCR_TOTAL = 62;
const NCR_OPEN = 43;
const NCR_CLOSED = 19;
const NCR_CLOSURE_RATE = 30.6;
const NCR_BY_MONTH = [
  { month: "NCR 1.1", open: 5, closed: 2 },
  { month: "NCR 1.2", open: 4, closed: 1 },
  { month: "NCR 1.3", open: 6, closed: 2 },
  { month: "NCR 1.4", open: 3, closed: 2 },
  { month: "NCR 1.5", open: 5, closed: 1 },
  { month: "NCR 1.6", open: 4, closed: 2 },
  { month: "NCR 1.7", open: 3, closed: 2 },
  { month: "NCR 1.8", open: 4, closed: 1 },
  { month: "NCR 1.9", open: 2, closed: 2 },
  { month: "NCR 1.10", open: 3, closed: 2 },
  { month: "NCR 1.11", open: 2, closed: 1 },
  { month: "NCR 1.12", open: 2, closed: 1 },
];
const NCR_MONTH_COLORS = ["#3b82f6","#8b5cf6","#22d3ee","#0e7490","#0ea5e9","#ef4444","#f97316","#eab308","#22c55e","#14b8a6","#a855f7","#f43f5e"];

const OVERALL_DEDUCTION = 8.72;
const DEDUCTION_BY_MONTH = [8.80, 7.95, 9.10, 8.40, 9.35, 8.72];
const DEDUCTION_2024 = [7.50, 7.80, 8.20, 7.90, 8.10, 8.40];
const DEDUCTION_2026 = [9.10, 8.90, 9.30, 8.70, 9.50, 8.80];

const B_LABELS = ["B6","B7","B8","B9","B10","B11","B12"];
const B_VALUES = [12.34, 8.45, 5.67, 15.89, 4.23, 38.10, 15.32];
const B_COLORS = ["#007BFF","#6F42C1","#00CCCC","#17A2B8","#0DCAF0","#ef4444","#f97316"];
const B_DEDUCTIONS = [0, 0, 0, 0, 0, 1200.50, 0];

const ASSET_ACTIVE = 1215;
const ASSET_INACTIVE = 32;
const TOTAL_ASSETS = 1247;
const HOSPITAL_NAME = "Hospital: HTA";

const ASSET_BY_TYPE = [
  { type: "Life Support", active: 440, inactive: 8 },
  { type: "Imaging", active: 185, inactive: 12 },
  { type: "Laboratory", active: 298, inactive: 7 },
  { type: "Monitoring", active: 202, inactive: 5 },
  { type: "Surgical", active: 89, inactive: 1 },
];

const ASSET_LIFESPAN = {
  groups: [
    { group: "0-5 Years", count: 310, color: "#22c55e" },
    { group: "5-10 Years", count: 420, color: "#3b82f6" },
    { group: "10-15 Years", count: 330, color: "#f97316" },
    { group: "15-30 Years", count: 150, color: "#ef4444" },
    { group: "30+ Years", count: 37, color: "#8b5cf6" },
  ],
  withinLifespan: 980,
  exceedLifespan: 267,
  serviceByGroup: [
    { group: "Life Support", aging: { "0-5": 95, "5-10": 130, "10-15": 105, "15-30": 55, "30+": 12 } },
    { group: "Imaging", aging: { "0-5": 60, "5-10": 85, "10-15": 65, "15-30": 30, "30+": 8 } },
    { group: "Monitoring", aging: { "0-5": 80, "5-10": 110, "10-15": 90, "15-30": 40, "30+": 10 } },
  ]
};

const TRAINING_SCHEDULE = [
  { id:"TR-01", topic:"Medical Equipment Safety & Handling",   month:"Feb", date:"2026-02-12", status:"Completed" },
  { id:"TR-02", topic:"Calibration Techniques & Standards",    month:"Apr", date:"2026-04-10", status:"Upcoming" },
  { id:"TR-03", topic:"Life Support Equipment Maintenance",    month:"Jun", date:"2026-06-05", status:"Upcoming" },
  { id:"TR-04", topic:"Imaging Equipment Servicing",           month:"Aug", date:"2026-08-07", status:"Upcoming" },
  { id:"TR-05", topic:"Electrical Safety for Biomedical",      month:"Oct", date:"2026-10-09", status:"Upcoming" },
  { id:"TR-06", topic:"Year-End Biomedical Compliance Review", month:"Dec", date:"2026-12-03", status:"Upcoming" },
  { id:"TR-07", topic:"Asset Documentation & Audit Prep",      month:"Dec", date:"2026-12-17", status:"Upcoming" },
];

const CALIBRATION_DATA = [
  { no:"CAL-031", category:"Defibrillator", expiry:"2026-03-08", daysLeft:11 },
  { no:"CAL-074", category:"Patient Monitor", expiry:"2026-04-01", daysLeft:35 },
  { no:"CAL-055", category:"Infusion Pump", expiry:"2026-04-20", daysLeft:54 },
];

const LICENSE_DATA = [
  { no:"LIC-089", category:"Medical Gas", expiry:"2026-03-22", daysLeft:25 },
  { no:"LIC-011", category:"Radiation Protection", expiry:"2026-04-12", daysLeft:46 },
];

const UNSCHEDULE_CATEGORIES = [
  { key: "breakdown", label: "Breakdown", color: "#ef4444", total: 112, open: 14, wip: 10, completed: 75, cancel: 7, rfCancel: 4, notDoneClosed: 2 },
  { key: "corrective", label: "Corrective", color: "#f97316", total: 165, open: 22, wip: 16, completed: 110, cancel: 10, rfCancel: 5, notDoneClosed: 2 },
  { key: "proactive", label: "Proactive", color: "#ec4899", total: 71, open: 9, wip: 7, completed: 49, cancel: 4, rfCancel: 2, notDoneClosed: 0 },
  { key: "warranty", label: "Warranty", color: "#eab308", total: 44, open: 5, wip: 3, completed: 32, cancel: 2, rfCancel: 1, notDoneClosed: 1 },
];
const UNSCHEDULE_TOTAL = 392;
const UNSCHEDULE_OPEN = 50;
const UNSCHEDULE_COMPLETED = 266;
const UNSCHEDULE_STATUS_TOTALS = UNSCHEDULE_CATEGORIES.reduce((acc,c)=>{acc.open+=c.open;acc.wip+=c.wip;acc.completed+=c.completed;acc.cancel+=c.cancel;acc.rfCancel+=c.rfCancel;acc.notDoneClosed+=c.notDoneClosed;return acc;},{open:0,wip:0,completed:0,cancel:0,rfCancel:0,notDoneClosed:0});

const SCHEDULE_CATEGORIES = [
  { key: "ppm", label: "PPM", color: "#3b82f6", total: 124, open: 10, wip: 8, completed: 58, cancel: 4, rfCancel: 1, notDoneClosed: 1 },
  { key: "ri", label: "RI", color: "#22c55e", total: 87, open: 7, wip: 5, completed: 43, cancel: 3, rfCancel: 1, notDoneClosed: 0 },
  { key: "calibration", label: "Calibration", color: "#8b5cf6", total: 63, open: 6, wip: 4, completed: 28, cancel: 3, rfCancel: 1, notDoneClosed: 1 },
  { key: "scm", label: "SCM", color: "#f97316", total: 55, open: 5, wip: 3, completed: 25, cancel: 3, rfCancel: 1, notDoneClosed: 0 },
];
const SCHEDULE_TOTAL = 329;
const SCHEDULE_OPEN = 28;
const SCHEDULE_COMPLETED = 154;
const SCHEDULE_STATUS_TOTALS = SCHEDULE_CATEGORIES.reduce((acc,c)=>{acc.open+=c.open;acc.wip+=c.wip;acc.completed+=c.completed;acc.cancel+=c.cancel;acc.rfCancel+=c.rfCancel;acc.notDoneClosed+=c.notDoneClosed;return acc;},{open:0,wip:0,completed:0,cancel:0,rfCancel:0,notDoneClosed:0});

const getYearData = (year:string, data2025:any[])=>{
  if(year==="2024") return data2025.map((d:any)=>({...d,completedWithin:Math.round(d.completedWithin*0.85),completedNotTo:Math.round(d.completedNotTo*1.2),remaining:Math.round(d.remaining*0.8),notDone:Math.round(d.notDone*1.3)}));
  if(year==="2026") return data2025.map((d:any)=>({...d,completedWithin:Math.round(d.completedWithin*1.1),completedNotTo:Math.round(d.completedNotTo*0.8),remaining:Math.round(d.remaining*1.5),notDone:Math.round(d.notDone*0.7)}));
  return data2025;
};

const UNSCHEDULE_TABLE_DATA_2025 = [
  { m:"Jan '25", completedWithin:45, completedNotTo:12, remaining:0, notDone:3 },
  { m:"Feb '25", completedWithin:38, completedNotTo:15, remaining:2, notDone:2 },
  { m:"Mar '25", completedWithin:52, completedNotTo:18, remaining:0, notDone:1 },
  { m:"Apr '25", completedWithin:48, completedNotTo:14, remaining:1, notDone:2 },
  { m:"May '25", completedWithin:55, completedNotTo:20, remaining:0, notDone:1 },
  { m:"Jun '25", completedWithin:50, completedNotTo:16, remaining:0, notDone:2 },
  { m:"Jul '25", completedWithin:44, completedNotTo:13, remaining:1, notDone:1 },
  { m:"Aug '25", completedWithin:40, completedNotTo:10, remaining:0, notDone:2 },
  { m:"Sep '25", completedWithin:46, completedNotTo:17, remaining:0, notDone:1 },
  { m:"Oct '25", completedWithin:43, completedNotTo:16, remaining:2, notDone:2 },
  { m:"Nov '25", completedWithin:42, completedNotTo:14, remaining:0, notDone:1 },
  { m:"Dec '25", completedWithin:39, completedNotTo:12, remaining:0, notDone:1 },
];

const SCHEDULE_TABLE_DATA_2025 = [
  { m:"Jan '25", completedWithin:631, completedNotTo:0, remaining:0, notDone:0 },
  { m:"Feb '25", completedWithin:462, completedNotTo:0, remaining:0, notDone:0 },
  { m:"Mar '25", completedWithin:614, completedNotTo:0, remaining:0, notDone:0 },
  { m:"Apr '25", completedWithin:734, completedNotTo:0, remaining:0, notDone:0 },
  { m:"May '25", completedWithin:520, completedNotTo:15, remaining:2, notDone:0 },
  { m:"Jun '25", completedWithin:580, completedNotTo:8, remaining:0, notDone:1 },
  { m:"Jul '25", completedWithin:495, completedNotTo:22, remaining:0, notDone:0 },
  { m:"Aug '25", completedWithin:610, completedNotTo:5, remaining:1, notDone:0 },
  { m:"Sep '25", completedWithin:550, completedNotTo:12, remaining:0, notDone:0 },
  { m:"Oct '25", completedWithin:575, completedNotTo:8, remaining:0, notDone:1 },
  { m:"Nov '25", completedWithin:530, completedNotTo:18, remaining:0, notDone:0 },
  { m:"Dec '25", completedWithin:490, completedNotTo:10, remaining:3, notDone:0 },
];

const STATUS_LABELS: Record<string,string> = {open:"Open",wip:"WIP",completed:"Completed",cancel:"Cancel",rfCancel:"Req. Cancel",notDoneClosed:"Not Done"};
const STATUS_COLORS: Record<string,string> = {open:"#ef4444",wip:"#f97316",completed:"#22c55e",cancel:"#9ca3af",rfCancel:"#eab308",notDoneClosed:"#8b5cf6"};
const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

/* ─── THEMES ────────────────────────────────────── */
const THEMES = {
  dark: { bg:"#0d1520", panel:"#111d2b", card:"#162233", border:"#1e3248", text:"#e0e7ff", muted:"#8a9cb8", accent:"#5a9fd4", success:"#22c55e", warn:"#f59e0b", danger:"#ef4444", gridColor:"rgba(255,255,255,0.07)", tickColor:"#6b8099", scrollThumb:"#2a3f55", inputBg:"#162233", selectBg:"#162233" },
  light: { bg:"#f0f4f8", panel:"#ffffff", card:"#ffffff", border:"#dde3ed", text:"#1a2636", muted:"#6b7fa3", accent:"#1a6bb5", success:"#16a34a", warn:"#d97706", danger:"#dc2626", gridColor:"rgba(0,0,0,0.06)", tickColor:"#8a9cb8", scrollThumb:"#c5cfe0", inputBg:"#f8fafc", selectBg:"#f8fafc" },
};
type Theme = typeof THEMES.dark;

/* ─── NAVIGATION DIRECTORY ──────────────────────── */
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

const BEMS_TABS = [
  { key:"general", label:"General" },
  { key:"assetStatus", label:"Asset Status" },
  { key:"assetLifespan", label:"Asset Lifespan" },
];

/* ─── CHART HELPERS ─────────────────────────────── */
function drawChart(id:string,type:string,data:any,options:any){
  const c=document.getElementById(id) as HTMLCanvasElement|null;
  if(!c)return;if(!window.Chart){setTimeout(()=>drawChart(id,type,data,options),150);return;}
  const ctx=c.getContext("2d");if(!ctx)return;const ex=window.Chart.getChart(c);if(ex)ex.destroy();
  try{new window.Chart(ctx,{type:type as any,data,options:{...options,animation:false,responsive:true,maintainAspectRatio:false}});}catch(e){}
}
function mkPieChart(id:string,labels:string[],values:number[],colors:string[],cutout="60%"){
  drawChart(id,"doughnut",{labels,datasets:[{data:values,backgroundColor:colors,borderWidth:0}]},{cutout,plugins:{legend:{display:false}}});
}
function mkLineChart(id:string,labels:string[],datasets:any[],T:Theme,yscaleOpts?:any){
  const yticks:any={color:T.tickColor,font:{size:12}};
  if(yscaleOpts?.callback)yticks.callback=yscaleOpts.callback;
  const yscale:any={grid:{color:T.gridColor},border:{color:"transparent"},ticks:yticks};
  if(yscaleOpts?.min!==undefined)yscale.min=yscaleOpts.min;
  if(yscaleOpts?.max!==undefined)yscale.max=yscaleOpts.max;
  drawChart(id,"line",{labels,datasets:datasets.map((d:any)=>({...d,borderWidth:2.5,pointRadius:4,tension:0.3}))},{plugins:{legend:{display:false}},scales:{x:{grid:{color:T.gridColor},ticks:{color:T.tickColor,font:{size:12}},border:{color:"transparent"}},y:yscale}});
}
function mkBarChart(id:string,labels:string[],values:number[],colors:string[],T:Theme,horizontal?:boolean){
  drawChart(id,"bar",{labels,datasets:[{data:values,backgroundColor:colors,borderRadius:6}]},{indexAxis:horizontal?"y":"x",plugins:{legend:{display:false}},scales:{x:{grid:{color:T.gridColor},ticks:{color:T.tickColor,font:{size:12}},border:{color:"transparent"}},y:{grid:{color:T.gridColor},ticks:{color:T.tickColor,font:{size:12}},border:{color:"transparent"}}}});
}
function mkStackedBarChart(id:string,labels:string[],datasets:any[],T:Theme){
  drawChart(id,"bar",{labels,datasets:datasets.map((d:any)=>({...d,borderRadius:4}))},{plugins:{legend:{display:true,labels:{color:T.muted,font:{size:11},boxWidth:10,padding:10}}},scales:{x:{stacked:true,grid:{color:T.gridColor},ticks:{color:T.tickColor,font:{size:11}},border:{color:"transparent"}},y:{stacked:true,grid:{color:T.gridColor},ticks:{color:T.tickColor,font:{size:11}},border:{color:"transparent"}}}});
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
function DaysBadge({days}:{days:number}){
  let bg="rgba(234,179,8,.15)",c="#eab308";
  if(days<=14){bg="rgba(239,68,68,.15)";c="#ef4444";}else if(days<=30){bg="rgba(249,115,22,.15)";c="#f97316";}
  return <span style={{padding:"3px 10px",borderRadius:24,fontSize:12,fontWeight:700,background:bg,color:c}}>{days}d</span>;
}
function ProgressBar({value,max,color,T}:{value:number;max:number;color:string;T:Theme}){
  return(<div style={{height:6,background:T.border,borderRadius:4,overflow:"hidden"}}><div style={{height:"100%",width:`${Math.min(100,(value/max)*100)}%`,background:color,borderRadius:4}} /></div>);
}
function getContrastText(h:string){const r=parseInt(h.slice(1,3),16),g=parseInt(h.slice(3,5),16),b=parseInt(h.slice(5,7),16);return(r*299+g*587+b*114)/1000>128?"#1a2636":"#ffffff";}

function Modal({title,onClose,children,T,onExport,onPrint}:{title:string;onClose:()=>void;children:React.ReactNode;T:Theme;onExport?:()=>void;onPrint?:()=>void}){
  return(<div onClick={e=>{if((e.target as HTMLElement).dataset.overlay)onClose();}} data-overlay="1" style={{position:"fixed",inset:0,background:"rgba(0,0,0,.45)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(4px)"}}>
    <div style={{background:T.panel,border:`1px solid ${T.border}`,borderRadius:20,padding:28,width:1100,maxHeight:"88vh",overflowY:"auto",boxShadow:"0 24px 60px rgba(0,0,0,.18)"}}>
      <style>{`::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:${T.scrollThumb};border-radius:99px}`}</style>
      <div className="no-print" style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}><h2 style={{fontSize:20,fontWeight:700,color:T.text,margin:0}}>{title}</h2>
        <div style={{display:"flex",gap:8}}>
          <button onClick={onPrint} title="Print" style={{background:T.accent+"12",border:`1px solid ${T.accent}25`,color:T.accent,width:36,height:36,borderRadius:8,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><BIcon name="bi-printer" size={16} color={T.accent} /></button>
          {onExport&&<button onClick={onExport} title="Export Excel" style={{background:T.success+"12",border:`1px solid ${T.success}25`,color:T.success,width:36,height:36,borderRadius:8,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><BIcon name="bi-download" size={16} color={T.success} /></button>}
          <button onClick={onClose} title="Close" style={{background:T.card,border:`1px solid ${T.border}`,color:T.muted,width:36,height:36,borderRadius:8,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><BIcon name="bi-x-lg" size={16} color={T.muted} /></button>
        </div>
      </div>
      {children}
    </div>
  </div>);
}

function FilterRow({year,setYear,month,setMonth,startDate,setStartDate,endDate,setEndDate,showMonth=true,T}:{
  year:string;setYear:(v:string)=>void;
  month:string;setMonth:(v:string)=>void;
  startDate:string;setStartDate:(v:string)=>void;
  endDate:string;setEndDate:(v:string)=>void;
  showMonth?:boolean;T:Theme
}){
  const selS:React.CSSProperties={background:T.inputBg,border:`1px solid ${T.border}`,color:T.text,padding:"6px 30px 6px 12px",borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer",appearance:"none",WebkitAppearance:"none",backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,backgroundRepeat:"no-repeat",backgroundPosition:"right 8px center"};
  const inputS:React.CSSProperties={background:T.inputBg,border:`1px solid ${T.border}`,color:T.text,padding:"6px 12px",borderRadius:8,fontSize:12,fontWeight:600};
  return(<div className="no-print" style={{display:"flex",alignItems:"center",gap:12,marginBottom:16,padding:"12px 16px",background:T.panel,borderRadius:12,border:`1px solid ${T.border}`,flexWrap:"wrap"}}>
    <span style={{fontSize:12,color:T.muted,fontWeight:700,letterSpacing:".5px"}}><BIcon name="bi-funnel" size={13} color={T.muted} /> FILTER</span>
    <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:12,color:T.muted,fontWeight:600}}>Year</span><select value={year} onChange={e=>setYear(e.target.value)} style={selS}><option value="2025">2025</option><option value="2024">2024</option><option value="2026">2026</option></select></div>
    {showMonth&&<div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:12,color:T.muted,fontWeight:600}}>Month</span><select value={month} onChange={e=>setMonth(e.target.value)} style={selS}><option value="all">All Months</option>{months.map(m=><option key={m} value={m.toLowerCase()}>{m}</option>)}</select></div>}
    <div style={{display:"flex",alignItems:"center",gap:6}}>
      <span style={{fontSize:12,color:T.muted,fontWeight:600}}>Start Date</span>
      <input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} style={inputS} />
    </div>
    <div style={{display:"flex",alignItems:"center",gap:6}}>
      <span style={{fontSize:12,color:T.muted,fontWeight:600}}>End Date</span>
      <input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} style={inputS} />
    </div>
  </div>);
}

function StatCards({data,T}:{data:any[],T:Theme}){
  return(<div style={{display:"grid",gridTemplateColumns:`repeat(${data.length},1fr)`,gap:12,marginBottom:20}}>{data.map((s,i)=>(<div key={i} style={{background:T.card,borderRadius:12,padding:"14px",textAlign:"center",border:`1px solid ${T.border}`}}><div style={{fontSize:28,fontWeight:800,color:s.c}}>{s.v}</div><div style={{fontSize:11,color:T.muted,marginTop:4}}>{s.l}</div></div>))}</div>);
}

function MiniStat({label,value,color,T}:{label:string;value:string|number;color:string;T:Theme}){
  return(<div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 6px",textAlign:"center"}}>
    <div style={{fontSize:8,color:T.muted,textTransform:"uppercase",letterSpacing:"0.3px"}}>{label}</div>
    <div style={{fontSize:18,fontWeight:700,color}}>{value}</div>
  </div>);
}

/* ─── EXPORT ─────────────────────────────────────── */
function exportExcelAll(){if(!window.XLSX)return;const wb=window.XLSX.utils.book_new();[{name:"Summary",data:[["BEMS Dashboard"],["Metric","Value"],["Total SR",SR_TOTAL],["Total NCR",NCR_TOTAL],["Unschedule WO",UNSCHEDULE_TOTAL],["Schedule WO",SCHEDULE_TOTAL]]}].forEach(s=>{const ws=window.XLSX.utils.aoa_to_sheet(s.data);window.XLSX.utils.book_append_sheet(wb,ws,s.name);});window.XLSX.writeFile(wb,"BEMS_Dashboard_Export.xlsx");}
function exportModalData(modalId:string,yr:string,getData:any){
  if(!window.XLSX)return;let rows:any[][]=[];
  if(modalId==="unschedule"||modalId==="schedule"){const data=getData();rows=[["Month","Completed Within Schedule","Completed Not to Schedule","Remaining","Not Done"],...data.map((d:any)=>[d.m,d.completedWithin,d.completedNotTo,d.remaining,d.notDone])];}
  else if(modalId==="sr"){rows=[["Status","Count"],["Total",SR_TOTAL],["Normal",SR_NORMAL],["Outstanding",SR_OUTSTANDING],["Done",SR_DONE]];}
  else if(modalId==="ncr"){rows=[["Status","Count"],["Total",NCR_TOTAL],["Open",NCR_OPEN],["Closed",NCR_CLOSED]];}
  else if(modalId==="deduction"){rows=[["Indicator","%","Deduction (RM)"],...B_LABELS.map((l,i)=>[l,B_VALUES[i].toFixed(2)+"%","RM "+B_DEDUCTIONS[i].toFixed(2)])];}
  if(!rows.length)return;const wb=window.XLSX.utils.book_new();const ws=window.XLSX.utils.aoa_to_sheet(rows);window.XLSX.utils.book_append_sheet(wb,ws,"Detail");window.XLSX.writeFile(wb,`BEMS_${modalId}_${yr}.xlsx`);
}
function printPage(){const s=document.createElement('style');s.id='ps';s.textContent='@page{size:A4 landscape;margin:10mm}@media print{body{-webkit-print-color-adjust:exact!important}.no-print{display:none!important}}';document.head.appendChild(s);window.print();setTimeout(()=>{const e=document.getElementById('ps');if(e)e.remove();},1000);}

/* ─── MAIN ──────────────────────────────────────── */
export default function BEMSDashboard(){
  const { openSidebar } = useDashboardNav();const [activePage,setActivePage]=useState("bem");
  const [activeTab,setActiveTab]=useState("general");const [modal,setModal]=useState<string|null>(null);
  const [themeName,setThemeName]=useState<"dark"|"light">("light");
  const [frequency,setFrequency]=useState("monthly");const [frequencyKey,setFrequencyKey]=useState("all");
  const [selectedYear,setSelectedYear]=useState("2026");
  const [startDate,setStartDate]=useState("2025-07-01");
  const [endDate,setEndDate]=useState("2025-12-31");
  const [modalYear,setModalYear]=useState("2025");const [modalMonth,setModalMonth]=useState("all");
  const [modalStartDate,setModalStartDate]=useState("2025-01-01");
  const [modalEndDate,setModalEndDate]=useState("2025-12-31");
  const [modalDeductYear,setModalDeductYear]=useState("2025");
  const T=THEMES[themeName];const scriptsReady=useRef(false);const baseChartsInited=useRef(false);
  const currentPage=NAV_PAGES.find(p=>p.key===activePage)||NAV_PAGES[0];const HDR="#0f172a";const htc=getContrastText(HDR);

  useEffect(()=>{
    if(scriptsReady.current)return;
    const load=(src:string,cb:()=>void)=>{const s=document.createElement("script");s.src=src;s.onload=cb;document.head.appendChild(s);};
    load("https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js",()=>{load("https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js",()=>{scriptsReady.current=true;setTimeout(()=>{initBaseCharts();baseChartsInited.current=true;},400);});});
  },[]);
  useEffect(()=>{if(scriptsReady.current&&baseChartsInited.current)setTimeout(initBaseCharts,200);},[activeTab,themeName,startDate,endDate]);
  useEffect(()=>{if(modal&&scriptsReady.current&&baseChartsInited.current)setTimeout(()=>initModalCharts(modal),300);},[modal,modalYear,modalMonth,modalDeductYear,modalStartDate,modalEndDate]);

  const getUnschedData=useMemo(()=>getYearData(modalYear,UNSCHEDULE_TABLE_DATA_2025),[modalYear]);
  const getSchedData=useMemo(()=>getYearData(modalYear,SCHEDULE_TABLE_DATA_2025),[modalYear]);

  const initBaseCharts=()=>{
    if(!window.Chart){setTimeout(initBaseCharts,200);return;}
    ["deductIndicatorPie","assetPie","assetBar","assetLifespanPie","assetLifespanDonut","assetServiceBar","srPie","srStatusPie"].forEach(id=>{const c=document.getElementById(id) as HTMLCanvasElement;if(c){const ex=window.Chart.getChart(c);if(ex)ex.destroy();}});
    mkPieChart("deductIndicatorPie",B_LABELS,B_VALUES,B_COLORS,"50%");
    mkPieChart("srPie", SR_BY_TYPE.map(s=>s.label), SR_BY_TYPE.map(s=>s.count), SR_BY_TYPE.map(s=>s.color), "50%");
    mkPieChart("srStatusPie", SR_STATUS.map(s=>s.label), SR_STATUS.map(s=>s.count), SR_STATUS.map(s=>s.color), "50%");
    if(activeTab==="assetStatus"){mkPieChart("assetPie",["Active","Inactive"],[ASSET_ACTIVE,ASSET_INACTIVE],["#22c55e","#ef4444"],"55%");mkBarChart("assetBar",ASSET_BY_TYPE.map(a=>a.type),ASSET_BY_TYPE.map(a=>a.active),Array(5).fill("#22c55e"),T,true);}
    if(activeTab==="assetLifespan"){
      const lifespanLabels = ASSET_LIFESPAN.groups.map(g => g.group);
      const lifespanValues = ASSET_LIFESPAN.groups.map(g => g.count);
      const lifespanColors = ASSET_LIFESPAN.groups.map(g => g.color);
      mkPieChart("assetLifespanPie", lifespanLabels, lifespanValues, lifespanColors, "50%");
      mkPieChart("assetLifespanDonut", ["Within Lifespan", "Exceed Lifespan"], [ASSET_LIFESPAN.withinLifespan, ASSET_LIFESPAN.exceedLifespan], ["#22c55e", "#ef4444"], "60%");

      const groupLabels = ASSET_LIFESPAN.serviceByGroup.map(g => g.group);
      const agingKeys = ["0-5", "5-10", "10-15", "15-30", "30+"];
      const agingColors = ["#22c55e", "#3b82f6", "#f97316", "#ef4444", "#8b5cf6"];
      const datasets = agingKeys.map((key, idx) => ({
        label: key + " Years",
        data: ASSET_LIFESPAN.serviceByGroup.map(g => (g.aging as any)[key] || 0),
        backgroundColor: agingColors[idx]
      }));
      mkStackedBarChart("assetServiceBar", groupLabels, datasets, T);
    }
  };

  const initModalCharts=(id:string)=>{
    if(!window.Chart){setTimeout(()=>initModalCharts(id),200);return;}
    if(id==="sr"){
      mkPieChart("modalSRPie", SR_BY_TYPE.map(s=>s.label), SR_BY_TYPE.map(s=>s.count), SR_BY_TYPE.map(s=>s.color), "50%");
      mkPieChart("modalSRStatusPie", SR_STATUS.map(s=>s.label), SR_STATUS.map(s=>s.count), SR_STATUS.map(s=>s.color), "50%");
    }
    if(id==="ncr"){mkBarChart("modalNCRMonthly", NCR_BY_MONTH.map(d=>d.month), NCR_BY_MONTH.map(d=>d.open), NCR_MONTH_COLORS, T, true);}
    if(id==="deduction"){mkBarChart("modalDeductBar",B_LABELS,B_VALUES,B_COLORS,T,true);const dd=modalDeductYear==="2024"?DEDUCTION_2024:modalDeductYear==="2026"?DEDUCTION_2026:DEDUCTION_BY_MONTH;mkLineChart("modalDeductLine",["Jul","Aug","Sep","Oct","Nov","Dec"],[{data:dd,borderColor:"#3b82f6",backgroundColor:"#3b82f622",fill:true}],T,{callback:(v:number)=>v+"%"});}
    if(id==="unschedule"){const ud=getUnschedData;mkStackedBarChart("modalUnschedStacked",ud.map((d:any)=>d.m),[{label:"Completed Within Schedule",data:ud.map((d:any)=>d.completedWithin),backgroundColor:"#22c55e"},{label:"Completed Not to Schedule",data:ud.map((d:any)=>d.completedNotTo),backgroundColor:"#f97316"},{label:"Remaining",data:ud.map((d:any)=>d.remaining),backgroundColor:"#3b82f6"},{label:"Not Done",data:ud.map((d:any)=>d.notDone),backgroundColor:"#ef4444"}],T);UNSCHEDULE_CATEGORIES.forEach((cat,i)=>{const keys=["open","wip","completed","cancel","rfCancel","notDoneClosed"];const st=keys.map(k=>({k,v:(cat as any)[k]||0})).filter(s=>s.v>0);mkPieChart(`unschedCatPie${i}`,st.map(s=>STATUS_LABELS[s.k]),st.map(s=>s.v),st.map(s=>STATUS_COLORS[s.k]),"55%");});}
    if(id==="schedule"){const sd=getSchedData;mkStackedBarChart("modalSchedStacked",sd.map((d:any)=>d.m),[{label:"Completed Within Schedule",data:sd.map((d:any)=>d.completedWithin),backgroundColor:"#22c55e"},{label:"Completed Not to Schedule",data:sd.map((d:any)=>d.completedNotTo),backgroundColor:"#f97316"},{label:"Remaining",data:sd.map((d:any)=>d.remaining),backgroundColor:"#3b82f6"},{label:"Not Done",data:sd.map((d:any)=>d.notDone),backgroundColor:"#ef4444"}],T);SCHEDULE_CATEGORIES.forEach((cat,i)=>{const keys=["open","wip","completed","cancel","rfCancel","notDoneClosed"];const st=keys.map(k=>({k,v:(cat as any)[k]||0})).filter(s=>s.v>0);mkPieChart(`schedCatPie${i}`,st.map(s=>STATUS_LABELS[s.k]),st.map(s=>s.v),st.map(s=>STATUS_COLORS[s.k]),"55%");});}
  };

  const openModal=(id:string)=>{setModal(id);setModalYear("2025");setModalMonth("all");setModalStartDate("2025-01-01");setModalEndDate("2025-12-31");setModalDeductYear("2025");};
  const card=(e?:React.CSSProperties):React.CSSProperties=>({background:T.card,border:`1px solid ${T.border}`,borderRadius:16,...e});
  const panel=(e?:React.CSSProperties):React.CSSProperties=>({background:T.panel,border:`1px solid ${T.border}`,borderRadius:12,...e});

  // FEMS-style compact top header cards (4-up grid)
  const topHeaderCards = [
    { title:"Unschedule WO", total:UNSCHEDULE_TOTAL, color:"#ef4444", items:[{label:"Open",value:UNSCHEDULE_OPEN,color:"#ef4444"},{label:"Completed",value:UNSCHEDULE_COMPLETED,color:"#22c55e"}], modalId:"unschedule", borderLeft:"3px solid #ef4444" },
    { title:"Schedule WO", total:SCHEDULE_TOTAL, color:"#3b82f6", items:[{label:"Open",value:SCHEDULE_OPEN,color:"#ef4444"},{label:"Completed",value:SCHEDULE_COMPLETED,color:"#22c55e"}], modalId:"schedule", borderLeft:"3px solid #3b82f6" },
    { title:"Service Request", total:SR_TOTAL, color:T.text, items:[{label:"Normal",value:SR_NORMAL,color:"#22c55e"},{label:"Outstanding",value:SR_OUTSTANDING,color:"#f59e0b"}], modalId:"sr" },
    { title:"NCR", total:NCR_TOTAL, color:T.text, items:[{label:"Open",value:NCR_OPEN,color:"#ef4444",suffix:`(${((NCR_OPEN/NCR_TOTAL)*100).toFixed(1)}%)`},{label:"Closed",value:NCR_CLOSED,color:"#22c55e",suffix:`(${((NCR_CLOSED/NCR_TOTAL)*100).toFixed(1)}%)`}], modalId:"ncr" },
  ];

  const trainingUpcoming = TRAINING_SCHEDULE.filter(t=>t.status==="Upcoming").length;
  const trainingCompleted = TRAINING_SCHEDULE.filter(t=>t.status==="Completed").length;

  const inputStyle:React.CSSProperties = {
    background: "#fff",
    color: "#1a2636",
    border: "1px solid rgba(255,255,255,0.3)",
    padding: "6px 12px",
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 600,
  };

  return(
    <div className="dashboard-module-page" style={{fontFamily:"'DM Sans',system-ui,sans-serif",background:T.bg,color:T.text,fontSize:15,height:"100vh",display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');*,::-webkit-scrollbar{scrollbar-width:thin;scrollbar-color:${T.scrollThumb} transparent}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track:transparent;::-webkit-scrollbar-thumb{background:${T.scrollThumb};border-radius:99px}@page{size:A4 landscape;margin:10mm}@media print{body{-webkit-print-color-adjust:exact!important}.no-print{display:none!important}}`}</style>

      {/* TOP BAR */}
      <div className="no-print dashboard-top-bar" style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:HDR,borderBottom:`1px solid ${htc}15`,padding:"0 24px",height:62,flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:16}}>
          <button onClick={openSidebar} style={{background:"transparent",border:"none",color:htc,cursor:"pointer",fontSize:20,padding:"8px 11px",borderRadius:10}}><BIcon name="bi-list" size={22} color={htc} /></button>
          <Link href="/" style={{display:"flex",alignItems:"center",gap:6,padding:"6px 14px",borderRadius:8,border:`1px solid ${htc}30`,color:htc,textDecoration:"none",fontSize:13,fontWeight:500,transition:"all .15s",background:"transparent"}}>
            <BIcon name="bi-arrow-left" size={16} color={htc} />
            <span>Back</span>
          </Link>
          <div><div style={{fontSize:17,fontWeight:700,color:htc}}>{currentPage.label}</div><div style={{fontSize:11,color:htc,opacity:0.6}}>BEMS Performance Dashboard</div></div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          {activePage==="bem"&&<div style={{display:"flex",gap:8}}><button onClick={exportExcelAll} title="Export" style={{background:T.success+"12",border:`1px solid ${T.success}25`,color:T.success,width:34,height:34,borderRadius:8,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><BIcon name="bi-download" size={15} color={T.success} /></button><button onClick={printPage} title="Print" style={{background:T.accent+"12",border:`1px solid ${T.accent}25`,color:T.accent,width:34,height:34,borderRadius:8,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><BIcon name="bi-printer" size={15} color={T.accent} /></button></div>}
          <div style={{width:1,height:28,background:htc,opacity:0.12}} />
          <button onClick={()=>setThemeName(n=>n==="dark"?"light":"dark")} style={{background:"transparent",border:`1px solid ${htc}20`,color:htc,borderRadius:8,padding:"6px 12px",cursor:"pointer",fontSize:14}}><BIcon name={themeName==="dark"?"bi-sun-fill":"bi-moon-fill"} size={15} color={htc} /></button>
          <span style={{fontSize:13,color:htc,opacity:0.7}}>25 Feb 2026</span>
          <div style={{display:"flex",alignItems:"center",gap:10,padding:"4px 12px 4px 4px",background:htc+"08",borderRadius:24,border:`1px solid ${htc}20`}}><div style={{width:30,height:30,borderRadius:"50%",background:"linear-gradient(135deg,#8b5cf6,#06b6d4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"#fff"}}><BIcon name="bi-person-fill" size={13} color="#fff" /></div><span style={{fontSize:13,fontWeight:600,color:htc}}>Admin</span></div>
        </div>
      </div>

      {activePage!=="bem"&&(<div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column" as const,gap:20,color:T.muted}}><BIcon name="bi-heart-pulse" size={56} color={T.muted} /><div style={{fontSize:24,fontWeight:700,color:T.text}}>{currentPage.label}</div></div>)}

      {activePage==="bem"&&(<>
        {/* FILTER BAR */}
        <div className="no-print dashboard-filter-bar" style={{display:"flex",alignItems:"center",background:HDR,borderBottom:`1px solid ${htc}15`,padding:"0 22px",height:54,gap:12,flexShrink:0,flexWrap:"wrap"}}>
          <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:12,fontWeight:600,color:"#fff"}}>Frequency</span><select value={frequency} onChange={e=>{setFrequency(e.target.value);setFrequencyKey("all");}} style={{background:"#fff",color:"#1a2636",border:"1px solid rgba(255,255,255,0.3)",padding:"6px 30px 6px 12px",borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer",appearance:"none",WebkitAppearance:"none",backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,backgroundRepeat:"no-repeat",backgroundPosition:"right 8px center"}}><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option><option value="yearly">Yearly</option></select></div>
          <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:12,fontWeight:600,color:"#fff"}}>Frequency Key</span><select value={frequencyKey} onChange={e=>setFrequencyKey(e.target.value)} style={{background:"#fff",color:"#1a2636",border:"1px solid rgba(255,255,255,0.3)",padding:"6px 30px 6px 12px",borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer",appearance:"none",WebkitAppearance:"none",backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,backgroundRepeat:"no-repeat",backgroundPosition:"right 8px center"}}><option value="all">All Months</option>{months.map(m=><option key={m} value={m.toLowerCase()}>{m}</option>)}</select></div>
          <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:12,fontWeight:600,color:"#fff"}}>Year</span><select value={selectedYear} onChange={e=>setSelectedYear(e.target.value)} style={{background:"#fff",color:"#1a2636",border:"1px solid rgba(255,255,255,0.3)",padding:"6px 30px 6px 12px",borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer",appearance:"none",WebkitAppearance:"none",backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,backgroundRepeat:"no-repeat",backgroundPosition:"right 8px center"}}><option value="2026">2026</option><option value="2025">2025</option><option value="2024">2024</option></select></div>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <span style={{fontSize:12,fontWeight:600,color:"#fff"}}>Start Date</span>
            <input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} style={inputStyle} />
          </div>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <span style={{fontSize:12,fontWeight:600,color:"#fff"}}>End Date</span>
            <input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} style={inputStyle} />
          </div>
          <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:8,paddingLeft:16,borderLeft:"1px solid rgba(255,255,255,0.2)"}}>
            <span style={{fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"1px",color:"rgba(255,255,255,0.55)"}}>As of</span>
            <span style={{fontSize:14,fontWeight:700,color:"#fff"}}>25 Feb 2026</span>
          </div>
        </div>

        <div className="dashboard-main-columns" style={{flex:1,display:"flex",overflow:"hidden",padding:"16px",gap:16}}>
          {/* LEFT COLUMN */}
          <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",gap:14}}>
            {/* TOP HEADER CARDS — compact 4-up grid (FEMS style) */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,flexShrink:0}}>
              {topHeaderCards.map((crd,i)=>(<div key={i} style={{...card({padding:"12px 14px"}),...(crd.borderLeft?{borderLeft:crd.borderLeft}:{})}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                  <span style={{fontSize:12,fontWeight:700,color:T.text}}>{crd.title}</span>
                  <button className="no-print" onClick={()=>openModal(crd.modalId)} style={{background:T.panel,border:`1px solid ${T.border}`,color:T.muted,width:22,height:22,borderRadius:5,cursor:"pointer",fontSize:10,display:"flex",alignItems:"center",justifyContent:"center"}}><BIcon name="bi-arrows-angle-expand" size={10} color={T.muted} /></button>
                </div>
                <div style={{display:"flex",gap:10,alignItems:"center"}}>
                  <div style={{textAlign:"center"}}><div style={{fontSize:24,fontWeight:800,color:crd.color}}>{crd.total}</div><div style={{fontSize:8,color:T.muted}}>Total</div></div>
                  <div style={{flex:1,display:"flex",flexDirection:"column",gap:3}}>
                    {crd.items.map((s:any,j:number)=>(<div key={j}><div style={{display:"flex",justifyContent:"space-between",fontSize:10}}><span style={{color:T.muted}}>{s.label}</span><span style={{color:s.color,fontWeight:600}}>{s.value}{s.suffix||""}</span></div><ProgressBar value={s.value} max={crd.total} color={s.color} T={T} /></div>))}
                  </div>
                </div>
              </div>))}
            </div>

            {/* PERFORMANCE CARD */}
            <div style={{...card({overflow:"hidden",display:"flex",flexDirection:"column"}),flex:1,minHeight:0}}>
              <div style={{padding:"14px 18px",borderBottom:`1px solid ${T.border}`,flexShrink:0}}><span style={{fontSize:15,fontWeight:700,color:T.text}}>Overall BEMS Performance <span style={{fontSize:12,color:T.muted}}>— {BEMS_TABS.find(t=>t.key===activeTab)?.label}</span></span></div>
              <div style={{flex:1,display:"flex",overflow:"hidden",minHeight:0}}>
                <div className="no-print" style={{width:185,flexShrink:0,borderRight:`1px solid ${T.border}`,display:"flex",flexDirection:"column",padding:"10px 7px",gap:3,overflowY:"auto",background:themeName==="light"?"#f8fafc":T.panel}}>{BEMS_TABS.map(t=>{const a=activeTab===t.key;return(<button key={t.key} onClick={()=>setActiveTab(t.key)} style={{width:"100%",padding:"11px 12px",borderRadius:9,fontSize:11,fontWeight:a?600:400,border:`1px solid ${a?T.accent:T.border}`,background:a?T.accent+"12":"transparent",color:a?T.accent:T.muted,cursor:"pointer",textAlign:"left",borderLeft:`3px solid ${a?T.accent:"transparent"}`}}>{t.label}</button>);})}</div>
                <div style={{flex:1,overflow:"auto",padding:"14px"}}>
                  {activeTab==="general"&&(<div style={{display:"flex",flexDirection:"column",gap:12}}>
                    {/* Service Request Overview */}
                    <div style={{...panel({padding:"14px"})}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                        <span style={{fontSize:13,fontWeight:700,color:T.text}}>Service Request Overview</span>
                        <span style={{fontSize:11,fontWeight:600,padding:"4px 12px",borderRadius:24,background:"rgba(59,130,246,.12)",color:"#3b82f6",border:"1px solid rgba(59,130,246,.25)"}}>Total: {SR_TOTAL}</span>
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
                        <div>
                          <div style={{fontSize:12,fontWeight:600,color:T.muted,textAlign:"center",marginBottom:8}}>SR by Type of Request</div>
                          <div style={{display:"flex",alignItems:"center",gap:12}}>
                            <div style={{position:"relative",width:140,height:140,flexShrink:0}}>
                              <canvas id="srPie" style={{width:"100%",height:"100%"}} />
                            </div>
                            <div style={{flex:1,display:"flex",flexDirection:"column",gap:2}}>
                              {SR_BY_TYPE.map((s,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:4,fontSize:10}}>
                                <span style={{width:8,height:8,borderRadius:"50%",background:s.color,display:"inline-block",flexShrink:0}} />
                                <span style={{color:T.muted}}>{s.label}</span>
                                <span style={{marginLeft:"auto",color:T.text,fontWeight:600}}>{s.count}</span>
                              </div>))}
                            </div>
                          </div>
                        </div>
                        <div>
                          <div style={{fontSize:12,fontWeight:600,color:T.muted,textAlign:"center",marginBottom:8}}>SR Status Overview</div>
                          <div style={{display:"flex",alignItems:"center",gap:12}}>
                            <div style={{position:"relative",width:140,height:140,flexShrink:0}}>
                              <canvas id="srStatusPie" style={{width:"100%",height:"100%"}} />
                            </div>
                            <div style={{flex:1,display:"flex",flexDirection:"column",gap:2}}>
                              {SR_STATUS.map((s,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:4,fontSize:10}}>
                                <span style={{width:8,height:8,borderRadius:"50%",background:s.color,display:"inline-block",flexShrink:0}} />
                                <span style={{color:T.muted}}>{s.label}</span>
                                <span style={{marginLeft:"auto",color:T.text,fontWeight:600}}>{s.count}</span>
                              </div>))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* User Training Schedule */}
                    <div style={{...panel({padding:"14px",overflowX:"auto"})}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                        <span style={{fontSize:13,fontWeight:700,color:T.text}}>User Training Schedule {selectedYear}</span>
                        <div style={{display:"flex",gap:8}}>
                          <span style={{fontSize:11,fontWeight:600,padding:"4px 12px",borderRadius:24,background:"rgba(59,130,246,.12)",color:"#3b82f6",border:"1px solid rgba(59,130,246,.25)"}}>{trainingUpcoming} upcoming</span>
                          <span style={{fontSize:11,fontWeight:600,padding:"4px 12px",borderRadius:24,background:"rgba(34,197,94,.12)",color:"#22c55e",border:"1px solid rgba(34,197,94,.25)"}}>{trainingCompleted} completed</span>
                        </div>
                      </div>
                      <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                        <thead><tr style={{borderBottom:`2px solid ${T.border}`}}><th style={{padding:"12px 14px",textAlign:"left",color:T.muted,fontWeight:700,fontSize:10,textTransform:"uppercase",width:80}}>Field</th>{TRAINING_SCHEDULE.map(t=>{const isDec=t.month==="Dec";const dc=TRAINING_SCHEDULE.filter(x=>x.month==="Dec").length;const di=TRAINING_SCHEDULE.filter(x=>x.month==="Dec").indexOf(t);return(<th key={t.id} style={{padding:"12px 8px",textAlign:"center",color:t.status==="Completed"?"#22c55e":"#3b82f6",fontWeight:700,fontSize:11}}>{t.month}{isDec&&dc>1?` #${di+1}`:""}</th>);})}</tr></thead>
                        <tbody>
                          <tr style={{borderBottom:`1px solid ${T.border}`}}><td style={{padding:"12px 14px",color:T.muted,fontWeight:600,fontSize:10,textTransform:"uppercase"}}>Topic</td>{TRAINING_SCHEDULE.map(t=>(<td key={t.id} style={{padding:"12px 8px",textAlign:"center",color:T.text,fontWeight:500,lineHeight:1.4}}>{t.topic}</td>))}</tr>
                          <tr style={{borderBottom:`1px solid ${T.border}`,background:T.panel}}><td style={{padding:"12px 14px",color:T.muted,fontWeight:600,fontSize:10,textTransform:"uppercase"}}>Date</td>{TRAINING_SCHEDULE.map(t=>(<td key={t.id} style={{padding:"12px 8px",textAlign:"center",color:T.text,fontWeight:500}}>{t.date}</td>))}</tr>
                          <tr><td style={{padding:"12px 14px",color:T.muted,fontWeight:600,fontSize:10,textTransform:"uppercase"}}>Status</td>{TRAINING_SCHEDULE.map(t=>(<td key={t.id} style={{padding:"12px 8px",textAlign:"center"}}>{t.status==="Completed"?<span style={{display:"inline-flex",alignItems:"center",gap:5,padding:"4px 12px",borderRadius:24,fontSize:11,fontWeight:600,background:"rgba(34,197,94,.12)",color:"#22c55e",border:"1px solid rgba(34,197,94,.25)"}}><BIcon name="bi-check-circle-fill" size={12} color="#22c55e" /> Done</span>:<span style={{display:"inline-flex",alignItems:"center",gap:5,padding:"4px 12px",borderRadius:24,fontSize:11,fontWeight:600,background:"rgba(59,130,246,.12)",color:"#3b82f6",border:"1px solid rgba(59,130,246,.25)"}}><BIcon name="bi-arrow-up-circle-fill" size={12} color="#3b82f6" /> Upcoming</span>}</td>))}</tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Calibration Due + Licence Expiring */}
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                      <div style={{...panel({padding:"14px"})}}><div style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:8}}>Calibration Due</div><table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}><thead><tr style={{borderBottom:`2px solid ${T.border}`}}>{["No","Category","Expiry","Days"].map(h=><th key={h} style={{padding:"8px 10px",textAlign:"left",color:T.muted,fontWeight:600,fontSize:10,textTransform:"uppercase"}}>{h}</th>)}</tr></thead><tbody>{CALIBRATION_DATA.map((l,i)=>(<tr key={i} style={{borderBottom:`1px solid ${T.border}`}}><td style={{padding:"8px 10px",color:T.muted}}>{l.no}</td><td style={{padding:"8px 10px",color:T.text,fontWeight:500}}>{l.category}</td><td style={{padding:"8px 10px",color:T.text}}>{l.expiry}</td><td style={{padding:"8px 10px"}}><DaysBadge days={l.daysLeft} /></td></tr>))}</tbody></table></div>
                      <div style={{...panel({padding:"14px"})}}><div style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:8}}>Licence Expiring</div><table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}><thead><tr style={{borderBottom:`2px solid ${T.border}`}}>{["No","Category","Expiry","Days"].map(h=><th key={h} style={{padding:"8px 10px",textAlign:"left",color:T.muted,fontWeight:600,fontSize:10,textTransform:"uppercase"}}>{h}</th>)}</tr></thead><tbody>{LICENSE_DATA.map((l,i)=>(<tr key={i} style={{borderBottom:`1px solid ${T.border}`}}><td style={{padding:"8px 10px",color:T.muted}}>{l.no}</td><td style={{padding:"8px 10px",color:T.text,fontWeight:500}}>{l.category}</td><td style={{padding:"8px 10px",color:T.text}}>{l.expiry}</td><td style={{padding:"8px 10px"}}><DaysBadge days={l.daysLeft} /></td></tr>))}</tbody></table></div>
                    </div>
                  </div>)}
                  {activeTab==="assetStatus"&&(<div style={{display:"flex",flexDirection:"column",gap:12}}><div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>{[{l:"Total",v:TOTAL_ASSETS.toLocaleString(),c:T.accent},{l:"Active",v:ASSET_ACTIVE.toLocaleString(),c:"#22c55e"},{l:"Inactive",v:ASSET_INACTIVE.toLocaleString(),c:"#ef4444"}].map((s,i)=>(<div key={i} style={{...panel({padding:"12px",textAlign:"center"})}}><div style={{fontSize:10,color:T.muted,textTransform:"uppercase",marginBottom:4}}>{s.l}</div><div style={{fontSize:24,fontWeight:800,color:s.c}}>{s.v}</div></div>))}</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,flex:1}}><div style={{...panel({padding:"12px"})}}><div style={{fontSize:12,color:T.muted,marginBottom:8}}>{HOSPITAL_NAME}</div><div style={{display:"flex",alignItems:"center",gap:12,height:200}}><div style={{position:"relative",width:160,height:160,flexShrink:0}}><canvas id="assetPie" style={{width:"100%",height:"100%"}} /></div><div style={{flex:1}}><Badge color="green" T={T}>Active: {ASSET_ACTIVE}</Badge><div style={{marginTop:10}}><Badge color="danger" T={T}>Inactive: {ASSET_INACTIVE}</Badge></div></div></div></div><div style={{...panel({padding:"12px"})}}><div style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:8}}>Asset by Type</div><div style={{position:"relative",height:240}}><canvas id="assetBar" style={{width:"100%",height:"100%"}} /></div></div></div></div>)}
                  {activeTab==="assetLifespan"&&(<div style={{display:"flex",flexDirection:"column",gap:12}}>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
                      <div style={{...panel({padding:"12px",textAlign:"center"})}}><div style={{fontSize:10,color:T.muted,textTransform:"uppercase",marginBottom:4}}>Total Assets</div><div style={{fontSize:24,fontWeight:800,color:T.accent}}>{TOTAL_ASSETS}</div></div>
                      <div style={{...panel({padding:"12px",textAlign:"center"})}}><div style={{fontSize:10,color:T.muted,textTransform:"uppercase",marginBottom:4}}>Within Lifespan</div><div style={{fontSize:24,fontWeight:800,color:"#22c55e"}}>{ASSET_LIFESPAN.withinLifespan}</div></div>
                      <div style={{...panel({padding:"12px",textAlign:"center"})}}><div style={{fontSize:10,color:T.muted,textTransform:"uppercase",marginBottom:4}}>Exceed Lifespan</div><div style={{fontSize:24,fontWeight:800,color:"#ef4444"}}>{ASSET_LIFESPAN.exceedLifespan}</div></div>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,flex:1}}>
                      <div style={{...panel({padding:"12px"})}}>
                        <div style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:8,textAlign:"center"}}>Asset Aging</div>
                        <div style={{position:"relative",height:220}}><canvas id="assetLifespanPie" style={{width:"100%",height:"100%"}} /></div>
                      </div>
                      <div style={{...panel({padding:"12px"})}}>
                        <div style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:8,textAlign:"center"}}>Lifespan Status</div>
                        <div style={{position:"relative",height:220}}><canvas id="assetLifespanDonut" style={{width:"100%",height:"100%"}} /></div>
                      </div>
                      <div style={{...panel({padding:"12px"})}}>
                        <div style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:8,textAlign:"center"}}>Service by Group (Aging)</div>
                        <div style={{position:"relative",height:220}}><canvas id="assetServiceBar" style={{width:"100%",height:"100%"}} /></div>
                      </div>
                    </div>
                  </div>)}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div style={{width:300,flexShrink:0,display:"flex",flexDirection:"column",gap:14,overflow:"hidden"}}>
            {/* Deduction by Indicator — FEMS-style compact legend under chart */}
            <div style={{...card({display:"flex",flexDirection:"column",minHeight:0,overflow:"hidden"}),flex:1}}>
              <div style={{padding:"14px 16px",borderBottom:`1px solid ${T.border}`,flexShrink:0,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div><div style={{fontSize:14,fontWeight:700,color:T.text}}>Deduction by Indicator</div><div style={{fontSize:10,color:T.muted}}>{startDate} to {endDate}</div></div>
                <button className="no-print" onClick={()=>openModal("deduction")} style={{background:T.panel,border:`1px solid ${T.border}`,color:T.muted,width:28,height:28,borderRadius:7,cursor:"pointer",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center"}}><BIcon name="bi-arrows-angle-expand" size={13} color={T.muted} /></button>
              </div>
              <div style={{padding:"10px 14px",borderBottom:`1px solid ${T.border}`,display:"flex",gap:16,flexShrink:0}}>
                <div style={{textAlign:"center",flex:1}}><div style={{fontSize:10,color:T.muted}}>% Deduction</div><div style={{fontSize:18,fontWeight:800,color:"#ef4444"}}>{OVERALL_DEDUCTION}%</div></div>
                <div style={{width:1,background:T.border}} />
                <div style={{textAlign:"center",flex:1}}><div style={{fontSize:10,color:T.muted}}>Total</div><div style={{fontSize:18,fontWeight:800,color:"#22c55e"}}>RM {B_DEDUCTIONS.reduce((a,b)=>a+b,0).toFixed(0)}</div></div>
              </div>
              <div style={{flex:1,padding:"12px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:0}}>
                <div style={{position:"relative",width:"100%",flex:1,minHeight:0}}>
                  <canvas id="deductIndicatorPie" style={{position:"absolute",inset:0,width:"100%",height:"100%"}} />
                </div>
                <div style={{display:"flex",flexWrap:"wrap",gap:"6px 14px",justifyContent:"center",paddingTop:10,flexShrink:0}}>
                  {B_LABELS.map((l,i)=>(
                    <div key={l} style={{display:"flex",alignItems:"center",gap:5}}>
                      <div style={{width:8,height:8,borderRadius:"50%",background:B_COLORS[i],flexShrink:0}} />
                      <span style={{fontSize:10,color:T.muted,fontWeight:600}}>{l}</span>
                      <span style={{fontSize:10,color:T.text,fontWeight:700}}>{B_VALUES[i].toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SR MODAL — FEMS-style compact stat grid */}
        {modal==="sr"&&(<Modal title="Service Request" onClose={()=>setModal(null)} T={T} onExport={()=>exportModalData("sr","",null)} onPrint={printPage}>
          <FilterRow year={modalYear} setYear={setModalYear} month={modalMonth} setMonth={setModalMonth} startDate={modalStartDate} setStartDate={setModalStartDate} endDate={modalEndDate} setEndDate={setModalEndDate} T={T} />
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:20}}>
            <MiniStat label="Total" value={SR_TOTAL.toLocaleString()} color={T.accent} T={T} />
            <MiniStat label="Normal" value={SR_NORMAL.toLocaleString()} color={T.success} T={T} />
            <MiniStat label="Outstanding" value={SR_OUTSTANDING.toLocaleString()} color={T.warn} T={T} />
            <MiniStat label="Done" value={SR_DONE.toLocaleString()} color={T.success} T={T} />
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:20}}>
            <div>
              <div style={{fontSize:12,fontWeight:600,color:T.muted,textAlign:"center",marginBottom:8}}>SR by Type of Request</div>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{position:"relative",width:140,height:140,flexShrink:0}}><canvas id="modalSRPie" style={{width:"100%",height:"100%"}} /></div>
                <div style={{flex:1,display:"flex",flexDirection:"column",gap:2}}>
                  {SR_BY_TYPE.map((s,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:4,fontSize:10}}>
                    <span style={{width:8,height:8,borderRadius:"50%",background:s.color,display:"inline-block",flexShrink:0}} />
                    <span style={{color:T.muted}}>{s.label}</span>
                    <span style={{marginLeft:"auto",color:T.text,fontWeight:600}}>{s.count}</span>
                  </div>))}
                </div>
              </div>
            </div>
            <div>
              <div style={{fontSize:12,fontWeight:600,color:T.muted,textAlign:"center",marginBottom:8}}>SR Status Overview</div>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{position:"relative",width:140,height:140,flexShrink:0}}><canvas id="modalSRStatusPie" style={{width:"100%",height:"100%"}} /></div>
                <div style={{flex:1,display:"flex",flexDirection:"column",gap:2}}>
                  {SR_STATUS.map((s,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:4,fontSize:10}}>
                    <span style={{width:8,height:8,borderRadius:"50%",background:s.color,display:"inline-block",flexShrink:0}} />
                    <span style={{color:T.muted}}>{s.label}</span>
                    <span style={{marginLeft:"auto",color:T.text,fontWeight:600}}>{s.count}</span>
                  </div>))}
                </div>
              </div>
            </div>
          </div>
        </Modal>)}

        {/* NCR MODAL — FEMS-style compact stat grid */}
        {modal==="ncr"&&(<Modal title="NCR" onClose={()=>setModal(null)} T={T} onExport={()=>exportModalData("ncr","",null)} onPrint={printPage}>
          <FilterRow year={modalYear} setYear={setModalYear} month={modalMonth} setMonth={setModalMonth} startDate={modalStartDate} setStartDate={setModalStartDate} endDate={modalEndDate} setEndDate={setModalEndDate} T={T} />
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:20}}>
            <MiniStat label="Total" value={NCR_TOTAL} color={T.warn} T={T} />
            <MiniStat label={`Open (${((NCR_OPEN/NCR_TOTAL)*100).toFixed(1)}%)`} value={NCR_OPEN} color={T.danger} T={T} />
            <MiniStat label={`Closed (${((NCR_CLOSED/NCR_TOTAL)*100).toFixed(1)}%)`} value={NCR_CLOSED} color={T.success} T={T} />
            <MiniStat label="Closure Rate" value={NCR_CLOSURE_RATE+"%"} color={T.accent} T={T} />
          </div>
          <div>
            <div style={{fontSize:12,fontWeight:600,color:T.muted,marginBottom:8}}>NCR Open by Month</div>
            <div style={{position:"relative",height:340,width:"100%"}}><canvas id="modalNCRMonthly" style={{width:"100%",height:"100%"}} /></div>
          </div>
        </Modal>)}

        {/* DEDUCTION MODAL */}
        {modal==="deduction"&&(<Modal title="Deduction by Indicator" onClose={()=>setModal(null)} T={T} onExport={()=>exportModalData("deduction",modalDeductYear,null)} onPrint={printPage}><FilterRow year={modalDeductYear} setYear={setModalDeductYear} month={modalMonth} setMonth={setModalMonth} startDate={modalStartDate} setStartDate={setModalStartDate} endDate={modalEndDate} setEndDate={setModalEndDate} showMonth={false} T={T} /><StatCards data={[{v:OVERALL_DEDUCTION+"%",l:"% Deduction",c:"#ef4444"},{v:"7",l:"Indicators",c:T.accent},{v:"RM 1,200",l:"Total Deduction",c:T.danger},{v:"B11",l:"Highest",c:"#ef4444"}]} T={T} /><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:20}}><div><div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:12}}>% by Indicator</div><div style={{position:"relative",height:300}}><canvas id="modalDeductBar" style={{width:"100%",height:"100%"}} /></div></div><div><div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:12}}>% Deduction Trend ({modalDeductYear})</div><div style={{position:"relative",height:300}}><canvas id="modalDeductLine" style={{width:"100%",height:"100%"}} /></div></div></div><table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}><thead><tr>{["Indicator","%","Deduction (RM)"].map(h=><th key={h} style={{background:T.accent+"10",color:T.accent,padding:"10px 12px",textAlign:"left",fontWeight:700,fontSize:12,borderBottom:`2px solid ${T.border}`}}>{h}</th>)}</tr></thead><tbody>{B_LABELS.map((l,i)=>(<tr key={l}><td style={{padding:"10px 12px",borderBottom:`1px solid ${T.border}`,color:B_COLORS[i],fontWeight:600}}>{l}</td><td style={{padding:"10px 12px",borderBottom:`1px solid ${T.border}`,color:T.text}}>{B_VALUES[i].toFixed(2)}%</td><td style={{padding:"10px 12px",borderBottom:`1px solid ${T.border}`,color:B_DEDUCTIONS[i]>0?T.danger:T.success,fontWeight:600}}>RM {B_DEDUCTIONS[i].toFixed(2)}</td></tr>))}</tbody></table></Modal>)}

        {/* FINANCE MODAL */}
        {/* UNSCHEDULE MODAL — FEMS-style compact stat grid at top */}
        {modal==="unschedule"&&(<Modal title="Unschedule Work Order" onClose={()=>setModal(null)} T={T} onExport={()=>exportModalData("unschedule",modalYear,()=>getUnschedData)} onPrint={printPage}>
          <FilterRow year={modalYear} setYear={setModalYear} month={modalMonth} setMonth={setModalMonth} startDate={modalStartDate} setStartDate={setModalStartDate} endDate={modalEndDate} setEndDate={setModalEndDate} T={T} />
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:8,marginBottom:20}}>
            <MiniStat label="Total" value={UNSCHEDULE_TOTAL} color="#3b82f6" T={T} />
            <MiniStat label="Open" value={UNSCHEDULE_STATUS_TOTALS.open} color="#ef4444" T={T} />
            <MiniStat label="WIP" value={UNSCHEDULE_STATUS_TOTALS.wip} color="#f97316" T={T} />
            <MiniStat label="Completed" value={UNSCHEDULE_STATUS_TOTALS.completed} color="#22c55e" T={T} />
            <MiniStat label="Cancel" value={UNSCHEDULE_STATUS_TOTALS.cancel} color="#9ca3af" T={T} />
            <MiniStat label="Req. Cancel" value={UNSCHEDULE_STATUS_TOTALS.rfCancel} color="#eab308" T={T} />
            <MiniStat label="Not Done" value={UNSCHEDULE_STATUS_TOTALS.notDoneClosed} color="#8b5cf6" T={T} />
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20}}>{UNSCHEDULE_CATEGORIES.map((cat,i)=>{const st=["open","wip","completed","cancel","rfCancel","notDoneClosed"].map(k=>({k,v:(cat as any)[k]||0})).filter(s=>s.v>0);return(<div key={cat.key} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:"12px 14px"}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}><span style={{fontSize:13,fontWeight:700,textTransform:"uppercase",color:cat.color}}>{cat.label}</span><span style={{fontSize:11,color:T.muted,marginLeft:"auto"}}>Total: <strong style={{color:T.text}}>{cat.total}</strong></span></div><div style={{display:"flex",alignItems:"center",gap:12}}><div style={{position:"relative",width:80,height:80,flexShrink:0}}><canvas id={`unschedCatPie${i}`} width={80} height={80} style={{width:80,height:80}} /></div><div style={{flex:1,display:"flex",flexDirection:"column",gap:4}}>{st.map(s=>{const pct=Math.round((s.v/cat.total)*100);return(<div key={s.k} style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div style={{display:"flex",alignItems:"center",gap:6}}><span style={{width:7,height:7,borderRadius:"50%",background:STATUS_COLORS[s.k],display:"inline-block"}} /><span style={{fontSize:11,color:T.muted}}>{STATUS_LABELS[s.k]}</span></div><div><span style={{fontSize:12,fontWeight:600,color:STATUS_COLORS[s.k]}}>{s.v}</span><span style={{fontSize:10,color:T.muted,marginLeft:6}}>({pct}%)</span></div></div>);})}</div></div></div>);})}</div>
          <div><div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:12}}>Unschedule WO by Month — {modalYear}</div><div style={{position:"relative",height:300}}><canvas id="modalUnschedStacked" style={{width:"100%",height:"100%"}} /></div><div style={{display:"flex",flexWrap:"wrap",gap:14,marginTop:8}}>{[{l:"Completed Within Schedule",c:"#22c55e"},{l:"Completed Not to Schedule",c:"#f97316"},{l:"Remaining",c:"#3b82f6"},{l:"Not Done",c:"#ef4444"}].map(l=>(<div key={l.l} style={{display:"flex",alignItems:"center",gap:4,fontSize:11,color:T.muted}}><span style={{width:8,height:8,borderRadius:2,background:l.c,display:"inline-block"}} />{l.l}</div>))}</div></div>
        </Modal>)}

        {/* SCHEDULE MODAL — FEMS-style compact stat grid at top */}
        {modal==="schedule"&&(<Modal title="Schedule Work Order" onClose={()=>setModal(null)} T={T} onExport={()=>exportModalData("schedule",modalYear,()=>getSchedData)} onPrint={printPage}>
          <FilterRow year={modalYear} setYear={setModalYear} month={modalMonth} setMonth={setModalMonth} startDate={modalStartDate} setStartDate={setModalStartDate} endDate={modalEndDate} setEndDate={setModalEndDate} T={T} />
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:8,marginBottom:20}}>
            <MiniStat label="Total" value={SCHEDULE_TOTAL} color="#3b82f6" T={T} />
            <MiniStat label="Open" value={SCHEDULE_STATUS_TOTALS.open} color="#ef4444" T={T} />
            <MiniStat label="WIP" value={SCHEDULE_STATUS_TOTALS.wip} color="#f97316" T={T} />
            <MiniStat label="Completed" value={SCHEDULE_STATUS_TOTALS.completed} color="#22c55e" T={T} />
            <MiniStat label="Cancel" value={SCHEDULE_STATUS_TOTALS.cancel} color="#9ca3af" T={T} />
            <MiniStat label="Req. Cancel" value={SCHEDULE_STATUS_TOTALS.rfCancel} color="#eab308" T={T} />
            <MiniStat label="Not Done" value={SCHEDULE_STATUS_TOTALS.notDoneClosed} color="#8b5cf6" T={T} />
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20}}>{SCHEDULE_CATEGORIES.map((cat,i)=>{const st=["open","wip","completed","cancel","rfCancel","notDoneClosed"].map(k=>({k,v:(cat as any)[k]||0})).filter(s=>s.v>0);return(<div key={cat.key} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:"12px 14px"}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}><span style={{fontSize:13,fontWeight:700,textTransform:"uppercase",color:cat.color}}>{cat.label}</span><span style={{fontSize:11,color:T.muted,marginLeft:"auto"}}>Total: <strong style={{color:T.text}}>{cat.total}</strong></span></div><div style={{display:"flex",alignItems:"center",gap:12}}><div style={{position:"relative",width:80,height:80,flexShrink:0}}><canvas id={`schedCatPie${i}`} width={80} height={80} style={{width:80,height:80}} /></div><div style={{flex:1,display:"flex",flexDirection:"column",gap:4}}>{st.map(s=>{const pct=Math.round((s.v/cat.total)*100);return(<div key={s.k} style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div style={{display:"flex",alignItems:"center",gap:6}}><span style={{width:7,height:7,borderRadius:"50%",background:STATUS_COLORS[s.k],display:"inline-block"}} /><span style={{fontSize:11,color:T.muted}}>{STATUS_LABELS[s.k]}</span></div><div><span style={{fontSize:12,fontWeight:600,color:STATUS_COLORS[s.k]}}>{s.v}</span><span style={{fontSize:10,color:T.muted,marginLeft:6}}>({pct}%)</span></div></div>);})}</div></div></div>);})}</div>
          <div><div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:12}}>Schedule WO by Month — {modalYear}</div><div style={{position:"relative",height:300}}><canvas id="modalSchedStacked" style={{width:"100%",height:"100%"}} /></div><div style={{display:"flex",flexWrap:"wrap",gap:14,marginTop:8}}>{[{l:"Completed Within Schedule",c:"#22c55e"},{l:"Completed Not to Schedule",c:"#f97316"},{l:"Remaining",c:"#3b82f6"},{l:"Not Done",c:"#ef4444"}].map(l=>(<div key={l.l} style={{display:"flex",alignItems:"center",gap:4,fontSize:11,color:T.muted}}><span style={{width:8,height:8,borderRadius:2,background:l.c,display:"inline-block"}} />{l.l}</div>))}</div></div>
        </Modal>)}
      </>)}
    </div>
  );
}