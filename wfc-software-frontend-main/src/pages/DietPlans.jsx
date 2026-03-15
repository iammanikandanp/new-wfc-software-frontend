import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import {
  Plus, Search, X, Flame, Droplets, Target,
  Apple, ChevronRight, Trash2, Edit3, User
} from 'lucide-react';

const BASE_URL = 'https://wfc-backend-software.onrender.com';

const GOAL_COLORS = {
  'Weight Loss':  { bg: 'bg-blue-50',   text: 'text-blue-700',   dot: 'bg-blue-500',   border: 'border-blue-200' },
  'Muscle Gain':  { bg: 'bg-red-50',    text: 'text-red-700',    dot: 'bg-red-500',    border: 'border-red-200' },
  'Maintenance':  { bg: 'bg-green-50',  text: 'text-green-700',  dot: 'bg-green-500',  border: 'border-green-200' },
  'Endurance':    { bg: 'bg-amber-50',  text: 'text-amber-700',  dot: 'bg-amber-500',  border: 'border-amber-200' },
  'Custom':       { bg: 'bg-violet-50', text: 'text-violet-700', dot: 'bg-violet-500', border: 'border-violet-200' },
};

// Tiny macro donut ring using SVG
const MacroRing = ({ protein = 0, carbs = 0, fats = 0 }) => {
  const total = protein + carbs + fats || 1;
  const r = 22, cx = 26, cy = 26, stroke = 6;
  const circ = 2 * Math.PI * r;
  const pPct = protein / total, cPct = carbs / total, fPct = fats / total;
  const pDash = pPct * circ, cDash = cPct * circ, fDash = fPct * circ;
  const pOffset = 0, cOffset = -pDash, fOffset = -(pDash + cDash);
  return (
    <svg width="52" height="52" viewBox="0 0 52 52">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
      {protein > 0 && <circle cx={cx} cy={cy} r={r} fill="none" stroke="#3b82f6" strokeWidth={stroke}
        strokeDasharray={`${pDash} ${circ - pDash}`} strokeDashoffset={pOffset + circ / 4}
        strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`} />}
      {carbs > 0 && <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f59e0b" strokeWidth={stroke}
        strokeDasharray={`${cDash} ${circ - cDash}`} strokeDashoffset={-pDash + circ / 4}
        strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`} />}
      {fats > 0 && <circle cx={cx} cy={cy} r={r} fill="none" stroke="#ef4444" strokeWidth={stroke}
        strokeDasharray={`${fDash} ${circ - fDash}`} strokeDashoffset={-(pDash + cDash) + circ / 4}
        strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`} />}
      <text x={cx} y={cy + 4} textAnchor="middle" fontSize="9" fontWeight="700" fill="#475569">
        {Math.round(total)}g
      </text>
    </svg>
  );
};

const DietPlanCard = ({ plan, onEdit, onDelete }) => {
  const goal = plan.goal || 'Maintenance';
  const gc = GOAL_COLORS[goal] || GOAL_COLORS['Custom'];
  const totalCals = (plan.breakfast?.calories || 0) + (plan.morningSnack?.calories || 0) +
    (plan.lunch?.calories || 0) + (plan.eveningSnack?.calories || 0) + (plan.dinner?.calories || 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
      {/* Color stripe */}
      <div className={`h-1 ${gc.dot}`} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold text-sm">
              {plan.memberName?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">{plan.memberName || '—'}</p>
              <p className="text-xs text-slate-400">{plan.memberPhone || '—'}</p>
            </div>
          </div>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${gc.bg} ${gc.text} border ${gc.border}`}>
            {goal}
          </span>
        </div>

        {/* Calorie + Water row */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-1.5 bg-orange-50 px-3 py-1.5 rounded-xl">
            <Flame size={14} className="text-orange-500" />
            <span className="text-xs font-bold text-orange-700">{plan.calorieTarget || 0} kcal</span>
          </div>
          <div className="flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-xl">
            <Droplets size={14} className="text-blue-500" />
            <span className="text-xs font-bold text-blue-700">{plan.waterIntake || 3}L water</span>
          </div>
          {plan.weightGoal && (
            <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-xl">
              <Target size={14} className="text-emerald-500" />
              <span className="text-xs font-bold text-emerald-700">{plan.weightGoal} kg</span>
            </div>
          )}
        </div>

        {/* Meals summary */}
        <div className="grid grid-cols-5 gap-1 mb-4">
          {[
            { label: '🌅 Break', meal: plan.breakfast },
            { label: '🍎 AM',    meal: plan.morningSnack },
            { label: '☀️ Lunch', meal: plan.lunch },
            { label: '🍵 PM',    meal: plan.eveningSnack },
            { label: '🌙 Din',   meal: plan.dinner },
          ].map(({ label, meal }) => (
            <div key={label} className="text-center">
              <div className={`rounded-lg py-1 px-1 text-[10px] font-semibold ${meal?.items?.length > 0 ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-400'}`}>
                {label}
              </div>
              <p className="text-[9px] text-slate-400 mt-0.5">{meal?.calories || 0} cal</p>
            </div>
          ))}
        </div>

        {/* Macros ring + stats */}
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl mb-4">
          <MacroRing protein={plan.protein} carbs={plan.carbs} fats={plan.fats} />
          <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
              <span className="text-[10px] text-slate-500">Protein <strong className="text-slate-800">{plan.protein || 0}g</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
              <span className="text-[10px] text-slate-500">Carbs <strong className="text-slate-800">{plan.carbs || 0}g</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
              <span className="text-[10px] text-slate-500">Fats <strong className="text-slate-800">{plan.fats || 0}g</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
              <span className="text-[10px] text-slate-500">Fiber <strong className="text-slate-800">{plan.fiber || 0}g</strong></span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button onClick={() => onEdit(plan)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold hover:bg-slate-700 transition">
            <Edit3 size={13} /> Edit Plan
          </button>
          <button onClick={() => onDelete(plan._id)}
            className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition">
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

const DietPlans = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchPlans(); }, []);

  const fetchPlans = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/v1/reg-diet-plans`);
      if (res.data.success) setPlans(res.data.plans);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this diet plan?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/v1/reg-diet-plans/${id}`);
      setPlans(p => p.filter(x => x._id !== id));
    } catch (e) { alert('Delete failed'); }
  };

  const handleEdit = (plan) => {
    navigate('/diet-plans/new', { state: { editPlan: plan } });
  };

  const filtered = plans.filter(p =>
    p.memberName?.toLowerCase().includes(search.toLowerCase()) ||
    p.goal?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: plans.length,
    avgCalories: plans.length ? Math.round(plans.reduce((s, p) => s + (p.calorieTarget || 0), 0) / plans.length) : 0,
    goals: [...new Set(plans.map(p => p.goal))].length,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-7">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Apple size={24} className="text-green-500" /> Diet Plans
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">Manage member nutrition plans</p>
          </div>
          <button onClick={() => navigate('/diet-plans/new')}
            className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-xl hover:bg-green-700 active:scale-95 transition-all font-semibold text-sm shadow-sm">
            <Plus size={16} /> New Diet Plan
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Active Plans',    value: stats.total,       icon: Apple,    color: 'text-green-600 bg-green-50' },
            { label: 'Avg Calories',    value: `${stats.avgCalories} kcal`, icon: Flame, color: 'text-orange-600 bg-orange-50' },
            { label: 'Unique Goals',    value: stats.goals,       icon: Target,   color: 'text-violet-600 bg-violet-50' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}><Icon size={20} /></div>
              <div><p className="text-xs text-slate-500">{label}</p><p className="text-xl font-bold text-slate-900">{value}</p></div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by member name or goal…"
            className="w-full pl-10 pr-9 py-2.5 border border-slate-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-400 shadow-sm" />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X size={14} className="text-slate-400" /></button>}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 animate-pulse h-64">
                <div className="h-4 bg-slate-200 rounded w-1/2 mb-3" />
                <div className="h-3 bg-slate-100 rounded w-1/3 mb-6" />
                <div className="h-16 bg-slate-100 rounded mb-3" />
                <div className="h-10 bg-slate-100 rounded" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <Apple size={48} className="mx-auto mb-3 opacity-20" />
            <p className="font-semibold">No diet plans yet</p>
            <p className="text-sm mt-1">Create the first one for your members</p>
            <button onClick={() => navigate('/diet-plans/new')}
              className="mt-4 bg-green-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-green-700 transition">
              Create Diet Plan
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(plan => (
              <DietPlanCard key={plan._id} plan={plan} onEdit={handleEdit} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DietPlans;