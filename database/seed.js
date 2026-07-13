import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env configuration from backend folder
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

// Import models
import User from '../backend/models/User.js';
import Vehicle from '../backend/models/Vehicle.js';
import ParkingSpot from '../backend/models/ParkingSpot.js';
import Booking from '../backend/models/Booking.js';
import Valet from '../backend/models/Valet.js';
import Payment from '../backend/models/Payment.js';
import Review from '../backend/models/Review.js';
import Notification from '../backend/models/Notification.js';
import ParkingAnalytics from '../backend/models/ParkingAnalytics.js';

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/volenpark_db';
    console.log(`Connecting to database: ${mongoUri}`);
    await mongoose.connect(mongoUri, { family: 4 });
    console.log('Connected to MongoDB. Starting database seeding...');

    // 1. Clear Existing Data
    await User.deleteMany();
    await Vehicle.deleteMany();
    await ParkingSpot.deleteMany();
    await Booking.deleteMany();
    await Valet.deleteMany();
    await Payment.deleteMany();
    await Review.deleteMany();
    await Notification.deleteMany();
    await ParkingAnalytics.deleteMany();
    console.log('Cleared existing collections.');

    // 2. Create Users
    console.log('Creating users...');
    const users = await User.create([
      {
        name: 'System Admin',
        email: 'admin@volenpark.com',
        password: 'admin123',
        phone: '+15550100',
        role: 'admin',
        isVerified: true
      },
      {
        name: 'John Car Owner',
        email: 'owner@volenpark.com',
        password: 'owner123',
        phone: '+15550101',
        role: 'car_owner',
        isVerified: true
      },
      {
        name: 'Sarah Parking Host',
        email: 'provider@volenpark.com',
        password: 'provider123',
        phone: '+15550102',
        role: 'space_provider',
        isVerified: true
      },
      {
        name: 'David Valet Driver',
        email: 'valet@volenpark.com',
        password: 'valet123',
        phone: '+15550103',
        role: 'valet_driver',
        isVerified: true
      },
      {
        name: 'Alex Extra Valet',
        email: 'valet2@volenpark.com',
        password: 'valet123',
        phone: '+15550104',
        role: 'valet_driver',
        isVerified: true
      }
    ]);

    const adminUser = users[0];
    const ownerUser = users[1];
    const hostUser = users[2];
    const valetUser1 = users[3];
    const valetUser2 = users[4];

    console.log(`Seeded ${users.length} users successfully.`);

    // 3. Create Valet Profiles
    console.log('Creating valet profiles...');
    const valets = await Valet.create([
      {
        userId: valetUser1._id,
        licenseNumber: 'DL-98231',
        licenseImage: 'https://res.cloudinary.com/mock/image/upload/license1.jpg',
        experience: 4,
        availability: true,
        currentLatitude: 37.78825,
        currentLongitude: -122.4324,
        rating: 4.8,
        verified: true
      },
      {
        userId: valetUser2._id,
        licenseNumber: 'DL-54321',
        licenseImage: 'https://res.cloudinary.com/mock/image/upload/license2.jpg',
        experience: 2,
        availability: true,
        currentLatitude: 37.78925,
        currentLongitude: -122.4344,
        rating: 4.5,
        verified: true
      }
    ]);
    console.log(`Seeded ${valets.length} valet profiles.`);

    // 4. Create Vehicles
    console.log('Creating vehicles...');
    const vehicles = await Vehicle.create([
      {
        userId: ownerUser._id,
        vehicleNumber: 'CA98765',
        brand: 'Tesla',
        model: 'Model 3',
        color: 'Red',
        year: 2022,
        vehicleType: 'Sedan',
        insuranceNumber: 'INS-77625',
        registrationCertificate: 'https://res.cloudinary.com/mock/image/upload/rc_tesla.jpg'
      },
      {
        userId: ownerUser._id,
        vehicleNumber: 'TX54321',
        brand: 'Ford',
        model: 'Explorer',
        color: 'Black',
        year: 2020,
        vehicleType: 'SUV',
        insuranceNumber: 'INS-11234',
        registrationCertificate: 'https://res.cloudinary.com/mock/image/upload/rc_ford.jpg'
      }
    ]);
    console.log(`Seeded ${vehicles.length} owner vehicles.`);

    // 5. Create Parking Spaces
    console.log('Creating parking spaces...');
    const parkingSpots = await ParkingSpot.create([
      {
        ownerId: hostUser._id,
        title: 'Safe Garage near Downtown',
        description: 'Fully secured garage spot. Ideal for long bookings. CCTV monitored 24/7.',
        address: '456 Main St, San Francisco, CA',
        latitude: 37.78825,
        longitude: -122.4324,
        images: ['https://res.cloudinary.com/mock/image/upload/spot1.jpg'],
        parkingType: 'garage',
        hourlyRate: 15,
        availableFrom: '08:00',
        availableTill: '22:00',
        isAvailable: true,
        rating: 4.7
      },
      {
        ownerId: hostUser._id,
        title: 'Spacious Residential Driveway',
        description: 'Wide open driveway in quiet neighborhood. Easy street access.',
        address: '789 Oak Ave, San Francisco, CA',
        latitude: 37.78912,
        longitude: -122.4361,
        images: ['https://res.cloudinary.com/mock/image/upload/spot2.jpg'],
        parkingType: 'driveway',
        hourlyRate: 10,
        availableFrom: '06:00',
        availableTill: '23:30',
        isAvailable: true,
        rating: 4.4
      }
    ]);
    console.log(`Seeded ${parkingSpots.length} parking spots.`);

    // 6. Create Parking Analytics
    console.log('Creating analytics records...');
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    await ParkingAnalytics.create({
      location: 'San Francisco',
      date: yesterday,
      weather: 'Sunny',
      totalBookings: 14,
      averagePrice: 12.5,
      peakHour: '18:00',
      parkingDemand: 8
    });
    console.log('Seeded analytics.');

    console.log('Seeding process complete! Closing connection.');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(`Database seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
