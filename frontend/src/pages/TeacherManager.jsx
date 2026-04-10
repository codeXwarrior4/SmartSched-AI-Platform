import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function TeacherManager() {
  const [teachers, setTeachers] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const fetchTeachers = async () => {
    const res = await api.get('/teachers');
    setTeachers(res.data);
  };

  useEffect(() => { fetchTeachers(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if(!name || !email) return;
    try {
      await api.post('/teachers', { name, email, maxLecturesPerWeek: 20 });
      setName(''); setEmail('');
      fetchTeachers();
    } catch(err) {
      alert('Error saving teacher');
    }
  };

  const deleteBtn = async (id) => {
    if(window.confirm('Delete?')) {
      await api.delete(`/teachers/${id}`);
      fetchTeachers();
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Teacher Database</h2>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="font-semibold mb-4 text-lg">Add New Teacher</h3>
        <form onSubmit={submit} className="flex gap-4 mb-4">
          <input type="text" placeholder="Full Name" className="border px-3 py-2 rounded flex-1" value={name} onChange={e=>setName(e.target.value)} />
          <input type="email" placeholder="Email Address" className="border px-3 py-2 rounded flex-1" value={email} onChange={e=>setEmail(e.target.value)} />
          <button type="submit" className="bg-brand-600 text-white px-6 rounded font-medium">Save</button>
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
                <td className="p-4 font-medium">{t.name}</td>
                <td className="p-4 text-gray-500">{t.email}</td>
                <td className="p-4 text-right">
                  <button onClick={() => deleteBtn(t._id)} className="text-red-500 text-sm font-medium hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
