import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, MoreVertical } from 'lucide-react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';

const Members = () => {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openMenu, setOpenMenu] = useState(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/v1/members', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setMembers(response.data.members);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    if (status === 'overdue') return 'bg-red-100 text-red-800';
    if (status === 'expiring') return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await axios.delete(`http://localhost:5000/api/v1/members/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMembers(members.filter(m => m._id !== id));
      } catch (error) {
        console.error('Error deleting member:', error);
      }
    }
  };

  return (
    <div>
      <Navbar />
      <div className='min-h-screen bg-slate-50'>
        <div className='max-w-7xl mx-auto px-4 py-8'>
          {/* Header */}
          <div className='flex justify-between items-center mb-8'>
            <div>
              <h1 className='text-3xl font-bold text-slate-900'>Members</h1>
              <p className='text-slate-600 mt-1'>Manage gym members</p>
            </div>
            {/* <button
              onClick={() => navigate('/register')}
              className='flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition'
            > */}
            <button
  onClick={() => navigate('/members/new')}
  className='flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition'
>
              <Plus size={20} />
              <span>Add Member</span>
            </button>
          </div>

          {/* Members List */}
          {loading ? (
            <div className='text-center py-12'>Loading members...</div>
          ) : (
            <div className='bg-white rounded-lg shadow-md overflow-hidden'>
              <div className='overflow-x-auto'>
                <table className='w-full'>
                  <thead className='bg-slate-100 border-b'>
                    <tr>
                      <th className='px-6 py-3 text-left text-sm font-semibold text-slate-700'>Name</th>
                      <th className='px-6 py-3 text-left text-sm font-semibold text-slate-700'>Phone</th>
                      <th className='px-6 py-3 text-left text-sm font-semibold text-slate-700'>Plan</th>
                      <th className='px-6 py-3 text-left text-sm font-semibold text-slate-700'>Status</th>
                      <th className='px-6 py-3 text-left text-sm font-semibold text-slate-700'>Expiry</th>
                      <th className='px-6 py-3 text-left text-sm font-semibold text-slate-700'>Actions</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y'>
                    {members.map((member) => (
                      <tr key={member._id} className='hover:bg-slate-50 transition'>
                        <td className='px-6 py-4 text-sm text-slate-900'>{member.userId?.name || 'N/A'}</td>
                        <td className='px-6 py-4 text-sm text-slate-600'>{member.userId?.phone || 'N/A'}</td>
                        <td className='px-6 py-4 text-sm text-slate-600'>{member.currentPlan?.name || 'N/A'}</td>
                        <td className='px-6 py-4'>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(member.displayStatus)}`}>
                            {member.displayStatus?.toUpperCase()}
                          </span>
                        </td>
                        <td className='px-6 py-4 text-sm text-slate-600'>
                          {member.expiryDate ? new Date(member.expiryDate).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className='px-6 py-4 relative'>
                          <button
                            onClick={() => setOpenMenu(openMenu === member._id ? null : member._id)}
                            className='text-slate-600 hover:text-slate-900'
                          >
                            <MoreVertical size={18} />
                          </button>
                          {openMenu === member._id && (
                            <div className='absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 border'>
                              <button
                                onClick={() => navigate(`/members/${member._id}`)}
                                className='w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center space-x-2'
                              >
                                <Eye size={16} />
                                <span>View</span>
                              </button>
                              <button
                                onClick={() => navigate(`/members/${member._id}/edit`)}
                                className='w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center space-x-2'
                              >
                                <Edit size={16} />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => handleDelete(member._id)}
                                className='w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center space-x-2'
                              >
                                <Trash2 size={16} />
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {members.length === 0 && (
                  <div className='text-center py-8 text-slate-500'>
                    No members found. Create your first member!
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Members;
