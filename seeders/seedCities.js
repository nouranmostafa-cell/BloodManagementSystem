const { sequelize } = require('../config/db');
const City = require('../models/City');

const cities = [
  { name: 'Cairo', latitude: 30.0444, longitude: 31.2357 },
  { name: 'Giza', latitude: 30.0131, longitude: 31.2089 },
  { name: 'Alexandria', latitude: 31.2001, longitude: 29.9187 },
  { name: 'Mansoura', latitude: 31.0364, longitude: 31.3807 },
  { name: 'Tanta', latitude: 30.7865, longitude: 31.0004 },
  { name: 'Zagazig', latitude: 30.5877, longitude: 31.5020 },
  { name: 'Asyut', latitude: 27.1809, longitude: 31.1837 },
  { name: 'Minya', latitude: 28.1099, longitude: 30.7503 },
  { name: 'Faiyum', latitude: 29.3084, longitude: 30.8429 },
  { name: 'Sohag', latitude: 26.5595, longitude: 31.6959 },
  { name: 'Qena', latitude: 26.1551, longitude: 32.7160 },
  { name: 'Luxor', latitude: 25.6872, longitude: 32.6396 },
  { name: 'Aswan', latitude: 24.0889, longitude: 32.8998 },
  { name: 'Ismailia', latitude: 30.5965, longitude: 32.2715 },
  { name: 'Port Said', latitude: 31.2653, longitude: 32.3019 },
  { name: 'Suez', latitude: 29.9737, longitude: 32.5263 },
  { name: 'Beni Suef', latitude: 29.0738, longitude: 31.0994 },
  { name: 'Damietta', latitude: 31.4175, longitude: 31.8144 },
  { name: 'Damanhur', latitude: 31.0341, longitude: 30.4682 },
  { name: 'Shibin El Kom', latitude: 30.5545, longitude: 31.0094 }
];

async function seedCities() {
  await sequelize.sync({ force: false });

  for (const city of cities) {
    const existing = await City.findOne({ where: { name: city.name } });
    if (!existing) {
      await City.create(city);
      console.log(`Created city: ${city.name}`);
    } else {
      console.log(`City already exists: ${city.name}`);
    }
  }

  process.exit();
}

seedCities().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
