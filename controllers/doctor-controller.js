const express = require('express');
const doctor = require('../models/doctor-model');

const router = express.Router();

router.post('/add-doctor', (req, res) => {
  doctor.addDoctor(req, res);
});

router.put('/update-doctor/:id', (req, res) => {
  doctor.updateDoctor(req, res);
});

router.get('/get-doctors', (req, res) => {
  doctor.getDoctors(req, res);
});

router.get('/get-doctor-details/:id', (req, res) => {
  doctor.getDoctorDetailsById(req, res);
});

router.get('/get-doctor-details-by-user-id', (req, res) => {
  doctor.getDoctorDetailsByUserId(req, res);
});

router.delete('/delete-doctor/:id', (req, res) => {
  doctor.deleteDoctor(req, res);
});

router.put('/update-doctor-status/:id', (req, res) => {
  doctor.updateDoctorStatus(req, res);
});

router.put('/schedule-timings', (req, res) => {
  doctor.scheduleTimings(req, res);
});

router.get('/get-doctor-analytics', (req, res) => {
  doctor.getDoctorAnalytics(req, res);
});

router.get('/get-top-rated-doctors', (req, res) => {
  doctor.getTopRatedDoctors(req, res);
});

module.exports = router;
