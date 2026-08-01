import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// Load models
import User from '../models/User.js';
import Vehicle from '../models/Vehicle.js';
import ParkingSpace from '../models/ParkingSpace.js';
import Booking from '../models/Booking.js';
import Valet from '../models/Valet.js';
import VehicleTracking from '../models/VehicleTracking.js';
import VehicleInspection from '../models/VehicleInspection.js';
import Payment from '../models/Payment.js';
import Review from '../models/Review.js';
import Notification from '../models/Notification.js';
import ParkingAnalytics from '../models/ParkingAnalytics.js';
import AIRecommendation from '../models/AIRecommendation.js';
import Coupon from '../models/Coupon.js';
import SupportTicket from '../models/SupportTicket.js';
import ActivityLog from '../models/ActivityLog.js';
import Setting from '../models/Setting.js';

dotenv.config({ path: '../.env' });

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function runSeeder() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/volenpark_db';
    await mongoose.connect(mongoUri);
    console.log('✔ MongoDB Connected');

    // 1. One-Time Seeding Check
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('Database already seeded. Skipping insertion.');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const defaultPassword = await bcrypt.hash('123456', salt);

    // 2. Users (1 Admin, 10 Owners, 5 Providers, 8 Valets)
    const admin = new User({
      fullName: 'System Admin',
      email: 'admin@volenpark.com',
      password: defaultPassword,
      phone: '9000000000',
      role: 'admin',
      isVerified: true,
      address: { city: 'Ahmedabad', state: 'Gujarat', pincode: '380001' }
    });
    
    const ownerDocs = [];
    ownerDocs.push({
      fullName: 'Rahul Patel',
      email: 'rahul@gmail.com',
      password: defaultPassword,
      phone: '9876543210',
      role: 'car_owner',
      isVerified: true,
      address: { city: 'Ahmedabad', state: 'Gujarat', pincode: '380001' }
    });
    for (let i = 1; i < 10; i++) {
      ownerDocs.push({
        fullName: `Owner ${i+1}`,
        email: `owner${i+1}@volenpark.com`,
        password: defaultPassword,
        phone: `987654321${i}`,
        role: 'car_owner',
        isVerified: true,
        address: { city: 'Ahmedabad', state: 'Gujarat', pincode: '380001' }
      });
    }

    const providerDocs = [];
    providerDocs.push({
      fullName: 'ABC Parking Services',
      email: 'provider@volenpark.com',
      password: defaultPassword,
      phone: '9898989898',
      role: 'parking_provider',
      isVerified: true,
      address: { city: 'Ahmedabad', state: 'Gujarat', pincode: '380015' }
    });
    for (let i = 1; i < 5; i++) {
      providerDocs.push({
        fullName: `Provider ${i+1}`,
        email: `provider${i+1}@volenpark.com`,
        password: defaultPassword,
        phone: `989898989${i}`,
        role: 'parking_provider',
        isVerified: true,
        address: { city: 'Ahmedabad', state: 'Gujarat', pincode: '380015' }
      });
    }

    const valetDocs = [];
    valetDocs.push({
      fullName: 'Amit Sharma',
      email: 'valet@volenpark.com',
      password: defaultPassword,
      phone: '9999999999',
      role: 'valet_driver',
      isVerified: true,
      address: { city: 'Ahmedabad', state: 'Gujarat', pincode: '380054' }
    });
    for (let i = 1; i < 8; i++) {
      valetDocs.push({
        fullName: `Valet ${i+1}`,
        email: `valet${i+1}@volenpark.com`,
        password: defaultPassword,
        phone: `999999999${i}`,
        role: 'valet_driver',
        isVerified: true,
        address: { city: 'Ahmedabad', state: 'Gujarat', pincode: '380054' }
      });
    }

    await admin.save();
    const insertedOwners = await User.insertMany(ownerDocs);
    const insertedProviders = await User.insertMany(providerDocs);
    const insertedValets = await User.insertMany(valetDocs);
    await User.updateMany({ _id: { $in: [...insertedOwners, ...insertedProviders, ...insertedValets].map(u => u._id) } }, { password: defaultPassword });
    
    console.log('✔ Users Inserted');

    // 3. Vehicles
    const vehiclesData = [];
    for (let i = 0; i < 15; i++) {
      vehiclesData.push({
        ownerId: getRandomItem(insertedOwners)._id,
        vehicleNumber: `GJ01AB123${i}`,
        brand: 'Toyota',
        model: 'Fortuner',
        color: 'Black',
        vehicleType: 'SUV',
        rcBook: 'cloudinary_url',
        images: {
          front: 'front.jpg', rear: 'rear.jpg', left: 'left.jpg',
          right: 'right.jpg', dashboard: 'dashboard.jpg', odometer: 'odometer.jpg'
        }
      });
    }
    const insertedVehicles = await Vehicle.insertMany(vehiclesData);
    console.log('✔ Vehicles Inserted');

    // 4. Parking Spaces
    const spacesData = [];
    spacesData.push({
      providerId: insertedProviders[0]._id,
      parkingName: 'Alpha Mall Parking',
      description: 'Covered parking',
      address: 'Satellite Road, Ahmedabad',
      location: { latitude: 23.0321, longitude: 72.5256 },
      vehicleTypes: ['Car', 'SUV'],
      images: ['image1.jpg', 'image2.jpg'],
      totalSlots: 30,
      availableSlots: 18,
      hourlyPrice: 60,
      dailyPrice: 400,
      openingTime: '08:00',
      closingTime: '23:00',
      rating: 4.8,
      status: 'active'
    });
    for (let i = 1; i < 20; i++) {
      spacesData.push({
        providerId: getRandomItem(insertedProviders)._id,
        parkingName: `Mall Parking ${i}`,
        description: 'Covered parking',
        address: 'CG Road, Ahmedabad',
        location: { latitude: 23.03 + (Math.random() * 0.05), longitude: 72.52 + (Math.random() * 0.05) },
        vehicleTypes: ['Car', 'SUV'],
        images: ['img.jpg'],
        totalSlots: 50,
        availableSlots: 32,
        hourlyPrice: 50,
        dailyPrice: 300,
        openingTime: '06:00',
        closingTime: '23:59',
        rating: 4.5,
        status: 'active'
      });
    }
    const insertedSpaces = await ParkingSpace.insertMany(spacesData);
    console.log('✔ Parking Spaces Inserted');

    // 5. Valet Drivers Profiles
    const valetProfiles = insertedValets.map((v, i) => ({
      userId: v._id,
      licenseNumber: `DL12345${i}`,
      aadhaarNumber: '1234 5678 9012',
      experience: 4,
      rating: 4.9,
      online: true,
      currentLocation: { latitude: 23.04, longitude: 72.52 },
      completedJobs: 321,
      totalEarnings: 89000
    }));
    const insertedValetProfiles = await Valet.insertMany(valetProfiles);
    console.log('✔ Valets Inserted');

    // 6. Bookings
    const bookingsData = [];
    for (let i = 0; i < 30; i++) {
      const owner = getRandomItem(insertedOwners);
      const vehicle = insertedVehicles.find(v => v.ownerId.toString() === owner._id.toString()) || insertedVehicles[0];
      const space = getRandomItem(insertedSpaces);
      const valetProf = getRandomItem(insertedValetProfiles);

      bookingsData.push({
        bookingId: `BK100${i+1}`,
        ownerId: owner._id,
        parkingId: space._id,
        vehicleId: vehicle._id,
        valetId: valetProf._id,
        bookingDate: '2026-07-30',
        startTime: '10:00',
        endTime: '14:00',
        duration: 4,
        totalAmount: 240,
        paymentStatus: 'paid',
        bookingStatus: 'confirmed'
      });
    }
    const insertedBookings = await Booking.insertMany(bookingsData);
    console.log('✔ Bookings Inserted');

    // 7. Vehicle Tracking
    const trackingData = insertedBookings.slice(0, 10).map(b => ({
      bookingId: b._id,
      valetId: b.valetId,
      currentLocation: { latitude: 23.02, longitude: 72.56 },
      eta: '8 Minutes',
      status: 'moving_to_parking'
    }));
    await VehicleTracking.insertMany(trackingData);
    console.log('✔ Vehicle Tracking Inserted');

    // 8. Vehicle Inspection
    const inspectionData = insertedBookings.slice(0, 10).map(b => ({
      bookingId: b._id,
      beforeImages: { front: '', rear: '', left: '', right: '', dashboard: '', odometer: '' },
      afterImages: {},
      damageDetected: false,
      aiConfidence: 98
    }));
    await VehicleInspection.insertMany(inspectionData);
    console.log('✔ Vehicle Inspection Inserted');

    // 9. Payments
    const paymentsData = insertedBookings.map((b, index) => ({
      bookingId: b._id,
      ownerId: b.ownerId,
      amount: b.totalAmount,
      paymentMethod: 'UPI',
      transactionId: `TX98765${index}`,
      paymentStatus: 'Success'
    }));
    await Payment.insertMany(paymentsData);
    console.log('✔ Payments Inserted');

    // 10. Reviews
    const reviewsData = insertedBookings.map(b => ({
      bookingId: b._id,
      fromUser: b.ownerId,
      toUser: insertedValetProfiles.find(v => v._id.toString() === b.valetId.toString()).userId,
      rating: 5,
      comment: 'Excellent service'
    }));
    await Review.insertMany(reviewsData);
    console.log('✔ Reviews Inserted');

    // 11. Notifications
    const notificationsData = insertedBookings.slice(0, 15).map(b => ({
      userId: b.ownerId,
      title: 'Vehicle Parked',
      message: 'Your vehicle has been parked successfully.',
      type: 'booking',
      isRead: false
    }));
    await Notification.insertMany(notificationsData);
    console.log('✔ Notifications Inserted');

    // 12. Analytics
    const analyticsData = [{
      location: 'Ahmedabad',
      date: '2026-07-30',
      bookings: 180,
      revenue: 12500,
      averagePrice: 70,
      peakHour: '7 PM',
      weather: 'Cloudy'
    }];
    await ParkingAnalytics.insertMany(analyticsData);
    console.log('✔ Analytics Inserted');

    // 13. AI Recommendations
    const recommendationsData = insertedOwners.slice(0, 10).map(o => ({
      ownerId: o._id,
      recommendedParking: getRandomItem(insertedSpaces)._id,
      distance: '350m',
      predictedDemand: 'High',
      suggestedPrice: 75,
      aiScore: 97
    }));
    await AIRecommendation.insertMany(recommendationsData);
    console.log('✔ AI Recommendations Inserted');

    // 14. Coupons
    const couponsData = [
      { code: 'WELCOME50', discountPercentage: 50, maxDiscountAmount: 200, validUntil: new Date(2027, 1, 1) },
      { code: 'PARK10', discountPercentage: 10, maxDiscountAmount: 50, validUntil: new Date(2027, 1, 1) },
      { code: 'FESTIVE20', discountPercentage: 20, maxDiscountAmount: 100, validUntil: new Date(2027, 1, 1) },
      { code: 'FIRST100', discountPercentage: 100, maxDiscountAmount: 100, validUntil: new Date(2027, 1, 1) },
      { code: 'NIGHTPARK', discountPercentage: 30, maxDiscountAmount: 150, validUntil: new Date(2027, 1, 1) }
    ];
    await Coupon.insertMany(couponsData);
    console.log('✔ Coupons Inserted');

    // 15. Support Tickets
    const ticketsData = [];
    for (let i = 0; i < 10; i++) {
      ticketsData.push({
        userId: getRandomItem(insertedOwners)._id,
        subject: getRandomItem(['Payment failed', 'Valet was late', 'App crashing', 'Refund request']),
        description: 'Customer facing issue with recent booking.',
        status: getRandomItem(['Open', 'In Progress', 'Resolved', 'Closed']),
        priority: getRandomItem(['Low', 'Medium', 'High'])
      });
    }
    await SupportTicket.insertMany(ticketsData);
    console.log('✔ Support Tickets Inserted');

    // 16. Activity Logs
    const activityLogsData = [];
    for (let i = 0; i < 20; i++) {
      activityLogsData.push({
        userId: getRandomItem(insertedOwners)._id,
        action: getRandomItem(['Login', 'Booking Created', 'Payment Processed']),
        ipAddress: `192.168.1.1`
      });
    }
    await ActivityLog.insertMany(activityLogsData);
    console.log('✔ Activity Logs Inserted');

    // 17. Settings
    const settingsData = [{
      platformFeePercentage: 10,
      valetCommissionPercentage: 15,
      enableAI: true,
      maintenanceMode: false
    }];
    await Setting.insertMany(settingsData);
    console.log('✔ Settings Inserted');

    console.log('✔ Database Seed Completed Successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

runSeeder();
