import { useState, useEffect } from 'react';
import { Filter, Download } from 'lucide-react';
import api from '../api/axios';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function TimetableDisplay() {
  const [data, setData] = useState([]);
  const [classes, setClasses] = useState([]);
  const [filterClass, setFilterClass] = useState('All');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const slots = ['Slot 1', 'Slot 2', 'Slot 3', 'Slot 4', 'Slot 5'];

  useEffect(() => {
    const fetch = async () => {
      const [tRes, cRes] = await Promise.all([
        api.get('/timetable'),
        api.get('/classes')
      ]);
      setData(tRes.data);
      setClasses(cRes.data);
    };
    fetch();
  }, []);

  const getEntry = (day, slot) => {
    return data.filter(entry => {
      const matchDaySlot = entry.day === day && entry.slot === slot;
      const matchClass = filterClass === 'All' || entry.classId?._id === filterClass;
      return matchDaySlot && matchClass;
    });
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text(`SmartSched Timetable - ${filterClass === 'All' ? 'Master' : classes.find(c=>c._id === filterClass)?.name}`, 14, 15);
    
    const tableData = slots.map(slot => {
      const row = [slot];
      days.forEach(day => {
        const entries = getEntry(day, slot);
        if(entries.length === 0) row.push('-');
        else {
          const txt = entries.map(e => `${e.subjectId?.name} | ${e.classId?.name}\n${e.teacherId?.name} | ${e.roomId?.name}`).join('\n\n');
          row.push(txt);
        }
      });
      return row;
    });

    autoTable(doc, {
      head: [['Time', ...days]],
      body: tableData,
      startY: 20,
      styles: { fontSize: 8, cellPadding: 2, valign: 'middle' }
    });

    doc.save('Timetable.pdf');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900">Generated Matrix</h2>
        <div className="flex space-x-4 items-center">
          <Filter className="text-gray-400" size={20} />
          <select 
            value={filterClass} 
            onChange={(e) => setFilterClass(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-brand-500"
          >
            <option value="All">All Classes (Master Matrix)</option>
            {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <button onClick={exportPDF} className="flex items-center space-x-2 bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700">
            <Download size={16} /> <span>Export PDF</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-fixed min-w-[1200px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 font-semibold text-gray-600 border-r w-32 border-b-2 border-b-brand-200">Slot / Day</th>
                {days.map(day => (
                  <th key={day} className="p-4 font-semibold text-gray-600 text-center border-r border-b-2 border-b-brand-200">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {slots.map(slot => (
                <tr key={slot} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                  <td className="p-4 font-medium text-gray-900 border-r bg-gray-50/30">{slot}</td>
                  {days.map(day => {
                    const entries = getEntry(day, slot);
                    return (
                      <td key={`${day}-${slot}`} className="p-3 border-r align-top">
                        {entries.length === 0 ? (
                          <div className="text-gray-300 text-center text-sm italic mt-2">-</div>
                        ) : (
                          <div className="space-y-2">
                            {entries.map(entry => (
                              <div key={entry._id} className="bg-white border border-brand-200 shadow-sm rounded-lg p-3 text-sm transition-transform hover:-translate-y-1 hover:shadow-md">
                                <div className="font-bold text-brand-900 border-b pb-1 mb-1 border-brand-50">{entry.subjectId?.name || 'Unknown'}</div>
                                <div className="text-gray-700 text-xs font-semibold">{entry.classId?.name}</div>
                                <div className="text-gray-500 text-xs mt-1">Prof. {entry.teacherId?.name}</div>
                                <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                  {entry.roomId?.name}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
