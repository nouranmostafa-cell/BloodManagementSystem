// =======================
// app.js
// =======================
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const { sequelize, connectDB } = require('./config/db');
require('dotenv').config();

const app = express();



sequelize.sync({ alter: true }) // <--- This updates the table schema
  .then(() => {
    console.log('Database synced');
  })
  .catch(err => {
    console.error('Sync failed:', err);
  });

// ======= Middleware =======
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// ======= Static Assets =======
app.use(express.static(path.join(__dirname, 'public')));

// ======= View Engine =======

const expressLayouts = require('express-ejs-layouts');

// View Engine Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'minimal-layout');
app.set('layout extractScripts', true);
app.set('layout extractStyles', true);

// ======= Session (Optional for role) =======
app.use(session({
  secret: process.env.SESSION_SECRET || 'bloodbank_secret',
  resave: false,
  saveUninitialized: false,
}));

// ======= Routes =======
const authRoute = require('./routes/authRoutes');
const adminRoute = require('./routes/adminRoutes');
const hospitalRoute = require('./routes/hospitalRoutes');
const bloodStaffRoute = require('./routes/bloodStaffRoutes');
const managerRoutes = require('./routes/managerRoutes');

app.use('/auth', authRoute);
app.use('/admin', adminRoute);
app.use('/hospital', hospitalRoute);
app.use('/manager', managerRoutes);
app.use('/staff', bloodStaffRoute);

// ======= Home Route =======
app.get('/', (req, res) => {
  res.redirect('/auth/login');
});

// ======= DB Sync and Start Server =======
connectDB().then(() => {
  sequelize.sync().then(() => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  });
});


// const express = require('express');
// const app = express();
// const ejsLayouts = require('express-ejs-layouts');
// const PORT = 3000;

// app.set('view engine', 'ejs');
// app.set('views', __dirname + '/views');

// app.use(ejsLayouts); // Use layouts
// app.use(express.static('public'));

// // Set default layout (optional if you always want to use this)
// app.set('layout', 'layouts/main');

// app.get('/', (req, res) => {
//   res.render('admin/dashboard', { title: 'Home Page' });
// });


// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });
