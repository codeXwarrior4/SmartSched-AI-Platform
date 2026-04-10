const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  weeklyLectures: { type: Number, required: true },
  type: { type: String, enum: ['Theory', 'Lab'], default: 'Theory' },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  teacherIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' }]
}, { timestamps: true });

module.exports = mongoose.model('Subject', subjectSchema);
