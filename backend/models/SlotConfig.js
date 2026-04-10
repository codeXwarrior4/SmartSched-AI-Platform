const mongoose = require('mongoose');

const slotConfigSchema = new mongoose.Schema({
  workingDays: [{ type: String }],
  lecturesPerDay: { type: Number, default: 6 },
  startTime: { type: String, default: '09:00' },
  slotDurationMins: { type: Number, default: 60 }
}, { timestamps: true });

module.exports = mongoose.model('SlotConfig', slotConfigSchema);
