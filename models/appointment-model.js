const mongoose = require('mongoose');
const Doctor = require('../models/doctor-model');
const Patient = require('../models/patient-model');
const request = require('request');
const SERVICE_PLAN_ID = 'a4a6f516f67744d6b540606fe5c3ecdc';
const API_TOKEN = 'b2c24fbcbf6f452ebc184010fed7ec81';
const SINCH_URL = 'https://us.sms.api.sinch.com/xms/v1/';
const SINCH_NUMBER = '447520651253';
const moment = require("moment");
const {v4: uuidV4} = require('uuid');

const appointmentSchema = mongoose.Schema({
  patient: {
    type: String,
    required: false
  },
  doctor: {
    type: String,
    required: true
  },
  admin: {
    type: String,
    required: false
  },
  status: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  purpose: {
    type: String,
    required: false
  },
  slot: {
    type: String,
    required: true
  },
  room: {
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

const Appointment = module.exports = mongoose.model('appointment', appointmentSchema);

module.exports.scheduleAppointment = async (req , res) => {
  const patient = await Patient.findOne({user: req.body.patient});
  const doctor = await Doctor.findOne({user: req.body.doctor});

  if (req.body.isTemporaryUser) {
    const patient = new Patient({
      profileImage: null,
      firstName: null,
      lastName:  null,
      email: null,
      gender: null,
      bloodGroup: null,
      DOB: null,
      phoneNumber: req.body.phoneNumber,
      addressDetails: null,
      status: 'ACTIVE',
      user: null,
      createdBy: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    patient.save((error, response) => {
      if (error) {
        res.status(500).json({success: false, message: 'Error occurred while scheduling appointment'});
        return;
      }

      if (!error) {
        const appointment = new Appointment({
          status: 'PENDING',
          patient: response._id,
          doctor: doctor.user,
          admin: null,
          date: req.body.date,
          purpose: req.body.purpose,
          slot: req.body.slot,
          room: uuidV4(),
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        appointment.save(async (error) => {
          if (error) {
            res.status(500).json({success: false, message: 'Error occurred while schedule appointment'});
            return;
          }

          if (!error) {
            sendAppointmentMessage(response, doctor, req.body.slot)
            res.status(200).json({success: true, message: 'Appointment schedule successfully.'});
          }
        });
      }
    });
  }

  if (!req.body.isTemporaryUser) {
    const appointment = new Appointment({
      status: 'PENDING',
      patient: patient.user,
      doctor: doctor.user,
      admin: doctor.createdBy,
      date: req.body.date,
      purpose: req.body.purpose,
      slot: req.body.slot,
      room: uuidV4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    appointment.save((error) => {
      if (error) {
        console.log(error);
        res.status(500).json({success: false, message: 'Error occurred while schedule appointment'});
        return;
      }

      if (!error) {
        sendAppointmentMessage(patient, doctor, req.body.slot);
        res.status(200).json({success: true, message: 'Appointment schedule successfully.'});
      }
    });
  }
}

module.exports.updateAppointment = (req , res) => {
  Appointment.findOneAndUpdate(req.params._id, req.body,{}, (error) => {
    if (error) {
      res.status(500).json({success: false, message: 'Error occurred while updating details of appointment.'});
      return;
    }

    if (!error) {
      res.status(200).json({success: true, message: 'Appointment details updated successfully.'});
    }
  });
}

module.exports.deleteAppointment = (req, res) => {
  Appointment.findByIdAndDelete({_id: req.params.id}, (error) => {
    if(error) {
      res.status(500).json({success: false, message: 'Error occurred while deleting appointment.'});
      return;
    }

    if(!error) {
      res.status(200).json({success: true, message: 'Appointment deleted successfully.'});
    }
  });
}

module.exports.getAppointments = (req, res) => {
  let query = {};

  if (req.query.id && req.query.role === 'PATIENT') {
    query = {patient: req.query.id};
  }

  if (req.query.id && req.query.role === 'DOCTOR') {
    query = {doctor: req.query.id};
  }

  Appointment.find(query, async (error, response) => {
    if(error) {
      res.status(500).json({status: 'Error', message: 'Error occurred while getting appointments.'});
      return;
    }

    if(!error) {
      const appointments = [];

      if (response && response.length > 0) {
        for (const item of response) {
          if (req.query.role === 'PATIENT') {
            const doctor = await Doctor.findOne({user: item.doctor});

            if (doctor) {
              appointments.push({...item._doc, doctor: {
                  profileImage: doctor.profileImage,
                  gender: doctor.gender,
                  DOB: doctor.DOB,
                  firstName: doctor.firstName,
                  lastName: doctor.lastName,
                  phoneNumber: doctor.phoneNumber
              }});
            }
          }

          if (req.query.role === 'DOCTOR') {
            const patient = await Patient.findOne({user: item.patient});

            if (patient) {
              appointments.push({...item._doc, patient: {
                  profileImage: patient.profileImage,
                  gender: patient.gender,
                  DOB: patient.DOB,
                  firstName: patient.firstName,
                  lastName: patient.lastName,
                  phoneNumber: patient.phoneNumber
              }});
            }

            if(!patient) {
              const temporaryPatient = await Patient.findOne({_id: item.patient});

              if (temporaryPatient) {
                appointments.push({
                  ...item._doc, patient: {
                    phoneNumber: temporaryPatient.phoneNumber
                  }
                });
              }
            }
          }
        }
      }

      res.status(200).json({status: 'Success', appointments: appointments});
    }
  });
}

function sendAppointmentMessage(patient, doctor, slot) {

  if (patient) {
    const messageObject = getPatientAppointmentObject(patient, doctor, moment(slot, 'HH:mm A').format('HH:mm A'))
    sendMessage(messageObject);
  }

  if (doctor) {
    const messageObject = getDoctorAppointmentObject(patient, doctor, moment(slot, 'HH:mm A').format('HH:mm A'))
    sendMessage(messageObject);
  }
}

function getPatientAppointmentObject(patient, doctor, slot) {
 return {
   to: [patient.phoneNumber],
   body: `Appointment schedule with DR. ${doctor.firstName} ${doctor.lastName} at ${slot}`
 }
}

function getDoctorAppointmentObject(patient, doctor, slot) {
  return {
    to: [doctor.phoneNumber],
    body: patient.email ? `Appointment schedule with ${patient.firstName} ${patient.lastName} at ${slot}` : `Appointment schedule with patient at ${slot}`
  }
}

function sendMessage(object) {
  request(
    SINCH_URL + SERVICE_PLAN_ID + '/batches',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + API_TOKEN
      },
      body: JSON.stringify({
        from: SINCH_NUMBER,
        to: object.to,
        body: object.body
      })
    },
    error => {
      console.log(error);
    }
  );
}
