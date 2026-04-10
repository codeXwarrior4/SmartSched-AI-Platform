import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function ClassManager() {
  const [classes, setClasses] = useState([]);
  const [name, setName] = useState('');
  const [currentSemester, setCurrentSemester] = useState(1);
  const [editingId, setEditingId] = useState(null);

  const fetchClasses = async () => {
    try {
      const res = await api.get('/classes');
      setClasses(res.data);
    } catch(e) {
      console.error(e);
    }
  };

  useEffect(() => { fetchClasses(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if(!name) return;
    try {
      if (editingId) {
        await api.put(`/classes/${editingId}`, { name, currentSemester });
      } else {
        await api.post('/classes', { name, currentSemester });
      }
      resetForm();
      fetchClasses();
    } catch(err) {
      alert(err.response?.data?.message || 'Error saving class');
    }
  };

  const handleEdit = (c) => {
    setEditingId(c._id);
    setName(c.name);
    setCurrentSemester(c.currentSemester);
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setCurrentSemester(1);
  };

  const deleteBtn = async (id) => {
    if(window.confirm('Are you sure you want to delete this class?')) {
       try {
         await api.delete(`/classes/${id}`);
         fetchClasses();
       } catch (err) {
         alert(err.response?.data?.message || 'Error deleting class');
       }
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Class Manager</h2>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg text-brand-900">{editingId ? 'Edit Class' : 'Create New Class Structure'}</h3>
          {editingId && <button onClick={resetForm} className="text-sm text-gray-500 hover:underline">Cancel Edit</button>}
        </div>
        <form onSubmit={submit} className="flex gap-4">
          <input type="text" placeholder="Class Name (e.g. FY B.Tech CSE)" required className="border px-3 py-2 rounded flex-1 focus:ring-2 focus:ring-brand-500 focus:outline-none" value={name} onChange={e=>setName(e.target.value)} />
          <input type="number" placeholder="Semester" title="Semester / Term" required className="border px-3 py-2 rounded w-32 focus:ring-2 focus:ring-brand-500 focus:outline-none" value={currentSemester} onChange={e=>setCurrentSemester(Number(e.target.value))} />
          <button type="submit" className="bg-brand-600 text-white px-6 rounded font-semibold hover:bg-brand-700 transition">
             {editingId ? 'Update' : 'Save'}
          </button>
        </form>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-4 font-semibold text-gray-600">Class Indicator Name</th>
              <th className="p-4 font-semibold text-gray-600">Semester Term</th>
              <th className="p-4 font-semibold text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {classes.map(c => (
              <tr key={c._id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-800">{c.name}</td>
                <td className="p-4 text-gray-500">Sem {c.currentSemester}</td>
                <td className="p-4 text-right space-x-3">
                  <button onClick={() => handleEdit(c)} className="text-brand-600 text-sm font-medium hover:underline">Edit</button>
                  <button onClick={() => deleteBtn(c._id)} className="text-red-500 text-sm font-medium hover:underline">Delete</button>
                </td>
              </tr>
            ))}
            {classes.length === 0 && (
              <tr><td colSpan="3" className="p-4 text-center text-gray-500">No classes mapped yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
