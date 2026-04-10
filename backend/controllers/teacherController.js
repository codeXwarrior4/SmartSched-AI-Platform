const Teacher = require('../models/Teacher');
const Subject = require('../models/Subject');
const TimetableEntry = require('../models/TimetableEntry');

exports.getAll = async (req, res) => {
  try {
    const teachers = await Teacher.find();
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, email, maxLecturesPerWeek } = req.body;
    if (!name || !email) return res.status(400).json({ message: 'Name and email are required' });
    
    const existing = await Teacher.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Teacher with this email already exists' });

    const newTeacher = new Teacher({ name, email, maxLecturesPerWeek });
    await newTeacher.save();
    res.status(201).json(newTeacher);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, maxLecturesPerWeek } = req.body;
    
    const existing = await Teacher.findOne({ email, _id: { $ne: id } });
    if (existing) return res.status(400).json({ message: 'Email already in use by another teacher' });

    const teacher = await Teacher.findByIdAndUpdate(id, req.body, { new: true });
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
    
    res.json(teacher);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Safety check: is teacher assigned to any subjects?
    const subjectCount = await Subject.countDocuments({ teacherIds: id });
    if (subjectCount > 0) {
      return res.status(400).json({ message: `Cannot delete: Teacher is assigned to ${subjectCount} subject(s). Remove assignments first.` });
    }

    // Safety check: is teacher currently explicitly tracking any timetable entry?
    const entryCount = await TimetableEntry.countDocuments({ teacherId: id });
    if (entryCount > 0) {
       return res.status(400).json({ message: `Cannot delete: Teacher exists in the active Timetable Matrix. Clear the timetable first.` });
    }

    await Teacher.findByIdAndDelete(id);
    res.json({ message: 'Teacher safely deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
