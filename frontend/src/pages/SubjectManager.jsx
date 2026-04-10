import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function SubjectManager() {
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);

  // Form State
  const [name, setName] = useState('');
  const [classId, setClassId] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [weeklyLectures, setWeeklyLectures] = useState(4);
  const [type, setType] = useState('Theory');
  const [editingId, setEditingId] = useState(null);

  const fetchAll = async () => {
    try {
      const [sRes, cRes, tRes] = await Promise.all([
        api.get('/subjects'),
        api.get('/classes'),
        api.get('/teachers')
      ]);
      setSubjects(sRes.data);
      setClasses(cRes.data);
      setTeachers(tRes.data);
    } catch(e) {
      console.error(e);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if(!name || !classId || !teacherId) {
      alert("Missing required relational assignments!");
      return;
    }
    try {
      const payload = { name, classId, teacherIds: [teacherId], weeklyLectures, type };
      
      if (editingId) {
        await api.put(`/subjects/${editingId}`, payload);
      } else {
        await api.post('/subjects', payload);
      }
      resetForm();
      fetchAll();
    } catch(err) {
      alert(err.response?.data?.message || 'Error saving subject binding');
    }
  };

  const handleEdit = (s) => {
    setEditingId(s._id);
    setName(s.name);
    setClassId(s.classId?._id || '');
    setTeacherId(s.teacherIds?.[0]?._id || '');
    setWeeklyLectures(s.weeklyLectures);
    setType(s.type);
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setClassId('');
    setTeacherId('');
    setWeeklyLectures(4);
    setType('Theory');
  };

  const deleteBtn = async (id) => {
    if(window.confirm('Delete subject binding?')) {
       try {
         await api.delete(`/subjects/${id}`);
         fetchAll();
       } catch (err) {
         alert(err.response?.data?.message || 'Error deleting subject binding');
       }
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Academic Subject Mappings</h2>
      
      {/* Alert if lacking core items */}
      {(classes.length===0 || teachers.length===0) && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded text-yellow-800 text-sm">
          <strong>Warning:</strong> You must create at least one Class and Teacher before attaching Subjects!
        </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg text-brand-900">{editingId ? 'Edit Subject Assignment' : 'Bind New Subject'}</h3>
          {editingId && <button onClick={resetForm} className="text-sm text-gray-500 hover:underline">Cancel Edit</button>}
        </div>
        <form onSubmit={submit} className="flex flex-wrap gap-4">
          <input type="text" placeholder="Subject Name" required className="border px-3 py-2 rounded flex-1 min-w-[200px]" value={name} onChange={e=>setName(e.target.value)} />
          
          <select required className="border px-3 py-2 rounded flex-1 min-w-[150px]" value={classId} onChange={e=>setClassId(e.target.value)}>
            <option value="">Select Target Class...</option>
            {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          
          <select required className="border px-3 py-2 rounded flex-1 min-w-[150px]" value={teacherId} onChange={e=>setTeacherId(e.target.value)}>
            <option value="">Assign Professor...</option>
            {teachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
          </select>

          <div className="flex items-center gap-2 border px-3 py-2 rounded bg-gray-50">
            <span className="text-sm text-gray-600">Hrs/Wk:</span>
            <input type="number" min="1" max="10" required className="w-12 bg-transparent text-center font-semibold" value={weeklyLectures} onChange={e=>setWeeklyLectures(Number(e.target.value))} />
          </div>

          <select required className="border px-3 py-2 rounded w-32" value={type} onChange={e=>setType(e.target.value)}>
            <option value="Theory">Theory</option>
            <option value="Lab">Laboratory</option>
          </select>

          <button type="submit" disabled={classes.length===0 || teachers.length===0} className="bg-brand-600 text-white px-8 rounded font-semibold hover:bg-brand-700 disabled:opacity-50 transition">
             {editingId ? 'Update' : 'Commit'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-4 font-semibold text-gray-600">Subject Core</th>
              <th className="p-4 font-semibold text-gray-600">Target Class</th>
              <th className="p-4 font-semibold text-gray-600">Professor</th>
              <th className="p-4 font-semibold text-gray-600 text-center">Workload Constraint</th>
              <th className="p-4 font-semibold text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map(s => (
              <tr key={s._id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-800">
                  {s.name}
                  {s.type === 'Lab' && <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200">Lab</span>}
                </td>
                <td className="p-4 text-gray-600 font-medium">{s.classId ? s.classId.name : <span className="text-red-500 text-sm">ORPHANED CLASS</span>}</td>
                <td className="p-4 text-gray-600">{s.teacherIds?.length > 0 ? s.teacherIds[0].name : <span className="text-red-500 text-sm">NO TEACHER</span>}</td>
                <td className="p-4 text-gray-500 text-center">{s.weeklyLectures} hrs / wk</td>
                <td className="p-4 text-right space-x-3">
                  <button onClick={() => handleEdit(s)} className="text-brand-600 text-sm font-medium hover:underline">Edit</button>
                  <button onClick={() => deleteBtn(s._id)} className="text-red-500 text-sm font-medium hover:underline">Unbind</button>
                </td>
              </tr>
            ))}
            {subjects.length === 0 && (
              <tr><td colSpan="5" className="p-4 text-center text-gray-500">No subjects currently bound.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
