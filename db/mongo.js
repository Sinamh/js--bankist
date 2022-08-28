const mongoose = require("mongoose");

const connectDB = (url, dbname) => {
  return mongoose.connect(url, { dbName: dbname });
};

module.exports = connectDB;
