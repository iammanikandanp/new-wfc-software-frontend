import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import axios from 'axios';
import Navbar from '../components/Navbar';

const Attendance = () => {
  const token = localStorage.getItem('token');
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchAttendance();
  }, [date]);

  const fetchAttendance = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/v1/attendance/daily?date=${date}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data.success) {
        setAttendance(response.data.attendance);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDurationMinutes = (checkIn, checkOut) => {
    if (!checkOut) return 'Still in gym';
    const diff = new Date(checkOut) - new Date(checkIn);
    return `${Math.floor(diff / 1000 / 60)} mins`;
  };

  return (
    <div>
      <Navbar />
      <div className='min-h-screen bg-slate-50'>
        <div className='max-w-7xl mx-auto px-4 py-8'>
          {/* Header */}
          <div className='mb-8'>
            <h1 className='text-3xl font-bold text-slate-900'>Attendance</h1>
            <p className='text-slate-600 mt-1'>Track daily gym attendance</p>
          </div>

          {/* Date Filter and Stats */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
            <div className='bg-white rounded-lg shadow-md p-6'>
              <label className='block text-sm font-medium text-slate-700 mb-2'>
                Select Date
              </label>
              <input
                type='date'
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className='w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500'
              />
            </div>
            <div className='bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500'>
              <p className='text-slate-600 text-sm font-medium'>Members Present</p>
              <p className='text-3xl font-bold text-slate-900 mt-2'>{attendance.length}</p>
            </div>
            <div className='bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500'>
              <p className='text-slate-600 text-sm font-medium'>Avg Duration</p>
              <p className='text-3xl font-bold text-slate-900 mt-2'>
                {attendance.length > 0
                  ? `${Math.round(
                    attendance.reduce((acc, a) => acc + (a.duration || 0), 0) / attendance.length
                  )} mins`
                  : '-'}
              </p>
            </div>
          </div>

          {/* Attendance List */}
          {loading ? (
            <div className='text-center py-12'>Loading attendance...</div>
          ) : (
            <div className='bg-white rounded-lg shadow-md overflow-hidden'>
              <div className='overflow-x-auto'>
                <table className='w-full'>
                  <thead className='bg-slate-100 border-b'>
                    <tr>
                      <th className='px-6 py-3 text-left text-sm font-semibold text-slate-700'>Member</th>
                      <th className='px-6 py-3 text-left text-sm font-semibold text-slate-700'>Check-In</th>
                      <th className='px-6 py-3 text-left text-sm font-semibold text-slate-700'>Check-Out</th>
                      <th className='px-6 py-3 text-left text-sm font-semibold text-slate-700'>Duration</th>
                      <th className='px-6 py-3 text-left text-sm font-semibold text-slate-700'>Method</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y'>
                    {attendance.map((record) => (
                      <tr key={record._id} className='hover:bg-slate-50 transition'>
                        <td className='px-6 py-4 text-sm text-slate-900'>
                          {record.memberId?.userId?.name || 'N/A'}
                        </td>
                        <td className='px-6 py-4 text-sm text-slate-600'>
                          {new Date(record.checkInTime).toLocaleTimeString()}
                        </td>
                        <td className='px-6 py-4 text-sm text-slate-600'>
                          {record.checkOutTime
                            ? new Date(record.checkOutTime).toLocaleTimeString()
                            : 'In Gym'}
                        </td>
                        <td className='px-6 py-4 text-sm font-semibold text-blue-600'>
                          {getDurationMinutes(record.checkInTime, record.checkOutTime)}
                        </td>
                        <td className='px-6 py-4 text-sm'>
                          <span className='px-3 py-1 bg-slate-100 text-slate-800 rounded-full text-xs font-semibold'>
                            {record.checkInMethod?.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {attendance.length === 0 && (
                  <div className='text-center py-8 text-slate-500'>
                    No attendance records for this date.
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

export default Attendance;
