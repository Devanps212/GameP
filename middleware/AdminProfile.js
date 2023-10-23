const Admin = require('../models/adminModel');

const adminProfileMiddleware = async (req, res, next) => {
  try {
    const admin = await Admin.findOne({}).exec();

    if (admin) {
      req.adminProfile = admin; 
    }
  } catch (error) {
    
    console.error('Error fetching admin profile:', error);
  }

  next(); 
};

module.exports = adminProfileMiddleware;
