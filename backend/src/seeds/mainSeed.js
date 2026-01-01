import bcrypt from 'bcryptjs';
import { Platform } from '../models/Platform.js';
import { User } from '../models/User.js';
import { Plan } from '../models/Plan.js';
import connectDB from '../config/db.js';

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('--- 🚀 Starting Database Seed ---');

    // 1. Seed Platforms
    const platformData = [
      { name: 'LinkedIn', currentPrice: 200, unit: 'PER_DAY' },
      { name: 'Naukri Std', currentPrice: 400, unit: 'FIXED' },
      { name: 'Naukri Classified', currentPrice: 850, unit: 'PER_MONTH' },
      { name: 'Times Jobs', currentPrice: 500, unit: 'PER_MONTH' },
      { name: 'IIM Jobs', currentPrice: 0, unit: 'FREE' },
      { name: 'Apna', currentPrice: 500, unit: 'FIXED' },
      { name: 'College Network', currentPrice: 200, unit: 'FIXED' },
      { name: 'Training Centre Network', currentPrice: 200, unit: 'FIXED' },
      { name: 'Job Board', currentPrice: 300, unit: 'FIXED' },
      { name: 'Our Network', currentPrice: 250, unit: 'FIXED' }
    ];

    await Platform.deleteMany({});
    await Platform.insertMany(platformData);
    console.log(`✅ ${platformData.length} platforms seeded.`);

    // 2. Seed Plans
    const planData = [
      {
        name: 'basic',
        displayName: 'Basic Plan',
        description: 'Pay per platform posting',
        features: [
          'Choose platforms individually',
          'Pay as you go',
          'Flexible duration',
          'Detailed analytics'
        ],
        isActive: true
      },
      {
        name: 'premium',
        displayName: 'Premium Plan',
        description: 'All platforms included',
        features: [
          'All platforms included',
          'Unlimited posting for 30 days',
          'Priority support',
          'Advanced analytics',
          'Resume database access'
        ],
        isActive: true
      }
    ];

    await Plan.deleteMany({});
    await Plan.insertMany(planData);
    console.log(`✅ ${planData.length} plans seeded.`);

    // 3. Seed Admin User
    const adminExists = await User.findOne({ email: 'admin@gmail.com' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        fullName: 'Admin User',
        email: 'admin@recruit.com',
        phone: '9999999999',
        password: hashedPassword,
        role: 'ADMIN',
        orgName: 'Recruitment Admin',
        address: 'Mumbai, India'
      });
      console.log('✅ Admin user created: admin@recruit.com / Admin@123');
    }

    // 4. Seed Test HR Users
    const hrUsers = [
      {
        fullName: 'Rahul Sharma',
        email: 'rahul@techcorp.com',
        phone: '9876543210',
        password: 'Password@123',
        role: 'HR',
        orgName: 'TechCorp Pvt Ltd',
        address: 'Bangalore, Karnataka'
      },
      {
        fullName: 'Priya Singh',
        email: 'priya@innovate.com',
        phone: '9876543211',
        password: 'Password@123',
        role: 'HR',
        orgName: 'Innovate Solutions',
        address: 'Delhi, India'
      },
      {
        fullName: 'Amit Patel',
        email: 'amit@globaltech.com',
        phone: '9876543212',
        password: 'Password@123',
        role: 'HR',
        orgName: 'Global Tech',
        address: 'Pune, Maharashtra'
      }
    ];

    for (const hrUser of hrUsers) {
      const exists = await User.findOne({ email: hrUser.email });
      if (!exists) {
        const hashedPassword = await bcrypt.hash(hrUser.password, 10);
        await User.create({
          ...hrUser,
          password: hashedPassword
        });
        console.log(`✅ HR User created: ${hrUser.email} / ${hrUser.password}`);
      }
    }

    // 5. Create Sample Jobs for HR
    const Job = (await import('../models/Job.js')).Job;
    const jobsData = [
      {
        jobTitle: 'Senior Full Stack Developer',
        companyName: 'TechCorp Pvt Ltd',
        location: 'Bangalore',
        jobType: 'full-time',
        minExp: 5,
        maxExp: 10,
        openings: 3,
        minSalary: 1500000,
        maxSalary: 2500000,
        description: 'We are looking for a skilled Full Stack Developer with experience in MERN stack.',
        requirements: ['B.Tech in Computer Science', '5+ years experience', 'Strong problem-solving skills'],
        skills: ['React', 'Node.js', 'MongoDB', 'Express', 'AWS'],
        plan: 'basic',
        pricing: [
          { platform: 'LinkedIn', pricePerDay: 200, days: 7, total: 1400 },
          { platform: 'Naukri Std', pricePerDay: 400, days: 1, total: 400 }
        ],
        contactPerson: 'Rahul Sharma',
        companyEmail: 'rahul@techcorp.com',
        preferredDate: new Date('2024-02-01'),
        note: 'Urgent hiring',
        status: 'pending',
        totalAmount: 1800,
        currentStep: 4
      },
      {
        jobTitle: 'Product Manager',
        companyName: 'Innovate Solutions',
        location: 'Remote',
        jobType: 'full-time',
        minExp: 3,
        maxExp: 8,
        openings: 2,
        minSalary: 1200000,
        maxSalary: 2000000,
        description: 'Looking for a Product Manager to drive product strategy.',
        requirements: ['MBA preferred', '3+ years in product management', 'Strong analytical skills'],
        skills: ['Product Strategy', 'User Research', 'Agile', 'Data Analysis'],
        plan: 'premium',
        pricing: [],
        contactPerson: 'Priya Singh',
        companyEmail: 'priya@innovate.com',
        preferredDate: new Date('2024-01-25'),
        note: 'Immediate joining preferred',
        status: 'posted',
        totalAmount: 5000,
        currentStep: 4
      }
    ];

    // Get HR users
    const hrUsersList = await User.find({ role: 'HR' }).limit(2);
    
    for (let i = 0; i < Math.min(jobsData.length, hrUsersList.length); i++) {
      const job = jobsData[i];
      const hrUser = hrUsersList[i];
      
      const existingJob = await Job.findOne({ 
        jobTitle: job.jobTitle,
        userId: hrUser._id 
      });
      
      if (!existingJob) {
        await Job.create({
          ...job,
          userId: hrUser._id
        });
        console.log(`✅ Job created: ${job.jobTitle} for ${hrUser.email}`);
      }
    }

    console.log('--- ✅ Seeding Complete Successfully ---');
    console.log('\n📋 Test Credentials:');
    console.log('Admin: admin@gmail.com / admin123');
    console.log('HR 1: rahul@techcorp.com / Password@123');
    console.log('HR 2: priya@innovate.com / Password@123');
    console.log('HR 3: amit@globaltech.com / Password@123');
    console.log('\nRun: npm run seed\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();