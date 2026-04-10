import { useEffect, useState } from 'react';
import { Users, BookOpen, GraduationCap, DoorOpen, CalendarCheck } from 'lucide-react';
import api from '../api/axios';

function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
      <div className={`p-3 rounded-xl w-12 h-12 flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <h3 className="text-2xl font-bold text-gray-900 leading-none">{value}</h3>
        <p className="text-sm font-medium text-gray-500 mt-1">{title}</p>
      </div>
    </div>
  );
}

export default function DashboardHome() {
  const [stats, setStats] = useState({
    teachers: 0,
    subjects: 0,
    classes: 0,
    rooms: 0,
    entries: 0
  });

  const fetchStats = async () => {
    try {
      const [tRes, sRes, cRes, rRes, eRes] = await Promise.all([
        api.get('/teachers'),
        api.get('/subjects'),
        api.get('/classes'),
        api.get('/rooms'),
        api.get('/timetable')
      ]);
      setStats({
        teachers: tRes.data.length,
        subjects: sRes.data.length,
        classes: cRes.data.length,
        rooms: rRes.data.length,
        entries: eRes.data.length
      });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleGenerate = async () => {
    try {
      const res = await api.post('/timetable/generate');
      alert(`Status: ${res.data.message}\nScheduled slots: ${res.data.inserted}`);
      fetchStats();
    } catch (err) {
      alert('Generation Failed');
    }
  };

  const handleClear = async () => {
    if(window.confirm('Are you sure you want to completely clear the current timetable?')) {
      try {
        await api.delete('/timetable/clear');
        fetchStats();
      } catch (err) {
        alert('Clear failed');
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in zoom-in duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h2>
          <p className="text-gray-500 mt-1">Platform overview and high-level control.</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={handleClear}
            className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 font-medium transition-colors"
          >
            Clear Schedule
          </button>
          <button 
            onClick={handleGenerate}
            className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2 rounded-lg font-medium shadow-md transition-colors"
          >
            Generate Engine
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard title="Total Teachers" value={stats.teachers} icon={<Users size={24} className="text-blue-600" />} color="bg-blue-50" />
        <StatCard title="Total Subjects" value={stats.subjects} icon={<BookOpen size={24} className="text-purple-600" />} color="bg-purple-50" />
        <StatCard title="Total Classes" value={stats.classes} icon={<GraduationCap size={24} className="text-emerald-600" />} color="bg-emerald-50" />
        <StatCard title="Total Rooms" value={stats.rooms} icon={<DoorOpen size={24} className="text-amber-600" />} color="bg-amber-50" />
        <StatCard title="Generated Slots" value={stats.entries} icon={<CalendarCheck size={24} className="text-brand-600" />} color="bg-brand-50" />
      </div>

      {stats.entries > 0 && (
         <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6 flex flex-col items-center justify-center space-y-4">
           <div className="text-4xl">🚀</div>
           <h3 className="text-lg font-semibold text-emerald-900">Timetable Loaded & Active</h3>
           <p className="text-emerald-700 max-w-lg text-center">Your platform's algorithmic engine has successfully populated {stats.entries} schedule blocks without collisions. Head over to the Timetable Matrix to view the output.</p>
         </div>
      )}
    </div>
  );
}
