const hospitalDashboard = (req, res) => {
  res.render('hospital/dashboard', { user: req.user });
};

module.exports = { hospitalDashboard };
