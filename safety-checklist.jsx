<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
<title>TBM 안전회의</title>
<link rel="manifest" href="/manifest.json"/>
<meta name="theme-color" content="#2563eb"/>
<meta name="mobile-web-app-capable" content="yes"/>
<meta name="apple-mobile-web-app-capable" content="yes"/>
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"/>
<meta name="apple-mobile-web-app-title" content="TBM"/>
<script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
<script src="https://cdn.sheetjs.com/xlsx-0.20.2/package/dist/xlsx.full.min.js"></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore-compat.js"></script>
<style>
*{box-sizing:border-box;margin:0;padding:0;}
body{background:#0f1117;color:#e8eaf0;font-family:'Apple SD Gothic Neo','Noto Sans KR',sans-serif;min-height:100vh;}
#root{max-width:480px;margin:0 auto;min-height:100vh;}
button,input,textarea{font-family:inherit;}
textarea{resize:vertical;}
</style>
</head>
<body>
<div id="root"></div>
<script type="text/babel">
const { useState, useEffect } = React;

const firebaseConfig = {
  apiKey: "AIzaSyAeGVDpWv7fx402-6aikCxevTjbvmY7He4",
  authDomain: "safety-119.firebaseapp.com",
  projectId: "safety-119",
  storageBucket: "safety-119.firebasestorage.app",
  messagingSenderId: "439537536567",
  appId: "1:439537536567:web:fb93d56c1beb11f01a39b2"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const TEAMS = ["1","2","3","4","5","6"];
const GROUPS = {};
TEAMS.forEach(t => { GROUPS[t] = Array.from({length:15},(_,i)=>`${t} ${i+1}조`); });
const ALL_GROUPS = TEAMS.flatMap(t => GROUPS[t]);
const TEAM_COLORS = ["#2563eb","#0891b2","#059669","#d97706","#7c3aed","#db2777"];

const QUESTIONS = [
  {id:1, text:"스트레칭을 실시하였습니까?", type:"yesno"},
  {id:2, text:"작업자의 건강상태가 작업에 적합한지 여부를 확인하였습니까?", type:"yesno"},
  {id:3, text:"비상 대응 절차 및 피난로와 비상물품보관함, 아이/바다샤워 위치를 동료(작업자)에게 안내하였습니까?", type:"yesno"},
  {id:4, text:"금일 작업에 사용하는 보호구 및 작업도구를 잘 확인하였습니까?", type:"yesno", note:"보호구 및 작업도구 제품 상태, 착용 상태 양호"},
  {id:5, text:"작업 중 사고 위험(작업 중지권)이 있거나, 상호개입, 개선 제한 사항이 있습니까?", type:"yesno"},
  {id:"5-1", text:"사고 위험(작업 중지권), 상호개입, 개선 제한 사항이 있을 시 내용 입력", type:"text", condition:{q:5,val:"네"}, note:'"네" 작성 / "아니요" 공란'},
];

const DEFAULT_NOTICES = [
  "오늘의 안전 수칙: 작업 전 반드시 보호구를 착용하세요.",
  "안전 제일! 무리한 작업은 금물입니다. 동료와 함께 확인하세요.",
  "비상구 및 소화기 위치를 항상 숙지하고 있어야 합니다.",
  "작업 중 이상 발견 시 즉시 작업을 중단하고 보고하세요.",
  "정리정돈은 사고 예방의 첫걸음입니다. 작업 후 주변을 정리하세요.",
  "피로 누적은 사고의 원인! 충분한 휴식 후 작업에 임하세요.",
  "개인 보호구는 정기적으로 점검하고 파손 시 즉시 교체하세요.",
];

const ADMIN_ACCOUNTS = [
  {id:"admin",  password:"260701", role:"super", label:"최종 관리자",      team:null},
  {id:"team1",  password:"1111",   role:"team",  label:"라인상부 관리자",  team:"라인상부"},
  {id:"team2",  password:"2222",   role:"team",  label:"라인하부 관리자",  team:"라인하부"},
  {id:"team3",  password:"3333",   role:"team",  label:"V2 관리자",       team:"V2"},
  {id:"team4",  password:"4444",   role:"team",  label:"EDS 관리자",      team:"EDS"},
  {id:"team5",  password:"5555",   role:"team",  label:"스막 관리자",     team:"스막"},
  {id:"team6",  password:"6666",   role:"team",  label:"스막교대 관리자", team:"스막교대"},
];

const kstNow = () => new Date(new Date().getTime() + 9*60*60*1000);
const todayKST = () => kstNow().toISOString().slice(0,10);
const kstTimeStr = () => {
  const k=kstNow(), h=k.getUTCHours(), m=String(k.getUTCMinutes()).padStart(2,"0");
  return `${h<12?"오전":"오후"} ${h%12||12}:${m}`;
};
const getDayOfYear = () => {
  const k=kstNow();
  return Math.floor((k-new Date(Date.UTC(k.getUTCFullYear(),0,1)))/86400000);
};
const fmtDateFull = key => {
  if(!key) return "";
  const [y,m,d]=key.split("-");
  return `${y}년 ${Number(m)}월 ${Number(d)}일`;
};

// ── 달력 ─────────────────────────────────────────────────────
function CalendarPicker({value, onChange, onClose}) {
  const init = value ? new Date(value+"T00:00:00") : new Date();
  const [vy, setVy] = useState(init.getFullYear());
  const [vm, setVm] = useState(init.getMonth());
  const firstDay = new Date(vy,vm,1).getDay();
  const days = new Date(vy,vm+1,0).getDate();
  const cells = [...Array(firstDay).fill(null), ...Array.from({length:days},(_,i)=>i+1)];
  const pick = d => {
    if(!d) return;
    onChange(`${vy}-${String(vm+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`);
    onClose();
  };
  return (
    <div style={{position:"fixed",inset:0,background:"#000000aa",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={onClose}>
      <div style={{background:"#161b27",border:"1px solid #1e2535",borderRadius:16,padding:18,width:290}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <button style={Sb.smallBtn} onClick={()=>vm===0?(setVm(11),setVy(y=>y-1)):setVm(m=>m-1)}>‹</button>
          <span style={{fontSize:14,fontWeight:700,color:"#f0f4ff"}}>{vy}년 {vm+1}월</span>
          <button style={Sb.smallBtn} onClick={()=>vm===11?(setVm(0),setVy(y=>y+1)):setVm(m=>m+1)}>›</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
          {["일","월","화","수","목","금","토"].map(d=><div key={d} style={{textAlign:"center",fontSize:10,color:"#6b7280",fontWeight:700,padding:"3px 0"}}>{d}</div>)}
          {cells.map((d,i)=>{
            const key=d?`${vy}-${String(vm+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`:null;
            const isSel=key===value, isToday=key===todayKST();
            return <div key={i} style={{textAlign:"center",padding:"6px 2px",fontSize:12,borderRadius:5,cursor:d?"pointer":"default",color:!d?"transparent":isSel?"#fff":isToday?"#60a5fa":"#9ca3af",background:isSel?"#2563eb":isToday?"#1e3a5f":"transparent",fontWeight:(isSel||isToday)?700:400}} onClick={()=>pick(d)}>{d||""}</div>;
          })}
        </div>
        <button style={{...Sb.smallBtn,width:"100%",marginTop:10}} onClick={onClose}>닫기</button>
      </div>
    </div>
  );
}

// ── 막대그래프 ────────────────────────────────────────────────
function BarChart({data, maxVal=15}) {
  const max=Math.max(maxVal,...data.map(d=>d.val),1);
  return (
    <div style={{padding:"0 14px 14px"}}>
      {data.map(({label,val,color})=>(
        <div key={label} style={{marginBottom:9}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
            <span style={{fontSize:11,color:"#9ca3af",fontWeight:600}}>{label}</span>
            <span style={{fontSize:11,color:"#60a5fa",fontWeight:700}}>{val}회</span>
          </div>
          <div style={{height:18,background:"#1e2535",borderRadius:4,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${(val/max)*100}%`,background:color,borderRadius:4,transition:"width 0.6s",display:"flex",alignItems:"center",paddingLeft:5}}>
              {val>0&&<span style={{fontSize:10,color:"#fff",fontWeight:700}}>{val}</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── 공통 스타일 ───────────────────────────────────────────────
const Sb = {
  btnPrimary:{width:"100%",padding:15,background:"linear-gradient(135deg,#2563eb,#1d4ed8)",color:"#fff",border:"none",borderRadius:12,fontSize:15,fontWeight:700,cursor:"pointer"},
  btnSecondary:{width:"100%",padding:15,background:"#161b27",color:"#9ca3af",border:"1px solid #1e2535",borderRadius:12,fontSize:14,fontWeight:600,cursor:"pointer"},
  btnGreen:{width:"100%",padding:15,background:"linear-gradient(135deg,#059669,#047857)",color:"#fff",border:"none",borderRadius:12,fontSize:15,fontWeight:700,cursor:"pointer"},
  card:{margin:"12px 14px 0",background:"#161b27",border:"1px solid #1e2535",borderRadius:12,padding:14},
  chip:{padding:"7px 12px",background:"#161b27",border:"1px solid #1e2535",borderRadius:8,color:"#9ca3af",fontSize:12,fontWeight:600,cursor:"pointer"},
  chipActive:{padding:"7px 12px",background:"#2563eb",border:"1px solid #2563eb",borderRadius:8,color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer"},
  chipDone:{padding:"7px 12px",background:"#0d2b1a",border:"1px solid #166534",borderRadius:8,color:"#4ade80",fontSize:12,fontWeight:600,cursor:"not-allowed"},
  radio:{flex:1,padding:11,background:"#0f1117",border:"1px solid #1e2535",borderRadius:8,color:"#9ca3af",fontSize:14,fontWeight:600,cursor:"pointer"},
  radioActive:{flex:1,padding:11,background:"#1e3a5f",border:"1px solid #2563eb",borderRadius:8,color:"#60a5fa",fontSize:14,fontWeight:700,cursor:"pointer"},
  smallBtn:{padding:"6px 11px",background:"#1e2535",border:"1px solid #374151",borderRadius:6,color:"#9ca3af",fontSize:12,fontWeight:600,cursor:"pointer"},
  input:{width:"100%",padding:13,background:"#0f1117",border:"1px solid #1e2535",borderRadius:8,color:"#e8eaf0",fontSize:14,marginBottom:10,display:"block"},
  textarea:{width:"100%",minHeight:70,background:"#0f1117",border:"1px solid #1e2535",borderRadius:8,color:"#e8eaf0",fontSize:13,padding:10,display:"block"},
  topBar:{display:"flex",alignItems:"center",padding:14,borderBottom:"1px solid #1e2535",background:"#0f1117",position:"sticky",top:0,zIndex:10},
  backBtn:{background:"none",border:"none",color:"#60a5fa",fontSize:14,cursor:"pointer",padding:0},
  topTitle:{fontSize:15,fontWeight:700,color:"#f0f4ff",flex:1,textAlign:"center",marginRight:36},
  badgeSuper:{fontSize:10,fontWeight:700,background:"#7c3aed",color:"#fff",padding:"2px 7px",borderRadius:4,whiteSpace:"nowrap"},
  badgeTeam:{fontSize:10,fontWeight:700,background:"#0369a1",color:"#fff",padding:"2px 7px",borderRadius:4,whiteSpace:"nowrap"},
  sectionHdr:{padding:"10px 14px",fontSize:12,fontWeight:700,color:"#9ca3af",borderBottom:"1px solid #1e2535",background:"#1a1f2e"},
  nameInput:{width:"100%",padding:"9px 10px",background:"#0f1117",border:"1px solid #1e2535",borderRadius:6,color:"#e8eaf0",fontSize:13},
};


// ── 팀 이름 관리 페이지 ─────────────────────────────────────
function TeamNamesPage({teamNames, onSave, onBack}) {
  const [editNames, setEditNames] = useState({...teamNames});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(editNames);
    setSaving(false);
    setSaved(true);
    setTimeout(()=>setSaved(false), 2000);
  };

  return (
    <div style={{paddingBottom:40}}>
      <div style={Sb.topBar}>
        <button style={Sb.backBtn} onClick={onBack}>← 뒤로</button>
        <span style={Sb.topTitle}>팀 이름 관리</span>
      </div>
      <div style={{...Sb.card,background:"#1a1f2e",border:"1px solid #2563eb44"}}>
        <p style={{fontSize:12,color:"#60a5fa",fontWeight:700,marginBottom:4}}>✏️ 최종 관리자 전용</p>
        <p style={{fontSize:12,color:"#9ca3af",lineHeight:1.6}}>
          팀 이름을 자유롭게 바꿀 수 있어요.<br/>
          비우면 기본 이름으로 표시돼요.
        </p>
      </div>
      <div style={Sb.card}>
        <p style={{fontSize:13,fontWeight:700,color:"#f0f4ff",marginBottom:12}}>팀 이름 편집</p>
        {TEAMS.map((teamKey, idx) => (
          <div key={teamKey} style={{marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}>
              <span style={{fontSize:11,color:"#6b7280",fontWeight:700,minWidth:36}}>팀 {idx+1}</span>
              <span style={{fontSize:10,color:"#374151"}}>기본: {teamKey}</span>
            </div>
            <div style={{display:"flex",gap:6}}>
              <input
                style={{...Sb.nameInput,flex:1}}
                type="text"
                placeholder={teamKey}
                value={editNames[teamKey]||""}
                onChange={e=>setEditNames(p=>({...p,[teamKey]:e.target.value}))}
              />
              {editNames[teamKey] && (
                <button style={{...Sb.smallBtn,padding:"6px 8px",color:"#f87171"}}
                  onClick={()=>setEditNames(p=>{const u={...p};delete u[teamKey];return u;})}>✕</button>
              )}
            </div>
          </div>
        ))}
      </div>
      <div style={{padding:"14px 14px 0",display:"flex",flexDirection:"column",gap:10}}>
        <button style={{...Sb.btnPrimary,background:saved?"linear-gradient(135deg,#059669,#047857)":undefined}}
          onClick={handleSave} disabled={saving}>
          {saving?"저장 중...":saved?"✅ 저장 완료!":"💾 저장"}
        </button>
        <button style={Sb.btnSecondary} onClick={onBack}>← 대시보드로 돌아가기</button>
      </div>
    </div>
  );
}

// ── 조 이름 관리 페이지 ───────────────────────────────────────
function GroupNamesPage({groupNames, onSave, onBack}) {
  // 팀별로 편집용 임시 상태
  const [editNames, setEditNames] = useState({...groupNames});
  const [selTeam, setSelTeam] = useState(TEAMS[0]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleChange = (groupKey, val) => {
    setEditNames(p => ({...p, [groupKey]: val}));
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(editNames);
    setSaving(false);
    setSaved(true);
    setTimeout(()=>setSaved(false), 2000);
  };

  const handleReset = (groupKey) => {
    setEditNames(p => {
      const u = {...p};
      delete u[groupKey];
      return u;
    });
  };

  return (
    <div style={{paddingBottom:40}}>
      <div style={Sb.topBar}>
        <button style={Sb.backBtn} onClick={onBack}>← 뒤로</button>
        <span style={Sb.topTitle}>조 이름 관리</span>
      </div>

      <div style={{...Sb.card,background:"#1a1f2e",border:"1px solid #2563eb44"}}>
        <p style={{fontSize:12,color:"#60a5fa",fontWeight:700,marginBottom:4}}>✏️ 최종 관리자 전용</p>
        <p style={{fontSize:12,color:"#9ca3af",lineHeight:1.6}}>
          각 조의 이름을 자유롭게 바꿀 수 있어요.<br/>
          비우면 기본 이름(예: 라인상부 1조)으로 표시돼요.
        </p>
      </div>

      {/* 팀 탭 */}
      <div style={{padding:"12px 14px 0"}}>
        <div style={{fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:8,letterSpacing:1}}>팀 선택</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
          {TEAMS.map(t=>(
            <button key={t} style={selTeam===t?Sb.chipActive:Sb.chip} onClick={()=>setSelTeam(t)}>{teamNames[t]||t}</button>
          ))}
        </div>
      </div>

      {/* 선택된 팀의 조 이름 편집 */}
      <div style={Sb.card}>
        <p style={{fontSize:13,fontWeight:700,color:"#f0f4ff",marginBottom:12}}>{teamNames[selTeam]||selTeam} — 조 이름 편집</p>
        {GROUPS[selTeam].map((groupKey, idx) => {
          const defaultName = groupKey;
          const customName = editNames[groupKey] || "";
          return (
            <div key={groupKey} style={{marginBottom:10}}>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                <span style={{fontSize:11,color:"#6b7280",minWidth:32,fontWeight:700}}>{idx+1}조</span>
                <span style={{fontSize:10,color:"#374151"}}>기본: {defaultName}</span>
              </div>
              <div style={{display:"flex",gap:6}}>
                <input
                  style={{...Sb.nameInput,flex:1}}
                  type="text"
                  placeholder={defaultName}
                  value={customName}
                  onChange={e=>handleChange(groupKey, e.target.value)}
                />
                {editNames[groupKey] && (
                  <button style={{...Sb.smallBtn,padding:"6px 8px",color:"#f87171"}} onClick={()=>handleReset(groupKey)}>✕</button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{padding:"14px 14px 0",display:"flex",flexDirection:"column",gap:10}}>
        <button style={{...Sb.btnPrimary,background:saved?"linear-gradient(135deg,#059669,#047857)":undefined}} onClick={handleSave} disabled={saving}>
          {saving?"저장 중...":saved?"✅ 저장 완료!":"💾 전체 저장"}
        </button>
        <button style={Sb.btnSecondary} onClick={onBack}>← 대시보드로 돌아가기</button>
      </div>
    </div>
  );
}


// ── 엑셀 다운로드 페이지 ─────────────────────────────────────
function ExcelPage({allSubs, groupNames, adminTeam, isSuper, onBack}) {
  const gName = g => groupNames[g] || g;
  const kNow = kstNow();
  const firstOfMonth = `${kNow.getUTCFullYear()}-${String(kNow.getUTCMonth()+1).padStart(2,"0")}-01`;
  const [startDate, setStartDate] = useState(firstOfMonth);
  const [endDate, setEndDate] = useState(todayKST());
  const [showStartCal, setShowStartCal] = useState(false);
  const [showEndCal, setShowEndCal] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const countRows = () => {
    if(!startDate||!endDate||startDate>endDate) return 0;
    let cnt=0;
    const s=new Date(startDate+"T00:00:00"), e=new Date(endDate+"T00:00:00");
    for(let d=new Date(s);d<=e;d.setDate(d.getDate()+1)){
      const dk=d.toISOString().slice(0,10);
      Object.values(allSubs[dk]||{}).forEach(sub=>{
        if(isSuper||sub.team===adminTeam) cnt++;
      });
    }
    return cnt;
  };

  const handleDownload = () => {
    if(!startDate||!endDate) return alert("기간을 선택해주세요.");
    if(startDate>endDate) return alert("시작일이 종료일보다 늦을 수 없어요.");
    setDownloading(true);
    try {
      const rows=[];
      const s=new Date(startDate+"T00:00:00"), e=new Date(endDate+"T00:00:00");
      for(let d=new Date(s);d<=e;d.setDate(d.getDate()+1)){
        const dk=d.toISOString().slice(0,10);
        Object.values(allSubs[dk]||{}).forEach(sub=>{
          if(!isSuper&&sub.team!==adminTeam) return;
          rows.push({
            "날짜": fmtDateFull(dk),
            "팀": sub.team||"",
            "조": gName(sub.group)||"",
            "진행자": sub.name||"",
            "제출시간": sub.time||"",
            "Q1.스트레칭": sub.answers?.[1]||"",
            "Q2.건강상태": sub.answers?.[2]||"",
            "Q3.비상대응안내": sub.answers?.[3]||"",
            "Q4.보호구확인": sub.answers?.[4]||"",
            "Q5.사고위험여부": sub.answers?.[5]||"",
            "Q5-1.위험내용": sub.answers?.["5-1"]||"",
          });
        });
      }
      if(rows.length===0){setDownloading(false);return alert("선택한 기간에 데이터가 없어요.");}
      const ws=XLSX.utils.json_to_sheet(rows);
      ws["!cols"]=[{wch:14},{wch:10},{wch:14},{wch:10},{wch:10},{wch:10},{wch:10},{wch:12},{wch:10},{wch:12},{wch:30}];
      const wb=XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb,ws,"TBM제출기록");
      XLSX.writeFile(wb,`TBM_${startDate}_${endDate}.xlsx`);
    } catch(e){alert("다운로드 실패: "+e.message);}
    setDownloading(false);
  };

  const quickSet = (s,e) => {setStartDate(s);setEndDate(e);};

  return (
    <div style={{paddingBottom:40}}>
      {showStartCal&&<CalendarPicker value={startDate} onChange={v=>{setStartDate(v);setShowStartCal(false);}} onClose={()=>setShowStartCal(false)}/>}
      {showEndCal&&<CalendarPicker value={endDate} onChange={v=>{setEndDate(v);setShowEndCal(false);}} onClose={()=>setShowEndCal(false)}/>}
      <div style={Sb.topBar}>
        <button style={Sb.backBtn} onClick={onBack}>← 뒤로</button>
        <span style={Sb.topTitle}>엑셀 다운로드</span>
      </div>
      <div style={{...Sb.card,background:"#0d2b1a",border:"1px solid #166534"}}>
        <p style={{fontSize:12,color:"#4ade80",fontWeight:700,marginBottom:4}}>📊 기간별 엑셀 다운로드</p>
        <p style={{fontSize:12,color:"#9ca3af",lineHeight:1.6}}>기간을 선택하면 TBM 제출 기록을<br/>엑셀 파일(.xlsx)로 저장할 수 있어요.</p>
      </div>
      <div style={Sb.card}>
        <p style={{fontSize:13,fontWeight:700,color:"#f0f4ff",marginBottom:12}}>📅 기간 설정</p>
        <div style={{marginBottom:12}}>
          <p style={{fontSize:11,color:"#6b7280",marginBottom:6,fontWeight:600}}>시작일</p>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <button style={{...Sb.smallBtn,padding:"9px 14px",background:"#1e3a5f",border:"1px solid #2563eb55",color:"#60a5fa"}} onClick={()=>setShowStartCal(true)}>📅 선택</button>
            <span style={{fontSize:14,fontWeight:700,color:"#f0f4ff"}}>{startDate?fmtDateFull(startDate):"날짜 선택"}</span>
          </div>
        </div>
        <div style={{marginBottom:14}}>
          <p style={{fontSize:11,color:"#6b7280",marginBottom:6,fontWeight:600}}>종료일</p>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <button style={{...Sb.smallBtn,padding:"9px 14px",background:"#1e3a5f",border:"1px solid #2563eb55",color:"#60a5fa"}} onClick={()=>setShowEndCal(true)}>📅 선택</button>
            <span style={{fontSize:14,fontWeight:700,color:"#f0f4ff"}}>{endDate?fmtDateFull(endDate):"날짜 선택"}</span>
          </div>
        </div>
        <p style={{fontSize:11,color:"#6b7280",marginBottom:7,fontWeight:600}}>빠른 선택</p>
        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
          <button style={Sb.chip} onClick={()=>quickSet(todayKST(),todayKST())}>오늘</button>
          <button style={Sb.chip} onClick={()=>{
            const k=kstNow(),day=k.getUTCDay();
            const mon=new Date(k.getTime()-(day===0?6:day-1)*86400000);
            quickSet(mon.toISOString().slice(0,10),todayKST());
          }}>이번 주</button>
          <button style={Sb.chip} onClick={()=>{
            const k=kstNow();
            quickSet(`${k.getUTCFullYear()}-${String(k.getUTCMonth()+1).padStart(2,"0")}-01`,todayKST());
          }}>이번 달</button>
          <button style={Sb.chip} onClick={()=>{
            const k=kstNow(),m=k.getUTCMonth(),y=k.getUTCFullYear();
            const pm=m===0?12:m,py=m===0?y-1:y;
            const last=new Date(y,m,0).getDate();
            quickSet(`${py}-${String(pm).padStart(2,"0")}-01`,`${py}-${String(pm).padStart(2,"0")}-${last}`);
          }}>지난 달</button>
          <button style={Sb.chip} onClick={()=>{
            const k=kstNow();
            quickSet(`${k.getUTCFullYear()}-01-01`,todayKST());
          }}>올해 전체</button>
        </div>
      </div>
      {startDate&&endDate&&startDate<=endDate&&(
        <div style={{...Sb.card,textAlign:"center"}}>
          <p style={{fontSize:12,color:"#9ca3af",marginBottom:4}}>선택 기간 제출 건수</p>
          <p style={{fontSize:36,fontWeight:800,color:"#60a5fa"}}>{countRows()}<span style={{fontSize:14,color:"#6b7280",fontWeight:400}}> 건</span></p>
          <p style={{fontSize:11,color:"#6b7280",marginTop:4}}>{fmtDateFull(startDate)} ~ {fmtDateFull(endDate)}</p>
        </div>
      )}
      <div style={{padding:"14px 14px 0",display:"flex",flexDirection:"column",gap:10}}>
        <button style={{...Sb.btnGreen,opacity:downloading?0.7:1}} onClick={handleDownload} disabled={downloading}>
          {downloading?"⏳ 생성 중...":"⬇️ 엑셀 다운로드 (.xlsx)"}
        </button>
        <button style={Sb.btnSecondary} onClick={onBack}>← 대시보드로 돌아가기</button>
      </div>
    </div>
  );
}

// ── 메인 앱 ──────────────────────────────────────────────────
function App() {
  const [page, setPage] = useState("home");
  const [selTeam, setSelTeam] = useState("");
  const [selGroup, setSelGroup] = useState("");
  const [uName, setUName] = useState("");
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [allSubs, setAllSubs] = useState({});
  const [disabled, setDisabled] = useState({});
  const [notices, setNotices] = useState({});
  const [groupNames, setGroupNames] = useState({}); // 커스텀 조 이름
  const [adminId, setAdminId] = useState("");
  const [adminPw, setAdminPw] = useState("");
  const [adminErr, setAdminErr] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [dashDate, setDashDate] = useState(todayKST());
  const [showCal, setShowCal] = useState(false);
  const [filterTeam, setFilterTeam] = useState("전체");
  const [viewGroup, setViewGroup] = useState(null);
  const [noticeInput, setNoticeInput] = useState("");
  const [noticeEdit, setNoticeEdit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showGroupNames, setShowGroupNames] = useState(false);
  const [showTeamNames, setShowTeamNames] = useState(false);
  const [showExcel, setShowExcel] = useState(false);
  const [teamNames, setTeamNames] = useState({});

  // 조 표시 이름 헬퍼
  const gName = (groupKey) => groupNames[groupKey] || groupKey;

  useEffect(() => {
    const u1 = db.collection("submissions").onSnapshot(snap => {
      const d={};
      snap.forEach(doc=>{d[doc.id]=doc.data();});
      setAllSubs(d); setLoading(false);
    }, ()=>setLoading(false));

    const u2 = db.collection("settings").doc("config").onSnapshot(snap => {
      if(snap.exists) {
        const d=snap.data();
        setDisabled(d.disabledGroups||{});
        setNotices(d.customNotices||{});
        setGroupNames(d.groupNames||{});
        setTeamNames(d.teamNames||{});
      }
    });
    return ()=>{u1();u2();};
  }, []);

  const saveSub = async (dateKey, groupName, data) => {
    await db.collection("submissions").doc(dateKey).set({[groupName]:data},{merge:true});
  };

  const saveSettings = async (patch) => {
    // merge:true를 사용하지 않아야 키 삭제가 Firestore에 정상 반영됨
    const fullDoc = {
      disabledGroups: patch.disabledGroups !== undefined ? patch.disabledGroups : disabled,
      customNotices:  patch.customNotices  !== undefined ? patch.customNotices  : notices,
      groupNames:     patch.groupNames     !== undefined ? patch.groupNames     : groupNames,
    };
    await db.collection("settings").doc("config").set(fullDoc);
  };

  const saveGroupNames = async (newNames) => {
    setGroupNames(newNames);
    await db.collection("settings").doc("config").set({
      disabledGroups: disabled,
      customNotices: notices,
      groupNames: newNames,
      teamNames: teamNames,
    });
  };

  const saveTeamNames = async (newNames) => {
    setTeamNames(newNames);
    await db.collection("settings").doc("config").set({
      disabledGroups: disabled,
      customNotices: notices,
      groupNames: groupNames,
      teamNames: newNames,
    });
  };

  // 팀 표시 이름 헬퍼
  const tName = (teamKey) => teamNames[teamKey] || teamKey;

  const todayNotice = notices[todayKST()] || DEFAULT_NOTICES[getDayOfYear()%DEFAULT_NOTICES.length];
  const todaySubs = allSubs[todayKST()]||{};
  const dashSubs = allSubs[dashDate]||{};
  const activeGroups = ALL_GROUPS.filter(g=>!disabled[g]);
  const todayDone = activeGroups.filter(g=>todaySubs[g]).length;
  const totalActive = activeGroups.length;

  const handleSubmit = async () => {
    for(const q of QUESTIONS) {
      if(q.type==="yesno"&&!answers[q.id]) return alert("모든 항목을 선택해주세요.");
      if(q.type==="text"&&q.condition&&answers[q.condition.q]===q.condition.val&&!answers[q.id]?.trim())
        return alert("내용을 입력해주세요.");
    }
    setSubmitting(true);
    try {
      await saveSub(todayKST(), selGroup, {team:selTeam,group:selGroup,answers,time:kstTimeStr()});
      setPage("submitted");
    } catch(e) { alert("저장 실패: "+e.message); }
    finally { setSubmitting(false); }
  };

  const loginAdmin = () => {
    const acc=ADMIN_ACCOUNTS.find(a=>a.id===adminId&&a.password===adminPw);
    if(acc){setAdmin(acc);setAdminErr(false);setFilterTeam(acc.role==="team"?acc.team:"전체");setDashDate(todayKST());}
    else setAdminErr(true);
  };

  const toggleGroup = async g => {
    const u={...disabled,[g]:!disabled[g]};
    if(!u[g]) delete u[g];
    setDisabled(u);
    await db.collection("settings").doc("config").set({
      disabledGroups: u,
      customNotices: notices,
      groupNames: groupNames,
      teamNames: teamNames,
    });
  };

  const qSummary = subs => {
    const r={};
    QUESTIONS.filter(q=>q.type==="yesno").forEach(q=>{r[q.id]={yes:0,no:0};});
    Object.values(subs).forEach(sub=>{
      QUESTIONS.filter(q=>q.type==="yesno").forEach(q=>{
        if(sub.answers?.[q.id]==="네") r[q.id].yes++;
        else if(sub.answers?.[q.id]==="아니요") r[q.id].no++;
      });
    });
    return r;
  };

  // ── 로딩 ────────────────────────────────────────────────────
  if(loading) return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100vh"}}>
      <div style={{fontSize:44,marginBottom:14}}>🔄</div>
      <p style={{color:"#60a5fa",fontSize:14,fontWeight:600}}>데이터 불러오는 중...</p>
    </div>
  );

  
// ── 팀 이름 관리 페이지 ─────────────────────────────────────
function TeamNamesPage({teamNames, onSave, onBack}) {
  const [editNames, setEditNames] = useState({...teamNames});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(editNames);
    setSaving(false);
    setSaved(true);
    setTimeout(()=>setSaved(false), 2000);
  };

  return (
    <div style={{paddingBottom:40}}>
      <div style={Sb.topBar}>
        <button style={Sb.backBtn} onClick={onBack}>← 뒤로</button>
        <span style={Sb.topTitle}>팀 이름 관리</span>
      </div>
      <div style={{...Sb.card,background:"#1a1f2e",border:"1px solid #2563eb44"}}>
        <p style={{fontSize:12,color:"#60a5fa",fontWeight:700,marginBottom:4}}>✏️ 최종 관리자 전용</p>
        <p style={{fontSize:12,color:"#9ca3af",lineHeight:1.6}}>
          팀 이름을 자유롭게 바꿀 수 있어요.<br/>
          비우면 기본 이름으로 표시돼요.
        </p>
      </div>
      <div style={Sb.card}>
        <p style={{fontSize:13,fontWeight:700,color:"#f0f4ff",marginBottom:12}}>팀 이름 편집</p>
        {TEAMS.map((teamKey, idx) => (
          <div key={teamKey} style={{marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}>
              <span style={{fontSize:11,color:"#6b7280",fontWeight:700,minWidth:36}}>팀 {idx+1}</span>
              <span style={{fontSize:10,color:"#374151"}}>기본: {teamKey}</span>
            </div>
            <div style={{display:"flex",gap:6}}>
              <input
                style={{...Sb.nameInput,flex:1}}
                type="text"
                placeholder={teamKey}
                value={editNames[teamKey]||""}
                onChange={e=>setEditNames(p=>({...p,[teamKey]:e.target.value}))}
              />
              {editNames[teamKey] && (
                <button style={{...Sb.smallBtn,padding:"6px 8px",color:"#f87171"}}
                  onClick={()=>setEditNames(p=>{const u={...p};delete u[teamKey];return u;})}>✕</button>
              )}
            </div>
          </div>
        ))}
      </div>
      <div style={{padding:"14px 14px 0",display:"flex",flexDirection:"column",gap:10}}>
        <button style={{...Sb.btnPrimary,background:saved?"linear-gradient(135deg,#059669,#047857)":undefined}}
          onClick={handleSave} disabled={saving}>
          {saving?"저장 중...":saved?"✅ 저장 완료!":"💾 저장"}
        </button>
        <button style={Sb.btnSecondary} onClick={onBack}>← 대시보드로 돌아가기</button>
      </div>
    </div>
  );
}

// ── 조 이름 관리 페이지 ──────────────────────────────────────
  if(showGroupNames && admin?.role==="super") return (
    <GroupNamesPage
      groupNames={groupNames}
      onSave={saveGroupNames}
      onBack={()=>setShowGroupNames(false)}
    />
  );

  if(showTeamNames && admin?.role==="super") return (
    <TeamNamesPage
      teamNames={teamNames}
      onSave={saveTeamNames}
      onBack={()=>setShowTeamNames(false)}
    />
  );

  if(showExcel && admin) return (
    <ExcelPage
      allSubs={allSubs}
      groupNames={groupNames}
      adminTeam={admin.team}
      isSuper={admin.role==="super"}
      onBack={()=>setShowExcel(false)}
    />
  );


  // ── HOME ────────────────────────────────────────────────────
  if(page==="home") return (
    <div style={{paddingBottom:24}}>
      <div style={{background:"linear-gradient(135deg,#1a1f2e,#0d1219)",padding:"36px 24px 28px",borderBottom:"1px solid #1e2535",textAlign:"center"}}>
        <div style={{display:"inline-block",background:"#2563eb",color:"#fff",fontSize:10,fontWeight:700,letterSpacing:3,padding:"3px 10px",borderRadius:4,marginBottom:10}}>TBM</div>
        <h1 style={{fontSize:20,fontWeight:700,color:"#f0f4ff",marginBottom:4}}>오후 작업전 안전회의</h1>
        <p style={{fontSize:12,color:"#6b7280",letterSpacing:1}}>Tool Box Meeting</p>
      </div>
      <div style={{margin:"14px 14px 0",background:"linear-gradient(135deg,#1e3a5f,#162d4a)",border:"1px solid #2563eb44",borderRadius:12,padding:"12px 14px"}}>
        <div style={{fontSize:10,fontWeight:700,color:"#60a5fa",marginBottom:5}}>📢 오늘의 준수사항</div>
        <p style={{fontSize:13,color:"#bfdbfe",lineHeight:1.6}}>{todayNotice}</p>
      </div>
      <div style={Sb.card}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
          <span style={{fontSize:12,color:"#9ca3af"}}>오늘 제출 현황</span>
          <span style={{fontSize:12,fontWeight:700,color:"#60a5fa"}}>{todayDone} / {totalActive}</span>
        </div>
        <div style={{height:8,background:"#1e2535",borderRadius:4,overflow:"hidden"}}>
          <div style={{height:"100%",width:totalActive?`${(todayDone/totalActive)*100}%`:"0%",background:"linear-gradient(90deg,#2563eb,#3b82f6)",borderRadius:4,transition:"width 0.6s"}}/>
        </div>
      </div>
      <div style={{padding:"16px 14px 0",display:"flex",flexDirection:"column",gap:10}}>
        <button style={Sb.btnPrimary} onClick={()=>setPage("select")}>✅ 체크리스트 제출</button>
        <button style={Sb.btnSecondary} onClick={()=>setPage("admin")}>🔐 관리자 대시보드</button>
      </div>
      <p style={{textAlign:"center",fontSize:11,color:"#4b5563",marginTop:16}}>
        {kstNow().toLocaleDateString("ko-KR",{year:"numeric",month:"long",day:"numeric",weekday:"long"})}
      </p>
    </div>
  );

  // ── SELECT ──────────────────────────────────────────────────
  if(page==="select") return (
    <div style={{paddingBottom:24}}>
      <div style={Sb.topBar}>
        <button style={Sb.backBtn} onClick={()=>setPage("home")}>← 뒤로</button>
        <span style={Sb.topTitle}>조 선택</span>
      </div>
      <div style={{padding:"16px 14px 0"}}>
        <div style={{fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:8,letterSpacing:1}}>팀 선택</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
          {TEAMS.map(t=><button key={t} style={selTeam===t?Sb.chipActive:Sb.chip} onClick={()=>{setSelTeam(t);setSelGroup("");}}>{tName(t)}</button>)}
        </div>
      </div>
      {selTeam&&(
        <div style={{padding:"14px 14px 0"}}>
          <div style={{fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:8,letterSpacing:1}}>조 선택</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
            {GROUPS[selTeam].filter(g=>!disabled[g]).map(g=>{
              const done=!!todaySubs[g];
              return <button key={g} style={done?Sb.chipDone:selGroup===g?Sb.chipActive:Sb.chip} onClick={()=>!done&&setSelGroup(g)} disabled={done}>
                {gName(g)} {done?"✓":""}
              </button>;
            })}
          </div>
        </div>
      )}
      {selGroup&&(
        <div style={{padding:"16px 14px 0"}}>
          <button style={Sb.btnPrimary} onClick={()=>{setAnswers({});setUName("");setPage("form");}}>
            {gName(selGroup)} 체크리스트 시작 →
          </button>
        </div>
      )}
    </div>
  );

  // ── FORM ────────────────────────────────────────────────────
  if(page==="form") return (
    <div style={{paddingBottom:40}}>
      <div style={Sb.topBar}>
        <button style={Sb.backBtn} onClick={()=>setPage("select")}>← 뒤로</button>
        <span style={Sb.topTitle}>{gName(selGroup)}</span>
      </div>
      <div style={{margin:"12px 14px 0",background:"linear-gradient(135deg,#1e3a5f,#162d4a)",border:"1px solid #2563eb44",borderRadius:12,padding:"12px 14px"}}>
        <div style={{fontSize:10,fontWeight:700,color:"#60a5fa",marginBottom:5}}>📢 오늘의 준수사항</div>
        <p style={{fontSize:13,color:"#bfdbfe",lineHeight:1.6}}>{todayNotice}</p>
      </div>

      {QUESTIONS.map(q=>{
        if(q.condition&&answers[q.condition.q]!==q.condition.val) return null;
        return (
          <div key={q.id} style={Sb.card}>
            <p style={{fontSize:13,fontWeight:600,color:"#e8eaf0",lineHeight:1.6,marginBottom:q.note?4:0}}>Q{q.id}. {q.text}</p>
            {q.note&&<p style={{fontSize:11,color:"#6b7280",marginBottom:8}}>※ {q.note}</p>}
            {q.type==="yesno"&&(
              <div style={{display:"flex",gap:8,marginTop:10}}>
                {["네","아니요"].map(opt=><button key={opt} style={answers[q.id]===opt?Sb.radioActive:Sb.radio} onClick={()=>setAnswers(p=>({...p,[q.id]:opt}))}>{opt}</button>)}
              </div>
            )}
            {q.type==="text"&&(
              <textarea style={{...Sb.textarea,marginTop:8}} placeholder="내용을 입력하세요" value={answers[q.id]||""} onChange={e=>setAnswers(p=>({...p,[q.id]:e.target.value}))}/>
            )}
          </div>
        );
      })}
      <div style={{padding:"16px 14px 0"}}>
        <button style={{...Sb.btnPrimary,opacity:submitting?0.7:1}} onClick={handleSubmit} disabled={submitting}>
          {submitting?"저장 중...":"제출하기"}
        </button>
      </div>
    </div>
  );

  // ── SUBMITTED ────────────────────────────────────────────────
  if(page==="submitted") return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100vh",textAlign:"center",padding:"0 20px"}}>
      <div style={{fontSize:68,marginBottom:14}}>✅</div>
      <h2 style={{fontSize:22,fontWeight:700,color:"#f0f4ff",marginBottom:8}}>제출 완료!</h2>
      <p style={{fontSize:15,color:"#60a5fa",marginBottom:4}}>{gName(selGroup)}</p>
      <p style={{fontSize:12,color:"#6b7280"}}>{kstTimeStr()} 제출</p>
      <button style={{...Sb.btnPrimary,marginTop:28}} onClick={()=>{setSelTeam("");setSelGroup("");setPage("home");}}>홈으로 돌아가기</button>
    </div>
  );

  // ── ADMIN LOGIN ──────────────────────────────────────────────
  if(page==="admin"&&!admin) return (
    <div style={{paddingBottom:24}}>
      <div style={Sb.topBar}>
        <button style={Sb.backBtn} onClick={()=>setPage("home")}>← 뒤로</button>
        <span style={Sb.topTitle}>관리자 로그인</span>
      </div>
      <div style={{...Sb.card,display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center"}}>
        <div style={{fontSize:44,marginBottom:8}}>🔐</div>
        <p style={{fontSize:12,color:"#6b7280",marginBottom:16}}>관리자 ID와 비밀번호를 입력하세요</p>
        <input style={Sb.input} type="text" placeholder="관리자 ID" value={adminId} onChange={e=>setAdminId(e.target.value)}/>
        <input style={Sb.input} type="password" placeholder="비밀번호" value={adminPw} onChange={e=>setAdminPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&loginAdmin()}/>
        {adminErr&&<p style={{color:"#ff4d4d",fontSize:12,marginBottom:8}}>ID 또는 비밀번호가 올바르지 않습니다.</p>}
        <button style={Sb.btnPrimary} onClick={loginAdmin}>로그인</button>
        <div style={{width:"100%",marginTop:20,background:"#0f1117",border:"1px solid #1e2535",borderRadius:10,padding:10}}>
          <p style={{fontSize:11,color:"#6b7280",fontWeight:700,marginBottom:8}}>📋 관리자 계정 안내</p>
          {ADMIN_ACCOUNTS.map(a=>(
            <div key={a.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderBottom:"1px solid #1e2535"}}>
              <span style={a.role==="super"?Sb.badgeSuper:Sb.badgeTeam}>{a.role==="super"?"최종":"팀"}</span>
              <span style={{fontSize:12,color:"#e8eaf0"}}>{a.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── GROUP DETAIL ─────────────────────────────────────────────
  if(viewGroup&&admin) {
    const sub=dashSubs[viewGroup];
    return (
      <div style={{paddingBottom:40}}>
        <div style={Sb.topBar}>
          <button style={Sb.backBtn} onClick={()=>setViewGroup(null)}>← 뒤로</button>
          <span style={Sb.topTitle}>{gName(viewGroup)} 상세</span>
        </div>
        {sub?<>
          <div style={Sb.card}>
            <p style={{fontSize:11,color:"#6b7280",marginBottom:4}}>제출일시</p>
            <p style={{fontSize:13,fontWeight:700,color:"#60a5fa"}}>{fmtDateFull(dashDate)} {sub.time}</p>
          </div>
          <div style={Sb.card}>
            <p style={{fontSize:11,color:"#6b7280",marginBottom:4}}>진행자</p>
            <p style={{fontSize:15,fontWeight:700,color:"#f0f4ff"}}>{sub.name||"—"}</p>
          </div>
          {QUESTIONS.map(q=>{
            const val=sub.answers?.[q.id];
            if(q.condition&&sub.answers?.[q.condition.q]!==q.condition.val&&!val) return null;
            return (
              <div key={q.id} style={Sb.card}>
                <p style={{fontSize:12,fontWeight:600,color:"#e8eaf0",lineHeight:1.5,marginBottom:8}}>Q{q.id}. {q.text}</p>
                <div style={{padding:"9px 12px",borderRadius:8,fontSize:13,fontWeight:600,background:val==="네"?"#0d2b1a":val==="아니요"?"#1a1520":"#0f1117",border:`1px solid ${val==="네"?"#166534":val==="아니요"?"#6b21a8":"#1e2535"}`,color:val==="네"?"#4ade80":val==="아니요"?"#c084fc":"#9ca3af"}}>{val||"—"}</div>
              </div>
            );
          })}
        </>:(
          <div style={{textAlign:"center",padding:"50px 20px",color:"#6b7280"}}>
            <div style={{fontSize:44}}>📭</div>
            <p style={{marginTop:10}}>제출 내역이 없습니다.</p>
          </div>
        )}
      </div>
    );
  }

  // ── ADMIN DASHBOARD ──────────────────────────────────────────
  if(page==="admin"&&admin) {
    const isSuper=admin.role==="super";
    const dispTeams=isSuper?(filterTeam==="전체"?TEAMS:[filterTeam]):[admin.team];
    const scopeGroups=dispTeams.flatMap(t=>GROUPS[t]).filter(g=>!disabled[g]);
    const scopeDone=scopeGroups.filter(g=>dashSubs[g]).length;
    const scopeTotal=scopeGroups.length;
    const qs=qSummary(dashSubs);
    const teamCounts=TEAMS.map((t,i)=>({label:tName(t),val:GROUPS[t].filter(g=>!disabled[g]&&dashSubs[g]).length,color:TEAM_COLORS[i]}));

    return (
      <div style={{paddingBottom:40}}>
        {showCal&&<CalendarPicker value={dashDate} onChange={setDashDate} onClose={()=>setShowCal(false)}/>}
        <div style={Sb.topBar}>
          <button style={Sb.backBtn} onClick={()=>{setAdmin(null);setAdminId("");setAdminPw("");setPage("home");setViewGroup(null);}}>← 로그아웃</button>
          <span style={Sb.topTitle}>대시보드</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8,padding:"9px 14px",background:"#1a1f2e",borderBottom:"1px solid #1e2535"}}>
          <span style={isSuper?Sb.badgeSuper:Sb.badgeTeam}>{isSuper?"👑 최종":"🏷 팀"}</span>
          <span style={{fontSize:12,color:"#9ca3af"}}>{admin.label}</span>
          <span style={{marginLeft:"auto",fontSize:10,color:"#4ade80",background:"#0d2b1a",padding:"2px 7px",borderRadius:4}}>🔴 실시간</span>
        </div>

        {/* ── 관리자 버튼 영역 ── */}
        <div style={{padding:"12px 14px 0",display:"flex",flexDirection:"column",gap:8}}>
          {isSuper&&(
            <button style={{...Sb.btnGreen}} onClick={()=>setShowTeamNames(true)}>
              ✏️ 팀 이름 관리
            </button>
          )}
          {isSuper&&(
            <button style={{...Sb.btnGreen,background:"linear-gradient(135deg,#0e7490,#0891b2)"}} onClick={()=>setShowGroupNames(true)}>
              ✏️ 조 이름 관리 (1~15조 이름 변경)
            </button>
          )}
          <button style={{...Sb.btnGreen,background:"linear-gradient(135deg,#1d4ed8,#1e40af)"}} onClick={()=>setShowExcel(true)}>
            📊 엑셀 다운로드 (기간별 제출 기록)
          </button>
        </div>

        {/* 날짜 */}
        <div style={{padding:"12px 14px 0"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <button style={{padding:"8px 14px",background:"#1e3a5f",border:"1px solid #2563eb55",borderRadius:8,color:"#60a5fa",fontSize:12,fontWeight:700,cursor:"pointer"}} onClick={()=>setShowCal(true)}>📅 날짜 선택</button>
            <span style={{fontSize:14,fontWeight:700,color:"#f0f4ff"}}>{fmtDateFull(dashDate)}</span>
          </div>
          {dashDate!==todayKST()&&<button style={{...Sb.smallBtn,marginTop:7}} onClick={()=>setDashDate(todayKST())}>오늘로 돌아가기</button>}
        </div>

        {/* 준수사항 */}
        {isSuper&&(
          <div style={Sb.card}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
              <span style={{fontSize:11,fontWeight:700,color:"#60a5fa"}}>📢 오늘의 준수사항 관리</span>
              <button style={Sb.smallBtn} onClick={()=>{setNoticeInput(notices[todayKST()]||"");setNoticeEdit(!noticeEdit);}}>{noticeEdit?"닫기":"✏️ 편집"}</button>
            </div>
            <p style={{fontSize:12,color:"#bfdbfe"}}>{todayNotice}</p>
            {noticeEdit&&(
              <div style={{marginTop:10}}>
                <textarea style={{...Sb.textarea,minHeight:55}} placeholder="준수사항 입력" value={noticeInput} onChange={e=>setNoticeInput(e.target.value)}/>
                <div style={{display:"flex",gap:8,marginTop:7}}>
                  <button style={{...Sb.smallBtn,flex:1,background:"#2563eb",color:"#fff"}} onClick={async()=>{
                    const u={...notices,[todayKST()]:noticeInput.trim()};
                    if(!noticeInput.trim()) delete u[todayKST()];
                    setNotices(u);
                    await db.collection("settings").doc("config").set({disabledGroups:disabled,customNotices:u,groupNames:groupNames,teamNames:teamNames});
                    setNoticeEdit(false);
                  }}>저장</button>
                  <button style={{...Sb.smallBtn,flex:1}} onClick={async()=>{
                    const u={...notices}; delete u[todayKST()];
                    setNotices(u);
                    await db.collection("settings").doc("config").set({disabledGroups:disabled,customNotices:u,groupNames:groupNames,teamNames:teamNames});
                    setNoticeEdit(false);
                  }}>기본값으로</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 통계 */}
        <div style={{display:"flex",gap:8,padding:"12px 14px 0"}}>
          {[{val:scopeDone,label:"제출 완료",color:"#60a5fa"},{val:scopeTotal-scopeDone,label:"미제출",color:"#ff6b6b"},{val:scopeTotal?Math.round((scopeDone/scopeTotal)*100):0,label:"완료율",color:"#51cf66",sfx:"%"}].map(({val,label,color,sfx})=>(
            <div key={label} style={{flex:1,background:"#161b27",border:"1px solid #1e2535",borderRadius:10,padding:"12px 6px",textAlign:"center"}}>
              <div style={{fontSize:24,fontWeight:800,color,lineHeight:1}}>{val}{sfx||""}</div>
              <div style={{fontSize:10,color:"#6b7280",marginTop:3}}>{label}</div>
            </div>
          ))}
        </div>
        <div style={Sb.card}>
          <div style={{height:8,background:"#1e2535",borderRadius:4,overflow:"hidden"}}>
            <div style={{height:"100%",width:scopeTotal?`${(scopeDone/scopeTotal)*100}%`:"0%",background:"linear-gradient(90deg,#2563eb,#3b82f6)",borderRadius:4,transition:"width 0.6s"}}/>
          </div>
        </div>

        {/* 팀 필터 */}
        {isSuper&&(
          <div style={{display:"flex",flexWrap:"wrap",gap:6,padding:"10px 14px 0"}}>
            {["전체",...TEAMS].map(t=><button key={t} style={filterTeam===t?Sb.chipActive:Sb.chip} onClick={()=>setFilterTeam(t)}>{t==="전체"?"전체":tName(t)}</button>)}
          </div>
        )}

        {/* 막대그래프 */}
        <div style={{margin:"12px 14px 0",background:"#161b27",border:"1px solid #1e2535",borderRadius:12,overflow:"hidden"}}>
          <div style={Sb.sectionHdr}>📊 팀별 실시 현황</div>
          <BarChart data={teamCounts} maxVal={15}/>
        </div>

        {/* 질문별 취합 */}
        {scopeDone>0&&(
          <div style={{margin:"12px 14px 0",background:"#161b27",border:"1px solid #1e2535",borderRadius:12,overflow:"hidden"}}>
            <div style={Sb.sectionHdr}>📋 질문별 답변 취합 ({fmtDateFull(dashDate)})</div>
            {QUESTIONS.filter(q=>q.type==="yesno").map(q=>{
              const st=qs[q.id]||{yes:0,no:0}; const tot=st.yes+st.no; const pct=tot?Math.round((st.yes/tot)*100):0;
              return (
                <div key={q.id} style={{padding:"10px 14px",borderBottom:"1px solid #1e2535"}}>
                  <p style={{fontSize:11,color:"#9ca3af",lineHeight:1.5,marginBottom:7}}>Q{q.id}. {q.text}</p>
                  <div style={{display:"flex",gap:7,alignItems:"center"}}>
                    <div style={{flex:1,height:14,background:"#1e2535",borderRadius:3,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${pct}%`,background:"linear-gradient(90deg,#059669,#10b981)",borderRadius:3}}/>
                    </div>
                    <span style={{fontSize:11,color:"#4ade80",fontWeight:700,minWidth:26}}>✓{st.yes}</span>
                    <span style={{fontSize:11,color:"#f87171",fontWeight:700,minWidth:26}}>✗{st.no}</span>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",marginTop:3}}>
                    <span style={{fontSize:10,color:"#4ade80"}}>네 {pct}%</span>
                    <span style={{fontSize:10,color:"#6b7280"}}>총 {tot}건</span>
                    <span style={{fontSize:10,color:"#f87171"}}>아니요 {100-pct}%</span>
                  </div>
                </div>
              );
            })}
            {Object.values(dashSubs).filter(s=>s.answers?.["5-1"]).length>0&&(
              <div style={{padding:"10px 14px"}}>
                <p style={{fontSize:11,color:"#f59e0b",fontWeight:700,marginBottom:7}}>⚠️ Q5 위험사항 입력 내용</p>
                {Object.values(dashSubs).filter(s=>s.answers?.["5-1"]).map((sub,i)=>(
                  <div key={i} style={{background:"#1a1310",border:"1px solid #92400e44",borderRadius:8,padding:"7px 10px",marginBottom:5}}>
                    <span style={{fontSize:10,color:"#f59e0b",fontWeight:700}}>{gName(sub.group)} · {sub.name}</span>
                    <p style={{fontSize:12,color:"#fcd34d",marginTop:3}}>{sub.answers["5-1"]}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 팀별 조 현황 */}
        {dispTeams.map(team=>{
          const groups=GROUPS[team];
          const vis=isSuper?groups:groups.filter(g=>!disabled[g]);
          const done=vis.filter(g=>!disabled[g]&&dashSubs[g]).length;
          const tot=vis.filter(g=>!disabled[g]).length;
          return (
            <div key={team} style={{margin:"12px 14px 0",background:"#161b27",border:"1px solid #1e2535",borderRadius:12,overflow:"hidden"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",borderBottom:"1px solid #1e2535",background:"#1a1f2e"}}>
                <span style={{fontSize:13,fontWeight:700,color:"#f0f4ff"}}>{tName(team)}</span>
                <span style={{fontSize:12,fontWeight:700,color:"#60a5fa"}}>{done}/{tot}</span>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:1,background:"#1e2535"}}>
                {groups.map(g=>{
                  const sub=dashSubs[g], isOff=!!disabled[g];
                  if(!isSuper&&isOff) return null;
                  return (
                    <div key={g} style={isOff?{background:"#0a0c10",padding:"8px 3px",textAlign:"center"}:sub?{background:"#0d2b1a",padding:"8px 3px",textAlign:"center",cursor:"pointer"}:{background:"#0f1117",padding:"8px 3px",textAlign:"center",cursor:"pointer"}} onClick={()=>!isOff&&setViewGroup(g)}>
                      <div style={{fontSize:9,fontWeight:700,color:isOff?"#374151":sub?"#4ade80":"#6b7280",lineHeight:1.3}}>
                        {gName(g).replace(team+" ","")}
                      </div>
                      {sub&&!isOff&&<div style={{fontSize:8,color:"#4ade80",marginTop:1}}>{sub.time}</div>}
                      {isOff&&<div style={{fontSize:8,color:"#374151"}}>OFF</div>}
                      {isSuper&&<button style={{fontSize:8,marginTop:2,padding:"1px 4px",borderRadius:3,border:"none",cursor:"pointer",background:isOff?"#374151":"#1e3a5f",color:isOff?"#6b7280":"#60a5fa"}} onClick={ev=>{ev.stopPropagation();toggleGroup(g);}}>{isOff?"ON":"OFF"}</button>}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
</script>
<script>
if("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js");
  });
}
</script>
</body>
</html>
