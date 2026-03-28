import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import {
  Plus, Search, X, User,
  AlertCircle, CheckCircle, Clock, XCircle, Eye, Edit3, Trash2
} from 'lucide-react';

const getMembershipStatus = (endDate) => {
  if (!endDate) return { label: 'Unknown', color: 'bg-slate-100 text-slate-500', dot: 'bg-slate-400', icon: AlertCircle };
  const diffDays = Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0)  return { label: 'Expired',             color: 'bg-red-100 text-red-700',     dot: 'bg-red-500',     icon: XCircle };
  if (diffDays <= 7) return { label: `Expires in ${diffDays}d`, color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500', icon: Clock };
  return                    { label: 'Active',               color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500', icon: CheckCircle };
};

const Avatar = ({ src, name, size = 'md' }) => {
  const [err, setErr] = useState(false);
  const sizeClass = size === 'sm' ? 'w-9 h-9 text-sm' : 'w-12 h-12 text-base';
  const initials  = name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '?';
  const colors    = ['bg-red-500','bg-blue-500','bg-violet-500','bg-amber-500','bg-emerald-500','bg-pink-500'];
  const color     = colors[(name?.charCodeAt(0) || 0) % colors.length];
  if (src && !err)
    return <img src={src} alt={name} onError={() => setErr(true)} className={`${sizeClass} rounded-full object-cover ring-2 ring-white shadow`} />;
  return <div className={`${sizeClass} ${color} rounded-full flex items-center justify-center text-white font-bold ring-2 ring-white shadow`}>{initials}</div>;
};

/* ── Member Card ── clicking anywhere navigates to /members/:id ── */
const MemberCard = ({ member, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const status = getMembershipStatus(member.endDate);
  const StatusIcon = status.icon;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex items-center gap-4 hover:shadow-md hover:border-slate-200 transition-all duration-200 group">

      {/* Avatar */}
      <div className="relative flex-shrink-0 cursor-pointer" onClick={() => navigate(`/members/${member._id}`)}>
        <Avatar src={member.images?.profileImage} name={member.name} />
        <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${status.dot}`} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/members/${member._id}`)}>
        <p className="font-semibold text-slate-900 truncate group-hover:text-red-600 transition-colors">{member.name}</p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-xs text-slate-500">{member.age} yrs</span>
          <span className="text-slate-300">·</span>
          <span className="text-xs text-slate-500">{member.gender}</span>
          {member.packages && <><span className="text-slate-300">·</span><span className="text-xs text-slate-500 truncate">{member.packages}</span></>}
          {member.attendanceId && <><span className="text-slate-300">·</span><span className="text-xs text-blue-500 font-mono">ID:{member.attendanceId}</span></>}
        </div>
      </div>

      {/* Status + Action buttons */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
          <StatusIcon size={10} />{status.label}
        </span>

        {/* View profile */}
        <button onClick={() => navigate(`/members/${member._id}`)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition opacity-0 group-hover:opacity-100" title="View profile">
          <Eye size={14} />
        </button>

        {/* Edit */}
        <button onClick={e => { e.stopPropagation(); onEdit(member); }}
          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition opacity-0 group-hover:opacity-100" title="Edit member">
          <Edit3 size={14} />
        </button>

        {/* Delete */}
        <button onClick={e => { e.stopPropagation(); onDelete(member); }}
          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition opacity-0 group-hover:opacity-100" title="Delete member">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

/* ── Delete Modal ── */
const DeleteModal = ({ member, onConfirm, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center" onClick={e => e.stopPropagation()}>
      <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 size={24} className="text-red-600" /></div>
      <h3 className="font-bold text-slate-900 text-lg mb-1">Delete Member?</h3>
      <p className="text-slate-500 text-sm mb-5">Are you sure you want to delete <strong>{member?.name}</strong>? This cannot be undone.</p>
      <div className="flex gap-3">
        <button onClick={onClose}   className="flex-1 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition">Cancel</button>
        <button onClick={onConfirm} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition">Delete</button>
      </div>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════
   MAIN Members Page
══════════════════════════════════════════════════════ */
const Members = () => {
  const navigate = useNavigate();
  const [members,     setMembers]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [filter,      setFilter]      = useState('all');
  const [deleteTarget,setDeleteTarget]= useState(null);

  useEffect(() => { fetchMembers(); }, []);

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

  const handleEdit = (member) => navigate('/register', { state: { editData: member } });

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
    const diff = Math.ceil((new Date(m.endDate) - new Date()) / 86400000);
    if (diff < 0)  return 'expired';
    if (diff <= 7) return 'expiring';
    return 'active';
  };

  const filtered = members.filter(m => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      m.name?.toLowerCase().includes(q) ||
      m.phone?.includes(q) ||
      m.emails?.toLowerCase().includes(q);
    const matchFilter = filter === 'all' || getStatus(m) === filter;
    return matchSearch && matchFilter;
  });

  const counts = {
    all:      members.length,
    active:   members.filter(m => getStatus(m) === 'active').length,
    expiring: members.filter(m => getStatus(m) === 'expiring').length,
    expired:  members.filter(m => getStatus(m) === 'expired').length,
  };

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
          <button onClick={() => navigate('/register')}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-xl hover:bg-red-700 active:scale-95 transition-all text-sm font-semibold shadow-sm">
            <Plus size={16} /> Add Member
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, phone or email…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-red-400 text-sm shadow-sm" />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X size={14} className="text-slate-400" /></button>}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {[
            { key:'all',      label:'All',      color:'text-slate-700'  },
            { key:'active',   label:'Active',   color:'text-emerald-600'},
            { key:'expiring', label:'Expiring', color:'text-amber-600'  },
            { key:'expired',  label:'Expired',  color:'text-red-600'    },
          ].map(tab => (
            <button key={tab.key} onClick={() => setFilter(tab.key)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                filter === tab.key ? 'bg-slate-900 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              }`}>
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
              <MemberCard key={member._id} member={member} onEdit={handleEdit} onDelete={setDeleteTarget} />
            ))}
          </div>
        )}
      </div>

      {deleteTarget && (
        <DeleteModal member={deleteTarget} onConfirm={handleDeleteConfirm} onClose={() => setDeleteTarget(null)} />
      )}
    </div>
  );
};

export default Members;