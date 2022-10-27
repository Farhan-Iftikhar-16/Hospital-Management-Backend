const mongoose = require('mongoose');
const Patient = require('../models/patient-model');
const Doctor = require('../models/doctor-model');

const reviewSchema = mongoose.Schema({
  patient: {
    type: String,
    required: true
  },
  doctor: {
    type: String,
    required: true
  },
  comment: {
    type: String,
    required: true
  },
  recommended: {
    type: Boolean,
    required: false
  },
  rating: {
    type: Number,
    require: false
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

const Review = module.exports = mongoose.model('Reviews', reviewSchema);

module.exports.addReview = (req , res) => {
  const review = new Review({
    patient: req.body.patient,
    doctor: req.body.doctor,
    comment: req.body.comment,
    rating: req.body.rating,
    recommended: req.body.recommended,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  review.save(error => {
    if (error) {
      res.status(500).json({success: false, message: 'Error occurred while adding review.'});
      return;
    }

    if (!error){
      res.status(200).json({success: true, message: 'Review added successfully.'});
    }
  });
}

module.exports.updateReview= (req , res) => {
  Review.findOneAndUpdate(req.params._id, req.body,{}, (error) => {
    if (error) {
      res.status(500).json({success: false, message: 'Error occurred while updating review.'});
      return;
    }

    if (!error) {
      res.status(200).json({success: true, message: 'Review details updated successfully.'});
    }
  });
}

module.exports.getReviews = (req, res) => {
  let query = {};

  if (req.query.role === 'DOCTOR') {
    query = {doctor: req.query.id};
  }

  if (req.query.role === 'PATIENT') {
    query = {patient: req.query.id};
  }

  Review.find(query, async (error, response) => {
    if(error) {
      res.status(500).json({status: 'Error', message: 'Error occurred while getting reviews.'});
      return
    }

    if(!error) {
      const reviews = [];

      if (response && response.length > 0) {
        for (const review of response) {
          if (req.query.role === 'DOCTOR') {
            const patient = await Patient.findOne({user: review.patient});
            if (patient) {
              reviews.push({
                ...review._doc,
                patient: {
                  _id: patient._id,
                  profileImage: patient.profileImage,
                  name: patient.firstName + ' ' +  patient.lastName,
                }
              });
            }

          }

          if (req.query.role === 'PATIENT') {
            const doctor = await Doctor.findOne({user: review.doctor});
            if (doctor) {
              reviews.push({
                ...review._doc,
                doctor: {
                  _id: doctor._id,
                  name: doctor.firstName + doctor.lastName,
                }
              });
            }
          }
        }
      }


      res.status(200).json({status: 'Success', reviews: reviews});
    }
  });
}

module.exports.deleteReview = (req, res) => {
  Review.findByIdAndDelete({_id: req.params.id}, (error) => {
    if(error) {
      res.status(500).json({success: false, message: 'Error occurred while deleting review.'});
      return;
    }

    if(!error) {
      res.status(200).json({success: true, message: 'Review deleted successfully.'});
    }
  });
}

