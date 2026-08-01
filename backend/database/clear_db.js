import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

async function clearDB() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/volenpark_db';
  await mongoose.connect(mongoUri);
  const db = mongoose.connection.db;
  const collections = await db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
  console.log("Database cleared");
  process.exit();
}
clearDB();
