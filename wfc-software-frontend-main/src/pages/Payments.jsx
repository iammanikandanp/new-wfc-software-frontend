import React, { useState, useEffect } from 'react';
import { DollarSign, Calendar, CreditCard, Printer, Download, Share2 } from 'lucide-react';
import axios from 'axios';
import Navbar from '../components/Navbar';

const Payments = () => {
  const token = localStorage.getItem('token');
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState(null);

  useEffect(() => {
    fetchPayments();
    fetchRevenue();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/v1/payments', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setPayments(response.data.payments);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRevenue = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/v1/payments/revenue/summary', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setRevenueData(response.data.summary);
      }
    } catch (error) {
      console.error('Error fetching revenue:', error);
    }
  };

  const getPaymentModeColor = (mode) => {
    const colors = {
      cash: 'bg-green-100 text-green-800',
      card: 'bg-blue-100 text-blue-800',
      upi: 'bg-purple-100 text-purple-800',
      online: 'bg-indigo-100 text-indigo-800',
    };
    return colors[mode] || 'bg-slate-100 text-slate-800';
  };

  return (
    <div>
      <Navbar />
      <div className='min-h-screen bg-slate-50'>
        <div className='max-w-7xl mx-auto px-4 py-8'>
          {/* Header */}
          <div className='mb-8'>
            <h1 className='text-3xl font-bold text-slate-900'>Payments & Revenue</h1>
            <p className='text-slate-600 mt-1'>Track gym payments and revenue</p>
          </div>

          {/* Revenue Cards */}
          {revenueData && (
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
              <div className='bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500'>
                <p className='text-slate-600 text-sm font-medium'>Total Revenue</p>
                <p className='text-3xl font-bold text-slate-900 mt-2'>
                  ₹{revenueData.overall?.totalRevenue?.toLocaleString() || 0}
                </p>
              </div>
              <div className='bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500'>
                <p className='text-slate-600 text-sm font-medium'>Total Payments</p>
                <p className='text-3xl font-bold text-slate-900 mt-2'>
                  {revenueData.overall?.totalPayments || 0}
                </p>
              </div>
              <div className='bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500'>
                <p className='text-slate-600 text-sm font-medium'>Average Payment</p>
                <p className='text-3xl font-bold text-slate-900 mt-2'>
                  ₹{Math.round(revenueData.overall?.avgPayment || 0).toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {/* Payments Table */}
          {loading ? (
            <div className='text-center py-12'>Loading payments...</div>
          ) : (
            <div className='bg-white rounded-lg shadow-md overflow-hidden'>
              <div className='overflow-x-auto'>
                <table className='w-full'>
                  <thead className='bg-slate-100 border-b'>
                    <tr>
                      <th className='px-6 py-3 text-left text-sm font-semibold text-slate-700'>Invoice #</th>
                      <th className='px-6 py-3 text-left text-sm font-semibold text-slate-700'>Member</th>
                      <th className='px-6 py-3 text-left text-sm font-semibold text-slate-700'>Plan</th>
                      <th className='px-6 py-3 text-left text-sm font-semibold text-slate-700'>Amount</th>
                      <th className='px-6 py-3 text-left text-sm font-semibold text-slate-700'>Mode</th>
                      <th className='px-6 py-3 text-left text-sm font-semibold text-slate-700'>Date</th>
                      <th className='px-6 py-3 text-left text-sm font-semibold text-slate-700'>Action</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y'>
                    {payments.map((payment) => (
                      <tr key={payment._id} className='hover:bg-slate-50 transition'>
                        <td className='px-6 py-4 text-sm font-mono text-slate-900'>{payment.invoiceNumber}</td>
                        <td className='px-6 py-4 text-sm text-slate-600'>{payment.memberId?.userId?.name || 'N/A'}</td>
                        <td className='px-6 py-4 text-sm text-slate-600'>{payment.planId?.name || 'N/A'}</td>
                        <td className='px-6 py-4 text-sm font-semibold text-green-600'>₹{payment.amount?.toLocaleString()}</td>
                        <td className='px-6 py-4'>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPaymentModeColor(payment.paymentMode)}`}>
                            {payment.paymentMode?.toUpperCase()}
                          </span>
                        </td>
                        <td className='px-6 py-4 text-sm text-slate-600'>
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </td>
                        <td className='px-6 py-4 text-sm'>
                          <button className='text-blue-600 hover:text-blue-700 flex items-center space-x-1'>
                            <Download size={16} />
                            <span>Invoice</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {payments.length === 0 && (
                  <div className='text-center py-8 text-slate-500'>
                    No payments recorded yet.
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

export default Payments;
