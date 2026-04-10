import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function ClassManager() {
  const [classes, setClasses] = useState([]);
  const [name, setName] = useState('');
  const [semester, setSemester] = useState('');

  const fetchClasses = async () => {
    const res = await api.get('/classes');
    setClasses(res.data);
  };

  useEffect(() => { fetchClasses(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if(!name) return;
    try {
      await api.post('/classes', { name, semester });
      setName(''); setSemester('');
      fetchClasses();
    } catch(err) {
      alert('Error saving class');
    }
  };

  const deleteBtn = async (id) => {
    if(window.confirm('Delete?')) {
      await api.delete(`/classes/${id}`);
      fetchClasses();
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Class Matrix</h2>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="font-semibold mb-4 text-lg">Add New Class/Division</h3>
        <form onSubmit={submit} className="flex gap-4 mb-4">
          <input type="text" placeholder="Class Name (e.g. 10A)" className="border px-3 py-2 rounded flex-1" value={name} onChange={e=>setName(e.target.value)} />
          <input type="text" placeholder="Semester (Optional)" className="border px-3 py-2 rounded flex-1" value={semester} onChange={e=>setSemester(e.target.value)} />
          <button type="submit" className="bg-brand-600 text-white px-6 rounded font-medium">Save</button>
        </form>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-4 font-semibold text-gray-600">Class Name</th>
              <th className="p-4 font-semibold text-gray-600">Semester</th>
              <th className="p-4 font-semibold text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {classes.map(c => (
              <tr key={c._id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="p-4 font-medium">{c.name}</td>
                <td className="p-4 text-gray-500">{c.semester || 'N/A'}</td>
                <td className="p-4 text-right">
                  <button onClick={() => deleteBtn(c._id)} className="text-red-500 text-sm font-medium hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
