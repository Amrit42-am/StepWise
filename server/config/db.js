import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI?.trim();

  if (!uri) {
    console.log('No MONGODB_URI found. Starting in-memory MongoDB for testing...');
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    console.log(`In-memory MongoDB Connected: ${mongoUri}`);
    return;
  }

  if (/<[^>]+>/.test(uri)) {
    throw new Error('MONGODB_URI contains a placeholder. Replace every value in angle brackets with your Atlas connection details.');
  }

  const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  console.log(`MongoDB Connected: ${conn.connection.host}`);
  return conn;
};

export default connectDB;
