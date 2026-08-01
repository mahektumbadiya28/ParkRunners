import mongoose from 'mongoose';
import User from '../backend/models/User.js';

console.log("Starting diagnostic database query test...");
try {
  console.log("Connecting...");
  await mongoose.connect('mongodb://127.0.0.1:27017/volenpark_db', { family: 4 });
  console.log("Connection established! Mongoose readyState:", mongoose.connection.readyState);
  
  console.log("Attempting to count users in collection...");
  const count = await User.countDocuments();
  console.log(`Successfully queried! User count: ${count}`);
  
  await mongoose.disconnect();
  console.log("Disconnected successfully!");
  process.exit(0);
} catch (error) {
  console.error("Diagnostic query failed:", error);
  process.exit(1);
}
