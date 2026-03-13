import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User, Home, Users, CreditCard, Apple, Dumbbell, Calendar, FileText, Info } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Members', path: '/members', icon: Users },
    { name: 'Payments', path: '/payments', icon: CreditCard },
    { name: 'Diet Plans', path: '/diet-plans', icon: Apple },
    { name: 'Training', path: '/training', icon: Dumbbell },
    { name: 'Attendance', path: '/attendance', icon: Calendar },
    { name: 'Reports', path: '/reports', icon: FileText },
    { name: 'About', path: '/about', icon: Info },
  ];

  return (
    <nav className='bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg sticky top-0 z-50'>
      <div className='max-w-7xl mx-auto px-4'>
        <div className='flex justify-between items-center h-16'>
          {/* Logo */}
          <Link to='/dashboard' className='flex items-center space-x-2 font-bold text-xl'>
            <div className='bg-red-600 p-2 rounded'>💪</div>
            <span>WFC Fitness</span>
          </Link>

          {/* Desktop Menu */}
          <div className='hidden md:flex items-center space-x-1'>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className='px-3 py-2 rounded text-sm font-medium hover:bg-slate-700 transition'
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className='hidden md:flex items-center space-x-4'>
            {user && (
              <>
                <span className='text-sm'>{user.name}</span>
                <button
                  onClick={handleLogout}
                  className='flex items-center space-x-1 px-3 py-2 bg-red-600 rounded hover:bg-red-700 transition'
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className='md:hidden'
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className='md:hidden pb-4 space-y-2'>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className='block px-3 py-2 rounded hover:bg-slate-700 transition'
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className='w-full text-left px-3 py-2 bg-red-600 rounded hover:bg-red-700 transition mt-4'
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
