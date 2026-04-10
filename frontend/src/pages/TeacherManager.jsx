import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function TeacherManager() {
  const [teachers, setTeachers] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [editingId, setEditingId] = useState(null);

  const fetchTeachers = async () => {
    try {
       const res = await api.get('/teachers');
       setTeachers(res.data);
    } catch (e) {
       console.error(e);
    }
  };

  useEffect(() => { fetchTeachers(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if(!name || !email) return;
    try {
      if (editingId) {
        await api.put(`/teachers/${editingId}`, { name, email, maxLecturesPerWeek: 20 });
      } else {
        await api.post('/teachers', { name, email, maxLecturesPerWeek: 20 });
      }
      resetForm();
      fetchTeachers();
    } catch(err) {
      alert(err.response?.data?.message || 'Error saving teacher');
    }
  };

  const handleEdit = (t) => {
    setEditingId(t._id);
    setName(t.name);
    setEmail(t.email);
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setEmail('');
  };

  const deleteBtn = async (id) => {
    if(window.confirm('Are you sure you want to delete this teacher?')) {
      try {
        await api.delete(`/teachers/${id}`);
        fetchTeachers();
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting teacher');
      }
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Teacher Database</h2>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg text-brand-900">{editingId ? 'Edit Teacher' : 'Add New Teacher'}</h3>
          {editingId && <button onClick={resetForm} className="text-sm text-gray-500 hover:underline">Cancel Edit</button>}
        </div>
        
        <form onSubmit={submit} className="flex gap-4">
          <input type="text" placeholder="Full Name" required className="border px-3 py-2 rounded flex-1 focus:ring-2 focus:ring-brand-500 focus:outline-none" value={name} onChange={e=>setName(e.target.value)} />
          <input type="email" placeholder="Email Address" required className="border px-3 py-2 rounded flex-1 focus:ring-2 focus:ring-brand-500 focus:outline-none" value={email} onChange={e=>setEmail(e.target.value)} />
          <button type="submit" className="bg-brand-600 text-white px-6 rounded font-semibold hover:bg-brand-700 transition">
            {editingId ? 'Update' : 'Save'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-4 font-semibold text-gray-600">Name</th>
              <th className="p-4 font-semibold text-gray-600">Email</th>
              <th className="p-4 font-semibold text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map(t => (
              <tr key={t._id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-800">{t.name}</td>
                <td className="p-4 text-gray-500">{t.email}</td>
                <td className="p-4 text-right space-x-3">
                  <button onClick={() => handleEdit(t)} className="text-brand-600 text-sm font-medium hover:underline">Edit</button>
                  <button onClick={() => deleteBtn(t._id)} className="text-red-500 text-sm font-medium hover:underline">Delete</button>
                </td>
              </tr>
            ))}
            {teachers.length === 0 && (
              <tr><td colSpan="3" className="p-4 text-center text-gray-500">No teachers found. Add one above.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
