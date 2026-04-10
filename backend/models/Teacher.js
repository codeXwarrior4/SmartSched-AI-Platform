const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  maxLecturesPerWeek: { type: Number, default: 20 },
  maxLecturesPerDay: { type: Number, default: 5 },
  // Can store availability matrices e.g. "Monday-Slot1"
  availability: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Teacher', teacherSchema);
