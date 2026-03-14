import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, Info, Archive, Home, Cloud } from 'lucide-react';
import { APP_NAME } from '../constants';

interface NavbarProps {
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onLogout }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/archive', icon: Archive, label: 'Archive' },
    { path: '/about', icon: Info, label: 'About' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/50 backdrop-blur-md border-b border-slate-200 px-4 h-16 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-lg shadow-indigo-500/30">
          <Cloud size={24} />
        </div>
        <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent hidden sm:inline">
          {APP_NAME}
        </span>
      </div>

      <div className="flex items-center gap-1 sm:gap-4">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`p-2 rounded-lg transition-colors flex items-center gap-2 group ${
              location.pathname === item.path
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <item.icon size={20} />
            <span className="hidden md:inline font-medium">{item.label}</span>
          </Link>
        ))}

        <div className="h-6 w-px bg-slate-200 mx-1"></div>

        <button
          onClick={onLogout}
          className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
          title="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;