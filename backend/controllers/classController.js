const Class = require('../models/Class');
const Subject = require('../models/Subject');
const TimetableEntry = require('../models/TimetableEntry');

exports.getAll = async (req, res) => {
  try {
    const classes = await Class.find();
    res.json(classes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, currentSemester } = req.body;
    if (!name) return res.status(400).json({ message: 'Class name is required' });

    const existing = await Class.findOne({ name });
    if (existing) return res.status(400).json({ message: 'Class name already exists' });

    const newClass = new Class({ name, currentSemester });
    await newClass.save();
    res.status(201).json(newClass);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, currentSemester } = req.body;
    
    const existing = await Class.findOne({ name, _id: { $ne: id } });
    if (existing) return res.status(400).json({ message: 'Another class already has this name' });

    const updated = await Class.findByIdAndUpdate(id, { name, currentSemester }, { new: true });
    if(!updated) return res.status(404).json({ message: 'Class not found' });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    // Safety: check subjects
    const subCount = await Subject.countDocuments({ classId: id });
    if (subCount > 0) return res.status(400).json({ message: `Cannot delete: Class has ${subCount} subjects attached. Please delete them first.` });

    const entryCount = await TimetableEntry.countDocuments({ classId: id });
    if (entryCount > 0) return res.status(400).json({ message: 'Cannot delete: Class is in the active Timetable Matrix. Clear timetable first.' });

    await Class.findByIdAndDelete(id);
    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
