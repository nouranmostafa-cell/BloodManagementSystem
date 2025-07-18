const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const stockManagerController = require('../controllers/stockManagerController');


router.use(verifyToken);
router.use(authorizeRoles('manager'));


// Manager dashboard
// Dashboard
router.get('/dashboard', stockManagerController.dashboard);

// Blood Stock
router.get('/stock', stockManagerController.viewStock);
router.get('/search', stockManagerController.searchStock);
router.post('/remove-expired', stockManagerController.removeExpiredUnits);

// Donation Logs
router.get('/donations', stockManagerController.viewDonations);
router.get('/donations/search', stockManagerController.searchDonations);

// Hospital Requests

// Hospital Requests
router.get('/requests', stockManagerController.viewRequests);
router.get('/requests/search', stockManagerController.searchRequests);
router.post('/requests/process-matches', stockManagerController.processMatches);
router.post('/requests/:id/accept', stockManagerController.acceptRequest);
router.post('/requests/:id/reject', stockManagerController.rejectRequest);


module.exports = router;