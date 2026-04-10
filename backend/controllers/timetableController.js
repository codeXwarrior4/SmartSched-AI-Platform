const TimetableEntry = require('../models/TimetableEntry');
const schedulerService = require('../services/schedulerService');

exports.getTimetable = async (req, res) => {
  try {
    const entries = await TimetableEntry.find()
      .populate('classId')
      .populate('subjectId')
      .populate('teacherId')
      .populate('roomId');
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.generate = async (req, res) => {
  try {
    const result = await schedulerService.generateTimetable();
    if (result.conflicts.length > 0) {
      res.status(200).json({ message: 'Timetable generated with conflicts', ...result });
    } else {
      res.status(200).json({ message: 'Timetable generated successfully', ...result });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.clear = async (req, res) => {
  try {
    await TimetableEntry.deleteMany({});
    res.json({ message: 'Timetable cleared perfectly' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
