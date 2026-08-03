import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import ParkingSpace from './models/ParkingSpace.js';
import Booking from './models/Booking.js';
import Vehicle from './models/Vehicle.js';

dotenv.config();

async function seedData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    // Find the user (Mahek Tumbadiya1 or Sneha)
    const provider = await User.findOne({ email: 'mahek28@gmail.com' }) || await User.findOne({ email: 'sneha11@gmail.com' });
    if (!provider) {
      console.log('Provider not found. Please register an account first.');
      process.exit(1);
    }

    const owner = await User.findOne({ email: 'sneha11@gmail.com' }) || provider;

    // Create a mock vehicle if not exists
    let vehicle = await Vehicle.findOne({ ownerId: owner._id });
    if (!vehicle) {
      vehicle = await Vehicle.create({
        ownerId: owner._id,
        vehicleType: 'car',
        brand: 'Tesla',
        model: 'Model S',
        vehicleNumber: 'ABC-1234',
        color: 'Red'
      });
      console.log('Mock vehicle created');
    }

    // Create a mock parking space
    let spot = await ParkingSpace.findOne({ providerId: provider._id });
    if (!spot) {
      spot = await ParkingSpace.create({
        providerId: provider._id,
        parkingName: 'Premium Downtown Garage',
        description: 'Secure, covered parking in the heart of the city.',
        address: '123 Main St, City Center',
        location: { latitude: 23.0225, longitude: 72.5714 },
        vehicleTypes: ['Car', 'SUV'],
        images: ['https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg'],
        totalSlots: 10,
        availableSlots: 8,
        hourlyPrice: 50,
        dailyPrice: 300,
        openingTime: '06:00',
        closingTime: '23:00',
        status: 'active'
      });
      console.log('Mock parking space created');
    }

    // Create a few mock bookings
    const existingBookings = await Booking.find({ parkingId: spot._id });
    if (existingBookings.length === 0) {
      await Booking.create([
        {
          bookingId: 'BKG-' + Date.now() + '-1',
          ownerId: owner._id,
          parkingId: spot._id,
          vehicleId: vehicle._id,
          bookingDate: new Date().toISOString().split('T')[0],
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          duration: 2,
          totalAmount: 100,
          paymentStatus: 'paid',
          bookingStatus: 'pending' // This will show up in Valet "Available Jobs"
        },
        {
          bookingId: 'BKG-' + Date.now() + '-2',
          ownerId: owner._id,
          parkingId: spot._id,
          vehicleId: vehicle._id,
          bookingDate: new Date().toISOString().split('T')[0],
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
          duration: 4,
          totalAmount: 200,
          paymentStatus: 'pending',
          bookingStatus: 'confirmed'
        }
      ]);
      console.log('Mock bookings created');
    } else {
      console.log('Bookings already exist');
    }

    console.log('Data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedData();
