const Room = require('../models/Room');
const TimetableEntry = require('../models/TimetableEntry');

exports.getAll = async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, capacity, type } = req.body;
    if (!name) return res.status(400).json({ message: 'Room name is required' });

    const existing = await Room.findOne({ name });
    if (existing) return res.status(400).json({ message: 'Room name already in use' });

    const newRoom = new Room({ name, capacity, type });
    await newRoom.save();
    res.status(201).json(newRoom);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, capacity, type } = req.body;

    const existing = await Room.findOne({ name, _id: { $ne: id } });
    if (existing) return res.status(400).json({ message: 'Another room already uses this name' });

    const room = await Room.findByIdAndUpdate(id, { name, capacity, type }, { new: true });
    if(!room) return res.status(404).json({ message: 'Room not found' });
    res.json(room);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    
    const entryCount = await TimetableEntry.countDocuments({ roomId: id });
    if (entryCount > 0) return res.status(400).json({ message: 'Cannot delete: Room is actively blocked out in the generated Timetable. Clear the timetable matrix first.' });

    await Room.findByIdAndDelete(id);
    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
