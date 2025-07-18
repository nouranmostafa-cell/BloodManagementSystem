// routes/hospitalRoutes.js
const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const hospitalController = require('../controllers/hospitalController');


router.use(verifyToken);
router.use(authorizeRoles('hospital'));



// Show form
router.get('/requestForm', hospitalController.showRequestForm);

// Handle form submission
router.post('/requestForm', hospitalController.submitRequest);

// Show dashboard with request stats
router.get('/dashboard', hospitalController.dashboard);

// Show hospital's requests
router.get('/my-requests', hospitalController.viewMyRequests);

module.exports = router;
