import mongoose from 'mongoose';

const connectDb = async () => {
  try {
    const connect = await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.DB_NAME,
    });
    console.log(
      "Database connected:",
      connect.connection.host,
      connect.connection.name
    );
  } catch (error) {
    console.log(error);
    return;
  }
};

export default connectDb;
