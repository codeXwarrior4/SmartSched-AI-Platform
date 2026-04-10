const mongoose = require('mongoose');
mongoose.set('debug', true);
mongoose.connect('mongodb://127.0.0.1:27017/smartsched')
  .then(async () => {
    console.log("Connected");
    try {
      const Admin = mongoose.model('FakeAdmin2', new mongoose.Schema({ name: String }));
      await Admin.create({ name: 'test' });
      console.log("Inserted");
    } catch (e) {
      console.error(e);
    }
    process.exit(0);
  });
