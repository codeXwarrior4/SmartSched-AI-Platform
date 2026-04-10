const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: { type: String, required: true },
  semester: { type: String },
  department: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Class', classSchema);
