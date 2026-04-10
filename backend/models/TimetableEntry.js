const mongoose = require('mongoose');

const timetableEntrySchema = new mongoose.Schema({
  day: { type: String, required: true },
  slot: { type: String, required: true }, // e.g., "Slot 1"
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true }
}, { timestamps: true });

module.exports = mongoose.model('TimetableEntry', timetableEntrySchema);
