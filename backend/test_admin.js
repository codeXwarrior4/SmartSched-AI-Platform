const mongoose = require('mongoose');
const Admin = require('./models/Admin');
mongoose.connect('mongodb://127.0.0.1:27017/smartsched').then(async () => {
  try {
    await Admin.deleteMany({});
    const a = new Admin({ username: 'admin2', password: '123' });
    await a.save();
    console.log("Saved");
  } catch(e) {
    console.error(e);
  }
  process.exit();
});
