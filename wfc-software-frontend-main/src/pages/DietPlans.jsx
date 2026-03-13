import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Apple } from 'lucide-react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';

const DietPlans = () => {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const [dietPlans, setDietPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDietPlans();
  }, []);

  const fetchDietPlans = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/v1/diet-plans', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setDietPlans(response.data.dietPlans);
      }
    } catch (error) {
      console.error('Error fetching diet plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await axios.delete(`http://localhost:5000/api/v1/diet-plans/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDietPlans(dietPlans.filter(d => d._id !== id));
      } catch (error) {
        console.error('Error deleting diet plan:', error);
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
              <h1 className='text-3xl font-bold text-slate-900'>Diet Plans</h1>
              <p className='text-slate-600 mt-1'>Manage member diet plans</p>
            </div>
            <button
              onClick={() => navigate('/diet-plans/new')}
              className='flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition'
            >
              <Plus size={20} />
              <span>Create Plan</span>
            </button>
          </div>

          {/* Diet Plans Grid */}
          {loading ? (
            <div className='text-center py-12'>Loading diet plans...</div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {dietPlans.map((plan) => (
                <div key={plan._id} className='bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition'>
                  <div className='flex items-center space-x-3 mb-4'>
                    <div className='bg-green-100 p-3 rounded-lg'>
                      <Apple size={24} className='text-green-600' />
                    </div>
                    <div>
                      <p className='text-sm text-slate-600'>Goal</p>
                      <p className='font-semibold text-slate-900'>{plan.goal || 'Not specified'}</p>
                    </div>
                  </div>

                  <div className='space-y-2 mb-4 text-sm'>
                    <div className='flex justify-between'>
                      <span className='text-slate-600'>Calorie Target:</span>
                      <span className='font-semibold'>{plan.calorieTarget || '-'} kcal</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-slate-600'>Protein:</span>
                      <span className='font-semibold'>{plan.protein || '-'} g</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-slate-600'>Carbs:</span>
                      <span className='font-semibold'>{plan.carbs || '-'} g</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-slate-600'>Fats:</span>
                      <span className='font-semibold'>{plan.fats || '-'} g</span>
                    </div>
                  </div>

                  <div className='flex space-x-2 pt-4 border-t'>
                    <button
                      onClick={() => navigate(`/diet-plans/${plan._id}/edit`)}
                      className='flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition'
                    >
                      <Edit size={16} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(plan._id)}
                      className='flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition'
                    >
                      <Trash2 size={16} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && dietPlans.length === 0 && (
            <div className='text-center py-12 bg-white rounded-lg'>
              <Apple size={48} className='mx-auto text-slate-300 mb-4' />
              <p className='text-slate-500 text-lg'>No diet plans found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DietPlans;
