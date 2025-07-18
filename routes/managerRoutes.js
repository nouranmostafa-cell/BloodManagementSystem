const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const { managerDashboard } = require('../controllers/stockManagerController');


router.use(verifyToken);
router.use(authorizeRoles('manager'));


// Manager dashboard
router.get('/dashboard', managerDashboard);


module.exports = router;