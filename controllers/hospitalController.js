const BloodRequest = require('../models/BloodRequest');
const Hospital = require('../models/Hospital');
const User = require('../models/User');
const City = require('../models/City');

exports.dashboard = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(401).render('auth/login', {
        message: 'Please login again',
        title: 'Login'
      });
    }

    const hospital = await Hospital.findOne({
      where: { email: user.email }
    });

    if (!hospital) {
      return res.status(404).render('error', {
        message: 'Hospital not found',
        title: 'Error'
      });
    }

    const total = await BloodRequest.count({ 
      where: { hospital_id: hospital.id } 
    });
    
    const fulfilled = await BloodRequest.count({ 
      where: { 
        hospital_id: hospital.id, 
        fulfilled: true 
      } 
    });

    res.render('hospital/dashboard', { 
      total, 
      fulfilled,
      hospital,
      title: 'Hospital Dashboard'
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).render('error', {
      message: 'Error loading dashboard',
      title: 'Error'
    });
  }
};

exports.showRequestForm = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    const hospital = await Hospital.findOne({
      where: { email: user.email },
      include: City
    });

    if (!hospital) {
      console.log('Hospital not found for user:', hospital);
      return res.status(404).render('error', {
        message: 'Hospital not found',
        title: 'Error'
      });
    }

    res.render('hospital/requestForm', { 
      hospital,
      title: 'Blood Request Form'
    });
  } catch (error) {
    console.error('Show request form error:', error);
    res.status(500).render('error', {
      message: 'Error loading request form',
      title: 'Error'
    });
  }
};

exports.submitRequest = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    const hospital = await Hospital.findOne({
      where: { email: user.email }
    });

    if (!hospital) {
      return res.status(404).render('error', {
        message: 'Hospital not found',
        title: 'Error'
      });
    }

    const { blood_type, quantity, patient_status } = req.body;
    
    await BloodRequest.create({
      hospital_id: hospital.id,
      blood_type,
      quantity,
      patient_status
    });

    res.redirect('/hospital/my-requests');
  } catch (error) {
    console.error('Submit request error:', error);
    res.status(500).render('hospital/requestForm', { 
      error: 'Failed to submit request',
      hospital: null,
      title: 'Blood Request Form'
    });
  }
};

// exports.viewMyRequests = async (req, res) => {
//   try {
//     const user = await User.findByPk(req.user.id);
//     const hospital = await Hospital.findOne({
//       where: { email: user.email }
//     });

//     if (!hospital) {
//       return res.status(404).render('error', {
//         message: 'Hospital not found',
//         title: 'Error'
//       });
//     }

//     const requests = await BloodRequest.findAll({
//       where: { hospital_id: hospital.id },
//       order: [['createdAt', 'DESC']]
//     });

//     res.render('hospital/my-requests', { 
//       requests,
//       hospital,
//       title: 'My Blood Requests'
//     });
//   } catch (error) {
//     console.error('View requests error:', error);
//     res.status(500).render('error', {
//       message: 'Error loading requests',
//       title: 'Error'
//     });
//   }
// };



exports.viewMyRequests = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    const hospital = await Hospital.findOne({
      where: { email: user.email }
    });

    if (!hospital) {
      return res.status(404).render('error', {
        title: 'Error',
        message: 'Hospital not found'
      });
    }

    const requests = await BloodRequest.findAll({
      where: { hospital_id: hospital.id },
      include: {
        model: Hospital,
        include: City
      },
      order: [['createdAt', 'DESC']]
    });

    res.render('hospital/my-requests', {
      requests,
      title: 'My Blood Requests'
    });

  } catch (error) {
    console.error('Error loading blood requests:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Something went wrong while fetching your blood requests.'
    });
  }
};
