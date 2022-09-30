const express = require('express');
const hospital = require('../models/hospital-model');
const doctor = require("../models/doctor-model");

const router = express.Router();

router.post('/add-hospital', (req, res) => {
  hospital.addHospital(req, res);
});

router.put('/update-hospital/:id', (req, res) => {
  hospital.updateHospital(req, res);
});

router.get('/get-hospitals', (req, res) => {
  hospital.getHospitals(req, res);
});

router.delete('/delete-hospital/:id', (req, res) => {
  hospital.deleteHospital(req, res);
});

router.post('/send-credentials-email/:id', (req, res) => {
  hospital.sendCredentialsEmail(req, res);
});

router.put('/change-hospital-status/:id', (req, res) => {
  hospital.changeHospitalStatus(req, res);
});

module.exports = router;
