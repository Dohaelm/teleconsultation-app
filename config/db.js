const mongoose = require("mongoose") ;
const { connect } = mongoose;

const connectDB = async () => {
  try {
    const conn = await connect(process.env.MONGO_URI, {
      dbName: 'teleconsultation', // Specify the name of the database here
      useNewUrlParser: true,
      useUnifiedTopology: true,
     
     
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`Error connecting to MongoDB: ${err.message}`);
    process.exit(1); // Exit the process if connection fails
  }
};


module.exports = connectDB;