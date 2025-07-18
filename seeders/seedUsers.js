// seedUsers.js
const bcrypt = require('bcrypt');
const { sequelize } = require('../config/db');
const { User, Hospital, City } = require('../models'); // Adjust if your models are in index.js

async function seedUsers() {
  await sequelize.sync({ force: false });

  // Get cities by name (assumes cities already seeded)
  const cairo = await City.findOne({ where: { name: 'Cairo' } });
  const alex = await City.findOne({ where: { name: 'Alexandria' } });
  const mansoura = await City.findOne({ where: { name: 'Mansoura' } });

  const users = [
    {
      email: 'admin@example.com',
      password: await bcrypt.hash('admin123', 10),
      role: 'admin'
    },
    {
      email: 'hospital1@example.com',
      password: await bcrypt.hash('hospital123', 10),
      role: 'hospital',
      hospital: {
        name: 'Cairo Hospital',
        city_id: cairo?.id
      }
    },
    {
      email: 'hospital2@example.com',
      password: await bcrypt.hash('hospital123', 10),
      role: 'hospital',
      hospital: {
        name: 'Alex Hospital',
        city_id: alex?.id
      }
    },
    {
      email: 'hospital3@example.com',
      password: await bcrypt.hash('hospital123', 10),
      role: 'hospital',
      hospital: {
        name: 'Mansoura Hospital',
        city_id: mansoura?.id
      }
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

  for (const userData of users) {
    const existing = await User.findOne({ where: { email: userData.email } });

    if (!existing) {
      const { hospital, ...userFields } = userData;
      const createdUser = await User.create(userFields);
      console.log(`Created user: ${userData.email}`);

      if (userData.role === 'hospital' && hospital) {
        await Hospital.create({
          name: hospital.name,
          email: userData.email,
          city_id: hospital.city_id,
          user_id: createdUser.id
        });
        console.log(`→ Created hospital: ${hospital.name}`);
      }

    } else {
      console.log(`User already exists: ${userData.email}`);
    }
  }

  process.exit(); // Exit script
}

seedUsers().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
