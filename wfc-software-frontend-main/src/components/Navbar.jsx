import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import {
  Users, TrendingUp, AlertTriangle, Clock, CreditCard,
  X, Bell, CheckCircle, Salad, Wallet,
  Plus, Activity, RefreshCw, Edit3, Trash2, Megaphone
} from 'lucide-react';

const BASE_URL = 'https://wfc-backend-software.onrender.com';

// ── Helpers ───────────────────────────────────────────────────────────────────
const getMemberStatus = (endDate) => {
  if (!endDate) return 'expired';
  const diff = Math.ceil((new Date(endDate) - new Date()) / 86400000);
  if (diff < 0)  return 'expired';
  if (diff <= 7) return 'expiring';
  return 'active';
};
const isThisMonth = (d) => { if (!d) return false; const t = new Date(d), n = new Date(); return t.getMonth()===n.getMonth()&&t.getFullYear()===n.getFullYear(); };
const isLastMonth = (d) => { if (!d) return false; const t = new Date(d), n = new Date(), l=new Date(n.getFullYear(),n.getMonth()-1,1); return t.getMonth()===l.getMonth()&&t.getFullYear()===l.getFullYear(); };

// ── 3-Group Bar Chart (New Joined / Active / Expired) ────────────────────────
const BarChart = ({ lA, tA, lE, tE, lN, tN }) => {
  // 3 groups: New Joined, Active, Expired
  const groups = [
    { label:'New Joined', lVal:lN||0, tVal:tN||0, lColor:'#bfdbfe', tColor:'#2563eb', textColor:'#1d4ed8', dot:'#2563eb' },
    { label:'Active',     lVal:lA,    tVal:tA,    lColor:'#bbf7d0', tColor:'#16a34a', textColor:'#15803d', dot:'#16a34a' },
    { label:'Expired',    lVal:lE,    tVal:tE,    lColor:'#fecdd3', tColor:'#dc2626', textColor:'#b91c1c', dot:'#dc2626' },
  ];

  const maxV = Math.max(lN||0, tN||0, lA, tA, lE, tE, 1);
  const yMax = maxV <= 5 ? 5 : maxV <= 10 ? 10 : Math.ceil(maxV / 5) * 5;
  const H = 110, W = 420;
  const bW = 16, bGap = 4;         // each bar width & gap within group
  const groupW = bW * 2 + bGap;    // total group width
  const groupGap = 42;             // space between groups
  const sX = 34;                   // left margin

  const totalGroupsW = groups.length * groupW + (groups.length - 1) * groupGap;
  const chartW = W - sX - 16;
  const startOffset = (chartW - totalGroupsW) / 2; // center groups

  const yTicks = [0, yMax * 0.5, yMax];

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H + 46}`} className="overflow-visible">
      <defs>
        <style>{`
          @keyframes barUp { from{transform:scaleY(0);opacity:0} to{transform:scaleY(1);opacity:1} }
          @keyframes fadeUp{ from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
        `}</style>
      </defs>

      {/* Chart background */}
      <rect x={sX} y={0} width={W - sX - 8} height={H} fill="#f8fafc" rx="8"/>

      {/* Y grid + labels */}
      {yTicks.map((v, i) => {
        const y = H - (v / yMax) * H;
        return (
          <g key={i}>
            <line x1={sX} x2={W - 8} y1={y} y2={y}
              stroke={v === 0 ? '#cbd5e1' : '#e2e8f0'}
              strokeWidth={v === 0 ? 1.5 : 1}
              strokeDasharray={v === 0 ? undefined : '5 4'}/>
            <text x={sX - 6} y={y + 4} textAnchor="end" fontSize="9" fill="#94a3b8" fontWeight="500">
              {Math.round(v)}
            </text>
          </g>
        );
      })}

      {/* Bars */}
      {groups.map((g, gi) => {
        const gx = sX + startOffset + gi * (groupW + groupGap);
        const lH = Math.max((g.lVal / yMax) * H, g.lVal > 0 ? 5 : 0);
        const tH = Math.max((g.tVal / yMax) * H, g.tVal > 0 ? 5 : 0);
        const delay = gi * 0.12;

        return (
          <g key={gi}>
            {/* Last Month — light */}
            <rect x={gx} y={H - lH} width={bW} height={lH} fill={g.lColor}
              rx="4 4 2 2"
              style={{ transformOrigin: `${gx + bW / 2}px ${H}px`, animation: `barUp 0.65s cubic-bezier(.22,1,.36,1) ${delay}s both` }}/>
            {g.lVal > 0 && (
              <text x={gx + bW / 2} y={H - lH - 5} textAnchor="middle"
                fontSize="9" fill="#94a3b8" fontWeight="500"
                style={{ animation: `fadeUp 0.4s ease ${delay + 0.55}s both` }}>
                {g.lVal}
              </text>
            )}

            {/* This Month — saturated */}
            <rect x={gx + bW + bGap} y={H - tH} width={bW} height={tH} fill={g.tColor}
              rx="4 4 2 2"
              style={{ transformOrigin: `${gx + bW + bGap + bW / 2}px ${H}px`, animation: `barUp 0.65s cubic-bezier(.22,1,.36,1) ${delay + 0.08}s both` }}/>
            {g.tVal > 0 && (
              <text x={gx + bW + bGap + bW / 2} y={H - tH - 5} textAnchor="middle"
                fontSize="10" fill={g.textColor} fontWeight="700"
                style={{ animation: `fadeUp 0.4s ease ${delay + 0.63}s both` }}>
                {g.tVal}
              </text>
            )}

            {/* Group label */}
            <text x={gx + groupW / 2} y={H + 15} textAnchor="middle"
              fontSize="9.5" fontWeight="600" fill="#475569">
              {g.label}
            </text>

            {/* Dot under label matching group color */}
            <circle cx={gx + groupW / 2} cy={H + 23} r="3" fill={g.dot} opacity="0.7"/>
          </g>
        );
      })}

      {/* Legend — bottom centre */}
      {(() => {
        const lx = W / 2 - 68;
        return (
          <g transform={`translate(${lx}, ${H + 32})`}>
            <rect width={8} height={8} fill="#e2e8f0" rx="2"/>
            <rect x={9} width={8} height={8} fill="#475569" rx="2"/>
            <text x={21} y={7.5} fontSize="8" fill="#64748b">Last Month</text>
            <rect x={82} width={8} height={8} fill="#f0fdf4" rx="2" stroke="#86efac" strokeWidth="1"/>
            <rect x={91} width={8} height={8} fill="#16a34a" rx="2"/>
            <text x={103} y={7.5} fontSize="8" fill="#64748b">This Month</text>
          </g>
        );
      })()}
    </svg>
  );
};

// ── Member Modal ──────────────────────────────────────────────────────────────
const MemberModal = ({ title, members, color, onClose }) => {
  const navigate = useNavigate();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[75vh] flex flex-col overflow-hidden" onClick={e=>e.stopPropagation()} style={{animation:'su .2s ease'}}>
        <div className={`px-5 py-4 flex items-center justify-between ${color.hBg}`}>
          <p className={`font-bold text-sm ${color.hTxt}`}>{title} <span className="opacity-60 font-normal">({members.length})</span></p>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-black/10"><X size={15}/></button>
        </div>
        <div className="overflow-y-auto flex-1 divide-y divide-slate-50">
          {members.length===0 ? (
            <div className="text-center py-10 text-slate-400"><Users size={28} className="mx-auto mb-2 opacity-25"/><p className="text-xs">No members</p></div>
          ) : members.map(m => {
            const diff = m.endDate ? Math.ceil((new Date(m.endDate)-new Date())/86400000) : null;
            return (
              <div key={m._id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">{m.name?.[0]?.toUpperCase()||'?'}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{m.name}</p>
                  <p className="text-[11px] text-slate-400">{m.phone}</p>
                </div>
                {diff!==null&&<span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${diff<0?'bg-red-100 text-red-600':diff<=7?'bg-amber-100 text-amber-600':'bg-green-100 text-green-600'}`}>
                  {diff<0?`${Math.abs(diff)}d over`:diff===0?'Today':`${diff}d`}
                </span>}
              </div>
            );
          })}
        </div>
        <div className="p-3 border-t">
          <button onClick={()=>{navigate('/members');onClose();}} className="w-full py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold hover:bg-slate-700 transition">View All Members →</button>
        </div>
      </div>
      <style>{`@keyframes su{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
};

// ── Add Reminder Modal ────────────────────────────────────────────────────────
const AddReminderModal = ({ onSave, onClose }) => {
  const [text, setText] = useState('');
  const [type, setType] = useState('note'); // note | urgent | diet | payment

  const TYPES = [
    { id: 'note',    label: '📝 Note',    color: 'bg-blue-100 text-blue-700 border-blue-300' },
    { id: 'urgent',  label: '🚨 Urgent',  color: 'bg-red-100 text-red-700 border-red-300' },
    { id: 'diet',    label: '🥗 Diet',    color: 'bg-green-100 text-green-700 border-green-300' },
    { id: 'payment', label: '💰 Payment', color: 'bg-amber-100 text-amber-700 border-amber-300' },
  ];

  const save = () => {
    if (!text.trim()) return;
    onSave({ id: Date.now().toString(), text: text.trim(), type, createdAt: new Date().toISOString() });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={e=>e.stopPropagation()} style={{animation:'su .2s ease'}}>
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <p className="font-bold text-sm text-slate-800">Add Reminder</p>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100"><X size={15}/></button>
        </div>
        <div className="p-5 space-y-4">
          {/* Type selector */}
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-2">Type</p>
            <div className="grid grid-cols-2 gap-2">
              {TYPES.map(t => (
                <button key={t.id} onClick={()=>setType(t.id)}
                  className={`py-1.5 px-2 rounded-lg border text-xs font-semibold transition-all ${type===t.id ? t.color+' scale-[1.02] shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          {/* Text */}
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-2">Note</p>
            <textarea
              value={text}
              onChange={e=>setText(e.target.value)}
              onKeyDown={e=>{if(e.key==='Enter'&&e.metaKey)save();}}
              autoFocus
              rows={3}
              placeholder="e.g. Call Ravi for renewal, Prepare diet for Priya..."
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-400"
            />
            <p className="text-[10px] text-slate-400 mt-1">Cmd+Enter to save</p>
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition">Cancel</button>
            <button onClick={save} disabled={!text.trim()} className="flex-1 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-semibold hover:bg-slate-700 transition disabled:opacity-40">Save</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Reminder colors ───────────────────────────────────────────────────────────
const RC = {
  note:    { bg:'bg-blue-50',   border:'border-blue-200',   icon:'text-blue-500',   title:'text-blue-800' },
  urgent:  { bg:'bg-red-50',    border:'border-red-200',    icon:'text-red-500',    title:'text-red-800'  },
  diet:    { bg:'bg-green-50',  border:'border-green-200',  icon:'text-green-600',  title:'text-green-800'},
  payment: { bg:'bg-amber-50',  border:'border-amber-200',  icon:'text-amber-600',  title:'text-amber-800'},
  auto:    { bg:'bg-slate-50',  border:'border-slate-200',  icon:'text-slate-500',  title:'text-slate-700'},
};
const TYPE_ICON = { note: Edit3, urgent: AlertTriangle, diet: Salad, payment: Wallet, auto: Bell };

// ── Main Dashboard ────────────────────────────────────────────────────────────
const Dashboard = () => {
  const navigate = useNavigate();
  const [members,  setMembers]  = useState([]);
  const [leadStats,setLeadStats]= useState({ total:0, new:0, converted:0, interested:0 });
  const [payments, setPayments] = useState([]);
  const [dietPlans,setDietPlans]= useState([]);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(null);
  const [showAddReminder, setShowAddReminder] = useState(false);

  // Manual reminders stored in localStorage
  const [manualNotes, setManualNotes] = useState(() => {
    try { return JSON.parse(localStorage.getItem('wfc_manual_notes')||'[]'); } catch { return []; }
  });
  const [dismissed, setDismissed] = useState(() => {
    try { return JSON.parse(localStorage.getItem('wfc_dismissed')||'[]'); } catch { return []; }
  });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [mR,pR,dR,lR] = await Promise.allSettled([
        axios.get(`http://localhost:5000/api/v1/fetch`),
        axios.get(`http://localhost:5000/api/v1/reg-payments`),
        axios.get(`http://localhost:5000/api/v1/reg-diet-plans`),
        axios.get(`http://localhost:5000/api/v1/leads/stats`),
      ]);
      if(mR.status==='fulfilled') setMembers(mR.value.data?.data||[]);
      if(pR.status==='fulfilled') setPayments(pR.value.data?.payments||[]);
      if(dR.status==='fulfilled') setDietPlans(dR.value.data?.plans||[]);
      if(lR.status==='fulfilled') setLeadStats(lR.value.data?.stats||{total:0,new:0,converted:0,interested:0});
    } catch(e){ console.error(e); }
    finally { setLoading(false); }
  };

  // computed
  const activeM   = members.filter(m=>getMemberStatus(m.endDate)==='active');
  const expiringM = members.filter(m=>getMemberStatus(m.endDate)==='expiring');
  const expiredM  = members.filter(m=>getMemberStatus(m.endDate)==='expired');
  const balanceM  = payments.filter(p=>p.balanceAmount>0).reduce((acc,p)=>{
    if(!acc.find(x=>x._id===p.registrationId)){ const mb=members.find(m=>m._id===p.registrationId); if(mb) acc.push({...mb,balanceAmount:p.balanceAmount}); } return acc;
  },[]);

  const tMA=members.filter(m=>isThisMonth(m.startDate)&&getMemberStatus(m.endDate)==='active').length;
  const lMA=members.filter(m=>isLastMonth(m.startDate)&&getMemberStatus(m.endDate)==='active').length;
  const tME=members.filter(m=>isThisMonth(m.endDate)&&getMemberStatus(m.endDate)==='expired').length;
  const lME=members.filter(m=>isLastMonth(m.endDate)&&getMemberStatus(m.endDate)==='expired').length;
  const newThisMonth=members.filter(m=>isThisMonth(m.createdAt)).length;
  const lMN=members.filter(m=>isLastMonth(m.createdAt)).length;

  // Auto reminders
  const autoReminders = [];
  const crit=members.filter(m=>{ const d=Math.ceil((new Date(m.endDate)-new Date())/86400000); return d>=0&&d<=3; });
  if(crit.length>0) autoReminders.push({ id:'exp3d', type:'urgent', text:`${crit.length} member${crit.length>1?'s':''} expiring in 3 days: ${crit.slice(0,2).map(m=>m.name).join(', ')}${crit.length>2?` +${crit.length-2} more`:''}`, auto:true, action:{label:'Collect Renewal',fn:()=>navigate('/payments/new')}});
  if(balanceM.length>0) autoReminders.push({ id:'bal', type:'payment', text:`${balanceM.length} member${balanceM.length>1?'s have':' has'} pending balance: ${balanceM.slice(0,2).map(m=>`${m.name} ₹${m.balanceAmount}`).join(', ')}`, auto:true, action:{label:'Collect Now',fn:()=>navigate('/payments/new')}});
  const dietIds=new Set(dietPlans.map(d=>String(d.registrationId)));
  const noDiet=activeM.filter(m=>!dietIds.has(String(m._id)));
  if(noDiet.length>0) autoReminders.push({ id:'nodiet', type:'diet', text:`${noDiet.length} active member${noDiet.length>1?'s':''} have no diet plan: ${noDiet.slice(0,2).map(m=>m.name).join(', ')}${noDiet.length>2?` +${noDiet.length-2} more`:''}`, auto:true, action:{label:'Create Diet',fn:()=>navigate('/diet-plans/new')}});

  const allReminders = [...autoReminders.filter(r=>!dismissed.includes(r.id)), ...manualNotes];

  const dismiss = (id) => {
    const u=[...dismissed,id]; setDismissed(u); localStorage.setItem('wfc_dismissed',JSON.stringify(u));
  };
  const deleteManual = (id) => {
    const u=manualNotes.filter(n=>n.id!==id); setManualNotes(u); localStorage.setItem('wfc_manual_notes',JSON.stringify(u));
  };
  const saveManual = (note) => {
    const u=[note,...manualNotes]; setManualNotes(u); localStorage.setItem('wfc_manual_notes',JSON.stringify(u));
  };

  const CARDS = [
    { emoji:'👥', title:'Total',    value:members.length,   sub:`+${newThisMonth} new`,   gradient:'from-slate-700 to-slate-900',    list:members,   lc:{hBg:'bg-slate-800 text-white',hTxt:'text-white'} },
    { emoji:'💪', title:'Active',   value:activeM.length,   sub:`${tMA} this month`,      gradient:'from-emerald-500 to-green-700',  list:activeM,   lc:{hBg:'bg-emerald-600 text-white',hTxt:'text-white'} },
    { emoji:'⏳', title:'Expiring', value:expiringM.length, sub:'Within 7 days',          gradient:'from-amber-400 to-orange-500',   list:expiringM, lc:{hBg:'bg-amber-500 text-white',hTxt:'text-white'} },
    { emoji:'❌', title:'Expired',  value:expiredM.length,  sub:`${tME} this month`,      gradient:'from-red-500 to-rose-700',       list:expiredM,  lc:{hBg:'bg-red-600 text-white',hTxt:'text-white'} },
    { emoji:'💰', title:'Pending',  value:balanceM.length,  sub:balanceM.length>0?`₹${balanceM.reduce((s,m)=>s+m.balanceAmount,0).toLocaleString('en-IN')}`:'All clear', gradient:'from-violet-500 to-purple-700', list:balanceM, lc:{hBg:'bg-violet-600 text-white',hTxt:'text-white'} },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar/>
      <div className="max-w-7xl mx-auto px-4 py-5">

        {/* Header — compact */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-bold text-slate-900">
              {new Date().getHours()<12?'Good Morning 🌅':new Date().getHours()<17?'Good Afternoon ☀️':'Good Evening 🌙'},&nbsp;
              <span className="text-red-600">{(()=>{try{const u=JSON.parse(localStorage.getItem('user')||'{}');return u.name||'Admin';}catch{return 'Admin';}})()}</span> 👋
            </h1>
            <p className="text-xs text-slate-400">{new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'})}</p>
          </div>
          <button onClick={fetchAll} className="flex items-center gap-1.5 text-slate-400 hover:text-slate-700 text-xs font-medium transition px-2.5 py-1.5 rounded-lg hover:bg-slate-200">
            <RefreshCw size={13} className={loading?'animate-spin':''}/> Refresh
          </button>
        </div>

        {/* Stat Cards — compact */}
        <div className="grid grid-cols-5 gap-2.5 mb-4">
          {loading ? [...Array(5)].map((_,i)=>(
            <div key={i} className="h-20 rounded-xl bg-white animate-pulse border border-slate-100"/>
          )) : CARDS.map(c=>(
            <button key={c.title} onClick={()=>setModal({title:c.title,members:c.list,color:c.lc})}
              className={`bg-gradient-to-br ${c.gradient} text-white rounded-xl p-3 text-left shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-[.98] transition-all duration-200`}>
              <div className="flex items-start justify-between mb-1">
                <p className="text-2xl font-black leading-none">{c.value}</p>
                <span className="text-xl leading-none opacity-80">{c.emoji}</span>
              </div>
              <p className="text-[11px] font-semibold opacity-90">{c.title}</p>
              <p className="text-[10px] opacity-55 mt-0.5">{c.sub}</p>
            </button>
          ))}
        </div>

        {/* Chart + Reminders */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">

          {/* Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm p-4">
            {/* Chart header */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-bold text-slate-800 text-sm">📊 Member Activity</p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {(() => {
                    const now = new Date();
                    const lm = new Date(now.getFullYear(), now.getMonth()-1, 1);
                    const lmName = lm.toLocaleString('en-IN',{month:'short'});
                    const tmName = now.toLocaleString('en-IN',{month:'short'});
                    return <><span className="font-semibold text-slate-500">{lmName}</span> vs <span className="font-semibold text-slate-500">{tmName}</span> · New Joined / Active / Expired</>;
                  })()}
                </p>
              </div>
              <span className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-xl ${
                tMA>lMA?'bg-emerald-50 text-emerald-700':tMA<lMA?'bg-red-50 text-red-600':'bg-slate-50 text-slate-500'
              }`}>
                <Activity size={10}/>
                {tMA>lMA?`↑ ${tMA-lMA} more active`:tMA<lMA?`↓ ${lMA-tMA} less active`:'No change'}
              </span>
            </div>

            {/* Chart */}
            <BarChart lA={lMA} tA={tMA} lE={lME} tE={tME} lN={lMN} tN={newThisMonth}/>

            {/* Summary stats row */}
            <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-50">
              {[
                {label:'New Joined',  val:newThisMonth,    c:'text-blue-600',    bg:'bg-blue-50',    emoji:'🆕'},
                {label:'Active Now',  val:activeM.length,  c:'text-emerald-600', bg:'bg-emerald-50', emoji:'✅'},
                {label:'Expiring',    val:expiringM.length,c:'text-amber-600',   bg:'bg-amber-50',   emoji:'⏳'},
                {label:'Expired',     val:expiredM.length, c:'text-red-500',     bg:'bg-red-50',     emoji:'❌'},
              ].map(({label,val,c,bg,emoji})=>(
                <div key={label} className={`text-center rounded-xl py-2 px-1 ${bg}`}>
                  <p className="text-base mb-0.5">{emoji}</p>
                  <p className={`text-lg font-black leading-none ${c}`}>{val}</p>
                  <p className="text-[9px] text-slate-400 mt-0.5 whitespace-nowrap">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Reminders */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex flex-col min-h-0">
            {/* Reminder header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <Bell size={13} className="text-slate-500"/>
                <p className="font-bold text-slate-900 text-xs">Reminders</p>
                {allReminders.filter(r=>r.type==='urgent'||r.auto).length>0&&(
                  <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center">
                    {allReminders.length}
                  </span>
                )}
              </div>
              {/* + Add button */}
              <button onClick={()=>setShowAddReminder(true)}
                className="flex items-center gap-1 bg-slate-800 text-white px-2.5 py-1 rounded-lg text-[11px] font-semibold hover:bg-slate-700 transition">
                <Plus size={11}/> Add
              </button>
            </div>

            {/* Reminder list */}
            <div className="flex flex-col gap-2 flex-1 overflow-y-auto max-h-52">
              {allReminders.length===0 ? (
                <div className="text-center py-6 text-slate-400">
                  <CheckCircle size={22} className="mx-auto mb-1.5 text-emerald-400"/>
                  <p className="text-[11px]">All clear! No reminders.</p>
                </div>
              ) : allReminders.map(r => {
                const rc = RC[r.type] || RC.auto;
                const RIcon = TYPE_ICON[r.type] || Bell;
                return (
                  <div key={r.id} className={`flex items-start gap-2 p-2.5 rounded-xl border ${rc.bg} ${rc.border} group`}>
                    <RIcon size={13} className={`${rc.icon} flex-shrink-0 mt-0.5`}/>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[11px] font-semibold leading-snug ${rc.title}`}>{r.text}</p>
                      {r.action&&(
                        <button onClick={r.action.fn} className={`text-[10px] font-bold underline underline-offset-1 mt-1 ${rc.title}`}>
                          {r.action.label} →
                        </button>
                      )}
                      {!r.auto&&<p className="text-[9px] text-slate-400 mt-0.5">{new Date(r.createdAt).toLocaleDateString('en-IN')}</p>}
                    </div>
                    <button
                      onClick={()=>r.auto?dismiss(r.id):deleteManual(r.id)}
                      className="opacity-0 group-hover:opacity-100 transition p-0.5 rounded hover:bg-black/10">
                      <X size={11} className="text-slate-400"/>
                    </button>
                  </div>
                );
              })}
            </div>

            {dismissed.length>0&&(
              <button onClick={()=>{setDismissed([]);localStorage.removeItem('wfc_dismissed');}}
                className="mt-2 text-[10px] text-slate-400 hover:text-slate-600 transition text-center">
                Restore dismissed auto-reminders
              </button>
            )}
          </div>
        </div>

        {/* Leads mini strip */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl p-4 mb-4 flex items-center gap-4 cursor-pointer hover:shadow-lg transition"
          onClick={() => navigate('/leads')}>
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Megaphone size={20} />
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm">Leads & Enquiries</p>
            <p className="text-xs opacity-70">Track gym enquiries and convert to members</p>
          </div>
          <div className="flex items-center gap-4 flex-shrink-0">
            {[
              {label:'Total',    val:leadStats.total,     c:'text-white'},
              {label:'New',      val:leadStats.new||0,    c:'text-blue-200'},
              {label:'Hot 🔥',   val:(leadStats.interested||0), c:'text-yellow-300'},
              {label:'Converted',val:leadStats.converted||0,c:'text-emerald-300'},
            ].map(({label,val,c})=>(
              <div key={label} className="text-center">
                <p className={`text-xl font-black leading-none ${c}`}>{val}</p>
                <p className="text-[9px] opacity-60 whitespace-nowrap">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions — full style */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h2 className="font-bold text-slate-900 text-sm mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Add Member',  icon: Plus,       color: 'bg-slate-800 hover:bg-slate-700',    fn: () => navigate('/register') },
              { label: 'New Payment', icon: CreditCard,  color: 'bg-red-600 hover:bg-red-700',        fn: () => navigate('/payments/new') },
              { label: 'Diet Plan',   icon: Salad,       color: 'bg-green-600 hover:bg-green-700',    fn: () => navigate('/diet-plans/new') },
              { label: 'All Members', icon: Users,       color: 'bg-violet-600 hover:bg-violet-700',  fn: () => navigate('/members') },
            ].map(({ label, icon: Icon, color, fn }) => (
              <button key={label} onClick={fn}
                className={`flex items-center gap-2.5 px-4 py-3 ${color} text-white rounded-xl text-sm font-semibold transition-all active:scale-95 shadow-sm`}>
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {modal&&<MemberModal title={modal.title} members={modal.members} color={modal.color} onClose={()=>setModal(null)}/>}
      {showAddReminder&&<AddReminderModal onSave={saveManual} onClose={()=>setShowAddReminder(false)}/>}
    </div>
  );
};

export default Dashboard;