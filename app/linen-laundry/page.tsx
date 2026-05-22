"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useDashboardNav } from "@/components/dashboard-nav-provider";

declare global { interface Window { Chart: any; XLSX: any; } }

/* ─── LLS DATA ─────────────────────────────────── */
const M6    = ["Sep '25","Oct '25","Nov '25","Dec '25","Jan '26","Feb '26"];
const FINM  = ["Aug '25","Sep '25","Oct '25","Nov '25","Dec '25","Jan '26"];
const MONTHS_12 = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const SUPPLY_PCT = 99.83;
const SUPPLY_TARGET = 95.00;

const SUPPLY_BY_ITEM = [
  { item: "Bed Sheets", supply: 99.95, reject: 0.05, volume: 12450 },
  { item: "Pillow Cases", supply: 99.88, reject: 0.12, volume: 8750 },
  { item: "Towels", supply: 99.72, reject: 0.28, volume: 15620 },
  { item: "Blankets", supply: 99.91, reject: 0.09, volume: 3250 },
  { item: "Patient Gowns", supply: 99.68, reject: 0.32, volume: 18900 },
  { item: "Staff Uniforms", supply: 99.85, reject: 0.15, volume: 5420 },
];

const SUPPLY_TREND = [99.80, 99.82, 99.78, 99.85, 99.81, 99.83];
const REJECT_TREND = [0.12, 0.11, 0.10, 0.09, 0.09, 0.09];

const SHORTFALL_PCT = [1.23, 0.82, 1.44, 1.28, 7.30, 6.09, 16.70, 1.02, 0.0, 0.0, 0.0, 0.0];

const SOILED_COLLECTION = [1433, 1484, 1540, 1554, 1500, 1490, 1520, 850, 1480, 1500, 0, 0];

const LI = ["% L1","% L2","% L3","% L4","% L5","% L6"];
const LV = [0.85, 3.15, 3.53, 0.88, 42.10, 2.53];
const LC = ["#219EBC","#FB8500","#FFB703","#8ECAE6","#023047","#6b7280"];

const OVERALL_DEDUCTION_PCT = 1.03;

const DEDUCTION_BY_MONTH = [1.58, 1.35, 1.37, 0.65, 0.46, 0.54, 0.86, 1.32, 0.46, 0.0];

const FINANCE_INVOICE = [120105, 119326, 134552, 140710, 0, 0];
const FINANCE_PENALTY = [0, 0, 0, 0, 0, 175];

const SR_TOTAL = 4822;
const SR_NORMAL = 4822;
const SR_OUTSTANDING = 3205;
const SR_DONE = 1617;
const SR_CRITICAL = 0;

const NCR_TOTAL = 78;
const NCR_OPEN = 58;
const NCR_CLOSED = 20;
const NCR_CLOSURE_RATE = 25.6;

const SR_BY_TYPE = [
  { type: "Linen Exchange", count: 1842, pct: 38.2 },
  { type: "Additional Request", count: 1124, pct: 23.3 },
  { type: "Complaint", count: 763, pct: 15.8 },
  { type: "Emergency Request", count: 541, pct: 11.2 },
  { type: "Return", count: 345, pct: 7.1 },
  { type: "Others", count: 207, pct: 4.3 },
];

const LINE_ITEMS_REQUESTED = 497904;
const LINE_ITEMS_REJECTED = 118;
const LINE_ITEMS_SHORTFALL = 849;

const CLEAN_LINEN_WEIGHT = [1480, 1520, 1500, 1490, 1510, 1530, 1500, 1480, 1520, 1510, 1490, 1500];

const LAUNDRY_PLANT = [
  { plant: "Plant A", weight: 850, pct: 42.5 },
  { plant: "Plant B", weight: 650, pct: 32.5 },
  { plant: "Plant C", weight: 500, pct: 25.0 },
];
const LAUNDRY_PLANT_COLORS = ["#219EBC","#FB8500","#FFB703"];

const ITEM_COLORS = ["#219EBC","#8ECAE6","#FB8500","#FFB703","#023047","#6b7280"];

const TOTAL_USER_AREA = 65;

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
  primary1: "#219EBC",
  primary2: "#8ECAE6",
  support1: "#FB8500",
  support2: "#FFB703",
  support3: "#023047",
};

/* ─── NAV PAGES ────────────────────────────────── */
const NAV_PAGES = [
  { key:"fem", label:"Facility Engineering Maintenance", icon:"bi-tools", href:"/facility-engineering" },
  { key:"bem", label:"Biomedical Engineering Maintenance", icon:"bi-heart-pulse", href:"/biomedical-engineering" },
  { key:"cls", label:"Cleansing Services", icon:"bi-droplet", href:"/cleansing-services" },
  { key:"lls", label:"Linen and Laundry Services", icon:"bi-box-seam", href:"/linen-laundry" },
  { key:"hwm", label:"Healthcare Waste Management", icon:"bi-recycle", href:"/waste-management" },
  { key:"complaint", label:"Complaint Module", icon:"bi-chat-dots", href:"/complaints" },
  { key:"docs", label:"Document Management System", icon:"bi-folder2", href:"/documents" },
  { key:"qa", label:"Quality Assurance Program", icon:"bi-patch-check", href:"/quality-assurance" },
  { key:"ber", label:"Beyond Economic Repair", icon:"bi-gear", href:"/beyond-economic-repair" },
  { key:"variation", label:"Variation Management", icon:"bi-bar-chart", href:"/variation-management" },
  { key:"deduction", label:"Deduction", icon:"bi-cash-stack", href:"/deduction" },
  { key:"reports", label:"Reports", icon:"bi-file-earmark-bar-graph", href:"/reports" },
  { key:"master", label:"General Master", icon:"bi-person", href:"/general-master" },
  { key:"users", label:"User Management", icon:"bi-people", href:"/user-management" },
  { key:"additional", label:"Additional Works", icon:"bi-plus-circle", href:"/additional-works" },
  { key:"finance", label:"Finance", icon:"bi-credit-card", href:"/finance" },
  { key:"bis", label:"BIS", icon:"bi-graph-up", href:"/bis" },
];

/* ─── LLS PERFORMANCE TABS ──────────────────────── */
const LLS_TABS = [
  { key:"overview", label:"Line Usage Performance" },
  { key:"supply", label:"Supply & Reject by Item" },
  { key:"soiled", label:"Soiled Collection" },
  { key:"deduction", label:"Deduction Overview" },
  { key:"sr", label:"Service Request" },
];

/* ─── CHART HELPERS ─────────────────────────────── */
function drawChart(id:string,type:string,data:any,options:any){
  const c=document.getElementById(id) as HTMLCanvasElement|null;
  if(!c)return;
  if(!window.Chart){
    setTimeout(()=>drawChart(id,type,data,options),150);
    return;
  }
  const ctx=c.getContext("2d");
  if(!ctx)return;
  const ex=window.Chart.getChart(c);
  if(ex)ex.destroy();
  try {
    new window.Chart(ctx,{
      type:type as any,
      data,
      options:{
        ...options,
        animation:false,
        responsive:true,
        maintainAspectRatio:false
      }
    });
  } catch(e) {
    console.error("Chart creation error:", e);
  }
}

function mkBar(id:string,labels:string[],data:number[],colors:string[]|string,T:Theme,extra?:any){
  const scales:any={
    x:{
      grid:{color:T.gridColor},
      ticks:{color:T.tickColor,font:{size:12}},
      border:{color:"transparent"}
    },
    y:{
      grid:{color:T.gridColor},
      ticks:{color:T.tickColor,font:{size:12}},
      border:{color:"transparent"}
    }
  };
  if(extra?.indexAxis){
    const tmp=scales.x;
    scales.x=scales.y;
    scales.y=tmp;
  }
  drawChart(id,"bar",{
    labels,
    datasets:[{
      data,
      backgroundColor:colors,
      borderRadius:8
    }]
  },{
    indexAxis:extra?.indexAxis,
    plugins:{legend:{display:false}},
    scales
  });
}

function mkLine(id:string,labels:string[],datasets:any[],T:Theme,extra?:any){
  const yticks:any={color:T.tickColor,font:{size:12}};
  if(extra?.scales?.y?.callback)yticks.callback=extra.scales.y.callback;
  const yscale:any={
    grid:{color:T.gridColor},
    border:{color:"transparent"},
    ticks:yticks
  };
  const opts:any={
    plugins:{legend:{display:false}},
    scales:{
      x:{
        grid:{color:T.gridColor},
        ticks:{color:T.tickColor,font:{size:12}},
        border:{color:"transparent"}
      },
      y:yscale
    }
  };
  if(extra?.plugins)opts.plugins={...opts.plugins,...extra.plugins};
  drawChart(id,"line",{
    labels,
    datasets:datasets.map((d:any)=>({
      ...d,
      borderWidth:d.borderWidth||2.5,
      pointRadius:d.pointRadius||4,
      tension:0.3
    }))
  },opts);
}

function mkPie(id:string,labels:string[],data:number[],colors:string[],T:Theme,cutout="65%"){
  drawChart(id,"doughnut",{
    labels,
    datasets:[{
      data,
      backgroundColor:colors,
      borderWidth:0
    }]
  },{
    cutout,
    plugins:{legend:{display:false}}
  });
}

/* ─── EXPORT ─────────────────────────────────────── */
function exportExcelAll(){
  if(!window.XLSX)return;
  const wb=window.XLSX.utils.book_new();
  [{name:"Summary",data:[["LLS Dashboard - HTA"],["Metric","Value"],["Line Items Requested","497,904"],["Supply %","99.83%"]]}].forEach(s=>{
    const ws=window.XLSX.utils.aoa_to_sheet(s.data);
    window.XLSX.utils.book_append_sheet(wb,ws,s.name);
  });
  window.XLSX.writeFile(wb,"LLS_HTA_Dashboard_Export.xlsx");
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

const monthsList = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function FilterRow({year,setYear,month,setMonth,startDate,setStartDate,endDate,setEndDate,showMonth=true,T}:{
  year:string;setYear:(v:string)=>void;
  month:string;setMonth:(v:string)=>void;
  startDate:string;setStartDate:(v:string)=>void;
  endDate:string;setEndDate:(v:string)=>void;
  showMonth?:boolean;T:Theme
}){
  const selStyle:React.CSSProperties={background:T.inputBg,border:`1px solid ${T.border}`,color:T.text,padding:"6px 30px 6px 12px",borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer",appearance:"none",WebkitAppearance:"none",backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,backgroundRepeat:"no-repeat",backgroundPosition:"right 8px center"};
  const inputStyle:React.CSSProperties={background:T.inputBg,border:`1px solid ${T.border}`,color:T.text,padding:"6px 12px",borderRadius:8,fontSize:12,fontWeight:600};
  return <div className="no-print" style={{display:"flex",alignItems:"center",gap:12,marginBottom:16,padding:"12px 16px",background:T.panel,borderRadius:12,border:`1px solid ${T.border}`,flexWrap:"wrap"}}>
    <span style={{fontSize:12,color:T.muted,fontWeight:700,letterSpacing:".5px"}}><BIcon name="bi-funnel" size={13} color={T.muted} /> FILTER</span>
    <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:12,color:T.muted,fontWeight:600}}>Year</span><select value={year} onChange={e=>setYear(e.target.value)} style={selStyle}><option value="2025">2025</option><option value="2024">2024</option><option value="2026">2026</option></select></div>
    {showMonth&&<div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:12,color:T.muted,fontWeight:600}}>Month</span><select value={month} onChange={e=>setMonth(e.target.value)} style={selStyle}><option value="all">All Months</option>{monthsList.map(m=><option key={m} value={m.toLowerCase()}>{m}</option>)}</select></div>}
    <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:12,color:T.muted,fontWeight:600}}>Start Date</span><input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} style={inputStyle} /></div>
    <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:12,color:T.muted,fontWeight:600}}>End Date</span><input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} style={inputStyle} /></div>
  </div>;
}

function Modal({title,onClose,children,T,onPrint,onExport}:{title:string;onClose:()=>void;children:React.ReactNode;T:Theme;onPrint?:()=>void;onExport?:()=>void}){
  return <div onClick={e=>{if((e.target as HTMLElement).dataset.overlay)onClose();}} data-overlay="1" style={{position:"fixed",inset:0,background:"rgba(0,0,0,.45)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(4px)"}}>
    <div style={{background:T.panel,border:`1px solid ${T.border}`,borderRadius:20,padding:28,width:1100,maxHeight:"88vh",overflowY:"auto",boxShadow:"0 24px 60px rgba(0,0,0,.18)"}}>
      <style>{`::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:${T.scrollThumb};border-radius:99px}`}</style>
      <div className="no-print" style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <h2 style={{fontSize:20,fontWeight:700,color:T.text,margin:0}}>{title}</h2>
        <div style={{display:"flex",gap:8}}>
          <button onClick={onPrint} title="Print" style={{background:T.accent+"12",border:`1px solid ${T.accent}25`,color:T.accent,width:36,height:36,borderRadius:8,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><BIcon name="bi-printer" size={16} color={T.accent} /></button>
          {onExport&&<button onClick={onExport} title="Export Excel" style={{background:T.success+"12",border:`1px solid ${T.success}25`,color:T.success,width:36,height:36,borderRadius:8,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><BIcon name="bi-download" size={16} color={T.success} /></button>}
          <button onClick={onClose} title="Close" style={{background:T.card,border:`1px solid ${T.border}`,color:T.muted,width:36,height:36,borderRadius:8,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><BIcon name="bi-x-lg" size={16} color={T.muted} /></button>
        </div>
      </div>
      {children}
    </div>
  </div>;
}

function PlaceholderPage({page,T}:{page:typeof NAV_PAGES[0];T:Theme}){
  return <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column" as const,gap:20,color:T.muted}}>
    <BIcon name={page.icon} size={56} color={T.muted} />
    <div style={{fontSize:24,fontWeight:700,color:T.text}}>{page.label}</div>
  </div>;
}

/* ─── TAB CONTENT COMPONENTS ─── */
function TabOverview({ T, panelStyle }: { T: Theme; panelStyle: (extra?: React.CSSProperties) => React.CSSProperties }) {
  return (
    <div style={{display:"flex",gap:14}}>
      <div style={{width:230,flexShrink:0,display:"flex",flexDirection:"column",gap:12}}>
        <div style={{...panelStyle({padding:"14px"})}}>
          <div style={{fontSize:11,fontWeight:700,color:T.muted,textTransform:"uppercase",marginBottom:10}}>Supply % (HTA)</div>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{position:"relative",width:60,height:60}}>
              <canvas id="supplyDonut" width={60} height={60} />
            </div>
            <div>
              <div style={{fontSize:24,fontWeight:800,color:C.primary1}}>{SUPPLY_PCT}%</div>
              <div style={{fontSize:10,color:T.muted,marginTop:4}}>Target: {SUPPLY_TARGET}%</div>
            </div>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          <div style={{padding:"10px",background:T.panel,borderRadius:10,border:`1px solid ${T.border}`}}>
            <div style={{fontSize:9,color:T.muted,textTransform:"uppercase",marginBottom:3}}>Items Requested</div>
            <div style={{fontSize:16,fontWeight:800,color:T.text}}>{LINE_ITEMS_REQUESTED.toLocaleString()}</div>
          </div>
          <div style={{padding:"10px",background:T.panel,borderRadius:10,border:`1px solid ${T.border}`}}>
            <div style={{fontSize:9,color:T.muted,textTransform:"uppercase",marginBottom:3}}>Items Rejected</div>
            <div style={{fontSize:16,fontWeight:800,color:C.support1}}>{LINE_ITEMS_REJECTED.toLocaleString()}</div>
          </div>
          <div style={{padding:"10px",background:T.panel,borderRadius:10,border:`1px solid ${T.border}`}}>
            <div style={{fontSize:9,color:T.muted,textTransform:"uppercase",marginBottom:3}}>Shortfall</div>
            <div style={{fontSize:16,fontWeight:800,color:C.support3}}>{LINE_ITEMS_SHORTFALL.toLocaleString()}</div>
          </div>
          <div style={{padding:"10px",background:T.panel,borderRadius:10,border:`1px solid ${T.border}`}}>
            <div style={{fontSize:9,color:T.muted,textTransform:"uppercase",marginBottom:3}}>User Areas</div>
            <div style={{fontSize:16,fontWeight:800,color:T.muted}}>117</div>
          </div>
        </div>
      </div>
      <div style={{flex:1,display:"flex",flexDirection:"column",gap:10}}>
        <div style={{...panelStyle({padding:"10px 12px",flex:1,display:"flex",flexDirection:"column"})}}>
          <div style={{marginBottom:6}}>
            <div style={{fontSize:12,fontWeight:700,color:T.text}}>Clean Linen Weight (Kg)</div>
            <div style={{fontSize:10,color:T.muted}}>Monthly Trend</div>
          </div>
          <div style={{position:"relative",flex:1,minHeight:72}}>
            <canvas id="cleanLinenChart" style={{position:"absolute",inset:0,width:"100%",height:"100%"}} />
          </div>
        </div>
        <div style={{display:"flex",gap:10,flex:1}}>
          <div style={{...panelStyle({padding:"10px 12px",flex:1,display:"flex",flexDirection:"column"})}}>
            <div style={{marginBottom:6}}>
              <div style={{fontSize:12,fontWeight:700,color:T.text}}>Supply Performance</div>
              <div style={{fontSize:10,color:T.muted}}>Previous 6 Months</div>
            </div>
            <div style={{position:"relative",flex:1,minHeight:70}}>
              <canvas id="supplyTrendChart" style={{position:"absolute",inset:0,width:"100%",height:"100%"}} />
            </div>
            <div style={{display:"flex",gap:14,marginTop:4}}>
              <div style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:T.muted}}>
                <div style={{width:7,height:7,borderRadius:"50%",background:C.primary1}} />Supply
              </div>
              <div style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:T.muted}}>
                <div style={{width:12,height:0,borderTop:`2px dashed ${T.danger}`}} />Target
              </div>
            </div>
          </div>
          <div style={{...panelStyle({padding:"10px 12px",flex:1,display:"flex",flexDirection:"column"})}}>
            <div style={{marginBottom:6}}>
              <div style={{fontSize:12,fontWeight:700,color:T.text}}>Reject Rate</div>
              <div style={{fontSize:10,color:T.muted}}>Previous 6 Months</div>
            </div>
            <div style={{position:"relative",flex:1,minHeight:70}}>
              <canvas id="rejectTrendChart" style={{position:"absolute",inset:0,width:"100%",height:"100%"}} />
            </div>
          </div>
        </div>
        <div style={{...panelStyle({padding:"10px 12px",flex:1,display:"flex",flexDirection:"column"})}}>
          <div style={{marginBottom:6}}>
            <div style={{fontSize:12,fontWeight:700,color:T.text}}>Laundry Plant Distribution</div>
            <div style={{fontSize:10,color:T.muted}}>By Weight (Kg)</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:16,flex:1}}>
            <div style={{position:"relative",width:100,height:100}}>
              <canvas id="laundryPlantPie" style={{position:"absolute",inset:0,width:"100%",height:"100%"}} />
            </div>
            <div>
              {LAUNDRY_PLANT.map((p,i) => (
                <div key={p.plant} style={{marginBottom:8}}>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <div style={{width:8,height:8,borderRadius:"50%",background:LAUNDRY_PLANT_COLORS[i]}} />
                    <span style={{fontSize:11,color:T.muted}}>{p.plant}</span>
                  </div>
                  <div style={{fontSize:14,fontWeight:700,color:T.text,marginLeft:14}}>
                    {p.weight.toLocaleString()} Kg <span style={{fontSize:10,color:T.muted,fontWeight:400}}>({p.pct}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TabSupply({ T, panelStyle, thStyle, tdStyle }: { T: Theme; panelStyle: (extra?: React.CSSProperties) => React.CSSProperties; thStyle: React.CSSProperties; tdStyle: React.CSSProperties }) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{...panelStyle({padding:"14px"})}}>
        <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:10}}>Supply % by Item</div>
        <div style={{position:"relative",height:300}}>
          <canvas id="supplyItemChart" style={{position:"absolute",inset:0,width:"100%",height:"100%"}} />
        </div>
      </div>
      <div style={{...panelStyle({padding:"14px"})}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead>
            <tr>{["Item","Supply %","Reject %","Volume"].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {SUPPLY_BY_ITEM.map((item,i) => (
              <tr key={i}>
                {[item.item, item.supply+"%", item.reject+"%", item.volume.toLocaleString()].map((cell,j) => (
                  <td key={j} style={tdStyle}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TabSoiled({ T, panelStyle }: { T: Theme; panelStyle: (extra?: React.CSSProperties) => React.CSSProperties }) {
  return (
    <div style={{...panelStyle({padding:"14px",height:"100%"})}}>
      <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:10}}>Soiled Linen Collection (Kg) - Monthly</div>
      <div style={{position:"relative",height:"calc(100% - 40px)"}}>
        <canvas id="soiledChart" style={{position:"absolute",inset:0,width:"100%",height:"100%"}} />
      </div>
    </div>
  );
}

function TabDeduction({ T, panelStyle }: { T: Theme; panelStyle: (extra?: React.CSSProperties) => React.CSSProperties }) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{...panelStyle({padding:"14px"})}}>
        <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:10}}>Shortfall % by Month</div>
        <div style={{position:"relative",height:300}}>
          <canvas id="shortfallChart" style={{position:"absolute",inset:0,width:"100%",height:"100%"}} />
        </div>
      </div>
      <div style={{...panelStyle({padding:"14px"})}}>
        <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:10}}>Deduction Trend</div>
        <div style={{position:"relative",height:200}}>
          <canvas id="deductMonthLine" style={{position:"absolute",inset:0,width:"100%",height:"100%"}} />
        </div>
      </div>
    </div>
  );
}

function TabSR({ T, panelStyle }: { T: Theme; panelStyle: (extra?: React.CSSProperties) => React.CSSProperties }) {
  return (
    <div style={{...panelStyle({padding:"14px",height:"100%"})}}>
      <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:10}}>Service Request by Type</div>
      <div style={{display:"flex",alignItems:"center",gap:20,height:"calc(100% - 40px)"}}>
        <div style={{position:"relative",width:300,height:300}}>
          <canvas id="srTypePie" style={{position:"absolute",inset:0,width:"100%",height:"100%"}} />
        </div>
        <div style={{flex:1}}>
          {SR_BY_TYPE.map((item,i) => (
            <div key={item.type} style={{marginBottom:12}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:10,height:10,borderRadius:"50%",background:[C.primary1,C.support1,C.support2,C.primary2,C.support3,"#6b7280"][i]}} />
                <span style={{fontSize:12,color:T.muted}}>{item.type}</span>
              </div>
              <div style={{fontSize:16,fontWeight:700,color:T.text,marginLeft:18}}>
                {item.count.toLocaleString()} <span style={{fontSize:11,color:T.muted,fontWeight:400}}>({item.pct}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN COMPONENT ────────────────────────────── */
export default function LLSDashboard(){
  const { openSidebar } = useDashboardNav();
  const [activePage,setActivePage]=useState("lls");
  const [activeTab,setActiveTab]=useState("overview");
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
  const HDR="#023047";
  const htc=getContrastText(HDR);

  useEffect(()=>{
    if(scriptsReady.current)return;
    const load=(src:string,cb:()=>void)=>{
      const s=document.createElement("script");
      s.src=src;
      s.onload=cb;
      document.head.appendChild(s);
    };
    load("https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js",()=>{
      load("https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js",()=>{
        scriptsReady.current=true;
      });
    });
  },[]);

  const initBase=useCallback(()=>{
    if(!window.Chart) return;
    
    ["supplyDonut","cleanLinenChart","laundryPlantPie","supplyTrendChart","supplyItemChart","financeChart","deductIndicatorPie","deductMonthLine","rejectTrendChart"].forEach(id=>{
      const c=document.getElementById(id) as HTMLCanvasElement;
      if(c){
        const ex=window.Chart.getChart(c);
        if(ex)ex.destroy();
      }
    });
    
    mkPie("supplyDonut",["Supply","Shortfall"],[SUPPLY_PCT,100-SUPPLY_PCT],[C.primary1,T.border],T,"60%");
    mkLine("cleanLinenChart",MONTHS_12,[{data:CLEAN_LINEN_WEIGHT,borderColor:C.primary1,backgroundColor:C.primary1+"22",fill:true,pointRadius:4,borderWidth:3}],T);
    mkPie("laundryPlantPie",LAUNDRY_PLANT.map(p=>p.plant),LAUNDRY_PLANT.map(p=>p.weight),LAUNDRY_PLANT_COLORS,T,"50%");
    mkLine("supplyTrendChart",M6,[
      {data:SUPPLY_TREND,borderColor:C.primary1,backgroundColor:C.primary1+"22",fill:true,pointRadius:5,borderWidth:3},
      {data:Array(6).fill(SUPPLY_TARGET),borderColor:T.danger,borderDash:[4,3],borderWidth:2.5,pointRadius:0},
    ],T,{scales:{y:{min:93,max:100.5,ticks:{callback:(v:number)=>v+"%"}}}});
    mkBar("supplyItemChart",SUPPLY_BY_ITEM.map(s=>s.item),SUPPLY_BY_ITEM.map(s=>s.supply),ITEM_COLORS,T,{
      indexAxis:"y",
      scales:{x:{min:98,max:100.5,ticks:{callback:(v:number)=>v+"%"}}}
    });
    mkLine("financeChart",FINM,[
      {data:FINANCE_INVOICE,borderColor:T.accent,backgroundColor:T.accent+"22",fill:true,pointRadius:5,borderWidth:3},
      {data:FINANCE_PENALTY,borderColor:T.danger,backgroundColor:T.danger+"18",fill:true,pointRadius:5,borderWidth:3},
    ],T,{scales:{y:{ticks:{callback:(v:number)=>"RM "+(v>=1000?(v/1000).toFixed(0)+"k":v)}}}});
    mkPie("deductIndicatorPie",LI,LV,LC,T,"55%");
    mkLine("deductMonthLine",["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct"],[{
      data:DEDUCTION_BY_MONTH,borderColor:C.support1,backgroundColor:C.support1+"22",fill:true,pointRadius:5,borderWidth:3
    }],T,{scales:{y:{ticks:{callback:(v:number)=>v+"%"}}}});
    mkLine("rejectTrendChart",M6,[{
      data:REJECT_TREND,borderColor:C.support1,backgroundColor:C.support1+"22",fill:true,pointRadius:5,borderWidth:3
    }],T,{scales:{y:{ticks:{callback:(v:number)=>v+"%"}}}});
  }, [T]);

  const initTab=useCallback((tab:string)=>{
    if(!window.Chart) return;
    
    ["soiledChart","shortfallChart","srTypePie"].forEach(id=>{
      const c=document.getElementById(id) as HTMLCanvasElement;
      if(c){
        const ex=window.Chart.getChart(c);
        if(ex)ex.destroy();
      }
    });
    
    if(tab==="supply"){
      mkBar("supplyItemChart",SUPPLY_BY_ITEM.map(s=>s.item),SUPPLY_BY_ITEM.map(s=>s.supply),ITEM_COLORS,T,{
        indexAxis:"y",
        scales:{x:{min:98,max:100.5,ticks:{callback:(v:number)=>v+"%"}}}
      });
    }
    if(tab==="soiled"){
      mkBar("soiledChart",MONTHS_12,SOILED_COLLECTION,Array(12).fill(C.primary2),T);
    }
    if(tab==="deduction"){
      mkBar("shortfallChart",MONTHS_12,SHORTFALL_PCT,SHORTFALL_PCT.map(v=>{
        if(v===0)return"#64748b";if(v<=2)return C.primary2;if(v<=6)return C.support2;if(v<=10)return C.support1;return C.support3;
      }),T);
    }
    if(tab==="sr"){
      mkPie("srTypePie",SR_BY_TYPE.map(s=>s.type),SR_BY_TYPE.map(s=>s.count),[C.primary1,C.support1,C.support2,C.primary2,C.support3,"#6b7280"],T,"0%");
    }
  }, [T]);

  useEffect(()=>{
    if(!scriptsReady.current) return;
    const initCharts = () => {
      if(!window.Chart) { setTimeout(initCharts, 200); return; }
      initBase();
      baseChartsInited.current=true;
    };
    initCharts();
  }, [themeName, initBase]);

  useEffect(()=>{
    if(!scriptsReady.current || !baseChartsInited.current) return;
    if(!window.Chart) return;
    initTab(activeTab);
  }, [activeTab, themeName, initTab]);

  const openModal=(id:string)=>{
    setModal(id);
    setModalStartDate("2025-01-01");
    setModalEndDate("2025-12-31");
    setModalYear("2025");
    setModalMonth("all");
  };

  useEffect(() => {
    if (!modal || !window.Chart) return;
    const timer = setTimeout(() => {
      const currentTheme = THEMES[themeName];
      ["m-srBar","m-srTypePie","m-ncrBar","m-lBar","m-deductLine","m-finLine"].forEach(i=>{
        const c=document.getElementById(i) as HTMLCanvasElement;
        if(c){ const ex=window.Chart.getChart(c); if(ex)ex.destroy(); }
      });
      if(modal==="sr"){
        mkBar("m-srBar",["Total","Normal","Outstanding","Done","Critical"],[SR_TOTAL,SR_NORMAL,SR_OUTSTANDING,SR_DONE,SR_CRITICAL],[currentTheme.accent,currentTheme.success,currentTheme.warn,currentTheme.success,currentTheme.danger],currentTheme);
        mkPie("m-srTypePie",SR_BY_TYPE.map(s=>s.type),SR_BY_TYPE.map(s=>s.count),[C.primary1,C.support1,C.support2,C.primary2,C.support3,"#6b7280"],currentTheme,"50%");
      }
      if(modal==="ncr"){
        mkBar("m-ncrBar",M6,[35,42,28,51,45,78],Array(6).fill(currentTheme.warn),currentTheme);
      }
      if(modal==="deduct"){
        mkBar("m-lBar",LI,LV,LC,currentTheme,{indexAxis:"y"});
        mkLine("m-deductLine",["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct"],[{
          data:DEDUCTION_BY_MONTH,borderColor:C.support1,backgroundColor:C.support1+"22",fill:true,pointRadius:5,borderWidth:3
        }],currentTheme,{scales:{y:{ticks:{callback:(v:number)=>v+"%"}}}});
      }
      if(modal==="finance"){
        mkLine("m-finLine",FINM,[
          {data:FINANCE_INVOICE,borderColor:currentTheme.accent,backgroundColor:currentTheme.accent+"22",fill:true,pointRadius:6,borderWidth:3,label:"Invoice"},
          {data:FINANCE_PENALTY,borderColor:currentTheme.danger,backgroundColor:currentTheme.danger+"18",fill:true,pointRadius:6,borderWidth:3,label:"Penalty"},
        ],currentTheme,{plugins:{legend:{display:true}},scales:{y:{ticks:{callback:(v:number)=>"RM "+(v>=1000?(v/1000).toFixed(0)+"k":v)}}}});
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [modal, themeName]);

  const cardStyle=(extra?:React.CSSProperties):React.CSSProperties=>({background:T.card,border:`1px solid ${T.border}`,borderRadius:16,...extra});
  const panelStyle=(extra?:React.CSSProperties):React.CSSProperties=>({background:T.panel,border:`1px solid ${T.border}`,borderRadius:12,...extra});
  const thStyle:React.CSSProperties={background:T.tableHeaderBg,color:T.accent,padding:"10px 14px",textAlign:"left",fontWeight:700,fontSize:12,borderBottom:`2px solid ${T.border}`};
  const tdStyle:React.CSSProperties={padding:"10px 14px",borderBottom:`1px solid ${T.border}`,color:T.text};

  const inputStyle:React.CSSProperties = {
    background: "#fff",
    color: "#1a2636",
    border: "1px solid rgba(255,255,255,0.3)",
    padding: "6px 12px",
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 600,
  };

  return (
    <div className="dashboard-module-page" style={{fontFamily:"'DM Sans',system-ui,sans-serif",background:T.bg,color:T.text,fontSize:15,height:"100vh",display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');*,::-webkit-scrollbar{scrollbar-width:thin;scrollbar-color:${T.scrollThumb} transparent}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${T.scrollThumb};border-radius:99px}@page{size:A4 landscape;margin:10mm}@media print{body{-webkit-print-color-adjust:exact!important}.no-print{display:none!important}}`}</style>

      {/* TOP BAR */}
      <div className="no-print dashboard-top-bar" style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:HDR,borderBottom:`1px solid ${htc}15`,padding:"0 24px",height:62,flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:16}}>
          <button onClick={openSidebar} style={{background:"transparent",border:"none",color:htc,cursor:"pointer",fontSize:20,padding:"8px 11px",borderRadius:10}}><BIcon name="bi-list" size={22} color={htc} /></button>
          <Link href="/" style={{display:"flex",alignItems:"center",gap:6,padding:"6px 14px",borderRadius:8,border:`1px solid ${htc}30`,color:htc,textDecoration:"none",fontSize:13,fontWeight:500}}><BIcon name="bi-arrow-left" size={16} color={htc} /><span>Back</span></Link>
          <div>
            <div style={{fontSize:17,fontWeight:700,color:htc}}>{currentPage.label} <span style={{fontSize:12,opacity:0.7}}>- HTA</span></div>
            <div style={{fontSize:11,color:htc,opacity:0.6}}>LLS Performance Dashboard</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          {activePage==="lls" && (
            <div style={{display:"flex",gap:8}}>
              <button onClick={exportExcelAll} title="Export" style={{background:T.success+"12",border:`1px solid ${T.success}25`,color:T.success,width:34,height:34,borderRadius:8,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><BIcon name="bi-download" size={15} color={T.success} /></button>
              <button onClick={printPage} title="Print" style={{background:T.accent+"12",border:`1px solid ${T.accent}25`,color:T.accent,width:34,height:34,borderRadius:8,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><BIcon name="bi-printer" size={15} color={T.accent} /></button>
            </div>
          )}
          <div style={{width:1,height:28,background:htc,opacity:0.12}} />
          <button onClick={()=>setThemeName(n=>n==="dark"?"light":"dark")} style={{background:"transparent",border:`1px solid ${htc}20`,color:htc,borderRadius:8,padding:"6px 12px",cursor:"pointer",fontSize:14}}><BIcon name={themeName==="dark"?"bi-sun-fill":"bi-moon-fill"} size={15} color={htc} /></button>
          <span style={{fontSize:13,color:htc,opacity:0.7}}>25 Feb 2026</span>
          <div style={{display:"flex",alignItems:"center",gap:10,padding:"4px 12px 4px 4px",background:htc+"08",borderRadius:24,border:`1px solid ${htc}20`}}>
            <div style={{width:30,height:30,borderRadius:"50%",background:`linear-gradient(135deg,${C.primary1},${C.primary2})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"#fff"}}><BIcon name="bi-person-fill" size={13} color="#fff" /></div>
            <span style={{fontSize:13,fontWeight:600,color:htc}}>Admin</span>
          </div>
        </div>
      </div>

      {/* SIDEBAR */}
      {activePage !== "lls" && (
        <div style={{flex:1}}>
          <PlaceholderPage page={currentPage} T={T} />
        </div>
      )}

      {activePage === "lls" && (
        <>
          {/* FILTER BAR */}
          <div className="no-print dashboard-filter-bar" style={{display:"flex",alignItems:"center",background:HDR,borderBottom:`1px solid ${htc}15`,padding:"0 22px",height:54,gap:12,flexShrink:0,flexWrap:"wrap"}}>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:12,fontWeight:600,color:"#fff"}}>Frequency</span>
              <select value={frequency} onChange={e=>{setFrequency(e.target.value);setFrequencyKey("all");}} style={{background:"#fff",color:"#1a2636",padding:"6px 30px 6px 12px",borderRadius:8,fontSize:12,cursor:"pointer"}}>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:12,fontWeight:600,color:"#fff"}}>Frequency Key</span>
              <select value={frequencyKey} onChange={e=>setFrequencyKey(e.target.value)} style={{background:"#fff",color:"#1a2636",padding:"6px 30px 6px 12px",borderRadius:8,fontSize:12,cursor:"pointer"}}>
                <option value="all">All Months</option>
                {monthsList.map(m=><option key={m} value={m.toLowerCase()}>{m}</option>)}
              </select>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:12,fontWeight:600,color:"#fff"}}>Year</span>
              <select value={selectedYear} onChange={e=>setSelectedYear(e.target.value)} style={{background:"#fff",color:"#1a2636",padding:"6px 30px 6px 12px",borderRadius:8,fontSize:12,cursor:"pointer"}}>
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:12,fontWeight:600,color:"#fff"}}>Start Date</span>
              <input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} style={inputStyle} />
            </div>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:12,fontWeight:600,color:"#fff"}}>End Date</span>
              <input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} style={inputStyle} />
            </div>
            <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:8,paddingLeft:16,borderLeft:"1px solid rgba(255,255,255,0.2)"}}>
              <span style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.55)",textTransform:"uppercase"}}>Location</span>
              <span style={{fontSize:14,fontWeight:700,color:"#fff"}}>HTA</span>
            </div>
          </div>

          <div className="dashboard-main-columns" style={{flex:1,display:"flex",overflow:"hidden",padding:"16px",gap:16}}>
            {/* LEFT COLUMN */}
            <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",gap:14}}>
              <div style={{display:"flex",gap:14,flexShrink:0}}>
                {/* SR Card */}
                <div style={{...cardStyle({flex:1,padding:"18px 20px"}),position:"relative"}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:14,paddingRight:40}}>
                    <span style={{fontSize:14,fontWeight:700,color:T.text}}>Service Request</span>
                    <Badge color="blue" T={T}>Feb&apos;26</Badge>
                  </div>
                  <div style={{display:"flex",gap:16,alignItems:"flex-start"}}>
                    <div style={{textAlign:"center"}}>
                      <div style={{fontSize:42,fontWeight:800,color:T.text}}>{SR_TOTAL.toLocaleString()}</div>
                      <div style={{fontSize:10,color:T.muted,marginTop:3}}>Total SR</div>
                    </div>
                    <div style={{flex:1,display:"flex",flexDirection:"column",gap:8,paddingTop:4}}>
                      <div>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                          <span style={{fontSize:11,color:T.muted}}>Normal</span>
                          <span style={{fontSize:12,fontWeight:700,color:T.success}}>{SR_NORMAL.toLocaleString()}</span>
                        </div>
                        <ProgressBar value={SR_NORMAL} max={SR_TOTAL} color={T.success} T={T} />
                      </div>
                      <div>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                          <span style={{fontSize:11,color:T.muted}}>Outstanding</span>
                          <span style={{fontSize:12,fontWeight:700,color:T.warn}}>{SR_OUTSTANDING.toLocaleString()}</span>
                        </div>
                        <ProgressBar value={SR_OUTSTANDING} max={SR_TOTAL} color={T.warn} T={T} />
                      </div>
                      <div>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                          <span style={{fontSize:11,color:T.muted}}>Critical</span>
                          <span style={{fontSize:12,fontWeight:700,color:T.danger}}>{SR_CRITICAL}</span>
                        </div>
                        <ProgressBar value={SR_CRITICAL} max={SR_TOTAL} color={T.danger} T={T} />
                      </div>
                    </div>
                  </div>
                  <button className="no-print" onClick={()=>openModal("sr")} style={{position:"absolute",top:16,right:18,background:T.panel,border:`1px solid ${T.border}`,color:T.muted,width:30,height:30,borderRadius:8,cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center"}}><BIcon name="bi-arrows-angle-expand" size={14} color={T.muted} /></button>
                </div>
                {/* NCR Card */}
                <div style={{...cardStyle({flex:1,padding:"18px 20px"}),position:"relative"}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:14,paddingRight:40}}>
                    <span style={{fontSize:14,fontWeight:700,color:T.text}}>NCR</span>
                    <Badge color="warn" T={T}>Feb&apos;26</Badge>
                  </div>
                  <div style={{display:"flex",gap:16,alignItems:"flex-start"}}>
                    <div style={{textAlign:"center"}}>
                      <div style={{fontSize:42,fontWeight:800,color:T.text}}>{NCR_TOTAL}</div>
                      <div style={{fontSize:10,color:T.muted,marginTop:3}}>Total NCR</div>
                    </div>
                    <div style={{flex:1,display:"flex",flexDirection:"column",gap:8,paddingTop:4}}>
                      <div>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                          <span style={{fontSize:11,color:T.muted}}>Open</span>
                          <span style={{fontSize:12,fontWeight:700,color:T.danger}}>{NCR_OPEN} ({((NCR_OPEN/NCR_TOTAL)*100).toFixed(1)}%)</span>
                        </div>
                        <ProgressBar value={NCR_OPEN} max={NCR_TOTAL} color={T.danger} T={T} />
                      </div>
                      <div>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                          <span style={{fontSize:11,color:T.muted}}>Closed</span>
                          <span style={{fontSize:12,fontWeight:700,color:T.success}}>{NCR_CLOSED} ({((NCR_CLOSED/NCR_TOTAL)*100).toFixed(1)}%)</span>
                        </div>
                        <ProgressBar value={NCR_CLOSED} max={NCR_TOTAL} color={T.success} T={T} />
                      </div>
                      <div style={{paddingTop:4,borderTop:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between"}}>
                        <span style={{fontSize:11,color:T.muted}}>Closure Rate</span>
                        <span style={{fontSize:13,fontWeight:700,color:C.primary1}}>{NCR_CLOSURE_RATE}%</span>
                      </div>
                    </div>
                  </div>
                  <button className="no-print" onClick={()=>openModal("ncr")} style={{position:"absolute",top:16,right:18,background:T.panel,border:`1px solid ${T.border}`,color:T.muted,width:30,height:30,borderRadius:8,cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center"}}><BIcon name="bi-arrows-angle-expand" size={14} color={T.muted} /></button>
                </div>
              </div>

              {/* PERFORMANCE CARD */}
              <div style={{...cardStyle({overflow:"hidden",display:"flex",flexDirection:"column"}),flex:1,minHeight:0}}>
                <div style={{padding:"14px 18px",borderBottom:`1px solid ${T.border}`,flexShrink:0}}>
                  <span style={{fontSize:15,fontWeight:700,color:T.text}}>
                    Overall LLS Performance <span style={{fontSize:12,color:T.muted}}>— {LLS_TABS.find(t=>t.key===activeTab)?.label}</span>
                  </span>
                </div>
                <div style={{flex:1,display:"flex",overflow:"hidden",minHeight:0}}>
                  <div className="no-print" style={{width:180,flexShrink:0,borderRight:`1px solid ${T.border}`,display:"flex",flexDirection:"column",padding:"10px 7px",gap:4,overflowY:"auto",background:themeName==="light"?"#f8fafc":T.panel}}>
                    {LLS_TABS.map(t => {
                      const isActive = activeTab===t.key;
                      return (
                        <button key={t.key} onClick={()=>setActiveTab(t.key)} style={{width:"100%",padding:"11px 12px",borderRadius:9,fontSize:11,fontWeight:isActive?600:400,border:`1px solid ${isActive?T.accent:T.border}`,background:isActive?T.accent+"12":"transparent",color:isActive?T.accent:T.muted,cursor:"pointer",textAlign:"left",borderLeft:`3px solid ${isActive?T.accent:"transparent"}`}}>
                          {t.label}
                        </button>
                      );
                    })}
                  </div>
                  <div style={{flex:1,overflow:"auto",padding:"14px"}}>
                    {activeTab === "overview" && <TabOverview T={T} panelStyle={panelStyle} />}
                    {activeTab === "supply" && <TabSupply T={T} panelStyle={panelStyle} thStyle={thStyle} tdStyle={tdStyle} />}
                    {activeTab === "soiled" && <TabSoiled T={T} panelStyle={panelStyle} />}
                    {activeTab === "deduction" && <TabDeduction T={T} panelStyle={panelStyle} />}
                    {activeTab === "sr" && <TabSR T={T} panelStyle={panelStyle} />}
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div style={{width:300,flexShrink:0,display:"flex",flexDirection:"column",gap:14,overflow:"hidden"}}>
              {/* Deduction Card */}
              <div style={{...cardStyle({display:"flex",flexDirection:"column",minHeight:0,overflow:"hidden"}),flex:1}}>
                <div style={{padding:"14px 16px",borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",flexShrink:0}}>
                  <div>
                    <div style={{fontSize:14,fontWeight:700,color:T.text}}>Deduction by Indicator</div>
                    <div style={{fontSize:10,color:T.muted}}>{startDate} to {endDate}</div>
                  </div>
                  <button className="no-print" onClick={()=>openModal("deduct")} style={{background:T.panel,border:`1px solid ${T.border}`,color:T.muted,width:28,height:28,borderRadius:7,cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center"}}><BIcon name="bi-arrows-angle-expand" size={13} color={T.muted} /></button>
                </div>
                <div style={{padding:"10px 14px",borderBottom:`1px solid ${T.border}`,display:"flex",gap:16}}>
                  <div style={{textAlign:"center",flex:1}}>
                    <div style={{fontSize:10,color:T.muted}}>% Deduction</div>
                    <div style={{fontSize:18,fontWeight:800,color:C.support1}}>{OVERALL_DEDUCTION_PCT}%</div>
                  </div>
                  <div style={{width:1,background:T.border}} />
                  <div style={{textAlign:"center",flex:1}}>
                    <div style={{fontSize:10,color:T.muted}}>Total</div>
                    <div style={{fontSize:18,fontWeight:800,color:T.success}}>RM 60.00</div>
                  </div>
                </div>
                <div style={{flex:1,padding:"10px 12px",display:"flex",flexDirection:"column",gap:6,overflowY:"auto"}}>
                  <div style={{position:"relative",height:120,flexShrink:0}}>
                    <canvas id="deductIndicatorPie" style={{position:"absolute",inset:0,width:"100%",height:"100%"}} />
                  </div>
                  {LI.map((label,i) => (
                    <div key={label} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 12px",background:T.panel,borderRadius:9,border:`1px solid ${T.border}`}}>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <div style={{width:9,height:9,borderRadius:3,background:LC[i]}} />
                        <span style={{fontSize:13,fontWeight:600,color:T.text}}>{label}</span>
                        <span style={{fontSize:10,color:T.muted}}>{LV[i].toFixed(2)}%</span>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <span style={{fontSize:13,fontWeight:700,color:T.success}}>RM 10.00</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Penalty Card */}
              <div style={{...cardStyle({display:"flex",flexDirection:"column",minHeight:0,overflow:"hidden"}),flex:1}}>
                <div style={{padding:"14px 16px",borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",flexShrink:0}}>
                  <div>
                    <div style={{fontSize:14,fontWeight:700,color:T.text}}>Penalty by Criteria</div>
                    <div style={{fontSize:10,color:T.muted}}>{startDate} to {endDate}</div>
                  </div>
                  <button className="no-print" onClick={()=>openModal("penalty")} style={{background:T.panel,border:`1px solid ${T.border}`,color:T.muted,width:28,height:28,borderRadius:7,cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center"}}><BIcon name="bi-arrows-angle-expand" size={13} color={T.muted} /></button>
                </div>
                <div className="no-print" style={{padding:"8px 14px",display:"flex",gap:7}}>
                  {["critical","value"].map(t => (
                    <button key={t} onClick={()=>setPenTab(t)} style={{fontSize:11,padding:"5px 13px",borderRadius:20,border:`1px solid ${penTab===t?T.accent:T.border}`,background:penTab===t?T.accent+"12":"transparent",color:penTab===t?T.accent:T.muted,cursor:"pointer",fontWeight:penTab===t?700:400}}>
                      {t==="critical"?"Critical Events":"Penalty Value"}
                    </button>
                  ))}
                </div>
                <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:10}}>
                  <BIcon name="bi-check-circle" size={40} color={T.success} />
                  <div style={{fontSize:12,color:T.muted}}>No Data</div>
                  <Badge color="green" T={T}>All KPIs Met</Badge>
                </div>
              </div>

              {/* Finance Card */}
              <div style={{...cardStyle({display:"flex",flexDirection:"column",minHeight:0,overflow:"hidden"}),flex:1}}>
                <div style={{padding:"14px 16px",borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",flexShrink:0}}>
                  <div>
                    <div style={{fontSize:14,fontWeight:700,color:T.text}}>Finance</div>
                    <div style={{fontSize:10,color:T.muted}}>{startDate} to {endDate}</div>
                  </div>
                  <button className="no-print" onClick={()=>openModal("finance")} style={{background:T.panel,border:`1px solid ${T.border}`,color:T.muted,width:28,height:28,borderRadius:7,cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center"}}><BIcon name="bi-arrows-angle-expand" size={13} color={T.muted} /></button>
                </div>
                <div style={{padding:"8px 14px",display:"flex",gap:14}}>
                  <div style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:T.muted}}>
                    <div style={{width:7,height:7,borderRadius:"50%",background:T.accent}} />Invoice
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:T.muted}}>
                    <div style={{width:7,height:7,borderRadius:"50%",background:T.danger}} />Penalty
                  </div>
                </div>
                <div style={{flex:1,padding:"0 12px 12px",position:"relative",minHeight:0}}>
                  <canvas id="financeChart" style={{position:"absolute",inset:0,width:"100%",height:"100%"}} />
                </div>
              </div>
            </div>
          </div>

          {/* MODALS */}
          {modal==="sr" && (
            <Modal title="Service Request — Feb'26" onClose={()=>setModal(null)} T={T} onPrint={printPage}>
              <FilterRow year={modalYear} setYear={setModalYear} month={modalMonth} setMonth={setModalMonth} startDate={modalStartDate} setStartDate={setModalStartDate} endDate={modalEndDate} setEndDate={setModalEndDate} T={T} />
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
                {[
                  {v:SR_TOTAL.toLocaleString(),l:"Total SR",c:T.accent},
                  {v:SR_NORMAL.toLocaleString(),l:"Normal",c:T.success},
                  {v:String(SR_CRITICAL),l:"Critical",c:T.danger},
                  {v:SR_OUTSTANDING.toLocaleString(),l:"Outstanding",c:T.warn},
                  {v:SR_DONE.toLocaleString(),l:"Done",c:T.success},
                  {v:((SR_DONE/SR_TOTAL)*100).toFixed(1)+"%",l:"Completion",c:C.primary1}
                ].map((s,i) => (
                  <div key={i} style={{background:T.card,borderRadius:12,padding:"14px",textAlign:"center",border:`1px solid ${T.border}`}}>
                    <div style={{fontSize:26,fontWeight:800,color:s.c}}>{s.v}</div>
                    <div style={{fontSize:12,color:T.muted,marginTop:4}}>{s.l}</div>
                  </div>
                ))}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                <div>
                  <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:12}}>SR Status Breakdown</div>
                  <div style={{position:"relative",height:220}}><canvas id="m-srBar" /></div>
                </div>
                <div>
                  <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:12}}>SR by Type of Request</div>
                  <div style={{display:"flex",alignItems:"center",gap:16}}>
                    <div style={{position:"relative",width:160,height:160}}><canvas id="m-srTypePie" /></div>
                    <div style={{flex:1}}>
                      {SR_BY_TYPE.map((it,i) => (
                        <div key={it.type} style={{marginBottom:8}}>
                          <div style={{display:"flex",alignItems:"center",gap:4}}>
                            <div style={{width:7,height:7,borderRadius:"50%",background:[C.primary1,C.support1,C.support2,C.primary2,C.support3,"#6b7280"][i]}} />
                            <span style={{fontSize:10,color:T.muted}}>{it.type}</span>
                          </div>
                          <div style={{fontSize:14,fontWeight:700,color:T.text}}>{it.count.toLocaleString()} <span style={{fontSize:9,color:T.muted}}>({it.pct}%)</span></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:13,marginTop:18}}>
                <thead><tr>{["Type","Count","%","Period"].map(h=><th key={h} style={thStyle}>{h}</th>)}</tr></thead>
                <tbody>
                  {[
                    ...SR_BY_TYPE.map(r=>[r.type,String(r.count),r.pct+"%","Overall"]),
                    ["Normal SR",String(SR_NORMAL),"100%","Feb'26"],
                    ["Outstanding",String(SR_OUTSTANDING),((SR_OUTSTANDING/SR_TOTAL)*100).toFixed(1)+"%","Feb'26"],
                    ["Done",String(SR_DONE),((SR_DONE/SR_TOTAL)*100).toFixed(1)+"%","Feb'26"]
                  ].map((r,i) => (
                    <tr key={i}>{r.map((cell,j)=><td key={j} style={tdStyle}>{cell}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </Modal>
          )}

          {modal==="ncr" && (
            <Modal title="NCR — Feb'26" onClose={()=>setModal(null)} T={T} onPrint={printPage}>
              <FilterRow year={modalYear} setYear={setModalYear} month={modalMonth} setMonth={setModalMonth} startDate={modalStartDate} setStartDate={setModalStartDate} endDate={modalEndDate} setEndDate={setModalEndDate} T={T} />
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
                {[
                  {v:String(NCR_TOTAL),l:"Total NCR",c:T.warn},
                  {v:String(NCR_OPEN),l:"Open",c:T.danger},
                  {v:String(NCR_CLOSED),l:"Closed",c:T.success},
                  {v:NCR_CLOSURE_RATE+"%",l:"Closure Rate",c:C.primary1}
                ].map((s,i) => (
                  <div key={i} style={{background:T.card,borderRadius:12,padding:"14px",textAlign:"center",border:`1px solid ${T.border}`}}>
                    <div style={{fontSize:26,fontWeight:800,color:s.c}}>{s.v}</div>
                    <div style={{fontSize:12,color:T.muted,marginTop:4}}>{s.l}</div>
                  </div>
                ))}
              </div>
              <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:12}}>NCR Trend — Previous 6 Months</div>
              <div style={{position:"relative",height:240}}><canvas id="m-ncrBar" /></div>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:13,marginTop:18}}>
                <thead><tr>{["Month","Total NCR","Open","Closed","Closure Rate"].map(h=><th key={h} style={thStyle}>{h}</th>)}</tr></thead>
                <tbody>
                  {[
                    ["Sep '25","35","28","7","20.0%"],
                    ["Oct '25","42","32","10","23.8%"],
                    ["Nov '25","28","20","8","28.6%"],
                    ["Dec '25","51","40","11","21.6%"],
                    ["Jan '26","45","35","10","22.2%"],
                    ["Feb '26","78","58","20","25.6%"]
                  ].map((r,i) => (
                    <tr key={i}>{r.map((cell,j)=><td key={j} style={tdStyle}>{cell}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </Modal>
          )}

          {modal==="deduct" && (
            <Modal title="Deduction by Indicator — Jan'26" onClose={()=>setModal(null)} T={T} onPrint={printPage}>
              <FilterRow year={modalYear} setYear={setModalYear} month={modalMonth} setMonth={setModalMonth} startDate={modalStartDate} setStartDate={setModalStartDate} endDate={modalEndDate} setEndDate={setModalEndDate} showMonth={false} T={T} />
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:20}}>
                <div style={{background:`linear-gradient(135deg,${C.support1}15,${C.support1}05)`,borderRadius:14,padding:"18px",textAlign:"center",border:`1px solid ${C.support1}25`}}>
                  <div style={{fontSize:11,color:C.support1,textTransform:"uppercase",marginBottom:8}}>% Deduction Overall</div>
                  <div style={{fontSize:34,fontWeight:800,color:C.support1}}>{OVERALL_DEDUCTION_PCT}%</div>
                </div>
                <div style={{background:T.card,borderRadius:14,padding:"18px",textAlign:"center",border:`1px solid ${T.border}`}}>
                  <div style={{fontSize:11,color:T.muted,textTransform:"uppercase",marginBottom:8}}>Total User Area</div>
                  <div style={{fontSize:34,fontWeight:800,color:C.support3}}>{TOTAL_USER_AREA}</div>
                </div>
                <div style={{background:T.card,borderRadius:14,padding:"18px",textAlign:"center",border:`1px solid ${T.border}`}}>
                  <div style={{fontSize:11,color:T.muted,textTransform:"uppercase",marginBottom:8}}>Total Deduction</div>
                  <div style={{fontSize:28,fontWeight:800,color:T.success}}>RM 60.00</div>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
                {LI.map((label,i) => (
                  <div key={label} style={{background:T.card,borderRadius:12,padding:"14px",textAlign:"center",border:`1px solid ${T.border}`}}>
                    <div style={{width:11,height:11,borderRadius:"50%",background:LC[i],display:"inline-block",marginBottom:8}} />
                    <div style={{fontSize:18,fontWeight:800,color:LC[i]}}>RM 10.00</div>
                    <div style={{fontSize:12,color:T.muted,marginTop:4}}>{label} — {LV[i].toFixed(2)}%</div>
                  </div>
                ))}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                <div>
                  <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:12}}>% L1–L6 Distribution</div>
                  <div style={{position:"relative",height:220}}><canvas id="m-lBar" /></div>
                </div>
                <div>
                  <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:12}}>% Deduction Trend (Jan–Oct)</div>
                  <div style={{position:"relative",height:220}}><canvas id="m-deductLine" /></div>
                </div>
              </div>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:13,marginTop:18}}>
                <thead><tr>{["Indicator","% Weight","Deduction (RM)"].map(h=><th key={h} style={thStyle}>{h}</th>)}</tr></thead>
                <tbody>
                  {LI.map((label,i) => (
                    <tr key={label}>{[label,LV[i].toFixed(2)+"%","RM 10.00"].map((cell,j)=><td key={j} style={tdStyle}>{cell}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </Modal>
          )}

          {modal==="penalty" && (
            <Modal title="Penalty by Criteria — Feb'26" onClose={()=>setModal(null)} T={T} onPrint={printPage}>
              <FilterRow year={modalYear} setYear={setModalYear} month={modalMonth} setMonth={setModalMonth} startDate={modalStartDate} setStartDate={setModalStartDate} endDate={modalEndDate} setEndDate={setModalEndDate} T={T} />
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
                {[
                  {v:"0",l:"Critical Events",c:T.success},
                  {v:"RM 0.00",l:"Total Penalty",c:T.success},
                  {v:"0",l:"L1 Events",c:T.success},
                  {v:"0",l:"L2 Events",c:T.success}
                ].map((s,i) => (
                  <div key={i} style={{background:T.card,borderRadius:12,padding:"14px",textAlign:"center",border:`1px solid ${T.border}`}}>
                    <div style={{fontSize:22,fontWeight:800,color:s.c}}>{s.v}</div>
                    <div style={{fontSize:12,color:T.muted,marginTop:4}}>{s.l}</div>
                  </div>
                ))}
              </div>
              <div style={{background:T.success+"05",border:`1px solid ${T.success}20`,borderRadius:14,padding:24,textAlign:"center"}}>
                <BIcon name="bi-check-circle-fill" size={40} color={T.success} />
                <div style={{fontSize:16,fontWeight:700,color:T.success,marginBottom:6}}>No Penalty Events Recorded</div>
                <div style={{fontSize:13,color:T.muted}}>All KPI thresholds met.</div>
              </div>
            </Modal>
          )}

          {modal==="finance" && (
            <Modal title="Finance — Aug'25 to Jan'26" onClose={()=>setModal(null)} T={T} onPrint={printPage}>
              <FilterRow year={modalYear} setYear={setModalYear} month={modalMonth} setMonth={setModalMonth} startDate={modalStartDate} setStartDate={setModalStartDate} endDate={modalEndDate} setEndDate={setModalEndDate} showMonth={true} T={T} />
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
                {[
                  {v:"RM 120,105",l:"Aug Invoice",c:T.accent},
                  {v:"RM 119,326",l:"Sep Invoice",c:T.accent},
                  {v:"RM 134,552",l:"Oct Invoice",c:T.accent},
                  {v:"RM 140,710",l:"Nov Invoice",c:T.accent},
                  {v:"RM 0",l:"Dec Invoice",c:T.muted},
                  {v:"RM 175",l:"Jan Penalty",c:T.danger}
                ].map((s,i) => (
                  <div key={i} style={{background:T.card,borderRadius:12,padding:"14px",textAlign:"center",border:`1px solid ${T.border}`}}>
                    <div style={{fontSize:18,fontWeight:800,color:s.c}}>{s.v}</div>
                    <div style={{fontSize:12,color:T.muted,marginTop:4}}>{s.l}</div>
                  </div>
                ))}
              </div>
              <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:12}}>Finance Overview</div>
              <div style={{position:"relative",height:260}}><canvas id="m-finLine" /></div>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:13,marginTop:18}}>
                <thead><tr>{["Month","Invoice (RM)","Penalty (RM)"].map(h=><th key={h} style={thStyle}>{h}</th>)}</tr></thead>
                <tbody>
                  {[
                    ["Aug '25","120,105.00","0.00"],
                    ["Sep '25","119,326.00","0.00"],
                    ["Oct '25","134,552.00","0.00"],
                    ["Nov '25","140,710.00","0.00"],
                    ["Dec '25","0.00","0.00"],
                    ["Jan '26","0.00","175.00"]
                  ].map((r,i) => (
                    <tr key={i}>{r.map((cell,j)=><td key={j} style={tdStyle}>{cell}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </Modal>
          )}
        </>
      )}
    </div>
  );
}