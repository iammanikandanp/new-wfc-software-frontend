import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';

const AddDietPlan = () => {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    memberId: '',
    goal: '',
    calorieTarget: '',
    weightGoal: '',
    breakfast: {
      items: '',
      calories: '',
      time: '08:00 AM',
    },
    lunch: {
      items: '',
      calories: '',
      time: '01:00 PM',
    },
    dinner: {
      items: '',
      calories: '',
      time: '07:00 PM',
    },
    snacks: {
      items: '',
      calories: '',
      time: '04:00 PM',
    },
    protein: '',
    carbs: '',
    fats: '',
    fiber: '',
    notes: '',
  });

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
      setError('Failed to fetch members');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMealChange = (meal, field, value) => {
    setFormData(prev => ({
      ...prev,
      [meal]: {
        ...prev[meal],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Convert items strings to arrays
      const data = {
        ...formData,
        breakfast: {
          ...formData.breakfast,
          items: formData.breakfast.items.split(',').map(s => s.trim()).filter(s => s),
        },
        lunch: {
          ...formData.lunch,
          items: formData.lunch.items.split(',').map(s => s.trim()).filter(s => s),
        },
        dinner: {
          ...formData.dinner,
          items: formData.dinner.items.split(',').map(s => s.trim()).filter(s => s),
        },
        snacks: {
          ...formData.snacks,
          items: formData.snacks.items.split(',').map(s => s.trim()).filter(s => s),
        },
      };

      const response = await axios.post(
        'http://localhost:5000/api/v1/diet-plans',
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert('Diet plan created successfully!');
        navigate('/diet-plans');
      }
    } catch (error) {
      console.error('Error creating diet plan:', error);
      setError(error.response?.data?.message || 'Failed to create diet plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className='min-h-screen bg-slate-50'>
        <div className='max-w-4xl mx-auto px-4 py-8'>
          {/* Header */}
          <div className='flex items-center space-x-3 mb-8'>
            <button
              onClick={() => navigate('/diet-plans')}
              className='p-2 hover:bg-slate-200 rounded-lg transition'
            >
              <ArrowLeft size={20} className='text-slate-700' />
            </button>
            <div>
              <h1 className='text-3xl font-bold text-slate-900'>Create Diet Plan</h1>
              <p className='text-slate-600 mt-1'>Design a personalized diet plan</p>
            </div>
          </div>

          {/* Form */}
          <div className='bg-white rounded-lg shadow-md p-8'>
            {error && (
              <div className='mb-6 p-4 bg-red-100 text-red-700 rounded-lg'>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className='space-y-6'>
              {/* Basic Information */}
              <div>
                <h2 className='text-xl font-semibold text-slate-900 mb-4'>Basic Information</h2>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-slate-700 mb-2'>
                      Select Member *
                    </label>
                    <select
                      name='memberId'
                      value={formData.memberId}
                      onChange={handleChange}
                      required
                      className='w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500'
                    >
                      <option value=''>Choose a member</option>
                      {members.map(member => (
                        <option key={member._id} value={member._id}>
                          {member.userId?.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-slate-700 mb-2'>
                      Goal *
                    </label>
                    <select
                      name='goal'
                      value={formData.goal}
                      onChange={handleChange}
                      required
                      className='w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500'
                    >
                      <option value=''>Select goal</option>
                      <option>Weight Loss</option>
                      <option>Muscle Gain</option>
                      <option>Maintenance</option>
                    </select>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-slate-700 mb-2'>
                      Calorie Target *
                    </label>
                    <input
                      type='number'
                      name='calorieTarget'
                      value={formData.calorieTarget}
                      onChange={handleChange}
                      required
                      className='w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500'
                      placeholder='2000'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-slate-700 mb-2'>
                      Weight Goal (kg)
                    </label>
                    <input
                      type='number'
                      name='weightGoal'
                      value={formData.weightGoal}
                      onChange={handleChange}
                      className='w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500'
                      placeholder='70'
                    />
                  </div>
                </div>
              </div>

              {/* Meals */}
              <div>
                <h2 className='text-xl font-semibold text-slate-900 mb-4'>Meal Plan</h2>
                
                {/* Breakfast */}
                <div className='mb-6 p-4 border border-slate-200 rounded-lg'>
                  <h3 className='font-semibold text-slate-900 mb-3'>Breakfast</h3>
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-slate-700 mb-2'>
                        Items (comma-separated)
                      </label>
                      <input
                        type='text'
                        value={formData.breakfast.items}
                        onChange={(e) => handleMealChange('breakfast', 'items', e.target.value)}
                        className='w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500'
                        placeholder='Oatmeal, Eggs, Milk'
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-slate-700 mb-2'>
                        Calories
                      </label>
                      <input
                        type='number'
                        value={formData.breakfast.calories}
                        onChange={(e) => handleMealChange('breakfast', 'calories', e.target.value)}
                        className='w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500'
                        placeholder='400'
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-slate-700 mb-2'>
                        Time
                      </label>
                      <input
                        type='time'
                        value={formData.breakfast.time}
                        onChange={(e) => handleMealChange('breakfast', 'time', e.target.value)}
                        className='w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500'
                      />
                    </div>
                  </div>
                </div>

                {/* Lunch */}
                <div className='mb-6 p-4 border border-slate-200 rounded-lg'>
                  <h3 className='font-semibold text-slate-900 mb-3'>Lunch</h3>
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-slate-700 mb-2'>
                        Items (comma-separated)
                      </label>
                      <input
                        type='text'
                        value={formData.lunch.items}
                        onChange={(e) => handleMealChange('lunch', 'items', e.target.value)}
                        className='w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500'
                        placeholder='Chicken, Rice, Vegetables'
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-slate-700 mb-2'>
                        Calories
                      </label>
                      <input
                        type='number'
                        value={formData.lunch.calories}
                        onChange={(e) => handleMealChange('lunch', 'calories', e.target.value)}
                        className='w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500'
                        placeholder='700'
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-slate-700 mb-2'>
                        Time
                      </label>
                      <input
                        type='time'
                        value={formData.lunch.time}
                        onChange={(e) => handleMealChange('lunch', 'time', e.target.value)}
                        className='w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500'
                      />
                    </div>
                  </div>
                </div>

                {/* Dinner */}
                <div className='mb-6 p-4 border border-slate-200 rounded-lg'>
                  <h3 className='font-semibold text-slate-900 mb-3'>Dinner</h3>
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-slate-700 mb-2'>
                        Items (comma-separated)
                      </label>
                      <input
                        type='text'
                        value={formData.dinner.items}
                        onChange={(e) => handleMealChange('dinner', 'items', e.target.value)}
                        className='w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500'
                        placeholder='Fish, Salad, Bread'
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-slate-700 mb-2'>
                        Calories
                      </label>
                      <input
                        type='number'
                        value={formData.dinner.calories}
                        onChange={(e) => handleMealChange('dinner', 'calories', e.target.value)}
                        className='w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500'
                        placeholder='600'
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-slate-700 mb-2'>
                        Time
                      </label>
                      <input
                        type='time'
                        value={formData.dinner.time}
                        onChange={(e) => handleMealChange('dinner', 'time', e.target.value)}
                        className='w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500'
                      />
                    </div>
                  </div>
                </div>

                {/* Snacks */}
                <div className='mb-6 p-4 border border-slate-200 rounded-lg'>
                  <h3 className='font-semibold text-slate-900 mb-3'>Snacks</h3>
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-slate-700 mb-2'>
                        Items (comma-separated)
                      </label>
                      <input
                        type='text'
                        value={formData.snacks.items}
                        onChange={(e) => handleMealChange('snacks', 'items', e.target.value)}
                        className='w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500'
                        placeholder='Fruits, Nuts, Yogurt'
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-slate-700 mb-2'>
                        Calories
                      </label>
                      <input
                        type='number'
                        value={formData.snacks.calories}
                        onChange={(e) => handleMealChange('snacks', 'calories', e.target.value)}
                        className='w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500'
                        placeholder='300'
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-slate-700 mb-2'>
                        Time
                      </label>
                      <input
                        type='time'
                        value={formData.snacks.time}
                        onChange={(e) => handleMealChange('snacks', 'time', e.target.value)}
                        className='w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500'
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Macros */}
              <div>
                <h2 className='text-xl font-semibold text-slate-900 mb-4'>Macronutrients</h2>
                <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-slate-700 mb-2'>
                      Protein (g)
                    </label>
                    <input
                      type='number'
                      name='protein'
                      value={formData.protein}
                      onChange={handleChange}
                      className='w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500'
                      placeholder='150'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-slate-700 mb-2'>
                      Carbs (g)
                    </label>
                    <input
                      type='number'
                      name='carbs'
                      value={formData.carbs}
                      onChange={handleChange}
                      className='w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500'
                      placeholder='200'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-slate-700 mb-2'>
                      Fats (g)
                    </label>
                    <input
                      type='number'
                      name='fats'
                      value={formData.fats}
                      onChange={handleChange}
                      className='w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500'
                      placeholder='60'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-slate-700 mb-2'>
                      Fiber (g)
                    </label>
                    <input
                      type='number'
                      name='fiber'
                      value={formData.fiber}
                      onChange={handleChange}
                      className='w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500'
                      placeholder='30'
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className='block text-sm font-medium text-slate-700 mb-2'>
                  Additional Notes
                </label>
                <textarea
                  name='notes'
                  value={formData.notes}
                  onChange={handleChange}
                  className='w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500'
                  placeholder='Any additional notes or restrictions...'
                  rows='4'
                />
              </div>

              {/* Actions */}
              <div className='flex space-x-4 pt-6 border-t'>
                <button
                  type='submit'
                  disabled={loading}
                  className='flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50'
                >
                  {loading ? 'Creating...' : 'Create Diet Plan'}
                </button>
                <button
                  type='button'
                  onClick={() => navigate('/diet-plans')}
                  className='flex-1 bg-slate-300 text-slate-900 py-2 rounded-lg hover:bg-slate-400 transition'
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddDietPlan;
