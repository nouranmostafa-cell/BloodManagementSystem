const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).send('Invalid credentials');
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 86400000, 
    });

    if (user.role === 'admin') {
      return res.redirect('/admin/dashboard');
    } else if (user.role === 'hospital') {
      return res.redirect('/hospital/dashboard');
    } else if (user.role === 'blood_staff') {
      return res.redirect('/staff/dashboard');
    }
    else if (user.role === 'manager') {
      console.log("manager")
      return res.redirect('/manager/dashboard');
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).send('Internal server error');
  }
};

const logout = (req, res) => {
  res.clearCookie('token');
  res.redirect('/login'); 
};

module.exports = { login, logout };
