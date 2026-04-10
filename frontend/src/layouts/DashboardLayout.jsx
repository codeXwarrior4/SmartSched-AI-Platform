import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, BookOpen, GraduationCap, DoorOpen, CalendarDays, LineChart, LogOut, Settings as SettingsIcon } from 'lucide-react';
import { Outlet } from 'react-router-dom';

export default function DashboardLayout({ setAuth }) {
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('smartsched_token');
    localStorage.removeItem('smartsched_user');
    setAuth(false);
  };

  const links = [
    { path: '/', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/teachers', name: 'Teachers', icon: <Users size={20} /> },
    { path: '/subjects', name: 'Subjects', icon: <BookOpen size={20} /> },
    { path: '/classes', name: 'Classes', icon: <GraduationCap size={20} /> },
    { path: '/rooms', name: 'Rooms', icon: <DoorOpen size={20} /> },
    { path: '/timetable', name: 'Timetable Matrix', icon: <CalendarDays size={20} /> },
    { path: '/analytics', name: 'Analytics', icon: <LineChart size={20} /> },
    { path: '/settings', name: 'System Settings', icon: <SettingsIcon size={20} /> },
  ];

  return (
    <div className="flex bg-gray-50 min-h-screen font-sans">
      <aside className="w-64 bg-brand-900 text-white flex flex-col h-screen fixed shadow-xl">
        <div className="p-6">
          <h1 className="text-2xl font-bold tracking-tight text-white">SmartSched <span className="text-brand-400">AI</span></h1>
          <p className="text-brand-300 text-xs mt-1">Admin Portal</p>
        </div>
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto mt-4">
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActive ? 'bg-brand-600 text-white shadow-sm' : 'text-brand-100 hover:bg-brand-800'
                }`}
              >
                <span className="mr-3">{link.icon}</span>
                <span className="font-medium text-sm">{link.name}</span>
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-brand-800">
          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-sm text-brand-200 hover:text-white hover:bg-brand-800 rounded-lg transition-colors"
          >
            <LogOut size={18} className="mr-3" />
            Logout
          </button>
        </div>
      </aside>
      
      <main className="flex-1 ml-64 p-8 overflow-y-auto max-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
