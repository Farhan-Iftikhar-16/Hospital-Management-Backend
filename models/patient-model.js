const mongoose = require('mongoose');
const User = require('../models/user-model');
const generator = require("generate-password");

const patientSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: false
  },
  lastName: {
    type: String,
    required: false
  },
  DOB: {
    type: String,
    required: false
  },
  phoneNumber: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: false
  },
  gender: {
    type: String,
    required: false
  },
  bloodGroup: {
    type: String,
    required: false
  },
  addressDetails: {
    type: Object,
    required: false
  },
  status: {
    type: String,
    required: true
  },
  profileImage: {
    type: String,
    required: false
  },
  createdBy: {
    type: String,
    required: false
  },
  user: {
    type: String,
    required: false
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

const Patient = module.exports = mongoose.model('Patients', patientSchema);

module.exports.addPatient = (req , res) => {
  User.findOne({email: req.body.email}, (error, response) => {
    if (error) {
      res.status(500).json({success: false, message: 'Error occurred while adding patient.'});
      return;
    }

    if (response) {
      res.status(409).json({success: false, message: 'Email already exists.'});
      return;
    }

    if (!response) {
      const user = new User({
        email: req.body.email,
        password: generator.generate({length: 10, numbers: true}),
        role: 'PATIENT',
        isTemporaryPassword: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      user.save((error, response) => {
        if (error) {
          res.status(500).json({success: false, message: 'Error occurred while creating patient credentials.'});
          return;
        }

        if (!error) {
          const patient = new Patient({
            profileImage: req.body.profileImage ? req.body.profileImage : null,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            gender: req.body.gender,
            bloodGroup: req.body.bloodGroup,
            DOB: req.body.DOB,
            phoneNumber: req.body.phoneNumber,
            addressDetails: req.body.addressDetails ? req.body.addressDetails : null,
            status: 'ACTIVE',
            user: response._id,
            createdBy: req.body.createdBy,
            createdAt: new Date(),
            updatedAt: new Date(),
          });

          patient.save((error) => {
            if (error) {
              res.status(500).json({success: false, message: 'Error occurred while saving patient profile. Please try again when login'});
              return;
            }

            if (!error) {
              res.status(200).json({success: true, message: 'patient added successfully.'});
            }
          });
        }
      });
    }
  });
}

module.exports.updatePatient = (req , res) => {
  Patient.findOneAndUpdate(req.params.id, req.body,{}, (error) => {
    if (error) {
      console.log(error)
      res.status(500).json({success: false, message: 'Error occurred while updating details of patient.'});
      return;
    }

    if (!error) {
      res.status(200).json({success: true, message: 'Patient details updated successfully.'});
    }
  });
}

module.exports.getPatients = (req, res) => {
  let query = {};

  if (req.query.id && req.query.role ==='ADMIN') {
    query = {createdBy: req.query.id};
  }

  if (req.query.id && req.query.role ==='DOCTOR') {
    query = {doctor: req.query.id};
  }

  if (req.query.role === 'DOCTOR' && query && query.doctor) {
    // Appointments.find(query, async (error, response) => {
    //   const patients = [];
    //   for (const appointment of response) {
    //     const patient = await Patient.findOne({_id: appointment.doctor});
    //     patients.push(patient);
    //   }
    //
    //   res.status(200).json({status: 'Success', patients: patients});
    // });
    res.status(200).json({status: 'Success', patients: []});
    return;
  }

  Patient.find(query, (error, response) => {
    if(error) {
      res.status(500).json({status: 'Error', message: 'Error occurred while getting patients.'});
      return
    }

    if(!error) {
      const patients = [];

      if (response && response.length > 0) {
        for (const patient of response) {
          const data = {
            _id: patient._id,
            firstName: patient.firstName,
            lastName: patient.lastName,
            profileImage: patient.profileImage,
            email: patient.email,
            gender: patient.gender,
            bloodGroup: patient.bloodGroup,
            DOB: patient.DOB,
            phoneNumber: patient.phoneNumber,
            addressDetails: patient.addressDetails,
            status: patient.status,
            createdBy: patient.createdBy,
            createdAt: patient.createdAt,
            updatedAt: patient.updatedAt,
          };

          patients.push(data);
        }
      }

      res.status(200).json({status: 'Success', patients: patients});
    }
  });
}

module.exports.deletePatient = (req, res) => {
  Patient.findByIdAndDelete({_id: req.params.id}, (error) => {
    if(error) {
      res.status(500).json({success: false, message: 'Error occurred while patient patient.'});
      return;
    }

    if(!error) {
      res.status(200).json({success: true, message: 'Patient deleted successfully.'});
    }
  });
}

module.exports.getPatientDetailsById = (req, res) => {
  Patient.findOne({_id: req.params.id}, (error, response) => {
    if(error) {
      res.status(500).json({status: 'Error', message: 'Error occurred while getting patient details.'});
      return
    }

    if(!error) {
      const patient = {
        _id: response._id,
        firstName: response.firstName,
        lastName: response.lastName,
        profileImage: response.profileImage,
        email: response.email,
        gender: response.gender,
        bloodGroup: response.bloodGroup,
        DOB: response.DOB,
        phoneNumber: response.phoneNumber,
        addressDetails: response.addressDetails,
        status: response.status,
        user: response.user,
        createdBy: response.createdBy,
        createdAt: response.createdAt,
        updatedAt: response.updatedAt,
      };

      res.status(200).json({status: 'Success', patient: patient});
    }
  });
}

module.exports.getPatientDetailsByUserId = (req, res) => {
  Patient.findOne({user: req.query.id}, (error, response) => {
    if(error) {
      res.status(500).json({status: 'Error', message: 'Error occurred while getting patient details.'});
      return
    }

    if(!error) {
      const patient = {
        _id: response._id,
        firstName: response.firstName,
        lastName: response.lastName,
        profileImage: response.profileImage,
        email: response.email,
        gender: response.gender,
        bloodGroup: response.bloodGroup,
        DOB: response.DOB,
        phoneNumber: response.phoneNumber,
        addressDetails: response.addressDetails,
        status: response.status,
        user: response.user,
        createdBy: response.createdBy,
        createdAt: response.createdAt,
        updatedAt: response.updatedAt,
      };

      res.status(200).json({status: 'Success', patient: patient});
    }
  });
}

module.exports.updatePatientStatus = (req, res) => {
  Patient.findOneAndUpdate(req.params._id, {status: req.body.status},{}, (error) => {
    if (error) {
      res.status(500).json({success: false, message: 'Error occurred while updating status of patient.'});
      return;
    }

    if (!error) {
      res.status(200).json({success: true, message: 'Patient status updated successfully.'});
    }
  });
}
