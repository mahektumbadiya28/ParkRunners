import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const dbURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/volenpark';

async function migrate() {
  try {
    await mongoose.connect(dbURI);
    console.log('Connected to MongoDB');
    
    // Get raw collection to bypass mongoose schema validation temporarily
    const collection = mongoose.connection.collection('parkingspaces');
    
    const spaces = await collection.find({}).toArray();
    let updatedCount = 0;
    
    for (let space of spaces) {
      if (space.location && space.location.latitude !== undefined && space.location.longitude !== undefined) {
        // Old format found, convert to GeoJSON
        const newLocation = {
          type: 'Point',
          coordinates: [Number(space.location.longitude), Number(space.location.latitude)]
        };
        
        await collection.updateOne(
          { _id: space._id },
          { $set: { location: newLocation } }
        );
        updatedCount++;
      }
    }
    
    console.log(`Migration completed. Updated ${updatedCount} documents.`);
    
    // Re-create the 2dsphere index manually to ensure it applies
    try {
      await collection.dropIndex('location.latitude_1_location.longitude_1');
      console.log('Dropped old index.');
    } catch (e) {
      console.log('Old index not found or already dropped.');
    }
    
    await collection.createIndex({ location: '2dsphere' });
    console.log('Created 2dsphere index.');
    
    process.exit(0);
  } catch (err) {
    console.error('Migration failed', err);
    process.exit(1);
  }
}

migrate();
