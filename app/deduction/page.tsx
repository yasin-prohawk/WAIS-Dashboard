"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useDashboardNav } from "@/components/dashboard-nav-provider";

declare global { interface Window { Chart: any; XLSX: any; } }

/* ─── DEDUCTION DATA ────────────────────────────── */
const MONTHS_10 = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct"];

const SERVICES = [
  {
    id: "FEMS",
    label: "Facility & Engineering Management Services",
    accent: "#0EA5E9",
    overall: 0.82,
    data: [0.91, 0.75, 0.88, 0.62, 0.79, 1.02, 0.95, 0.70, 0.83, 0.82],
    indicators: [
      { label: "% F1", value: 35.20, color: "#0EA5E9", deduction: 12450.00 },
      { label: "% F2", value: 28.50, color: "#06B6D4", deduction: 8320.00 },
      { label: "% F3", value: 18.30, color: "#3B82F6", deduction: 5180.00 },
      { label: "% F4", value: 12.00, color: "#6366F1", deduction: 3200.00 },
      { label: "% F5", value: 6.00, color: "#8B5CF6", deduction: 1850.00 },
    ],
    totalDeduction: 31000.00,
    totalUserArea: 52,
  },
  {
    id: "BEMS",
    label: "Bio-Medical Engineering Management Services",
    accent: "#F59E0B",
    overall: 1.24,
    data: [0.88, 1.10, 0.95, 1.32, 1.15, 0.98, 1.42, 1.28, 1.19, 1.24],
    indicators: [
      { label: "% B1", value: 40.10, color: "#F59E0B", deduction: 18600.00 },
      { label: "% B2", value: 25.80, color: "#F97316", deduction: 11400.00 },
      { label: "% B3", value: 18.60, color: "#EF4444", deduction: 7850.00 },
      { label: "% B4", value: 10.50, color: "#FB923C", deduction: 4300.00 },
      { label: "% B5", value: 5.00, color: "#FCD34D", deduction: 1850.00 },
    ],
    totalDeduction: 44000.00,
    totalUserArea: 52,
  },
  {
    id: "CLS",
    label: "Cleaning Services",
    accent: "#10B981",
    overall: 0.44,
    data: [0.49, 0.47, 0.42, 0.38, 0.45, 0.48, 0.37, 0.36, 0.45, 0.48],
    indicators: [
      { label: "% C1", value: 74.73, color: "#10B981", deduction: 9800.00 },
      { label: "% C2", value: 16.58, color: "#34D399", deduction: 2100.00 },
      { label: "% C3", value: 7.41, color: "#6EE7B7", deduction: 950.00 },
      { label: "% C4", value: 0.78, color: "#A7F3D0", deduction: 120.00 },
      { label: "% C5", value: 0.50, color: "#D1FAE5", deduction: 80.00 },
    ],
    totalDeduction: 13050.00,
    totalUserArea: 52,
  },
  {
    id: "LLS",
    label: "Linen & Laundry Services",
    accent: "#8B5CF6",
    overall: 1.03,
    data: [1.58, 1.35, 1.37, 0.65, 0.46, 0.54, 0.86, 1.32, 0.46, 1.03],
    indicators: [
      { label: "% L1", value: 0.85, color: "#8B5CF6", deduction: 320.00 },
      { label: "% L2", value: 3.15, color: "#A78BFA", deduction: 1100.00 },
      { label: "% L3", value: 3.53, color: "#C4B5FD", deduction: 1250.00 },
      { label: "% L4", value: 0.88, color: "#DDD6FE", deduction: 330.00 },
      { label: "% L5", value: 42.10, color: "#7C3AED", deduction: 14500.00 },
    ],
    totalDeduction: 17500.00,
    totalUserArea: 52,
  },
  {
    id: "HWMS",
    label: "Healthcare Waste Management Services",
    accent: "#6F42C1",
    overall: 0.03,
    data: [0.03, 0.03, 0.02, 0.02, 0.01, 0.02, 0.06, 0.03, 0.02, 0.03],
    indicators: [
      { label: "% HC1", value: 25.64, color: "#6F42C1", deduction: 450.00 },
      { label: "% HC2", value: 35.90, color: "#007BFF", deduction: 620.00 },
      { label: "% HC3", value: 6.64, color: "#00CCCC", deduction: 115.00 },
      { label: "% HC4", value: 31.86, color: "#17A2B8", deduction: 550.00 },
      { label: "% HC5", value: 0.0,  color: "#0DCAF0", deduction: 0.00 },
    ],
    totalDeduction: 1735.00,
    totalUserArea: 52,
  },
];

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

/* ─── CHART HELPERS ─────────────────────────────── */
function drawChart(id:string,type:string,data:any,options:any){
  const c=document.getElementById(id) as HTMLCanvasElement|null;
  if(!c)return;if(!window.Chart){setTimeout(()=>drawChart(id,type,data,options),150);return;}
  const ctx=c.getContext("2d");if(!ctx)return;const ex=window.Chart.getChart(c);if(ex)ex.destroy();
  try{new window.Chart(ctx,{type:type as any,data,options:{...options,animation:false,responsive:true,maintainAspectRatio:false}});}catch(e){}
}

function mkLine(id:string,labels:string[],datasets:any[],T:Theme,extra?:any){
  const yticks:any={color:T.tickColor,font:{size:11}};
  if(extra?.scales?.y?.callback)yticks.callback=extra.scales.y.callback;
  const yscale:any={grid:{color:T.gridColor},border:{color:"transparent"},ticks:yticks};
  const opts:any={plugins:{legend:{display:false}},scales:{x:{grid:{color:T.gridColor},ticks:{color:T.tickColor,font:{size:11}},border:{color:"transparent"}},y:yscale}};
  if(extra?.plugins)opts.plugins={...opts.plugins,...extra.plugins};
  drawChart(id,"line",{labels,datasets:datasets.map((d:any)=>({...d,borderWidth:d.borderWidth||2,pointRadius:d.pointRadius||3,tension:d.tension||0.35,fill:false}))},opts);
}

function mkPie(id:string,labels:string[],data:number[],colors:string[],T:Theme,cutout="60%"){
  drawChart(id,"doughnut",{labels,datasets:[{data,backgroundColor:colors,borderWidth:0}]},{cutout,plugins:{legend:{display:false}}});
}

function mkBar(id:string,labels:string[],data:number[],colors:string[]|string,T:Theme,extra?:any){
  const scales:any={x:{grid:{color:T.gridColor},ticks:{color:T.tickColor,font:{size:12}},border:{color:"transparent"}},y:{grid:{color:T.gridColor},ticks:{color:T.tickColor,font:{size:12}},border:{color:"transparent"}}};
  if(extra?.indexAxis){const tmp=scales.x;scales.x=scales.y;scales.y=tmp;}
  drawChart(id,"bar",{labels,datasets:[{data,backgroundColor:colors,borderRadius:extra?.borderRadius||8}]},{indexAxis:extra?.indexAxis,plugins:{legend:{display:false}},scales});
}

/* ─── EXPORT ─────────────────────────────────────── */
function exportExcelAll(){
  if(!window.XLSX)return;
  const wb=window.XLSX.utils.book_new();
  const sheetData = [["Deduction Module - All Services"],[""],["Service","% Deduction Overall","Total Deduction (RM)","Indicators"]];
  SERVICES.forEach(s => sheetData.push([s.id, s.overall.toFixed(2)+"%", "RM "+s.totalDeduction.toFixed(2), s.indicators.length]));
  const totalPct = SERVICES.reduce((sum,s)=>sum+s.overall,0);
  const totalRM  = SERVICES.reduce((sum,s)=>sum+s.totalDeduction,0);
  sheetData.push(["TOTAL", totalPct.toFixed(2)+"%", "RM "+totalRM.toFixed(2), ""]);
  const ws=window.XLSX.utils.aoa_to_sheet(sheetData);
  window.XLSX.utils.book_append_sheet(wb,ws,"Summary");

  SERVICES.forEach(svc => {
    const detailData: any[][] = [[`${svc.id} - ${svc.label}`],[""],["Indicator","% Weight","Deduction (RM)"]];
    svc.indicators.forEach(ind => detailData.push([ind.label, ind.value.toFixed(2)+"%", "RM "+ind.deduction.toFixed(2)]));
    detailData.push(["Overall", svc.overall.toFixed(2)+"%", "RM "+svc.totalDeduction.toFixed(2)]);
    const wsDetail = window.XLSX.utils.aoa_to_sheet(detailData);
    window.XLSX.utils.book_append_sheet(wb,wsDetail,svc.id);
  });

  window.XLSX.writeFile(wb,"Deduction_Dashboard_Export.xlsx");
}

function exportServiceExcel(svc: typeof SERVICES[0]){
  if(!window.XLSX)return;
  const wb=window.XLSX.utils.book_new();
  const detailData: any[][] = [[`${svc.id} - ${svc.label}`],[""],["Indicator","% Weight","Deduction (RM)"]];
  svc.indicators.forEach(ind => detailData.push([ind.label, ind.value.toFixed(2)+"%", "RM "+ind.deduction.toFixed(2)]));
  detailData.push(["Overall Deduction %", svc.overall.toFixed(2)+"%", "Total: RM "+svc.totalDeduction.toFixed(2)]);
  const ws=window.XLSX.utils.aoa_to_sheet(detailData);
  window.XLSX.utils.book_append_sheet(wb,ws,svc.id);
  window.XLSX.writeFile(wb,`Deduction_${svc.id}_Export.xlsx`);
}

function printPage(){
  const s=document.createElement('style');
  s.id='ps';
  s.textContent='@page{size:A4 landscape;margin:10mm}@media print{body{-webkit-print-color-adjust:exact!important}.no-print{display:none!important}}';
  document.head.appendChild(s);
  window.print();
  setTimeout(()=>{const e=document.getElementById('ps');if(e)e.remove();},1000);
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

function getContrastText(h:string){
  const r=parseInt(h.slice(1,3),16),g=parseInt(h.slice(3,5),16),b=parseInt(h.slice(5,7),16);
  return(r*299+g*587+b*114)/1000>128?"#ffffff":"#ffffff";
}

/* ─── MAIN ──────────────────────────────────────── */
export default function DeductionDashboard(){
  const { openSidebar } = useDashboardNav();
  const [themeName,setThemeName]=useState<"dark"|"light">("light");
  const [frequency,setFrequency]=useState("monthly");
  const [frequencyKey,setFrequencyKey]=useState("all");
  const [selectedYear,setSelectedYear]=useState("2026");
  const [activeService,setActiveService]=useState<string>("all");
  const [highlightedService,setHighlightedService]=useState<string|null>(null);
  const T=THEMES[themeName];
  const scriptsReady=useRef(false);
  const baseChartsInited=useRef(false);
  const HDR="#0f172a";
  const htc=getContrastText(HDR);

  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  /* ── Aggregates ── */
  const overallTotalDeductionPct = SERVICES.reduce((sum, s) => sum + s.overall, 0);
  const overallTotalDeductionRM  = SERVICES.reduce((sum, s) => sum + s.totalDeduction, 0);
  const totalUserAreas  = SERVICES.reduce((sum, s) => sum + s.totalUserArea, 0);
  const totalIndicators = SERVICES.reduce((sum, s) => sum + s.indicators.length, 0);

  const currentService = activeService === "all" ? null : SERVICES.find(s => s.id === activeService);

  useEffect(()=>{
    if(scriptsReady.current)return;
    const load=(src:string,cb:()=>void)=>{const s=document.createElement("script");s.src=src;s.onload=cb;document.head.appendChild(s);};
    load("https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js",()=>{
      load("https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js",()=>{
        scriptsReady.current=true;
        setTimeout(()=>{initCharts();baseChartsInited.current=true;},400);
      });
    });
  },[]);

  useEffect(()=>{
    if(scriptsReady.current&&baseChartsInited.current)setTimeout(initCharts,200);
  },[themeName, activeService, highlightedService]);

  const initCharts=()=>{
    if(!window.Chart){setTimeout(initCharts,200);return;}

    ["overviewLine","overviewBar","overviewPie","serviceLine","servicePie","serviceBar"].forEach(id=>{
      const c=document.getElementById(id) as HTMLCanvasElement;
      if(c){const ex=window.Chart.getChart(c);if(ex)ex.destroy();}
    });

    const lineDatasets = SERVICES.map(svc => {
      const isHighlighted = highlightedService === svc.id;
      const isDimmed = highlightedService && highlightedService !== svc.id;
      return {
        data: svc.data,
        borderColor: svc.accent,
        backgroundColor: svc.accent,
        fill: false,
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

    mkLine("overviewLine", MONTHS_10, lineDatasets, T, {
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
      scales: { y: { ticks: { callback: (v:number) => v.toFixed(2)+"%" } } }
    });

    mkBar("overviewBar", SERVICES.map(s => s.id), SERVICES.map(s => s.overall), SERVICES.map(s => s.accent), T, { borderRadius: 6 });
    mkPie("overviewPie", SERVICES.map(s => s.id), SERVICES.map(s => s.overall), SERVICES.map(s => s.accent), T, "55%");

    if (currentService) {
      mkLine("serviceLine", MONTHS_10, [{
        data: currentService.data,
        borderColor: currentService.accent,
        backgroundColor: currentService.accent+"22",
        fill: true,
        pointRadius: 5,
        borderWidth: 3,
        pointBackgroundColor: currentService.accent,
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        tension: 0.4,
      }], T, {
        scales: { y: { ticks: { callback: (v:number) => v.toFixed(2)+"%" } } }
      });

      mkPie("servicePie", currentService.indicators.map(i => i.label), currentService.indicators.map(i => i.value), currentService.indicators.map(i => i.color), T, "55%");
      mkBar("serviceBar", currentService.indicators.map(i => i.label), currentService.indicators.map(i => i.value), currentService.indicators.map(i => i.color), T, { indexAxis: "y", borderRadius: 6 });
    }
  };

  const card=(e?:React.CSSProperties):React.CSSProperties=>({background:T.card,border:`1px solid ${T.border}`,borderRadius:16,...e});
  const thStyle:React.CSSProperties={background:T.tableHeaderBg,color:T.accent,padding:"10px 14px",textAlign:"left",fontWeight:700,fontSize:12,borderBottom:`2px solid ${T.border}`};
  const tdStyle:React.CSSProperties={padding:"10px 14px",borderBottom:`1px solid ${T.border}`,color:T.text};

  /* helper to format RM with thousands separator */
  const fmtRM = (n: number) =>
    "RM " + n.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return(
    <div className="dashboard-module-page" style={{fontFamily:"'DM Sans',system-ui,sans-serif",background:T.bg,color:T.text,fontSize:15,height:"100vh",display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');*,::-webkit-scrollbar{scrollbar-width:thin;scrollbar-color:${T.scrollThumb} transparent}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${T.scrollThumb};border-radius:99px}@page{size:A4 landscape;margin:10mm}@media print{body{-webkit-print-color-adjust:exact!important}.no-print{display:none!important}}`}</style>

      {/* TOP BAR */}
      <div className="no-print dashboard-top-bar" style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:HDR,borderBottom:`1px solid ${htc}15`,padding:"0 24px",height:62,flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:16}}>
          <button onClick={openSidebar} style={{background:"transparent",border:"none",color:htc,cursor:"pointer",fontSize:20,padding:"8px 11px",borderRadius:10}}><BIcon name="bi-list" size={22} color={htc} /></button>
          <Link href="/" style={{display:"flex",alignItems:"center",gap:6,padding:"6px 14px",borderRadius:8,border:`1px solid ${htc}30`,color:htc,textDecoration:"none",fontSize:13,fontWeight:500}}><BIcon name="bi-arrow-left" size={16} color={htc} /><span>Back</span></Link>
          <div><div style={{fontSize:17,fontWeight:700,color:htc}}>Deduction Module</div><div style={{fontSize:11,color:htc,opacity:0.6}}>% Deduction KPI — {activeService === "all" ? "All Services Overview" : currentService?.id + " Details"}</div></div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{display:"flex",gap:8}}>
            <button onClick={() => {
              if (activeService === "all") exportExcelAll();
              else if (currentService) exportServiceExcel(currentService);
            }} title="Export" style={{background:T.success+"12",border:`1px solid ${T.success}25`,color:T.success,width:34,height:34,borderRadius:8,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><BIcon name="bi-download" size={15} color={T.success} /></button>
            <button onClick={printPage} title="Print" style={{background:T.accent+"12",border:`1px solid ${T.accent}25`,color:T.accent,width:34,height:34,borderRadius:8,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><BIcon name="bi-printer" size={15} color={T.accent} /></button>
          </div>
          <div style={{width:1,height:28,background:htc,opacity:0.12}} />
          <button onClick={()=>setThemeName(n=>n==="dark"?"light":"dark")} style={{background:"transparent",border:`1px solid ${htc}20`,color:htc,borderRadius:8,padding:"6px 12px",cursor:"pointer",fontSize:14}}><BIcon name={themeName==="dark"?"bi-sun-fill":"bi-moon-fill"} size={15} color={htc} /></button>
          <span style={{fontSize:13,color:htc,opacity:0.7}}>25 Feb 2026</span>
          <div style={{display:"flex",alignItems:"center",gap:10,padding:"4px 12px 4px 4px",background:htc+"08",borderRadius:24,border:`1px solid ${htc}20`}}><div style={{width:30,height:30,borderRadius:"50%",background:"linear-gradient(135deg,#0EA5E9,#8B5CF6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"#fff"}}><BIcon name="bi-person-fill" size={13} color="#fff" /></div><span style={{fontSize:13,fontWeight:600,color:htc}}>Admin</span></div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="no-print dashboard-filter-bar" style={{display:"flex",alignItems:"center",background:HDR,borderBottom:`1px solid ${htc}15`,padding:"0 22px",height:54,gap:16,flexShrink:0,flexWrap:"wrap"}}>
        <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:12,fontWeight:600,color:"#fff"}}>Frequency</span><select value={frequency} onChange={e=>{setFrequency(e.target.value);setFrequencyKey("all");}} style={{background:"#fff",color:"#1a2636",padding:"6px 30px 6px 12px",borderRadius:8,fontSize:12,cursor:"pointer"}}><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option><option value="yearly">Yearly</option></select></div>
        <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:12,fontWeight:600,color:"#fff"}}>Frequency Key</span><select value={frequencyKey} onChange={e=>setFrequencyKey(e.target.value)} style={{background:"#fff",color:"#1a2636",padding:"6px 30px 6px 12px",borderRadius:8,fontSize:12,cursor:"pointer"}}><option value="all">All Months</option>{months.map(m=><option key={m} value={m.toLowerCase()}>{m}</option>)}</select></div>
        <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:12,fontWeight:600,color:"#fff"}}>Year</span><select value={selectedYear} onChange={e=>setSelectedYear(e.target.value)} style={{background:"#fff",color:"#1a2636",padding:"6px 30px 6px 12px",borderRadius:8,fontSize:12,cursor:"pointer"}}><option value="2026">2026</option><option value="2025">2025</option><option value="2024">2024</option></select></div>
        <div style={{width:1,height:28,background:"rgba(255,255,255,0.15)"}} />
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <span style={{fontSize:12,fontWeight:600,color:"#fff"}}>Service</span>
          <select value={activeService} onChange={e=>{setActiveService(e.target.value);setHighlightedService(null);}} style={{background:"#fff",color:"#1a2636",padding:"6px 30px 6px 12px",borderRadius:8,fontSize:12,cursor:"pointer",fontWeight:600}}>
            <option value="all">All Services</option>
            {SERVICES.map(svc => (
              <option key={svc.id} value={svc.id}>{svc.id}</option>
            ))}
          </select>
        </div>
        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:8,paddingLeft:16,borderLeft:"1px solid rgba(255,255,255,0.2)"}}><span style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.55)",textTransform:"uppercase"}}>As of</span><span style={{fontSize:14,fontWeight:700,color:"#fff"}}>25 Feb 2026</span></div>
      </div>

      {/* CONTENT */}
      <div style={{flex:1,overflow:"auto",padding:"20px"}}>

        {/* ═══ ALL SERVICES OVERVIEW ═══ */}
        {activeService === "all" && (
          <>
            {/* ── KPI Cards Row (4 cards) ── */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:16}}>

              {/* 1 — Total Services */}
              <div style={{...card({padding:"16px",textAlign:"center"}),background:"linear-gradient(135deg,#0EA5E912,#8B5CF608)"}}>
                <div style={{fontSize:10,color:T.muted,textTransform:"uppercase",marginBottom:6}}>Total Services</div>
                <div style={{fontSize:32,fontWeight:800,color:T.text}}>{SERVICES.length}</div>
              </div>

              {/* 2 — Total Indicators */}
              <div style={{...card({padding:"16px",textAlign:"center"}),background:"linear-gradient(135deg,#F59E0B12,#F59E0B08)"}}>
                <div style={{fontSize:10,color:T.muted,textTransform:"uppercase",marginBottom:6}}>Total Indicators</div>
                <div style={{fontSize:32,fontWeight:800,color:"#F59E0B"}}>{totalIndicators}</div>
              </div>

              {/* 3 — Total % Deduction (all services combined) */}
              <div style={{...card({padding:"16px",textAlign:"center"}),background:"linear-gradient(135deg,#EF444412,#EF444408)"}}>
                <div style={{fontSize:10,color:T.muted,textTransform:"uppercase",marginBottom:6}}>Total % Deduction</div>
                <div style={{fontSize:32,fontWeight:800,color:T.danger}}>{overallTotalDeductionPct.toFixed(2)}<span style={{fontSize:14,fontWeight:600}}>%</span></div>
                <div style={{fontSize:9,color:T.muted,marginTop:4}}>All services combined</div>
              </div>

              {/* 4 — Total Deduction RM */}
              <div style={{...card({padding:"16px",textAlign:"center"}),background:"linear-gradient(135deg,#10B98112,#10B98108)"}}>
                <div style={{fontSize:10,color:T.muted,textTransform:"uppercase",marginBottom:6}}>Total Deduction (RM)</div>
                <div style={{fontSize:26,fontWeight:800,color:T.success,lineHeight:1.2}}>{fmtRM(overallTotalDeductionRM)}</div>
                <div style={{fontSize:9,color:T.muted,marginTop:4}}>All services combined</div>
              </div>

            </div>

            {/* ── Service Summary Cards ── */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:14,marginBottom:16}}>
              {SERVICES.map(svc=>{
                const accentBg=svc.accent+"18";
                const borderColor=svc.accent+"30";
                const isHighlighted = highlightedService === svc.id;
                const isDimmed = highlightedService && highlightedService !== svc.id;
                const isHighest = svc.overall === Math.max(...SERVICES.map(s => s.overall));
                const isLowest  = svc.overall === Math.min(...SERVICES.map(s => s.overall));
                return(
                  <div
                    key={svc.id}
                    style={{
                      ...card({padding:"16px",textAlign:"center",border:`2px solid ${isHighlighted ? svc.accent : borderColor}`,cursor:"pointer",position:"relative"}),
                      background:`linear-gradient(135deg,${accentBg},${svc.accent}08)`,
                      opacity: isDimmed ? 0.5 : 1,
                      transform: isHighlighted ? "scale(1.03)" : "scale(1)",
                      transition: "all 0.25s ease",
                      boxShadow: isHighlighted ? `0 4px 20px ${svc.accent}30` : "none",
                    }}
                    onClick={()=>setActiveService(svc.id)}
                    onMouseEnter={()=>setHighlightedService(svc.id)}
                    onMouseLeave={()=>setHighlightedService(null)}
                  >
                    {isHighest && <div style={{position:"absolute",top:8,right:8,fontSize:9,color:T.warn,fontWeight:700}}>Highest</div>}
                    {isLowest  && <div style={{position:"absolute",top:8,right:8,fontSize:9,color:T.success,fontWeight:700}}>Lowest</div>}
                    <div style={{fontSize:14,fontWeight:700,color:svc.accent,marginBottom:4,letterSpacing:"0.5px"}}>{svc.id}</div>
                    <div style={{fontSize:28,fontWeight:800,color:svc.accent,lineHeight:1,marginTop:8}}>{svc.overall.toFixed(2)}<span style={{fontSize:12,fontWeight:600}}>%</span></div>
                    <div style={{fontSize:9,color:T.muted,marginTop:4}}>% Deduction</div>
                    {/* RM amount per service */}
                    <div style={{fontSize:11,fontWeight:700,color:T.success,marginTop:8}}>{fmtRM(svc.totalDeduction)}</div>
                    <div style={{fontSize:9,color:T.muted,marginTop:2}}>Deduction (RM)</div>
                    <div style={{fontSize:9,color:svc.accent,marginTop:10,opacity:0.7,fontWeight:600}}>Hover to highlight →</div>
                  </div>
                );
              })}
            </div>

            {/* ── Charts Row ── */}
            <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:14,marginBottom:16}}>
              <div style={{...card({padding:"16px"})}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                  <span style={{fontSize:13,fontWeight:700,color:T.text}}>% Deduction Trend — All Services (Jan–Oct {selectedYear})</span>
                  {highlightedService && (
                    <span style={{fontSize:10,color:T.muted}}>Hover cards to highlight • <button onClick={()=>setHighlightedService(null)} style={{background:"transparent",border:"none",color:T.accent,cursor:"pointer",fontSize:10,fontWeight:600}}>Reset</button></span>
                  )}
                </div>
                <div style={{position:"relative",height:300}}><canvas id="overviewLine" /></div>
              </div>
              <div style={{...card({padding:"16px"})}}>
                <div style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:12}}>Overall % Deduction by Service</div>
                <div style={{position:"relative",height:300}}><canvas id="overviewBar" /></div>
              </div>
              <div style={{...card({padding:"16px"})}}>
                <div style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:12}}>Deduction Distribution</div>
                <div style={{position:"relative",height:300,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <canvas id="overviewPie" style={{maxWidth:240,maxHeight:240}} />
                </div>
              </div>
            </div>

            {/* ── Summary Table ── */}
            <div style={{...card({padding:"16px"})}}>
              <div style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:12}}>Service Deduction Summary</div>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                <thead>
                  <tr>
                    {["Service","% Deduction Overall","Deduction (RM)","Indicators","Trend","Status"].map(h=>(
                      <th key={h} style={thStyle}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SERVICES.map(svc=>(
                    <tr
                      key={svc.id}
                      style={{cursor:"pointer",background:highlightedService === svc.id ? svc.accent+"08" : "transparent",transition:"background 0.2s"}}
                      onClick={()=>setActiveService(svc.id)}
                      onMouseEnter={()=>setHighlightedService(svc.id)}
                      onMouseLeave={()=>setHighlightedService(null)}
                    >
                      <td style={{...tdStyle,fontWeight:600,color:svc.accent}}>{svc.id}</td>
                      <td style={tdStyle}>{svc.overall.toFixed(2)}%</td>
                      <td style={{...tdStyle,fontWeight:600,color:T.success}}>{fmtRM(svc.totalDeduction)}</td>
                      <td style={tdStyle}>{svc.indicators.length}</td>
                      <td style={tdStyle}>
                        <Badge color={svc.overall < 0.5 ? "green" : svc.overall < 1.0 ? "blue" : "warn"} T={T}>
                          {svc.overall < 0.5 ? "Low" : svc.overall < 1.0 ? "Moderate" : "High"}
                        </Badge>
                      </td>
                      <td style={tdStyle}>
                        <Badge color={svc.overall < 1.0 ? "green" : "warn"} T={T}>
                          {svc.overall < 1.0 ? "OK" : "Review"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  {/* ── Totals row ── */}
                  <tr style={{background:T.tableHeaderBg}}>
                    <td style={{...tdStyle,fontWeight:800,color:T.text}}>TOTAL</td>
                    <td style={{...tdStyle,fontWeight:800,color:T.danger}}>{overallTotalDeductionPct.toFixed(2)}%</td>
                    <td style={{...tdStyle,fontWeight:800,color:T.success}}>{fmtRM(overallTotalDeductionRM)}</td>
                    <td style={{...tdStyle,fontWeight:800,color:T.text}}>{totalIndicators}</td>
                    <td style={tdStyle}></td>
                    <td style={tdStyle}></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ═══ SINGLE SERVICE DETAIL VIEW ═══ */}
        {activeService !== "all" && currentService && (
          <>
            {/* Back button */}
            <div style={{marginBottom:14}}>
              <button onClick={()=>setActiveService("all")} style={{background:T.card,border:`1px solid ${T.border}`,color:T.accent,padding:"8px 16px",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:600,display:"flex",alignItems:"center",gap:6}}>
                <BIcon name="bi-arrow-left" size={14} color={T.accent} /> Back to All Services Overview
              </button>
            </div>

            {/* Service Header */}
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16,padding:"16px",...card({}),background:`linear-gradient(135deg,${currentService.accent}15,${currentService.accent}05)`,border:`1px solid ${currentService.accent}30`}}>
              <div style={{width:50,height:50,borderRadius:14,background:currentService.accent,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:800,color:"#fff"}}>{currentService.id.slice(0,1)}</div>
              <div>
                <div style={{fontSize:18,fontWeight:700,color:currentService.accent}}>{currentService.id}</div>
                <div style={{fontSize:12,color:T.muted}}>{currentService.label}</div>
              </div>
            </div>

            {/* KPI Cards — service detail (4 cards) */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:12,marginBottom:16}}>
              <div style={{background:`linear-gradient(135deg,${currentService.accent}15,${currentService.accent}05)`,borderRadius:14,padding:"18px",textAlign:"center",border:`1px solid ${currentService.accent}25`}}>
                <div style={{fontSize:11,color:currentService.accent,textTransform:"uppercase",marginBottom:8}}>% Deduction Overall</div>
                <div style={{fontSize:34,fontWeight:800,color:currentService.accent}}>{currentService.overall.toFixed(2)}%</div>
              </div>
              <div style={{...card({padding:"18px",textAlign:"center"})}}>
                <div style={{fontSize:11,color:T.muted,textTransform:"uppercase",marginBottom:8}}>Total Indicators</div>
                <div style={{fontSize:34,fontWeight:800,color:T.text}}>{currentService.indicators.length}</div>
              </div>
              <div style={{...card({padding:"18px",textAlign:"center"})}}>
                <div style={{fontSize:11,color:T.muted,textTransform:"uppercase",marginBottom:8}}>User Areas</div>
                <div style={{fontSize:34,fontWeight:800,color:T.text}}>{currentService.totalUserArea}</div>
              </div>
              <div style={{...card({padding:"18px",textAlign:"center"})}}>
                <div style={{fontSize:11,color:T.muted,textTransform:"uppercase",marginBottom:8}}>Total Deduction</div>
                <div style={{fontSize:26,fontWeight:800,color:T.success,lineHeight:1.2}}>{fmtRM(currentService.totalDeduction)}</div>
              </div>
            </div>

            {/* Indicator Cards */}
            <div style={{display:"grid",gridTemplateColumns:`repeat(${currentService.indicators.length},1fr)`,gap:12,marginBottom:16}}>
              {currentService.indicators.map((ind)=>(
                <div key={ind.label} style={{...card({padding:"14px",textAlign:"center",border:`1px solid ${ind.color}30`}),background:`linear-gradient(135deg,${ind.color}12,${ind.color}04)`}}>
                  <div style={{width:11,height:11,borderRadius:"50%",background:ind.color,display:"inline-block",marginBottom:8}} />
                  <div style={{fontSize:18,fontWeight:800,color:ind.color}}>{fmtRM(ind.deduction)}</div>
                  <div style={{fontSize:12,color:T.muted,marginTop:4}}>{ind.label} — {ind.value}%</div>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginBottom:16}}>
              <div style={{...card({padding:"16px"})}}>
                <div style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:12}}>% Deduction Trend (Jan–Oct {selectedYear})</div>
                <div style={{position:"relative",height:250}}><canvas id="serviceLine" /></div>
              </div>
              <div style={{...card({padding:"16px"})}}>
                <div style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:12}}>% Indicator Weights</div>
                <div style={{position:"relative",height:250}}><canvas id="serviceBar" /></div>
              </div>
              <div style={{...card({padding:"16px",display:"flex",flexDirection:"column"})}}>
                <div style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:12}}>Indicator Distribution</div>
                <div style={{position:"relative",flex:1,minHeight:0}}>
                  <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <canvas id="servicePie" style={{maxWidth:"100%",maxHeight:"100%"}} />
                  </div>
                </div>
                <div style={{display:"flex",flexWrap:"wrap",gap:"4px 12px",marginTop:8}}>
                  {currentService.indicators.map((ind)=>(
                    <div key={ind.label} style={{display:"flex",alignItems:"center",gap:4}}>
                      <div style={{width:6,height:6,borderRadius:"50%",background:ind.color,flexShrink:0}} />
                      <span style={{fontSize:9,color:T.muted}}>{ind.label}: {ind.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Indicator Details Table */}
            <div style={{...card({padding:"16px"})}}>
              <div style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:12}}>Indicator Details</div>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                <thead>
                  <tr>
                    {["Indicator","% Weight","Deduction (RM)","Status"].map(h=>(
                      <th key={h} style={thStyle}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentService.indicators.map((ind)=>(
                    <tr key={ind.label}>
                      <td style={{...tdStyle,fontWeight:600}}>
                        <div style={{display:"flex",alignItems:"center",gap:6}}>
                          <div style={{width:8,height:8,borderRadius:"50%",background:ind.color}} />
                          {ind.label}
                        </div>
                      </td>
                      <td style={tdStyle}>{ind.value.toFixed(2)}%</td>
                      <td style={{...tdStyle,fontWeight:600,color:ind.deduction > 0 ? T.warn : T.success}}>{fmtRM(ind.deduction)}</td>
                      <td style={tdStyle}>
                        <Badge color={ind.deduction === 0 ? "green" : "warn"} T={T}>
                          {ind.deduction === 0 ? "No Deduction" : "Has Deduction"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  {/* Totals row */}
                  <tr style={{background:T.tableHeaderBg}}>
                    <td style={{...tdStyle,fontWeight:800,color:T.text}}>Total</td>
                    <td style={{...tdStyle,fontWeight:800,color:currentService.accent}}>{currentService.overall.toFixed(2)}%</td>
                    <td style={{...tdStyle,fontWeight:800,color:T.success}}>{fmtRM(currentService.totalDeduction)}</td>
                    <td style={tdStyle}></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}