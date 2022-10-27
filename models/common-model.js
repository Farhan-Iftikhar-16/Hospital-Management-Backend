const Appointment = require("../models/appointment-model");
const moment = require("moment");

module.exports.getDoctorAnalytics = (req, res) => {
  Appointment.find({doctor: req.params.id}, (error, response) => {
    if (error) {
      res.status(500).json({success: false, message: 'Error occurred while get doctor analytics.'});
      return;
    }

    if (response && response.length > 0) {
      const totalPatients = response.map(appointment => appointment.patient).filter((patient, index, self) => self.indexOf(patient) === index).length;
      const todayPatients = response.map(appointment => moment(new Date(appointment.dateAndTime), 'MM-DDD-YYYY') === moment(new Date(), 'MM-DDD-YYYY'));
      const appointments = response.filter(response => response.status === 'COMPLETED');

      res.status(200).json({
        success: true, analytics: {
          todayPatients: todayPatients,
          totalPatients: totalPatients,
          appointments: appointments
        }
      });
    }

    if (response && response.length === 0) {
      res.status(200).json({
        success: true, analytics: {
          todayPatients: 0,
          totalPatients: 0,
          appointments: 0
        }
      });
    }
  });
}

// module.exports.findPatient =  async (query) => {
//   return await Patient.findOne(query);
// }
//
// module.exports.findDoctor =  async (query) => {
//   return await Doctor.findOne(query);
// }
//
// module.exports.getPatients = (req, res) => {
//   let query = {};
//
//   if (req.query.id && req.query.role ==='ADMIN') {
//     query = {createdBy: req.query.id};
//   }
//
//   if (req.query.id && req.query.role ==='DOCTOR') {
//     query = {doctor: req.query.id};
//   }
//
//   if (req.query.role === 'DOCTOR' && query && query.doctor) {
//     Appointment.find(query, async (error, response) => {
//       const patients = [];
//       for (const appointment of response) {
//         const patient = await Patient.findOne({_id: appointment.doctor});
//         patients.push(patient);
//       }
//
//       res.status(200).json({status: 'Success', patients: patients});
//     });
//
//     return;
//   }
//
//   Patient.find(query, (error, response) => {
//     if(error) {
//       res.status(500).json({status: 'Error', message: 'Error occurred while getting patients.'});
//       return
//     }
//
//     if(!error) {
//       const patients = [];
//
//       if (response && response.length > 0) {
//         for (const patient of response) {
//           const data = {
//             _id: patient._id,
//             firstName: patient.firstName,
//             lastName: patient.lastName,
//             profileImage: patient.profileImage,
//             email: patient.email,
//             gender: patient.gender,
//             bloodGroup: patient.bloodGroup,
//             DOB: patient.DOB,
//             phoneNumber: patient.phoneNumber,
//             addressDetails: patient.addressDetails,
//             status: patient.status,
//             createdBy: patient.createdBy,
//             createdAt: patient.createdAt,
//             updatedAt: patient.updatedAt,
//           };
//
//           patients.push(data);
//         }
//       }
//
//       res.status(200).json({status: 'Success', patients: patients});
//     }
//   });
// }

