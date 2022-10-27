const mongoose = require('mongoose');
const User = require('./user-model');
const bcryptjs = require("bcryptjs");

const adminSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: false
  },
  lastName: {
    type: String,
    required: false
  },
  profileImage: {
    type: String,
    required: false
  },
  email: {
    type: String,
    required: true
  },
  addressDetails: {
    type: Object,
    required: false
  },
  user: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    required: true
  },
  updatedAt: {
    type: Date,
    required: true
  }
});

const Admin = module.exports = mongoose.model('Admin', adminSchema);

module.exports.addAdmin = (req , res) => {
  User.findOne({email: req.body.email}, (error, response) => {
    if (error) {
      res.status(500).json({success: false, message: 'Error occurred while adding profile details.'});
      return;
    }

    if (response) {
      res.status(409).json({success: false, message: 'Email already exists.'});
      return;
    }

    if (!response) {
      bcryptjs.genSalt(10, (error, salt) => {
        if (error) {
          res.status(500).json({success: false, message: 'Error occurred while encrypting the password.'});
          return;
        }

        if (!error) {
          bcryptjs.hash(req.body.password, salt, (error, hash) => {
            if (error) {
              res.status(500).json({success: false, message: 'Error occurred while encrypting the password.'});
              return;
            }

            if (!error) {
              const user = new User({
                email: req.body.email,
                password: hash,
                role: 'ADMIN',
                isTemporaryPassword: false,
                createdAt: new Date(),
                updatedAt: new Date()
              });

              user.save((error, response) => {
                if (error) {
                  res.status(500).json({success: false, message: 'Error occurred while creating admin credentials.'});
                  return;
                }

                if (!error) {
                  const admin = new Admin({
                    profileImage: req.body.profileImage ? req.body.profileImage : null,
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    email: req.body.email,
                    addressDetails: req.body.address,
                    user: response._id,
                    status: 'ACTIVE',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                  });

                  admin.save((error) => {
                    if (error) {
                      res.status(500).json({success: false, message: 'Account created but details not saved. Please try again when login.'});
                      return;
                    }

                    res.status(200).json({success: true, message: 'Admin profile added successfully.'});
                  });
                }
              });
            }
          });
        }
      });
    }
  });
}

module.exports.updateProfile = (req , res) => {
  Admin.findOneAndUpdate(req.params._id, req.body,{}, (error) => {
    if (error) {
      res.status(500).json({success: false, message: 'Error occurred while updating profile details.'});
      return;
    }

    if (!error) {


      res.status(200).json({success: true, message: 'Profile details updated successfully.'});
    }
  });
}

module.exports.getAdminsList = (req, res) => {
  Admin.find({}, (error, response) => {
    if(error) {
      res.status(500).json({status: 'Error', message: 'Error occurred while getting admins list.'});
      return
    }

    if(!error) {
      const admins = [];

      if (response && response.length > 0) {
        for (const admin of response) {
          const data = {
            _id: admin._id,
            firstName: admin.firstName,
            lastName: admin.lastName,
            profileImage: admin.profileImage,
            email: admin.email,
            status: admin.status,
            createdAt: admin.createdAt,
            updatedAt: admin.updatedAt,
          };

          admins.push(data);
        }
      }

      res.status(200).json({status: 'Success', admins: admins});
    }
  });
}

module.exports.deleteAdmin = (req, res) => {
  Admin.findByIdAndDelete({_id: req.params.id}, (error) => {
    if(error) {
      res.status(500).json({success: false, message: 'Error occurred while deleting admin.'});
      return;
    }

    if(!error) {
      res.status(200).json({success: true, message: 'Admin deleted successfully.'});
    }
  });
}

module.exports.getAdminDetailsById = (req, res) => {
  Admin.findById(req.params.id, (error, response) => {
    if(error) {
      res.status(500).json({status: 'Error', message: 'Error occurred while getting admin profile details.'});
      return
    }

    if(!error) {
      const profile = {
        _id: response._id,
        firstName: response.firstName,
        lastName: response.lastName,
        profileImage: response.profileImage,
        email: response.email,
        addressDetails: response.addressDetails,
        status: response.status,
        createdAt: response.createdAt,
        updatedAt: response.updatedAt,
      }

      res.status(200).json({status: 'Success', profile: profile});
    }
  });
}

module.exports.getAdminDetailsByUserId = (req, res) => {
  Admin.findOne({user: req.query.id}, (error, response) => {
    if(error) {
      res.status(500).json({status: 'Error', message: 'Error occurred while getting admin profile details.'});
      return
    }

    if(!error) {
      const profile = {
        _id: response._id,
        firstName: response.firstName,
        lastName: response.lastName,
        profileImage: response.profileImage,
        email: response.email,
        addressDetails: response.addressDetails,
        status: response.status,
        createdAt: response.createdAt,
        updatedAt: response.updatedAt,
      }

      res.status(200).json({status: 'Success', profile: profile});
    }
  });
}

module.exports.updateAdminStatus = (req, res) => {
  Admin.findOneAndUpdate(req.params._id, {status: req.body.status},{}, (error) => {
    if (error) {
      res.status(500).json({success: false, message: 'Error occurred while updating status of admin.'});
      return;
    }

    if (!error) {
      res.status(200).json({success: true, message: 'Admin status updated successfully.'});
    }
  });
}
