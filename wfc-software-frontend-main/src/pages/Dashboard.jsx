import React, { useState, useEffect } from 'react';
import { Users, CreditCard, AlertCircle, TrendingUp, Dumbbell } from 'lucide-react';
import axios from 'axios';
import Navbar from '../components/Navbar';

const Dashboard = () => {
  const token = localStorage.getItem('token');
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    pendingPaymentMembers: 0,
    expiringMembers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setError(null);
      const response = await axios.get('http://localhost:5000/api/v1/members/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setStats(response.data.statistics);
      } else {
        setError('Failed to fetch statistics');
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setError('Unable to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const getIconColor = (color) => {
    const colorMap = {
      'border-blue-500': 'text-blue-500',
      'border-green-500': 'text-green-500',
      'border-yellow-500': 'text-yellow-500',
      'border-red-500': 'text-red-500',
    };
    return colorMap[color] || 'text-slate-500';
  };

  const StatCard = ({ icon: Icon, title, value, color, loading = false }) => {
    // Validate required props
    if (!title || !color) {
      console.warn('StatCard: title and color props are required');
      return null;
    }

    // Use a fallback icon if Icon is not provided or invalid
    const IconComponent = Icon || Dumbbell; // Dumbbell as fallback

    return (
      <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${color} hover:scale-105 transition-transform duration-200`}>
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-slate-600 text-sm font-medium'>{title}</p>
            <p className='text-3xl font-bold text-slate-900 mt-2'>
              {loading ? '...' : (value ?? 0)}
            </p>
          </div>
          <IconComponent size={40} className={getIconColor(color)} />
        </div>
      </div>
    );
  };

  return (
    <div>
      <Navbar />
      <div className='min-h-screen bg-slate-50'>
        <div className='max-w-7xl mx-auto px-4 py-8'>
          {/* Header */}
          <div className='mb-8'>
            <h1 className='text-4xl font-bold text-slate-900'>Dashboard</h1>
            <p className='text-slate-600 mt-2'>Welcome to WFC Wolverine Fitness Club Management System</p>
          </div>

          {/* Stats Grid */}
          {loading ? (
            <div className='text-center py-12'>Loading...</div>
          ) : error ? (
            <div className='text-center py-12'>
              <p className='text-red-600 mb-4'>{error}</p>
              <button
                onClick={fetchStatistics}
                className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'
              >
                Retry
              </button>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
              <StatCard
                icon={Users}
                title='Total Members'
                value={stats.totalMembers}
                color='border-blue-500'
                loading={loading}
              />
              <StatCard
                icon={TrendingUp}
                title='Active Members'
                value={stats.activeMembers}
                color='border-green-500'
                loading={loading}
              />
              <StatCard
                icon={AlertCircle}
                title='Pending Payments'
                value={stats.pendingPaymentMembers}
                color='border-yellow-500'
                loading={loading}
              />
              <StatCard
                icon={CreditCard}
                title='Expiring Soon'
                value={stats.expiringMembers}
                color='border-red-500'
                loading={loading}
              />
            </div>
          )}

          {/* Quick Actions */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='bg-white rounded-lg shadow-md p-6'>
              <h2 className='text-xl font-bold text-slate-900 mb-4'>Quick Actions</h2>
              <div className='space-y-3'>
                <a href='/members' className='block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition'>
                  View All Members
                </a>
                <a href='/payments' className='block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition'>
                  View Payments
                </a>
                <a href='/attendance' className='block px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition'>
                  Mark Attendance
                </a>
              </div>
            </div>

            <div className='bg-white rounded-lg shadow-md p-6'>
              <h2 className='text-xl font-bold text-slate-900 mb-4'>Latest Updates</h2>
              <div className='space-y-2 text-sm'>
                <p className='text-slate-600'>✓ System is running smoothly</p>
                <p className='text-slate-600'>✓ All members synced</p>
                <p className='text-slate-600'>✓ Database connected</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
