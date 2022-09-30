const express = require('express');
const appointment = require('../models/appointment-model');

const router = express.Router();

router.post('/create-appointment', (req, res) => {
  appointment.scheduleAppointment(req, res);
});

router.put('/update-appointment/:id', (req, res) => {
  appointment.updateAppointment(req, res);
});

router.put('/delete-appointment/:id', (req, res) => {
  appointment.deleteAppointment(req, res);
});

router.get('/get-appointments', (req, res) => {
  appointment.getAppointments(req, res);
});

router.delete('/delete-appointment/:id', (req, res) => {
  appointment.deleteAppointment(req, res);
});

module.exports = router;
