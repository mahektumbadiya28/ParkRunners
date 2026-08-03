import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/parkrunners';

const run = async () => {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  const bookings = await db.collection('bookings').find({}).toArray();
  for (const b of bookings) {
    if (typeof b.bookingDate === 'string') {
      try {
        await db.collection('bookings').updateOne(
          { _id: b._id },
          { $set: {
            bookingDate: new Date(b.bookingDate),
            startTime: new Date(b.startTime),
            endTime: new Date(b.endTime)
          }}
        );
      } catch (e) {
        console.error('Failed to migrate', b._id, e);
      }
    }
  }
  console.log('Migration complete');
  process.exit(0);
};
run();
