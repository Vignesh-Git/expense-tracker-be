import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User';

// Load environment variables
dotenv.config();

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/expensesync';

/**
 * Standalone script to seed admin user
 * Run with: npx ts-node src/scripts/seedAdmin.ts
 */
export const seedAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(mongoUri);
    console.log('🔗 Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@gmail.com' });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      console.log('📧 Email: admin@gmail.com');
      console.log('👤 Role: admin');
      return;
    }

    // Hash the password using bcrypt
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash('admin', saltRounds);

    // Create admin user
    const adminUser = new User({
      email: 'admin@gmail.com',
      password: hashedPassword,
      name: 'Administrator',
      role: 'admin',
      createdAt: new Date()
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully');
    console.log('📧 Email: admin@gmail.com');
    console.log('🔑 Password: admin');
    console.log('👤 Role: admin');
    console.log('🔐 Password hashed with bcrypt (salt rounds: 12)');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    // Close database connection
    // await mongoose.connection.close();
    // console.log('🔌 Database connection closed');
  }
};

// Run the seed function
// seedAdminUser(); 