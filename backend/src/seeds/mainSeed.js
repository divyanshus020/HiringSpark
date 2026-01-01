import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db.js';
import { Platform } from '../models/Platform.js';
import { User } from '../models/User.js';
import { env } from '../config/env.js';

const platforms = [
  { name: 'LinkedIn', currentPrice: 200, unit: 'PER_DAY' },
  { name: 'Naukri Std', currentPrice: 400, unit: 'FIXED' },
  { name: 'Naukri Classified', currentPrice: 850, unit: 'PER_MONTH' },
  { name: 'Times Jobs', currentPrice: 500, unit: 'PER_MONTH' },
  { name: 'IIM Jobs', currentPrice: 0, unit: 'FREE' },
  { name: 'Apna', currentPrice: 500, unit: 'FIXED' },
  { name: 'College Network', currentPrice: 200, unit: 'FIXED' },
  { name: 'Training Centre Network', currentPrice: 200, unit: 'FIXED' }
];

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('--- 🚀 Starting Database Seed ---');

    // 1. Seed Platforms
    const existingPlatforms = await Platform.countDocuments();
    if (existingPlatforms === 0) {
      await Platform.insertMany(platforms);
      console.log('✅ Platforms list initialized.');
    } else {
      console.log('ℹ️ Platforms already exist, skipping.');
    }

    // 2. Seed Admin
    const adminExists = await User.findOne({ email: env.ADMIN_EMAIL });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash(env.ADMIN_PASSWORD, 10);
      await User.create({
        email: env.ADMIN_EMAIL,
        password: hashedPassword,
        role: 'ADMIN',
        name: 'Master Admin'
      });
      console.log(`✅ Admin user created: ${env.ADMIN_EMAIL}`);
    } else {
      console.log('ℹ️ Admin user already exists, skipping.');
    }

    console.log('--- ✨ Seeding Complete ---\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();