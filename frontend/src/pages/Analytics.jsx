import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../api/axios';

export default function Analytics() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      const [tRes, rRes, eRes, confRes] = await Promise.all([
        api.get('/teachers'),
        api.get('/rooms'),
        api.get('/timetable'),
        api.get('/config')
      ]);

      const config = confRes.data || { workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], lecturesPerDay: 5 };
      const totalWeeklySlots = (config.workingDays?.length || 5) * (config.lecturesPerDay || 5);
      
      const teacherWorkload = tRes.data.map(t => {
        const load = eRes.data.filter(e => e.teacherId?._id === t._id).length;
        const max = t.maxLecturesPerWeek || 20;
        const unused = Math.max(0, max - load);
        return { name: t.name, load, unused, max };
      });
      
      const roomUsage = rRes.data.map(r => {
        const usage = eRes.data.filter(e => e.roomId?._id === r._id).length;
        const unused = Math.max(0, totalWeeklySlots - usage);
        return { name: r.name, usage, unused, capacity: totalWeeklySlots };
      });

      setData({ teacherWorkload, roomUsage });
    };
    fetch();
  }, []);

  if (!data) return <div>Loading...</div>;

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">System Telemetry & Analytics</h2>
        <p className="text-gray-500 text-sm mt-1">Resource utilization metrics across the ecosystem comparing generated load vs bounds.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6 border-b pb-2">Teacher Target vs Actual Load</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.teacherWorkload} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" tick={{fill: '#6B7280', fontSize: 12}} axisLine={false} tickLine={false} />
                <YAxis tick={{fill: '#6B7280', fontSize: 12}} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#F3F4F6'}} contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Bar stackId="a" dataKey="load" name="Scheduled Hours" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar stackId="a" dataKey="unused" name="Available (Under Limit)" fill="#D1D5DB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6 border-b pb-2">Room Slot Saturation</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.roomUsage} margin={{ top: 20, right: 30, left: 0, bottom: 5 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                <XAxis type="number" tick={{fill: '#6B7280', fontSize: 12}} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{fill: '#6B7280', fontSize: 12}} axisLine={false} tickLine={false} width={80}/>
                <Tooltip cursor={{fill: '#F3F4F6'}} contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', marginTop: '10px' }} />
                <Bar stackId="b" dataKey="usage" name="Used Slots" fill="#10b981" radius={[0, 4, 4, 0]} />
                <Bar stackId="b" dataKey="unused" name="Idle Slots" fill="#E5E7EB" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
