import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI;

    if (!mongoURI) {
      console.error('MONGO_URI is missing from environment variables');
      process.exit(1);
    }

    const options = {
      family: 4,
      maxPoolSize: 50, // Connection pooling
      wtimeoutMS: 2500, // Timeout configurations
      serverSelectionTimeoutMS: 5000,
      autoIndex: process.env.NODE_ENV !== 'production' // Don't build indexes in production
    };

    mongoose.connection.on('connected', () => {
      console.log('✔ MongoDB Connection Established');
    });

    mongoose.connection.on('error', (err) => {
      console.error(`❌ MongoDB Connection Error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠ MongoDB Disconnected! Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✔ MongoDB Reconnected Successfully');
    });

    const conn = await mongoose.connect(mongoURI, options);
    console.log(`MongoDB Connected successfully to: ${conn.connection.name}`);

  } catch (error) {
    console.error(`Critical Error connecting to MongoDB: ${error.message}`);
    // Delay exit to allow logging, optionally don't exit in production immediately
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  }
};

export default connectDB;
