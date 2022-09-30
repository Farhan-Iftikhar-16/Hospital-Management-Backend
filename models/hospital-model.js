const mongoose = require('mongoose');
const config = require('../config/config');
const {transporter} = require("../config/config");

const hospitalSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  profileImage: {
    type: String,
    required: true
  },
  createdBy: {
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

const Hospital = module.exports = mongoose.model('Hospitals', hospitalSchema);

module.exports.addHospital = (req , res) => {
  Hospital.findOne({name: req.body.name}, (error, hospital) => {
    if (error) {
      res.status(500).json({success: false, message: 'Error occurred while adding details of hospital.'});
      return;
    }

    if (hospital) {
      res.status(409).json({success: false, message: 'hospital already exists with provided name.'});
      return;
    }

    if (!hospital) {
      const hospital = new Hospital({
        name: req.body.name,
        email: req.body.email,
        location: req.body.location,
        profileImage: req.body.profileImage,
        status: 'ACTIVE',
        createdBy: req.body.createdBy,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      hospital.save((error, result)=> {
        if(error) {
          res.status(500).json({success: false, message: 'Error occurred while adding hospital details.'});
          return;
        }

        if(!error) {
          res.status(200).json({success: true, hospital: result, message: 'Hospital details added successfully'});
        }
      });
    }
  });
}

module.exports.updateHospital = (req , res) => {
  Hospital.findOneAndUpdate(req.params._id, req.body,{}, (error) => {
    if (error) {
      res.status(500).json({success: false, message: 'Error occurred while updating details of hospital.'});
      return;
    }

    if (!error) {
      res.status(200).json({success: true, message: 'Hospitals details updated successfully.'});
    }
  });
}

module.exports.getHospitals = (req, res) => {
  let query = {};

  if (req.params.id) {
    query = {createdBy: req.params.id};
  }

  Hospital.find(query, (error, response) => {
    if(error) {
      res.status(500).json({status: 'Error', message: 'Error occurred while getting hospitals.'});
      return
    }

    if(!error) {
      const hospitals = [];

      if (response && response.length > 0) {
        for (const hospital of response) {
          const data = {
            _id: hospital._id,
            name: hospital.name,
            location: hospital.location,
            profileImage: hospital.profileImage,
            createdBy: hospital.createdBy,
            email: hospital.email,
            status: hospital.status,
            doctors: 0,
            patients: 0,
          };

          hospitals.push(data);
        }
      }

      res.status(200).json({status: 'Success', hospitals: hospitals});
    }
  });
}

module.exports.getHospitalDetails = (req, res) => {
  Hospital.findOne({createdBy: req.query.id}, (error, response) => {
    if(error) {
      res.status(500).json({status: 'Error', message: 'Error occurred while getting hospital details.'});
      return
    }

    if(!error && response) {

      const hospital = {
        _id: response._id,
        name: response.name,
        profileImage: response.profileImage,
        email: response.email,
        location: response.location,
        status: response.status,
        createdBy: response.createdBy,
        createdAt: response.createdAt,
        updatedAt: response.updatedAt,
      };

      res.status(200).json({status: 'Success', hospital: hospital});
    }

    if (!error && !response) {
      res.status(200).json({status: 'Success', hospital: null});
    }
  });
}

module.exports.deleteHospital = (req, res) => {
  Hospital.findByIdAndDelete({_id: req.params.id}, (error) => {
    if(error) {
      res.status(500).json({success: false, message: 'Error occurred while deleting hospital.'});
      return;
    }

    if(!error) {
      res.status(200).json({success: true, message: 'Hospital deleted successfully.'});
    }
  });
}

module.exports.sendCredentialsEmail = (req, res) => {
  Hospital.findById({_id: req.params.id}, (error, response) => {
    if(error) {
      res.status(500).send();
      return;
    }

    if(!error) {
      const mailData = {
        from: config.email,
        to: response.email,
        subject: 'Login credentials for HMS',
        html: `Email: ${response.email} <br> Password: ${response.password}<br/>`,
      };

      transporter.sendMail(mailData).then(() => {
        res.status(200).json({success: true, message: `Credentials email send to ${response.email}.`});
      }).catch((error) => {
        res.status(500).send();
      });
    }
  });
}

module.exports.changeHospitalStatus = (req, res) => {
  Hospital.findOneAndUpdate(req.params._id, {status: req.body.status},{}, (error) => {
    if (error) {
      res.status(500).json({success: false, message: 'Error occurred while updating status of hospital.'});
      return;
    }

    if (!error) {
      res.status(200).json({success: true, message: 'Hospital status updated successfully.'});
    }
  });
}
