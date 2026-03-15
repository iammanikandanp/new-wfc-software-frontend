import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import {
  Plus, Search, X, User, Phone, Mail, MapPin,
  Calendar, Activity, Dumbbell, Heart, ChevronRight,
  AlertCircle, CheckCircle, Clock, XCircle, Eye, Edit3, Trash2
} from 'lucide-react';

const BASE_URL = 'https://wfc-backend-software.onrender.com';

// Compute payment/membership status from endDate
const getMembershipStatus = (endDate) => {
  if (!endDate) return { label: 'Unknown', color: 'bg-slate-100 text-slate-500', dot: 'bg-slate-400', icon: AlertCircle };
  const now = new Date();
  const end = new Date(endDate);
  const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return { label: 'Expired', color: 'bg-red-100 text-red-700', dot: 'bg-red-500', icon: XCircle };
  if (diffDays <= 7) return { label: `Expires in ${diffDays}d`, color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500', icon: Clock };
  return { label: 'Active', color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500', icon: CheckCircle };
};

const Avatar = ({ src, name, size = 'md' }) => {
  const [err, setErr] = useState(false);
  const sizeClass = size === 'lg' ? 'w-20 h-20 text-2xl' : size === 'sm' ? 'w-9 h-9 text-sm' : 'w-12 h-12 text-base';
  const initials = name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '?';
  const colors = ['bg-red-500', 'bg-blue-500', 'bg-violet-500', 'bg-amber-500', 'bg-emerald-500', 'bg-pink-500'];
  const color = colors[(name?.charCodeAt(0) || 0) % colors.length];

  if (src && !err) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setErr(true)}
        className={`${sizeClass} rounded-full object-cover ring-2 ring-white shadow`}
      />
    );
  }
  return (
    <div className={`${sizeClass} ${color} rounded-full flex items-center justify-center text-white font-bold ring-2 ring-white shadow`}>
      {initials}
    </div>
  );
};

// ── Profile Image with letter fallback ───────────────────────────────────────
const ProfileImg = ({ src, name, size = 80 }) => {
  const [err, setErr] = React.useState(false);
  const initials = name ? name.trim().split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() : '?';
  const colors = ['bg-pink-500','bg-violet-500','bg-blue-500','bg-emerald-500','bg-orange-500','bg-red-500'];
  const color  = colors[(name?.charCodeAt(0)||0) % colors.length];
  const sz     = `${size}px`;
  if (src && !err) {
    return <img src={src} alt={name} onError={()=>setErr(true)}
      style={{width:sz,height:sz}} className="rounded-full object-cover ring-4 ring-white/30 shadow-lg flex-shrink-0" />;
  }
  return (
    <div style={{width:sz,height:sz,fontSize:size>60?'1.75rem':'1rem'}}
      className={`${color} rounded-full ring-4 ring-white/30 shadow-lg flex-shrink-0 flex items-center justify-center text-white font-black`}>
      {initials}
    </div>
  );
};

// ── Body image tile ───────────────────────────────────────────────────────────
const BodyImgTile = ({ src, label }) => {
  const [err, setErr] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  if (!src) return (
    <div className="flex flex-col items-center gap-1">
      <div className="w-full h-28 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200">
        <span className="text-slate-300 text-xs">No photo</span>
      </div>
      <span className="text-[10px] text-slate-400">{label}</span>
    </div>
  );
  if (err) return (
    <div className="flex flex-col items-center gap-1">
      <div className="w-full h-28 rounded-xl bg-red-50 flex items-center justify-center border border-red-100">
        <span className="text-red-300 text-xs">Load error</span>
      </div>
      <span className="text-[10px] text-slate-400">{label}</span>
    </div>
  );
  return (
    <>
      <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={()=>setOpen(true)}>
        <div className="relative w-full h-28 rounded-xl overflow-hidden border border-slate-200 hover:border-slate-400 transition group">
          <img src={src} alt={label} onError={()=>setErr(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition" />
          <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded">{label}</span>
        </div>
      </div>
      {open && (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4" onClick={()=>setOpen(false)}>
          <img src={src} alt={label} className="max-w-full max-h-full rounded-2xl shadow-2xl" />
        </div>
      )}
    </>
  );
};

// ── Attendance component — month selector + scoreboard ───────────────────────
const MONTH_LABELS = {
  '2025-09':'Sep 2025','2025-10':'Oct 2025','2025-11':'Nov 2025',
  '2025-12':'Dec 2025','2026-01':'Jan 2026','2026-02':'Feb 2026',
  '2026-03':'Mar 2026','2026-04':'Apr 2026','2026-05':'May 2026',
};

const pctColor = p => p >= 80 ? 'text-emerald-600' : p >= 50 ? 'text-amber-500' : 'text-red-600';
const barColor = p => p >= 80 ? 'bg-emerald-500'   : p >= 50 ? 'bg-amber-500'   : 'bg-red-500';
const ringColor= p => p >= 80 ? 'stroke-emerald-500': p >= 50 ? 'stroke-amber-500': 'stroke-red-500';

// Circular progress ring
const Ring = ({ pct, size = 80 }) => {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e2e8f0" strokeWidth="6" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" strokeWidth="6"
        className={`${ringColor(pct)} transition-all duration-700`}
        strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round" />
    </svg>
  );
};

const AttendanceCalendar = ({ attendanceId }) => {
  const [allRecords,   setAllRecords]   = React.useState([]);
  const [loading,      setLoading]      = React.useState(true);
  const [selectedMonth,setSelectedMonth]= React.useState(null); // null = "Overall"

  React.useEffect(() => {
    if (!attendanceId) { setLoading(false); return; }
    axios.get(`http://localhost:5000/api/v1/xls-attendance`, {
      params: { attendanceId: String(attendanceId) }
    })
      .then(res => {
        const recs = (res.data?.records || [])
          .sort((a, b) => b.month.localeCompare(a.month));
        setAllRecords(recs);
        // default to latest month
        if (recs.length > 0) setSelectedMonth(recs[0].month);
      })
      .catch(() => setAllRecords([]))
      .finally(() => setLoading(false));
  }, [attendanceId]);

  if (!attendanceId) return (
    <div className="bg-slate-50 rounded-xl p-4 text-center text-xs text-slate-400">
      No Attendance ID — set it in Edit to link records.
    </div>
  );
  if (loading) return (
    <div className="bg-slate-50 rounded-xl p-4 text-center text-xs text-slate-400 animate-pulse">
      Loading attendance…
    </div>
  );
  if (allRecords.length === 0) return (
    <div className="bg-slate-50 rounded-xl p-4 text-center text-xs text-slate-400">
      No records found for ID <strong>{attendanceId}</strong>. Import XLS files on the Attendance page.
    </div>
  );

  // ── Compute display data based on selected month ──────────────────────────
  const totalPresent = allRecords.reduce((s,r) => s+(r.attendDays||0), 0);
  const totalWork    = allRecords.reduce((s,r) => s+(r.workDays||0),   0);
  const totalAbsent  = allRecords.reduce((s,r) => s+(r.absentDays||0), 0);
  const totalLate    = allRecords.reduce((s,r) => s+(r.lateTimes||0),  0);
  const totalOT      = allRecords.reduce((s,r) => s+(r.otHours||0),    0);
  const overallPct   = totalWork > 0 ? Math.round((totalPresent/totalWork)*100) : 0;

  const sel = selectedMonth
    ? allRecords.find(r => r.month === selectedMonth)
    : null;

  // scoreboard values — switches between selected month and overall
  const display = sel ? {
    pct:     sel.workDays > 0 ? Math.round((sel.attendDays/sel.workDays)*100) : 0,
    present: sel.attendDays,
    absent:  sel.absentDays,
    work:    sel.workDays,
    late:    sel.lateTimes,
    lateMins:sel.lateMins,
    ot:      sel.otHours,
    shift:   sel.shift,
    label:   MONTH_LABELS[sel.month] || sel.month,
  } : {
    pct:     overallPct,
    present: totalPresent,
    absent:  totalAbsent,
    work:    totalWork,
    late:    totalLate,
    lateMins:allRecords.reduce((s,r)=>s+(r.lateMins||0),0),
    ot:      parseFloat(totalOT.toFixed(1)),
    shift:   '',
    label:   'Overall',
  };

  return (
    <div>
      {/* ── Month selector tabs ── */}
      <div className="flex gap-1.5 flex-wrap mb-4">
        {/* Overall tab */}
        <button
          onClick={() => setSelectedMonth(null)}
          className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all ${
            !selectedMonth
              ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
              : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
          }`}>
          Overall
        </button>
        {/* One tab per month */}
        {allRecords.map(r => {
          const mp  = r.workDays > 0 ? Math.round((r.attendDays/r.workDays)*100) : 0;
          const dot = mp >= 80 ? 'bg-emerald-500' : mp >= 50 ? 'bg-amber-500' : 'bg-red-500';
          const isActive = selectedMonth === r.month;
          return (
            <button key={r.month}
              onClick={() => setSelectedMonth(r.month)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all ${
                isActive
                  ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
              }`}>
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isActive ? 'bg-white' : dot}`} />
              {MONTH_LABELS[r.month] || r.month}
            </button>
          );
        })}
      </div>

      {/* ── Scoreboard ── */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
        {/* Top row: ring + big numbers */}
        <div className="flex items-center gap-4 mb-4">
          {/* Circular ring */}
          <div className="relative flex-shrink-0" style={{width:72,height:72}}>
            <Ring pct={display.pct} size={72} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-sm font-black ${pctColor(display.pct)}`}>{display.pct}%</span>
            </div>
          </div>

          {/* Label + bar */}
          <div className="flex-1">
            <p className="text-xs font-bold text-slate-700 mb-1">{display.label}</p>
            <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
              <div className={`${barColor(display.pct)} h-2 rounded-full transition-all duration-700`}
                style={{width:`${display.pct}%`}} />
            </div>
            <p className="text-[10px] text-slate-400">{display.present} present of {display.work} work days</p>
          </div>
        </div>

        {/* Stat boxes */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            { label:'Present', val: display.present, color:'text-emerald-600', bg:'bg-emerald-50 border-emerald-100' },
            { label:'Absent',  val: display.absent,  color:'text-red-500',     bg:'bg-red-50 border-red-100' },
            { label:'Work Days',val:display.work,    color:'text-slate-700',   bg:'bg-white border-slate-100' },
          ].map(s => (
            <div key={s.label} className={`text-center rounded-xl py-2 border ${s.bg}`}>
              <p className={`text-xl font-black ${s.color}`}>{s.val}</p>
              <p className="text-[9px] text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Extra tags */}
        <div className="flex flex-wrap gap-1.5">
          {display.late > 0 && (
            <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">
              ⏰ Late {display.late}× ({display.lateMins} min)
            </span>
          )}
          {display.ot > 0 && (
            <span className="text-[10px] bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-semibold">
              ⚡ OT {display.ot} hrs
            </span>
          )}
          {display.shift && (
            <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
              {display.shift}
            </span>
          )}
          {!selectedMonth && allRecords.length > 1 && (
            <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-semibold">
              {allRecords.length} months imported
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Member Detail Modal ──────────────────────────────────────────────────────
const MemberDetailModal = ({ member, onClose }) => {
  if (!member) return null;
  const status = getMembershipStatus(member.endDate);
  const StatusIcon = status.icon;

  const InfoRow = ({ label, value }) => (
    <div className="flex justify-between py-2 border-b border-slate-100 last:border-0">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-xs font-semibold text-slate-800 text-right max-w-[60%]">{value || '—'}</span>
    </div>
  );

  const Section = ({ title, children }) => (
    <div className="mb-4">
      <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">{title}</h4>
      <div className="bg-slate-50 rounded-xl px-4">{children}</div>
    </div>
  );

  const daysLeft = member.endDate
    ? Math.ceil((new Date(member.endDate) - new Date()) / 86400000)
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()} style={{ animation: 'slideUp 0.25s ease' }}>

        {/* ── Header ── */}
        <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-t-2xl p-6 text-white">
          <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition">
            <X size={16} />
          </button>
          <div className="flex items-center gap-4">
            {/* Profile image — shows actual photo OR letter fallback */}
            <ProfileImg src={member.images?.profileImage} name={member.name} size={72} />
            <div className="flex-1">
              <h2 className="text-xl font-bold">{member.name}</h2>
              <p className="text-slate-300 text-sm mt-0.5">
                {member.gender} · {member.age} yrs · {member.bloodGroup || '—'}
              </p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                  <StatusIcon size={11} />
                  {status.label}
                </div>
                {daysLeft !== null && daysLeft >= 0 && daysLeft <= 30 && (
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${daysLeft <= 3?'bg-red-500 text-white':daysLeft<=7?'bg-amber-500 text-white':'bg-white/20 text-white'}`}>
                    {daysLeft === 0 ? 'Expires today' : `${daysLeft}d left`}
                  </span>
                )}
                {member.attendanceId && (
                  <span className="text-xs font-mono bg-blue-500/80 text-white px-2 py-0.5 rounded-full">
                    ID:{member.attendanceId}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="p-5">

          {/* ── Attendance ── */}
          <div className="mb-4">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Attendance</h4>
            <AttendanceCalendar attendanceId={member.attendanceId} />
          </div>

          {/* ── Body Photos ── */}
          <div className="mb-4">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Body Progress Photos</h4>
            <div className="grid grid-cols-3 gap-2">
              <BodyImgTile src={member.images?.frontBodyImage} label="Front" />
              <BodyImgTile src={member.images?.sideBodyImage}  label="Side" />
              <BodyImgTile src={member.images?.backBodyImage}  label="Back" />
            </div>
          </div>

          <Section title="Contact">
            <InfoRow label="Phone"   value={member.phone} />
            <InfoRow label="Email"   value={member.emails} />
            <InfoRow label="Address" value={member.address} />
            <InfoRow label="Pincode" value={member.pincode} />
          </Section>

          <Section title="Membership">
            <InfoRow label="Package"    value={member.packages} />
            <InfoRow label="Duration"   value={member.duration ? `${member.duration} month(s)` : '—'} />
            <InfoRow label="Services"   value={member.services} />
            <InfoRow label="Start Date" value={member.startDate ? new Date(member.startDate).toLocaleDateString('en-IN') : '—'} />
            <InfoRow label="End Date"   value={member.endDate   ? new Date(member.endDate).toLocaleDateString('en-IN')   : '—'} />
          </Section>

          <Section title="Health">
            <InfoRow label="Height"         value={member.height    ? `${member.height} cm`  : '—'} />
            <InfoRow label="Weight"         value={member.weight    ? `${member.weight} kg`  : '—'} />
            <InfoRow label="BMI"            value={member.bmi       ? `${member.bmi} (${member.statusLevel||''})` : '—'} />
            <InfoRow label="Body Fat"       value={member.bodyFat   ? `${member.bodyFat}%`   : '—'} />
            <InfoRow label="Blood Pressure" value={member.bloodPressure} />
            <InfoRow label="Sugar Level"    value={member.sugarLevel} />
            <InfoRow label="Waist"          value={member.waist     ? `${member.waist} cm`   : '—'} />
            <InfoRow label="Hip"            value={member.hip       ? `${member.hip} cm`     : '—'} />
            <InfoRow label="Neck"           value={member.neck      ? `${member.neck} cm`    : '—'} />
            <InfoRow label="Issues"         value={member.issues} />
          </Section>

          <Section title="Add-on Services">
            <InfoRow label="Personal Training" value={member.personalTraining || 'No'} />
            <InfoRow label="Custom Workout"    value={member.customWorkout    || 'No'} />
            <InfoRow label="Custom Diet"       value={member.customDiet       || 'No'} />
            <InfoRow label="Rehab Therapy"     value={member.rehabTherapy     || 'No'} />
          </Section>

          <div className="bg-slate-50 rounded-xl px-4">
            <InfoRow label="Member Since" value={member.createdAt ? new Date(member.createdAt).toLocaleDateString('en-IN') : '—'} />
          </div>
        </div>
      </div>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
};

// ── Member Card ──────────────────────────────────────────────────────────────
const MemberCard = ({ member, onClick, onEdit, onDelete }) => {
  const status = getMembershipStatus(member.endDate);
  const StatusIcon = status.icon;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex items-center gap-4 hover:shadow-md hover:border-slate-200 transition-all duration-200 group">
      {/* Avatar — click to view details */}
      <div className="relative flex-shrink-0 cursor-pointer" onClick={() => onClick(member)}>
        <Avatar src={member.images?.profileImage} name={member.name} size="md" />
        <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${status.dot}`} />
      </div>

      {/* Info — click to view details */}
      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onClick(member)}>
        <p className="font-semibold text-slate-900 truncate group-hover:text-red-600 transition-colors">{member.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-slate-500">{member.age} yrs</span>
          <span className="text-slate-300">·</span>
          <span className="text-xs text-slate-500">{member.gender}</span>
          {member.packages && (
            <>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-500 truncate">{member.packages}</span>
            </>
          )}
          {member.attendanceId && (
            <>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-blue-500 font-mono">ID:{member.attendanceId}</span>
            </>
          )}
        </div>
      </div>

      {/* Status + Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
          <StatusIcon size={10} />
          {status.label}
        </span>

        {/* Edit button */}
        <button
          onClick={e => { e.stopPropagation(); onEdit(member); }}
          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition opacity-0 group-hover:opacity-100"
          title="Edit member"
        >
          <Edit3 size={14} />
        </button>

        {/* Delete button */}
        <button
          onClick={e => { e.stopPropagation(); onDelete(member); }}
          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition opacity-0 group-hover:opacity-100"
          title="Delete member"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

// ── Delete Confirm Modal ──────────────────────────────────────────────────────
const DeleteModal = ({ member, onConfirm, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center" onClick={e => e.stopPropagation()} style={{animation:'su .2s ease'}}>
      <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Trash2 size={24} className="text-red-600" />
      </div>
      <h3 className="font-bold text-slate-900 text-lg mb-1">Delete Member?</h3>
      <p className="text-slate-500 text-sm mb-5">Are you sure you want to delete <strong>{member?.name}</strong>? This cannot be undone.</p>
      <div className="flex gap-3">
        <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition">Cancel</button>
        <button onClick={onConfirm} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition">Delete</button>
      </div>
    </div>
    <style>{`@keyframes su{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}`}</style>
  </div>
);

// ── Main Members Page ────────────────────────────────────────────────────────
const Members = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all | active | expired | expiring
  const [selectedMember, setSelectedMember] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/v1/fetch`);
      setMembers(res.data.data || []);
    } catch (err) {
      console.error('Error fetching members:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (member) => {
    navigate('/register', { state: { editData: member } });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await axios.post(`http://localhost:5000/api/v1/delete/${deleteTarget._id}`);
      setMembers(prev => prev.filter(m => m._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (err) {
      alert('Delete failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const getStatus = (m) => {
    const now = new Date();
    const end = new Date(m.endDate);
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    if (diff < 0) return 'expired';
    if (diff <= 7) return 'expiring';
    return 'active';
  };

  const filtered = members.filter(m => {
    const matchSearch = m.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.phone?.includes(search) ||
      m.emails?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || getStatus(m) === filter;
    return matchSearch && matchFilter;
  });

  const counts = {
    all: members.length,
    active: members.filter(m => getStatus(m) === 'active').length,
    expiring: members.filter(m => getStatus(m) === 'expiring').length,
    expired: members.filter(m => getStatus(m) === 'expired').length,
  };

  const filterTabs = [
    { key: 'all', label: 'All', color: 'text-slate-700' },
    { key: 'active', label: 'Active', color: 'text-emerald-600' },
    { key: 'expiring', label: 'Expiring', color: 'text-amber-600' },
    { key: 'expired', label: 'Expired', color: 'text-red-600' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Members</h1>
            <p className="text-slate-500 text-sm mt-0.5">{members.length} total registered</p>
          </div>
          <button
            onClick={() => navigate('/register')}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-xl hover:bg-red-700 active:scale-95 transition-all text-sm font-semibold shadow-sm"
          >
            <Plus size={16} />
            Add Member
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, phone or email…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent text-sm shadow-sm"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {filterTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                filter === tab.key
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              }`}
            >
              {tab.label}
              <span className={`text-xs ${filter === tab.key ? 'text-slate-300' : tab.color}`}>{counts[tab.key]}</span>
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 flex items-center gap-4 animate-pulse">
                <div className="w-12 h-12 rounded-full bg-slate-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-slate-200 rounded w-1/3" />
                  <div className="h-3 bg-slate-100 rounded w-1/4" />
                </div>
                <div className="h-6 w-16 bg-slate-100 rounded-full" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <User size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No members found</p>
            <p className="text-sm mt-1">{search ? 'Try a different search' : 'Add your first member'}</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filtered.map(member => (
              <MemberCard key={member._id} member={member} onClick={setSelectedMember} onEdit={handleEdit} onDelete={setDeleteTarget} />
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedMember && (
        <MemberDetailModal member={selectedMember} onClose={() => setSelectedMember(null)} />
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <DeleteModal
          member={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

export default Members;