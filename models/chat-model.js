const mongoose = require('mongoose');
const Patient = require("../models/patient-model");
const Doctor = require("../models/doctor-model");

const chatSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  patient: {
    type: String,
    required: false
  },
  doctor: {
    type: String,
    required: false
  },
  status: {
    type: String,
    required: false
  },
  messages: {
    type: Array,
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

const Chat = module.exports = mongoose.model('Chat', chatSchema);

module.exports.createRoom = async (data) => {
  const doctor = await  Doctor.findOne({user: data.doctor});

  const patient = await Patient.findOne({createdBy: doctor.createdBy});

  const chat  = new Chat({
    name: data.name,
    patient: patient.user,
    doctor: data.doctor,
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date()
  });

  return chat.save()
}

module.exports.getUserRecentChats = (req, res) => {
  let query = {};

  if (req.query.role === 'DOCTOR') {
    query = {doctor: req.query.id}
  }

  if (req.query.role === 'PATIENT') {
    query = {patient: req.query.id}
  }

  Chat.find(query, async (error, response) => {
    if (error) {
      res.status(500).json({status: 'Error', message: 'Error occurred while getting recent chats.'});
      return;
    }

    if (response && response.length > 0) {
      const chats = []
      for (const item of response) {
        let chat = {}
        if (req.query.role === 'DOCTOR') {
          const patient  = await Patient.findOne({user: item.patient});

          chat = {
            ...item._doc, patient: {
              _id: patient.user,
              name: patient.firstName + ' ' + patient.lastName,
              profileImage: patient.profileImage
            }
          };
        }

        if (req.query.role === 'PATIENT') {
          const doctor  = await Doctor.findOne({user: item.doctor});

          chat = {
            ...item._doc, doctor: {
              _id: doctor.user,
              name: doctor.firstName + ' ' + doctor.lastName,
              profileImage: doctor.profileImage
            }
          };
        }
        chats.push(chat);
      }

      res.status(200).json({status: 'Success', chats: chats});
      return;
    }

    res.status(200).json({status: 'Success', chats: []});

  });
}

module.exports.getUsers = async (req, res) => {
  if (req.query.role === 'DOCTOR') {
    const doctor = await Doctor.findOne({user: req.query.id});

    if (doctor) {
      const patients = await Patient.find( { $and: [
          { $and: [{createdBy: doctor.createdBy}]},
          { $or: [{firstName: {$regex: req.query.searchText, $options: "i"}}, {lastName: {$regex: req.query.searchText, $options: "i"}}]}
        ]});

      if (patients && patients.length > 0) {
        const users = patients.map(patient => {
          return {
            _id: patient._id,
            name: patient.firstName + ' ' + patient.lastName,
            profileImage: patient.profileImage
          }
        });

        res.status(200).json({status: 'Success', users: users});
        return;
      }

      res.status(200).json({status: 'Success', users: []});
      return;
    }

    res.status(200).json({status: 'Success', users: []});
  }
}
