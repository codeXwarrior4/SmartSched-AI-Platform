import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function RoomManager() {
  const [rooms, setRooms] = useState([]);
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState(30);

  const fetchRooms = async () => {
    const res = await api.get('/rooms');
    setRooms(res.data);
  };

  useEffect(() => { fetchRooms(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if(!name) return;
    try {
      await api.post('/rooms', { name, capacity: parseInt(capacity) });
      setName(''); setCapacity(30);
      fetchRooms();
    } catch(err) {
      alert('Error saving room');
    }
  };

  const deleteBtn = async (id) => {
    if(window.confirm('Delete?')) {
      await api.delete(`/rooms/${id}`);
      fetchRooms();
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Room Resource Management</h2>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="font-semibold mb-4 text-lg">Add New Room</h3>
        <form onSubmit={submit} className="flex gap-4 mb-4">
          <input type="text" placeholder="Room ID/Name (e.g. Block A 101)" className="border px-3 py-2 rounded flex-1" value={name} onChange={e=>setName(e.target.value)} />
          <input type="number" placeholder="Capacity" className="border px-3 py-2 rounded w-32" value={capacity} onChange={e=>setCapacity(e.target.value)} />
          <button type="submit" className="bg-brand-600 text-white px-6 rounded font-medium">Save Room</button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-4 font-semibold text-gray-600">Room Designator</th>
              <th className="p-4 font-semibold text-gray-600">Student Capacity</th>
              <th className="p-4 font-semibold text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map(r => (
              <tr key={r._id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="p-4 font-medium">{r.name}</td>
                <td className="p-4 text-gray-500">{r.capacity}</td>
                <td className="p-4 text-right">
                  <button onClick={() => deleteBtn(r._id)} className="text-red-500 text-sm font-medium hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
