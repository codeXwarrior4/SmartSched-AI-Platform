import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function SubjectManager() {
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [weeklyLectures, setWeeklyLectures] = useState(4);
  const [classId, setClassId] = useState('');
  const [teacherId, setTeacherId] = useState('');

  const fetchData = async () => {
    const [subRes, clsRes, tRes] = await Promise.all([
      api.get('/subjects'),
      api.get('/classes'),
      api.get('/teachers')
    ]);
    setSubjects(subRes.data);
    setClasses(clsRes.data);
    setTeachers(tRes.data);
  };

  useEffect(() => { fetchData(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if(!name || !code || !classId || !teacherId) return;
    try {
      await api.post('/subjects', { 
        name, code, weeklyLectures: parseInt(weeklyLectures), classId, teacherIds: [teacherId] 
      });
      setName(''); setCode(''); setClassId(''); setTeacherId('');
      fetchData();
    } catch(err) {
      alert('Error saving subject');
    }
  };

  const deleteBtn = async (id) => {
    if(window.confirm('Delete?')) {
      await api.delete(`/subjects/${id}`);
      fetchData();
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Subject Masterlist</h2>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="font-semibold mb-4 text-lg">Add New Subject</h3>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="flex gap-4">
            <input type="text" placeholder="Subject Name (e.g. Adv Math)" className="border px-3 py-2 rounded flex-1" value={name} onChange={e=>setName(e.target.value)} />
            <input type="text" placeholder="Subject Code (E.g. MAT201)" className="border px-3 py-2 rounded flex-1" value={code} onChange={e=>setCode(e.target.value)} />
            <input type="number" placeholder="Hrs/Wk" className="border px-3 py-2 rounded w-24" value={weeklyLectures} onChange={e=>setWeeklyLectures(e.target.value)} />
          </div>
          <div className="flex gap-4">
            <select className="border px-3 py-2 rounded flex-1" value={classId} onChange={e=>setClassId(e.target.value)}>
              <option value="">Select Target Class...</option>
              {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            <select className="border px-3 py-2 rounded flex-1" value={teacherId} onChange={e=>setTeacherId(e.target.value)}>
              <option value="">Assign Prime Teacher...</option>
              {teachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>
            <button type="submit" className="bg-brand-600 text-white px-8 rounded font-medium">Save Subject Requirement</button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-4 font-semibold text-gray-600">Code</th>
              <th className="p-4 font-semibold text-gray-600">Name</th>
              <th className="p-4 font-semibold text-gray-600">Class</th>
              <th className="p-4 font-semibold text-gray-600">Teacher</th>
              <th className="p-4 font-semibold text-gray-600 text-center">Load (Hrs)</th>
              <th className="p-4 font-semibold text-gray-600 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map(s => (
              <tr key={s._id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="p-4 text-brand-600 font-mono text-sm">{s.code}</td>
                <td className="p-4 font-medium">{s.name}</td>
                <td className="p-4 text-gray-500">{s.classId?.name}</td>
                <td className="p-4 text-gray-500">{s.teacherIds[0]?.name}</td>
                <td className="p-4 text-center">{s.weeklyLectures}</td>
                <td className="p-4 text-right">
                  <button onClick={() => deleteBtn(s._id)} className="text-red-500 text-sm font-medium hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
