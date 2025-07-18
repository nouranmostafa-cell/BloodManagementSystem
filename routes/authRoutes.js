const express = require('express');
const router = express.Router();
const { login, logout } = require('../controllers/authController');

router.post('/login', login);
router.get('/logout', logout);



router.get('/login', (req, res) => {
    res.render('auth/login', { 
        title: 'Login - Blood Bank System',
    });
});


module.exports = router;