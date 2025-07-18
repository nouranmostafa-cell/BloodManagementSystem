const BloodRequest = require('../models/BloodRequest');
const BloodStock = require('../models/BloodStock');
const { Op } = require('sequelize');

async function matchRequestsToStock(requests) {
  const fulfilledRequests = [];
  const remainingStock = await BloodStock.findAll({ where: { expiration_date: { [Op.gt]: new Date() } } });

  for (const request of requests) {
    const match = remainingStock.find(stock =>
      stock.blood_type === request.blood_type && stock.city === request.request_city
    );

    if (match) {
      request.fulfilled = true;
      await request.save();
      await match.destroy();
      fulfilledRequests.push(request);
    }
  }

  return fulfilledRequests;
}

module.exports = { matchRequestsToStock };
