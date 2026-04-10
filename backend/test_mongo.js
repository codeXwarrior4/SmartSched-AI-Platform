const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/smartsched')
  .then(async () => {
    console.log("Connected");
    const Admin = mongoose.model('FakeAdmin', new mongoose.Schema({ name: String }));
    await Admin.create({ name: 'test' });
    console.log("Inserted");
    process.exit(0);
  })
  .catch(console.error);
