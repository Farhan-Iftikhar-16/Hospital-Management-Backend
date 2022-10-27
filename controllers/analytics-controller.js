const express = require('express');
const Appointments = require('../models/appointment-model');
const Patients = require('../models/patient-model');
const Doctors = require('../models/doctor-model');
const Reviews = require('../models/review-model');
const Hospitals = require('../models/hospital-model');
const moment = require('moment');
const router = express.Router();

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']


router.get('/super-admin', async (req, res) => {
  const hospitals = await Hospitals.find({});
  const doctors = await Doctors.find({});
  const patients = await Patients.find({});
  const hospitalsCurrentYearChartData = [];
  const doctorsCurrentYearChartData = [];
  const patientsCurrentYearChartData = [];
  for (const month of months) {
    const startDate = moment(`2022/${months.indexOf(month) + 1}`, 'YYYY/MM').startOf('month').format('x');
    const endDate = moment(`2022/${months.indexOf(month) + 1}`, 'YYYY/MM').endOf('month').format('x');

    const hospital = await Hospitals.find({
      createdAt: {
        $gte: startDate,
        $lte: endDate
      }
    });

    hospitalsCurrentYearChartData.push(hospital.length);

    const doctor = await Doctors.find({
      createdAt: {
        $gte: startDate,
        $lte: endDate
      }
    });

    doctorsCurrentYearChartData.push(doctor.length);

    const patient = await Patients.find({
      createdAt: {
        $gte: startDate,
        $lte: endDate
      }
    });

    patientsCurrentYearChartData.push(patient.length);
  }

  res.status(200).json({
    status: 'Success',
    hospitals: hospitals.length,
    doctors: doctors.length,
    patients: patients.length,
    chartData: {
      hospitals: hospitalsCurrentYearChartData,
      doctors: doctorsCurrentYearChartData,
      patients: patientsCurrentYearChartData
    }
  });
});

router.get('/admin', async (req, res) => {
  const doctors = await Doctors.find({});
  const patients = await Patients.find({
    email: {
      $ne: null
    }
  });
  const doctorsCurrentYearChartData = [];
  const patientsCurrentYearChartData = [];
  for (const month of months) {
    const startDate = moment(`2022/${months.indexOf(month) + 1}`, 'YYYY/MM').startOf('month').format('x');
    const endDate = moment(`2022/${months.indexOf(month) + 1}`, 'YYYY/MM').endOf('month').format('x');

    const doctor = await Doctors.find({
      createdAt: {
        $gte: startDate,
        $lte: endDate
      }
    });

    doctorsCurrentYearChartData.push(doctor.length);

    const query = { $and: [
      {
        email: {
          $ne: null
        }
      },
      {
        createdAt: {
          $gte: startDate,
          $lte: endDate
        }
      }
    ]}


    const patient = await Patients.find(query);

    patientsCurrentYearChartData.push(patient.length);
  }

  res.status(200).json({
    status: 'Success',
    doctors: doctors.length,
    patients: patients.length,
    chartData: {
      doctors: doctorsCurrentYearChartData,
      patients: patientsCurrentYearChartData
    }
  });
});



module.exports = router;
