const { BloodRequest, BloodStock, Donation, Donor, Hospital, City } = require('../models');

const { Op } = require('sequelize');
const { sendEmail } = require('../utils/mailer.js');

// Blood compatibility map (recipient -> compatible donors ranked)
const BLOOD_COMPATIBILITY = {
  'O-': ['O-'],
  'O+': ['O+', 'O-'],
  'A-': ['A-', 'O-'],
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'AB-': ['AB-', 'A-', 'B-', 'O-'],
  'AB+': ['AB+', 'AB-', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-']
};

// Distance calculator (Haversine formula in km)
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const toRad = deg => deg * (Math.PI / 180);
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const matchRequests = async () => {
  try {
    console.log('🔄 Starting blood request matching process...');

    const requests = await BloodRequest.findAll({
      where: {
        status: 'Pending',
        fulfilled: false
      },
      include: [
        {
          model: Hospital,
          required: true,
          include: [{
            model: City,
            required: true,
            attributes: ['id', 'name', 'latitude', 'longitude']
          }]
        }
      ],
      order: [
        ['patient_status', 'DESC'],
        ['createdAt', 'ASC']
      ]
    });

    console.log(`📦 Found ${requests.length} pending requests`);

    const fulfilled = [];

    for (const request of requests) {
      console.log(`\n➡️ Processing request ID: ${request.id}`);
      console.log(`🏥 Hospital: ${request.Hospital.name} (${request.Hospital.City.name})`);
      console.log(`🩸 Requested Blood Type: ${request.blood_type}`);
      console.log(`❗ Quantity Needed: ${request.quantity}`);
      console.log(`🚑 Patient Status: ${request.patient_status}`);

      const compatibleTypes = BLOOD_COMPATIBILITY[request.blood_type] || [];
      console.log(`✅ Compatible Donor Types: ${compatibleTypes.join(', ')}`);

      const stocks = await BloodStock.findAll({
        where: {
          blood_type: { [Op.in]: compatibleTypes }
        },
        include: [{
          model: Donation,
          required: true,
          include: [{
            model: City,
            required: true,
            attributes: ['id', 'name', 'latitude', 'longitude']
          }]
        }]
      });

      console.log(`🗃️ Found ${stocks.length} matching stock units across all cities`);

      const stocksByCity = stocks.reduce((acc, stock) => {
        const donorCity = stock.Donation.City;
        const hospitalCity = request.Hospital.City;

        const distance = getDistance(
          hospitalCity.latitude,
          hospitalCity.longitude,
          donorCity.latitude,
          donorCity.longitude
        );

        const priority = compatibleTypes.indexOf(stock.blood_type);
        const cityId = donorCity.id;

        if (!acc[cityId]) {
          acc[cityId] = {
            stocks: [],
            distance,
            priority,
            cityName: donorCity.name
          };
        }
        acc[cityId].stocks.push(stock);
        return acc;
      }, {});

      const sortedCities = Object.values(stocksByCity)
        .sort((a, b) => {
          if (a.priority !== b.priority) return a.priority - b.priority;
          return a.distance - b.distance;
        });

      console.log('📍 Sorted cities by compatibility and distance:');
      sortedCities.forEach((city, index) => {
        console.log(`   ${index + 1}. ${city.cityName} — ${city.stocks.length} units — ${city.distance.toFixed(2)} km`);
      });

      let matched = false;

      for (const city of sortedCities) {
        if (city.stocks.length >= request.quantity) {
          const stocksToUse = city.stocks.slice(0, request.quantity);

          console.log(`✅ Matching from ${city.cityName}: using ${stocksToUse.length} units`);

          await Promise.all(stocksToUse.map(stock => stock.destroy()));

          request.status = 'Fulfilled';
          request.fulfilled = true;
          request.fulfilled_at = new Date();
          await request.save();

          await sendEmail(
            request.Hospital.email,
            'Blood Request Fulfilled',
            `Your request for ${request.quantity} units of ${request.blood_type} blood has been fulfilled from ${city.cityName}.`
          );

          console.log(`📬 Email sent to ${request.Hospital.email}`);

          fulfilled.push({
            requestId: request.id,
            hospitalName: request.Hospital.name,
            bloodType: request.blood_type,
            requestCity: request.Hospital.City.name,
            matchedStockCity: city.cityName,
            quantity: request.quantity,
            distance: Math.round(city.distance)
          });

          matched = true;
          break;
        } else {
          console.log(`⚠️ ${city.cityName} has only ${city.stocks.length} units. Not enough.`);
        }
      }

      if (!matched) {
        console.log(`❌ Could not fulfill request ID: ${request.id}`);
      }
    }

    console.log(`\n✅ Matching complete. Fulfilled ${fulfilled.length} request(s).`);

    return fulfilled;

  } catch (error) {
    console.error('❌ Error during matchRequests:', error);
    throw error;
  }
};

module.exports = matchRequests;
