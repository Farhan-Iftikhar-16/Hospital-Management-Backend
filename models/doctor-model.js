const mongoose = require('mongoose');
const User = require('../models/user-model');
const generator = require("generate-password");
const appointment = require("../models/appointment-model");
const moment = require("moment");
const Patient = require("./patient-model");

const doctorSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  DOB: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    required: true
  },
  scheduleTimings: {
    type: Array,
    required: false
  },
  specializations: {
    type: Array,
    required: false
  },
  services: {
    type: Array,
    required: false
  },
  education: {
    type: Array,
    required: false
  },
  experience: {
    type: Array,
    required: false
  },
  award: {
    type: Array,
    required: false
  },
  clinic: {
    type: Object,
    required: false
  },
  biography: {
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
    required: true
  },
  user: {
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

const Doctor = module.exports = mongoose.model('Doctors', doctorSchema);

module.exports.addDoctor = (req , res) => {
  User.findOne({email: req.body.email}, (error, response) => {
    if (error) {
      res.status(500).json({success: false, message: 'Error occurred while adding doctor.'});
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
        role: 'DOCTOR',
        isTemporaryPassword: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      user.save((error, response) => {
        if (error) {
          res.status(500).json({success: false, message: 'Error occurred while creating doctors credentials.'});
          return;
        }

        if (!error) {
          const doctor = new Doctor({
            profileImage: req.body.profileImage ? req.body.profileImage : null,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            gender: req.body.gender,
            DOB: req.body.DOB,
            phoneNumber: req.body.phoneNumber,
            biography: req.body.biography ? req.body.biography : null,
            services: req.body.services ? req.body.services : null,
            specializations: req.body.specializations ? req.body.specializations : null,
            addressDetails: req.body.addressDetails ? req.body.addressDetails : null,
            education: req.body.education ? req.body.education : null,
            experience: req.body.experience ? req.body.experience : null,
            status: 'ACTIVE',
            user: response._id,
            createdBy: req.body.createdBy,
            createdAt: new Date(),
            updatedAt: new Date(),
          });

          doctor.save((error) => {
            if (error) {
              res.status(500).json({success: false, message: 'Error occurred while saving doctor profile. Please try again when login'});
              return;
            }

            if (!error) {
              res.status(200).json({success: true, message: 'doctor added successfully.'});
            }
          });
        }
      });
    }
  });
}

module.exports.updateDoctor = (req , res) => {
  Doctor.findOneAndUpdate(req.params._id, req.body,{}, (error) => {
    if (error) {
      res.status(500).json({success: false, message: 'Error occurred while updating details of doctor.'});
      return;
    }

    if (!error) {
      res.status(200).json({success: true, message: 'Doctor details updated successfully.'});
    }
  });
}

module.exports.getDoctors = async (req, res) => {
  let query = {};

  if (req.query.id && req.query.role === 'ADMIN') {
    query = {createdBy: req.query.id};
  }

  if (req.query.id && req.query.role === 'PATIENT') {
    const patient = await Patient.findOne({user: req.query.id});
    query = {createdBy: patient.createdBy}
  }

  Doctor.find(query, (error, response) => {
    if(error) {
      res.status(500).json({status: 'Error', message: 'Error occurred while getting doctors.'});
      return
    }

    if(!error) {
      const doctors = [];

      if (response && response.length > 0) {
        for (const doctor of response) {
          const data = {
            _id: doctor._id,
            firstName: doctor.firstName,
            lastName: doctor.lastName,
            profileImage: doctor.profileImage,
            email: doctor.email,
            gender: doctor.gender,
            DOB: doctor.DOB,
            phoneNumber: doctor.phoneNumber,
            biography: doctor.biography,
            services: doctor.services,
            specializations: doctor.specializations,
            addressDetails: doctor.addressDetails,
            education: doctor.education,
            experience: doctor.experience,
            status: doctor.status,
            appointments: 0,
            totalIncome: 0,
            createdBy: doctor.createdBy,
            createdAt: doctor.createdAt,
            updatedAt: doctor.updatedAt,
          };

          doctors.push(data);
        }
      }

      res.status(200).json({status: 'Success', doctors: doctors});
    }
  });
}

module.exports.deleteDoctor = (req, res) => {
  Doctor.findByIdAndDelete({_id: req.params.id}, (error) => {
    if(error) {
      res.status(500).json({success: false, message: 'Error occurred while deleting doctor.'});
      return;
    }

    if(!error) {
      res.status(200).json({success: true, message: 'Doctor deleted successfully.'});
    }
  });
}

module.exports.getDoctorDetailsById = (req, res) => {
  Doctor.findOne({_id: req.params.id}, (error, response) => {
    if(error) {
      res.status(500).json({status: 'Error', message: 'Error occurred while getting doctor details.'});
      return
    }

    if(!error) {
      const doctor = {
        _id: response._id,
        firstName: response.firstName,
        lastName: response.lastName,
        profileImage: response.profileImage,
        email: response.email,
        gender: response.gender,
        DOB: response.DOB,
        phoneNumber: response.phoneNumber,
        biography: response.biography,
        services: response.services,
        specializations: response.specializations,
        addressDetails: response.addressDetails,
        education: response.education,
        experience: response.experience,
        status: response.status,
        user: response.user,
        createdBy: response.createdBy,
        createdAt: response.createdAt,
        updatedAt: response.updatedAt,
      };

      res.status(200).json({status: 'Success', doctor: doctor});
    }
  });
}

module.exports.getDoctorDetailsByUserId = (req, res) => {
  Doctor.findOne({user: req.query.id}, (error, response) => {
    if(error) {
      res.status(500).json({status: 'Error', message: 'Error occurred while getting doctor details.'});
      return
    }

    if(!error) {
      const doctor = {
        _id: response._id,
        firstName: response.firstName,
        lastName: response.lastName,
        profileImage: response.profileImage,
        email: response.email,
        gender: response.gender,
        DOB: response.DOB,
        phoneNumber: response.phoneNumber,
        biography: response.biography,
        services: response.services,
        specializations: response.specializations,
        addressDetails: response.addressDetails,
        education: response.education,
        experience: response.experience,
        status: response.status,
        user: response.user,
        createdBy: response.createdBy,
        createdAt: response.createdAt,
        updatedAt: response.updatedAt,
      };

      res.status(200).json({status: 'Success', doctor: doctor});
    }
  });
}

module.exports.updateDoctorStatus = (req, res) => {
  Doctor.findOneAndUpdate(req.params._id, {status: req.body.status},{}, (error) => {
    if (error) {
      res.status(500).json({success: false, message: 'Error occurred while updating status of doctor.'});
      return;
    }

    if (!error) {
      res.status(200).json({success: true, message: 'Doctor status updated successfully.'});
    }
  });
}

module.exports.scheduleTimings = (req, res) => {
  Doctor.findOne({user: req.body.user}, (error, response) => {
    if (error) {
      res.status(500).json({success: false, message: 'Error occurred while scheduling timings.'});
      return;
    }

    let query = {};

    if (response && response.scheduleTimings && response.scheduleTimings.length > 0) {
      const index = response.scheduleTimings.findIndex(slot => slot.day === req.body.day);

      if (index > -1) {
        response.scheduleTimings[index] = req.body;
        query = { '$set': { 'scheduleTimings':  response.scheduleTimings }};
      }

      if (index < -1) {
        query = { '$push': { 'scheduleTimings':  req.body }};
      }
    }

    Doctor.findOneAndUpdate({user: req.body.user},  query,{}, (error) => {
      if (error) {
        res.status(500).json({success: false, message: 'Error occurred while scheduling timings.'});
        return;
      }

      if (!error) {
        res.status(200).json({success: true, message: 'Timing schedule successfully.'});
      }
    });
  });
}

module.exports.getDoctorAnalytics = (req, res) => {
  appointment.find({doctor: req.params.id}, (error, response) => {
    if (error) {
      res.status(500).json({success: false, message: 'Error occurred while get doctor analytics.'});
      return;
    }

    if (response && response.length > 0) {
      const totalPatients = response.map(appointment => appointment.patient).filter((patient, index, self) => self.indexOf(patient) === index).length;
      const todayPatients = response.map(appointment => moment(new Date(appointment.dateAndTime), 'MM-DDD-YYYY') === moment(new Date(), 'MM-DDD-YYYY'));
      const appointments = response.filter(response => response.status === 'COMPLETED');

      res.status(200).json({success: true, analytics: {
        todayPatients: todayPatients,
        totalPatients: totalPatients,
        appointments: appointments
      }});
    }

    if (response && response.length === 0) {
      res.status(200).json({success: true, analytics: {
          todayPatients: 0,
          totalPatients: 0,
          appointments: 0
        }});
    }
  });
}
