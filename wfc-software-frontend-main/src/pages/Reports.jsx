import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, DollarSign } from 'lucide-react';
import axios from 'axios';
import Navbar from '../components/Navbar';

const Reports = () => {
  const token = localStorage.getItem('token');
  const [revenueData, setRevenueData] = useState(null);
  const [members, setMembers] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const [revenueRes, membersRes] = await Promise.all([
        axios.get('http://localhost:5000/api/v1/payments/revenue/summary', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get('http://localhost:5000/api/v1/members', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (revenueRes.data.success) {
        setRevenueData(revenueRes.data.summary);
      }
      if (membersRes.data.success) {
        setMembers(membersRes.data.members);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className='min-h-screen bg-slate-50'>
        <div className='max-w-7xl mx-auto px-4 py-8'>
          {/* Header */}
          <div className='mb-8'>
            <h1 className='text-3xl font-bold text-slate-900'>Reports & Analytics</h1>
            <p className='text-slate-600 mt-1'>View detailed gym analytics and reports</p>
          </div>

          {loading ? (
            <div className='text-center py-12'>Loading reports...</div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
                <div className='bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-slate-600 text-sm'>Total Revenue</p>
                      <p className='text-2xl font-bold text-slate-900 mt-1'>
                        ₹{revenueData?.overall?.totalRevenue?.toLocaleString()}
                      </p>
                    </div>
                    <DollarSign className='text-green-500' size={40} />
                  </div>
                </div>

                <div className='bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-slate-600 text-sm'>Total Members</p>
                      <p className='text-2xl font-bold text-slate-900 mt-1'>
                        {members?.length || 0}
                      </p>
                    </div>
                    <Users className='text-blue-500' size={40} />
                  </div>
                </div>

                <div className='bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-slate-600 text-sm'>Total Payments</p>
                      <p className='text-2xl font-bold text-slate-900 mt-1'>
                        {revenueData?.overall?.totalPayments || 0}
                      </p>
                    </div>
                    <TrendingUp className='text-purple-500' size={40} />
                  </div>
                </div>

                <div className='bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-slate-600 text-sm'>Avg Payment</p>
                      <p className='text-2xl font-bold text-slate-900 mt-1'>
                        ₹{Math.round(revenueData?.overall?.avgPayment || 0).toLocaleString()}
                      </p>
                    </div>
                    <BarChart3 className='text-orange-500' size={40} />
                  </div>
                </div>
              </div>

              {/* Payment by Mode */}
              {revenueData?.byMode && revenueData.byMode.length > 0 && (
                <div className='bg-white rounded-lg shadow-md p-6 mb-8'>
                  <h2 className='text-xl font-bold text-slate-900 mb-4'>Payment Methods</h2>
                  <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                    {revenueData.byMode.map((mode) => (
                      <div key={mode._id} className='p-4 border rounded-lg'>
                        <p className='text-slate-600 text-sm capitalize'>{mode._id}</p>
                        <p className='text-2xl font-bold text-slate-900'>₹{mode.total.toLocaleString()}</p>
                        <p className='text-xs text-slate-500 mt-1'>{mode.count} payments</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Member Status */}
              {members && (
                <div className='bg-white rounded-lg shadow-md p-6 mb-8'>
                  <h2 className='text-xl font-bold text-slate-900 mb-4'>Member Status</h2>
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    <div className='p-4 border-l-4 border-green-500 bg-green-50 rounded'>
                      <p className='text-slate-600 text-sm'>Active Members</p>
                      <p className='text-2xl font-bold text-green-600'>
                        {members.filter(m => m.status === 'active').length}
                      </p>
                    </div>
                    <div className='p-4 border-l-4 border-yellow-500 bg-yellow-50 rounded'>
                      <p className='text-slate-600 text-sm'>Expiring Soon</p>
                      <p className='text-2xl font-bold text-yellow-600'>
                        {members.filter(m => m.isExpiringSoon).length}
                      </p>
                    </div>
                    <div className='p-4 border-l-4 border-red-500 bg-red-50 rounded'>
                      <p className='text-slate-600 text-sm'>Overdue</p>
                      <p className='text-2xl font-bold text-red-600'>
                        {members.filter(m => m.isOverdue).length}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
