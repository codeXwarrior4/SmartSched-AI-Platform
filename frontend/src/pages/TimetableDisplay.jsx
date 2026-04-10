import { useState, useEffect } from 'react';
import { Filter, Download, Users, GraduationCap } from 'lucide-react';
import api from '../api/axios';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function TimetableDisplay() {
  const [data, setData] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  
  const [viewMode, setViewMode] = useState('Class'); // 'Class' or 'Teacher'
  const [filterClass, setFilterClass] = useState('All');
  const [filterTeacher, setFilterTeacher] = useState('All');
  
  const [days, setDays] = useState([]);
  const [slots, setSlots] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      const [tRes, cRes, teachRes, confRes] = await Promise.all([
        api.get('/timetable'),
        api.get('/classes'),
        api.get('/teachers'),
        api.get('/config')
      ]);
      setData(tRes.data);
      setClasses(cRes.data);
      setTeachers(teachRes.data);

      const loadedDays = confRes.data?.workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      setDays(loadedDays);
      const slotCount = confRes.data?.lecturesPerDay || 5;
      setSlots(Array.from({length: slotCount}, (_, i) => `Slot ${i + 1}`));
    };
    fetch();
  }, []);

  const getEntry = (day, slot) => {
    return data.filter(entry => {
      const matchDaySlot = entry.day === day && entry.slot === slot;
      if (!matchDaySlot) return false;

      if (viewMode === 'Class') {
        return filterClass === 'All' || entry.classId?._id === filterClass;
      } else {
        return filterTeacher === 'All' || entry.teacherId?._id === filterTeacher;
      }
    });
  };

  const exportPDF = () => {
    const doc = new jsPDF('landscape'); // use landscape for better fit
    
    let title = 'SmartSched Timetable - Master';
    if (viewMode === 'Class' && filterClass !== 'All') {
        title = `Class Timetable - ${classes.find(c=>c._id === filterClass)?.name}`;
    } else if (viewMode === 'Teacher' && filterTeacher !== 'All') {
        title = `Teacher Timetable - Prof. ${teachers.find(t=>t._id === filterTeacher)?.name}`;
    }

    doc.text(title, 14, 15);
    
    const tableData = slots.map(slot => {
      const row = [slot];
      days.forEach(day => {
        const entries = getEntry(day, slot);
        if(entries.length === 0) row.push('-');
        else {
          const txt = entries.map(e => {
             if (viewMode === 'Teacher') {
                 return `${e.subjectId?.name} | ${e.classId?.name}\nRoom: ${e.roomId?.name}`;
             } else {
                 return `${e.subjectId?.name} \nProf. ${e.teacherId?.name} | ${e.roomId?.name}`;
             }
          }).join('\n---\n');
          row.push(txt);
        }
      });
      return row;
    });

    autoTable(doc, {
      head: [['Time', ...days]],
      body: tableData,
      startY: 20,
      styles: { fontSize: 8, cellPadding: 3, valign: 'middle' },
      columnStyles: { 0: { fontStyle: 'bold' } }
    });

    doc.save(`${title.replace(/ /g, '_')}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Platform Timetable</h2>
          <p className="text-sm text-gray-500 mt-1">View the algorithmic placement of all academic sessions.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button 
              onClick={() => setViewMode('Class')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'Class' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <GraduationCap size={16} /> <span>Class View</span>
            </button>
            <button 
              onClick={() => setViewMode('Teacher')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'Teacher' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Users size={16} /> <span>Teacher View</span>
            </button>
          </div>

          <div className="w-px h-8 bg-gray-200 hidden md:block"></div>

          <div className="flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
            <Filter className="text-gray-400" size={16} />
            {viewMode === 'Class' ? (
              <select 
                value={filterClass} 
                onChange={(e) => setFilterClass(e.target.value)}
                className="bg-transparent border-none text-sm focus:ring-0 cursor-pointer p-0 w-40"
              >
                <option value="All">All Classes (Master)</option>
                {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            ) : (
              <select 
                value={filterTeacher} 
                onChange={(e) => setFilterTeacher(e.target.value)}
                className="bg-transparent border-none text-sm focus:ring-0 cursor-pointer p-0 w-40"
              >
                <option value="All">All Teachers (Master)</option>
                {teachers.map(t => <option key={t._id} value={t._id}>Prof. {t.name}</option>)}
              </select>
            )}
          </div>

          <button onClick={exportPDF} className="flex items-center space-x-2 bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 shadow-sm">
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
                                {viewMode === 'Class' ? (
                                    <>
                                        <div className="text-gray-700 text-xs font-semibold">{entry.classId?.name}</div>
                                        <div className="text-gray-500 text-xs mt-1">Prof. {entry.teacherId?.name}</div>
                                    </>
                                ) : (
                                    <>
                                        <div className="text-gray-700 text-xs font-semibold">Prof. {entry.teacherId?.name}</div>
                                        <div className="text-gray-500 text-xs mt-1">{entry.classId?.name}</div>
                                    </>
                                )}
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
