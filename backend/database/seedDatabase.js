import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const collections = [
    "users",
    "vehicles",
    "parking_spaces",
    "bookings",
    "valets",
    "vehicle_tracking",
    "vehicle_inspection",
    "payments",
    "reviews",
    "notifications",
    "analytics",
    "ai_recommendations",
    "support_tickets",
    "activity_logs",
    "settings"
];

async function createDatabase() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("✅ MongoDB Connected");

        const db = mongoose.connection.db;

        const existing = await db.listCollections().toArray();
        const existingNames = existing.map(c => c.name);

        for (const collection of collections) {
            if (!existingNames.includes(collection)) {
                await db.createCollection(collection);
                console.log(`✅ Created: ${collection}`);
            } else {
                console.log(`✔ Already Exists: ${collection}`);
            }
        }

        console.log("\n🎉 Database Ready");

        process.exit();
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
}

createDatabase();