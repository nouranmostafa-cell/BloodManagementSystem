// routes/hospitalRoutes.js
const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const { hospitalDashboard } = require('../controllers/hospitalController');


router.use(verifyToken);
router.use(authorizeRoles('hospital'));

// Controller placeholders
// router.get('/new', (req, res) => {
//   res.render('hospital/requestForm', { title: 'Request Blood' });
// });

router.get('/dashboard', hospitalDashboard);


// router.get('/my', (req, res) => {
//   // Fetch this hospital's previous requests
//   res.render('hospital/myRequests', { title: 'My Requests', requests: [] });
// });

module.exports = router;
