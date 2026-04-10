import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function RoomManager() {
  const [rooms, setRooms] = useState([]);
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState('');
  const [type, setType] = useState('Classroom');
  const [editingId, setEditingId] = useState(null);

  const fetchRooms = async () => {
    try {
      const res = await api.get('/rooms');
      setRooms(res.data);
    } catch(e) {
      console.error(e);
    }
  };

  useEffect(() => { fetchRooms(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if(!name || !capacity) return;
    try {
      if (editingId) {
        await api.put(`/rooms/${editingId}`, { name, capacity: Number(capacity), type });
      } else {
        await api.post('/rooms', { name, capacity: Number(capacity), type });
      }
      resetForm();
      fetchRooms();
    } catch(err) {
      alert(err.response?.data?.message || 'Error saving room');
    }
  };

  const handleEdit = (r) => {
    setEditingId(r._id);
    setName(r.name);
    setCapacity(r.capacity.toString());
    setType(r.type);
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setCapacity('');
    setType('Classroom');
  };

  const deleteBtn = async (id) => {
    if(window.confirm('Delete this facility?')) {
       try {
         await api.delete(`/rooms/${id}`);
         fetchRooms();
       } catch (err) {
         alert(err.response?.data?.message || 'Error deleting room');
       }
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Room Facility Database</h2>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg text-brand-900">{editingId ? 'Edit Room' : 'Add New Room'}</h3>
          {editingId && <button onClick={resetForm} className="text-sm text-gray-500 hover:underline">Cancel Edit</button>}
        </div>
        <form onSubmit={submit} className="flex gap-4">
          <input type="text" placeholder="Room Name/ID (e.g. Lab 101)" required className="border px-3 py-2 rounded flex-1 focus:ring-2 focus:ring-brand-500 focus:outline-none" value={name} onChange={e=>setName(e.target.value)} />
          <input type="number" placeholder="Seating Capacity" required min="1" className="border px-3 py-2 rounded w-40 focus:ring-2 focus:ring-brand-500 focus:outline-none" value={capacity} onChange={e=>setCapacity(e.target.value)} />
          <select value={type} onChange={e=>setType(e.target.value)} className="border px-3 py-2 rounded w-40 focus:ring-2 focus:ring-brand-500 focus:outline-none">
            <option value="Classroom">Classroom</option>
            <option value="Lab">Laboratory</option>
          </select>
          <button type="submit" className="bg-brand-600 text-white px-6 rounded font-semibold hover:bg-brand-700 transition">
             {editingId ? 'Update' : 'Save'}
          </button>
        </form>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-4 font-semibold text-gray-600">Facility ID</th>
              <th className="p-4 font-semibold text-gray-600">Capacity</th>
              <th className="p-4 font-semibold text-gray-600">Type Designation</th>
              <th className="p-4 font-semibold text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map(r => (
              <tr key={r._id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-800">{r.name}</td>
                <td className="p-4 text-gray-500">{r.capacity} Seats</td>
                <td className="p-4 text-gray-500">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${r.type === 'Lab' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                    {r.type}
                  </span>
                </td>
                <td className="p-4 text-right space-x-3">
                  <button onClick={() => handleEdit(r)} className="text-brand-600 text-sm font-medium hover:underline">Edit</button>
                  <button onClick={() => deleteBtn(r._id)} className="text-red-500 text-sm font-medium hover:underline">Delete</button>
                </td>
              </tr>
            ))}
            {rooms.length === 0 && (
              <tr><td colSpan="4" className="p-4 text-center text-gray-500">No rooms mapped yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
