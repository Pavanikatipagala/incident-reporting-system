/**
 * One-time (or idempotent) seed: departments, admin, department staff accounts.
 * Run: npm run seed  (requires MongoDB and .env with MONGODB_URI & JWT_SECRET)
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Department = require('./models/Department');

const departmentsData = [
  { name: 'Road Department', code: 'ROAD' },
  { name: 'Water Department', code: 'WATER' },
  { name: 'Electricity Department', code: 'ELECTRICITY' },
  { name: 'Sanitation Department', code: 'SANITATION' },
];

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Set MONGODB_URI in .env');
    process.exit(1);
  }
  await mongoose.connect(uri);
  console.log('Connected. Seeding...');

  const deptMap = {};
  for (const d of departmentsData) {
    const doc = await Department.findOneAndUpdate(
      { code: d.code },
      { $setOnInsert: d },
      { upsert: true, new: true }
    );
    deptMap[d.code] = doc;
  }

  const adminEmail = 'admin@gov.local';
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = await User.create({
      name: 'System Admin',
      email: adminEmail,
      password: 'Admin@123',
      role: 'admin',
    });
    console.log('Admin created:', adminEmail, '/ Admin@123');
  } else {
    console.log('Admin already exists:', adminEmail);
  }

  const deptUsers = [
    { name: 'Road Officer', email: 'road@gov.local', code: 'ROAD' },
    { name: 'Water Officer', email: 'water@gov.local', code: 'WATER' },
    { name: 'Electricity Officer', email: 'electric@gov.local', code: 'ELECTRICITY' },
    { name: 'Sanitation Officer', email: 'sanitation@gov.local', code: 'SANITATION' },
  ];

  for (const u of deptUsers) {
    const exists = await User.findOne({ email: u.email });
    if (!exists) {
      await User.create({
        name: u.name,
        email: u.email,
        password: 'Dept@123',
        role: 'department',
        department: deptMap[u.code]._id,
      });
      console.log('Department user:', u.email, '/ Dept@123');
    }
  }

  console.log('Seed complete.');
  await mongoose.disconnect();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
