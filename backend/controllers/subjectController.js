const Subject = require('../models/Subject');
const TimetableEntry = require('../models/TimetableEntry');

exports.getAll = async (req, res) => {
  try {
    const subjects = await Subject.find().populate('classId').populate('teacherIds');
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, classId, teacherIds, weeklyLectures, type } = req.body;
    if (!name || !classId || !teacherIds) {
      return res.status(400).json({ message: 'Missing required relational fields' });
    }

    const existing = await Subject.findOne({ name, classId });
    if (existing) return res.status(400).json({ message: 'This subject already exists for the selected class' });

    const newSub = new Subject({ name, classId, teacherIds, weeklyLectures, type });
    await newSub.save();
    res.status(201).json(await newSub.populate(['classId', 'teacherIds']));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, classId, teacherIds, weeklyLectures, type } = req.body;

    const existing = await Subject.findOne({ name, classId, _id: { $ne: id } });
    if (existing) return res.status(400).json({ message: 'Conflict: This class already has a subject mapped with this name' });

    const subject = await Subject.findByIdAndUpdate(id, { name, classId, teacherIds, weeklyLectures, type }, { new: true });
    if(!subject) return res.status(404).json({ message: 'Subject not found' });
    res.json(await subject.populate(['classId', 'teacherIds']));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    
    const entryCount = await TimetableEntry.countDocuments({ subjectId: id });
    if (entryCount > 0) return res.status(400).json({ message: 'Cannot delete: Subject is currently scheduled in the Timetable matrix. Generate a cleared matrix first.' });

    await Subject.findByIdAndDelete(id);
    res.json({ message: 'Subject deleted safely' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
