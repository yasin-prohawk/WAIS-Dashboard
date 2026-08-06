"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import Link from "next/link";
import { useDashboardNav } from "@/components/dashboard-nav-provider";

declare global { interface Window { Chart: any; XLSX: any; } }

/* ─── FEMS DATA ─────────────────────────────────── */
const FINM = ["Jul '25","Aug '25","Sep '25","Oct '25","Nov '25","Dec '25"];
const MONTHS_12 = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const SR_TOTAL = 716;
const SR_NORMAL = 716;
const SR_CRITICAL = 0;
const SR_OUTSTANDING = 716;
const SR_DONE = 392;

const SR_BY_TYPE = [
  { label: "Additional Work (AW)", count: 98, percentage: 15.1, color: "#007BFF" },
  { label: "Advisory Services (TA)", count: 72, percentage: 11.1, color: "#22c55e" },
  { label: "Incident (IR)", count: 62, percentage: 9.6, color: "#ef4444" },
  { label: "BER", count: 37, percentage: 5.7, color: "#eab308" },
  { label: "Non-conformance (NCR)", count: 62, percentage: 9.6, color: "#86efac" },
  { label: "T&C", count: 81, percentage: 12.5, color: "#15803d" },
  { label: "Unschedule Maintenance", count: 115, percentage: 17.8, color: "#60a5fa" },
  { label: "User Request", count: 143, percentage: 22.1, color: "#1e40af" },
  { label: "User Training", count: 46, percentage: 7.1, color: "#b91c1c" },
];

// SR Status by Category with Open/Closed counts
const SR_STATUS_BY_CATEGORY = [
  { label: "Additional Work", open: 4, closed: 94, total: 98, color: "#007BFF" },
  { label: "Advisory Services", open: 3, closed: 69, total: 72, color: "#22c55e" },
  { label: "Incident (IR)", open: 5, closed: 57, total: 62, color: "#ef4444" },
  { label: "BER", open: 2, closed: 35, total: 37, color: "#eab308" },
  { label: "Non-conformance", open: 8, closed: 54, total: 62, color: "#86efac" },
  { label: "T&C", open: 6, closed: 75, total: 81, color: "#15803d" },
  { label: "Unschedule Maintenance", open: 10, closed: 105, total: 115, color: "#60a5fa" },
  { label: "User Request", open: 12, closed: 131, total: 143, color: "#1e40af" },
  { label: "User Training", open: 4, closed: 42, total: 46, color: "#b91c1c" },
];

const NCR_TOTAL = 156;
const NCR_OPEN = 89;
const NCR_CLOSED = 67;
const NCR_CLOSURE_RATE = 42.9;

const OVERALL_DEDUCTION = 8.93;
const DEDUCTION_BY_MONTH = [9.12, 8.45, 7.98, 9.30, 8.65, 8.93];
const DEDUCTION_2024 = [8.50, 7.80, 8.20, 8.90, 8.10, 8.40];
const DEDUCTION_2026 = [9.20, 9.00, 9.40, 8.80, 9.60, 9.00];

const F_LABELS = ["F6","F7","F8","F9","F10","F11","F12","F13","F14"];
const F_VALUES = [5.12, 8.45, 3.67, 6.89, 4.23, 42.10, 12.34, 9.56, 7.64];
const F_COLORS = ["#007BFF","#6F42C1","#00CCCC","#17A2B8","#0DCAF0","#ef4444","#f97316","#FFB703","#22c55e"];
const F_DEDUCTIONS = [0, 0, 0, 0, 0, 1841.37, 0, 0, 0];

const ASSET_ACTIVE = 1048;
const ASSET_INACTIVE = 673;
const TOTAL_ASSETS = 1721;
const HOSPITAL_NAME = "Hospital: Grik (PRK333)";

const ASSET_BY_TYPE = [
  { type: "Equipment", active: 450, inactive: 180 },
  { type: "Building Systems", active: 280, inactive: 95 },
  { type: "Vehicles", active: 120, inactive: 45 },
  { type: "Location", active: 98, inactive: 210 },
  { type: "Land", active: 60, inactive: 15 },
  { type: "System", active: 40, inactive: 128 },
];

const ASSET_UPTIME = [98.5, 98.8, 97.9, 99.1, 98.3, 98.7, 99.0, 97.5, 98.2, 98.9, 97.8, 98.4];

const TRAINING_SCHEDULE = [
  { id:"TR-01", topic:"Fire Safety & Emergency Response",   month:"Feb", date:"2026-02-18", status:"Completed" },
  { id:"TR-02", topic:"PPE & Chemical Handling",            month:"Apr", date:"2026-04-08", status:"Upcoming" },
  { id:"TR-03", topic:"HVAC Preventive Maintenance",        month:"Jun", date:"2026-06-03", status:"Upcoming" },
  { id:"TR-04", topic:"Plumbing & Sanitary Systems",        month:"Aug", date:"2026-08-05", status:"Upcoming" },
  { id:"TR-05", topic:"Generator & Switchgear Maintenance", month:"Oct", date:"2026-10-07", status:"Upcoming" },
  { id:"TR-06", topic:"Year-End Safety Review",             month:"Dec", date:"2026-12-02", status:"Upcoming" },
  { id:"TR-07", topic:"Asset Compliance & Documentation",   month:"Dec", date:"2026-12-16", status:"Upcoming" },
];

const LICENSE_DATA = [
  { no:"LIC-081", category:"Electrical Wiring",    expiry:"2026-03-10", daysLeft:13 },
  { no:"LIC-047", category:"Lift Maintenance",      expiry:"2026-03-25", daysLeft:28 },
  { no:"LIC-112", category:"Pressure Vessel (BKP)", expiry:"2026-04-05", daysLeft:39 },
  { no:"LIC-033", category:"Fire Protection Works", expiry:"2026-04-15", daysLeft:49 },
  { no:"LIC-088", category:"Air Cond & Mech Vent",  expiry:"2026-04-22", daysLeft:56 },
];

// Unschedule Categories with M/E/C breakdown including Critical/Normal
const UNSCHEDULE_CATEGORIES = [
  { 
    key: "breakdown", 
    label: "Breakdown", 
    color: "#ef4444", 
    total: 142, 
    open: 18, 
    wip: 12, 
    completed: 98, 
    cancel: 8, 
    rfCancel: 3, 
    notDoneClosed: 3,
    groups: [
      { group: "Mechanical", open: 8, wip: 5, completed: 45, cancel: 3, notDoneClosed: 1, critical: 20, normal: 42 },
      { group: "Electrical", open: 6, wip: 4, completed: 32, cancel: 3, notDoneClosed: 1, critical: 18, normal: 28 },
      { group: "Civil", open: 4, wip: 3, completed: 21, cancel: 2, notDoneClosed: 1, critical: 12, normal: 22 },
    ]
  },
  { 
    key: "corrective", 
    label: "Corrective", 
    color: "#f97316", 
    total: 185, 
    open: 24, 
    wip: 18, 
    completed: 128, 
    cancel: 10, 
    rfCancel: 2, 
    notDoneClosed: 3,
    groups: [
      { group: "Mechanical", open: 10, wip: 8, completed: 55, cancel: 4, notDoneClosed: 1, critical: 25, normal: 58 },
      { group: "Electrical", open: 8, wip: 6, completed: 42, cancel: 3, notDoneClosed: 1, critical: 20, normal: 40 },
      { group: "Civil", open: 6, wip: 4, completed: 31, cancel: 3, notDoneClosed: 1, critical: 15, normal: 32 },
    ]
  },
  { 
    key: "proactive", 
    label: "Proactive", 
    color: "#3b82f6", 
    total: 64, 
    open: 5, 
    wip: 4, 
    completed: 51, 
    cancel: 3, 
    rfCancel: 1, 
    notDoneClosed: 0,
    groups: [
      { group: "Mechanical", open: 2, wip: 2, completed: 22, cancel: 1, notDoneClosed: 0, critical: 8, normal: 20 },
      { group: "Electrical", open: 2, wip: 1, completed: 17, cancel: 1, notDoneClosed: 0, critical: 6, normal: 16 },
      { group: "Civil", open: 1, wip: 1, completed: 12, cancel: 1, notDoneClosed: 0, critical: 5, normal: 11 },
    ]
  },
  { 
    key: "warranty", 
    label: "Warranty", 
    color: "#8b5cf6", 
    total: 21, 
    open: 3, 
    wip: 2, 
    completed: 14, 
    cancel: 1, 
    rfCancel: 0, 
    notDoneClosed: 1,
    groups: [
      { group: "Mechanical", open: 1, wip: 1, completed: 6, cancel: 0, notDoneClosed: 0, critical: 3, normal: 6 },
      { group: "Electrical", open: 1, wip: 1, completed: 5, cancel: 1, notDoneClosed: 0, critical: 2, normal: 6 },
      { group: "Civil", open: 1, wip: 0, completed: 3, cancel: 0, notDoneClosed: 1, critical: 1, normal: 3 },
    ]
  },
];
const UNSCHEDULE_TOTAL = 412;
const UNSCHEDULE_OPEN = 50;
const UNSCHEDULE_COMPLETED = 291;

// Schedule Categories with M/E/C breakdown
const SCHEDULE_CATEGORIES = [
  { 
    key: "ppm", 
    label: "PPM", 
    color: "#3b82f6", 
    total: 124, 
    open: 10, 
    wip: 8, 
    completed: 58, 
    cancel: 4, 
    rfCancel: 1, 
    notDoneClosed: 1,
    groups: [
      { group: "Mechanical", open: 10, wip: 8, completed: 58, cancel: 4, notDoneClosed: 1 },
      { group: "Electrical", open: 10, wip: 8, completed: 58, cancel: 4, notDoneClosed: 1 },
      { group: "Civil", open: 10, wip: 8, completed: 58, cancel: 4, notDoneClosed: 1 },
    ]
  },
  { 
    key: "ri", 
    label: "RI", 
    color: "#22c55e", 
    total: 87, 
    open: 7, 
    wip: 5, 
    completed: 43, 
    cancel: 3, 
    rfCancel: 1, 
    notDoneClosed: 0,
    groups: [
      { group: "Mechanical", open: 7, wip: 5, completed: 43, cancel: 3, notDoneClosed: 0 },
      { group: "Electrical", open: 7, wip: 5, completed: 43, cancel: 3, notDoneClosed: 0 },
      { group: "Civil", open: 7, wip: 5, completed: 43, cancel: 3, notDoneClosed: 0 },
    ]
  },
  { 
    key: "scm", 
    label: "SCM", 
    color: "#f97316", 
    total: 63, 
    open: 5, 
    wip: 4, 
    completed: 32, 
    cancel: 3, 
    rfCancel: 1, 
    notDoneClosed: 0,
    groups: [
      { group: "Mechanical", open: 5, wip: 4, completed: 32, cancel: 3, notDoneClosed: 0 },
      { group: "Electrical", open: 5, wip: 4, completed: 32, cancel: 3, notDoneClosed: 0 },
      { group: "Civil", open: 5, wip: 4, completed: 32, cancel: 3, notDoneClosed: 0 },
    ]
  },
];
const SCHEDULE_TOTAL = 274;
const SCHEDULE_OPEN = 22;
const SCHEDULE_COMPLETED = 133;

// Monthly data with WO priority (Critical/Normal) - Unschedule
const UNSCHEDULE_MONTHLY_DATA = [
  { month: "Jan '25", totalGenerated: 45, closed: 30, inProgress: 15, critical: 12, normal: 33 },
  { month: "Feb '25", totalGenerated: 38, closed: 25, inProgress: 13, critical: 10, normal: 28 },
  { month: "Mar '25", totalGenerated: 52, closed: 35, inProgress: 17, critical: 15, normal: 37 },
  { month: "Apr '25", totalGenerated: 48, closed: 32, inProgress: 16, critical: 14, normal: 34 },
  { month: "May '25", totalGenerated: 55, closed: 38, inProgress: 17, critical: 16, normal: 39 },
  { month: "Jun '25", totalGenerated: 50, closed: 34, inProgress: 16, critical: 13, normal: 37 },
  { month: "Jul '25", totalGenerated: 44, closed: 30, inProgress: 14, critical: 11, normal: 33 },
  { month: "Aug '25", totalGenerated: 40, closed: 28, inProgress: 12, critical: 10, normal: 30 },
  { month: "Sep '25", totalGenerated: 46, closed: 32, inProgress: 14, critical: 13, normal: 33 },
  { month: "Oct '25", totalGenerated: 43, closed: 29, inProgress: 14, critical: 12, normal: 31 },
  { month: "Nov '25", totalGenerated: 42, closed: 28, inProgress: 14, critical: 11, normal: 31 },
  { month: "Dec '25", totalGenerated: 39, closed: 26, inProgress: 13, critical: 10, normal: 29 },
];

// Monthly data for Schedule
const SCHEDULE_MONTHLY_DATA = [
  { month: "Jan '25", totalGenerated: 620, closed: 590, inProgress: 30 },
  { month: "Feb '25", totalGenerated: 450, closed: 430, inProgress: 20 },
  { month: "Mar '25", totalGenerated: 590, closed: 560, inProgress: 30 },
  { month: "Apr '25", totalGenerated: 720, closed: 680, inProgress: 40 },
  { month: "May '25", totalGenerated: 520, closed: 490, inProgress: 30 },
  { month: "Jun '25", totalGenerated: 580, closed: 550, inProgress: 30 },
  { month: "Jul '25", totalGenerated: 620, closed: 590, inProgress: 30 },
  { month: "Aug '25", totalGenerated: 580, closed: 560, inProgress: 20 },
  { month: "Sep '25", totalGenerated: 560, closed: 540, inProgress: 20 },
  { month: "Oct '25", totalGenerated: 540, closed: 520, inProgress: 20 },
  { month: "Nov '25", totalGenerated: 520, closed: 500, inProgress: 20 },
  { month: "Dec '25", totalGenerated: 480, closed: 460, inProgress: 20 },
];

// Yearly summary data for Unschedule
const UNSCHEDULE_YEARLY_SUMMARY = {
  totalGenerated: 542,
  closed: 367,
  inProgress: 175,
  critical: 147,
  normal: 395,
};

// Yearly summary data for Schedule
const SCHEDULE_YEARLY_SUMMARY = {
  totalGenerated: 6791,
  closed: 6455,
  inProgress: 336,
};

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

const FEMS_TABS = [
  { key:"general", label:"General" },
  { key:"assetStatus", label:"Asset Status" },
  { key:"assetLifespan", label:"Asset Lifespan" },
  { key:"assetMaintenance", label:"Asset Maintenance" },
  { key:"assetUptime", label:"Asset Uptime" },
  { key:"eodPerformance", label:"EOD Performance" },
  { key:"manpower", label:"Manpower Assignment" },
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
function mkStackedBarChart(id:string,labels:string[],datasets:any[],T:Theme,horizontal?:boolean){
  drawChart(id,"bar",{labels,datasets:datasets.map((d:any)=>({...d,borderRadius:4}))},{indexAxis:horizontal?"y":"x",plugins:{legend:{display:false}},scales:{x:{stacked:true,grid:{color:T.gridColor},ticks:{color:T.tickColor,font:{size:11}},border:{color:"transparent"}},y:{stacked:true,grid:{color:T.gridColor},ticks:{color:T.tickColor,font:{size:11}},border:{color:"transparent"}}}});
}
function mkGroupedBarChart(id:string, labels:string[], datasets:any[], T:Theme){
  drawChart(id,"bar",{labels,datasets:datasets.map((d:any)=>({...d,borderRadius:4,barPercentage:0.8,barThickness:20}))},{plugins:{legend:{display:true,labels:{color:T.muted,font:{size:10},boxWidth:10,padding:8}}},scales:{x:{grid:{color:T.gridColor},ticks:{color:T.tickColor,font:{size:10}},border:{color:"transparent"}},y:{grid:{color:T.gridColor},ticks:{color:T.tickColor,font:{size:10}},border:{color:"transparent"}}}});
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
    <div style={{background:T.panel,border:`1px solid ${T.border}`,borderRadius:20,padding:28,width:1300,maxHeight:"88vh",overflowY:"auto",boxShadow:"0 24px 60px rgba(0,0,0,.18)"}}>
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

/* ─── EXPORT ─────────────────────────────────────── */
function exportExcelAll(){if(!window.XLSX)return;const wb=window.XLSX.utils.book_new();[{name:"Summary",data:[["FEMS Dashboard"],["Metric","Value"],["Total SR",SR_TOTAL],["Total NCR",NCR_TOTAL],["Unschedule WO",UNSCHEDULE_TOTAL],["Schedule WO",SCHEDULE_TOTAL]]}].forEach(s=>{const ws=window.XLSX.utils.aoa_to_sheet(s.data);window.XLSX.utils.book_append_sheet(wb,ws,s.name);});window.XLSX.writeFile(wb,"FEMS_Dashboard_Export.xlsx");}
function exportModalData(modalId:string,yr:string,getData:any){
  if(!window.XLSX)return;let rows:any[][]=[];
  if(modalId==="unschedule"||modalId==="schedule"){const data=getData();rows=[["Month","Completed Within Schedule","Completed Not to Schedule","Remaining","Not Done"],...data.map((d:any)=>[d.m,d.completedWithin,d.completedNotTo,d.remaining,d.notDone])];}
  else if(modalId==="sr"){rows=[["Status","Count"],["Total",SR_TOTAL],["Normal",SR_NORMAL],["Outstanding",SR_OUTSTANDING],["Done",SR_DONE]];}
  else if(modalId==="ncr"){rows=[["Status","Count"],["Total",NCR_TOTAL],["Open",NCR_OPEN],["Closed",NCR_CLOSED]];}
  else if(modalId==="deduction"){rows=[["Indicator","%","Deduction (RM)"],...F_LABELS.map((l,i)=>[l,F_VALUES[i].toFixed(2)+"%","RM "+F_DEDUCTIONS[i].toFixed(2)])];}
  if(!rows.length)return;const wb=window.XLSX.utils.book_new();const ws=window.XLSX.utils.aoa_to_sheet(rows);window.XLSX.utils.book_append_sheet(wb,ws,"Detail");window.XLSX.writeFile(wb,`FEMS_${modalId}_${yr}.xlsx`);
}
function printPage(){const s=document.createElement('style');s.id='ps';s.textContent='@page{size:A4 landscape;margin:10mm}@media print{body{-webkit-print-color-adjust:exact!important}.no-print{display:none!important}}';document.head.appendChild(s);window.print();setTimeout(()=>{const e=document.getElementById('ps');if(e)e.remove();},1000);}

/* ─── MAIN ──────────────────────────────────────── */
export default function FEMSDashboard(){
  const { openSidebar } = useDashboardNav();const [activePage,setActivePage]=useState("fem");
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
  useEffect(()=>{if(modal&&scriptsReady.current&&baseChartsInited.current)setTimeout(()=>initModalCharts(modal),300);},[modal,modalYear,modalMonth,modalDeductYear]);

  const getUnschedData=useMemo(()=>getYearData(modalYear,UNSCHEDULE_TABLE_DATA_2025),[modalYear]);
  const getSchedData=useMemo(()=>getYearData(modalYear,SCHEDULE_TABLE_DATA_2025),[modalYear]);

  const initBaseCharts=()=>{
    if(!window.Chart){setTimeout(initBaseCharts,200);return;}
    ["deductionLine","deductIndicatorPie","assetPie","assetBar","assetUptimeChart","srPie","srStackedBar"].forEach(id=>{const c=document.getElementById(id) as HTMLCanvasElement;if(c){const ex=window.Chart.getChart(c);if(ex)ex.destroy();}});
    mkLineChart("deductionLine",["Jul","Aug","Sep","Oct","Nov","Dec"],[{data:DEDUCTION_BY_MONTH,borderColor:"#3b82f6",backgroundColor:"#3b82f622",fill:true}],T,{callback:(v:number)=>v+"%"});
    mkPieChart("deductIndicatorPie",F_LABELS,F_VALUES,F_COLORS,"50%");
    mkPieChart("srPie", SR_BY_TYPE.map(s=>s.label), SR_BY_TYPE.map(s=>s.count), SR_BY_TYPE.map(s=>s.color), "50%");
    const openData = SR_STATUS_BY_CATEGORY.map(s => s.open);
    const closedData = SR_STATUS_BY_CATEGORY.map(s => s.closed);
    const labels = SR_STATUS_BY_CATEGORY.map(s => s.label);
    mkStackedBarChart("srStackedBar", labels, [
      { label: 'Open', data: openData, backgroundColor: '#ef4444' },
      { label: 'Closed', data: closedData, backgroundColor: '#22c55e' }
    ], T, true);
    if(activeTab==="assetStatus"){mkPieChart("assetPie",["Active","Inactive"],[ASSET_ACTIVE,ASSET_INACTIVE],["#22c55e","#ef4444"],"55%");mkBarChart("assetBar",ASSET_BY_TYPE.map(a=>a.type),ASSET_BY_TYPE.map(a=>a.active),Array(6).fill("#22c55e"),T,true);}
    if(activeTab==="assetUptime"){mkLineChart("assetUptimeChart",MONTHS_12,[{data:ASSET_UPTIME,borderColor:"#22c55e",backgroundColor:"#22c55e22",fill:true},{data:Array(12).fill(95),borderColor:"#ef4444",borderDash:[4,3],borderWidth:2,pointRadius:0}],T,{min:93,max:100.5,callback:(v:number)=>v+"%"});}
  };

  const initModalCharts=(id:string)=>{
    if(!window.Chart){setTimeout(()=>initModalCharts(id),200);return;}
    if(id==="sr"){mkBarChart("modalSRChart",["Total","Normal","Outstanding","Done","Critical"],[SR_TOTAL,SR_NORMAL,SR_OUTSTANDING,SR_DONE,SR_CRITICAL],[T.accent,T.green,T.warn,T.green,T.danger],T);}
    if(id==="ncr"){mkBarChart("modalNCRChart",["Total","Open","Closed"],[NCR_TOTAL,NCR_OPEN,NCR_CLOSED],[T.warn,T.danger,T.success],T);}
    if(id==="deduction"){mkBarChart("modalDeductBar",F_LABELS,F_VALUES,F_COLORS,T,true);const dd=modalDeductYear==="2024"?DEDUCTION_2024:modalDeductYear==="2026"?DEDUCTION_2026:DEDUCTION_BY_MONTH;mkLineChart("modalDeductLine",["Jul","Aug","Sep","Oct","Nov","Dec"],[{data:dd,borderColor:"#3b82f6",backgroundColor:"#3b82f622",fill:true}],T,{callback:(v:number)=>v+"%"});}
    if(id==="unschedule"){
      const months = UNSCHEDULE_MONTHLY_DATA.map(d => d.month);
      mkGroupedBarChart("modalUnschedMonthly", months, [
        {label:"Total Generated", data:UNSCHEDULE_MONTHLY_DATA.map(d=>d.totalGenerated), backgroundColor:"#3b82f6"},
        {label:"Closed", data:UNSCHEDULE_MONTHLY_DATA.map(d=>d.closed), backgroundColor:"#22c55e"},
        {label:"In-Progress", data:UNSCHEDULE_MONTHLY_DATA.map(d=>d.inProgress), backgroundColor:"#f97316"}
      ], T);
      
      mkGroupedBarChart("modalUnschedPriority", months, [
        {label:"Critical", data:UNSCHEDULE_MONTHLY_DATA.map(d=>d.critical), backgroundColor:"#dc2626"},
        {label:"Normal", data:UNSCHEDULE_MONTHLY_DATA.map(d=>d.normal), backgroundColor:"#3b82f6"}
      ], T);
      
      UNSCHEDULE_CATEGORIES.forEach((cat,i)=>{
        const keys=["open","wip","completed","cancel","rfCancel","notDoneClosed"];
        const st=keys.map(k=>({k,v:(cat as any)[k]||0})).filter(s=>s.v>0);
        mkPieChart(`unschedCatPie${i}`,st.map(s=>STATUS_LABELS[s.k]),st.map(s=>s.v),st.map(s=>STATUS_COLORS[s.k]),"55%");
        if(cat.groups){
          const groupLabels = cat.groups.map(g => g.group);
          mkGroupedBarChart(`unschedGroupChart${i}`, groupLabels, [
            {label:"Open", data:cat.groups.map(g=>g.open), backgroundColor:"#ef4444"},
            {label:"WIP", data:cat.groups.map(g=>g.wip), backgroundColor:"#f97316"},
            {label:"Completed", data:cat.groups.map(g=>g.completed), backgroundColor:"#22c55e"},
            {label:"Cancel", data:cat.groups.map(g=>g.cancel), backgroundColor:"#9ca3af"},
            {label:"Not Done & Closed", data:cat.groups.map(g=>g.notDoneClosed), backgroundColor:"#8b5cf6"}
          ], T);
          mkGroupedBarChart(`unschedGroupPriority${i}`, groupLabels, [
            {label:"Critical", data:cat.groups.map(g=>g.critical), backgroundColor:"#dc2626"},
            {label:"Normal", data:cat.groups.map(g=>g.normal), backgroundColor:"#3b82f6"}
          ], T);
        }
      });
    }
    if(id==="schedule"){
      const months = SCHEDULE_MONTHLY_DATA.map(d => d.month);
      mkGroupedBarChart("modalSchedMonthly", months, [
        {label:"Total Generated", data:SCHEDULE_MONTHLY_DATA.map(d=>d.totalGenerated), backgroundColor:"#3b82f6"},
        {label:"Closed", data:SCHEDULE_MONTHLY_DATA.map(d=>d.closed), backgroundColor:"#22c55e"},
        {label:"In-Progress", data:SCHEDULE_MONTHLY_DATA.map(d=>d.inProgress), backgroundColor:"#f97316"}
      ], T);
      
      SCHEDULE_CATEGORIES.forEach((cat,i)=>{
        const keys=["open","wip","completed","cancel","rfCancel","notDoneClosed"];
        const st=keys.map(k=>({k,v:(cat as any)[k]||0})).filter(s=>s.v>0);
        mkPieChart(`schedCatPie${i}`,st.map(s=>STATUS_LABELS[s.k]),st.map(s=>s.v),st.map(s=>STATUS_COLORS[s.k]),"55%");
        if(cat.groups){
          const groupLabels = cat.groups.map(g => g.group);
          mkGroupedBarChart(`schedGroupChart${i}`, groupLabels, [
            {label:"Open", data:cat.groups.map(g=>g.open), backgroundColor:"#ef4444"},
            {label:"WIP", data:cat.groups.map(g=>g.wip), backgroundColor:"#f97316"},
            {label:"Completed", data:cat.groups.map(g=>g.completed), backgroundColor:"#22c55e"},
            {label:"Cancel", data:cat.groups.map(g=>g.cancel), backgroundColor:"#9ca3af"},
            {label:"Not Done & Closed", data:cat.groups.map(g=>g.notDoneClosed), backgroundColor:"#8b5cf6"}
          ], T);
        }
      });
    }
  };

  const openModal=(id:string)=>{setModal(id);setModalYear("2025");setModalMonth("all");setModalStartDate("2025-01-01");setModalEndDate("2025-12-31");setModalDeductYear("2025");};
  const card=(e?:React.CSSProperties):React.CSSProperties=>({background:T.card,border:`1px solid ${T.border}`,borderRadius:16,...e});
  const panel=(e?:React.CSSProperties):React.CSSProperties=>({background:T.panel,border:`1px solid ${T.border}`,borderRadius:12,...e});

  const topHeaderCards = [
    { title: "Unschedule WO", total: UNSCHEDULE_TOTAL, color: "#ef4444", items: [{ label: "Open", value: UNSCHEDULE_OPEN, color: "#ef4444" }, { label: "Completed", value: UNSCHEDULE_COMPLETED, color: "#22c55e" }], modalId: "unschedule", borderLeft: "3px solid #ef4444" },
    { title: "Schedule WO", total: SCHEDULE_TOTAL, color: "#3b82f6", items: [{ label: "Open", value: SCHEDULE_OPEN, color: "#ef4444" }, { label: "Completed", value: SCHEDULE_COMPLETED, color: "#22c55e" }], modalId: "schedule", borderLeft: "3px solid #3b82f6" },
    { title: "Service Request", total: SR_TOTAL, color: T.text, items: [{ label: "Normal", value: SR_NORMAL, color: "#22c55e" }, { label: "Outstanding", value: SR_OUTSTANDING, color: "#f59e0b" }], modalId: "sr" },
    { title: "NCR", total: NCR_TOTAL, color: T.text, items: [{ label: "Open", value: NCR_OPEN, color: "#ef4444", suffix: `(${((NCR_OPEN/NCR_TOTAL)*100).toFixed(1)}%)` }, { label: "Closed", value: NCR_CLOSED, color: "#22c55e", suffix: `(${((NCR_CLOSED/NCR_TOTAL)*100).toFixed(1)}%)` }], modalId: "ncr" },
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
          <div><div style={{fontSize:17,fontWeight:700,color:htc}}>{currentPage.label}</div><div style={{fontSize:11,color:htc,opacity:0.6}}>FEMS Performance Dashboard</div></div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          {activePage==="fem"&&<div style={{display:"flex",gap:8}}><button onClick={exportExcelAll} title="Export" style={{background:T.success+"12",border:`1px solid ${T.success}25`,color:T.success,width:34,height:34,borderRadius:8,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><BIcon name="bi-download" size={15} color={T.success} /></button><button onClick={printPage} title="Print" style={{background:T.accent+"12",border:`1px solid ${T.accent}25`,color:T.accent,width:34,height:34,borderRadius:8,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><BIcon name="bi-printer" size={15} color={T.accent} /></button></div>}
          <div style={{width:1,height:28,background:htc,opacity:0.12}} />
          <button onClick={()=>setThemeName(n=>n==="dark"?"light":"dark")} style={{background:"transparent",border:`1px solid ${htc}20`,color:htc,borderRadius:8,padding:"6px 12px",cursor:"pointer",fontSize:14}}><BIcon name={themeName==="dark"?"bi-sun-fill":"bi-moon-fill"} size={15} color={htc} /></button>
          <span style={{fontSize:13,color:htc,opacity:0.7}}>25 Feb 2026</span>
          <div style={{display:"flex",alignItems:"center",gap:10,padding:"4px 12px 4px 4px",background:htc+"08",borderRadius:24,border:`1px solid ${htc}20`}}><div style={{width:30,height:30,borderRadius:"50%",background:"linear-gradient(135deg,#3b82f6,#22c55e)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"#fff"}}><BIcon name="bi-person-fill" size={13} color="#fff" /></div><span style={{fontSize:13,fontWeight:600,color:htc}}>Admin</span></div>
        </div>
      </div>

      {activePage!=="fem"&&(<div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column" as const,gap:20,color:T.muted}}><BIcon name="bi-tools" size={56} color={T.muted} /><div style={{fontSize:24,fontWeight:700,color:T.text}}>{currentPage.label}</div></div>)}

      {activePage==="fem"&&(<>
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
          <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",gap:14}}>
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

            <div style={{...card({overflow:"hidden",display:"flex",flexDirection:"column"}),flex:1,minHeight:0}}>
              <div style={{padding:"14px 18px",borderBottom:`1px solid ${T.border}`,flexShrink:0}}><span style={{fontSize:15,fontWeight:700,color:T.text}}>Overall FEMS Performance <span style={{fontSize:12,color:T.muted}}>— {FEMS_TABS.find(t=>t.key===activeTab)?.label}</span></span></div>
              <div style={{flex:1,display:"flex",overflow:"hidden",minHeight:0}}>
                <div className="no-print" style={{width:185,flexShrink:0,borderRight:`1px solid ${T.border}`,display:"flex",flexDirection:"column",padding:"10px 7px",gap:3,overflowY:"auto",background:themeName==="light"?"#f8fafc":T.panel}}>{FEMS_TABS.map(t=>{const a=activeTab===t.key;return(<button key={t.key} onClick={()=>setActiveTab(t.key)} style={{width:"100%",padding:"11px 12px",borderRadius:9,fontSize:11,fontWeight:a?600:400,border:`1px solid ${a?T.accent:T.border}`,background:a?T.accent+"12":"transparent",color:a?T.accent:T.muted,cursor:"pointer",textAlign:"left",borderLeft:`3px solid ${a?T.accent:"transparent"}`}}>{t.label}</button>);})}</div>
                <div style={{flex:1,overflow:"auto",padding:"14px"}}>
                  {activeTab==="general"&&(<div style={{display:"flex",flexDirection:"column",gap:12}}>
                    <div style={{...panel({padding:"14px"})}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                        <span style={{fontSize:13,fontWeight:700,color:T.text}}>Service Request Overview</span>
                        <span style={{fontSize:11,fontWeight:600,padding:"4px 12px",borderRadius:24,background:"rgba(59,130,246,.12)",color:"#3b82f6",border:"1px solid rgba(59,130,246,.25)"}}>Total: {SR_TOTAL}</span>
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
                        <div>
                          <div style={{fontSize:12,fontWeight:600,color:T.muted,textAlign:"center",marginBottom:8}}>SR by Type of Request</div>
                          <div style={{display:"flex",alignItems:"center",gap:12}}>
                            <div style={{position:"relative",width:140,height:140,flexShrink:0}}><canvas id="srPie" style={{width:"100%",height:"100%"}} /></div>
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
                          <div style={{fontSize:12,fontWeight:600,color:T.muted,textAlign:"center",marginBottom:8}}>SR Status by Category</div>
                          <div style={{display:"flex",flexDirection:"column",gap:8}}>
                            <div style={{position:"relative",height:220,width:"100%"}}><canvas id="srStackedBar" style={{width:"100%",height:"100%"}} /></div>
                            <div style={{display:"flex",justifyContent:"center",gap:16,fontSize:10,color:T.muted}}>
                              <span style={{display:"flex",alignItems:"center",gap:4}}><span style={{width:10,height:10,borderRadius:2,background:"#ef4444"}} /> Open</span>
                              <span style={{display:"flex",alignItems:"center",gap:4}}><span style={{width:10,height:10,borderRadius:2,background:"#22c55e"}} /> Closed</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

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
                    <div style={{...panel({padding:"14px"})}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}><span style={{fontSize:13,fontWeight:700,color:T.text}}>Licence Expiring Within 60 Days</span><Badge color="warn" T={T}>{LICENSE_DATA.length} expiring</Badge></div>
                      <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}><thead><tr style={{borderBottom:`2px solid ${T.border}`}}>{["No","Category","Expiry","Days"].map(h=><th key={h} style={{padding:"10px 12px",textAlign:"left",color:T.muted,fontWeight:600,fontSize:10,textTransform:"uppercase"}}>{h}</th>)}</tr></thead><tbody>{LICENSE_DATA.map((l,i)=>(<tr key={i} style={{borderBottom:`1px solid ${T.border}`}}><td style={{padding:"10px 12px",color:T.muted}}>{l.no}</td><td style={{padding:"10px 12px",color:T.text,fontWeight:500}}>{l.category}</td><td style={{padding:"10px 12px",color:T.text}}>{l.expiry}</td><td style={{padding:"10px 12px"}}><DaysBadge days={l.daysLeft} /></td></tr>))}</tbody></table></div></div>
                  </div>)}
                  {activeTab==="assetStatus"&&(<div style={{display:"flex",flexDirection:"column",gap:12}}><div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>{[{l:"Total",v:TOTAL_ASSETS.toLocaleString(),c:T.accent},{l:"Active",v:ASSET_ACTIVE.toLocaleString(),c:"#22c55e"},{l:"Inactive",v:ASSET_INACTIVE.toLocaleString(),c:"#ef4444"}].map((s,i)=>(<div key={i} style={{...panel({padding:"12px",textAlign:"center"})}}><div style={{fontSize:10,color:T.muted,textTransform:"uppercase",marginBottom:4}}>{s.l}</div><div style={{fontSize:24,fontWeight:800,color:s.c}}>{s.v}</div></div>))}</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,flex:1}}><div style={{...panel({padding:"12px"})}}><div style={{fontSize:12,color:T.muted,marginBottom:8}}>{HOSPITAL_NAME}</div><div style={{display:"flex",alignItems:"center",gap:12,height:200}}><div style={{position:"relative",width:160,height:160,flexShrink:0}}><canvas id="assetPie" style={{width:"100%",height:"100%"}} /></div><div style={{flex:1}}><Badge color="green" T={T}>Active: {ASSET_ACTIVE}</Badge><div style={{marginTop:10}}><Badge color="danger" T={T}>Inactive: {ASSET_INACTIVE}</Badge></div></div></div></div><div style={{...panel({padding:"12px"})}}><div style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:8}}>Asset by Type</div><div style={{position:"relative",height:240}}><canvas id="assetBar" style={{width:"100%",height:"100%"}} /></div></div></div></div>)}
                  {activeTab==="assetUptime"&&(<div style={{display:"flex",flexDirection:"column",gap:12}}><div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>{[{l:"Avg Uptime",v:"98.4%",c:"#22c55e"},{l:"Target",v:"95%",c:T.accent},{l:"Lowest",v:"Aug (97.5%)",c:T.warn}].map((s,i)=>(<div key={i} style={{...panel({padding:"12px",textAlign:"center"})}}><div style={{fontSize:10,color:T.muted,textTransform:"uppercase",marginBottom:4}}>{s.l}</div><div style={{fontSize:24,fontWeight:800,color:s.c}}>{s.v}</div></div>))}</div><div style={{...panel({padding:"12px",flex:1})}}><div style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:8}}>Asset Uptime % by Month</div><div style={{position:"relative",height:260}}><canvas id="assetUptimeChart" style={{width:"100%",height:"100%"}} /></div></div></div>)}
                  {["assetLifespan","assetMaintenance","eodPerformance","manpower"].includes(activeTab)&&(<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100%",color:T.muted,fontSize:16,flexDirection:"column",gap:10}}><BIcon name="bi-gear" size={48} color={T.muted} /><div style={{fontSize:18,fontWeight:600}}>{FEMS_TABS.find(t=>t.key===activeTab)?.label}</div><div style={{fontSize:13}}>Coming soon</div></div>)}
                </div>
              </div>
            </div>
          </div>

          <div style={{width:300,flexShrink:0,display:"flex",flexDirection:"column",gap:14,overflow:"hidden"}}>
            <div style={{...card({display:"flex",flexDirection:"column",minHeight:0,overflow:"hidden"}),flex:1}}>
              <div style={{padding:"14px 16px",borderBottom:`1px solid ${T.border}`,flexShrink:0,display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontSize:14,fontWeight:700,color:T.text}}>Deduction by Indicator</div><div style={{fontSize:10,color:T.muted}}>{startDate} to {endDate}</div></div><button className="no-print" onClick={()=>openModal("deduction")} style={{background:T.panel,border:`1px solid ${T.border}`,color:T.muted,width:28,height:28,borderRadius:7,cursor:"pointer",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center"}}><BIcon name="bi-arrows-angle-expand" size={13} color={T.muted} /></button></div>
              <div style={{padding:"8px 14px",borderBottom:`1px solid ${T.border}`,display:"flex",gap:16}}><div style={{textAlign:"center",flex:1}}><div style={{fontSize:10,color:T.muted}}>% Deduction</div><div style={{fontSize:18,fontWeight:800,color:"#ef4444"}}>{OVERALL_DEDUCTION}%</div></div><div style={{width:1,background:T.border}} /><div style={{textAlign:"center",flex:1}}><div style={{fontSize:10,color:T.muted}}>Total</div><div style={{fontSize:18,fontWeight:800,color:T.green}}>RM {F_DEDUCTIONS.reduce((a,b)=>a+b,0).toFixed(0)}</div></div></div>
              <div style={{flex:1,padding:"10px 12px",display:"flex",flexDirection:"column",gap:5,overflowY:"auto"}}><div style={{position:"relative",height:120,flexShrink:0}}><canvas id="deductIndicatorPie" style={{width:"100%",height:"100%"}} /></div>{F_LABELS.map((l,i)=>(<div key={l} style={{display:"flex",justifyContent:"space-between",padding:"7px 10px",background:T.panel,borderRadius:8,border:`1px solid ${T.border}`}}><div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:8,height:8,borderRadius:2,background:F_COLORS[i]}} /><span style={{fontSize:12,fontWeight:600,color:T.text}}>{l}</span></div><div><span style={{fontSize:11,color:T.muted}}>{F_VALUES[i].toFixed(1)}%</span><span style={{fontSize:11,fontWeight:700,color:F_DEDUCTIONS[i]>0?T.danger:T.success,marginLeft:8}}>RM {F_DEDUCTIONS[i].toFixed(0)}</span></div></div>))}</div>
            </div>
            <div style={{...card({display:"flex",flexDirection:"column"}),flex:0.8,minHeight:0}}><div style={{padding:"14px 16px",borderBottom:`1px solid ${T.border}`}}><div style={{fontSize:14,fontWeight:700,color:T.text}}>% Deduction by Month</div></div><div style={{flex:1,padding:"8px 10px",position:"relative"}}><canvas id="deductionLine" style={{position:"absolute",inset:0,width:"100%",height:"100%"}} /></div></div>
          </div>
        </div>

        {/* MODALS */}
        {modal==="sr"&&(<Modal title="Service Request" onClose={()=>setModal(null)} T={T} onExport={()=>exportModalData("sr","",null)} onPrint={printPage}><FilterRow year={modalYear} setYear={setModalYear} month={modalMonth} setMonth={setModalMonth} startDate={modalStartDate} setStartDate={setModalStartDate} endDate={modalEndDate} setEndDate={setModalEndDate} T={T} /><StatCards data={[{v:SR_TOTAL.toLocaleString(),l:"Total",c:T.accent},{v:SR_NORMAL.toLocaleString(),l:"Normal",c:T.success},{v:SR_OUTSTANDING.toLocaleString(),l:"Outstanding",c:T.warn},{v:SR_DONE.toLocaleString(),l:"Done",c:T.success}]} T={T} /><div style={{position:"relative",height:300,marginBottom:20}}><canvas id="modalSRChart" style={{width:"100%",height:"100%"}} /></div><table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}><thead><tr>{["Status","Count","%"].map(h=><th key={h} style={{background:T.accent+"10",color:T.accent,padding:"10px 12px",textAlign:"left",fontWeight:700,fontSize:12,borderBottom:`2px solid ${T.border}`}}>{h}</th>)}</tr></thead><tbody>{[{l:"Total",v:SR_TOTAL},{l:"Normal",v:SR_NORMAL},{l:"Outstanding",v:SR_OUTSTANDING},{l:"Done",v:SR_DONE}].map((s,i)=>(<tr key={i}><td style={{padding:"10px 12px",borderBottom:`1px solid ${T.border}`,color:T.text,fontWeight:600}}>{s.l}</td><td style={{padding:"10px 12px",borderBottom:`1px solid ${T.border}`,color:T.text}}>{s.v.toLocaleString()}</td><td style={{padding:"10px 12px",borderBottom:`1px solid ${T.border}`,color:T.muted}}>{((s.v/SR_TOTAL)*100).toFixed(1)}%</td></tr>))}</tbody></table></Modal>)}

        {modal==="ncr"&&(<Modal title="NCR" onClose={()=>setModal(null)} T={T} onExport={()=>exportModalData("ncr","",null)} onPrint={printPage}><FilterRow year={modalYear} setYear={setModalYear} month={modalMonth} setMonth={setModalMonth} startDate={modalStartDate} setStartDate={setModalStartDate} endDate={modalEndDate} setEndDate={setModalEndDate} T={T} /><StatCards data={[{v:NCR_TOTAL.toString(),l:"Total",c:T.warn},{v:NCR_OPEN.toString(),l:"Open",c:T.danger},{v:NCR_CLOSED.toString(),l:"Closed",c:T.success},{v:NCR_CLOSURE_RATE+"%",l:"Closure Rate",c:T.accent}]} T={T} /><div style={{position:"relative",height:300,marginBottom:20}}><canvas id="modalNCRChart" style={{width:"100%",height:"100%"}} /></div><table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}><thead><tr>{["Status","Count","%"].map(h=><th key={h} style={{background:T.accent+"10",color:T.accent,padding:"10px 12px",textAlign:"left",fontWeight:700,fontSize:12,borderBottom:`2px solid ${T.border}`}}>{h}</th>)}</tr></thead><tbody>{[{l:"Total",v:NCR_TOTAL},{l:"Open",v:NCR_OPEN},{l:"Closed",v:NCR_CLOSED}].map((s,i)=>(<tr key={i}><td style={{padding:"10px 12px",borderBottom:`1px solid ${T.border}`,color:T.text,fontWeight:600}}>{s.l}</td><td style={{padding:"10px 12px",borderBottom:`1px solid ${T.border}`,color:T.text}}>{s.v}</td><td style={{padding:"10px 12px",borderBottom:`1px solid ${T.border}`,color:T.muted}}>{((s.v/NCR_TOTAL)*100).toFixed(1)}%</td></tr>))}</tbody></table></Modal>)}

        {modal==="deduction"&&(<Modal title="Deduction by Indicator" onClose={()=>setModal(null)} T={T} onExport={()=>exportModalData("deduction",modalDeductYear,null)} onPrint={printPage}><FilterRow year={modalDeductYear} setYear={setModalDeductYear} month={modalMonth} setMonth={setModalMonth} startDate={modalStartDate} setStartDate={setModalStartDate} endDate={modalEndDate} setEndDate={setModalEndDate} showMonth={false} T={T} /><StatCards data={[{v:OVERALL_DEDUCTION+"%",l:"% Deduction",c:"#ef4444"},{v:"9",l:"Indicators",c:T.accent},{v:"RM 1,841",l:"Total Deduction",c:T.danger},{v:"F11",l:"Highest",c:"#ef4444"}]} T={T} /><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:20}}><div><div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:12}}>% by Indicator</div><div style={{position:"relative",height:300}}><canvas id="modalDeductBar" style={{width:"100%",height:"100%"}} /></div></div><div><div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:12}}>% Deduction Trend ({modalDeductYear})</div><div style={{position:"relative",height:300}}><canvas id="modalDeductLine" style={{width:"100%",height:"100%"}} /></div></div></div><table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}><thead><tr>{["Indicator","%","Deduction (RM)"].map(h=><th key={h} style={{background:T.accent+"10",color:T.accent,padding:"10px 12px",textAlign:"left",fontWeight:700,fontSize:12,borderBottom:`2px solid ${T.border}`}}>{h}</th>)}</tr></thead><tbody>{F_LABELS.map((l,i)=>(<tr key={l}><td style={{padding:"10px 12px",borderBottom:`1px solid ${T.border}`,color:F_COLORS[i],fontWeight:600}}>{l}</td><td style={{padding:"10px 12px",borderBottom:`1px solid ${T.border}`,color:T.text}}>{F_VALUES[i].toFixed(2)}%</td><td style={{padding:"10px 12px",borderBottom:`1px solid ${T.border}`,color:F_DEDUCTIONS[i]>0?T.danger:T.success,fontWeight:600}}>RM {F_DEDUCTIONS[i].toFixed(2)}</td></tr>))}</tbody></table></Modal>)}

        {/* UNSCHEDULE MODAL */}
        {modal==="unschedule"&&(<Modal title="Unschedule Work Order" onClose={()=>setModal(null)} T={T} onExport={()=>exportModalData("unschedule",modalYear,()=>getUnschedData)} onPrint={printPage}>
          <FilterRow year={modalYear} setYear={setModalYear} month={modalMonth} setMonth={setModalMonth} startDate={modalStartDate} setStartDate={setModalStartDate} endDate={modalEndDate} setEndDate={setModalEndDate} T={T} />
          
          {/* SUMMARY CARDS - Yearly totals */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12,marginBottom:20}}>
            <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:"12px 14px",textAlign:"center"}}>
              <div style={{fontSize:10,color:T.muted,textTransform:"uppercase"}}>Total WO Generated</div>
              <div style={{fontSize:24,fontWeight:800,color:"#3b82f6"}}>{UNSCHEDULE_YEARLY_SUMMARY.totalGenerated}</div>
            </div>
            <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:"12px 14px",textAlign:"center"}}>
              <div style={{fontSize:10,color:T.muted,textTransform:"uppercase"}}>Closed</div>
              <div style={{fontSize:24,fontWeight:800,color:"#22c55e"}}>{UNSCHEDULE_YEARLY_SUMMARY.closed}</div>
            </div>
            <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:"12px 14px",textAlign:"center"}}>
              <div style={{fontSize:10,color:T.muted,textTransform:"uppercase"}}>In-Progress</div>
              <div style={{fontSize:24,fontWeight:800,color:"#f97316"}}>{UNSCHEDULE_YEARLY_SUMMARY.inProgress}</div>
            </div>
            <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:"12px 14px",textAlign:"center"}}>
              <div style={{fontSize:10,color:T.muted,textTransform:"uppercase"}}>Critical</div>
              <div style={{fontSize:24,fontWeight:800,color:"#dc2626"}}>{UNSCHEDULE_YEARLY_SUMMARY.critical}</div>
            </div>
            <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:"12px 14px",textAlign:"center"}}>
              <div style={{fontSize:10,color:T.muted,textTransform:"uppercase"}}>Normal</div>
              <div style={{fontSize:24,fontWeight:800,color:"#3b82f6"}}>{UNSCHEDULE_YEARLY_SUMMARY.normal}</div>
            </div>
          </div>

          {/* CHARTS SECTION */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:20}}>
            <div>
              <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:8}}>WO Status by Month</div>
              <div style={{position:"relative",height:250,width:"100%"}}><canvas id="modalUnschedMonthly" style={{width:"100%",height:"100%"}} /></div>
            </div>
            <div>
              <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:8}}>WO Priority (Critical vs Normal)</div>
              <div style={{position:"relative",height:250,width:"100%"}}><canvas id="modalUnschedPriority" style={{width:"100%",height:"100%"}} /></div>
            </div>
          </div>

          {/* TABLE SECTION */}
          <div style={{marginBottom:20,overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
              <thead>
                <tr style={{borderBottom:`2px solid ${T.border}`}}>
                  <th style={{padding:"8px 10px",textAlign:"left",color:T.muted,fontWeight:700,fontSize:10,textTransform:"uppercase"}}>Month</th>
                  <th style={{padding:"8px 10px",textAlign:"center",color:T.muted,fontWeight:700,fontSize:10,textTransform:"uppercase"}}>Total WO Generated</th>
                  <th style={{padding:"8px 10px",textAlign:"center",color:T.muted,fontWeight:700,fontSize:10,textTransform:"uppercase"}}>Closed</th>
                  <th style={{padding:"8px 10px",textAlign:"center",color:T.muted,fontWeight:700,fontSize:10,textTransform:"uppercase"}}>In-Progress</th>
                  <th style={{padding:"8px 10px",textAlign:"center",color:T.muted,fontWeight:700,fontSize:10,textTransform:"uppercase"}}>Critical</th>
                  <th style={{padding:"8px 10px",textAlign:"center",color:T.muted,fontWeight:700,fontSize:10,textTransform:"uppercase"}}>Normal</th>
                </tr>
              </thead>
              <tbody>
                {UNSCHEDULE_MONTHLY_DATA.map((d,i)=>(
                  <tr key={i} style={{borderBottom:`1px solid ${T.border}30`}}>
                    <td style={{padding:"8px 10px",color:T.text,fontWeight:600}}>{d.month}</td>
                    <td style={{padding:"8px 10px",textAlign:"center",color:T.accent,fontWeight:600}}>{d.totalGenerated}</td>
                    <td style={{padding:"8px 10px",textAlign:"center",color:"#22c55e",fontWeight:600}}>{d.closed}</td>
                    <td style={{padding:"8px 10px",textAlign:"center",color:"#f97316",fontWeight:600}}>{d.inProgress}</td>
                    <td style={{padding:"8px 10px",textAlign:"center",color:"#dc2626",fontWeight:600}}>{d.critical}</td>
                    <td style={{padding:"8px 10px",textAlign:"center",color:"#3b82f6",fontWeight:600}}>{d.normal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* CATEGORY CARDS SECTION */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            {UNSCHEDULE_CATEGORIES.map((cat,i)=>{
              const st=["open","wip","completed","cancel","rfCancel","notDoneClosed"].map(k=>({k,v:(cat as any)[k]||0})).filter(s=>s.v>0);
              return(
                <div key={cat.key} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:"14px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                    <span style={{fontSize:14,fontWeight:700,textTransform:"uppercase",color:cat.color}}>{cat.label}</span>
                    <span style={{fontSize:11,color:T.muted,marginLeft:"auto"}}>Total: <strong style={{color:T.text}}>{cat.total}</strong></span>
                  </div>
                  
                  <div style={{display:"flex",gap:16,marginBottom:12}}>
                    <div style={{position:"relative",width:100,height:100,flexShrink:0}}>
                      <canvas id={`unschedCatPie${i}`} width={100} height={100} style={{width:100,height:100}} />
                    </div>
                    <div style={{flex:1,display:"flex",flexDirection:"column",gap:2,justifyContent:"center"}}>
                      {st.map(s=>{
                        const pct=Math.round((s.v/cat.total)*100);
                        return(<div key={s.k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:10}}>
                          <div style={{display:"flex",alignItems:"center",gap:4}}>
                            <span style={{width:8,height:8,borderRadius:"50%",background:STATUS_COLORS[s.k],display:"inline-block",flexShrink:0}} />
                            <span style={{color:T.muted}}>{STATUS_LABELS[s.k]}</span>
                          </div>
                          <span style={{color:T.text,fontWeight:600}}>{s.v} ({pct}%)</span>
                        </div>);
                      })}
                    </div>
                  </div>
                  
                  {cat.groups && (
                    <div style={{marginBottom:10}}>
                      <div style={{fontSize:11,fontWeight:600,color:T.muted,marginBottom:4}}>WO by Group (Status)</div>
                      <div style={{position:"relative",height:130,width:"100%"}}>
                        <canvas id={`unschedGroupChart${i}`} style={{width:"100%",height:"100%"}} />
                      </div>
                    </div>
                  )}
                  
                  {cat.groups && (
                    <div>
                      <div style={{fontSize:11,fontWeight:600,color:T.muted,marginBottom:4}}>WO by Group (Priority)</div>
                      <div style={{position:"relative",height:120,width:"100%"}}>
                        <canvas id={`unschedGroupPriority${i}`} style={{width:"100%",height:"100%"}} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Modal>)}

        {/* SCHEDULE MODAL */}
        {modal==="schedule"&&(<Modal title="Schedule Work Order" onClose={()=>setModal(null)} T={T} onExport={()=>exportModalData("schedule",modalYear,()=>getSchedData)} onPrint={printPage}>
          <FilterRow year={modalYear} setYear={setModalYear} month={modalMonth} setMonth={setModalMonth} startDate={modalStartDate} setStartDate={setModalStartDate} endDate={modalEndDate} setEndDate={setModalEndDate} T={T} />
          
          {/* SUMMARY CARDS - Yearly totals for Schedule */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
            <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:"12px 14px",textAlign:"center"}}>
              <div style={{fontSize:10,color:T.muted,textTransform:"uppercase"}}>Total WO Generated</div>
              <div style={{fontSize:24,fontWeight:800,color:"#3b82f6"}}>{SCHEDULE_YEARLY_SUMMARY.totalGenerated}</div>
            </div>
            <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:"12px 14px",textAlign:"center"}}>
              <div style={{fontSize:10,color:T.muted,textTransform:"uppercase"}}>Closed</div>
              <div style={{fontSize:24,fontWeight:800,color:"#22c55e"}}>{SCHEDULE_YEARLY_SUMMARY.closed}</div>
            </div>
            <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:"12px 14px",textAlign:"center"}}>
              <div style={{fontSize:10,color:T.muted,textTransform:"uppercase"}}>In-Progress</div>
              <div style={{fontSize:24,fontWeight:800,color:"#f97316"}}>{SCHEDULE_YEARLY_SUMMARY.inProgress}</div>
            </div>
          </div>

          {/* CHARTS SECTION */}
          <div style={{display:"grid",gridTemplateColumns:"1fr",gap:20,marginBottom:20}}>
            <div>
              <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:8}}>WO Status by Month</div>
              <div style={{position:"relative",height:280,width:"100%"}}><canvas id="modalSchedMonthly" style={{width:"100%",height:"100%"}} /></div>
            </div>
          </div>

          {/* TABLE SECTION */}
          <div style={{marginBottom:20,overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
              <thead>
                <tr style={{borderBottom:`2px solid ${T.border}`}}>
                  <th style={{padding:"8px 10px",textAlign:"left",color:T.muted,fontWeight:700,fontSize:10,textTransform:"uppercase"}}>Month</th>
                  <th style={{padding:"8px 10px",textAlign:"center",color:T.muted,fontWeight:700,fontSize:10,textTransform:"uppercase"}}>Total WO Generated</th>
                  <th style={{padding:"8px 10px",textAlign:"center",color:T.muted,fontWeight:700,fontSize:10,textTransform:"uppercase"}}>Closed</th>
                  <th style={{padding:"8px 10px",textAlign:"center",color:T.muted,fontWeight:700,fontSize:10,textTransform:"uppercase"}}>In-Progress</th>
                </tr>
              </thead>
              <tbody>
                {SCHEDULE_MONTHLY_DATA.map((d,i)=>(
                  <tr key={i} style={{borderBottom:`1px solid ${T.border}30`}}>
                    <td style={{padding:"8px 10px",color:T.text,fontWeight:600}}>{d.month}</td>
                    <td style={{padding:"8px 10px",textAlign:"center",color:T.accent,fontWeight:600}}>{d.totalGenerated}</td>
                    <td style={{padding:"8px 10px",textAlign:"center",color:"#22c55e",fontWeight:600}}>{d.closed}</td>
                    <td style={{padding:"8px 10px",textAlign:"center",color:"#f97316",fontWeight:600}}>{d.inProgress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* CATEGORY CARDS SECTION */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16}}>
            {SCHEDULE_CATEGORIES.map((cat,i)=>{
              const st=["open","wip","completed","cancel","rfCancel","notDoneClosed"].map(k=>({k,v:(cat as any)[k]||0})).filter(s=>s.v>0);
              return(
                <div key={cat.key} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:"14px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                    <span style={{fontSize:14,fontWeight:700,textTransform:"uppercase",color:cat.color}}>{cat.label}</span>
                    <span style={{fontSize:11,color:T.muted,marginLeft:"auto"}}>Total: <strong style={{color:T.text}}>{cat.total}</strong></span>
                  </div>
                  
                  <div style={{display:"flex",gap:16,marginBottom:12}}>
                    <div style={{position:"relative",width:100,height:100,flexShrink:0}}>
                      <canvas id={`schedCatPie${i}`} width={100} height={100} style={{width:100,height:100}} />
                    </div>
                    <div style={{flex:1,display:"flex",flexDirection:"column",gap:2,justifyContent:"center"}}>
                      {st.map(s=>{
                        const pct=Math.round((s.v/cat.total)*100);
                        return(<div key={s.k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:10}}>
                          <div style={{display:"flex",alignItems:"center",gap:4}}>
                            <span style={{width:8,height:8,borderRadius:"50%",background:STATUS_COLORS[s.k],display:"inline-block",flexShrink:0}} />
                            <span style={{color:T.muted}}>{STATUS_LABELS[s.k]}</span>
                          </div>
                          <span style={{color:T.text,fontWeight:600}}>{s.v} ({pct}%)</span>
                        </div>);
                      })}
                    </div>
                  </div>
                  
                  {cat.groups && (
                    <div style={{marginTop:10}}>
                      <div style={{fontSize:11,fontWeight:600,color:T.muted,marginBottom:4}}>WO by Group (Status)</div>
                      <div style={{position:"relative",height:150,width:"100%"}}>
                        <canvas id={`schedGroupChart${i}`} style={{width:"100%",height:"100%"}} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Modal>)}
      </>)}
    </div>
  );
}