import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config({ path: '../.env' });

async function fix() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/volenpark_db';
  await mongoose.connect(mongoUri);
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash('123456', salt);
  
  await User.updateOne({ email: 'admin@volenpark.com' }, { $set: { password: hash } });
  console.log("Admin password fixed");
  process.exit();
}
fix();
