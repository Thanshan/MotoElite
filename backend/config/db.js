const mongoose = require('mongoose');

/**
 * Connect to MongoDB database
 */
const connectDB = async () => {
  try {
    console.log("MONGODB_URI:", process.env.MONGODB_URI);

    constw conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(MongoDB Connection Error: ${error.message});
  }
};


module.exports = connectDB;
