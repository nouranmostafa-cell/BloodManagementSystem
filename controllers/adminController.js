const adminDashboard = (req, res) => {
  res.render('admin/dashboard', 
    { user: req.user ,
      title: 'Admin Dashboard'
    });
};

module.exports = { adminDashboard };
