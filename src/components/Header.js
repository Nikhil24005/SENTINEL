import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../utils/store';
import {
  Menu,
  LogOut,
  Bell,
  AlertCircle,
} from 'lucide-react';

const Header = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const { user, notifications, clearUser } = useStore();

  const handleLogout = () => {
    clearUser();
    navigate('/login');
  };

  const criticalNotifications = notifications.filter(n => 
    n.severity === 'critical' || n.severity === 'high'
  );

  return (
    <header className="bg-gray-900 border-b border-gray-700 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-gray-800 rounded-lg transition"
        >
          <Menu size={24} className="text-gray-300" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
            <AlertCircle size={18} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">SENTINEL</h1>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative">
          <button className="relative p-2 hover:bg-gray-800 rounded-lg transition">
            <Bell size={20} className="text-gray-300" />
            {criticalNotifications.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                {Math.min(criticalNotifications.length, 9)}
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-3 pl-6 border-l border-gray-700">
          {user && (
            <>
              <div>
                <p className="text-sm font-medium text-white">{user.name}</p>
                <p className="text-xs text-gray-400 capitalize">{user.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-red-900 rounded-lg transition text-gray-300 hover:text-red-400"
              >
                <LogOut size={18} />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
