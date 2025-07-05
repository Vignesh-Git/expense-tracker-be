import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { seedAdminUser } from '../scripts/seedAdmin';

dotenv.config();

const mongoUri = process.env.MONGO_URI || '';

export const connectDB = async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected');
    
    // Seed admin user after successful connection
    await seedAdminUser();
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
}; 