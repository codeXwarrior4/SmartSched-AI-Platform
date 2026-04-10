import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function Settings() {
  const [workingDays, setWorkingDays] = useState([]);
  const [lecturesPerDay, setLecturesPerDay] = useState(5);
  const [startTime, setStartTime] = useState('09:00');
  const [slotDurationMins, setSlotDurationMins] = useState(60);

  const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const fetchConfig = async () => {
    try {
      const res = await api.get('/config');
      setWorkingDays(res.data.workingDays || []);
      setLecturesPerDay(res.data.lecturesPerDay || 5);
      setStartTime(res.data.startTime || '09:00');
      setSlotDurationMins(res.data.slotDurationMins || 60);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => { fetchConfig(); }, []);

  const handleToggleDay = (day) => {
    if (workingDays.includes(day)) {
      setWorkingDays(workingDays.filter(d => d !== day));
    } else {
      // Keep order by mapping over ALL_DAYS
      const newSet = new Set([...workingDays, day]);
      setWorkingDays(ALL_DAYS.filter(d => newSet.has(d)));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (workingDays.length === 0) {
      alert("Please select at least one working day.");
      return;
    }
    
    try {
      await api.put('/config', {
        workingDays,
        lecturesPerDay,
        startTime,
        slotDurationMins
      });
      alert('Settings updated successfully. Next timetable generation will use these constraints.');
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating settings');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">System Configuration</h2>
        <p className="text-sm text-gray-500 mt-1">Adjust grid dimensions and operational times for the algorithmic engine.</p>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-2xl">
        <form onSubmit={handleSave} className="space-y-8">
          
          {/* Active Working Days */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Active Working Days</h3>
            <div className="flex flex-wrap gap-3">
              {ALL_DAYS.map(day => (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleToggleDay(day)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                    workingDays.includes(day)
                      ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
            {workingDays.length === 0 && <p className="text-red-500 text-sm mt-2">Required: Pick at least one day.</p>}
          </div>

          {/* Grid Constraints */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Grid Boundaries</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slots / Lectures per Day</label>
                <input
                  type="number"
                  min="1"
                  max="15"
                  value={lecturesPerDay}
                  onChange={e => setLecturesPerDay(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slot Duration (Mins)</label>
                <input
                  type="number"
                  min="15"
                  max="180"
                  step="5"
                  value={slotDurationMins}
                  onChange={e => setSlotDurationMins(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Institution Start Time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              className="bg-gray-900 text-white px-8 py-3 rounded-lg font-semibold shadow-md hover:bg-black transition-colors"
            >
              Apply System Configurations
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
