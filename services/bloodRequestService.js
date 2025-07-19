const { BloodRequest, Hospital, City, BloodStock } = require('../models');
const { Op } = require('sequelize');
const { sendEmail } = require('../utils/mailer.js');

class BloodRequestService {
  async getAllRequests() {
    return await BloodRequest.findAll({
      include: [{
        model: Hospital,
        include: [City]
      }],
      order: [['createdAt', 'DESC']]
    });
  }

  async searchRequests({ blood_type, city_id, patient_status }) {
    const whereClause = {};
    if (blood_type) whereClause.blood_type = blood_type;
    if (patient_status) whereClause.patient_status = patient_status;

    return await BloodRequest.findAll({
  where: whereClause,
  include: [{
    model: Hospital,
    required: true,
    include: [{
      model: City,
      ...(city_id && {
        where: { id: city_id },
        required: true  // ✅ Only return if city matches
      })
    }]
  }],
  order: [['createdAt', 'DESC']]
});
  }

  async acceptRequest(requestId) {
    const request = await BloodRequest.findByPk(requestId, {
      include: [Hospital]
    });

    if (!request) {
      throw new Error('Request not found');
    }

    const available = await BloodStock.findOne({
      where: {
        blood_type: request.blood_type,
        quantity: { [Op.gte]: request.quantity }
      }
    });

    if (!available) {
      throw new Error('Insufficient stock');
    }

    await available.decrement('quantity', { by: request.quantity });
    await request.update({ 
      fulfilled: true,
      status: 'Approved'
    });

    // Send email notification
    await sendEmail(
      request.Hospital.email,
      'Blood Request Approved',
      `Your request for ${request.quantity} units of ${request.blood_type} blood has been approved.`
    );

    return request;
  }

  async rejectRequest(requestId, reason) {
    const request = await BloodRequest.findByPk(requestId, {
      include: [Hospital]
    });

    if (!request) {
      throw new Error('Request not found');
    }

    await request.update({
      fulfilled: false,
      status: 'Rejected',
      rejection_reason: reason
    });

    // Send email notification
    await sendEmail(
      request.Hospital.email,
      'Blood Request Rejected',
      `Your request for ${request.quantity} units of ${request.blood_type} blood was rejected. Reason: ${reason}`
    );

    return request;
  }
}

module.exports = new BloodRequestService();