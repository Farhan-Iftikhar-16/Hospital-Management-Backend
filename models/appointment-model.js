const mongoose = require('mongoose');

const appointmentchema = mongoose.Schema({
  Patient: {
    type: String,
    required: true
  },
  Doctor: {
    type: String,
    required: true
  },
  Status: {
    type: String,
    required: true
  },
  dateAndTime: {
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

const Appointment = module.exports = mongoose.model('appointment', appointmentchema);

module.exports.scheduleAppointment = (req , res) => {
  const appointment = new Appointment({
    status: 'ACTIVE',
    patient: req.body.patient,
    doctor: req.body.doctor,
    createdBy: req.body.createdBy,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  appointment.save((error) => {
    if (error) {
      res.status(500).json({success: false, message: 'Error occurred while schedule appointment'});
      return;
    }

    if (!error) {
      res.status(200).json({success: true, message: 'Appointment schedule successfully.'});
    }
  });
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

  if (req.params._id) {
    query = {doctor: req.params._id};
  }

  Appointment.find(query, (error, response) => {
    if(error) {
      res.status(500).json({status: 'Error', message: 'Error occurred while getting appointments.'});
      return
    }

    if(!error) {
      res.status(200).json({status: 'Success', appointments: response});
    }
  });
}
