import mongoose from 'mongoose';

console.log("Starting Mongoose connection test...");
try {
  await mongoose.connect('mongodb://127.0.0.1:27017/volenpark_db', { family: 4 });
  console.log("Connected successfully!");
  await mongoose.disconnect();
  console.log("Disconnected successfully!");
  process.exit(0);
} catch (error) {
  console.error("Connection failed:", error);
  process.exit(1);
}
