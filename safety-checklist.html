import { useState, useEffect } from "react";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore, doc, getDoc, setDoc, onSnapshot, collection
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ── Firebase 초기화 ───────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyAeGVDpWv7fx402-6aikCxevTjbvmY7He4",
  authDomain: "safety-119.firebaseapp.com",
  projectId: "safety-119",
  storageBucket: "safety-119.firebasestorage.app",
  messagingSenderId: "439537536567",
  appId: "1:439537536567:web:fb93d56c1beb11f01a39b2"
};
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// ── 상수 ─────────────────────────────────────────────────────
const TEAMS = ["라인상부", "라인하부", "V2", "EDS", "스막", "스막교대"];
const GROUPS = {};
TEAMS.forEach(team => {
  GROUPS[team] = Array.from({ length: 15 }, (_, i) => `${team} ${i + 1}조`);
});
const ALL_GROUPS = TEAMS.flatMap(t => GROUPS[t]);

const QUESTIONS = [
  { id: 1, text: "스트레칭을 실시하였습니까?", type: "yesno" },
  { id: 2, text: "작업자의 건강상태가 작업에 적합한지 여부를 확인하였습니까?", type: "yesno" },
  { id: 3, text: "비상 대응 절차 및 피난로와 비상물품보관함, 아이/바다샤워 위치를 동료(작업자)에게 안내하였습니까?", type: "yesno" },
  { id: 4, text: "금일 작업에 사용하는 보호구 및 작업도구를 잘 확인하였습니까?", type: "yesno", note: "보호구 및 작업도구 제품 상태, 착용 상태 양호" },
  { id: 5, text: "작업 중 사고 위험(작업 중지권)이 있거나, 상호개입, 개선 제한 사항이 있습니까?", type: "yesno" },
  { id: "5-1", text: "사고 위험(작업 중지권), 상호개입, 개선 제한 사항이 있을 시 내용 입력", type: "text", condition: { q: 5, val: "네" }, note: '"네" 작성 / "아니요" 공란' },
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
  { id: "admin", password: "260701", role: "super", label: "최종 관리자",      team: null },
  { id: "team1", password: "1111",   role: "team",  label: "라인상부 관리자",  team: "라인상부" },
  { id: "team2", password: "2222",   role: "team",  label: "라인하부 관리자",  team: "라인하부" },
  { id: "team3", password: "3333",   role: "team",  label: "V2 관리자",       team: "V2" },
  { id: "team4", password: "4444",   role: "team",  label: "EDS 관리자",      team: "EDS" },
  { id: "team5", password: "5555",   role: "team",  label: "스막 관리자",     team: "스막" },
  { id: "team6", password: "6666",   role: "team",  label: "스막교대 관리자", team: "스막교대" },
];

// ── 한국 시간 헬퍼 ────────────────────────────────────────────
const kstNow = () => new Date(new Date().getTime() + 9 * 60 * 60 * 1000);
const todayKST = () => kstNow().toISOString().slice(0, 10);
const kstTimeStr = () => {
  const k = kstNow();
  const h = k.getUTCHours();
  const m = String(k.getUTCMinutes()).padStart(2, "0");
  const ampm = h < 12 ? "오전" : "오후";
  return `${ampm} ${h % 12 || 12}:${m}`;
};
const getDayOfYear = () => {
  const k = kstNow();
  return Math.floor((k - new Date(Date.UTC(k.getUTCFullYear(), 0, 1))) / 86400000);
};
const fmtDateFull = (key) => {
  const [y, m, d] = key.split("-");
  return `${y}년 ${Number(m)}월 ${Number(d)}일`;
};

// ── 달력 컴포넌트 ─────────────────────────────────────────────
function CalendarPicker({ value, onChange, onClose }) {
  const init = value ? new Date(value + "T00:00:00") : new Date();
  const [viewYear, setViewYear] = useState(init.getFullYear());
  const [viewMonth, setViewMonth] = useState(init.getMonth());
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  const pickDay = (d) => {
    if (!d) return;
    onChange(`${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
    onClose();
  };
  return (
    <div style={S.calOverlay} onClick={onClose}>
      <div style={S.calBox} onClick={e => e.stopPropagation()}>
        <div style={S.calHeader}>
          <button style={S.calNav} onClick={() => viewMonth === 0 ? (setViewMonth(11), setViewYear(y => y - 1)) : setViewMonth(m => m - 1)}>‹</button>
          <span style={S.calTitle}>{viewYear}년 {viewMonth + 1}월</span>
          <button style={S.calNav} onClick={() => viewMonth === 11 ? (setViewMonth(0), setViewYear(y => y + 1)) : setViewMonth(m => m + 1)}>›</button>
        </div>
        <div style={S.calGrid}>
          {["일","월","화","수","목","금","토"].map(d => <div key={d} style={S.calDow}>{d}</div>)}
          {cells.map((d, i) => {
            const key = d ? `${viewYear}-${String(viewMonth+1).padStart(2,"0")}-${String(d).padStart(2,"0")}` : null;
            return (
              <div key={i} style={{ ...S.calDay, ...(d ? S.calDayActive : {}), ...(key === todayKST() ? S.calDayToday : {}), ...(key === value ? S.calDaySel : {}) }}
                onClick={() => pickDay(d)}>{d || ""}</div>
            );
          })}
        </div>
        <button style={{ ...S.smallBtn, width: "100%", marginTop: 10 }} onClick={onClose}>닫기</button>
      </div>
    </div>
  );
}

// ── 막대그래프 ────────────────────────────────────────────────
function BarChart({ data, maxVal }) {
  const max = maxVal || Math.max(...data.map(d => d.val), 1);
  return (
    <div style={{ padding: "0 16px 16px" }}>
      {data.map(({ label, val, color }) => (
        <div key={label} style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 12, color: "#9ca3af", fontWeight: 600 }}>{label}</span>
            <span style={{ fontSize: 12, color: "#60a5fa", fontWeight: 700 }}>{val}회</span>
          </div>
          <div style={{ height: 20, background: "#1e2535", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(val / max) * 100}%`, background: color, borderRadius: 4, transition: "width 0.6s ease", display: "flex", alignItems: "center", paddingLeft: 6 }}>
              {val > 0 && <span style={{ fontSize: 11, color: "#fff", fontWeight: 700 }}>{val}</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── 메인 앱 ──────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [submitterName, setSubmitterName] = useState("");
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);

  // Firebase 실시간 데이터
  const [allSubmissions, setAllSubmissions] = useState({});
  const [disabledGroups, setDisabledGroups] = useState({});
  const [customNotices, setCustomNotices] = useState({});

  // 관리자
  const [adminId, setAdminId] = useState("");
  const [adminPw, setAdminPw] = useState("");
  const [adminError, setAdminError] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [dashDate, setDashDate] = useState(todayKST());
  const [showCal, setShowCal] = useState(false);
  const [filterTeam, setFilterTeam] = useState("전체");
  const [viewGroup, setViewGroup] = useState(null);
  const [noticeInput, setNoticeInput] = useState("");
  const [noticeEditMode, setNoticeEditMode] = useState(false);

  // ── Firebase 실시간 구독 ──────────────────────────────────
  useEffect(() => {
    // 제출 데이터 실시간 구독
    const unsubSubs = onSnapshot(collection(db, "submissions"), (snapshot) => {
      const data = {};
      snapshot.forEach(doc => { data[doc.id] = doc.data(); });
      setAllSubmissions(data);
      setLoading(false);
    });

    // 설정 데이터 실시간 구독
    const unsubSettings = onSnapshot(doc(db, "settings", "config"), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setDisabledGroups(d.disabledGroups || {});
        setCustomNotices(d.customNotices || {});
      }
    });

    return () => { unsubSubs(); unsubSettings(); };
  }, []);

  // ── Firebase 저장 함수 ────────────────────────────────────
  const saveSubmission = async (dateKey, groupName, data) => {
    const ref = doc(db, "submissions", dateKey);
    const existing = (await getDoc(ref)).data() || {};
    await setDoc(ref, { ...existing, [groupName]: data });
  };

  const saveSettings = async (newDisabled, newNotices) => {
    await setDoc(doc(db, "settings", "config"), {
      disabledGroups: newDisabled ?? disabledGroups,
      customNotices: newNotices ?? customNotices,
    });
  };

  const getTodayNotice = () => customNotices[todayKST()] || DEFAULT_NOTICES[getDayOfYear() % DEFAULT_NOTICES.length];

  const todaySubs = allSubmissions[todayKST()] || {};
  const dashSubs = allSubmissions[dashDate] || {};
  const activeGroups = ALL_GROUPS.filter(g => !disabledGroups[g]);
  const todayDone = activeGroups.filter(g => todaySubs[g]).length;
  const totalActive = activeGroups.length;

  const handleSubmit = async () => {
    if (!submitterName.trim()) return alert("이름을 입력해주세요.");
    for (const q of QUESTIONS) {
      if (q.type === "yesno" && !answers[q.id]) return alert("모든 항목을 선택해주세요.");
      if (q.type === "text" && q.condition && answers[q.condition.q] === q.condition.val && !answers[q.id]?.trim())
        return alert("내용을 입력해주세요.");
    }
    await saveSubmission(todayKST(), selectedGroup, {
      team: selectedTeam, group: selectedGroup, name: submitterName,
      answers, time: kstTimeStr(),
    });
    setPage("submitted");
  };

  const handleAdminLogin = () => {
    const account = ADMIN_ACCOUNTS.find(a => a.id === adminId && a.password === adminPw);
    if (account) {
      setCurrentAdmin(account); setAdminError(false);
      setFilterTeam(account.role === "team" ? account.team : "전체");
      setDashDate(todayKST());
    } else setAdminError(true);
  };

  const handleAdminLogout = () => {
    setCurrentAdmin(null); setAdminId(""); setAdminPw(""); setPage("home"); setViewGroup(null);
  };

  const toggleGroup = async (g) => {
    const updated = { ...disabledGroups, [g]: !disabledGroups[g] };
    if (!updated[g]) delete updated[g];
    setDisabledGroups(updated);
    await saveSettings(updated, null);
  };

  const calcQSummary = (subs) => {
    const result = {};
    QUESTIONS.filter(q => q.type === "yesno").forEach(q => { result[q.id] = { yes: 0, no: 0 }; });
    Object.values(subs).forEach(sub => {
      QUESTIONS.filter(q => q.type === "yesno").forEach(q => {
        if (sub.answers?.[q.id] === "네") result[q.id].yes++;
        else if (sub.answers?.[q.id] === "아니요") result[q.id].no++;
      });
    });
    return result;
  };

  const calcTeamCounts = (subs) =>
    TEAMS.map(team => ({ label: team, val: GROUPS[team].filter(g => !disabledGroups[g] && subs[g]).length }));

  const TEAM_COLORS = ["#2563eb","#0891b2","#059669","#d97706","#7c3aed","#db2777"];

  // 로딩 화면
  if (loading) return (
    <div style={{ ...S.page, justifyContent: "center", alignItems: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🔄</div>
      <p style={{ color: "#60a5fa", fontSize: 15, fontWeight: 600 }}>데이터 불러오는 중...</p>
    </div>
  );

  // ── HOME ─────────────────────────────────────────────────
  if (page === "home") return (
    <div style={S.page}>
      <div style={S.header}>
        <div style={S.headerBadge}>TBM</div>
        <h1 style={S.headerTitle}>오후 작업전 안전회의</h1>
        <p style={S.headerSub}>Tool Box Meeting</p>
      </div>
      <div style={S.noticeBox}>
        <div style={S.noticeLabel}>📢 오늘의 준수사항</div>
        <p style={S.noticeText}>{getTodayNotice()}</p>
      </div>
      <div style={S.progressCard}>
        <div style={S.progressRow}>
          <span style={S.progressLabel}>오늘 제출 현황</span>
          <span style={S.progressCount}>{todayDone} / {totalActive}</span>
        </div>
        <div style={S.progressBar}>
          <div style={{ ...S.progressFill, width: totalActive ? `${(todayDone / totalActive) * 100}%` : "0%" }} />
        </div>
      </div>
      <div style={S.btnGroup}>
        <button style={S.btnPrimary} onClick={() => setPage("select")}>✅ 체크리스트 제출</button>
        <button style={S.btnSecondary} onClick={() => setPage("admin")}>🔐 관리자 대시보드</button>
      </div>
      <p style={S.dateText}>{kstNow().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric", weekday: "long" })}</p>
    </div>
  );

  // ── SELECT ────────────────────────────────────────────────
  if (page === "select") return (
    <div style={S.page}>
      <div style={S.topBar}>
        <button style={S.backBtn} onClick={() => setPage("home")}>← 뒤로</button>
        <span style={S.topTitle}>조 선택</span>
      </div>
      <div style={S.section}>
        <label style={S.label}>팀 선택</label>
        <div style={S.chipGrid}>
          {TEAMS.map(t => (
            <button key={t} style={selectedTeam === t ? S.chipActive : S.chip}
              onClick={() => { setSelectedTeam(t); setSelectedGroup(""); }}>{t}</button>
          ))}
        </div>
      </div>
      {selectedTeam && (
        <div style={S.section}>
          <label style={S.label}>조 선택</label>
          <div style={S.chipGrid}>
            {GROUPS[selectedTeam].filter(g => !disabledGroups[g]).map(g => {
              const done = !!todaySubs[g];
              return (
                <button key={g} style={done ? S.chipDone : selectedGroup === g ? S.chipActive : S.chip}
                  onClick={() => !done && setSelectedGroup(g)} disabled={done}>
                  {g.replace(selectedTeam + " ", "")} {done ? "✓" : ""}
                </button>
              );
            })}
          </div>
        </div>
      )}
      {selectedGroup && (
        <button style={{ ...S.btnPrimary, margin: "24px 16px 0" }}
          onClick={() => { setAnswers({}); setSubmitterName(""); setPage("form"); }}>
          체크리스트 시작 →
        </button>
      )}
    </div>
  );

  // ── FORM ─────────────────────────────────────────────────
  if (page === "form") return (
    <div style={S.page}>
      <div style={S.topBar}>
        <button style={S.backBtn} onClick={() => setPage("select")}>← 뒤로</button>
        <span style={S.topTitle}>{selectedGroup}</span>
      </div>
      <div style={S.noticeBox}>
        <div style={S.noticeLabel}>📢 오늘의 준수사항</div>
        <p style={S.noticeText}>{getTodayNotice()}</p>
      </div>
      <div style={S.questionCard}>
        <p style={S.questionText}>진행자 이름을 입력해주세요</p>
        <input style={S.nameInput} type="text" placeholder="이름 입력"
          value={submitterName} onChange={e => setSubmitterName(e.target.value)} />
      </div>
      {QUESTIONS.map(q => {
        if (q.condition && answers[q.condition.q] !== q.condition.val) return null;
        return (
          <div key={q.id} style={S.questionCard}>
            <p style={S.questionText}>Q{q.id}. {q.text}</p>
            {q.note && <p style={S.questionNote}>※ {q.note}</p>}
            {q.type === "yesno" && (
              <div style={S.radioRow}>
                {["네", "아니요"].map(opt => (
                  <button key={opt} style={answers[q.id] === opt ? S.radioActive : S.radio}
                    onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}>{opt}</button>
                ))}
              </div>
            )}
            {q.type === "text" && (
              <textarea style={S.textarea} placeholder="내용을 입력하세요"
                value={answers[q.id] || ""}
                onChange={e => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))} />
            )}
          </div>
        );
      })}
      <div style={{ padding: "16px 16px 0" }}>
        <button style={S.btnPrimary} onClick={handleSubmit}>제출하기</button>
      </div>
      <div style={{ height: 40 }} />
    </div>
  );

  // ── SUBMITTED ─────────────────────────────────────────────
  if (page === "submitted") return (
    <div style={{ ...S.page, justifyContent: "center", alignItems: "center", textAlign: "center" }}>
      <div style={{ fontSize: 72, marginBottom: 16 }}>✅</div>
      <h2 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 8px", color: "#f0f4ff" }}>제출 완료!</h2>
      <p style={{ fontSize: 16, color: "#60a5fa", margin: "0 0 2px" }}>{selectedGroup}</p>
      <p style={{ fontSize: 14, color: "#9ca3af", margin: "0 0 4px" }}>{submitterName}</p>
      <p style={{ fontSize: 13, color: "#6b7280" }}>{kstTimeStr()} 제출</p>
      <button style={{ ...S.btnPrimary, margin: "32px 16px 0" }}
        onClick={() => { setSelectedTeam(""); setSelectedGroup(""); setPage("home"); }}>
        홈으로 돌아가기
      </button>
    </div>
  );

  // ── ADMIN LOGIN ───────────────────────────────────────────
  if (page === "admin" && !currentAdmin) return (
    <div style={S.page}>
      <div style={S.topBar}>
        <button style={S.backBtn} onClick={() => setPage("home")}>← 뒤로</button>
        <span style={S.topTitle}>관리자 로그인</span>
      </div>
      <div style={S.adminLoginCard}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🔐</div>
        <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 20px" }}>관리자 ID와 비밀번호를 입력하세요</p>
        <input style={S.input} type="text" placeholder="관리자 ID"
          value={adminId} onChange={e => setAdminId(e.target.value)} />
        <input style={S.input} type="password" placeholder="비밀번호"
          value={adminPw} onChange={e => setAdminPw(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleAdminLogin()} />
        {adminError && <p style={{ color: "#ff4d4d", fontSize: 13, margin: "4px 0 8px" }}>ID 또는 비밀번호가 올바르지 않습니다.</p>}
        <button style={{ ...S.btnPrimary, marginTop: 8 }} onClick={handleAdminLogin}>로그인</button>
        <div style={S.accountTable}>
          <p style={S.accountTableTitle}>📋 관리자 계정 안내</p>
          {ADMIN_ACCOUNTS.map(a => (
            <div key={a.id} style={S.accountRow}>
              <span style={a.role === "super" ? S.badgeSuper : S.badgeTeam}>{a.role === "super" ? "최종" : "팀"}</span>
              <span style={{ fontSize: 13, color: "#e8eaf0" }}>{a.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── GROUP DETAIL ──────────────────────────────────────────
  if (viewGroup && currentAdmin) {
    const sub = dashSubs[viewGroup];
    return (
      <div style={S.page}>
        <div style={S.topBar}>
          <button style={S.backBtn} onClick={() => setViewGroup(null)}>← 뒤로</button>
          <span style={S.topTitle}>{viewGroup} 상세</span>
        </div>
        {sub ? (
          <>
            <div style={{ ...S.questionCard, margin: "16px 16px 0" }}>
              <p style={{ fontSize: 12, color: "#6b7280", margin: "0 0 4px" }}>제출일시</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#60a5fa", margin: 0 }}>{fmtDateFull(dashDate)} {sub.time}</p>
            </div>
            <div style={{ ...S.questionCard, margin: "12px 16px 0" }}>
              <p style={{ fontSize: 12, color: "#6b7280", margin: "0 0 4px" }}>진행자</p>
              <p style={{ fontSize: 16, fontWeight: 700, color: "#f0f4ff", margin: 0 }}>{sub.name || "—"}</p>
            </div>
            {QUESTIONS.map(q => {
              const val = sub.answers?.[q.id];
              if (q.condition && sub.answers?.[q.condition.q] !== q.condition.val && !val) return null;
              return (
                <div key={q.id} style={{ ...S.questionCard, margin: "12px 16px 0" }}>
                  <p style={S.questionText}>Q{q.id}. {q.text}</p>
                  <div style={{ marginTop: 8, padding: "10px 14px", borderRadius: 8, background: val === "네" ? "#0d2b1a" : val === "아니요" ? "#1a1520" : "#0f1117", border: `1px solid ${val === "네" ? "#166534" : val === "아니요" ? "#6b21a8" : "#1e2535"}`, color: val === "네" ? "#4ade80" : val === "아니요" ? "#c084fc" : "#9ca3af", fontSize: 14, fontWeight: 600 }}>
                    {val || "—"}
                  </div>
                </div>
              );
            })}
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "60px 24px", color: "#6b7280" }}>
            <div style={{ fontSize: 48 }}>📭</div>
            <p>해당 날짜에 제출 내역이 없습니다.</p>
          </div>
        )}
        <div style={{ height: 40 }} />
      </div>
    );
  }

  // ── ADMIN DASHBOARD ───────────────────────────────────────
  if (page === "admin" && currentAdmin) {
    const isSuper = currentAdmin.role === "super";
    const displayTeams = isSuper ? (filterTeam === "전체" ? TEAMS : [filterTeam]) : [currentAdmin.team];
    const scopeGroups = displayTeams.flatMap(t => GROUPS[t]).filter(g => !disabledGroups[g]);
    const scopeDone = scopeGroups.filter(g => dashSubs[g]).length;
    const scopeTotal = scopeGroups.length;
    const qSummary = calcQSummary(dashSubs);
    const teamCounts = calcTeamCounts(dashSubs);

    return (
      <div style={S.page}>
        {showCal && <CalendarPicker value={dashDate} onChange={setDashDate} onClose={() => setShowCal(false)} />}
        <div style={S.topBar}>
          <button style={S.backBtn} onClick={handleAdminLogout}>← 로그아웃</button>
          <span style={S.topTitle}>대시보드</span>
        </div>
        <div style={S.adminBadgeBar}>
          <span style={isSuper ? S.badgeSuper : S.badgeTeam}>{isSuper ? "👑 최종" : "🏷 팀"}</span>
          <span style={{ fontSize: 13, color: "#9ca3af" }}>{currentAdmin.label}</span>
          <span style={{ marginLeft: "auto", fontSize: 11, color: "#4ade80", background: "#0d2b1a", padding: "2px 8px", borderRadius: 4 }}>🔴 실시간</span>
        </div>

        {/* 날짜 선택 */}
        <div style={{ padding: "14px 16px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button style={S.calBtn} onClick={() => setShowCal(true)}>📅 날짜 선택</button>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#f0f4ff" }}>{fmtDateFull(dashDate)}</span>
          </div>
          {dashDate !== todayKST() && (
            <button style={{ ...S.smallBtn, marginTop: 8 }} onClick={() => setDashDate(todayKST())}>오늘로 돌아가기</button>
          )}
        </div>

        {/* 준수사항 편집 (최종관리자) */}
        {isSuper && (
          <div style={{ margin: "14px 16px 0", background: "#161b27", border: "1px solid #1e2535", borderRadius: 12, padding: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#60a5fa" }}>📢 오늘의 준수사항 관리</span>
              <button style={S.smallBtn} onClick={() => { setNoticeInput(customNotices[todayKST()] || ""); setNoticeEditMode(!noticeEditMode); }}>
                {noticeEditMode ? "닫기" : "✏️ 편집"}
              </button>
            </div>
            <p style={{ fontSize: 13, color: "#bfdbfe", margin: 0 }}>{getTodayNotice()}</p>
            {noticeEditMode && (
              <div style={{ marginTop: 10 }}>
                <textarea style={{ ...S.textarea, minHeight: 60 }} placeholder="오늘의 준수사항 입력"
                  value={noticeInput} onChange={e => setNoticeInput(e.target.value)} />
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button style={{ ...S.smallBtn, flex: 1, background: "#2563eb", color: "#fff" }}
                    onClick={async () => {
                      const u = { ...customNotices, [todayKST()]: noticeInput.trim() };
                      if (!noticeInput.trim()) delete u[todayKST()];
                      setCustomNotices(u);
                      await saveSettings(null, u);
                      setNoticeEditMode(false);
                    }}>저장</button>
                  <button style={{ ...S.smallBtn, flex: 1 }}
                    onClick={async () => {
                      const u = { ...customNotices }; delete u[todayKST()];
                      setCustomNotices(u);
                      await saveSettings(null, u);
                      setNoticeEditMode(false);
                    }}>기본값으로</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 통계 */}
        <div style={S.dashHeader}>
          <div style={S.statCard}><div style={S.statNum}>{scopeDone}</div><div style={S.statLabel}>제출 완료</div></div>
          <div style={S.statCard}><div style={{ ...S.statNum, color: "#ff6b6b" }}>{scopeTotal - scopeDone}</div><div style={S.statLabel}>미제출</div></div>
          <div style={S.statCard}><div style={{ ...S.statNum, color: "#51cf66" }}>{scopeTotal ? Math.round((scopeDone / scopeTotal) * 100) : 0}%</div><div style={S.statLabel}>완료율</div></div>
        </div>
        <div style={S.progressCard}>
          <div style={S.progressBar}>
            <div style={{ ...S.progressFill, width: scopeTotal ? `${(scopeDone / scopeTotal) * 100}%` : "0%" }} />
          </div>
        </div>

        {/* 팀 필터 */}
        {isSuper && (
          <div style={S.filterRow}>
            {["전체", ...TEAMS].map(t => (
              <button key={t} style={filterTeam === t ? S.chipActive : S.chip} onClick={() => setFilterTeam(t)}>{t}</button>
            ))}
          </div>
        )}

        {/* 막대그래프 */}
        <div style={{ margin: "14px 16px 0", background: "#161b27", border: "1px solid #1e2535", borderRadius: 12, overflow: "hidden" }}>
          <div style={S.sectionHeader}>📊 팀별 실시 현황</div>
          <BarChart data={teamCounts.map((t, i) => ({ ...t, color: TEAM_COLORS[i] }))} maxVal={15} />
        </div>

        {/* 질문별 취합 */}
        {scopeDone > 0 && (
          <div style={{ margin: "14px 16px 0", background: "#161b27", border: "1px solid #1e2535", borderRadius: 12, overflow: "hidden" }}>
            <div style={S.sectionHeader}>📋 질문별 답변 취합 ({fmtDateFull(dashDate)})</div>
            {QUESTIONS.filter(q => q.type === "yesno").map(q => {
              const s = qSummary[q.id] || { yes: 0, no: 0 };
              const total = s.yes + s.no;
              const yesPct = total ? Math.round((s.yes / total) * 100) : 0;
              return (
                <div key={q.id} style={{ padding: "12px 16px", borderBottom: "1px solid #1e2535" }}>
                  <p style={{ fontSize: 12, color: "#9ca3af", margin: "0 0 8px", lineHeight: 1.5 }}>Q{q.id}. {q.text}</p>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <div style={{ flex: 1, height: 16, background: "#1e2535", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${yesPct}%`, background: "linear-gradient(90deg,#059669,#10b981)", borderRadius: 4 }} />
                    </div>
                    <span style={{ fontSize: 12, color: "#4ade80", fontWeight: 700, minWidth: 28 }}>✓ {s.yes}</span>
                    <span style={{ fontSize: 12, color: "#f87171", fontWeight: 700, minWidth: 28 }}>✗ {s.no}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                    <span style={{ fontSize: 11, color: "#4ade80" }}>네 {yesPct}%</span>
                    <span style={{ fontSize: 11, color: "#6b7280" }}>총 {total}건</span>
                    <span style={{ fontSize: 11, color: "#f87171" }}>아니요 {100 - yesPct}%</span>
                  </div>
                </div>
              );
            })}
            {Object.values(dashSubs).filter(s => s.answers?.["5-1"]).length > 0 && (
              <div style={{ padding: "12px 16px" }}>
                <p style={{ fontSize: 12, color: "#f59e0b", fontWeight: 700, margin: "0 0 8px" }}>⚠️ Q5 위험사항 입력 내용</p>
                {Object.values(dashSubs).filter(s => s.answers?.["5-1"]).map((s, i) => (
                  <div key={i} style={{ background: "#1a1310", border: "1px solid #92400e44", borderRadius: 8, padding: "8px 12px", marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: "#f59e0b", fontWeight: 700 }}>{s.group} · {s.name}</span>
                    <p style={{ fontSize: 13, color: "#fcd34d", margin: "4px 0 0" }}>{s.answers["5-1"]}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 팀별 조 현황 */}
        {displayTeams.map(team => {
          const groups = GROUPS[team];
          const visibleGroups = isSuper ? groups : groups.filter(g => !disabledGroups[g]);
          const done = visibleGroups.filter(g => !disabledGroups[g] && dashSubs[g]).length;
          const total = visibleGroups.filter(g => !disabledGroups[g]).length;
          return (
            <div key={team} style={S.teamBlock}>
              <div style={S.teamHeader}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#f0f4ff" }}>{team}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#60a5fa" }}>{done}/{total}</span>
              </div>
              <div style={S.groupGrid}>
                {groups.map(g => {
                  const sub = dashSubs[g];
                  const isOff = !!disabledGroups[g];
                  if (!isSuper && isOff) return null;
                  return (
                    <div key={g} style={isOff ? S.groupOff : sub ? S.groupDone : S.groupPending}
                      onClick={() => !isOff && setViewGroup(g)}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: isOff ? "#374151" : sub ? "#4ade80" : "#6b7280" }}>
                        {g.replace(team + " ", "")}
                      </div>
                      {sub && !isOff && <div style={{ fontSize: 9, color: "#4ade80", marginTop: 1 }}>{sub.time}</div>}
                      {isOff && <div style={{ fontSize: 9, color: "#374151" }}>OFF</div>}
                      {isSuper && (
                        <button style={{ fontSize: 9, marginTop: 3, padding: "1px 5px", borderRadius: 3, border: "none", cursor: "pointer", fontFamily: "inherit", background: isOff ? "#374151" : "#1e3a5f", color: isOff ? "#6b7280" : "#60a5fa" }}
                          onClick={e => { e.stopPropagation(); toggleGroup(g); }}>
                          {isOff ? "ON" : "OFF"}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        <div style={{ height: 40 }} />
      </div>
    );
  }
  return null;
}

// ── STYLES ────────────────────────────────────────────────────
const S = {
  page: { minHeight: "100vh", background: "#0f1117", color: "#e8eaf0", fontFamily: "'Noto Sans KR','Apple SD Gothic Neo',sans-serif", padding: "0 0 20px", display: "flex", flexDirection: "column", maxWidth: 480, margin: "0 auto" },
  header: { background: "linear-gradient(135deg,#1a1f2e 0%,#0d1219 100%)", padding: "40px 24px 32px", borderBottom: "1px solid #1e2535", textAlign: "center" },
  headerBadge: { display: "inline-block", background: "#2563eb", color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: 3, padding: "4px 12px", borderRadius: 4, marginBottom: 12 },
  headerTitle: { fontSize: 22, fontWeight: 700, margin: "0 0 6px", color: "#f0f4ff" },
  headerSub: { fontSize: 13, color: "#6b7280", margin: 0, letterSpacing: 1 },
  noticeBox: { margin: "16px 16px 0", background: "linear-gradient(135deg,#1e3a5f,#162d4a)", border: "1px solid #2563eb44", borderRadius: 12, padding: "14px 16px" },
  noticeLabel: { fontSize: 11, fontWeight: 700, color: "#60a5fa", letterSpacing: 1, marginBottom: 6 },
  noticeText: { fontSize: 13, color: "#bfdbfe", margin: 0, lineHeight: 1.6 },
  progressCard: { margin: "16px 16px 0", background: "#161b27", borderRadius: 12, padding: "16px", border: "1px solid #1e2535" },
  progressRow: { display: "flex", justifyContent: "space-between", marginBottom: 10 },
  progressLabel: { fontSize: 13, color: "#9ca3af" },
  progressCount: { fontSize: 13, fontWeight: 700, color: "#60a5fa" },
  progressBar: { height: 8, background: "#1e2535", borderRadius: 4, overflow: "hidden" },
  progressFill: { height: "100%", background: "linear-gradient(90deg,#2563eb,#3b82f6)", borderRadius: 4, transition: "width 0.6s ease" },
  btnGroup: { display: "flex", flexDirection: "column", gap: 12, padding: "20px 16px 0" },
  btnPrimary: { width: "100%", padding: "16px", background: "linear-gradient(135deg,#2563eb,#1d4ed8)", color: "#fff", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" },
  btnSecondary: { width: "100%", padding: "16px", background: "#161b27", color: "#9ca3af", border: "1px solid #1e2535", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
  smallBtn: { padding: "6px 12px", background: "#1e2535", border: "1px solid #374151", borderRadius: 6, color: "#9ca3af", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
  calBtn: { padding: "8px 16px", background: "#1e3a5f", border: "1px solid #2563eb55", borderRadius: 8, color: "#60a5fa", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" },
  dateText: { textAlign: "center", fontSize: 12, color: "#4b5563", marginTop: 20 },
  topBar: { display: "flex", alignItems: "center", padding: "16px", borderBottom: "1px solid #1e2535", background: "#0f1117", position: "sticky", top: 0, zIndex: 10 },
  backBtn: { background: "none", border: "none", color: "#60a5fa", fontSize: 14, cursor: "pointer", padding: 0, fontFamily: "inherit" },
  topTitle: { fontSize: 16, fontWeight: 700, color: "#f0f4ff", flex: 1, textAlign: "center", marginRight: 40 },
  section: { padding: "20px 16px 0" },
  label: { fontSize: 12, fontWeight: 700, color: "#6b7280", letterSpacing: 1, display: "block", marginBottom: 10 },
  chipGrid: { display: "flex", flexWrap: "wrap", gap: 8 },
  chip: { padding: "8px 14px", background: "#161b27", border: "1px solid #1e2535", borderRadius: 8, color: "#9ca3af", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
  chipActive: { padding: "8px 14px", background: "#2563eb", border: "1px solid #2563eb", borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" },
  chipDone: { padding: "8px 14px", background: "#0d2b1a", border: "1px solid #166534", borderRadius: 8, color: "#4ade80", fontSize: 13, fontWeight: 600, cursor: "not-allowed", fontFamily: "inherit" },
  questionCard: { margin: "12px 16px 0", background: "#161b27", border: "1px solid #1e2535", borderRadius: 12, padding: "16px" },
  questionText: { fontSize: 14, fontWeight: 600, color: "#e8eaf0", margin: "0 0 6px", lineHeight: 1.6 },
  questionNote: { fontSize: 12, color: "#6b7280", margin: "0 0 12px" },
  radioRow: { display: "flex", gap: 10, marginTop: 12 },
  radio: { flex: 1, padding: "12px", background: "#0f1117", border: "1px solid #1e2535", borderRadius: 8, color: "#9ca3af", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
  radioActive: { flex: 1, padding: "12px", background: "#1e3a5f", border: "1px solid #2563eb", borderRadius: 8, color: "#60a5fa", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" },
  textarea: { width: "100%", minHeight: 80, background: "#0f1117", border: "1px solid #1e2535", borderRadius: 8, color: "#e8eaf0", fontSize: 14, padding: "10px", fontFamily: "inherit", resize: "vertical", boxSizing: "border-box" },
  nameInput: { width: "100%", padding: "12px 14px", background: "#0f1117", border: "1px solid #1e2535", borderRadius: 8, color: "#e8eaf0", fontSize: 15, fontFamily: "inherit", boxSizing: "border-box", marginTop: 8 },
  adminLoginCard: { margin: "16px 16px 0", background: "#161b27", border: "1px solid #1e2535", borderRadius: 16, padding: "28px 20px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" },
  input: { width: "100%", padding: "14px", background: "#0f1117", border: "1px solid #1e2535", borderRadius: 8, color: "#e8eaf0", fontSize: 15, fontFamily: "inherit", marginBottom: 10, boxSizing: "border-box", textAlign: "center" },
  accountTable: { width: "100%", marginTop: 24, background: "#0f1117", border: "1px solid #1e2535", borderRadius: 10, padding: "12px" },
  accountTableTitle: { fontSize: 12, color: "#6b7280", margin: "0 0 10px", fontWeight: 700 },
  accountRow: { display: "flex", alignItems: "center", gap: 8, padding: "7px 0", borderBottom: "1px solid #1e2535" },
  badgeSuper: { fontSize: 10, fontWeight: 700, background: "#7c3aed", color: "#fff", padding: "2px 7px", borderRadius: 4, whiteSpace: "nowrap" },
  badgeTeam: { fontSize: 10, fontWeight: 700, background: "#0369a1", color: "#fff", padding: "2px 7px", borderRadius: 4, whiteSpace: "nowrap" },
  adminBadgeBar: { display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", background: "#1a1f2e", borderBottom: "1px solid #1e2535" },
  dashHeader: { display: "flex", gap: 10, padding: "14px 16px 0" },
  statCard: { flex: 1, background: "#161b27", border: "1px solid #1e2535", borderRadius: 12, padding: "14px 8px", textAlign: "center" },
  statNum: { fontSize: 26, fontWeight: 800, color: "#60a5fa", lineHeight: 1 },
  statLabel: { fontSize: 11, color: "#6b7280", marginTop: 4 },
  filterRow: { display: "flex", flexWrap: "wrap", gap: 8, padding: "14px 16px 0" },
  sectionHeader: { padding: "12px 16px", fontSize: 13, fontWeight: 700, color: "#9ca3af", borderBottom: "1px solid #1e2535", background: "#1a1f2e" },
  teamBlock: { margin: "14px 16px 0", background: "#161b27", border: "1px solid #1e2535", borderRadius: 12, overflow: "hidden" },
  teamHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #1e2535", background: "#1a1f2e" },
  groupGrid: { display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 1, background: "#1e2535" },
  groupDone: { background: "#0d2b1a", padding: "8px 4px", textAlign: "center", cursor: "pointer" },
  groupPending: { background: "#0f1117", padding: "8px 4px", textAlign: "center", cursor: "pointer" },
  groupOff: { background: "#0a0c10", padding: "8px 4px", textAlign: "center", cursor: "default" },
  calOverlay: { position: "fixed", inset: 0, background: "#00000088", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" },
  calBox: { background: "#161b27", border: "1px solid #1e2535", borderRadius: 16, padding: "20px", width: 300, maxWidth: "90vw" },
  calHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  calTitle: { fontSize: 15, fontWeight: 700, color: "#f0f4ff" },
  calNav: { background: "none", border: "none", color: "#60a5fa", fontSize: 22, cursor: "pointer", padding: "0 8px", fontFamily: "inherit" },
  calGrid: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 },
  calDow: { textAlign: "center", fontSize: 11, color: "#6b7280", fontWeight: 700, padding: "4px 0" },
  calDay: { textAlign: "center", padding: "7px 2px", fontSize: 13, color: "#4b5563", borderRadius: 6 },
  calDayActive: { color: "#9ca3af", cursor: "pointer" },
  calDayToday: { color: "#60a5fa", fontWeight: 700, background: "#1e3a5f" },
  calDaySel: { background: "#2563eb", color: "#fff", fontWeight: 700 },
};
