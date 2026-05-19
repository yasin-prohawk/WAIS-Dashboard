"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

declare global { interface Window { Chart: any; XLSX: any; } }

/* ─── DATA ─────────────────────────────────────── */
const M6    = ["Sep '25","Oct '25","Nov '25","Dec '25","Jan '26","Feb '26"];
const FINM  = ["Aug '25","Sep '25","Oct '25","Nov '25","Dec '25","Jan '26"];
const DM    = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct"];
const DV    = [0.49,0.47,0.42,0.38,0.45,0.48,0.37,0.36,0.45,0.48];
const JIO   = [99.42,99.18,99.55,99.31,99.63,99.27,99.48,99.36,99.51,99.44];
const CI    = ["% C1","% C2","% C3","% C4","% C5","% C6"];
const CV    = [74.73,16.58,7.41,0.78,0.00,0.50];
const CC    = ["#7c3aed","#0891b2","#0d9488","#dc2626","#9333ea","#64748b"];

const C = {
  primary1:  "#A05AFF",
  primary2:  "#1BCFB4",
  support1:  "#4BCBEB",
  support2:  "#FE9496",
  support3:  "#9E58FF",
};

const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

/* ─── THEMES ────────────────────────────────────── */
const THEMES = {
  dark: { bg:"#0d1520", panel:"#111d2b", card:"#162233", border:"#1e3248", text:"#e0e7ff", muted:"#8a9cb8", accent:"#5a9fd4", success:"#22c55e", warn:"#f59e0b", danger:"#ef4444", gridColor:"rgba(255,255,255,0.07)", tickColor:"#6b8099", scrollThumb:"#2a3f55", inputBg:"#162233", selectBg:"#162233", tableHeaderBg:"rgba(90,159,212,0.08)" },
  light: { bg:"#f0f4f8", panel:"#ffffff", card:"#ffffff", border:"#dde3ed", text:"#1a2636", muted:"#6b7fa3", accent:"#1a6bb5", success:"#16a34a", warn:"#d97706", danger:"#dc2626", gridColor:"rgba(0,0,0,0.06)", tickColor:"#8a9cb8", scrollThumb:"#c5cfe0", inputBg:"#f8fafc", selectBg:"#f8fafc", tableHeaderBg:"rgba(26,107,181,0.06)" },
};
type Theme = typeof THEMES.dark;

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

const CLS_TABS = [
  { key:"ji", label:"Percentage JI" },
  { key:"area", label:"Total Cleanable Area" },
  { key:"consumable", label:"Consumable Adequacy" },
  { key:"waste", label:"Waste Collection" },
  { key:"manpower", label:"Manpower Efficiency" },
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
function mkLineChart(id:string,labels:string[],datasets:any[],T:Theme,yscaleOpts?:any){
  const yticks:any={color:T.tickColor,font:{size:12}};
  if(yscaleOpts?.callback)yticks.callback=yscaleOpts.callback;
  const yscale:any={grid:{color:T.gridColor},border:{color:"transparent"},ticks:yticks};
  if(yscaleOpts?.min!==undefined)yscale.min=yscaleOpts.min;
  if(yscaleOpts?.max!==undefined)yscale.max=yscaleOpts.max;
  drawChart(id,"line",{labels,datasets:datasets.map((d:any)=>({...d,borderWidth:d.borderWidth||2.5,pointRadius:d.pointRadius||4,tension:0.3}))},{plugins:{legend:{display:yscaleOpts?.showLegend?true:false}},scales:{x:{grid:{color:T.gridColor},ticks:{color:T.tickColor,font:{size:12}},border:{color:"transparent"}},y:yscale}});
}
function mkPieChart(id:string,labels:string[],data:number[],colors:string[],T:Theme,cutout="65%"){
  drawChart(id,"doughnut",{labels,datasets:[{data,backgroundColor:colors,borderWidth:0}]},{cutout,plugins:{legend:{display:false}}});
}

/* ─── EXPORT ─────────────────────────────────────── */
function exportExcelAll(){if(!window.XLSX)return;const wb=window.XLSX.utils.book_new();[{name:"Summary",data:[["CLS Dashboard"],["Metric","Value"],["JI %","99.55%"]]}].forEach(s=>{const ws=window.XLSX.utils.aoa_to_sheet(s.data);window.XLSX.utils.book_append_sheet(wb,ws,s.name);});window.XLSX.writeFile(wb,"CLS_Dashboard_Export.xlsx");}
function printPage(){const s=document.createElement('style');s.id='ps';s.textContent='@page{size:A4 landscape;margin:10mm}@media print{body{-webkit-print-color-adjust:exact!important}.no-print{display:none!important}}';document.head.appendChild(s);window.print();setTimeout(()=>{const e=document.getElementById('ps');if(e)e.remove();},1000);}

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
  return(<div style={{height:6,background:T.border,borderRadius:4,overflow:"hidden"}}><div style={{height:"100%",width:`${Math.min(100,(value/max)*100)}%`,background:color,borderRadius:4}} /></div>);
}
function getContrastText(h:string){const r=parseInt(h.slice(1,3),16),g=parseInt(h.slice(3,5),16),b=parseInt(h.slice(5,7),16);return(r*299+g*587+b*114)/1000>128?"#1a2636":"#ffffff";}

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

function Modal({title,onClose,children,T,onPrint,onExport}:{title:string;onClose:()=>void;children:React.ReactNode;T:Theme;onPrint?:()=>void;onExport?:()=>void}){
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

function PlaceholderPage({page,T}:{page:typeof NAV_PAGES[0];T:Theme}){
  return(<div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column" as const,gap:20,color:T.muted}}><BIcon name={page.icon} size={56} color={T.muted} /><div style={{fontSize:24,fontWeight:700,color:T.text}}>{page.label}</div></div>);
}

/* ─── MAIN ──────────────────────────────────────── */
export default function CLSDashboard(){
  const [navOpen,setNavOpen]=useState(false);
  const [activePage,setActivePage]=useState("cls");
  const [activeTab,setActiveTab]=useState("ji");
  const [modal,setModal]=useState<string|null>(null);
  const [penTab,setPenTab]=useState("critical");
  const [themeName,setThemeName]=useState<"dark"|"light">("light");
  const [frequency,setFrequency]=useState("monthly");
  const [frequencyKey,setFrequencyKey]=useState("all");
  const [selectedYear,setSelectedYear]=useState("2026");
  const [startDate,setStartDate]=useState("2025-08-01");
  const [endDate,setEndDate]=useState("2026-01-31");
  const [modalStartDate,setModalStartDate]=useState("2025-01-01");
  const [modalEndDate,setModalEndDate]=useState("2025-12-31");
  const [modalYear,setModalYear]=useState("2025");
  const [modalMonth,setModalMonth]=useState("all");
  const T=THEMES[themeName];
  const scriptsReady=useRef(false);
  const baseChartsInited=useRef(false);
  const currentPage=NAV_PAGES.find(p=>p.key===activePage)||NAV_PAGES[0];
  const HDR="#0f172a";
  const htc=getContrastText(HDR);

  const financeCallback = (v: number) => {if(v>=1000)return"RM "+(v/1000).toFixed(0)+"k";return"RM "+v;};
  const pctCallback = (v: number) => v+"%";

  useEffect(()=>{
    if(scriptsReady.current)return;
    const load=(src:string,cb:()=>void)=>{const s=document.createElement("script");s.src=src;s.onload=cb;document.head.appendChild(s);};
    load("https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js",()=>{load("https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js",()=>{scriptsReady.current=true;setTimeout(()=>{initBase();baseChartsInited.current=true;},400);});});
  },[]);
  useEffect(()=>{if(scriptsReady.current&&baseChartsInited.current){setTimeout(initBase,200);if(activeTab!=="ji")setTimeout(()=>initTab(activeTab),250);}},[themeName,activeTab,startDate,endDate]);

  const initBase=()=>{
    if(!window.Chart){setTimeout(initBase,200);return;}
    ["jiDonutMain","jiMonthChart","jiItemChart","jiWeeklyChart","financeChart"].forEach(id=>{const c=document.getElementById(id) as HTMLCanvasElement;if(c){const ex=window.Chart.getChart(c);if(ex)ex.destroy();}});
    mkPieChart("jiDonutMain",["Satisfactory","Unsatisfactory"],[99.38,0.62],[C.primary2,T.border],T,"65%");
    mkLineChart("jiMonthChart",M6,[{data:[99.40,99.43,99.45,99.47,99.47,99.55],borderColor:T.accent,backgroundColor:T.accent+"22",fill:true,pointRadius:5,borderWidth:3},{data:[95,95,95,95,95,95],borderColor:T.danger,borderDash:[4,3],borderWidth:2.5,pointRadius:0}],T,{min:94,max:100.5,callback:pctCallback});
    mkBar("jiItemChart",["Floor","Walls","Ceiling","Win & Doors","Receptacles","Furnitures"],[99.3,99.83,99.68,99.56,99.98,99.1],Array(6).fill(C.primary2),T);
    mkBar("jiWeeklyChart",["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],[99.5,99.2,99.7,99.1,99.4,99.6,99.3],Array(7).fill(C.primary2),T);
    mkLineChart("financeChart",FINM,[{data:[20105,19326,34552,40710,0,0],borderColor:T.accent,backgroundColor:T.accent+"22",fill:true,pointRadius:5,borderWidth:3},{data:[0,0,0,0,0,175],borderColor:T.danger,backgroundColor:T.danger+"18",fill:true,pointRadius:5,borderWidth:3}],T,{callback:financeCallback});
  };

  const initTab=(tab:string)=>{
    if(!window.Chart){setTimeout(()=>initTab(tab),200);return;}
    ["srTypePie","top5Chart","jiOverallChart","consumChart","wasteChart","manChart"].forEach(id=>{const c=document.getElementById(id) as HTMLCanvasElement;if(c){const ex=window.Chart.getChart(c);if(ex)ex.destroy();}});
    if(tab==="area"){mkPieChart("srTypePie",["User Request","Non Conformance","Incident"],[14944,7195,1],[C.primary1,C.primary2,C.support2],T,"55%");mkBar("top5Chart",["LOC-001","LOC-002","LOC-003","LOC-004","LOC-005"],[842,715,634,521,489],[C.primary1,C.primary2,C.support1,C.support2,C.support3],T);mkBar("jiOverallChart",DM,JIO,JIO.map(v=>v>=99.5?C.primary2:v>=99.2?C.support1:C.primary1),T,{indexAxis:"y"});}
    if(tab==="consumable")mkLineChart("consumChart",M6,[{data:[98.1,98.4,99.0,98.7,98.9,98.7],borderColor:C.primary2,backgroundColor:C.primary2+"22",fill:true,pointRadius:5,borderWidth:3},{data:[95,95,95,95,95,95],borderColor:T.danger,borderDash:[4,3],borderWidth:2.5,pointRadius:0}],T,{min:93,max:101,callback:pctCallback});
    if(tab==="waste")mkLineChart("wasteChart",M6,[{data:[99.2,98.9,99.3,99.0,99.4,99.1],borderColor:C.primary2,backgroundColor:C.primary2+"22",fill:true,pointRadius:5,borderWidth:3},{data:[95,95,95,95,95,95],borderColor:T.danger,borderDash:[4,3],borderWidth:2.5,pointRadius:0}],T,{min:93,max:101,callback:pctCallback});
    if(tab==="manpower")mkLineChart("manChart",M6,[{data:[93.1,94.0,93.8,94.5,94.1,94.3],borderColor:T.accent,backgroundColor:T.accent+"22",fill:true,pointRadius:5,borderWidth:3}],T,{min:90,max:97,callback:pctCallback});
  };

  const openModal=(id:string)=>{
    setModal(id);
    setModalStartDate("2025-01-01");
    setModalEndDate("2025-12-31");
    setModalYear("2025");
    setModalMonth("all");
    setTimeout(()=>{
      ["m-srBar","m-ncrBar","m-cBar","m-deductLine","m-finLine","m-jiDonut"].forEach(i=>{const c=document.getElementById(i) as HTMLCanvasElement;if(c){const ex=window.Chart.getChart(c);if(ex)ex.destroy();}});
      if(id==="sr")mkBar("m-srBar",["Total","Normal","Outstanding","Done","Critical"],[274,274,235,39,0],[T.accent,T.success,T.warn,T.success,T.danger],T);
      if(id==="ncr")mkBar("m-ncrBar",M6,[45,62,38,71,55,108],Array(6).fill(T.warn),T);
      if(id==="deduct"){mkBar("m-cBar",CI,CV,CC,T,{indexAxis:"y"});mkLineChart("m-deductLine",DM,[{data:DV,borderColor:C.support2,backgroundColor:C.support2+"22",fill:true,pointRadius:5,borderWidth:3}],T,{callback:pctCallback});}
      if(id==="finance")mkLineChart("m-finLine",FINM,[{data:[20105,19326,34552,40710,0,0],borderColor:T.accent,backgroundColor:T.accent+"22",fill:true,pointRadius:6,borderWidth:3,label:"Invoice"},{data:[0,0,0,0,0,175],borderColor:T.danger,backgroundColor:T.danger+"18",fill:true,pointRadius:6,borderWidth:3,label:"Penalty"}],T,{callback:financeCallback,showLegend:true});
      if(id==="jiKpi")mkPieChart("m-jiDonut",["Satisfactory","Unsatisfactory"],[99.38,0.62],[C.primary2,T.border],T,"60%");
    },200);
  };

  const card=(e?:React.CSSProperties):React.CSSProperties=>({background:T.card,border:`1px solid ${T.border}`,borderRadius:16,...e});
  const panel=(e?:React.CSSProperties):React.CSSProperties=>({background:T.panel,border:`1px solid ${T.border}`,borderRadius:12,...e});

  const thStyle:React.CSSProperties={background:T.tableHeaderBg,color:T.accent,padding:"10px 14px",textAlign:"left",fontWeight:700,fontSize:12,borderBottom:`2px solid ${T.border}`};
  const tdStyle:React.CSSProperties={padding:"10px 14px",borderBottom:`1px solid ${T.border}`,color:T.text};

  const srStatData = [
    {v:"274",l:"Total SR",c:T.accent},
    {v:"274",l:"Normal",c:T.success},
    {v:"235",l:"Outstanding",c:T.warn},
    {v:"39",l:"Done",c:T.success},
    {v:"0",l:"Critical",c:T.danger},
    {v:"85.8%",l:"Completion",c:C.primary1},
  ];

  const ncrStatData = [
    {v:"108",l:"Total NCR",c:T.warn},
    {v:"89",l:"Open",c:T.danger},
    {v:"19",l:"Closed",c:T.success},
    {v:"17.6%",l:"Closure Rate",c:C.primary1},
  ];

  const srTypeData = [
    {c:C.primary1,l:"User Request",v:"14,944",p:"67.5%"},
    {c:C.primary2,l:"Non Conformance",v:"7,195",p:"32.5%"},
    {c:C.support2,l:"Incident",v:"1",p:"0.0%"},
  ];

  const srTableData: string[][] = [
    ["User Request","14,944","67.5%","Overall"],
    ["Non Conformance","7,195","32.5%","Overall"],
    ["Normal SR","274","100%","Feb'26"],
    ["Outstanding","235","85.8%","Feb'26"],
    ["Done","39","14.2%","Feb'26"],
  ];

  const ncrTableData: string[][] = [
    ["Sep '25","45","38","7","15.6%"],
    ["Oct '25","62","52","10","16.1%"],
    ["Nov '25","38","30","8","21.1%"],
    ["Dec '25","71","60","11","15.5%"],
    ["Jan '26","55","46","9","16.4%"],
    ["Feb '26","108","89","19","17.6%"],
  ];

  const deductTableData: string[][] = [
    ["C.1","74.73%","RM 0.00"],
    ["C.2","16.58%","RM 0.00"],
    ["C.3","7.41%","RM 0.00"],
    ["C.4","0.78%","RM 0.00"],
    ["C.5","0.00%","RM 0.00"],
    ["C.6","0.50%","RM 0.00"],
  ];

  const financeTableData: string[][] = [
    ["Aug '25","20,105.45","0.00"],
    ["Sep '25","19,326.36","0.00"],
    ["Oct '25","34,551.95","0.00"],
    ["Nov '25","40,709.76","0.00"],
    ["Dec '25","0.00","0.00"],
    ["Jan '26","0.00","175.19"],
  ];

  const jiTableData: string[][] = DM.map((m,i)=>[m,DV[i].toFixed(2)+"%",JIO[i].toFixed(2)+"%"]);

  const renderTableCell = (content: any): React.ReactNode => {
    if (content === null || content === undefined) return '';
    if (typeof content === 'object') {
      if (React.isValidElement(content)) return content;
      return JSON.stringify(content);
    }
    return String(content);
  };

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
    <div style={{fontFamily:"'DM Sans',system-ui,sans-serif",background:T.bg,color:T.text,fontSize:15,height:"100vh",display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');*,::-webkit-scrollbar{scrollbar-width:thin;scrollbar-color:${T.scrollThumb} transparent}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track:transparent;::-webkit-scrollbar-thumb{background:${T.scrollThumb};border-radius:99px}@page{size:A4 landscape;margin:10mm}@media print{body{-webkit-print-color-adjust:exact!important}.no-print{display:none!important}}`}</style>

      {/* TOP BAR */}
      <div className="no-print" style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:HDR,borderBottom:`1px solid ${htc}15`,padding:"0 24px",height:62,flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:16}}>
          <button onClick={()=>setNavOpen(o=>!o)} style={{background:"transparent",border:"none",color:htc,cursor:"pointer",fontSize:20,padding:"8px 11px",borderRadius:10}}><BIcon name="bi-list" size={22} color={htc} /></button>
          <Link href="/" style={{display:"flex",alignItems:"center",gap:6,padding:"6px 14px",borderRadius:8,border:`1px solid ${htc}30`,color:htc,textDecoration:"none",fontSize:13,fontWeight:500}}><BIcon name="bi-arrow-left" size={16} color={htc} /><span>Back</span></Link>
          <div><div style={{fontSize:17,fontWeight:700,color:htc}}>{currentPage.label}</div><div style={{fontSize:11,color:htc,opacity:0.6}}>CLS Performance Dashboard</div></div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          {activePage==="cls"&&<div style={{display:"flex",gap:8}}><button onClick={exportExcelAll} title="Export" style={{background:T.success+"12",border:`1px solid ${T.success}25`,color:T.success,width:34,height:34,borderRadius:8,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><BIcon name="bi-download" size={15} color={T.success} /></button><button onClick={printPage} title="Print" style={{background:T.accent+"12",border:`1px solid ${T.accent}25`,color:T.accent,width:34,height:34,borderRadius:8,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><BIcon name="bi-printer" size={15} color={T.accent} /></button></div>}
          <div style={{width:1,height:28,background:htc,opacity:0.12}} />
          <button onClick={()=>setThemeName(n=>n==="dark"?"light":"dark")} style={{background:"transparent",border:`1px solid ${htc}20`,color:htc,borderRadius:8,padding:"6px 12px",cursor:"pointer",fontSize:14}}><BIcon name={themeName==="dark"?"bi-sun-fill":"bi-moon-fill"} size={15} color={htc} /></button>
          <span style={{fontSize:13,color:htc,opacity:0.7}}>25 Feb 2026</span>
          <div style={{display:"flex",alignItems:"center",gap:10,padding:"4px 12px 4px 4px",background:htc+"08",borderRadius:24,border:`1px solid ${htc}20`}}><div style={{width:30,height:30,borderRadius:"50%",background:`linear-gradient(135deg,${C.primary1},${C.primary2})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"#fff"}}><BIcon name="bi-person-fill" size={13} color="#fff" /></div><span style={{fontSize:13,fontWeight:600,color:htc}}>Admin</span></div>
        </div>
      </div>

      {/* SIDEBAR */}
      {navOpen&&(<div onClick={e=>{if((e.target as HTMLElement).dataset.overlay)setNavOpen(false);}} data-overlay="1" className="no-print" style={{position:"fixed",inset:0,background:"rgba(0,0,0,.4)",zIndex:400}}><div style={{position:"absolute",left:0,top:0,bottom:0,width:320,background:HDR,display:"flex",flexDirection:"column"}}><div style={{padding:"20px 18px",borderBottom:`1px solid ${htc}15`,display:"flex",justifyContent:"space-between"}}><div><div style={{fontSize:16,fontWeight:700,color:htc}}>Dashboard Menu</div></div><button onClick={()=>setNavOpen(false)} style={{background:"rgba(255,255,255,0.08)",color:htc,width:34,height:34,borderRadius:8,cursor:"pointer",border:"none"}}><BIcon name="bi-x-lg" size={18} color={htc} /></button></div><div style={{flex:1,overflowY:"auto",padding:"8px 0"}}>{NAV_PAGES.map(p=>{const a=activePage===p.key;return(<Link key={p.key} href={p.href} onClick={()=>setNavOpen(false)} style={{padding:"12px 18px",cursor:"pointer",display:"flex",alignItems:"center",gap:12,background:a?T.accent+"10":"transparent",borderLeft:`3px solid ${a?T.accent:"transparent"}`,textDecoration:"none"}}><div style={{width:38,height:38,borderRadius:10,background:a?T.accent+"18":"rgba(255,255,255,0.04)",display:"flex",alignItems:"center",justifyContent:"center"}}><BIcon name={p.icon} size={18} color={a?T.accent:htc} /></div><div style={{fontSize:13,fontWeight:a?600:400,color:htc,opacity:a?1:0.65}}>{p.label}</div></Link>);})}</div></div></div>)}

      {activePage!=="cls"&&(<div style={{flex:1}}><PlaceholderPage page={currentPage} T={T} /></div>)}

      {activePage==="cls"&&(<>
        {/* FILTER BAR */}
        <div className="no-print" style={{display:"flex",alignItems:"center",background:HDR,borderBottom:`1px solid ${htc}15`,padding:"0 22px",height:54,gap:12,flexShrink:0,flexWrap:"wrap"}}>
          <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:12,fontWeight:600,color:"#fff"}}>Frequency</span><select value={frequency} onChange={e=>{setFrequency(e.target.value);setFrequencyKey("all");}} style={{background:"#fff",color:"#1a2636",padding:"6px 30px 6px 12px",borderRadius:8,fontSize:12,cursor:"pointer"}}><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option><option value="yearly">Yearly</option></select></div>
          <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:12,fontWeight:600,color:"#fff"}}>Frequency Key</span><select value={frequencyKey} onChange={e=>setFrequencyKey(e.target.value)} style={{background:"#fff",color:"#1a2636",padding:"6px 30px 6px 12px",borderRadius:8,fontSize:12,cursor:"pointer"}}><option value="all">All Months</option>{months.map(m=><option key={m} value={m.toLowerCase()}>{m}</option>)}</select></div>
          <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:12,fontWeight:600,color:"#fff"}}>Year</span><select value={selectedYear} onChange={e=>setSelectedYear(e.target.value)} style={{background:"#fff",color:"#1a2636",padding:"6px 30px 6px 12px",borderRadius:8,fontSize:12,cursor:"pointer"}}><option value="2026">2026</option><option value="2025">2025</option><option value="2024">2024</option></select></div>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <span style={{fontSize:12,fontWeight:600,color:"#fff"}}>Start Date</span>
            <input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} style={inputStyle} />
          </div>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <span style={{fontSize:12,fontWeight:600,color:"#fff"}}>End Date</span>
            <input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} style={inputStyle} />
          </div>
          <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:8,paddingLeft:16,borderLeft:"1px solid rgba(255,255,255,0.2)"}}><span style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.55)",textTransform:"uppercase"}}>As of</span><span style={{fontSize:14,fontWeight:700,color:"#fff"}}>25 Feb 2026</span></div>
        </div>

        <div style={{flex:1,display:"flex",overflow:"hidden",padding:"16px",gap:16}}>
          {/* LEFT COLUMN */}
          <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",gap:14}}>
            <div style={{display:"flex",gap:14,flexShrink:0}}>
              <div style={{...card({flex:1,padding:"18px 20px"}),position:"relative"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:14,paddingRight:40}}><span style={{fontSize:14,fontWeight:700,color:T.text}}>Service Request</span><Badge color="blue" T={T}>Feb'26</Badge></div>
                <div style={{display:"flex",gap:16,alignItems:"flex-start"}}><div style={{textAlign:"center"}}><div style={{fontSize:42,fontWeight:800,color:T.text}}>274</div><div style={{fontSize:10,color:T.muted,marginTop:3}}>Total SR</div></div><div style={{flex:1,display:"flex",flexDirection:"column",gap:8,paddingTop:4}}>
                  <div><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:11,color:T.muted}}>Outstanding</span><span style={{fontSize:12,fontWeight:700,color:T.warn}}>235</span></div><ProgressBar value={235} max={274} color={T.warn} T={T} /></div>
                  <div><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:11,color:T.muted}}>Done</span><span style={{fontSize:12,fontWeight:700,color:T.success}}>39</span></div><ProgressBar value={39} max={274} color={T.success} T={T} /></div>
                  <div><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:11,color:T.muted}}>Critical</span><span style={{fontSize:12,fontWeight:700,color:T.danger}}>0</span></div><ProgressBar value={0} max={274} color={T.danger} T={T} /></div>
                </div></div>
                <button className="no-print" onClick={()=>openModal("sr")} style={{position:"absolute",top:16,right:18,background:T.panel,border:`1px solid ${T.border}`,color:T.muted,width:30,height:30,borderRadius:8,cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center"}}><BIcon name="bi-arrows-angle-expand" size={14} color={T.muted} /></button>
              </div>
              <div style={{...card({flex:1,padding:"18px 20px"}),position:"relative"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:14,paddingRight:40}}><span style={{fontSize:14,fontWeight:700,color:T.text}}>NCR</span><Badge color="warn" T={T}>Feb'26</Badge></div>
                <div style={{display:"flex",gap:16,alignItems:"flex-start"}}><div style={{textAlign:"center"}}><div style={{fontSize:42,fontWeight:800,color:T.text}}>108</div><div style={{fontSize:10,color:T.muted,marginTop:3}}>Total NCR</div></div><div style={{flex:1,display:"flex",flexDirection:"column",gap:8,paddingTop:4}}>
                  <div><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:11,color:T.muted}}>Open</span><span style={{fontSize:12,fontWeight:700,color:T.danger}}>89 (82.4%)</span></div><ProgressBar value={89} max={108} color={T.danger} T={T} /></div>
                  <div><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:11,color:T.muted}}>Closed</span><span style={{fontSize:12,fontWeight:700,color:T.success}}>19 (17.6%)</span></div><ProgressBar value={19} max={108} color={T.success} T={T} /></div>
                  <div style={{paddingTop:4,borderTop:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between"}}><span style={{fontSize:11,color:T.muted}}>Closure Rate</span><span style={{fontSize:13,fontWeight:700,color:C.primary1}}>17.6%</span></div>
                </div></div>
                <button className="no-print" onClick={()=>openModal("ncr")} style={{position:"absolute",top:16,right:18,background:T.panel,border:`1px solid ${T.border}`,color:T.muted,width:30,height:30,borderRadius:8,cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center"}}><BIcon name="bi-arrows-angle-expand" size={14} color={T.muted} /></button>
              </div>
            </div>

            {/* PERFORMANCE CARD - rest remains the same */}
            <div style={{...card({overflow:"hidden",display:"flex",flexDirection:"column"}),flex:1,minHeight:0}}>
              <div style={{padding:"14px 18px",borderBottom:`1px solid ${T.border}`,flexShrink:0}}><span style={{fontSize:15,fontWeight:700,color:T.text}}>Overall CLS Performance <span style={{fontSize:12,color:T.muted}}>— {CLS_TABS.find(t=>t.key===activeTab)?.label}</span></span></div>
              <div style={{flex:1,display:"flex",overflow:"hidden",minHeight:0}}>
                <div className="no-print" style={{width:180,flexShrink:0,borderRight:`1px solid ${T.border}`,display:"flex",flexDirection:"column",padding:"10px 7px",gap:4,overflowY:"auto",background:themeName==="light"?"#f8fafc":T.panel}}>{CLS_TABS.map(t=>{const a=activeTab===t.key;return(<button key={t.key} onClick={()=>setActiveTab(t.key)} style={{width:"100%",padding:"11px 12px",borderRadius:9,fontSize:11,fontWeight:a?600:400,border:`1px solid ${a?T.accent:T.border}`,background:a?T.accent+"12":"transparent",color:a?T.accent:T.muted,cursor:"pointer",textAlign:"left",borderLeft:`3px solid ${a?T.accent:"transparent"}`}}>{t.label}</button>);})}</div>
                <div style={{flex:1,overflow:"auto",padding:"14px"}}>
                  {activeTab==="ji"&&(<div style={{display:"flex",gap:14}}><div style={{width:230,flexShrink:0,display:"flex",flexDirection:"column",gap:12}}><div style={{...panel({padding:"14px"})}}><div style={{fontSize:11,fontWeight:700,color:T.muted,textTransform:"uppercase",marginBottom:10}}>Percentage JI</div><div style={{display:"flex",alignItems:"center",gap:12}}><div style={{position:"relative",width:60,height:60}}><canvas id="jiDonutMain" width={60} height={60} /></div><div><div style={{fontSize:24,fontWeight:800,color:C.primary2}}>99.38%</div><div style={{fontSize:10,color:T.muted,marginTop:4}}>Target: 95.00%</div></div></div></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                    <div style={{padding:"10px",background:T.panel,borderRadius:10,border:`1px solid ${T.border}`}}><div style={{fontSize:9,color:T.muted,textTransform:"uppercase",marginBottom:3}}>Total Count</div><div style={{fontSize:16,fontWeight:800,color:T.text}}>44,046</div></div>
                    <div style={{padding:"10px",background:T.panel,borderRadius:10,border:`1px solid ${T.border}`}}><div style={{fontSize:9,color:T.muted,textTransform:"uppercase",marginBottom:3}}>Satisfactory</div><div style={{fontSize:16,fontWeight:800,color:C.primary2}}>43,849</div></div>
                    <div style={{padding:"10px",background:T.panel,borderRadius:10,border:`1px solid ${T.border}`}}><div style={{fontSize:9,color:T.muted,textTransform:"uppercase",marginBottom:3}}>Unsatisfactory</div><div style={{fontSize:16,fontWeight:800,color:T.danger}}>197</div></div>
                    <div style={{padding:"10px",background:T.panel,borderRadius:10,border:`1px solid ${T.border}`}}><div style={{fontSize:9,color:T.muted,textTransform:"uppercase",marginBottom:3}}>Not Applicable</div><div style={{fontSize:16,fontWeight:800,color:T.muted}}>5,052</div></div>
                  </div></div><div style={{flex:1,display:"flex",flexDirection:"column",gap:10}}>
                    <div style={{...panel({padding:"10px 12px",flex:1,display:"flex",flexDirection:"column"})}}><div style={{marginBottom:6}}><div style={{fontSize:12,fontWeight:700,color:T.text}}>JI Weekly Performance</div><div style={{fontSize:10,color:T.muted}}>Current Week</div></div><div style={{position:"relative",flex:1,minHeight:72}}><canvas id="jiWeeklyChart" style={{position:"absolute",inset:0,width:"100%",height:"100%"}} /></div></div>
                    <div style={{...panel({padding:"10px 12px",flex:1,display:"flex",flexDirection:"column"})}}><div style={{marginBottom:6}}><div style={{fontSize:12,fontWeight:700,color:T.text}}>JI Performance Trend</div><div style={{fontSize:10,color:T.muted}}>Previous 6 Months</div></div><div style={{position:"relative",flex:1,minHeight:72}}><canvas id="jiMonthChart" style={{position:"absolute",inset:0,width:"100%",height:"100%"}} /></div><div style={{display:"flex",gap:14,marginTop:6}}><div style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:T.muted}}><div style={{width:7,height:7,borderRadius:"50%",background:T.accent}} />Performance</div><div style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:T.muted}}><div style={{width:12,height:0,borderTop:`2px dashed ${T.danger}`}} />Target</div></div></div>
                    <div style={{...panel({padding:"10px 12px",flex:1,display:"flex",flexDirection:"column"})}}><div style={{marginBottom:6}}><div style={{fontSize:12,fontWeight:700,color:T.text}}>JI Performance by Item</div><div style={{fontSize:10,color:T.muted}}>By Item Inspected</div></div><div style={{position:"relative",flex:1,minHeight:72}}><canvas id="jiItemChart" style={{position:"absolute",inset:0,width:"100%",height:"100%"}} /></div></div>
                  </div></div>)}
                  {activeTab==="area"&&(<div style={{display:"flex",flexDirection:"column",gap:10}}><div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
                    <div style={{...panel({padding:"12px",textAlign:"center"})}}><div style={{fontSize:9,color:T.muted,textTransform:"uppercase",marginBottom:4}}>Total User Areas</div><div style={{fontSize:22,fontWeight:800,color:C.primary1}}>2,293</div></div>
                    <div style={{...panel({padding:"12px",textAlign:"center"})}}><div style={{fontSize:9,color:T.muted,textTransform:"uppercase",marginBottom:4}}>Cleanable Areas</div><div style={{fontSize:22,fontWeight:800,color:C.primary2}}>1,847</div></div>
                    <div style={{...panel({padding:"12px",textAlign:"center"})}}><div style={{fontSize:9,color:T.muted,textTransform:"uppercase",marginBottom:4}}>Non-Cleanable</div><div style={{fontSize:22,fontWeight:800,color:C.support1}}>446</div></div>
                  </div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><div style={{...panel({padding:"12px"})}}><div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:8}}>Total SR by Type of Request</div><div style={{display:"flex",alignItems:"center",gap:14}}><div style={{position:"relative",width:90,height:90}}><canvas id="srTypePie" /></div><div>{srTypeData.map((it,i)=>(<div key={i} style={{marginBottom:7}}><div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:7,height:7,borderRadius:"50%",background:it.c}} /><span style={{fontSize:10,color:T.muted}}>{it.l}</span></div><div style={{fontSize:14,fontWeight:700,color:T.text}}>{it.v} <span style={{fontSize:9,color:T.muted}}>({it.p})</span></div></div>))}</div></div></div><div style={{...panel({padding:"12px"})}}><div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:8}}>Percentage JI Overall</div><div style={{position:"relative",height:110}}><canvas id="jiOverallChart" /></div></div></div><div style={{...panel({padding:"12px"})}}><div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:8}}>Top 5 Location 'N' — Monthly</div><div style={{position:"relative",height:110}}><canvas id="top5Chart" /></div></div></div>)}
                  {(["consumable","waste","manpower"] as const).map(tab=>activeTab===tab&&(<div key={tab} style={{display:"flex",flexDirection:"column",gap:10}}><div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
                    {tab==="consumable"&&<>
                      <div style={{...panel({padding:"12px",textAlign:"center"})}}><div style={{fontSize:9,color:T.muted,textTransform:"uppercase",marginBottom:4}}>Adequacy Rate</div><div style={{fontSize:22,fontWeight:800,color:C.primary2}}>98.7%</div></div>
                      <div style={{...panel({padding:"12px",textAlign:"center"})}}><div style={{fontSize:9,color:T.muted,textTransform:"uppercase",marginBottom:4}}>Shortfall Items</div><div style={{fontSize:22,fontWeight:800,color:T.warn}}>12</div></div>
                      <div style={{...panel({padding:"12px",textAlign:"center"})}}><div style={{fontSize:9,color:T.muted,textTransform:"uppercase",marginBottom:4}}>Target</div><div style={{fontSize:22,fontWeight:800,color:T.accent}}>95%</div></div>
                    </>}
                    {tab==="waste"&&<>
                      <div style={{...panel({padding:"12px",textAlign:"center"})}}><div style={{fontSize:9,color:T.muted,textTransform:"uppercase",marginBottom:4}}>Collection Rate</div><div style={{fontSize:22,fontWeight:800,color:C.primary2}}>99.1%</div></div>
                      <div style={{...panel({padding:"12px",textAlign:"center"})}}><div style={{fontSize:9,color:T.muted,textTransform:"uppercase",marginBottom:4}}>Missed Collections</div><div style={{fontSize:22,fontWeight:800,color:T.danger}}>3</div></div>
                      <div style={{...panel({padding:"12px",textAlign:"center"})}}><div style={{fontSize:9,color:T.muted,textTransform:"uppercase",marginBottom:4}}>Target</div><div style={{fontSize:22,fontWeight:800,color:T.accent}}>95%</div></div>
                    </>}
                    {tab==="manpower"&&<>
                      <div style={{...panel({padding:"12px",textAlign:"center"})}}><div style={{fontSize:9,color:T.muted,textTransform:"uppercase",marginBottom:4}}>Efficiency Rate</div><div style={{fontSize:22,fontWeight:800,color:C.primary2}}>94.3%</div></div>
                      <div style={{...panel({padding:"12px",textAlign:"center"})}}><div style={{fontSize:9,color:T.muted,textTransform:"uppercase",marginBottom:4}}>Total Staff</div><div style={{fontSize:22,fontWeight:800,color:C.primary1}}>1,247</div></div>
                      <div style={{...panel({padding:"12px",textAlign:"center"})}}><div style={{fontSize:9,color:T.muted,textTransform:"uppercase",marginBottom:4}}>Absent Today</div><div style={{fontSize:22,fontWeight:800,color:T.warn}}>72</div></div>
                    </>}
                  </div><div style={{...panel({padding:"12px",flex:1})}}><div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:8}}>{tab==="consumable"?"Consumable Adequacy — Previous 6 Months":tab==="waste"?"Waste Collection — Previous 6 Months":"Manpower Efficiency — Previous 6 Months"}</div><div style={{position:"relative",height:160}}><canvas id={tab==="consumable"?"consumChart":tab==="waste"?"wasteChart":"manChart"} /></div><div style={{display:"flex",gap:14,marginTop:8}}><div style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:T.muted}}><div style={{width:7,height:7,borderRadius:"50%",background:C.primary2}} />Performance</div>{tab!=="manpower"&&<div style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:T.muted}}><div style={{width:12,height:0,borderTop:`2px dashed ${T.danger}`}} />Target</div>}</div></div></div>))}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div style={{width:300,flexShrink:0,display:"flex",flexDirection:"column",gap:14,overflow:"hidden"}}>
            <div style={{...card({display:"flex",flexDirection:"column",minHeight:0,overflow:"hidden"}),flex:1}}>
              <div style={{padding:"14px 16px",borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",flexShrink:0}}><div><div style={{fontSize:14,fontWeight:700,color:T.text}}>Deduction by Indicator</div><div style={{fontSize:10,color:T.muted}}>{startDate} to {endDate}</div></div><button className="no-print" onClick={()=>openModal("deduct")} style={{background:T.panel,border:`1px solid ${T.border}`,color:T.muted,width:28,height:28,borderRadius:7,cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center"}}><BIcon name="bi-arrows-angle-expand" size={13} color={T.muted} /></button></div>
              <div style={{padding:"10px 14px",borderBottom:`1px solid ${T.border}`,display:"flex",gap:16}}><div style={{textAlign:"center",flex:1}}><div style={{fontSize:10,color:T.muted}}>% Deduction</div><div style={{fontSize:18,fontWeight:800,color:C.primary1}}>0.44%</div></div><div style={{width:1,background:T.border}} /><div style={{textAlign:"center",flex:1}}><div style={{fontSize:10,color:T.muted}}>Total</div><div style={{fontSize:18,fontWeight:800,color:T.green}}>RM 0.00</div></div></div>
              <div style={{flex:1,padding:"10px 12px",display:"flex",flexDirection:"column",gap:6,overflowY:"auto"}}>{["C.1","C.2","C.3","C.4","C.5","C.6"].map((c,i)=>(<div key={c} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 12px",background:T.panel,borderRadius:9,border:`1px solid ${T.border}`}}><div style={{display:"flex",alignItems:"center",gap:10}}><div style={{width:9,height:9,borderRadius:3,background:CC[i]}} /><span style={{fontSize:13,fontWeight:600,color:T.text}}>{c}</span><span style={{fontSize:10,color:T.muted}}>{CV[i].toFixed(2)}%</span></div><div style={{textAlign:"right"}}><span style={{fontSize:13,fontWeight:700,color:T.success}}>RM 0.00</span></div></div>))}</div>
            </div>
            <div style={{...card({display:"flex",flexDirection:"column",minHeight:0,overflow:"hidden"}),flex:1}}>
              <div style={{padding:"14px 16px",borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",flexShrink:0}}><div><div style={{fontSize:14,fontWeight:700,color:T.text}}>Penalty by Criteria</div><div style={{fontSize:10,color:T.muted}}>{startDate} to {endDate}</div></div><button className="no-print" onClick={()=>openModal("penalty")} style={{background:T.panel,border:`1px solid ${T.border}`,color:T.muted,width:28,height:28,borderRadius:7,cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center"}}><BIcon name="bi-arrows-angle-expand" size={13} color={T.muted} /></button></div>
              <div className="no-print" style={{padding:"8px 14px",display:"flex",gap:7}}>{["critical","value"].map(t=>(<button key={t} onClick={()=>setPenTab(t)} style={{fontSize:11,padding:"5px 13px",borderRadius:20,border:`1px solid ${penTab===t?T.accent:T.border}`,background:penTab===t?T.accent+"12":"transparent",color:penTab===t?T.accent:T.muted,cursor:"pointer",fontWeight:penTab===t?700:400}}>{t==="critical"?"Critical Events":"Penalty Value"}</button>))}</div>
              <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:10}}><BIcon name="bi-check-circle" size={40} color={T.success} /><div style={{fontSize:12,color:T.muted}}>No Data</div><Badge color="green" T={T}>All KPIs Met</Badge></div>
            </div>
            <div style={{...card({display:"flex",flexDirection:"column",minHeight:0,overflow:"hidden"}),flex:1}}>
              <div style={{padding:"14px 16px",borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",flexShrink:0}}><div><div style={{fontSize:14,fontWeight:700,color:T.text}}>Finance</div><div style={{fontSize:10,color:T.muted}}>{startDate} to {endDate}</div></div><button className="no-print" onClick={()=>openModal("finance")} style={{background:T.panel,border:`1px solid ${T.border}`,color:T.muted,width:28,height:28,borderRadius:7,cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center"}}><BIcon name="bi-arrows-angle-expand" size={13} color={T.muted} /></button></div>
              <div style={{padding:"8px 14px",display:"flex",gap:14}}>
                <div style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:T.muted}}><div style={{width:7,height:7,borderRadius:"50%",background:T.accent}} />Invoice</div>
                <div style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:T.muted}}><div style={{width:7,height:7,borderRadius:"50%",background:T.danger}} />Penalty</div>
              </div>
              <div style={{flex:1,padding:"0 12px 12px",position:"relative",minHeight:0}}><canvas id="financeChart" style={{position:"absolute",inset:0,width:"100%",height:"100%"}} /></div>
            </div>
          </div>
        </div>

        {/* SR MODAL */}
        {modal==="sr"&&(<Modal title="Service Request — Feb'26" onClose={()=>setModal(null)} T={T} onPrint={printPage}>
          <FilterRow year={modalYear} setYear={setModalYear} month={modalMonth} setMonth={setModalMonth} startDate={modalStartDate} setStartDate={setModalStartDate} endDate={modalEndDate} setEndDate={setModalEndDate} T={T} />
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
            {srStatData.map((s,i)=>(<div key={i} style={{background:T.card,borderRadius:12,padding:"14px",textAlign:"center",border:`1px solid ${T.border}`}}><div style={{fontSize:26,fontWeight:800,color:s.c}}>{s.v}</div><div style={{fontSize:12,color:T.muted,marginTop:4}}>{s.l}</div></div>))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <div><div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:12}}>SR Status Breakdown</div><div style={{position:"relative",height:220}}><canvas id="m-srBar" /></div></div>
            <div><div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:12}}>SR by Type of Request</div><div style={{display:"flex",flexDirection:"column",gap:10}}>
              {srTypeData.map((it,i)=>(<div key={i} style={{background:T.panel,borderRadius:10,padding:"12px 14px",border:`1px solid ${T.border}`}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><div style={{display:"flex",alignItems:"center",gap:7}}><div style={{width:9,height:9,borderRadius:"50%",background:it.c}} /><span style={{fontSize:12,color:T.muted}}>{it.l}</span></div><span style={{fontSize:13,fontWeight:700,color:T.text}}>{it.v}</span></div><ProgressBar value={parseFloat(it.p)} max={100} color={it.c} T={T} /><div style={{fontSize:10,color:T.muted,marginTop:4,textAlign:"right"}}>{it.p}</div></div>))}
            </div></div>
          </div>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13,marginTop:18}}><thead><tr>{["Type","Count","%","Period"].map(h=><th key={h} style={thStyle}>{h}</th>)}</tr></thead><tbody>{srTableData.map((r,i)=><tr key={i}>{r.map((cell,j)=><td key={j} style={tdStyle}>{renderTableCell(cell)}</td>)}</tr>)}</tbody></table></Modal>)}

        {/* NCR MODAL */}
        {modal==="ncr"&&(<Modal title="NCR — Feb'26" onClose={()=>setModal(null)} T={T} onPrint={printPage}>
          <FilterRow year={modalYear} setYear={setModalYear} month={modalMonth} setMonth={setModalMonth} startDate={modalStartDate} setStartDate={setModalStartDate} endDate={modalEndDate} setEndDate={setModalEndDate} T={T} />
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
            {ncrStatData.map((s,i)=>(<div key={i} style={{background:T.card,borderRadius:12,padding:"14px",textAlign:"center",border:`1px solid ${T.border}`}}><div style={{fontSize:26,fontWeight:800,color:s.c}}>{s.v}</div><div style={{fontSize:12,color:T.muted,marginTop:4}}>{s.l}</div></div>))}
          </div>
          <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:12}}>NCR Trend — Previous 6 Months</div><div style={{position:"relative",height:240}}><canvas id="m-ncrBar" /></div>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13,marginTop:18}}><thead><tr>{["Month","Total NCR","Open","Closed","Closure Rate"].map(h=><th key={h} style={thStyle}>{h}</th>)}</tr></thead><tbody>{ncrTableData.map((r,i)=><tr key={i}>{r.map((cell,j)=><td key={j} style={tdStyle}>{renderTableCell(cell)}</td>)}</tr>)}</tbody></table></Modal>)}

        {/* DEDUCT MODAL */}
        {modal==="deduct"&&(<Modal title="Deduction by Indicator — Jan'26" onClose={()=>setModal(null)} T={T} onPrint={printPage}>
          <FilterRow year={modalYear} setYear={setModalYear} month={modalMonth} setMonth={setModalMonth} startDate={modalStartDate} setStartDate={setModalStartDate} endDate={modalEndDate} setEndDate={setModalEndDate} showMonth={false} T={T} />
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:20}}><div style={{background:`linear-gradient(135deg,${C.primary1}15,${C.primary1}05)`,borderRadius:14,padding:"18px",textAlign:"center",border:`1px solid ${C.primary1}25`}}><div style={{fontSize:11,color:C.primary1,textTransform:"uppercase",marginBottom:8}}>% Deduction Overall</div><div style={{fontSize:34,fontWeight:800,color:C.primary1}}>0.44%</div></div><div style={{background:T.card,borderRadius:14,padding:"18px",textAlign:"center",border:`1px solid ${T.border}`}}><div style={{fontSize:11,color:T.muted,textTransform:"uppercase",marginBottom:8}}>Total User Area</div><div style={{fontSize:34,fontWeight:800,color:C.primary1}}>2,293</div></div><div style={{background:T.card,borderRadius:14,padding:"18px",textAlign:"center",border:`1px solid ${T.border}`}}><div style={{fontSize:11,color:T.muted,textTransform:"uppercase",marginBottom:8}}>Total Deduction</div><div style={{fontSize:28,fontWeight:800,color:T.green}}>RM 0.00</div></div></div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>{["C.1","C.2","C.3","C.4","C.5","C.6"].map((c,i)=>(<div key={c} style={{background:T.card,borderRadius:12,padding:"14px",textAlign:"center",border:`1px solid ${T.border}`}}><div style={{width:11,height:11,borderRadius:"50%",background:CC[i],display:"inline-block",marginBottom:8}} /><div style={{fontSize:18,fontWeight:800,color:CC[i]}}>RM 0.00</div><div style={{fontSize:12,color:T.muted,marginTop:4}}>{c} — {CV[i]}%</div></div>))}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}><div><div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:12}}>% C1–C6 Distribution</div><div style={{position:"relative",height:220}}><canvas id="m-cBar" /></div></div><div><div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:12}}>% Deduction Trend (Jan–Oct)</div><div style={{position:"relative",height:220}}><canvas id="m-deductLine" /></div></div></div>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13,marginTop:18}}><thead><tr>{["Indicator","% Weight","Deduction (RM)"].map(h=><th key={h} style={thStyle}>{h}</th>)}</tr></thead><tbody>{deductTableData.map((r,i)=><tr key={i}>{r.map((cell,j)=><td key={j} style={tdStyle}>{renderTableCell(cell)}</td>)}</tr>)}</tbody></table></Modal>)}

        {/* PENALTY MODAL */}
        {modal==="penalty"&&(<Modal title="Penalty by Criteria — Feb'26" onClose={()=>setModal(null)} T={T} onPrint={printPage}>
          <FilterRow year={modalYear} setYear={setModalYear} month={modalMonth} setMonth={setModalMonth} startDate={modalStartDate} setStartDate={setModalStartDate} endDate={modalEndDate} setEndDate={setModalEndDate} T={T} />
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
            <div style={{background:T.card,borderRadius:12,padding:"14px",textAlign:"center",border:`1px solid ${T.border}`}}><div style={{fontSize:22,fontWeight:800,color:T.success}}>0</div><div style={{fontSize:12,color:T.muted,marginTop:4}}>Critical Events</div></div>
            <div style={{background:T.card,borderRadius:12,padding:"14px",textAlign:"center",border:`1px solid ${T.border}`}}><div style={{fontSize:22,fontWeight:800,color:T.success}}>RM 0.00</div><div style={{fontSize:12,color:T.muted,marginTop:4}}>Total Penalty</div></div>
            <div style={{background:T.card,borderRadius:12,padding:"14px",textAlign:"center",border:`1px solid ${T.border}`}}><div style={{fontSize:22,fontWeight:800,color:T.success}}>0</div><div style={{fontSize:12,color:T.muted,marginTop:4}}>C1 Events</div></div>
            <div style={{background:T.card,borderRadius:12,padding:"14px",textAlign:"center",border:`1px solid ${T.border}`}}><div style={{fontSize:22,fontWeight:800,color:T.success}}>0</div><div style={{fontSize:12,color:T.muted,marginTop:4}}>C2 Events</div></div>
          </div>
          <div style={{background:T.success+"05",border:`1px solid ${T.success}20`,borderRadius:14,padding:24,textAlign:"center"}}><BIcon name="bi-check-circle-fill" size={40} color={T.success} /><div style={{fontSize:16,fontWeight:700,color:T.success,marginBottom:6}}>No Penalty Events Recorded</div><div style={{fontSize:13,color:T.muted}}>All KPI thresholds met.</div></div></Modal>)}

        {/* FINANCE MODAL */}
        {modal==="finance"&&(<Modal title="Finance — Aug'25 to Jan'26" onClose={()=>setModal(null)} T={T} onPrint={printPage}>
          <FilterRow year={modalYear} setYear={setModalYear} month={modalMonth} setMonth={setModalMonth} startDate={modalStartDate} setStartDate={setModalStartDate} endDate={modalEndDate} setEndDate={setModalEndDate} showMonth={true} T={T} />
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
            <div style={{background:T.card,borderRadius:12,padding:"14px",textAlign:"center",border:`1px solid ${T.border}`}}><div style={{fontSize:18,fontWeight:800,color:T.accent}}>RM 20,105</div><div style={{fontSize:12,color:T.muted,marginTop:4}}>Aug Invoice</div></div>
            <div style={{background:T.card,borderRadius:12,padding:"14px",textAlign:"center",border:`1px solid ${T.border}`}}><div style={{fontSize:18,fontWeight:800,color:T.accent}}>RM 19,326</div><div style={{fontSize:12,color:T.muted,marginTop:4}}>Sep Invoice</div></div>
            <div style={{background:T.card,borderRadius:12,padding:"14px",textAlign:"center",border:`1px solid ${T.border}`}}><div style={{fontSize:18,fontWeight:800,color:T.accent}}>RM 34,552</div><div style={{fontSize:12,color:T.muted,marginTop:4}}>Oct Invoice</div></div>
            <div style={{background:T.card,borderRadius:12,padding:"14px",textAlign:"center",border:`1px solid ${T.border}`}}><div style={{fontSize:18,fontWeight:800,color:T.accent}}>RM 40,710</div><div style={{fontSize:12,color:T.muted,marginTop:4}}>Nov Invoice</div></div>
            <div style={{background:T.card,borderRadius:12,padding:"14px",textAlign:"center",border:`1px solid ${T.border}`}}><div style={{fontSize:18,fontWeight:800,color:T.muted}}>RM 0</div><div style={{fontSize:12,color:T.muted,marginTop:4}}>Dec Invoice</div></div>
            <div style={{background:T.card,borderRadius:12,padding:"14px",textAlign:"center",border:`1px solid ${T.border}`}}><div style={{fontSize:18,fontWeight:800,color:T.danger}}>RM 175</div><div style={{fontSize:12,color:T.muted,marginTop:4}}>Jan Penalty</div></div>
          </div>
          <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:12}}>Finance Overview</div><div style={{position:"relative",height:260}}><canvas id="m-finLine" /></div>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13,marginTop:18}}><thead><tr>{["Month","Invoice (RM)","Penalty (RM)"].map(h=><th key={h} style={thStyle}>{h}</th>)}</tr></thead><tbody>{financeTableData.map((r,i)=><tr key={i}>{r.map((cell,j)=><td key={j} style={tdStyle}>{renderTableCell(cell)}</td>)}</tr>)}</tbody></table></Modal>)}

        {/* JI KPI MODAL */}
        {modal==="jiKpi"&&(<Modal title="Percentage JI KPI Detail" onClose={()=>setModal(null)} T={T} onPrint={printPage}>
          <FilterRow year={modalYear} setYear={setModalYear} month={modalMonth} setMonth={setModalMonth} startDate={modalStartDate} setStartDate={setModalStartDate} endDate={modalEndDate} setEndDate={setModalEndDate} showMonth={true} T={T} />
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
            <div style={{background:T.card,borderRadius:12,padding:"14px",textAlign:"center",border:`1px solid ${T.border}`}}><div style={{fontSize:22,fontWeight:800,color:C.primary2}}>99.38%</div><div style={{fontSize:12,color:T.muted,marginTop:4}}>Percentage JI</div></div>
            <div style={{background:T.card,borderRadius:12,padding:"14px",textAlign:"center",border:`1px solid ${T.border}`}}><div style={{fontSize:22,fontWeight:800,color:C.primary2}}>99.55%</div><div style={{fontSize:12,color:T.muted,marginTop:4}}>JI Performance</div></div>
            <div style={{background:T.card,borderRadius:12,padding:"14px",textAlign:"center",border:`1px solid ${T.border}`}}><div style={{fontSize:22,fontWeight:800,color:T.accent}}>95.00%</div><div style={{fontSize:12,color:T.muted,marginTop:4}}>Target</div></div>
            <div style={{background:T.card,borderRadius:12,padding:"14px",textAlign:"center",border:`1px solid ${T.border}`}}><div style={{fontSize:22,fontWeight:800,color:T.text}}>100.00%</div><div style={{fontSize:12,color:T.muted,marginTop:4}}>Total Inspected</div></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}><div><div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:12}}>Percentage JI Donut</div><div style={{position:"relative",height:220}}><canvas id="m-jiDonut" /></div></div><div><div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:12}}>Count Breakdown</div><div style={{display:"flex",flexDirection:"column",gap:10}}>
            <div style={{background:T.card,borderRadius:10,padding:"12px 16px",border:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between"}}><span style={{fontSize:13,color:T.muted}}>Total Count</span><span style={{fontSize:18,fontWeight:800,color:T.text}}>44,046</span></div>
            <div style={{background:T.card,borderRadius:10,padding:"12px 16px",border:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between"}}><span style={{fontSize:13,color:T.muted}}>Satisfactory</span><span style={{fontSize:18,fontWeight:800,color:C.primary2}}>43,849</span></div>
            <div style={{background:T.card,borderRadius:10,padding:"12px 16px",border:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between"}}><span style={{fontSize:13,color:T.muted}}>Unsatisfactory</span><span style={{fontSize:18,fontWeight:800,color:T.danger}}>197</span></div>
            <div style={{background:T.card,borderRadius:10,padding:"12px 16px",border:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between"}}><span style={{fontSize:13,color:T.muted}}>Not Applicable</span><span style={{fontSize:18,fontWeight:800,color:T.muted}}>5,052</span></div>
          </div></div></div>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13,marginTop:18}}><thead><tr>{["Month","% Deduction","JI %"].map(h=><th key={h} style={thStyle}>{h}</th>)}</tr></thead><tbody>{jiTableData.map((r,i)=><tr key={i}>{r.map((cell,j)=><td key={j} style={tdStyle}>{renderTableCell(cell)}</td>)}</tr>)}</tbody></table></Modal>)}
      </>)}
    </div>
  );
}