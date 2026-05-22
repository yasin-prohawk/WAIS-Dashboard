"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useDashboardNav } from "@/components/dashboard-nav-provider";

declare global { interface Window { Chart: any; XLSX: any; } }

/* ─── AW DATA ───────────────────────────────────── */
const IMPLEMENTATION_DATA = [
  { name: "Completed", value: 3210200, count: 450, color: "#22c55e" },
  { name: "In Progress", value: 890450, count: 125, color: "#ec4899" },
];

const REQUEST_STATUS_DATA = [
  { name: "Completed", value: 42, color: "#22c55e" },
  { name: "In Progress", value: 10, color: "#f97316" },
];

const FIVE_YEARS_DATA = [
  { year: "2021", number: 850, cost: 1500000, color: "#3b82f6" },
  { year: "2022", number: 920, cost: 1750000, color: "#8b5cf6" },
  { year: "2023", number: 1100, cost: 2100000, color: "#ec4899" },
  { year: "2024", number: 1300, cost: 2800000, color: "#f97316" },
  { year: "2025", number: 1500, cost: 3500000, color: "#22c55e" },
];

const AW_MONTHLY_TREND = [
  { month: "Jan", completed: 38, inProgress: 12 },
  { month: "Feb", completed: 42, inProgress: 10 },
  { month: "Mar", completed: 35, inProgress: 15 },
  { month: "Apr", completed: 40, inProgress: 11 },
  { month: "May", completed: 45, inProgress: 9 },
  { month: "Jun", completed: 48, inProgress: 8 },
  { month: "Jul", completed: 50, inProgress: 7 },
  { month: "Aug", completed: 44, inProgress: 13 },
  { month: "Sep", completed: 41, inProgress: 14 },
  { month: "Oct", completed: 46, inProgress: 10 },
  { month: "Nov", completed: 43, inProgress: 11 },
  { month: "Dec", completed: 47, inProgress: 9 },
];

const AW_BY_CATEGORY = [
  { category: "Infrastructure", count: 180, cost: 850000, color: "#3b82f6" },
  { category: "Equipment", count: 145, cost: 1200000, color: "#8b5cf6" },
  { category: "Renovation", count: 95, cost: 680000, color: "#ec4899" },
  { category: "IT Systems", count: 70, cost: 450000, color: "#f97316" },
  { category: "Others", count: 35, cost: 320000, color: "#6b7280" },
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

const C = {
  primary1: "#3b82f6",
  primary2: "#22c55e",
  support1: "#8b5cf6",
  support2: "#ec4899",
  support3: "#f97316",
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

/* ─── CHART HELPERS ─────────────────────────────── */
function drawChart(id:string,type:string,data:any,options:any){
  const c=document.getElementById(id) as HTMLCanvasElement|null;
  if(!c)return;if(!window.Chart){setTimeout(()=>drawChart(id,type,data,options),150);return;}
  const ctx=c.getContext("2d");if(!ctx)return;const ex=window.Chart.getChart(c);if(ex)ex.destroy();
  try{new window.Chart(ctx,{type:type as any,data,options:{...options,animation:false,responsive:true,maintainAspectRatio:false}});}catch(e){}
}

function mkPie(id:string,labels:string[],data:number[],colors:string[],T:Theme,cutout="65%"){
  drawChart(id,"doughnut",{labels,datasets:[{data,backgroundColor:colors,borderWidth:0}]},{cutout,plugins:{legend:{display:false}}});
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
  const opts:any={plugins:{legend:{display:extra?.plugins?.legend!==undefined?extra.plugins.legend:false}},scales:{x:{grid:{color:T.gridColor},ticks:{color:T.tickColor,font:{size:12}},border:{color:"transparent"}},y:yscale}};
  drawChart(id,"line",{labels,datasets:datasets.map((d:any)=>({...d,borderWidth:d.borderWidth||2.5,pointRadius:d.pointRadius||4,tension:0.3}))},opts);
}

/* ─── EXPORT ─────────────────────────────────────── */
function exportExcelAll(){
  if(!window.XLSX)return;
  const wb=window.XLSX.utils.book_new();
  [{name:"AW Summary",data:[["Additional Works Dashboard"],[""],["Metric","Value"],["Total Implementation (RM)","RM 4,100,650"],["Total Requests (5Y)","5,670"],["Completed Requests","42"],["In Progress Requests","10"]]}].forEach(s=>{
    const ws=window.XLSX.utils.aoa_to_sheet(s.data);
    window.XLSX.utils.book_append_sheet(wb,ws,s.name);
  });
  window.XLSX.writeFile(wb,"AW_Dashboard_Export.xlsx");
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

function ProgressBar({value,max,color,T}:{value:number;max:number;color:string;T:Theme}){
  return <div style={{height:6,background:T.border,borderRadius:4,overflow:"hidden"}}><div style={{height:"100%",width:`${Math.min(100,(value/max)*100)}%`,background:color,borderRadius:4}} /></div>;
}

function getContrastText(h:string){
  const r=parseInt(h.slice(1,3),16),g=parseInt(h.slice(3,5),16),b=parseInt(h.slice(5,7),16);
  return(r*299+g*587+b*114)/1000>128?"#ffffff":"#ffffff";
}

function Modal({title,onClose,children,T,onPrint}:{title:string;onClose:()=>void;children:React.ReactNode;T:Theme;onPrint?:()=>void}){
  return(
    <div onClick={e=>{if((e.target as HTMLElement).dataset.overlay)onClose();}} data-overlay="1" style={{position:"fixed",inset:0,background:"rgba(0,0,0,.45)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(4px)"}}>
      <div style={{background:T.panel,border:`1px solid ${T.border}`,borderRadius:20,padding:28,width:1100,maxHeight:"88vh",overflowY:"auto",boxShadow:"0 24px 60px rgba(0,0,0,.18)"}}>
        <style>{`::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:${T.scrollThumb};border-radius:99px}`}</style>
        <div className="no-print" style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <h2 style={{fontSize:20,fontWeight:700,color:T.text,margin:0}}>{title}</h2>
          <div style={{display:"flex",gap:8}}>
            <button onClick={onPrint} title="Print" style={{background:T.accent+"12",border:`1px solid ${T.accent}25`,color:T.accent,width:36,height:36,borderRadius:8,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><BIcon name="bi-printer" size={16} color={T.accent} /></button>
            <button onClick={onClose} title="Close" style={{background:T.card,border:`1px solid ${T.border}`,color:T.muted,width:36,height:36,borderRadius:8,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><BIcon name="bi-x-lg" size={16} color={T.muted} /></button>
          </div>
        </div>
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
export default function AWDashboard(){
  const { openSidebar } = useDashboardNav();
  const [activePage,setActivePage]=useState("additional");
  const [modal,setModal]=useState<string|null>(null);
  const [themeName,setThemeName]=useState<"dark"|"light">("light");
  const [frequency,setFrequency]=useState("monthly");
  const [frequencyKey,setFrequencyKey]=useState("all");
  const [selectedYear,setSelectedYear]=useState("2026");
  const [barDisplay,setBarDisplay]=useState<"number"|"cost">("number");
  const [implYear,setImplYear]=useState("2025");
  const [reqYear,setReqYear]=useState("2025");
  const T=THEMES[themeName];
  const scriptsReady=useRef(false);
  const baseChartsInited=useRef(false);
  const currentPage=NAV_PAGES.find(p=>p.key===activePage)||NAV_PAGES[0];
  const HDR="#0f172a";
  const htc=getContrastText(HDR);

  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  const formatCurrency = (value: number) => `RM ${value.toLocaleString()}`;

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
  },[themeName,barDisplay,implYear,reqYear]);

  const initCharts=()=>{
    if(!window.Chart){setTimeout(initCharts,200);return;}
    ["implPie","reqPie","fiveYearBar","trendLine","categoryPie"].forEach(id=>{
      const c=document.getElementById(id) as HTMLCanvasElement;
      if(c){const ex=window.Chart.getChart(c);if(ex)ex.destroy();}
    });

    mkPie("implPie",IMPLEMENTATION_DATA.map(d=>d.name),IMPLEMENTATION_DATA.map(d=>d.value),[C.primary2,C.support2],T,"60%");
    mkPie("reqPie",REQUEST_STATUS_DATA.map(d=>d.name),REQUEST_STATUS_DATA.map(d=>d.value),[C.primary2,C.support3],T,"60%");
    mkBar("fiveYearBar",FIVE_YEARS_DATA.map(d=>d.year),FIVE_YEARS_DATA.map(d=>barDisplay==="number"?d.number:d.cost),FIVE_YEARS_DATA.map(d=>d.color),T,{scales:{y:{ticks:{callback:(v:number)=>barDisplay==="cost"?`RM ${(v/1000000).toFixed(1)}M`:v}}}});
    mkLine("trendLine",AW_MONTHLY_TREND.map(d=>d.month),[
      {data:AW_MONTHLY_TREND.map(d=>d.completed),borderColor:C.primary2,backgroundColor:C.primary2+"22",fill:true,pointRadius:4,borderWidth:2.5,label:"Completed"},
      {data:AW_MONTHLY_TREND.map(d=>d.inProgress),borderColor:C.support3,backgroundColor:C.support3+"22",fill:true,pointRadius:4,borderWidth:2.5,label:"In Progress"},
    ],T,{plugins:{legend:{display:true}}});
    mkPie("categoryPie",AW_BY_CATEGORY.map(d=>d.category),AW_BY_CATEGORY.map(d=>d.cost),AW_BY_CATEGORY.map(d=>d.color),T,"55%");
  };

  const card=(e?:React.CSSProperties):React.CSSProperties=>({background:T.card,border:`1px solid ${T.border}`,borderRadius:16,...e});
  const panel=(e?:React.CSSProperties):React.CSSProperties=>({background:T.panel,border:`1px solid ${T.border}`,borderRadius:12,...e});
  const thStyle:React.CSSProperties={background:T.tableHeaderBg,color:T.accent,padding:"10px 14px",textAlign:"left",fontWeight:700,fontSize:12,borderBottom:`2px solid ${T.border}`};
  const tdStyle:React.CSSProperties={padding:"10px 14px",borderBottom:`1px solid ${T.border}`,color:T.text};

  return(
    <div className="dashboard-module-page" style={{fontFamily:"'DM Sans',system-ui,sans-serif",background:T.bg,color:T.text,fontSize:15,height:"100vh",display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');*,::-webkit-scrollbar{scrollbar-width:thin;scrollbar-color:${T.scrollThumb} transparent}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${T.scrollThumb};border-radius:99px}@page{size:A4 landscape;margin:10mm}@media print{body{-webkit-print-color-adjust:exact!important}.no-print{display:none!important}}`}</style>

      {/* TOP BAR */}
      <div className="no-print dashboard-top-bar" style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:HDR,borderBottom:`1px solid ${htc}15`,padding:"0 24px",height:62,flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:16}}>
          <button onClick={openSidebar} style={{background:"transparent",border:"none",color:htc,cursor:"pointer",fontSize:20,padding:"8px 11px",borderRadius:10}}><BIcon name="bi-list" size={22} color={htc} /></button>
          <Link href="/" style={{display:"flex",alignItems:"center",gap:6,padding:"6px 14px",borderRadius:8,border:`1px solid ${htc}30`,color:htc,textDecoration:"none",fontSize:13,fontWeight:500}}><BIcon name="bi-arrow-left" size={16} color={htc} /><span>Back</span></Link>
          <div><div style={{fontSize:17,fontWeight:700,color:htc}}>{currentPage.label}</div><div style={{fontSize:11,color:htc,opacity:0.6}}>Monitoring implementation and request statistics</div></div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          {activePage==="additional"&&<div style={{display:"flex",gap:8}}><button onClick={exportExcelAll} title="Export" style={{background:T.success+"12",border:`1px solid ${T.success}25`,color:T.success,width:34,height:34,borderRadius:8,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><BIcon name="bi-download" size={15} color={T.success} /></button><button onClick={printPage} title="Print" style={{background:T.accent+"12",border:`1px solid ${T.accent}25`,color:T.accent,width:34,height:34,borderRadius:8,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><BIcon name="bi-printer" size={15} color={T.accent} /></button></div>}
          <div style={{width:1,height:28,background:htc,opacity:0.12}} />
          <button onClick={()=>setThemeName(n=>n==="dark"?"light":"dark")} style={{background:"transparent",border:`1px solid ${htc}20`,color:htc,borderRadius:8,padding:"6px 12px",cursor:"pointer",fontSize:14}}><BIcon name={themeName==="dark"?"bi-sun-fill":"bi-moon-fill"} size={15} color={htc} /></button>
          <span style={{fontSize:13,color:htc,opacity:0.7}}>25 Feb 2026</span>
          <div style={{display:"flex",alignItems:"center",gap:10,padding:"4px 12px 4px 4px",background:htc+"08",borderRadius:24,border:`1px solid ${htc}20`}}><div style={{width:30,height:30,borderRadius:"50%",background:`linear-gradient(135deg,${C.primary1},${C.support1})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"#fff"}}><BIcon name="bi-person-fill" size={13} color="#fff" /></div><span style={{fontSize:13,fontWeight:600,color:htc}}>Admin</span></div>
        </div>
      </div>

      {/* SIDEBAR */}
      {activePage!=="additional"&&(<div style={{flex:1}}><PlaceholderPage page={currentPage} T={T} /></div>)}

      {activePage==="additional"&&(<>
        {/* FILTER BAR */}
        <div className="no-print dashboard-filter-bar" style={{display:"flex",alignItems:"center",background:HDR,borderBottom:`1px solid ${htc}15`,padding:"0 22px",height:54,gap:16,flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:12,fontWeight:600,color:"#fff"}}>Frequency</span><select value={frequency} onChange={e=>{setFrequency(e.target.value);setFrequencyKey("all");}} style={{background:"#fff",color:"#1a2636",padding:"6px 30px 6px 12px",borderRadius:8,fontSize:12,cursor:"pointer"}}><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option><option value="yearly">Yearly</option></select></div>
          <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:12,fontWeight:600,color:"#fff"}}>Frequency Key</span><select value={frequencyKey} onChange={e=>setFrequencyKey(e.target.value)} style={{background:"#fff",color:"#1a2636",padding:"6px 30px 6px 12px",borderRadius:8,fontSize:12,cursor:"pointer"}}><option value="all">All Months</option>{months.map(m=><option key={m} value={m.toLowerCase()}>{m}</option>)}</select></div>
          <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:12,fontWeight:600,color:"#fff"}}>Year</span><select value={selectedYear} onChange={e=>setSelectedYear(e.target.value)} style={{background:"#fff",color:"#1a2636",padding:"6px 30px 6px 12px",borderRadius:8,fontSize:12,cursor:"pointer"}}><option value="2026">2026</option><option value="2025">2025</option><option value="2024">2024</option></select></div>
          <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:8,paddingLeft:16,borderLeft:"1px solid rgba(255,255,255,0.2)"}}><span style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.55)",textTransform:"uppercase"}}>As of</span><span style={{fontSize:14,fontWeight:700,color:"#fff"}}>25 Feb 2026</span></div>
        </div>

        {/* CONTENT */}
        <div style={{flex:1,overflow:"auto",padding:"20px"}}>
          {/* ROW 1: 5-Year Trend + Request Status */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
            {/* 5-Year Trend */}
            <div style={{...card({padding:"18px",display:"flex",flexDirection:"column"})}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
                <div>
                  <div style={{fontSize:14,fontWeight:700,color:T.text}}>Total AW Request (Past 5 Years)</div>
                  <div style={{fontSize:11,color:T.muted,marginTop:2}}>Yearly growth and cost analysis</div>
                </div>
                <select value={barDisplay} onChange={e=>setBarDisplay(e.target.value as any)} style={{background:T.selectBg,border:`1px solid ${T.border}`,color:T.text,padding:"6px 28px 6px 10px",borderRadius:8,fontSize:11,cursor:"pointer"}}>
                  <option value="number">Number</option>
                  <option value="cost">Total Cost</option>
                </select>
              </div>
              <div style={{flex:1,position:"relative",minHeight:280}}>
                <canvas id="fiveYearBar" style={{position:"absolute",inset:0,width:"100%",height:"100%"}} />
              </div>
            </div>

            {/* Request Status */}
            <div style={{...card({padding:"18px",display:"flex",flexDirection:"column"})}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
                <div>
                  <div style={{fontSize:14,fontWeight:700,color:T.text}}>AW Request Status</div>
                  <div style={{fontSize:11,color:T.muted,marginTop:2}}>Completed vs In Progress</div>
                </div>
                <select value={reqYear} onChange={e=>setReqYear(e.target.value)} style={{background:T.selectBg,border:`1px solid ${T.border}`,color:T.text,padding:"6px 28px 6px 10px",borderRadius:8,fontSize:11,cursor:"pointer"}}>
                  {["2021","2022","2023","2024","2025"].map(y=><option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div style={{flex:1,display:"flex",alignItems:"center",gap:16}}>
                <div style={{position:"relative",width:200,height:200,flexShrink:0}}>
                  <canvas id="reqPie" style={{position:"absolute",inset:0,width:"100%",height:"100%"}} />
                </div>
                <div style={{flex:1,display:"flex",flexDirection:"column",gap:10}}>
                  {REQUEST_STATUS_DATA.map(item=>(
                    <div key={item.name} style={{padding:"12px",background:T.panel,borderRadius:10,border:`1px solid ${T.border}`}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                        <div style={{width:8,height:8,borderRadius:"50%",background:item.color}} />
                        <span style={{fontSize:12,fontWeight:600,color:T.text}}>{item.name}</span>
                      </div>
                      <div style={{fontSize:20,fontWeight:800,color:item.color}}>{item.value.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ROW 2: Implementation + Category */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
            {/* Implementation */}
            <div style={{...card({padding:"18px",display:"flex",flexDirection:"column"})}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
                <div>
                  <div style={{fontSize:14,fontWeight:700,color:T.text}}>AW Implementation</div>
                  <div style={{fontSize:11,color:T.muted,marginTop:2}}>Completed vs In Progress</div>
                </div>
                <select value={implYear} onChange={e=>setImplYear(e.target.value)} style={{background:T.selectBg,border:`1px solid ${T.border}`,color:T.text,padding:"6px 28px 6px 10px",borderRadius:8,fontSize:11,cursor:"pointer"}}>
                  {["2021","2022","2023","2024","2025"].map(y=><option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div style={{flex:1,display:"flex",alignItems:"center",gap:16}}>
                <div style={{position:"relative",width:200,height:200,flexShrink:0}}>
                  <canvas id="implPie" style={{position:"absolute",inset:0,width:"100%",height:"100%"}} />
                </div>
                <div style={{flex:1,display:"flex",flexDirection:"column",gap:10}}>
                  {IMPLEMENTATION_DATA.map(item=>(
                    <div key={item.name} style={{padding:"12px",background:T.panel,borderRadius:10,border:`1px solid ${T.border}`}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                        <div style={{width:8,height:8,borderRadius:"50%",background:item.color}} />
                        <span style={{fontSize:12,fontWeight:600,color:T.text}}>{item.name}</span>
                        <span style={{fontSize:10,color:T.muted,marginLeft:"auto"}}>{item.count} requests</span>
                      </div>
                      <div style={{fontSize:20,fontWeight:800,color:item.color}}>{formatCurrency(item.value)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Category Distribution */}
            <div style={{...card({padding:"18px",display:"flex",flexDirection:"column"})}}>
              <div style={{marginBottom:16}}>
                <div style={{fontSize:14,fontWeight:700,color:T.text}}>AW by Category</div>
                <div style={{fontSize:11,color:T.muted,marginTop:2}}>Cost distribution by category</div>
              </div>
              <div style={{flex:1,display:"flex",alignItems:"center",gap:16}}>
                <div style={{position:"relative",width:180,height:180,flexShrink:0}}>
                  <canvas id="categoryPie" style={{position:"absolute",inset:0,width:"100%",height:"100%"}} />
                </div>
                <div style={{flex:1}}>
                  {AW_BY_CATEGORY.map((cat,i)=>(
                    <div key={cat.category} style={{marginBottom:8}}>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        <div style={{width:8,height:8,borderRadius:"50%",background:cat.color}} />
                        <span style={{fontSize:11,color:T.muted}}>{cat.category}</span>
                        <span style={{fontSize:10,color:T.muted,marginLeft:"auto"}}>{cat.count} req</span>
                      </div>
                      <div style={{fontSize:14,fontWeight:700,color:T.text,marginLeft:14}}>{formatCurrency(cat.cost)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ROW 3: Monthly Trend */}
          <div style={{...card({padding:"18px",display:"flex",flexDirection:"column"})}}>
            <div style={{marginBottom:12}}>
              <div style={{fontSize:14,fontWeight:700,color:T.text}}>Monthly Request Trend</div>
              <div style={{fontSize:11,color:T.muted,marginTop:2}}>Completed vs In Progress by Month</div>
            </div>
            <div style={{position:"relative",height:250}}>
              <canvas id="trendLine" style={{position:"absolute",inset:0,width:"100%",height:"100%"}} />
            </div>
            <div style={{display:"flex",gap:16,marginTop:8}}>
              <div style={{display:"flex",alignItems:"center",gap:5,fontSize:10,color:T.muted}}><div style={{width:7,height:7,borderRadius:"50%",background:C.primary2}} />Completed</div>
              <div style={{display:"flex",alignItems:"center",gap:5,fontSize:10,color:T.muted}}><div style={{width:7,height:7,borderRadius:"50%",background:C.support3}} />In Progress</div>
            </div>
          </div>
        </div>
      </>)}
    </div>
  );
}