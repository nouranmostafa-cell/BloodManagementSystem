const managerDashboard = (req, res) => {
  res.render('manager/dashboard', { 
    title: 'Manager Dashboard',
    user: req.user 
  });
};

module.exports = { managerDashboard };
