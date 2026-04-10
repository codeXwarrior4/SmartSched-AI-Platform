const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  capacity: { type: Number, required: true },
  type: { type: String, enum: ['Classroom', 'Lab'], default: 'Classroom' }
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
