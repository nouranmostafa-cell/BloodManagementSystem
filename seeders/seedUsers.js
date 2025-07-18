// seedUsers.js
const bcrypt = require('bcrypt');
const { sequelize } = require('../config/db');
const User = require('../models/User');

async function seedUsers() {
  await sequelize.sync({ force: false }); 

  const users = [
    {
      email: 'admin@example.com',
      password: await bcrypt.hash('admin123', 10),
      role: 'admin'
    },
    {
      email: 'hospital@example.com',
      password: await bcrypt.hash('hospital123', 10),
      role: 'hospital'
    },
    {
      email: 'staff@example.com',
      password: await bcrypt.hash('staff123', 10),
      role: 'blood_staff'
    },
    {
      email: 'manager@example.com',
      password: await bcrypt.hash('manager123', 10),
      role: 'manager'
    },

  ];

  for (const user of users) {
    const existing = await User.findOne({ where: { email: user.email } });
    if (!existing) {
      await User.create(user);
      console.log(`Created user: ${user.email}`);
    } else {
      console.log(`User already exists: ${user.email}`);
    }
  }

  process.exit(); // Exit script
}

seedUsers().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
