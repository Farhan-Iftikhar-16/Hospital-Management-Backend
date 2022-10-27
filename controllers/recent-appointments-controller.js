const express = require('express');
const Appointments = require('../models/appointment-model');
const Patients = require('../models/patient-model');
const Doctors = require('../models/doctor-model');
const Reviews = require('../models/review-model');

const router = express.Router();

router.get('/get-patients', (req, res) => {
  getRecentPatients(req, res);
});

router.get('/get-doctors', (req, res) => {
  getRecentDoctors(req, res);
});

function getRecentPatients(req, res) {
    Appointments.find({doctor: req.query.id}, async (error, response) => {
      if(error) {
        res.status(500).json({status: 'Error', message: 'Error occurred while getting appointments.'});
        return;
      }

      const patients = [];
      const guestPatients = [];

      if (response && response.length > 0) {

        const patientIDs = response.map(item => item.patient).filter((item, index, self) => self.indexOf(item) === index);

        for (const patientID of patientIDs) {
          const patient = await Patients.findOne({user: patientID});

          if (!patient) {
            const guestPatient = await Patients.findById(patientID);

            if (guestPatient) {
              guestPatients.push(guestPatient);
            }
          }

          if (patient) {
            patients.push(patient);
          }
        }

        res.status(200).json({status: 'Success', patients: patients, guestPatients: guestPatients});
      }

      if (response && response.length === 0) {
        res.status(200).json({status: 'Success', patients: [], guestPatients: guestPatients});
      }
    });
}

function getRecentDoctors(req, res) {
  Appointments.find({patient: req.query.id}, async (error, response) => {
    if(error) {
      res.status(500).json({status: 'Error', message: 'Error occurred while getting doctors.'});
      return;
    }

    if (response && response.length > 0) {
      const doctors = [];

      const doctorsIDs = response.map(item => item.doctor).filter((item, index, self) => self.indexOf(item) === index);

      for (const doctorID of doctorsIDs) {
        const doctor = await Doctors.findOne({user: doctorID});
        const reviews = await Reviews.find({doctor: doctorID});
        let rating = 0;

        if (reviews && reviews.length > 0) {
          let totalRating = 0;

          for (const review of reviews) {
            totalRating = review.rating + totalRating
          }

          const usersMaxRating = reviews.length * 5;

          rating = (totalRating * 5) / usersMaxRating;
        }

        if (doctor) {
          doctors.push({...doctor._doc, rating: rating, totalReviews: reviews.length});
        }
      }

      res.status(200).json({status: 'Success', doctors: doctors});
    }

    if (response && response.length === 0) {
      res.status(200).json({status: 'Success', doctors: []});
    }
  });
}

module.exports = router;
