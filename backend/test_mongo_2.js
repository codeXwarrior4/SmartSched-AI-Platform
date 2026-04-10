const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/smartsched').then(() => {
  console.log("Ready state: " + mongoose.connection.readyState);
  process.exit(0);
}).catch(console.error);
