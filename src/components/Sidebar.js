import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  AlertTriangle,
  Radio,
  Zap,
  BarChart3,
  HelpCircle,
  Settings,
  X,
} from 'lucide-react';
import { useStore } from '../utils/store';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const { user } = useStore();

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/incidents', label: 'Incidents', icon: AlertTriangle },
    { path: '/responder', label: 'Responder', icon: Radio },
    { path: '/drills', label: 'Drills', icon: Zap },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/help/zone-1', label: 'Help', icon: HelpCircle },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-gray-900 border-r border-gray-700 z-50 lg:z-auto transform transition-transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static`}
      >
        <div className="p-6 flex justify-between items-center">
          <h2 className="text-lg font-bold text-white">Menu</h2>
          <button onClick={toggleSidebar} className="lg:hidden text-gray-300">
            <X size={20} />
          </button>
        </div>

        <nav className="px-3 space-y-2">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              onClick={() => toggleSidebar()}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                isActive(path)
                  ? 'bg-red-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        {user && user.role === 'admin' && (
          <div className="mt-6 px-3 border-t border-gray-700 pt-6">
            <div className="flex items-center gap-3 px-4 py-3 bg-gray-800 rounded-lg">
              <Settings size={20} className="text-gray-400" />
              <span className="text-gray-300 text-sm">Admin Mode</span>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
