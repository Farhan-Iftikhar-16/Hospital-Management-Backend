const express = require('express');
const patient = require('../models/patient-model');

const router = express.Router();

router.post('/add-patient', (req, res) => {
  patient.addPatient(req, res);
});

router.put('/update-patient/:id', (req, res) => {
  patient.updatePatient(req, res);
});

router.get('/get-patients', (req, res) => {
  patient.getPatients(req, res);
});

router.get('/get-patient-details/:id', (req, res) => {
  patient.getPatientDetailsById(req, res);
});

router.get('/get-patient-details-by-user-id', (req, res) => {
  patient.getPatientDetailsByUserId(req, res);
});

router.delete('/delete-patient/:id', (req, res) => {
  patient.deletePatient(req, res);
});

router.put('/update-patient-status/:id', (req, res) => {
  patient.updatePatientStatus(req, res);
});

module.exports = router;
