const { sendEmail } = require('../utils/mailer');

async function sendRejectionEmail({ to, reason }) {
  const subject = 'Blood Donation Rejection Notice';
  const body = `Unfortunately, your donation was rejected due to: ${reason}`;
  await sendEmail(to, subject, body);
}

module.exports = { sendRejectionEmail };
